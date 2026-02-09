"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../store/store";
import { updateBookingState } from '../store/store';
import { sanityClient } from "@/sanity/lib/sanity";
import axios from "axios";
import {
    LOCATIONS,
    JET_SKI_WATER_SPORTS,
    BOAT_WATER_SPORTS,
    WATER_SPORT_COSTS,
    TAX_RATE,
    COMPLIMENTARY_AMENITIES,
    BOOKING_POLICIES,
    getDayType,
    canSelectTime,
    getAvailableJetSkiDurations,
    calculateBoatPriceManual,
    calculateJetSkiPriceManual,
    calculateBoatJetSkiPackagePrice,
    getMinimumDuration,
    getMaxPeopleForRentalType,
    isJetSkiDurationAvailable,
    getExtendedJetSkiDurations,
} from "@/app/constants/pricing";

type RentalType = "Jet Ski" | "Boat" | "Boat+Jet Ski";

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
    const [isWaterSportsOpen, setIsWaterSportsOpen] = useState(false);
    const [maintenanceDates, setMaintenanceDates] = useState<string[]>([]);
    const [discount, setDiscount] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [isPuertoRico, setIsPuertoRico] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const waterSportsRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const helpSectionRef = useRef<HTMLDivElement>(null);

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

    // Format date to clear format: "MMM DD, YYYY" (e.g., "Jan 15, 2024")
    const formatDateToClear = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format date for input placeholder - clear for all users
    const getTodayDate = (): string => {
        const today = new Date();
        return today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get maximum water sports people (max 6 regardless of rental type)
    const getMaxWaterSportPeople = (): number => {
        return 6; // Fixed maximum for water sports
    };

    // Get available durations for current rental type
    const getAvailableDurationsList = (): { value: number; label: string }[] => {
        if (rentalType === "Jet Ski") {
            const availableMinutes = getAvailableJetSkiDurations(pickup);
            const durations: { value: number; label: string }[] = [];

            // Add available minute-based durations
            availableMinutes.forEach(minutes => {
                if (minutes === 15) durations.push({ value: 0.25, label: "15 minutes" });
                if (minutes === 30) durations.push({ value: 0.5, label: "30 minutes" });
                if (minutes === 60) durations.push({ value: 1, label: "1 hour" });
            });

            // Add extended hourly durations (1-9 hours)
            if (availableMinutes.includes(60)) {
                getExtendedJetSkiDurations().forEach(hours => {
                    if (hours > 1) {
                        durations.push({ value: hours, label: `${hours} hours` });
                    }
                });
            }

            return durations;
        } else if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
            if (!pickup || !destination) return [];
            const minDuration = getMinimumDuration(pickup, destination);
            if (minDuration) {
                return [1, 2, 3, 4, 5, 6, 7, 8]
                    .filter(d => d >= minDuration)
                    .map(d => ({ value: d, label: `${d} hour${d > 1 ? 's' : ''}` }));
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
    const getAvailablePickupTimes = (): string[] => {
        if (!bookingDate || !durationHours) return [];
        const dayType = getDayType(new Date(bookingDate));
        const times: string[] = [];
        const open = 9; // 9 AM
        const close = dayType === "Mon-Thu" ? 17 : 18; // closing hour

        // step in 15 minute increments (0.25 hours)
        for (let t = open; t < close; t += 0.25) {
            if (canSelectTime(Number(t.toFixed(2)), durationHours, dayType)) {
                const h = Math.floor(t);
                const m = Math.round((t - h) * 60);
                const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                times.push(timeStr);
            }
        }
        return times;
    };

    // Get max people based on rental type
    const getMaxPeople = (): number => {
        return getMaxPeopleForRentalType(rentalType, numJetSkis);
    };

    // Calculate pricing
    useEffect(() => {
        let boatCost = 0;
        let jetSkiCost = 0;
        let waterSportsCost = 0;

        // Calculate costs based on rental type
        if (rentalType === "Boat") {
            // Boat only - use manual hourly rates
            boatCost = calculateBoatPriceManual(durationHours);
        } else if (rentalType === "Jet Ski") {
            // Jet ski only - use manual pricing
            jetSkiCost = calculateJetSkiPriceManual(numJetSkis, durationHours, pickup);
        } else if (rentalType === "Boat+Jet Ski") {
            // Package - use Excel package prices
            const packageCost = calculateBoatJetSkiPackagePrice(pickup, destination, durationHours, numJetSkis);
            if (packageCost > 0) {
                boatCost = packageCost;
            } else {
                // Fallback calculation if package price not found
                boatCost = calculateBoatPriceManual(durationHours);
                jetSkiCost = calculateJetSkiPriceManual(numJetSkis, durationHours, pickup);
            }
        }

        // Water sports cost
        Object.entries(selectedWaterSports).forEach(([sport, numSportPeople]) => {
            const sportInfo = WATER_SPORT_COSTS[sport];
            if (sportInfo) {
                waterSportsCost += sportInfo.cost * numSportPeople;
            }
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
        setTotalCost(parseFloat(finalTotal.toFixed(2)));
    }, [rentalType, pickup, destination, durationHours, numJetSkis, selectedWaterSports, isPuertoRico, discount]);

    // Validate booking
    const validateBooking = (): boolean => {
        const errors: string[] = [];

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
        const maxPeople = getMaxPeople();
        if (numPeople > maxPeople) {
            errors.push(`Too many people (max ${maxPeople} for this selection)`);
        }

        // Validate jet ski count
        if ((rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") && numJetSkis > 3) {
            errors.push("Max 3 jet skis per booking");
        }

        // Validate minimum duration for jet skis
        if (rentalType === "Jet Ski" && pickup) {
            const durationMinutes = durationHours * 60;
            if (!isJetSkiDurationAvailable(pickup, durationMinutes)) {
                errors.push(`Selected duration not available at ${pickup}`);
            }
        }

        // Validate minimum duration for boat
        if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
            const minDuration = getMinimumDuration(pickup, destination);
            if (minDuration && durationHours < minDuration) {
                errors.push(`Minimum duration for ${pickup} to ${destination} is ${minDuration} hours`);
            }
        }

        // Validate water sports people limit
        Object.entries(selectedWaterSports).forEach(([sport, people]) => {
            if (people > 6) {
                errors.push(`Maximum 6 people allowed for ${sport}`);
            }
        });

        if (errors.length > 0) {
            setErrorMessage(`Please check: ${errors.join(", ")}`);
            return false;
        }

        setErrorMessage("");
        return true;
    };

    // Handle confirm booking
    const handleConfirmBooking = async () => {
        if (!validateBooking()) return;

        setIsLoading(true);
        try {
            // Removed unused bookingData variable
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
        } catch {
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle dropdown outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (waterSportsRef.current && !waterSportsRef.current.contains(event.target as Node)) {
                setIsWaterSportsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Apply discount code
    const applyDiscount = async () => {
        if (!discountCode.trim()) return;

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

    // Reset form when rental type changes
    const handleRentalTypeChange = (type: RentalType) => {
        setRentalType(type);
        setPickup("");
        setDestination("");
        setDurationHours(type === "Jet Ski" ? 1 : 1);
        setNumJetSkis(1);
        setSelectedWaterSports({});
        setPickupTime("");
        setNumPeople(1);
        setErrorMessage("");
    };

    // Handle pickup change
    const handlePickupChange = (value: string) => {
        setPickup(value);
        if (rentalType === "Boat" || rentalType === "Boat+Jet Ski") {
            setDestination("");
        }
        setDurationHours(1);
        setPickupTime("");
    };

    // Handle destination change
    const handleDestinationChange = (value: string) => {
        setDestination(value);
        setDurationHours(1);
        setPickupTime("");
    };

    // Handle duration change
    const handleDurationChange = (value: number) => {
        setDurationHours(value);
        setPickupTime("");
    };

    // Handle water sport selection
    const handleWaterSportChange = (sport: string, checked: boolean) => {
        if (checked) {
            setSelectedWaterSports(prev => ({ ...prev, [sport]: 1 }));
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [sport]: _, ...rest } = selectedWaterSports;
            setSelectedWaterSports(rest);
        }
    };

    // Handle water sport people change - max 6 people
    const handleWaterSportPeopleChange = (sport: string, people: number) => {
        setSelectedWaterSports(prev => ({
            ...prev,
            [sport]: Math.min(Math.max(1, people), getMaxWaterSportPeople())
        }));
    };

    const availableDurations = getAvailableDurationsList();
    const availableDestinations = getAvailableDestinations();
    const availableWaterSports = getAvailableWaterSports();
    const availablePickupTimes = getAvailablePickupTimes();
    const maxPeople = getMaxPeople();
    const maxWaterSportPeople = getMaxWaterSportPeople();

    // Complimentary amenities for whole day boat trip (9 hours) over $650
    const hasComplimentaryAmenities = totalCost > 650 &&
        (rentalType === "Boat" || rentalType === "Boat+Jet Ski") &&
        durationHours >= 6;

    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    return (
        <div id="book" className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
                        Book Your Caribbean Adventure
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Experience the perfect getaway with our premium boat and jet ski rentals.
                        Customize your trip to explore beautiful destinations around Puerto Rico.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                    <p className="text-gray-600 mt-1">Fill in your adventure preferences</p>
                                </div>
                                <div className="mt-4 sm:mt-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                                    {formatPrice(totalCost)}
                                </div>
                            </div>

                            {/* Rental Type Selection */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Rental Type</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {(["Jet Ski", "Boat", "Boat+Jet Ski"] as RentalType[]).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleRentalTypeChange(type)}
                                            className={`py-4 px-4 rounded-xl font-medium transition-all duration-200 ${rentalType === type
                                                ? "bg-[#003b73] text-white shadow-lg transform scale-[1.02]"
                                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className="font-semibold">{type}</div>
                                            <div className="text-xs mt-1 opacity-80">
                                                {type === "Jet Ski" ? "Up to 2 per unit" :
                                                    type === "Boat" ? "Up to 6 passengers" :
                                                        "Boat + Jet Ski combo"}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Pickup Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pickup Location <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={pickup}
                                        onChange={(e) => handlePickupChange(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition"
                                    >
                                        <option value="">Select a pickup location</option>
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Destination <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={destination}
                                            onChange={(e) => handleDestinationChange(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition"
                                            disabled={!pickup}
                                        >
                                            <option value="">Select destination</option>
                                            {availableDestinations.map((dest) => (
                                                <option key={dest} value={dest}>
                                                    {dest}
                                                </option>
                                            ))}
                                        </select>
                                        {destination && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Minimum duration: {getMinimumDuration(pickup, destination)} hours
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Duration */}
                                {pickup && (rentalType !== "Boat" && rentalType !== "Boat+Jet Ski" ? true : destination) && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={durationHours}
                                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition"
                                        >
                                            <option value="">Select duration</option>
                                            {availableDurations.map((dur) => (
                                                <option key={dur.value} value={dur.value}>
                                                    {dur.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Number of Jet Skis (for Jet Ski and Boat+Jet Ski) */}
                                {(rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Number of Jet Skis
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setNumJetSkis(num)}
                                                    className={`py-3 rounded-lg font-medium transition ${numJetSkis === num
                                                        ? "bg-[#003b73] text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {num} Jet Ski{num > 1 ? "s" : ""}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Maximum 2 people per jet ski</p>
                                    </div>
                                )}

                                {/* Water Sports Selection */}
                                {availableWaterSports.length > 0 && (
                                    <div className="relative" ref={waterSportsRef}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Water Sports (Optional)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsWaterSportsOpen(!isWaterSportsOpen)}
                                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-400 transition"
                                        >
                                            <span className={Object.keys(selectedWaterSports).length > 0 ? "text-gray-900" : "text-gray-500"}>
                                                {Object.keys(selectedWaterSports).length > 0
                                                    ? `${Object.keys(selectedWaterSports).length} sport${Object.keys(selectedWaterSports).length > 1 ? 's' : ''} selected`
                                                    : "Add water sports"}
                                            </span>
                                            <svg
                                                className={`h-5 w-5 text-gray-400 transition-transform ${isWaterSportsOpen ? "rotate-180" : ""}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isWaterSportsOpen && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                                                <div className="p-4 space-y-3">
                                                    {availableWaterSports.map((sport) => {
                                                        const sportInfo = WATER_SPORT_COSTS[sport];
                                                        const isSelected = sport in selectedWaterSports;
                                                        return (
                                                            <div key={sport} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition">
                                                                <div className="flex items-center space-x-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`sport-${sport}`}
                                                                        checked={isSelected}
                                                                        onChange={(e) => handleWaterSportChange(sport, e.target.checked)}
                                                                        className="h-5 w-5 text-[#003b73] rounded focus:ring-[#003b73]"
                                                                    />
                                                                    <div>
                                                                        <label htmlFor={`sport-${sport}`} className="font-medium text-gray-900 cursor-pointer">
                                                                            {sport}
                                                                        </label>
                                                                        <p className="text-xs text-gray-500">
                                                                            ${sportInfo?.cost} {sportInfo?.unit}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-sm text-gray-600">People:</span>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={maxWaterSportPeople}
                                                                            value={selectedWaterSports[sport]}
                                                                            onChange={(e) => handleWaterSportPeopleChange(sport, Number(e.target.value))}
                                                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                                                        />
                                                                        <span className="text-xs text-gray-500">max {maxWaterSportPeople}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Booking Date - Enhanced for clarity */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Booking Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition"
                                                title={`Select date - Today is ${getTodayDate()}`}
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            {bookingDate && (
                                                <div className="absolute -bottom-6 left-0 text-sm text-gray-600 font-medium">
                                                    {formatDateToClear(bookingDate)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-8">
                                            Date format: Month Day, Year (e.g., Jan 15, 2024)
                                        </p>
                                    </div>

                                    {/* Pickup Time */}
                                    {bookingDate && durationHours > 0 && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Pickup Time <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition"
                                            >
                                                <option value="">Select time</option>
                                                {availablePickupTimes.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Number of People */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Number of People <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max={maxPeople}
                                            value={numPeople}
                                            onChange={(e) => setNumPeople(Number(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="w-16 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                max={maxPeople}
                                                value={numPeople}
                                                onChange={(e) => setNumPeople(Math.min(Math.max(1, Number(e.target.value)), maxPeople))}
                                                className="w-full p-2 border border-gray-300 rounded-lg text-center"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>1 person</span>
                                        <span className="font-medium">
                                            {numPeople} of {maxPeople} max
                                        </span>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-red-700 font-medium">{errorMessage}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Complimentary Amenities - Only show for whole day boat trip */}
                                {hasComplimentaryAmenities && (
                                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <svg className="h-5 w-5 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <h3 className="font-semibold text-emerald-800">🎉 Complimentary Amenities Included!</h3>
                                        </div>
                                        <p className="text-sm text-emerald-700 mb-3">
                                            Your 9-hour boat trip qualifies for our premium package:
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

                                {/* Confirm Button */}
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        "Continue to Checkout"
                                    )}
                                </button>

                                {/* Important Information */}
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <h3 className="font-semibold text-blue-800 mb-3">Important Information</h3>
                                    <ul className="text-sm text-blue-700 space-y-2">
                                        {BOOKING_POLICIES.map((policy, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 mt-1 flex-shrink-0">•</span>
                                                <span>{policy}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Summary and Help Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Booking Summary - Always sticky at top */}
                            <div ref={summaryRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#003b73] to-[#005a8e] text-white p-6">
                                    <h3 className="text-xl font-bold">Booking Summary</h3>
                                    <p className="text-blue-100 text-sm mt-1">Review your adventure details</p>
                                </div>

                                {/* Details */}
                                <div className="p-6 space-y-4">
                                    {/* Rental Details */}
                                    <div className="space-y-3 pb-4 border-b">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Rental Type:</span>
                                            <span className="font-semibold text-gray-900">{rentalType}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Pickup:</span>
                                            <span className="font-semibold text-gray-900">{pickup || "—"}</span>
                                        </div>
                                        {destination && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Destination:</span>
                                                <span className="font-semibold text-gray-900">{destination}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Duration:</span>
                                            <span className="font-semibold text-gray-900">
                                                {rentalType === "Jet Ski" && durationHours === 0.25 ? "15 mins" :
                                                    rentalType === "Jet Ski" && durationHours === 0.5 ? "30 mins" :
                                                        `${durationHours} hour${durationHours !== 1 ? 's' : ''}`}
                                            </span>
                                        </div>
                                        {(rentalType === "Jet Ski" || rentalType === "Boat+Jet Ski") && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Jet Skis:</span>
                                                <span className="font-semibold text-gray-900">{numJetSkis}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">People:</span>
                                            <span className="font-semibold text-gray-900">{numPeople} / {maxPeople}</span>
                                        </div>
                                        {bookingDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Date:</span>
                                                <span className="font-semibold text-gray-900">{formatDateToClear(bookingDate)}</span>
                                            </div>
                                        )}
                                        {pickupTime && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Pickup Time:</span>
                                                <span className="font-semibold text-gray-900">{pickupTime}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Water Sports */}
                                    {Object.keys(selectedWaterSports).length > 0 && (
                                        <div className="pb-4 border-b">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Water Sports</h4>
                                            <div className="space-y-2">
                                                {Object.entries(selectedWaterSports).map(([sport, people]) => {
                                                    const sportInfo = WATER_SPORT_COSTS[sport];
                                                    return (
                                                        <div key={sport} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">
                                                                {sport} × {people}
                                                            </span>
                                                            <span className="font-medium text-gray-900">
                                                                {formatPrice((sportInfo?.cost || 0) * people)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pricing Breakdown */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Subtotal:</span>
                                            <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Tax (11.5%):</span>
                                            <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                                        </div>
                                        {isPuertoRico && (
                                            <div className="flex justify-between items-center text-green-600">
                                                <span className="text-sm">PR Discount (5%):</span>
                                                <span className="font-semibold">-{formatPrice((subtotal + tax) * 0.05)}</span>
                                            </div>
                                        )}
                                        {discount && (
                                            <div className="flex justify-between items-center text-green-600">
                                                <span className="text-sm">Discount ({discount}%):</span>
                                                <span className="font-semibold">-{formatPrice(totalCost * discount / 100)}</span>
                                            </div>
                                        )}
                                    </div>

                              {/* Add error message display */}
{discountError && (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {discountError}
    </div>
)}

<div className="grid grid-cols-2 gap-2">
    <input
        type="text"
        value={discountCode}
        onChange={(e) => {
            setDiscountCode(e.target.value);
            // Clear error when user starts typing
            if (discountError) setDiscountError(null);
        }}
        placeholder="Enter discount code"
        className={`w-full px-4 py-3 border rounded-lg
            focus:ring-2 focus:ring-[#003b73] focus:border-transparent text-sm
            ${discountError ? 'border-red-500' : 'border-gray-300'}`}
    />

    <button
        onClick={applyDiscount}
        disabled={discountLoading || !discountCode.trim()}
        className="w-full px-4 py-3 bg-[#003b73] text-white rounded-lg
            hover:bg-[#005a8e] disabled:opacity-50 disabled:cursor-not-allowed
            transition font-medium flex items-center justify-center"
    >
        {discountLoading ? (
            <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        ) : (
            "Apply"
        )}
    </button>
</div>

                                    {/* Total */}
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                            <span className="text-2xl font-bold text-emerald-600">{formatPrice(totalCost)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            All prices include taxes and fees
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookNow;