// Comprehensive pricing and availability configuration based on Excel sheet

export const LOCATIONS = {
  PICKUPS: ["San Juan", "Luquillo", "Fajardo", "Ceiba", "Naguabo"],
  BOAT_DESTINATIONS: ["Icacos", "Palomino", "Piñero", "Culebra"],
};

// Jet Ski pricing: location -> available durations IN MINUTES
export const JET_SKI_AVAILABILITY: Record<string, Record<number, number>> = {
  "San Juan": {
    60: 120, // 1 hour only
  },
  "Luquillo": {
    30: 75,  // 30 minutes
    60: 120, // 1 hour
  },
  "Fajardo": {
    15: 50,  // 15 minutes
    30: 75,  // 30 minutes
    60: 120, // 1 hour
  },
  "Ceiba": {
    30: 75,  // 30 minutes
    60: 120, // 1 hour
  },
  "Naguabo": {
    15: 50,  // 15 minutes
    30: 75,  // 30 minutes
    60: 120, // 1 hour
  },
};

// Boat pricing: always use standard rates per hour duration
export const BOAT_HOURLY_RATES: Record<number, number> = {
  1: 150,
  2: 300,
  3: 350,
  4: 500,
  5: 600,
  6: 650,
  7: 750,
  8: 850,
  9: 960, // Extrapolated from pattern
};

// Boat availability: pickup -> destination -> min duration (hours)
export const BOAT_AVAILABILITY: Record<string, Record<string, number>> = {
  "San Juan": {
    "Icacos": 3,
    "Palomino": 3,
    "Piñero": 3,
    "Culebra": 6,
  },
  "Luquillo": {
    "Icacos": 1,
    "Palomino": 1,
    "Piñero": 3,
    "Culebra": 6,
  },
  "Fajardo": {
    "Icacos": 1,
    "Palomino": 1,
    "Piñero": 3,
    "Culebra": 6,
  },
  "Ceiba": {
    "Icacos": 3,
    "Palomino": 3,
    "Piñero": 1,
    "Culebra": 6,
  },
  "Naguabo": {
    "Icacos": 3,
    "Palomino": 3,
    "Piñero": 3,
    "Culebra": 6,
  },
};

// Boat + Jet Ski Package Pricing from Excel
export const BOAT_JETSKI_PACKAGE_PRICES: Record<string, Record<number, Record<string, { min: number; max: number }>>> = {
  "San Juan": {
    1: { // 1 jet ski
      "Icacos": { min: 710, max: 1370 },
      "Palomino": { min: 710, max: 1370 },
      "Piñero": { min: 710, max: 1370 },
      "Culebra": { min: 1370, max: 1370 }, // Only 6 hours
    },
    2: { // 2 jet skis
      "Icacos": { min: 1070, max: 2090 },
      "Palomino": { min: 1070, max: 2090 },
      "Piñero": { min: 1070, max: 2090 },
      "Culebra": { min: 2090, max: 2090 }, // Only 6 hours
    },
    3: { // 3 jet skis
      "Icacos": { min: 1430, max: 2810 },
      "Palomino": { min: 1430, max: 2810 },
      "Piñero": { min: 1430, max: 2810 },
      "Culebra": { min: 2810, max: 2810 }, // Only 6 hours
    },
  },
  "Luquillo": {
    1: {
      "Icacos": { min: 270, max: 1370 },
      "Palomino": { min: 270, max: 1370 },
      "Piñero": { min: 710, max: 1370 },
      "Culebra": { min: 1370, max: 1370 },
    },
    2: {
      "Icacos": { min: 390, max: 2090 },
      "Palomino": { min: 390, max: 2090 },
      "Piñero": { min: 1070, max: 2090 },
      "Culebra": { min: 2090, max: 2090 },
    },
    3: {
      "Icacos": { min: 510, max: 2810 },
      "Palomino": { min: 510, max: 2810 },
      "Piñero": { min: 1430, max: 2810 },
      "Culebra": { min: 2810, max: 2810 },
    },
  },
  "Fajardo": {
    1: {
      "Icacos": { min: 270, max: 1370 },
      "Palomino": { min: 270, max: 1370 },
      "Piñero": { min: 710, max: 1370 },
      "Culebra": { min: 1370, max: 1370 },
    },
    2: {
      "Icacos": { min: 390, max: 2090 },
      "Palomino": { min: 390, max: 2090 },
      "Piñero": { min: 1070, max: 2090 },
      "Culebra": { min: 2090, max: 2090 },
    },
    3: {
      "Icacos": { min: 510, max: 2810 },
      "Palomino": { min: 510, max: 2810 },
      "Piñero": { min: 1430, max: 2810 },
      "Culebra": { min: 2810, max: 2810 },
    },
  },
  "Ceiba": {
    1: {
      "Icacos": { min: 710, max: 1370 },
      "Palomino": { min: 710, max: 1370 },
      "Piñero": { min: 270, max: 1370 },
      "Culebra": { min: 1370, max: 1370 },
    },
    2: {
      "Icacos": { min: 1070, max: 2090 },
      "Palomino": { min: 1070, max: 2090 },
      "Piñero": { min: 390, max: 2090 },
      "Culebra": { min: 2090, max: 2090 },
    },
    3: {
      "Icacos": { min: 1430, max: 2810 },
      "Palomino": { min: 1430, max: 2810 },
      "Piñero": { min: 510, max: 2810 },
      "Culebra": { min: 2810, max: 2810 },
    },
  },
  "Naguabo": {
    1: {
      "Icacos": { min: 710, max: 1370 },
      "Palomino": { min: 710, max: 1370 },
      "Piñero": { min: 710, max: 1370 },
      "Culebra": { min: 1370, max: 1370 },
    },
    2: {
      "Icacos": { min: 1070, max: 2090 },
      "Palomino": { min: 1070, max: 2090 },
      "Piñero": { min: 1070, max: 2090 },
      "Culebra": { min: 2090, max: 2090 },
    },
    3: {
      "Icacos": { min: 1430, max: 2810 },
      "Palomino": { min: 1430, max: 2810 },
      "Piñero": { min: 1430, max: 2810 },
      "Culebra": { min: 2810, max: 2810 },
    },
  },
};

