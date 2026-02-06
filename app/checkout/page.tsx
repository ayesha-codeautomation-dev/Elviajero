"use client";
import React from "react";
import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/checkoutForm";
import CompletePage from "../components/completePage";
import { useAppDispatch, useAppSelector } from '../store/store';
import { updateBookingState } from '../store/store';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Pricing constants per product rules
const BOAT_PRICING = {
  1: 150,
  3: 350,
  6: 650,
};

const JET_SKI_RATE_PER_HOUR = 120; // for 1 hour or more

// Define water sport type and costs (unit notes below)
type WaterSport = "WaterSkiing" | "Paddleboarding" | "Snorkeling" | "Kayaking" | "Fishing" | "Wakeboarding";

// Costs remain numeric but unit for some sports is per DAY (see UI). Wakeboarding remains per hour.
const WATER_SPORT_COSTS: Record<WaterSport, number> = {
  Paddleboarding: 40,
  Snorkeling: 30,
  WaterSkiing: 70,
  Kayaking: 50,
  Fishing: 40,
  Wakeboarding: 70,
};

export default function App() {
  const dispatch = useAppDispatch();
  const [clientSecret, setClientSecret] = React.useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);

  // Access the booking state from Redux
  const bookingState = useAppSelector((state) => state.booking);

  // Generate a stable booking ID once
  const bookingId = React.useMemo(() => `booking-${Date.now()}`, []);

  useEffect(() => {
    // Store the generated bookingId in the Redux store
    dispatch(updateBookingState({ bookingId }));
  }, [dispatch, bookingId]);

  React.useEffect(() => {
    // Retrieve client secret from the URL to determine if the payment is confirmed
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    setConfirmed(!!clientSecret);
  }, []);

  React.useEffect(() => {
    if (!bookingState.totalCost) {
      console.error("Total cost is missing in bookingState");
      return;
    }

    // Send the total cost with the booking ID to the backend
    const paymentDetails = {
      bookingId,
      totalCost: bookingState.totalCost
    };

    console.log("Sending payment details:", paymentDetails);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentDetails),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Payment Intent Data:", data);
        setClientSecret(data.clientSecret);
        setDpmCheckerLink(data.dpmCheckerLink);
      })
      .catch((error) => {
        console.error("Error creating Payment Intent:", error);
      });
  }, [bookingId, bookingState.totalCost]);

  const appearance = {
    theme: "stripe" as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Complimentary amenities only for boat bookings with 6+ hours (full day)
  const hasComplimentaryAmenities = 
    (bookingState.rentalType === "Boat" || bookingState.rentalType === "Boat+Jet Ski") && 
    Number(bookingState.hourlyDuration) >= 6;

  // Helper function to get boat duration display
  const getBoatDurationDisplay = () => {
    if (!bookingState.pricingType) return "Not selected";
    
    if (bookingState.pricingType === "Hourly") {
      // Convert to number safely
      const hours = Number(bookingState.hourlyDuration) || 1;
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (bookingState.pricingType === "Half Day") {
      return "4 hours";
    } else if (bookingState.pricingType === "Full Day") {
      return "8 hours";
    }
    return "Not selected";
  };

  // Helper function to get jet ski duration display
  const getJetSkiDurationDisplay = () => {
    if (!bookingState.pricingType) return "Not selected";
    
    if (bookingState.pricingType === "Hourly") {
      // Convert to number safely - supports fractional hours (0.25, 0.5)
      const hours = Number(bookingState.hourlyDurationJetSki) || 1;
      if (hours === 0.25) return "15 minutes";
      if (hours === 0.5) return "30 minutes";
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (bookingState.pricingType === "Half Day") {
      return "4 hours";
    } else if (bookingState.pricingType === "Full Day") {
      return "8 hours";
    }
    return "Not selected";
  };

  // Calculate boat cost
  const calculateBoatCost = () => {
    if (bookingState.boatRentalCount === 0) return 0;
    // Pricing rules: 1h -> $150, 3h -> $350, 6h or more -> $650
    const hours = Number(bookingState.hourlyDuration) || 1;
    if (bookingState.pricingType === "Hourly") {
      if (hours <= 1) return bookingState.boatRentalCount * BOAT_PRICING[1];
      if (hours === 3) return bookingState.boatRentalCount * BOAT_PRICING[3];
      if (hours >= 6) return bookingState.boatRentalCount * BOAT_PRICING[6];
      // For in-between durations (2,4,5) charge the next available bracket (round up)
      if (hours > 1 && hours < 3) return bookingState.boatRentalCount * BOAT_PRICING[3];
      if (hours > 3 && hours < 6) return bookingState.boatRentalCount * BOAT_PRICING[6];
      return 0;
    } else if (bookingState.pricingType === "Half Day") {
      return bookingState.boatRentalCount * BOAT_PRICING[3];
    } else if (bookingState.pricingType === "Full Day") {
      return bookingState.boatRentalCount * BOAT_PRICING[6];
    }
    return 0;
  };

  // Calculate jet ski cost
  const calculateJetSkiCost = () => {
    if (bookingState.jetSkisCount === 0) return 0;
    // Jet ski pricing rules:
    // 0.25h (15m) -> $50, 0.5h (30m) -> $75, 1h or more -> $120 per hour
    const duration = Number(bookingState.hourlyDurationJetSki) || 1;
    if (bookingState.pricingType === "Hourly") {
      if (duration === 0.25) return bookingState.jetSkisCount * 50;
      if (duration === 0.5) return bookingState.jetSkisCount * 75;
      if (duration >= 1) return bookingState.jetSkisCount * JET_SKI_RATE_PER_HOUR * duration;
      return 0;
    } else if (bookingState.pricingType === "Half Day") {
      return bookingState.jetSkisCount * JET_SKI_RATE_PER_HOUR * 4;
    } else if (bookingState.pricingType === "Full Day") {
      return bookingState.jetSkisCount * JET_SKI_RATE_PER_HOUR * 8;
    }
    return 0;
  };

  // Safely get boat duration for display
  const getBoatDurationForDisplay = () => {
    const duration = Number(bookingState.hourlyDuration) || 1;
    return `${duration}h`;
  };

  // Safely get jet ski duration for display
  const getJetSkiDurationForDisplay = () => {
    const duration = Number(bookingState.hourlyDurationJetSki) || 1;
    return `${duration}h`;
  };

  return (
    <div className="max-w-[1440px] gap-8 flex flex-col md:flex-row mx-auto py-6 mt-12 md:py-10 px-6">
      {/* Left Column: Booking Summary */}
      <div className="md:w-2/3">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h1 className="text-2xl font-bold text-[#003b73] mb-6">Complete Your Payment</h1>
          
          <div className="mb-8">
            <img
              src="/checkout.jpg"
              alt="checkout"
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>

          {/* Booking Details Section with Hours */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#003b73] mb-4 pb-2 border-b">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Pickup Location:</span>
                  <span className="font-semibold">{bookingState.pickupName || "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Destination:</span>
                  <span className="font-semibold">{bookingState.destinationName || "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Rental Type:</span>
                  <span className="font-semibold">{bookingState.rentalType || "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Booking Date:</span>
                  <span className="font-semibold">{bookingState.bookingDate || "Not selected"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Pickup Time:</span>
                  <span className="font-semibold">{bookingState.pickupTime || "Not selected"}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Number of People:</span>
                  <span className="font-semibold">{bookingState.people}</span>
                </p>
                
                {/* Rental Option */}
                {bookingState.rentalOption && (
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-700">Rental Option:</span>
                    <span className="font-semibold">{bookingState.rentalOption}</span>
                  </p>
                )}
                
                {/* Boat Details with Hours */}
                {bookingState.boatRentalCount > 0 && (
                  <div className="space-y-1 border-l-2 border-blue-300 pl-3">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-700">Boat Rental:</span>
                      <span className="font-semibold">{bookingState.boatRentalCount}</span>
                    </p>
                    <p className="flex justify-between text-sm text-gray-600">
                      <span>Duration:</span>
                      <span>{getBoatDurationDisplay()}</span>
                    </p>
                    <p className="flex justify-between text-sm text-gray-600">
                      <span>Cost:</span>
                      <span className="font-semibold">${calculateBoatCost().toFixed(2)}</span>
                    </p>
                  </div>
                )}
                
                {/* Jet Ski Details with Hours */}
                {bookingState.jetSkisCount > 0 && (
                  <div className="space-y-1 border-l-2 border-green-300 pl-3">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-700">Jet Skis:</span>
                      <span className="font-semibold">{bookingState.jetSkisCount}</span>
                    </p>
                    <p className="flex justify-between text-sm text-gray-600">
                      <span>Duration:</span>
                      <span>{getJetSkiDurationDisplay()}</span>
                    </p>
                    <p className="flex justify-between text-sm text-gray-600">
                      <span>Cost:</span>
                      <span className="font-semibold">${calculateJetSkiCost().toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-gray-500 text-right">
                      $120/hour per jet ski (15m = $50, 30m = $75)
                    </p>
                  </div>
                )}
                
                {/* Waiting time is removed from cost calculations */}
                
              </div>
            </div>
              </div>
            </div>
            
            {/* Water Sports */}
            {bookingState.waterSport && bookingState.waterSport.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <p className="font-medium text-gray-700 mb-2">Water Sports:</p>
                <div className="flex flex-col gap-2">
                  {bookingState.waterSport.map((sport, index) => {
                    const participantCount = Math.min(bookingState.sportPeople?.[sport] || 1, 6);
                    const sportCost = WATER_SPORT_COSTS[sport as WaterSport] || 0;
                    const perDaySports = ["Paddleboarding", "Kayaking", "Snorkeling", "Fishing"];
                    const unit = perDaySports.includes(sport) ? "per day" : "per hour";
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                            {sport}
                          </span>
                          <span className="text-sm text-gray-600">
                            x{participantCount}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${(participantCount * sportCost).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{unit}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Duration Summary */}
            {(bookingState.boatRentalCount > 0 || bookingState.jetSkisCount > 0) && bookingState.pricingType === "Hourly" && (
              <div className="mt-6 pt-4 border-t">
                <p className="font-medium text-gray-700 mb-3">⏱️ Rental Durations:</p>
                <div className="flex flex-wrap gap-3">
                  {bookingState.boatRentalCount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[120px]">
                      <p className="text-sm font-medium text-blue-800">Boat</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {getBoatDurationForDisplay()}
                      </p>
                    </div>
                  )}
                  {bookingState.jetSkisCount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 min-w-[120px]">
                      <p className="text-sm font-medium text-green-800">Jet Skis</p>
                      <p className="text-2xl font-bold text-green-700">
                        {getJetSkiDurationForDisplay()}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Boat and jet ski durations can be different
                </p>
              </div>
            )}
          </div>

          {/* Important Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#003b73] mb-4 pb-2 border-b">Important Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Booking Policies</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>All bookings can be customized to your needs and to many other destinations as long as there is availability and all safety regulations are abided by at all times.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Jet skis to be returned by sunset. Boat will only navigate in waves up to 5ft, winds up to 20mph.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>We recommend island hopping jet ski tours to be taken with more than 1 jet ski.</span>
                  </li>
                </ul>
              </div>

              {hasComplimentaryAmenities && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Complimentary Amenities Included!</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Your full-day boat booking includes these complimentary items:
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Water, sodas, beer</li>
                    <li>• Floaties and snorkelling gear</li>
                    <li>• Fishing gear</li>
                    <li>• Underwater GoPro and drone photos/videos</li>
                  </ul>
                </div>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Capacity & Hours</h3>
                <ul className="text-sm text-yellow-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Boat has 10 passengers capacity, however, we&apos;ll only take up to 6 paying passengers.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Working hours: <strong>Mon-Thu 9AM-5PM, Fri-Sun 9AM-6PM</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Jet ski tours must be completed by sunset.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Payment Section */}
      <div className="md:w-1/3">
        <div className="sticky top-6 bg-white p-6 rounded-xl shadow-lg border">
          {/* Total Cost Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-green-700">${bookingState.totalCost.toFixed(2)}</p>
              </div>
              {hasComplimentaryAmenities && (
                <div className="bg-green-100 text-green-800 text-xs font-bold py-1 px-3 rounded-full">
                  🎁 INCLUDES EXTRAS
                </div>
              )}
            </div>
            {/* Waiting time removed from cost calculations */}
            
            {/* Cost Breakdown */}
            <div className="mt-3 pt-3 border-t border-green-200 text-xs text-gray-600 space-y-1">
              <p className="flex justify-between">
                <span>Boat Rental:</span>
                <span>${calculateBoatCost().toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>Jet Skis:</span>
                <span>${calculateJetSkiCost().toFixed(2)}</span>
              </p>
              {bookingState.waterSport && bookingState.waterSport.length > 0 && (
                <p className="flex justify-between">
                  <span>Water Sports:</span>
                  <span>${bookingState.waterSport.reduce((total, sport) => {
                    const participantCount = bookingState.sportPeople?.[sport] || 1;
                    const sportCost = WATER_SPORT_COSTS[sport as WaterSport] || 0;
                    return total + (participantCount * sportCost);
                  }, 0).toFixed(2)}</span>
                </p>
              )}
              <p className="flex justify-between text-gray-500 text-xs border-t border-green-100 mt-1 pt-1">
                <span>Subtotal:</span>
                <span>${(bookingState.totalCost / 1.115).toFixed(2)}</span>
              </p>
              <p className="flex justify-between font-semibold text-yellow-700">
                <span>Tax (11.5%):</span>
                <span>${(bookingState.totalCost - bookingState.totalCost / 1.115).toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            {clientSecret ? (
              <Elements options={options} stripe={stripePromise}>
                {confirmed ? <CompletePage /> : <CheckoutForm dpmCheckerLink={dpmCheckerLink} />}
              </Elements>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b73] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment gateway...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}