// app/api/payment-intent/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    // Create a PaymentIntent with the amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'], // You can change this as per your needs
    });

    // Respond with the client secret of the payment intent
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // Correctly check for Stripe errors
    if (error instanceof Error) {
      console.error('Error creating payment intent:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
  }
}