// Working hours
export const WORKING_HOURS = {
  "Mon-Thu": { open: 9, close: 17 }, // 9 AM - 5 PM
  "Fri-Sun": { open: 9, close: 18 }, // 9 AM - 6 PM
};

// Jet ski water sports available
export const JET_SKI_WATER_SPORTS = ["Fishing", "Snorkelling"];

// Boat water sports available
export const BOAT_WATER_SPORTS = ["Paddleboarding", "Kayaking", "Snorkelling", "Fishing", "Wakeboarding"];

// Water sports pricing (per day for most, per hour for wakeboarding)
export const WATER_SPORT_COSTS: Record<string, { cost: number; unit: string }> = {
  "Paddleboarding": { cost: 40, unit: "per day" },
  "Kayaking": { cost: 50, unit: "per day" },
  "Snorkelling": { cost: 30, unit: "per day" },
  "Fishing": { cost: 40, unit: "per day" },
  "Wakeboarding": { cost: 70, unit: "per hour" },
};

// Tax rate
export const TAX_RATE = 0.115; // 11.5%

// Capacity limits
export const CAPACITY = {
  BOAT_ONLY: 6,
  BOAT_1_JETSKI: 8,
  BOAT_2_JETSKIS: 10,
  BOAT_3_JETSKIS: 12,
  JETSKI_PER_UNIT: 2,
};

// Complimentary amenities threshold
export const COMPLIMENTARY_AMENITIES_THRESHOLD = 650;
export const COMPLIMENTARY_AMENITIES = [
  "Water, sodas, beer",
  "Floaties and snorkelling gear",
  "Fishing gear",
  "Underwater GoPro and drone photos/videos",
];

// Booking policies
export const BOOKING_POLICIES = [
  "All bookings can be customized to your needs and to many other destinations as long as there is availability and all safety regulations are abided by at all times.",
  "Jet skis to be returned by sunset.",
  "Boat will only navigate in waves up to 5ft, winds up to 20mph.",
  "We recommend island hopping jet ski tours to be taken with more than 1 jet ski.",
];

export function getDayType(date: Date): "Mon-Thu" | "Fri-Sun" {
  const day = date.getDay();
  // day: 0 = Sunday, 1 = Monday, ... 6 = Saturday
  if (day === 0 || day === 6) return "Fri-Sun"; // Sunday, Saturday
  return "Mon-Thu"; // Monday-Friday
}

export function getAvailableDurations(rentalType: "jetski" | "boat", pickup: string, destination?: string): number[] {
  if (rentalType === "jetski") {
    const available = JET_SKI_AVAILABILITY[pickup];
    return available ? Object.keys(available).map(Number).sort((a, b) => a - b) : [];
  } else if (rentalType === "boat" && destination) {
    const minDuration = BOAT_AVAILABILITY[pickup]?.[destination];
    if (minDuration) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d >= minDuration);
    }
  }
  return [];
}

// Updated: Get jet ski durations in minutes
export function getAvailableJetSkiDurations(pickup: string): number[] {
  const availability = JET_SKI_AVAILABILITY[pickup] || {};
  return Object.keys(availability)
    .map(Number)
    .filter(dur => availability[dur] !== undefined)
    .sort((a, b) => a - b);
}

