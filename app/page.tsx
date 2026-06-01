import React from "react";
import HeroSection from "./components/heroSection";
import HashScroll from "./components/HashScroll";
import BookNow from "./components/bookNow";
import BoatRental from "./components/boatRental";
import JetSkisSection from "./components/jetSkis";
import WaterSportsSection from "./components/waterSports";
import CommunitySelection from "./components/community";
import RecentReviews from "./components/recentReviews";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HashScroll />
      {/* ABOVE THE FOLD */}
      <HeroSection />

      {/* BELOW THE FOLD */}
      <BookNow />
      <BoatRental />
      <JetSkisSection />
      <WaterSportsSection />
      <CommunitySelection />
      <RecentReviews />
    </div>
  );
}

