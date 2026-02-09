"use client";
import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { updateBookingState } from '../store/store';
import { useAppDispatch, useAppSelector } from "../store/store";

type CheckoutFormProps = {
  dpmCheckerLink: string;
};

export default function CheckoutForm({ dpmCheckerLink }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bookingState = useAppSelector((state) => state.booking);
  
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>(bookingState.email || "");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Save email to multiple places for redundancy
  const saveEmail = (email: string) => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    setEmailError(null);
    
    // 1. Save to Redux
    dispatch(updateBookingState({ email }));
    
    // 2. Save to localStorage as backup
    localStorage.setItem("bookingEmail", email);
    
    // 3. Save current booking state with email to localStorage
    const currentState = { ...bookingState, email };
    localStorage.setItem("bookingState", JSON.stringify(currentState));
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Save email before proceeding
    if (!saveEmail(email)) {
      setIsLoading(false);
      return;
    }

    console.log("Processing payment with email:", email);

    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: email, // THIS IS CRITICAL - Stripe will send receipt
        },
      });

      if (result.error) {
        // Handle error
        setMessage(result.error.message || "An unexpected error occurred.");
        console.error("Stripe error:", result.error);
      } else {
        // Payment is processing or succeeded
        console.log("Payment successful, result:", result);
        
        // Don't redirect here - Stripe will handle the redirect via return_url
        // The success page will load automatically
        setMessage("Payment successful! Redirecting...");
        
        // Optional: Add a small delay then redirect manually as backup
        setTimeout(() => {
          router.push("/success");
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: "accordion" as const,
  };

  return (
    <div className="space-y-6">
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={() => saveEmail(email)}
            required
            placeholder="your@email.com"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition ${
              emailError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {emailError && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
          <p className="text-xs text-gray-500">
            Your booking confirmation will be sent to this email
          </p>
        </div>

        {/* Stripe Payment Element */}
        <div className="border border-gray-300 rounded-lg p-4">
          <PaymentElement id="payment-element" options={paymentElementOptions} />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full py-3 px-4 bg-[#003b73] text-white rounded-lg hover:bg-[#005a8e] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${(bookingState.totalCost || 0).toFixed(2)}`
          )}
        </button>

        {/* Payment Message */}
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.includes("success") || message.includes("redirecting") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* DPM Checker Link */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p>
          Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
          <a
            href={dpmCheckerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#003b73] hover:underline font-medium"
          >
            Preview payment methods by transaction
          </a>
        </p>
      </div>
    </div>
  );
}