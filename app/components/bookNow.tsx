"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../store/store";
import { updateBookingState } from '../store/store';
import BoatRampsMap from "./BoatRampsMap";
import { sanityClient } from "@/sanity/lib/sanity";
import axios from "axios";
import {
  LOCATIONS,
  JET_SKI_AVAILABILITY,
  BOAT_AVAILABILITY,
  BOAT_HOURLY_RATES,
  JET_SKI_WATER_SPORTS,
  BOAT_WATER_SPORTS,
  WATER_SPORT_COSTS,
  TAX_RATE,
  CAPACITY,
  COMPLIMENTARY_AMENITIES_THRESHOLD,
  COMPLIMENTARY_AMENITIES,
  BOOKING_POLICIES,
  getDayType,
  getAvailableDurations,
  calculateJetSkiPrice,
  calculateBoatPrice,
  calculateWaterSportPrice,
  canSelectTime,
  formatMonthShort,
  formatDateForDisplay,
} from "@/app/constants/pricing";

type RentalType = "Jet Ski" | "Boat" | "Boat+Jet Ski";

interface BookingData {
  rentalType: RentalType;
  pickup: string;
  destination: string;
  durationHours: number;
  numJetSkis: number;
  waterSports: Record<string, number>;
  bookingDate: string;
  pickupTime: string;
  numPeople: number;
}

