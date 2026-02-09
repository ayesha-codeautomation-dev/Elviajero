"use client";
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import { updateBookingState } from "../store/store";
import { sanityClient } from "@/sanity/lib/sanity";
import { v4 as uuidv4 } from 'uuid'; // You can install uuid to generate unique keys


const SuccessPage = () => {
  const bookingState = useAppSelector((state) => state.booking);
  const dispatch = useAppDispatch();

  // Sanity Update
  const handleSanityUpdate = async () => {
    console.log("handleSanityUpdate function triggered");

    try {
      // Log the booking state data being sent to Sanity
      console.log("Preparing to send booking data to Sanity:", bookingState);
      const selectedWaterSports = bookingState.waterSport.map((sport) => ({
        _key: uuidv4(),
        sport: sport,  // Wrap each selected sport in an object with a 'sport' field
      }));
      const sanityPayload = {
        _type: "booking",
        bookingId: bookingState.bookingId,
        date: bookingState.bookingDate,
        timeSlot: bookingState.pickupTime,
        boatCount: bookingState.boatRentalCount,
        jetSkiCount: bookingState.jetSkisCount,
        waterSports: selectedWaterSports,
        rentalType: bookingState.pricingType,
        numberofHours: bookingState.hourlyDuration || 0,
        pickup: bookingState.pickupName, // Removed duplicate
        destination: bookingState.destinationName, // Removed duplicate
        people: bookingState.people,
        totalPrice: parseFloat(bookingState.totalCost.toFixed(2)), // Ensure totalPrice is a number
      };

      // Log the payload being sent to Sanity
      console.log("Sanity Payload:", sanityPayload);

      const response = await sanityClient.create(sanityPayload);

      // Log the response from Sanity
      console.log("Sanity response:", response);

      console.log("Booking successfully sent to Sanity.");
    } catch (error) {
      console.error("Error sending booking to Sanity:", error);
      if (error instanceof Error) {
        console.error("Sanity error details:", error.message);
      }
      throw new Error("Sanity update failed");
    }
  };

  useEffect(() => {
    // Restore booking state from localStorage if Redux state is empty
    if (!bookingState.email) {
      const storedState = localStorage.getItem("bookingState");
      if (storedState) {
        dispatch(updateBookingState(JSON.parse(storedState)));
      }
    }
  }, [bookingState, dispatch]);

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentIntent = params.get("payment_intent");

      if (paymentIntent && bookingState.email) {
        const payload = {
          paymentIntent,
          bookingDetails: bookingState,
        };

        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            await handleSanityUpdate(); // Ensure Sanity update happens after email is sent
            console.log("Booking confirmation email sent successfully!");
          } else {
            const errorData = await response.json();
            console.log(`Error: ${errorData.error || "Failed to send confirmation email."}`);
          }
        } catch (error) {
          console.error("Email sending error:", error);
          console.log("An error occurred while sending the email.");
        }
      } else {
        console.log("Booking details or payment information is missing.");
      }
    };

    sendConfirmationEmail();
  }, [bookingState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <div className="max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center">
          <img src="/succes.png" alt="payment successful" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mt-6">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mt-4">
          Thank you for booking with us! Your payment has been successfully processed, and we’re excited to welcome you onboard.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 px-6 py-2"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
