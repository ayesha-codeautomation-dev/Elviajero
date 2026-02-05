import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import React from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

type boatRental = {
  price: string;
  description: string;
  title: string;
  name: string;
  image: {
    url: string;
    alt: string;
  };
};

async function getData() {
  const query = `*[_type == 'boatRental'][0]`;
  try {
    const fetchData = await client.fetch(query);
    return fetchData || {};
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}
export default async function BoatRental() {
  const data = await getData();
  const boatRental: boatRental[] = data?.boats || [];

  return (
    <section id="boat" className="bg-white mb-8 px-4 py-6 md:pt-4">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#003b73]">{data.sectionTitle}</h2>
        <p className="text-gray-600 mt-3">{data.sectionDescription}</p>
      </div>


      {/* Boat Grid */}

      <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {boatRental.map((boat, index) => (
          <div key={index}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <img
              src={urlFor(boat.image).url()}
              alt={boat.image.alt}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#003b73]">
                {boat.title}
              </h3>
              <p className="text-gray-800 mt-2">{boat.description}</p>
              <p className="text-blue-800 font-bold mt-2">{boat.price}</p>
            </div>
          </div>

        ))}

      </div>

    </section>
  );
};
