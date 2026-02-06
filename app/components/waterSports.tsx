"use client";

import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { useState, useEffect } from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

type WaterSport = {
  price: string;
  description: string;
  title: string;
  name: string;
  image: {
    url: string;
    alt: string;
  };
};

export default function WaterSportsSection() {
  const [data, setData] = useState<{ waterSports?: WaterSport[]; sectionTitle?: string; sectionDescription?: string }>({});
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `*[_type == 'waterSports'][0]`;
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

  const waterSports: WaterSport[] = data?.waterSports || [];

  // Handle view details click
  const handleAddToBooking = (sportTitle: string) => {
    // Scroll to booking section
    const bookSection = document.getElementById('book');
    if (bookSection) {
      bookSection.scrollIntoView({ behavior: 'smooth' });
      console.log(`Add to booking: ${sportTitle}`);
      // Could add logic to pre-select this water sport in the booking form
    }
  };

  if (loading) {
    return (
      <section id="water" className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b73] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading water sports...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="water" className="bg-gray-50 py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            {data.sectionTitle || "Water Sports"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {data.sectionDescription || "Add exciting water sports activities to your boat or jet ski rental experience."}
          </p>
        </div>

        {/* Water Sports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {waterSports.map((sport, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={urlFor(sport.image).url()}
                  alt={sport.image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {sport.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {sport.description}
                  </p>
                </div>

                {/* Price Section - Separate from buttons */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                  <div className="text-2xl font-medium text-gray-900">
                    {sport.price}
                  </div>
                </div>

                {/* Button Section - Separate row */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToBooking(sport.title)}
                    className="flex-1 bg-[#003b73] text-white py-3 rounded hover:bg-[#005a8e] transition-colors duration-300 font-medium"
                  >
                    Add to Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              How Water Sports Work
            </h3>
            <p className="text-gray-600">
              Add these activities to your boat or jet ski rental for enhanced fun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
              <h4 className="font-medium text-gray-900 mb-2">Book Your Rental</h4>
              <p className="text-sm text-gray-600">
                First, book your boat or jet ski rental
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
              <h4 className="font-medium text-gray-900 mb-2">Add Activities</h4>
              <p className="text-sm text-gray-600">
                Select water sports during the booking process
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
              <h4 className="font-medium text-gray-900 mb-2">Enjoy & Explore</h4>
              <p className="text-sm text-gray-600">
                Equipment will be provided with your rental
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link
            href="#book"
            className="inline-flex items-center bg-gradient-to-r from-[#003b73] to-[#005a8e] text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Start Your Booking With Activities
          </Link>
          <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
            All water sports activities can be added during the booking process
          </p>
        </div>
      </div>
    </section>
  );
}