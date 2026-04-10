import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/lib/sanity";
import {
  TAX_RATE,
  WATER_SPORT_COSTS,
  calculateBoatPriceManual,
  calculateBoatJetSkiPackagePrice,
  calculateJetSkiPriceManual,
} from "@/app/constants/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      };
    };

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

    const durationHours = Number(hourlyDuration);
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
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

    const waterSportsCost = Array.isArray(waterSport)
      ? waterSport.reduce((total, sport) => {
          const sportConfig = WATER_SPORT_COSTS[sport];
          if (!sportConfig) return total;
          const peopleCount = Math.max(1, Number(sportPeople?.[sport] || 1));
          return total + sportConfig.cost * peopleCount;
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

    console.log("Total order amount:", amount);

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
