import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const body: { bookingId: string; totalCost: number } = await req.json();
    const { bookingId, totalCost } = body;

    if (!bookingId || typeof bookingId !== "string" || typeof totalCost !== "number" || totalCost <= 0) {
      return NextResponse.json(
        { error: "Invalid request payload: bookingId and totalCost must be valid" },
        { status: 400 }
      );
    }

    // Convert totalCost to cents (Stripe works in the smallest currency unit)
    const amount = Math.round(totalCost * 100);  // Convert to cents

    console.log("Total order amount:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",  // Change to your desired currency
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId },  // Save the booking ID in metadata
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
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
