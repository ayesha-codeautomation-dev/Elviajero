import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import React from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);
type Location = {
  name: string;
  image: string;
};


async function getData() {
  const query = `*[_type == 'gallery'][0]{
    galleryHeading,
    locations[]{
      name,
      "image": image.asset->url
    }
  }`;
  try {
    const fetchData = await client.fetch(query);
    return fetchData || {};
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}

export default async function CommunitySelection() {
  const data = await getData();
  const locations: Location[] = data?.locations || [];

  return (
    <div id="gallery" className="bg-white px-2 py-16 md:pb-16">
      {/* Section Title */}
          {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            {data.galleryHeading || "Photo Gallery"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our collection of stunning locations and memorable experiences
          </p>
        </div>

      {/* Grid Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 max-w-7xl h-full mt-6 mx-auto">
      {locations.map((location: Location, index: number) => (          <div
            key={index}
            className={`${
              index === 0 || index === 5 ? "col-span-2 row-span-1" : "col-span-1"
            } relative overflow-hidden rounded-lg group shadow-md hover:shadow-lg transition-shadow bg-white ${
              index === 0 ? "h-[600px]" : index === 5 ? "h-[400px]" : "h-full"
            }`}
          >
            <img
              src={urlFor(location.image).url()}
              alt={location.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-30"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-lg lg:text-xl font-semibold">{location.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
