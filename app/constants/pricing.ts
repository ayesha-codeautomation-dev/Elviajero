// Comprehensive pricing and availability configuration based on Excel sheet

export const LOCATIONS = {
  PICKUPS: ["San Juan", "Luquillo", "Fajardo", "Ceiba", "Naguabo"],
  BOAT_DESTINATIONS: ["Icacos", "Palomino", "Piñero", "Culebra"],
};

// Jet Ski pricing: location -> available durations
export const JET_SKI_AVAILABILITY: Record<string, Record<number, number>> = {
  "San Juan": {
    // not available
  },
  "Luquillo": {
    0.5: 75,   // 30 mins
    1: 120,
    2: 240,
    3: 360,
    4: 480,
    5: 600,
    6: 720,
    7: 840,
    8: 960,
    9: 1080,
  },
  "Fajardo": {
    0.25: 50,  // 15 mins
    0.5: 75,   // 30 mins
    1: 120,
    2: 240,
    3: 360,
    4: 480,
    5: 600,
    6: 720,
    7: 840,
    8: 960,
    9: 1080,
  },
  "Ceiba": {
    0.5: 75,   // 30 mins
    1: 120,
    2: 240,
    3: 360,
    4: 480,
    5: 600,
    6: 720,
    7: 840,
    8: 960,
    9: 1080,
  },
  "Naguabo": {
    0.25: 50,  // 15 mins
    0.5: 75,   // 30 mins
    1: 120,
    2: 240,
    3: 360,
    4: 480,
    5: 600,
    6: 720,
    7: 840,
    8: 960,
    9: 1080,
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
  9: 960,
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

export function calculateJetSkiPrice(numJetSkis: number, durationHours: number): number {
  return numJetSkis * (durationHours === 0.25 ? 50 : durationHours === 0.5 ? 75 : 120 * durationHours);
}

export function calculateBoatPrice(durationHours: number): number {
  return BOAT_HOURLY_RATES[durationHours] || 0;
}

export function calculateWaterSportPrice(sport: string, numPeople: number): number {
  const sportInfo = WATER_SPORT_COSTS[sport];
  if (!sportInfo) return 0;
  // For now, all water sports charged per person (day or hour unit is informational)
  return numPeople * sportInfo.cost;
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
