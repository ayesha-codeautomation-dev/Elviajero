"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/store";
import { updateBookingState } from "../store/store";

// Define the booking state type matching your Redux store
interface BookingState {
  pickupName: string;
  destinationName: string;
  distance: number;
  pricingType: string;
  hourlyDuration: string;
  totalCost: number;
  bookingDate: string;
  pickupTime: string;
  people: number;
  waterSport: string[];
  boatRentalCount: number;
  jetSkisCount: number;
  email: string;
  bookingId: string;
  rentalType?: string;
  rentalOption: string;
  hourlyDurationJetSki: number;
  sportPeople: Record<string, number>;
}

// Type for partial booking state (used for updates)
type PartialBookingState = Partial<BookingState>;

const SuccessPage = () => {
  const reduxBookingState = useAppSelector((state) => state.booking);
  const dispatch = useAppDispatch();

  // Local state to hold merged booking data
  const [bookingState, setBookingState] = useState<BookingState>({
    pickupName: "",
    destinationName: "",
    distance: 0,
    pricingType: "",
    hourlyDuration: "",
    totalCost: 0,
    bookingDate: "",
    pickupTime: "",
    people: 1,
    waterSport: [],
    boatRentalCount: 0,
    jetSkisCount: 0,
    email: "",
    bookingId: "",
    rentalType: "",
    rentalOption: "",
    hourlyDurationJetSki: 0,
    sportPeople: {},
  });
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Function to get booking data from multiple sources
  const getBookingData = (): BookingState => {
    console.log("Getting booking data from all sources...");

    let mergedData: BookingState = { ...reduxBookingState };

    // 1. Check localStorage for saved state (if Redux was lost)
    const savedState = localStorage.getItem("bookingState");
    if (savedState) {
      try {
        const parsedState: PartialBookingState = JSON.parse(savedState);
        console.log("Found data in localStorage:", parsedState);

        // Merge localStorage data with Redux data
        mergedData = { ...mergedData, ...parsedState };

        // Update Redux with merged data
        dispatch(updateBookingState(parsedState));
      } catch (e) {
        console.error("Error parsing localStorage state:", e);
      }
    }

    // 2. Check for email separately in localStorage
    const savedEmail = localStorage.getItem("bookingEmail");
    if (savedEmail && !mergedData.email) {
      console.log("Found email in localStorage:", savedEmail);
      mergedData.email = savedEmail;
      dispatch(updateBookingState({ email: savedEmail }));
    }

    console.log("Merged booking data:", mergedData);
    return mergedData;
  };

  // Format date for display
  const formatBookingDate = (dateString: string) => {
    if (!dateString || dateString === "Not specified") return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  // Get duration display
  const getDurationDisplay = (duration: string | number) => {
    if (!duration) return "Not selected";
    const numDuration = Number(duration);
    if (numDuration === 0.25) return "15 minutes";
    if (numDuration === 0.5) return "30 minutes";
    if (numDuration === 1) return "1 hour";
    return `${numDuration} hours`;
  };

  // Send confirmation email
  const sendConfirmationEmail = async () => {
    try {
      const currentBookingState = getBookingData();

      console.log("Sending email with booking state:", currentBookingState);

      const customerEmail = currentBookingState.email ||
        localStorage.getItem("bookingEmail") ||
        "";

      if (!customerEmail) {
        console.warn("No email found, but continuing with email attempt...");
      }

      // Get payment intent from URL
      const params = new URLSearchParams(window.location.search);
      const paymentIntentId = params.get("payment_intent");

      console.log("Payment Intent ID from URL:", paymentIntentId);

      // Prepare email payload with EXACT field names from Redux
      const payload = {
        paymentIntent: {
          id: paymentIntentId || `manual-${Date.now()}`,
          amount: (currentBookingState.totalCost || 0) * 100,
          currency: "usd",
        },
        bookingDetails: {
          // Booking Info
          bookingId: currentBookingState.bookingId || `booking-${Date.now()}`,
          email: customerEmail,

          // Location Details (EXACT Redux field names)
          pickupName: currentBookingState.pickupName || "Not specified",
          destinationName: currentBookingState.destinationName || "Various locations",

          // Date & Time
          bookingDate: currentBookingState.bookingDate
            ? formatBookingDate(currentBookingState.bookingDate)
            : "Not specified",
          pickupTime: currentBookingState.pickupTime || "Not specified",

          // Rental Details (EXACT Redux field names)
          rentalType: currentBookingState.rentalType || "Boat Rental",
          people: currentBookingState.people || 1,
          hourlyDuration: currentBookingState.hourlyDuration || "1",
          hourlyDurationJetSki: currentBookingState.hourlyDurationJetSki || Number(currentBookingState.hourlyDuration || "1"),

          // Equipment Counts (EXACT Redux field names)
          jetSkisCount: currentBookingState.jetSkisCount || 0,
          boatRentalCount: currentBookingState.boatRentalCount || 0,

          // Water Sports (EXACT Redux field names)
          waterSport: currentBookingState.waterSport || [],
          sportPeople: currentBookingState.sportPeople || {},

          // Pricing
          totalCost: currentBookingState.totalCost || 0,

          // Additional fields your email template expects (with defaults)
          distance: 0, // Not in Redux, but email template expects it
          waitingTime: 0, // Not in Redux, but email template expects it
          pricingType: currentBookingState.rentalType || "Hourly", // Use rentalType
          rentalOption: currentBookingState.rentalType || "N/A", // Use rentalType
        },
      };

      console.log("Final email payload:", payload);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send confirmation email");
      }

      console.log("Email sent successfully:", data);
      setEmailSent(true);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  // Main effect to load data and process
  useEffect(() => {
    const processSuccess = async () => {
      try {
        setIsProcessing(true);

        // 1. Get booking data from all sources
        const data = getBookingData();
        setBookingState(data);

        console.log("Loaded booking data for display:", data);

        if (!data.bookingId) {
          console.warn("No booking ID found, generating one...");
          const newBookingId = `booking-${Date.now()}`;
          setBookingState((prev: BookingState) => ({ ...prev, bookingId: newBookingId }));
          dispatch(updateBookingState({ bookingId: newBookingId }));
        }

        // 2. Wait a moment to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Try to send confirmation email
        try {
          await sendConfirmationEmail();
        } catch (emailError) {
          console.warn("Email sending failed, but payment was successful:", emailError);
          // Don't fail the whole process if email fails
          setError("Payment successful! However, we couldn't send the confirmation email. Please check your email inbox or contact us.");
        }

        // 4. Clear localStorage after successful processing
        // localStorage.removeItem("bookingState");
        // localStorage.removeItem("bookingEmail");

        console.log("Success processing complete");

      } catch (error) {
        console.error("Error in success processing:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsProcessing(false);
      }
    };

    processSuccess();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#003b73] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Booking</h2>
          <p className="text-gray-600">Finalizing your confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">{error}</p>

          {/* Show booking details even if email failed */}
          {(bookingState.bookingId || bookingState.totalCost) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-bold text-blue-800 mb-2">Your Booking Details:</h3>
              <p className="text-sm"><strong>Booking ID:</strong> {bookingState.bookingId || "Unknown"}</p>
              <p className="text-sm"><strong>Date:</strong> {bookingState.bookingDate || "Not specified"}</p>
              <p className="text-sm"><strong>Time:</strong> {bookingState.pickupTime || "Not specified"}</p>
              <p className="text-sm"><strong>Total:</strong> {formatPrice(bookingState.totalCost || 0)}</p>
              <p className="mt-2 text-sm text-gray-600">Please save this information for your records.</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-6 py-3 bg-[#003b73] text-white rounded-lg hover:bg-[#005a8e] transition"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.print()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Print Booking Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6 py-10">
      <div className="max-w-md bg-white shadow-xl rounded-2xl p-8 mt-10 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed! 🎉</h1>

        {emailSent ? (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✅ Confirmation email sent!
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 font-medium">
              ⚠️ Payment successful! Check your email for confirmation.
            </p>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          Thank you for booking with <span className="font-bold text-[#003b73]">EL VIAJERO</span>!
        </p>

        {/* Booking Summary - Show ALL relevant data */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-[#003b73] mb-3">Booking Summary</h3>
          <div className="text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono font-bold">{bookingState.bookingId || "Unknown"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {bookingState.bookingDate ? formatBookingDate(bookingState.bookingDate) : "Not specified"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{bookingState.pickupTime || "Not specified"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Pickup:</span>
              <span className="font-medium">{bookingState.pickupName || "Not specified"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-medium">{bookingState.destinationName || "Various locations"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{getDurationDisplay(bookingState.hourlyDuration)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Rental Type:</span>
              <span className="font-medium">{bookingState.rentalType || "Boat Rental"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">People:</span>
              <span className="font-medium">{bookingState.people || 1}</span>
            </div>

            {(bookingState.jetSkisCount || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Jet Skis:</span>
                <span className="font-medium">{bookingState.jetSkisCount}</span>
              </div>
            )}

            {(bookingState.boatRentalCount || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Boats:</span>
                <span className="font-medium">{bookingState.boatRentalCount}</span>
              </div>
            )}

            {bookingState.waterSport && bookingState.waterSport.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Water Sports:</span>
                <span className="font-medium">{bookingState.waterSport.join(", ")}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600 font-bold">Total:</span>
              <span className="font-bold text-emerald-600">
                {formatPrice(bookingState.totalCost || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-6 py-3 bg-[#003b73] text-white rounded-lg hover:bg-[#005a8e] transition"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.print()}
            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
          >
            Print Confirmation
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a href="mailto:eduard@elviajeropr.com" className="text-[#003b73] font-medium hover:underline">
              eduard@elviajeropr.com
            </a>
            <span className="block mt-1">or call +1 787 988-9321</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Please bring your booking confirmation on the day of your adventure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;