const BookNow = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Rental type selection
  const [rentalType, setRentalType] = useState<RentalType>("Boat");

  // Form state
  const [pickup, setPickup] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [durationHours, setDurationHours] = useState<number>(1);
  const [numJetSkis, setNumJetSkis] = useState<number>(1);
  const [selectedWaterSports, setSelectedWaterSports] = useState<Record<string, number>>({});
  const [bookingDate, setBookingDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [numPeople, setNumPeople] = useState<number>(1);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [maintenanceDates, setMaintenanceDates] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [isPuertoRico, setIsPuertoRico] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch maintenance dates
  useEffect(() => {
    const fetchMaintenanceDates = async () => {
      try {
        const query = `*[_type == "maintenanceDate"]{date}`;
        const data = await sanityClient.fetch(query);
        const dates = data.map((item: { date: string }) => item.date);
        setMaintenanceDates(dates);
      } catch (error) {
        console.error("Error fetching maintenance dates:", error);
      }
    };
    fetchMaintenanceDates();
  }, []);

  // Detect Puerto Rico location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        if (response.data.country_code === "PR") {
          setIsPuertoRico(true);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, []);

  // Get available durations for current rental type and pickup/destination
  const getAvailableDurationsList = (): number[] => {
    if (rentalType === "Jet Ski") {
      const available = JET_SKI_AVAILABILITY[pickup];
      return available ? Object.keys(available).map(Number).sort((a, b) => a - b) : [];
    } else if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
      if (!destination) return [];
      const minDuration = BOAT_AVAILABILITY[pickup]?.[destination];
      if (minDuration) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d >= minDuration);
      }
    }
    return [];
  };

  // Get available destinations for boat
  const getAvailableDestinations = (): string[] => {
    if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
      return LOCATIONS.BOAT_DESTINATIONS;
    }
    return [];
  };

  // Get water sports for current rental type
  const getAvailableWaterSports = (): string[] => {
    if (rentalType === "Jet Ski") {
      return JET_SKI_WATER_SPORTS;
    } else {
      return BOAT_WATER_SPORTS;
    }
  };

  // Get available pickup times based on working hours and duration
  // Returns times as fractional hours (e.g., 9.25 = 09:15)
  const getAvailablePickupTimes = (): number[] => {
    if (!bookingDate || durationHours === undefined || durationHours === 0) return [];
    const dayType = getDayType(new Date(bookingDate));
    const times: number[] = [];
    const open = 9; // 9 AM
    const close = dayType === "Mon-Thu" ? 17 : 18; // closing hour

    // step in 15 minute increments (0.25 hours)
    for (let t = open; t < close; t += 0.25) {
      // canSelectTime accepts fractional hours as well (e.g. 9.25)
      if (canSelectTime(Number(t.toFixed(2)), durationHours, dayType)) {
        times.push(Number(t.toFixed(2)));
      }
    }
    return times;
  };

  // Calculate pricing
  useEffect(() => {
    let boatCost = 0;
    let jetSkiCost = 0;
    let waterSportsCost = 0;

    // Boat cost
    if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
      boatCost = calculateBoatPrice(durationHours);
    }

    // Jet ski cost
    if (rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") {
      jetSkiCost = calculateJetSkiPrice(numJetSkis, durationHours);
    }

    // Water sports cost
    Object.entries(selectedWaterSports).forEach(([sport, numPeople]) => {
      waterSportsCost += calculateWaterSportPrice(sport, numPeople);
    });

    const subtotalBeforeTax = boatCost + jetSkiCost + waterSportsCost;
    const taxAmount = subtotalBeforeTax * TAX_RATE;
    const total = subtotalBeforeTax + taxAmount;

    // Apply PR discount and code discount
    let finalTotal = total;
    if (isPuertoRico) {
      finalTotal -= finalTotal * 0.05;
    }
    if (discount !== null) {
      finalTotal -= finalTotal * (discount / 100);
    }

    setSubtotal(subtotalBeforeTax);
    setTax(taxAmount);
    setTotalCost(finalTotal);
  }, [rentalType, durationHours, numJetSkis, selectedWaterSports, isPuertoRico, discount]);

  // Validate booking
  const validateBooking = (): boolean => {
    const errors = [];

    if (!pickup) errors.push("Pickup location");
    if ((rentalType === "Boat" || rentalType === "Boat+Jet Ski") && !destination) errors.push("Destination");
    if (!durationHours) errors.push("Duration");
    if (!bookingDate) errors.push("Booking date");
    if (!pickupTime) errors.push("Pickup time");

    if (maintenanceDates.includes(bookingDate)) {
      setErrorMessage("This date is unavailable due to maintenance.");
      return false;
    }

    // Validate people limits
    const maxPeople =
      rentalType === "Jet Ski"
        ? numJetSkis * 2
        : rentalType === "Boat"
          ? 6
          : rentalType === "Boat+Jet Ski"
            ? 8 + numJetSkis * 2
            : 0;

    if (numPeople > maxPeople) {
      errors.push(`Too many people (max ${maxPeople} for this selection)`);
    }

    if (rentalType === "Jet Ski" && numJetSkis > 3) {
      errors.push("Max 3 jet skis per booking");
    }

    if (errors.length > 0) {
      setErrorMessage(`Please fill in all required fields: ${errors.join(", ")}`);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  // Handle confirm booking
  const handleConfirmBooking = () => {
    if (!validateBooking()) return;

    const bookingData = {
      rentalType,
      pickup,
      destination,
      durationHours,
      numJetSkis,
      waterSports: selectedWaterSports,
      bookingDate,
      pickupTime,
      numPeople,
      subtotal,
      tax,
      totalCost,
      discount,
      discountPercent: discount,
    };

    dispatch(
      updateBookingState({
        rentalType,
        pickupName: pickup,
        destinationName: destination,
        hourlyDuration: durationHours.toString(),
        hourlyDurationJetSki: durationHours,
        jetSkisCount: numJetSkis,
        boatRentalCount: rentalType !== "Jet Ski" ? 1 : 0,
        people: numPeople,
        waterSport: Object.keys(selectedWaterSports),
        sportPeople: selectedWaterSports,
        bookingDate,
        pickupTime,
        totalCost,
      })
    );

    router.push("/checkout");
  };

  // Handle dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply discount code
  const applyDiscount = async () => {
    setDiscountLoading(true);
    setDiscountError(null);
    try {
      const response = await fetch("/api/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid discount code");
      setDiscount(data.discountPercentage);
    } catch (err: unknown) {
      setDiscountError(err instanceof Error ? err.message : "An error occurred");
      setDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const availableDurations = getAvailableDurationsList();
  const availableDestinations = getAvailableDestinations();
  const availableWaterSports = getAvailableWaterSports();
  const availablePickupTimes = getAvailablePickupTimes();
  // Complimentary amenities only for boat bookings with 6+ hours (full day)
  const hasComplimentaryAmenities = 
    (rentalType === "Boat" || rentalType === "Boat+Jet Ski") && 
    durationHours >= 6;

  return (
    <div id="book" className="text-[#003b73] p-6 mt-6 mb-4">
      <h2 className="text-center text-2xl lg:text-3xl font-bold mb-10">Plan your Perfect Trip in the Caribbean</h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Booking Form */}
        <div className="col-span-2 bg-[#d4f1f4] bg-opacity-20 border-1 shadow-lg px-4 md:px-6 py-6 rounded-lg space-y-6">
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-bold">Book Your Adventure</h1>
            <p className="text-black font-bold text-lg py-1 px-2 rounded-xl bg-green-200">${totalCost.toFixed(2)}</p>
          </div>

          {/* Rental Type Selection */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Select Rental Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Jet Ski", "Boat", "Boat+Jet Ski"] as RentalType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setRentalType(type);
                    setPickup("");
                    setDestination("");
                    setDurationHours(1);
                    setNumJetSkis(1);
                    setSelectedWaterSports({});
                  }}
                  className={`py-2 px-3 rounded-lg font-medium transition ${
                    rentalType === type ? "bg-[#003b73] text-white" : "bg-white border border-gray-300 text-black"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Pickup Location</label>
            <select
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setDestination(""); // Reset destination when pickup changes
                setDurationHours(1);
              }}
              className="p-2 border rounded-md w-full text-black"
            >
              <option value="">Select Pickup</option>
              {LOCATIONS.PICKUPS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Destination (for Boat and Boat+Jet Ski) */}
          {(rentalType === "Boat" || rentalType === "Boat+Jet Ski") && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Destination</label>
              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setDurationHours(1); // Reset duration
                }}
                className="p-2 border rounded-md w-full text-black"
              >
                <option value="">Select Destination</option>
                {availableDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration */}
          {pickup && (rentalType !== "Boat" && rentalType !== "Boat+Jet Ski" ? true : destination) && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Duration</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="p-2 border rounded-md w-full text-black"
              >
                <option value="">Select Duration</option>
                {availableDurations.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur === 0.25 ? "15 minutes" : dur === 0.5 ? "30 minutes" : `${dur} hour${dur > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Number of Jet Skis (for Jet Ski and Boat+Jet Ski) */}
          {(rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Number of Jet Skis</label>
              <select
                value={numJetSkis}
                onChange={(e) => setNumJetSkis(Number(e.target.value))}
                className="p-2 border rounded-md w-full text-black"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    {num} jet ski{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Water Sports Selection */}
          {availableWaterSports.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-black mb-1">Water Sports (Optional)</label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-2 border rounded-md bg-white text-black flex justify-between items-center"
              >
                <span>{Object.keys(selectedWaterSports).length > 0 ? Object.keys(selectedWaterSports).join(", ") : "Select Water Sports"}</span>
                <svg className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {availableWaterSports.map((sport) => {
                      const sportInfo = WATER_SPORT_COSTS[sport];
                      return (
                        <label key={sport} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded">
                          <input
                            type="checkbox"
                            checked={sport in selectedWaterSports}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWaterSports((prev) => ({ ...prev, [sport]: 1 }));
                              } else {
                                const { [sport]: _, ...rest } = selectedWaterSports;
                                setSelectedWaterSports(rest);
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-black">
                            {sport} (${sportInfo?.cost} {sportInfo?.unit})
                          </span>
                          {sport in selectedWaterSports && (
                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={selectedWaterSports[sport]}
                              onChange={(e) =>
                                setSelectedWaterSports((prev) => ({
                                  ...prev,
                                  [sport]: Math.min(Number(e.target.value), 6),
                                }))
                              }
                              className="w-12 px-2 py-1 border rounded text-sm ml-auto"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Booking Date */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Booking Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="p-2 border rounded-md w-full text-black"
            />
            {bookingDate && <p className="text-sm text-gray-600 mt-1">{formatDateForDisplay(bookingDate)}</p>}
          </div>

          {/* Pickup Time */}
          {bookingDate && durationHours && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Pickup Time</label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="p-2 border rounded-md w-full text-black"
              >
                <option value="">Select Time</option>
                {availablePickupTimes.map((t) => {
                  const h = Math.floor(t);
                  const m = Math.round((t - h) * 60);
                  const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                  return (
                    <option key={t} value={timeStr}>
                      {timeStr}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Number of People */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Number of People</label>
            <input
              type="number"
              min="1"
              max={rentalType === "Jet Ski" ? numJetSkis * 2 : rentalType === "Boat" ? 6 : 8 + numJetSkis * 2}
              value={numPeople}
              onChange={(e) => setNumPeople(Math.min(Number(e.target.value), rentalType === "Jet Ski" ? numJetSkis * 2 : rentalType === "Boat" ? 6 : 8 + numJetSkis * 2))}
              className="p-2 border rounded-md w-full text-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              {rentalType === "Jet Ski"
                ? `Max ${numJetSkis * 2} people (2 per jet ski)`
                : rentalType === "Boat"
                  ? "Max 6 people"
                  : `Max ${8 + numJetSkis * 2} people`}
            </p>
          </div>

          {/* Booking Policies */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Booking Policies</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              {BOOKING_POLICIES.map((policy, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>

          {hasComplimentaryAmenities && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎉 Complimentary Amenities!</h3>
              <p className="text-sm text-green-700 mb-2">Your full-day boat booking includes:</p>
              <ul className="text-sm text-green-700 space-y-1">
                {COMPLIMENTARY_AMENITIES.map((amenity, i) => (
                  <li key={i}>• {amenity}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{errorMessage}</div>}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBooking}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Continue to Checkout
          </button>
        </div>

        {/* Right Column: Booking Summary */}
        <div className="sticky top-6 bg-white p-6 rounded-xl shadow-lg border h-fit">
          <h3 className="text-lg font-semibold text-[#003b73] mb-6">Booking Summary</h3>

          {/* Cost Breakdown */}
          <div className="space-y-3 mb-6 pb-4 border-b">
            <div className="flex justify-between text-sm">
              <span>Rental Type:</span>
              <span className="font-semibold">{rentalType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pickup:</span>
              <span className="font-semibold">{pickup || "Not selected"}</span>
            </div>
            {destination && (
              <div className="flex justify-between text-sm">
                <span>Destination:</span>
                <span className="font-semibold">{destination}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span className="font-semibold">{durationHours === 0.25 ? "15 mins" : durationHours === 0.5 ? "30 mins" : `${durationHours}h`}</span>
            </div>
            {(rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") && (
              <div className="flex justify-between text-sm">
                <span>Jet Skis:</span>
                <span className="font-semibold">{numJetSkis}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>People:</span>
              <span className="font-semibold">{numPeople}</span>
            </div>
            {bookingDate && (
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span className="font-semibold">{formatDateForDisplay(bookingDate)}</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tax (11.5%):</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            {isPuertoRico && (
              <div className="flex justify-between text-green-700">
                <span className="text-sm">PR Discount (5%):</span>
                <span className="font-semibold">-${((subtotal + tax) * 0.05).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Discount Code */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <label className="block text-xs font-medium text-black mb-1">Discount Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 px-2 py-1 text-sm border rounded text-black"
              />
              <button
                onClick={applyDiscount}
                disabled={discountLoading || !discountCode}
                className="px-3 py-1 text-sm bg-[#003b73] text-white rounded hover:bg-[#005a8e] disabled:opacity-50"
              >
                {discountLoading ? "..." : "Apply"}
              </button>
            </div>
            {discountError && <p className="text-xs text-red-600 mt-1">{discountError}</p>}
            {discount && <p className="text-xs text-green-600 mt-1">✓ {discount}% discount applied</p>}
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-700">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNow;
