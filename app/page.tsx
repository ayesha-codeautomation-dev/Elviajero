import React, { Suspense } from "react";
import HeroSection from "./components/heroSection";

const BookNow = React.lazy(() => import("./components/bookNow"));
const BoatRental = React.lazy(() => import("./components/boatRental"));
const JetSkisSection = React.lazy(() => import("./components/jetSkis"));
const WaterSportsSection = React.lazy(() => import("./components/waterSports"));
const CommunitySelection = React.lazy(() => import("./components/community"));
const RecentReviews = React.lazy(() => import("./components/recentReviews"));

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ABOVE THE FOLD */}
      <HeroSection />

      {/* BELOW THE FOLD */}
      <Suspense fallback={null}>
        <BookNow />
        <BoatRental />
        <JetSkisSection />
        <WaterSportsSection />
        <CommunitySelection />
        <RecentReviews />
      </Suspense>
    </div>
  );
}

