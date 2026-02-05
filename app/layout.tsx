import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavigationBar from "./components/navigation";
import Footer from "./components/footer";
import { Providers } from "./provider";

// Import Poppins font with weights 400, 500, 600, 700
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins", // Variable for easier management
});

export const metadata: Metadata = {
  title: "El Viajero - Boat Rentals, Jet Skis, and Water Sports Adventures",
  description: "Discover unforgettable water adventures with El Viajero! Rent boats, jet skis, and explore thrilling water sports activities. Book now for an exceptional experience on the water.",
  keywords: [
    "boat rentals",
    "jet ski rentals",
    "water sports activities",
    "adventure on water",
    "family-friendly water sports",
    "affordable boat rentals",
    "rent a jet ski near me",
    "explore the ocean",
    "water sports booking platform",
    "vacation activities on water"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`} // Apply Poppins font here
      >
        <Providers>
          <NavigationBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
