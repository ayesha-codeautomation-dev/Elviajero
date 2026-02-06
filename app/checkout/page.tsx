"use client";
import React from "react";
import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/checkoutForm";
import CompletePage from "../components/completePage";
import { useAppDispatch, useAppSelector } from '../store/store';
import { updateBookingState } from '../store/store';
import { 
  WATER_SPORT_COSTS, 
  TAX_RATE,
  COMPLIMENTARY_AMENITIES,
  BOOKING_POLICIES,
  formatDateForDisplay 
} from '@/app/constants/pricing';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function App() {
  const dispatch = useAppDispatch();
  const [clientSecret, setClientSecret] = React.useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Access the booking state from Redux
  const bookingState = useAppSelector((state) => state.booking);

  // Generate a stable booking ID once
  const bookingId = React.useMemo(() => `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

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
    if (!bookingState.totalCost || bookingState.totalCost <= 0) {
      console.error("Total cost is missing or invalid in bookingState");
      setLoading(false);
      return;
    }

    // Send the total cost with the booking ID to the backend
    const paymentDetails = {
      bookingId,
      totalCost: bookingState.totalCost,
      bookingDetails: {
        rentalType: bookingState.rentalType,
        pickup: bookingState.pickupName,
        destination: bookingState.destinationName,
        duration: bookingState.hourlyDuration,
        numPeople: bookingState.people,
        bookingDate: bookingState.bookingDate,
        pickupTime: bookingState.pickupTime
      }
    };

    console.log("Sending payment details:", paymentDetails);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentDetails),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Payment Intent Data:", data);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
        if (data.dpmCheckerLink) {
          setDpmCheckerLink(data.dpmCheckerLink);
        }
      })
      .catch((error) => {
        console.error("Error creating Payment Intent:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bookingId, bookingState.totalCost]);

  const appearance = {
    theme: "stripe" as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Complimentary amenities for bookings over $650
  const hasComplimentaryAmenities = bookingState.totalCost > 650;

  // Calculate subtotal (total - tax)
  const calculateSubtotal = () => {
    return bookingState.totalCost / (1 + TAX_RATE);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Get duration display
  const getDurationDisplay = () => {
    if (!bookingState.hourlyDuration) return "Not selected";
    
    const duration = Number(bookingState.hourlyDuration);
    if (duration === 0.25) return "15 minutes";
    if (duration === 0.5) return "30 minutes";
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  // Calculate water sports total
  const calculateWaterSportsTotal = () => {
    if (!bookingState.waterSport || !Array.isArray(bookingState.waterSport)) return 0;
    
    return bookingState.waterSport.reduce((total, sport) => {
      const participantCount = bookingState.sportPeople?.[sport] || 1;
      const sportInfo = WATER_SPORT_COSTS[sport];
      const sportCost = sportInfo?.cost ?? 0;
      return total + (participantCount * sportCost);
    }, 0);
  };

  // Format date for display
  const formatBookingDate = () => {
    if (!bookingState.bookingDate) return "Not selected";
    return formatDateForDisplay(bookingState.bookingDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#003b73] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#003b73] mb-3">
            Complete Your Booking
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Review your adventure details and complete payment to secure your booking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Booking Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {/* Booking Overview */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Booking Overview</h2>
                    <p className="text-gray-600 mt-1">Review your adventure details</p>
                  </div>
                  <div className="mt-4 sm:mt-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-xl shadow-lg">
                    {formatPrice(bookingState.totalCost)}
                  </div>
                </div>

                {/* Hero Image */}
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img
                    src="/checkout.jpg"
                    alt="Caribbean Adventure"
                    className="w-full h-64 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Trip Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Rental Type:</span>
                          <span className="font-semibold text-gray-900">{bookingState.rentalType || "Not selected"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Pickup:</span>
                          <span className="font-semibold text-gray-900">{bookingState.pickupName || "Not selected"}</span>
                        </div>
                        {bookingState.destinationName && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Destination:</span>
                            <span className="font-semibold text-gray-900">{bookingState.destinationName}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Duration:</span>
                          <span className="font-semibold text-gray-900">{getDurationDisplay()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Schedule & People</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Date:</span>
                          <span className="font-semibold text-gray-900">{formatBookingDate()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Pickup Time:</span>
                          <span className="font-semibold text-gray-900">{bookingState.pickupTime || "Not selected"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">Number of People:</span>
                          <span className="font-semibold text-gray-900">{bookingState.people}</span>
                        </div>
                        {(bookingState.rentalType === "Jet Ski" || bookingState.rentalType === "Boat+Jet Ski") && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Jet Skis:</span>
                            <span className="font-semibold text-gray-900">{bookingState.jetSkisCount || 1}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Water Sports Section */}
                {bookingState.waterSport && bookingState.waterSport.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Water Sports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookingState.waterSport.map((sport, index) => {
                        const participantCount = bookingState.sportPeople?.[sport] || 1;
                        const sportInfo = WATER_SPORT_COSTS[sport];
                        const sportCost = sportInfo?.cost ?? 0;
                        const total = participantCount * sportCost;
                        
                        return (
                          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{sport}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {participantCount} person{participantCount > 1 ? 's' : ''} • {sportInfo?.unit || 'per day'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{formatPrice(total)}</div>
                                <div className="text-xs text-gray-500">{formatPrice(sportCost)} each</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Important Information Section */}
                <div className="space-y-6">
                  {/* Booking Policies */}
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Booking Policies
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      {BOOKING_POLICIES.map((policy, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 mt-1 flex-shrink-0">•</span>
                          <span>{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Complimentary Amenities */}
                  {hasComplimentaryAmenities && (
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center mb-3">
                        <svg className="h-5 w-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-semibold text-emerald-800">🎉 Complimentary Amenities Included!</h3>
                      </div>
                      <p className="text-sm text-emerald-700 mb-3">
                        Your booking qualifies for our premium package:
                      </p>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        {COMPLIMENTARY_AMENITIES.map((amenity, i) => (
                          <li key={i} className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Capacity & Hours */}
                  <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Capacity & Hours
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2 mt-1 flex-shrink-0">•</span>
                        <span>Boat has 10 passengers capacity, however, we&apos;ll only take up to 6 paying passengers.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1 flex-shrink-0">•</span>
                        <span><strong>Working hours:</strong> Mon-Thu 9AM-5PM, Fri-Sun 9AM-6PM</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-1 flex-shrink-0">•</span>
                        <span>Jet ski tours must be completed by sunset.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#003b73] to-[#005a8e] text-white p-6">
                <h3 className="text-xl font-bold">Payment Details</h3>
                <p className="text-blue-100 text-sm mt-1">Complete your payment securely</p>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-6 space-y-6">
                {/* Total Display */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Total Amount</p>
                      <p className="text-3xl font-bold text-emerald-700">{formatPrice(bookingState.totalCost)}</p>
                    </div>
                    {hasComplimentaryAmenities && (
                      <div className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 px-3 rounded-full whitespace-nowrap">
                        🎁 INCLUDES EXTRAS
                      </div>
                    )}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tax (11.5%):</span>
                      <span className="font-medium text-gray-900">{formatPrice(bookingState.totalCost - calculateSubtotal())}</span>
                    </div>
                    {calculateWaterSportsTotal() > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Water Sports:</span>
                        <span className="font-medium text-gray-900">{formatPrice(calculateWaterSportsTotal())}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking ID */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Booking Reference</p>
                      <p className="text-sm font-mono text-gray-900 mt-1">{bookingId}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(bookingId)}
                      className="text-[#003b73] hover:text-[#005a8e]"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                      {confirmed ? <CompletePage /> : <CheckoutForm dpmCheckerLink={dpmCheckerLink} />}
                    </Elements>
                  ) : bookingState.totalCost > 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b73] mx-auto mb-4"></div>
                      <p className="text-gray-600 mb-2">Setting up secure payment...</p>
                      <p className="text-sm text-gray-500">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <svg className="h-12 w-12 text-red-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700 font-medium mb-2">Invalid booking total</p>
                        <p className="text-red-600 text-sm">Please go back and complete your booking</p>
                        <button
                          onClick={() => window.history.back()}
                          className="mt-4 px-4 py-2 bg-[#003b73] text-white rounded-lg hover:bg-[#005a8e] transition"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security & Support */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>SSL Encrypted</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Need help? Call us at{" "}
                      <a href="tel:+15551234567" className="text-[#003b73] hover:underline">
                        +1 (555) 123-4567
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Support Card */}
            <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Need Assistance?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Our customer support team is available 24/7 to help with your booking.
              </p>
              <div className="space-y-3">
                <a 
                  href="mailto:support@caribbeanadventures.com"
                  className="flex items-center text-sm text-[#003b73] hover:text-[#005a8e] transition"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  support@caribbeanadventures.com
                </a>
                <a 
                  href="tel:+15551234567"
                  className="flex items-center text-sm text-[#003b73] hover:text-[#005a8e] transition"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}