// Updated: Calculate jet ski price manually according to requirements
export function calculateJetSkiPriceManual(numJetSkis: number, durationHours: number, pickup: string): number {
  // Convert hours to minutes for jet ski calculations
  const durationMinutes = durationHours * 60;
  
  // Get available durations for this pickup location
  const availableDurations = getAvailableJetSkiDurations(pickup);
  
  // If duration is exactly 15, 30, or 60 minutes, use fixed pricing
  if (durationMinutes === 15 && availableDurations.includes(15)) {
    return 50 * numJetSkis;
  } else if (durationMinutes === 30 && availableDurations.includes(30)) {
    return 75 * numJetSkis;
  } else if (durationMinutes === 60 && availableDurations.includes(60)) {
    // 1 hour = $120
    return 120 * numJetSkis;
  } else if (durationMinutes > 60) {
    // Over 1 hour: $120 for first hour + $120 for each additional hour
    const fullHours = Math.ceil(durationHours);
    return (120 + (Math.max(0, fullHours - 1) * 120)) * numJetSkis;
  }
  
  // Fallback: $120 per hour
  return 120 * durationHours * numJetSkis;
}

// Calculate boat price using manual rates
export function calculateBoatPriceManual(hours: number): number {
  return BOAT_HOURLY_RATES[hours] || hours * 108; // Fallback average rate
}

// Calculate Boat + Jet Ski package price from Excel data
export function calculateBoatJetSkiPackagePrice(
  pickup: string,
  destination: string,
  durationHours: number,
  numJetSkis: number
): number {
  // Check if we have package pricing for this combination
  const packagePrices = BOAT_JETSKI_PACKAGE_PRICES[pickup]?.[numJetSkis]?.[destination];
  
  if (!packagePrices) {
    return 0; // Will trigger fallback calculation
  }
  
  const { min, max } = packagePrices;
  
  // For Culebra, it's always 6 hours fixed price
  if (destination === "Culebra") {
    return max; // Fixed price for 6 hours
  }
  
  // For other destinations, interpolate between min and max based on duration
  // Min price is for minimum duration (1 or 3 hours), max price is for 6 hours
  const minDuration = BOAT_AVAILABILITY[pickup]?.[destination] || 1;
  
  if (durationHours <= minDuration) {
    return min;
  } else if (durationHours >= 6) {
    return max;
  } else {
    // Linear interpolation between min and max
    const progress = (durationHours - minDuration) / (6 - minDuration);
    return Math.round(min + (max - min) * progress);
  }
}

// Get minimum duration based on pickup and destination
export function getMinimumDuration(pickup: string, destination: string): number {
  return BOAT_AVAILABILITY[pickup]?.[destination] || 1;
}

// Get max people for rental type
export function getMaxPeopleForRentalType(rentalType: string, numJetSkis: number): number {
  switch (rentalType) {
    case "Jet Ski":
      return numJetSkis * 2; // 2 per jet ski
    case "Boat":
      return 6; // Paying passengers only (boat capacity 10, but only 6 paying)
    case "Boat+Jet Ski":
      // max.8 for boat+1jet ski, max.10 for boat+ 2jet skis, max.12 for boat +3 jet skis
      return 6 + (numJetSkis * 2); // 6 from boat + 2 per jet ski
    default:
      return 1;
  }
}

// Update water sport pricing
export function calculateWaterSportPrice(sport: string, numPeople: number): number {
  const sportInfo = WATER_SPORT_COSTS[sport];
  if (!sportInfo) return 0;
  
  // For now, all water sports charged per person
  return numPeople * sportInfo.cost;
}

// Original function kept for compatibility
export function calculateJetSkiPrice(numJetSkis: number, durationHours: number): number {
  return calculateJetSkiPriceManual(numJetSkis, durationHours, "Fajardo"); // Default to Fajardo for compatibility
}

// Original function kept for compatibility
export function calculateBoatPrice(durationHours: number): number {
  return calculateBoatPriceManual(durationHours);
}

export function canSelectTime(pickupTime: number, durationHours: number, dayType: "Mon-Thu" | "Fri-Sun"): boolean {
  const hours = WORKING_HOURS[dayType];
  const endTime = pickupTime + durationHours;
  return endTime <= hours.close;
}

export function formatMonthShort(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
}

export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDate();
  const month = formatMonthShort(date);
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

// NEW: Get extended jet ski durations beyond 1 hour
export function getExtendedJetSkiDurations(): number[] {
  // 1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h, 9h max
  return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

// NEW: Convert minutes to hours for display
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

// NEW: Convert hours to minutes for calculation
export function hoursToMinutes(hours: number): number {
  return hours * 60;
}

// NEW: Check if duration is available for jet ski at location
export function isJetSkiDurationAvailable(pickup: string, durationMinutes: number): boolean {
  const available = JET_SKI_AVAILABILITY[pickup];
  if (!available) return false;
  
  // For durations over 1 hour, all are available as long as 1 hour is available
  if (durationMinutes > 60) {
    return available[60] !== undefined;
  }
  
  // For 15, 30, 60 minutes, check specific availability
  return available[durationMinutes] !== undefined;
}