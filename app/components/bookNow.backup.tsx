"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import predefinedLocations from "@/app/constants/locations";
import { useAppDispatch } from "../store/store";
import { updateBookingState } from '../store/store';
import BoatRampsMap from "./BoatRampsMap";
import { sanityClient } from "@/sanity/lib/sanity";
import axios from "axios";

interface Coordinates {
    longitude: number;
    latitude: number;
}

type Booking = {
    bookingId: string;
    date: string;
    timeSlot: string;
    boatCount: number;
    jetSkiCount: number;
    waterSports: Array<{ sport: string }>;
    rentalType: string;
    numberofHours: number;
    pickup: string;
    destination: string;
    people: number;
    totalPrice: number;
};

type WaterSport = "WaterSkiing" | "Paddleboarding" | "Snorkeling" | "Kayaking" | "Fishing";

const BookNow = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // State declarations
    const [pickup, setPickup] = useState<Coordinates | null>(null);
    const [pickupName, setPickupName] = useState<string>("");
    const [destination, setDestination] = useState<Coordinates | null>(null);
    const [destinationName, setDestinationName] = useState<string>("");
    const [distance, setDistance] = useState<number>(0);
    const [pricingType, setPricingType] = useState<string>("");
    const [hourlyDurationBoat, setHourlyDurationBoat] = useState<number>(1);
    const [hourlyDurationJetSki, setHourlyDurationJetSki] = useState<number>(1);
    const [waitingTime, setWaitingTime] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [bookingDate, setBookingDate] = useState<string>("");
    const [pickupTime, setPickupTime] = useState<string>("");
    const [people, setPeople] = useState<number>(1);
    const [sportPeople, setSportPeople] = useState<Record<string, number>>({});
    const [waterSport, setWaterSport] = useState<WaterSport[]>([]);
    const [boatRentalCount, setBoatRentalCount] = useState<number>(0);
    const [jetSkisCount, setJetSkisCount] = useState<number>(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [unavailableSlots, setUnavailableSlots] = useState<Set<string>>(new Set());
    const [maintenanceDates, setMaintenanceDates] = useState<string[]>([]);
    const [discount, setDiscount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [isPuertoRico, setIsPuertoRico] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rentalOption, setRentalOption] = useState<"Jet skis only" | "Boat Only" | "Boat+jet skis">("Boat Only");

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Time slots based on working hours
    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

    // Pricing constants per product rules
    const BOAT_PRICING = { 1: 150, 3: 350, 6: 650 };
    const JET_SKI_RATE_PER_HOUR = 120; // base rate for 1h or more
    // Waiting time removed from cost calculations per updated rules
    const WATER_SPORT_COSTS: Record<string, number> = {
        Paddleboarding: 40,
        Snorkeling: 30,
        WaterSkiing: 70,
        Kayaking: 50,
        Fishing: 40,
    };

    // Fetch user location
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await axios.get("https://ipapi.co/json/");
                if (response.data.country_code === "PR") {
                    console.log("User is in Puerto Rico");
                }
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        };
        fetchLocation();
    }, []);

    // Fetch maintenance dates
    useEffect(() => {
        const fetchMaintenanceDates = async () => {
            const query = `*[_type == "maintenanceDate"]{date}`;
            const data = await sanityClient.fetch(query);
            const dates = data.map((item: { date: string }) => item.date);
            setMaintenanceDates(dates);
        };
        fetchMaintenanceDates();
    }, []);

    // Check availability for selected date
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const query = `*[_type == "booking" && date == "${bookingDate}"]`;
                const bookings = await sanityClient.fetch(query);
                return bookings;
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        if (bookingDate) {
            fetchBookings().then((bookings) => {
                if (bookings) {
                    const { unavailableSlots } = checkAvailability(bookings, bookingDate, pickupTime);
                    setUnavailableSlots(unavailableSlots);

                    if (unavailableSlots.size === timeSlots.length) {
                        setErrorMessage("All time slots for this date are booked.");
                    } else {
                        setErrorMessage("");
                    }
                }
            });
        }
    }, [bookingDate, pickupTime]);

    // Calculate total cost
    useEffect(() => {
        let cost = 0;

        // Boat pricing
        if (boatRentalCount > 0 && pricingType === "Hourly") {
            const hours = Number(hourlyDurationBoat) || 1;
            if (hours <= 1) cost += boatRentalCount * BOAT_PRICING[1];
            else if (hours === 3) cost += boatRentalCount * BOAT_PRICING[3];
            else if (hours >= 6) cost += boatRentalCount * BOAT_PRICING[6];
            else if (hours > 1 && hours < 3) cost += boatRentalCount * BOAT_PRICING[3];
            else if (hours > 3 && hours < 6) cost += boatRentalCount * BOAT_PRICING[6];
        } else if (boatRentalCount > 0 && pricingType === "Half Day") {
            cost += boatRentalCount * BOAT_PRICING[3];
        } else if (boatRentalCount > 0 && pricingType === "Full Day") {
            cost += boatRentalCount * BOAT_PRICING[6];
        }

        // Jet Ski pricing
        if (jetSkisCount > 0 && pricingType === "Hourly") {
            const dur = Number(hourlyDurationJetSki) || 1;
            if (dur === 0.25) cost += jetSkisCount * 50;
            else if (dur === 0.5) cost += jetSkisCount * 75;
            else if (dur >= 1) cost += jetSkisCount * JET_SKI_RATE_PER_HOUR * dur;
        } else if (jetSkisCount > 0 && pricingType === "Half Day") {
            cost += jetSkisCount * (JET_SKI_RATE_PER_HOUR * 4);
        } else if (jetSkisCount > 0 && pricingType === "Full Day") {
            cost += jetSkisCount * (JET_SKI_RATE_PER_HOUR * 8);
        }

        // Water sports (some are priced per day)
        waterSport.forEach((sport) => {
            const participants = Math.min(sportPeople[sport] || 0, 6);
            cost += participants * (WATER_SPORT_COSTS as any)[sport];
        });

        // Apply discounts
        let finalCost = cost;
        if (isPuertoRico) finalCost -= (cost * 5) / 100;
        if (discount !== null) finalCost -= (finalCost * discount) / 100;

        setTotalCost(finalCost);
    }, [
        boatRentalCount,
        jetSkisCount,
        pricingType,
        hourlyDurationBoat,
        hourlyDurationJetSki,
        waitingTime,
        waterSport,
        sportPeople,
        isPuertoRico,
        discount,
    ]);

    useEffect(() => {
    if (pickup && destination) {
        const dist = calculateDistance(pickup, destination);
        setDistance(dist);
    }
}, [pickup, destination]);


    // Check availability function
    const checkAvailability = (bookings: Booking[], selectedDate: string, pickupTime: string) => {
        const unavailableSlots = new Set<string>();
        const MAX_JET_SKIS = 3;

        bookings.forEach((booking) => {
            if (booking.date === selectedDate) {
                // Check for jet ski availability
                let totalJetSkisBooked = 0;
                bookings.forEach((b) => {
                    if (b.date === selectedDate && b.timeSlot === pickupTime) {
                        totalJetSkisBooked += b.jetSkiCount;
                    }
                });

                if (totalJetSkisBooked >= MAX_JET_SKIS) {
                    unavailableSlots.add(pickupTime);
                }

                // Handle different rental types
                if (booking.rentalType === "Full Day") {
                    timeSlots.forEach((time) => unavailableSlots.add(time));
                } else if (booking.rentalType === "Half Day") {
                    const halfDaySlots = getHalfDaySlots(booking.timeSlot);
                    halfDaySlots.forEach((time) => unavailableSlots.add(time));
                } else if (booking.rentalType === "Hourly") {
                    const bookedTimeIndex = timeSlots.indexOf(booking.timeSlot);
                    for (let i = 0; i < booking.numberofHours; i++) {
                        const timeSlot = timeSlots[bookedTimeIndex + i];
                        if (timeSlot) unavailableSlots.add(timeSlot);
                    }
                }
            }
        });

        return { unavailableSlots };
    };

    const getHalfDaySlots = (startTime: string) => {
        const startIndex = timeSlots.indexOf(startTime);
        const halfDaySlots: string[] = [];
        for (let i = 0; i < 4; i++) {
            const timeSlot = timeSlots[startIndex + i];
            if (timeSlot) halfDaySlots.push(timeSlot);
        }
        return halfDaySlots;
    };

    // Calculate distance between coordinates
    const calculateDistance = (pickup: Coordinates, destination: Coordinates): number => {
        const R = 6371;
        const dLat = ((destination.latitude - pickup.latitude) * Math.PI) / 180;
        const dLng = ((destination.longitude - pickup.longitude) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((pickup.latitude * Math.PI) / 180) *
            Math.cos((destination.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Handle date change
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = event.target.value;
        if (maintenanceDates.includes(selectedDate)) {
            setErrorMessage("This date is unavailable due to maintenance.");
            setBookingDate("");
        } else {
            setErrorMessage("");
            setBookingDate(selectedDate);
        }
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

    // Toggle water sport selection
    const handleCheckboxChange = (sport: WaterSport) => {
        setSportPeople((prev) => ({
            ...prev,
            [sport]: waterSport.includes(sport) ? prev[sport] : 1,
        }));

        if (waterSport.includes(sport)) {
            setWaterSport(waterSport.filter((item) => item !== sport));
        } else {
            setWaterSport([...waterSport, sport]);
        }
    };

    // Apply discount
    const applyDiscount = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/validate-discount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Invalid discount code");
            setDiscount(data.discountPercentage);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            setDiscount(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle confirm booking
    const handleConfirmBooking = async () => {
        // Validation
        if (!pickupName || !destinationName || !pricingType || !bookingDate || !pickupTime || people <= 0) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        // Validate based on rental option
        if (rentalOption === "Boat Only" && boatRentalCount === 0) {
            setErrorMessage("Please select at least 1 boat for Boat Only option.");
            return;
        }

        if (rentalOption === "Jet skis only" && jetSkisCount === 0) {
            setErrorMessage("Please select at least 1 jet ski for Jet Skis Only option.");
            return;
        }

        if (rentalOption === "Boat+jet skis" && boatRentalCount === 0) {
            setErrorMessage("Please select at least 1 boat for Boat+Jet Skis option.");
            return;
        }

        // Validate people limits - FIXED LOGIC
        if (boatRentalCount > 0 && people > 6) {
            // Boat only or boat with jet skis - max 6 paying passengers
            if (jetSkisCount === 0) {
                setErrorMessage("Boat Only option is limited to 6 paying passengers.");
                return;
            } else {
                // Boat with jet skis - boat can carry 6, jet skis can carry additional
                const jetSkiCapacity = jetSkisCount * 2;
                const totalCapacity = 6 + jetSkiCapacity; // Boat (6) + jet skis

                if (people > totalCapacity) {
                    setErrorMessage(`Total capacity exceeded. Boat can carry 6 people and ${jetSkisCount} jet ski(s) can carry ${jetSkiCapacity} more. For ${people} people, consider adding more jet skis.`);
                    return;
                }
            }
        }

        // Jet skis only - validate capacity
        if (rentalOption === "Jet skis only" && jetSkisCount > 0) {
            const jetSkiCapacity = jetSkisCount * 2;
            if (people > jetSkiCapacity) {
                setErrorMessage(`Jet skis can accommodate up to 2 passengers per jet ski. For ${people} people, you need at least ${Math.ceil(people / 2)} jet skis.`);
                return;
            }
        }

        // Validate distance for hourly boat trips
        if (boatRentalCount > 0 && pricingType === "Hourly") {
            if (hourlyDurationBoat <= 1 && distance > 20) {
                setErrorMessage("Distance too long for a 1-hour boat trip. Please extend duration or choose a closer location.");
                return;
            }
            if (hourlyDurationBoat <= 2 && distance > 50) {
                setErrorMessage("Distance too long for a 2-hour boat trip. Please extend duration or choose a closer location.");
                return;
            }
        }

        setErrorMessage("");

        // Dispatch booking state
        dispatch(
            updateBookingState({
                pickupName,
                destinationName,
                distance,
                pricingType,
                hourlyDuration: hourlyDurationBoat.toString(),
                totalCost,
                bookingDate,
                pickupTime,
                people,
                waterSport,
                boatRentalCount,
                jetSkisCount,
                waitingTime,
                rentalOption,
                hourlyDurationJetSki,
            })
        );

        router.push("/checkout");
    };

    // Handle rental option change
    const handleRentalOptionChange = (option: "Jet skis only" | "Boat Only" | "Boat+jet skis") => {
        setRentalOption(option);
        // Reset counts based on selection
        if (option === "Jet skis only") {
            setBoatRentalCount(0);
        } else if (option === "Boat Only") {
            setJetSkisCount(0);
        }
        // For "Boat+jet skis", both can be selected
    };

    return (
        <div id="book" className="text-[#003b73] p-6 mt-6 mb-4">
            <h2 className="text-center text-2xl lg:text-3xl font-bold mb-10">Plan your Perfect Trip in the Caribbean</h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-[#d4f1f4] bg-opacity-20 border-1 shadow-lg px-4 md:px-6 py-6 rounded-lg space-y-6">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-2xl font-bold">Book Now!</h1>
                        <p className="text-black font-bold text-lg py-1 px-2 rounded-xl bg-green-200">${totalCost.toFixed(2)}</p>
                    </div>

                    {/* Rental Option Selection */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Rental Option</label>
                            <select
                                className="p-2 border text-sm rounded-md w-full"
                                value={rentalOption}
                                onChange={(e) => handleRentalOptionChange(e.target.value as "Jet skis only" | "Boat Only" | "Boat+jet skis")}
                            >
                                <option value="Boat Only">Boat Only (up to 6 passengers)</option>
                                <option value="Jet skis only">Jet skis only (up to 2 passengers per jet ski)</option>
                                <option value="Boat+jet skis">Boat + Jet Skis</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Pricing Type</label>
                            <select
                                className="p-2 border text-sm rounded-md w-full"
                                value={pricingType}
                                onChange={(e) => setPricingType(e.target.value)}
                            >
                                <option value="">Select Pricing Type</option>
                                <option value="Hourly">Hourly</option>
                                <option value="Half Day">Half Day (4 hours)</option>
                                <option value="Full Day">Full Day (8 hours)</option>
                            </select>
                        </div>
                    </div>

                    {/* Pickup and Destination */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Pickup Location</label>
                            <select
                                className="p-2 text-sm border rounded-md w-full"
                                onChange={(e) => {
                                    const loc = predefinedLocations.pickup.find((l) => l.name === e.target.value);
                                    if (loc) {
                                        setPickup(loc.coordinates);
                                        setPickupName(loc.name);
                                    }
                                }}
                            >
                                <option value="">Select Pickup</option>
                                {predefinedLocations.pickup.map((loc) => (
                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Drop-off Location</label>
                            <select
                                className="p-2 text-sm border rounded-md w-full"
                                onChange={(e) => {
                                    const loc = predefinedLocations.destination.find((l) => l.name === e.target.value);
                                    if (loc) {
                                        setDestination(loc.coordinates);
                                        setDestinationName(loc.name);
                                        // Calculate distance
                                        if (pickup) {
                                            const dist = calculateDistance(pickup, loc.coordinates);
                                            setDistance(dist);
                                        }
                                    }
                                }}
                            >
                                <option value="">Select Drop-off</option>
                                {predefinedLocations.destination.map((loc) => (
                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    {pricingType === "Hourly" && (
                        <div className="flex flex-col md:flex-row gap-4">
                            {boatRentalCount > 0 && (
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-black mb-1">Boat Duration (Hours)</label>
                                            <select
                                                className="p-2 border text-sm rounded-md w-full"
                                                value={hourlyDurationBoat}
                                                onChange={(e) => setHourlyDurationBoat(Number(e.target.value))}
                                            >
                                                {[1, 3, 6].map((hour) => (
                                                    <option key={hour} value={hour}>
                                                        {hour} {hour === 1 ? 'hour' : 'hours'} - ${ (BOAT_PRICING as any)[hour] }
                                                    </option>
                                                ))}
                                            </select>
                                </div>
                            )}

                            {jetSkisCount > 0 && (
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-black mb-1">Jet Ski Duration (Hours)</label>
                                    <select
                                        className="p-2 border text-sm rounded-md w-full"
                                        value={hourlyDurationJetSki}
                                        onChange={(e) => setHourlyDurationJetSki(Number(e.target.value))}
                                    >
                                        {[0.25, 0.5, 1, 2, 3, 4].map((dur) => (
                                            <option key={dur} value={dur}>
                                                {dur === 0.25 ? '15 minutes' : dur === 0.5 ? '30 minutes' : `${dur} hour${dur > 1 ? 's' : ''}`} - ${dur === 0.25 ? 50 : dur === 0.5 ? 75 : dur * JET_SKI_RATE_PER_HOUR}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Boat and Jet Ski Selection */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {(rentalOption === "Boat Only" || rentalOption === "Boat+jet skis") && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-black mb-1">Boats</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    className="p-2 border rounded-md w-full"
                                    value={boatRentalCount}
                                    onChange={(e) => setBoatRentalCount(Math.min(Number(e.target.value), 1))}
                                // disabled={rentalOption === "Jet skis only"}
                                />
                                <p className="text-xs text-gray-500 mt-1">Max 1 boat per booking</p>
                            </div>
                        )}

                        {(rentalOption === "Jet skis only" || rentalOption === "Boat+jet skis") && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-black mb-1">Jet Skis</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="3"
                                    className="p-2 border rounded-md w-full"
                                    value={jetSkisCount}
                                    onChange={(e) => setJetSkisCount(Math.min(Number(e.target.value), 3))}
                                // disabled={rentalOption === "Boat Only"}
                                />
                                <p className="text-xs text-gray-500 mt-1">Max 3 jet skis, 2 passengers per jet ski</p>
                            </div>
                        )}

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Number of People</label>
                            <input
                                type="number"
                                min="1"
                                max={rentalOption === "Boat Only" ? 6 : 14}
                                className="p-2 border rounded-md w-full"
                                value={people}
                                onChange={(e) => setPeople(Math.min(Number(e.target.value), rentalOption === "Boat Only" ? 6 : 14))}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {rentalOption === "Boat Only" ? "Max 6 paying passengers (boat capacity: 10)" : "Max 14 people"}
                            </p>
                        </div>
                    </div>

                    {/* Water Sports Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-black mb-1">Water Sports (Optional)</label>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 py-2.5 border text-sm rounded-md w-full bg-white cursor-pointer flex justify-between items-center"
                        >
                            <span>{waterSport.length > 0 ? waterSport.join(", ") : "Select Water Sports"}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                <div className="p-2 text-sm">
                                    <p className="text-black mb-2">Select Number of People</p>
                                    {Object.keys(WATER_SPORT_COSTS).map((sport) => {
                                        const perDay = ["Paddleboarding", "Kayaking", "Snorkeling", "Fishing"].includes(sport);
                                        return (
                                            <label key={sport} className="flex items-center justify-between py-1 mb-2 px-2 hover:bg-gray-100 cursor-pointer">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={waterSport.includes(sport as WaterSport)}
                                                        onChange={() => handleCheckboxChange(sport as WaterSport)}
                                                        className="h-4 w-4"
                                                    />
                                                    <span className="text-sm">{sport} (${WATER_SPORT_COSTS[sport]} {perDay ? 'per day' : 'per hour'})</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="6"
                                                    value={sportPeople[sport] || 0}
                                                    onChange={(e) => {
                                                        const value = Math.min(Number(e.target.value), 6);
                                                        setSportPeople((prev) => ({
                                                            ...prev,
                                                            [sport]: isNaN(value) ? 0 : value,
                                                        }));
                                                    }}
                                                    className="border rounded-md px-2 py-0.5 text-sm w-12 ml-2"
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date and Time Selection */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Waiting time removed from pricing calculations per updated rules */}

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Booking Date</label>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={handleDateChange}
                                min={new Date().toISOString().split("T")[0]}
                                className="p-2 border rounded-md w-full"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-black mb-1">Pickup Time</label>
                            <select
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="p-2 border rounded-md w-full"
                            >
                                <option value="">Select time</option>
                                {timeSlots.map((time) => (
                                    <option key={time} value={time} disabled={unavailableSlots.has(time)}>
                                        {time} {unavailableSlots.has(time) ? "(Unavailable)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="h-64 relative mt-4">
                        <BoatRampsMap />
                    </div>
                </div>

                {/* Booking Summary Panel */}
                <div className="relative bg-[#d4f1f4] border bg-opacity-20 w-full shadow-lg py-4 px-2 rounded-lg space-y-6 col-span-2 md:col-span-1">
                    <div className="flex flex-col gap-4 px-2 py-2">
                        <div className="flex-1 text-black">
                            <h3 className="text-lg font-semibold text-[#003b73] mb-4">Booking Details</h3>
                            <p className="flex justify-between pb-2"><span>Rental Option:</span> {rentalOption}</p>
                            <p className="flex justify-between pb-2"><span>Pickup:</span> {pickupName}</p>
                            <p className="flex justify-between pb-2"><span>Drop-off:</span> {destinationName}</p>
                            <p className="flex justify-between pb-2"><span>Distance:</span> {distance.toFixed(2)} km</p>
                            <p className="flex justify-between pb-2"><span>Pricing Type:</span> {pricingType}</p>
                            <p className="flex justify-between pb-2"><span>People:</span> {people}</p>
                        </div>

                        <div className="flex-1 text-black">
                            <h4 className="text-lg text-[#003b73] font-semibold mb-4">Booking Summary</h4>

                            {/* Boat Rental with Hours */}
                            {boatRentalCount > 0 && (
                                <div className="pb-3 border-b border-gray-200">
                                    <p className="flex justify-between font-medium text-gray-800">
                                        <span>Boat Rental:</span>
                                        <span>{boatRentalCount} x {pricingType}</span>
                                    </p>
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>Duration:</span>
                                        <span>
                                            {pricingType === "Hourly" ? `${hourlyDurationBoat} hour${hourlyDurationBoat > 1 ? 's' : ''}` :
                                                pricingType === "Half Day" ? "4 hours" :
                                                    "8 hours"}
                                        </span>
                                    </div>
                                    <p className="flex justify-between font-semibold text-gray-900 mt-2">
                                        <span>Cost:</span>
                                        <span>
                                            ${(() => {
                                                if (pricingType === "Hourly") {
                                                    const hrs = Number(hourlyDurationBoat) || 1;
                                                    if (hrs <= 1) return BOAT_PRICING[1];
                                                    if (hrs === 3) return BOAT_PRICING[3];
                                                    if (hrs >= 6) return BOAT_PRICING[6];
                                                    if (hrs > 1 && hrs < 3) return BOAT_PRICING[3];
                                                    if (hrs > 3 && hrs < 6) return BOAT_PRICING[6];
                                                    return 0;
                                                }
                                                return pricingType === "Half Day" ? BOAT_PRICING[3] : BOAT_PRICING[6];
                                            })()}
                                        </span>
                                    </p>
                                </div>
                            )}

                            {/* Jet Skis with Hours */}
                            {jetSkisCount > 0 && (
                                <div className="pb-3 border-b border-gray-200">
                                    <p className="flex justify-between font-medium text-gray-800">
                                        <span>Jet Skis:</span>
                                        <span>{jetSkisCount} x {pricingType}</span>
                                    </p>
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>Duration:</span>
                                        <span>
                                            {pricingType === "Hourly" ? `${hourlyDurationJetSki} hour${hourlyDurationJetSki > 1 ? 's' : ''}` :
                                                pricingType === "Half Day" ? "4 hours" :
                                                    "8 hours"}
                                        </span>
                                    </div>
                                    <p className="flex justify-between font-semibold text-gray-900 mt-2">
                                        <span>Cost:</span>
                                        <span>
                                            ${jetSkisCount * (
                                                pricingType === "Hourly" ? (hourlyDurationJetSki === 0.25 ? 50 : hourlyDurationJetSki === 0.5 ? 75 : JET_SKI_RATE_PER_HOUR * hourlyDurationJetSki) :
                                                    pricingType === "Half Day" ? JET_SKI_RATE_PER_HOUR * 4 :
                                                        JET_SKI_RATE_PER_HOUR * 8
                                            )}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        $120/hour per jet ski (15m = $50, 30m = $75)
                                    </p>
                                </div>
                            )}
                            {/* Water Sports */}
                            {waterSport.length > 0 && (
                                <div className="pb-3 border-b border-gray-200">
                                    <p className="font-medium text-gray-800 mb-2">Water Sports:</p>
                                    {waterSport.map((sport) => {
                                        const participants = Math.min(sportPeople[sport] || 1, 6);
                                        const perDay = ["Paddleboarding", "Kayaking", "Snorkeling", "Fishing"].includes(sport);
                                        return (
                                            <div key={sport} className="mb-2 last:mb-0">
                                                <p className="flex justify-between text-sm">
                                                    <span>{sport} (x{participants})</span>
                                                    <span>${(participants) * WATER_SPORT_COSTS[sport]}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 text-right">
                                                    ${WATER_SPORT_COSTS[sport]} {perDay ? 'per day' : 'per hour'}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Total Hours Summary */}
                            {(boatRentalCount > 0 || jetSkisCount > 0) && pricingType === "Hourly" && (
                                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800 text-center">
                                        ⏱️ Total Rental Time:
                                    </p>
                                    <div className="flex justify-center gap-4 mt-1">
                                        {boatRentalCount > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Boat: {hourlyDurationBoat}h
                                            </span>
                                        )}
                                        {jetSkisCount > 0 && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Jet Skis: {hourlyDurationJetSki}h
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Discount Section */}
                    <div className="flex flex-col">
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={isPuertoRico}
                                onChange={(e) => setIsPuertoRico(e.target.checked)}
                                className="border-[#003b73] w-fit ml-2 mr-2"
                            />
                            <span className="text-xs text-[#003b73]">Exclusive 5% Discount for Puerto Rico Residents</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter discount code"
                                className="border p-2 rounded-lg w-full text-sm"
                            />
                            <button
                                onClick={applyDiscount}
                                className="bg-[#003b73] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#005a8e]"
                                disabled={loading || !code}
                            >
                                {loading ? "Applying..." : "Apply"}
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        {discount !== null && (
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-green-500 text-xs">Discount Applied: {discount}% off!</p>
                                <button
                                    onClick={() => setDiscount(null)}
                                    className="text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Total Cost */}
                    <div className="border-t pt-4">
                        <div className="mb-3">
                            <p className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Subtotal:</span>
                                <span>${(totalCost / (1 - (discount || 0) / 100) / (isPuertoRico ? 0.95 : 1)).toFixed(2)}</span>
                            </p>
                            {isPuertoRico && (
                                <p className="flex justify-between text-sm text-green-600 mb-1">
                                    <span>PR Resident Discount (5%):</span>
                                    <span>-${((totalCost / (1 - (discount || 0) / 100)) * 0.05).toFixed(2)}</span>
                                </p>
                            )}
                            {discount !== null && (
                                <p className="flex justify-between text-sm text-green-600 mb-1">
                                    <span>Promo Discount ({discount}%):</span>
                                    <span>-${((totalCost / (1 - discount / 100)) * (discount / 100)).toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                        <p className="flex justify-between font-semibold text-lg border-t pt-3">
                            <strong>Total Cost:</strong> ${totalCost.toFixed(2)}
                        </p>
                        {totalCost > 650 && (
                            <p className="text-green-600 text-sm mt-2">✓ Includes complimentary amenities: water, sodas, beer, floaties, snorkelling gear, fishing gear, underwater GoPro and drone photos/videos</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{errorMessage}</div>
                    )}

                    {/* Confirm Booking Button */}
                    <div className="flex justify-center">
                        <button
                            className="w-full bg-green-500 text-white py-3 hover:bg-green-700 transition-all rounded-lg font-semibold"
                            onClick={handleConfirmBooking}
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookNow;