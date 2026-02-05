import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import React from "react";

// Function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
const urlFor = (source: SanityImageSource) => builder.image(source);

type jetSki = {
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
  const query = `*[_type == 'jetSkiRental'][0]`;
  try {
    const fetchData = await client.fetch(query);
    return fetchData || {};
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}
export default async function JetSkisSection() {
  const data = await getData();
  const jetSkis: jetSki[] = data?.jetSkis || [];

  return (
    <section id="jet" className="bg-white px-4 py-6 md:pt-4">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#003b73]">{data.sectionTitle}</h2>
        <p className="text-gray-600 mt-3">{data.sectionDescription}</p>
      </div>

      {/* Jet Skis Grid */}

      <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-3 gap-8">

        {jetSkis.map((jetSki, index) => (

          <div key={index}
            className="bg-white shadow-md  rounded-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <img
              src={urlFor(jetSki.image).url()}
              alt={jetSki.image.alt}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#003b73]">
                {jetSki.title}
              </h3>
              <p className="text-gray-600 mt-2">{jetSki.description}</p>
              <p className="text-blue-800 font-bold mt-2">{jetSki.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

