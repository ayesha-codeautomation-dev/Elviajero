"use client";
import React from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation"; // To programmatically redirect
import { updateBookingState } from '../store/store';
import { useAppDispatch } from "../store/store"; // Adjust the path

type CheckoutFormProps = {
  dpmCheckerLink: string;
};

export default function CheckoutForm({ dpmCheckerLink }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter(); // Get the Next.js router for redirection
  const dispatch = useAppDispatch();
  const [message, setMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    // Dispatch the email to Redux
    dispatch(updateBookingState({ email }));
    // Confirm the payment with Stripe
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "https://www.elviajeropr.com/success", // Redirect URL after payment
      },
    });

    if (result.error) {
      // Handle error (show message to the user)
      setMessage(result.error.message || "An unexpected error occurred.");
    } else {
      // Payment successful, Stripe will handle redirection to /success
      setMessage("Payment processed, redirecting...");

      // Redirect to home page where we will send the email
      router.push("/success");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "accordion" as const, // Valid layout option
  };

  return (
    <>
      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="my-4">
          <label className="mb-3" htmlFor="email">Enter Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-2 text-black"
          />
        </div>

        <PaymentElement id="payment-element" options={paymentElementOptions} />
        <button className="my-4 flex justify-center items-center" disabled={isLoading || !stripe || !elements} id="submit">
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
        {message && <div id="payment-message">{message}</div>}
      </form>
      <div id="dpm-annotation">
        <p>
          Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
          <a
            href={dpmCheckerLink}
            target="_blank"
            rel="noopener noreferrer"
            id="dpm-integration-checker"
          >
            Preview payment methods by transaction
          </a>
        </p>
      </div>
    </>
  );
}
