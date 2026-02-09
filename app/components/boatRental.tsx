"use client";

import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { useState, useEffect } from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

type BoatRental = {
  price: string;
  description: string;
  title: string;
  name: string;
  image: {
    url: string;
    alt: string;
  };
};

export default function BoatRental() {
  const [data, setData] = useState<{ boats?: BoatRental[]; sectionTitle?: string; sectionDescription?: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == 'boatRental'][0]`;
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

  const boatRental: BoatRental[] = data?.boats || [];

  if (loading) {
    return (
      <section id="boat" className="bg-gray-50 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b73] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading boat rentals...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="boat" className="bg-gray-50 py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Elegant Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            {data.sectionTitle || "Boat Rentals"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {data.sectionDescription || "Explore beautiful destinations around Puerto Rico with our private boat charters."}
          </p>
        </div>

        {/* Boat Grid - Redesigned Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boatRental.map((boat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={urlFor(boat.image).url()}
                  alt={boat.image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {boat.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {boat.description}
                  </p>
                </div>

                {/* Price Section - Separate from buttons */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Starting from
                  </div>
                  <div className="text-2xl font-medium text-gray-900">
                    {boat.price}
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
              What&apos;s Included
            </h3>
            <p className="text-gray-600">
              Every boat rental includes essential features for your safety and comfort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Safety Equipment</h4>
              <p className="text-sm text-gray-600">Life jackets and safety gear provided</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Experienced Captain</h4>
              <p className="text-sm text-gray-600">Local guide familiar with the area</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h6v-4h6a2 2 0 002-2V6a2 2 0 00-2-2H4zm10 6h4a2 2 0 012 2v4a2 2 0 01-2 2h-6v-4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6v4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Flexible Duration</h4>
              <p className="text-sm text-gray-600">1-9 hours, based on destination</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Local Knowledge</h4>
              <p className="text-sm text-gray-600">Best routes and hidden spots</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Link
            href="#book"
            className="inline-block bg-[#003b73] text-white px-8 py-4 rounded-lg hover:bg-[#005a8e] transition-colors duration-300 font-medium"
          >
            Start Your Booking
          </Link>
          <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
            Book online or contact us for custom charters and special requests
          </p>
        </div>
      </div>
    </section>
  );
}