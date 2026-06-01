import Link from "next/link";
import { client } from "@/sanity/lib/client";
import React from "react";

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
  const faqs: FAQ[] = await getData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#01294f] to-[#0d4a82] text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-[2rem] border border-slate-700 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-amber-200/20">
              Helpful answers for your next booking
            </span>
            <h1 className="mt-6 text-4xl font-semibold text-white">Frequently Asked Questions</h1>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-lg leading-8">
              Explore our most asked questions about boat rentals, jet skis, water activities, and what to expect on your day trip.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq: FAQ, index: number) => (
                <details key={index} className="group overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-950/80 p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                    <span>{faq.question}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-slate-950 transition duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-5 text-slate-300 leading-7">{faq.answer}</p>
                </details>
              ))
            ) : (
              <p className="text-slate-300">No FAQs available at the moment.</p>
            )}
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-amber-300/20 bg-[#003b73]/10 p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Still have a question?</h2>
                <p className="mt-2 text-slate-300">Our support team is standing by to help with custom trips, group bookings, and availability.</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
              >
                Contact us now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
