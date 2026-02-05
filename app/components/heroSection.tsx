import React from "react";

export default function HeroSection() {
  return (
    <section className="relative h-[87vh] overflow-hidden">
      <img
        src="/hero-img.webp"
        alt="Boat rentals and water sports in Puerto Rico"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="hero-font text-3xl font-extrabold text-white leading-tight">
          The Best Boat Rentals, Jet Skis, and Water Sports in Puerto Rico
        </h1>

        <p className="hero-font mt-2 text-3xl font-extrabold text-white leading-tight">
          Search, book, and enjoy unforgettable water experiences tailored for your soul
        </p>
      </div>
    </section>
  );
}
