import { client } from "@/sanity/lib/client";
import React from "react";

// Define the type for safety details
interface SafetyDetail {
  title: string;
  description: string;
  icon: string;
}

async function getData() {
  const query = `*[_type == 'safetyInformation'][0]`;
  try {
    const fetchData = await client.fetch(query);
    return fetchData || {};
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
}

export default async function SafetyInformation() {
  const data = await getData();
  const { heading, description, safetyDetails }: { heading: string; description: string; safetyDetails: SafetyDetail[] } = data;

  return (
    <div className="min-h-screen bg-teal-50 py-10 px-6">
      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-4xl font-bold text-center text-[#003b73] mb-6">
          {heading}
        </h1>
        <p className="text-center text-gray-700 mb-10">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyDetails?.map((item: SafetyDetail, index: number) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h2 className="text-xl font-semibold text-[#003b73]">{item.title}</h2>
              <p className="text-gray-600 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
