import { client } from "@/sanity/lib/client";
import React from "react";

// Define the type for the FAQ data
interface FAQ {
  question: string;
  answer: string;
}

async function getData() {
  const query = `*[_type == 'faq']{question, answer}`;
  try {
    const fetchData = await client.fetch(query);
    return fetchData || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function FAQ() {
  const faqs: FAQ[] = await getData(); // Type the fetched data as FAQ[]

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-4xl bg-blue-50 rounded-2xl shadow-2xl px-6 py-6 mt-10 mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#003b73] mb-6">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq: FAQ, index: number) => ( // Explicitly type 'faq' and 'index'
              <div key={index} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700">{faq.question}</h2>
                <p className="text-gray-700 mt-2">{faq.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-700">No FAQs available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
