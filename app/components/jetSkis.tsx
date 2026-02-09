"use client";

import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { useState, useEffect } from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

type JetSki = {
  price: string;
  description: string;
  title: string;
  name: string;
  image: {
    url: string;
    alt: string;
  };
};

export default function JetSkisSection() {
  const [data, setData] = useState<{ jetSkis?: JetSki[]; sectionTitle?: string; sectionDescription?: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == 'jetSkiRental'][0]`;
        const fetchData = await client.fetch(query);
        setData(fetchData || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const jetSkis: JetSki[] = data?.jetSkis || [];

  if (loading) {
    return (
      <section id="jet" className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b73] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jet ski rentals...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="jet" className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            {data.sectionTitle || "Jet Ski Rentals"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {data.sectionDescription || "Experience the thrill of riding through crystal clear waters with our jet ski rentals."}
          </p>
        </div>

        {/* Jet Ski Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jetSkis.map((jetSki, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors duration-300 bg-white"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={urlFor(jetSki.image).url()}
                  alt={jetSki.image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {jetSki.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {jetSki.description}
                  </p>
                </div>

                {/* Price Section - Separate from buttons */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Starting from</div>
                  <div className="text-2xl font-medium text-gray-900">
                    {jetSki.price}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Max 2 people per unit
                  </div>
                </div>

                {/* Button Section - Separate row */}
                <div className="flex gap-3">
                  <Link
                    href="#book"
                    className="flex-1 bg-[#003b73] text-white text-center py-3 rounded hover:bg-[#005a8e] transition-colors duration-300 font-medium"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              Jet Ski Features
            </h3>
            <p className="text-gray-600">
              Everything you need for a safe and exciting jet ski adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Safety Briefing</h4>
              <p className="text-sm text-gray-600">Complete safety instruction before each ride</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Life Jackets</h4>
              <p className="text-sm text-gray-600">High-quality life jackets for all sizes</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Modern Fleet</h4>
              <p className="text-sm text-gray-600">Well-maintained, latest model jet skis</p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Jet Ski Information
          </h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Jet skis must be returned by sunset</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>We recommend island hopping tours with more than 1 jet ski</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Available durations vary by pickup location</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Working hours: Mon-Thu 9AM-5PM, Fri-Sun 9AM-6PM</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link
            href="#book"
            className="inline-flex items-center bg-gradient-to-r from-[#003b73] to-[#005a8e] text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Book Your Jet Ski Adventure
          </Link>
          <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
            Select from 15-minute thrill rides to full-day adventures
          </p>
        </div>
      </div>
    </section>
  );
}