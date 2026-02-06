import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Define the shape of the state
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
  rentalType?: string; // "Jet Ski" | "Boat" | "Boat+Jet Ski"
  rentalOption: string;
  hourlyDurationJetSki: number;
  sportPeople: Record<string, number>;
}

// Initial state
const initialState: BookingState = {
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
  rentalType: "",
  rentalOption: "",
  email: "",
  bookingId: '',
  hourlyDurationJetSki: 0,
  sportPeople: {
    boat: 1,
    jet: 1,
    water: 1,
  },
};

// Create a slice
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    updateBookingState: (state, action: PayloadAction<Partial<BookingState>>) => {
      const updatedState = { ...state, ...action.payload };
      // Save updated state to localStorage
      localStorage.setItem("bookingState", JSON.stringify(updatedState));
      return updatedState;
    },
    resetBookingState: () => {
      // Clear localStorage on reset
      localStorage.removeItem("bookingState");
      return initialState;
    },
  },
});

// Export actions
export const { updateBookingState, resetBookingState } = bookingSlice.actions;

// Configure store
const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer,
  },
});

// Typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
