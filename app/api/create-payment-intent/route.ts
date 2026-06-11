import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/lib/sanity";
import {
  LOCATIONS,
  TAX_RATE,
  WATER_SPORT_COSTS,
  calculateBoatPriceManual,
  calculateBoatJetSkiPackagePrice,
  calculateJetSkiPriceManual,
  getMinimumDuration,
  isJetSkiDurationAvailable,
} from "@/app/constants/pricing";

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await req.json();
    
    // CRITICAL: Strip out any client-calculated totalCost to prevent tampering
    const { bookingId, bookingDetails, discountCode } = body as {
      bookingId?: string;
      discountCode?: string;
      bookingDetails?: {
        rentalType?: string;
        pickupName?: string;
        destinationName?: string;
        hourlyDuration?: string;
        waterSport?: string[];
        sportPeople?: Record<string, number>;
        jetSkisCount?: number;
        totalCost?: number;
      };
    };
    
    if (bookingDetails?.totalCost) {
      console.warn("WARNING: Client sent totalCost in payload. This is ignored. Using server calculation only.");
    }

    if (!bookingId || typeof bookingId !== "string" || !bookingDetails) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const {
      rentalType = "",
      pickupName = "",
      destinationName = "",
      hourlyDuration = "1",
      waterSport = [],
      sportPeople = {},
      jetSkisCount = 0,
    } = bookingDetails;

    const allowedRentalTypes = ["Boat", "Jet Ski", "Boat+Jet Ski"];
    const allowedPickupLocations = LOCATIONS.PICKUPS;
    const allowedBoatDestinations = LOCATIONS.BOAT_DESTINATIONS;
    const allowedWaterSports = Object.keys(WATER_SPORT_COSTS);

    const durationHours = Number(hourlyDuration);
    const skis = Math.max(0, Math.floor(Number(jetSkisCount || 0)));

    if (!allowedRentalTypes.includes(rentalType)) {
      return NextResponse.json({ error: "Invalid rental type" }, { status: 400 });
    }

    if (!allowedPickupLocations.includes(pickupName)) {
      return NextResponse.json({ error: "Invalid pickup location" }, { status: 400 });
    }

    if ((rentalType === "Boat" || rentalType === "Boat+Jet Ski") && !allowedBoatDestinations.includes(destinationName)) {
      return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
    }

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
      if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 9) {
        return NextResponse.json({ error: "Invalid boat duration" }, { status: 400 });
      }
      const minDuration = getMinimumDuration(pickupName, destinationName);
      if (durationHours < minDuration) {
        return NextResponse.json(
          { error: `Minimum duration for ${pickupName} to ${destinationName} is ${minDuration} hours` },
          { status: 400 }
        );
      }
    }

    if (rentalType === "Jet Ski") {
      const durationMinutes = durationHours * 60;
      if (durationMinutes < 15 || durationHours > 9) {
        return NextResponse.json({ error: "Invalid jet ski duration" }, { status: 400 });
      }
      if (!isJetSkiDurationAvailable(pickupName, durationMinutes)) {
        return NextResponse.json({ error: "Selected jet ski duration is unavailable for this pickup location" }, { status: 400 });
      }
    }

    if (skis > 3) {
      return NextResponse.json({ error: "Maximum 3 jet skis per booking" }, { status: 400 });
    }

    if (!Array.isArray(waterSport)) {
      return NextResponse.json({ error: "Invalid water sport selection" }, { status: 400 });
    }

    const invalidSport = waterSport.find((sport) => !allowedWaterSports.includes(sport));
    if (invalidSport) {
      return NextResponse.json({ error: `Invalid water sport: ${invalidSport}` }, { status: 400 });
    }

    // CRITICAL: Validate water sport people counts
    const invalidSportPeopleCount = waterSport.some((sport) => {
      const count = Number(sportPeople?.[sport] || 1);
      return count < 1 || count > 6 || !Number.isInteger(count);
    });
    if (invalidSportPeopleCount) {
      return NextResponse.json({ error: "Invalid water sport people count (must be 1-6 per sport)" }, { status: 400 });
    }

    let baseRentalCost = 0;
    if (rentalType === "Boat") {
      baseRentalCost = calculateBoatPriceManual(durationHours);
    } else if (rentalType === "Jet Ski") {
      baseRentalCost = calculateJetSkiPriceManual(
        Math.max(1, Number(jetSkisCount || 1)),
        durationHours,
        pickupName
      );
    } else if (rentalType === "Boat+Jet Ski") {
      const skis = Math.max(1, Number(jetSkisCount || 1));
      const packagePrice = calculateBoatJetSkiPackagePrice(
        pickupName,
        destinationName,
        durationHours,
        skis
      );
      baseRentalCost =
        packagePrice > 0
          ? packagePrice
          : calculateBoatPriceManual(durationHours) +
            calculateJetSkiPriceManual(skis, durationHours, pickupName);
    } else {
      return NextResponse.json({ error: "Invalid rental type" }, { status: 400 });
    }

    // CRITICAL: Recalculate water sports cost from server data only
    const waterSportsCost = Array.isArray(waterSport)
      ? waterSport.reduce((total, sport) => {
          const sportConfig = WATER_SPORT_COSTS[sport];
          if (!sportConfig) return total;
          
          let peopleCount = Number(sportPeople?.[sport] || 1);
          if (!Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 6) {
            peopleCount = 1;
          }
          
          const sportCost = sportConfig.cost * peopleCount;
          return total + sportCost;
        }, 0)
      : 0;

    const subtotal = baseRentalCost + waterSportsCost;
    const tax = subtotal * TAX_RATE;
    let totalBeforeDiscount = subtotal + tax;

    // Discount is validated and applied on the server only.
    if (typeof discountCode === "string" && discountCode.trim()) {
      const discountQuery = groq`
        *[_type == "discount" && code == $code][0] {
          discountPercentage,
          validFrom,
          validUntil,
          maxUsage,
          usageCount,
          active
        }
      `;
      const discount = await sanityClient.fetch(discountQuery, {
        code: discountCode.trim(),
      });
      if (discount) {
        const now = new Date();
        const active = Boolean(discount.active);
        const started = !discount.validFrom || new Date(discount.validFrom) <= now;
        const notExpired = !discount.validUntil || new Date(discount.validUntil) >= now;
        const underLimit =
          typeof discount.maxUsage !== "number" ||
          Number(discount.usageCount || 0) < discount.maxUsage;

        if (active && started && notExpired && underLimit) {
          const pct = Number(discount.discountPercentage || 0);
          if (pct > 0) {
            totalBeforeDiscount = totalBeforeDiscount * (1 - pct / 100);
          }
        }
      }
    }

    const totalCost = Math.max(0, Number(totalBeforeDiscount.toFixed(2)));
    const amount = Math.round(totalCost * 100);
    if (amount <= 0) {
      return NextResponse.json({ error: "Calculated amount is invalid" }, { status: 400 });
    }

    // CRITICAL: Log pricing breakdown for audit trail
    console.log("=== PAYMENT INTENT CALCULATION ===" );
    console.log(`Rental Type: ${rentalType} | Pickup: ${pickupName} | Destination: ${destinationName}`);
    console.log(`Duration: ${durationHours}h | Jet Skis: ${skis} | Water Sports: ${waterSport.length > 0 ? waterSport.join(", ") : "None"}`);
    console.log(`Base Rental: $${baseRentalCost} | Water Sports: $${waterSportsCost}`);
    console.log(`Subtotal: $${subtotal.toFixed(2)} | Tax (${(TAX_RATE * 100).toFixed(1)}%): $${tax.toFixed(2)} | Discount: ${discountCode ? "Applied" : "None"}`);
    console.log(`FINAL TOTAL: $${totalCost} (${amount} cents for Stripe)`);
    console.log("====================================" );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      trustedTotalCost: totalCost,
      trustedSubtotal: Number(subtotal.toFixed(2)),
      trustedTax: Number(tax.toFixed(2)),
      dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating PaymentIntent:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
