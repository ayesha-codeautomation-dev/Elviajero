import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { PortableText, PortableTextReactComponents } from "next-sanity";
import React from "react";

// Define the type for a Portable Text block
interface PortableTextBlock {
  _type: string;
  children: Array<{
    _type: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _key: string;
    _type: string;
    [key: string]: string; // Additional mark definition properties
  }>;
  style?: string;
}
interface LinkMark {
    href: string;
    blank?: boolean; // Indicates if the link should open in a new tab
  }
  
  interface ImageValue {
    alt: string; // Ensure this is a string
    asset: { _ref: string };
  }
  

// Define the type for the privacy policy data
interface PrivacyPolicyData {
  title: string;
  description: string;
  content: PortableTextBlock[]; // Matches the "content" type in your schema
}

// Fetch the privacy policy data
async function getPrivacyPolicyData(): Promise<PrivacyPolicyData | null> {
  const query = `*[_type == 'privacyPolicy'][0]`;
  try {
    const data = await client.fetch(query);
    return data || null; // Use null when there's no data
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Return null on error
  }
}


// Custom PortableText component configuration
const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }: { value: ImageValue }) => (
      <img
        className="object-cover w-full h-full rounded-3xl"
        src={urlFor(value).url()}
        alt={value.alt || "Default Alt Text"} // Provide a fallback if `alt` is undefined
        />
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc ml-5">{children}</ul>
    ),
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: LinkMark }) => {
      const target = value?.blank ? "_blank" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          style={{ color: "blue", textDecoration: "underline" }} // Custom color for links
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-4xl font-bold mb-4 text-gray-700">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-3xl font-semibold mb-4 text-gray-700">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-gray-700 mb-4">{children}</p>
    ),
  },
};

export default async function PrivacyPolicy() {
  const data = await getPrivacyPolicyData();
  const { title, description, content } = data as PrivacyPolicyData;

  return (
    <div className="min-h-screen bg-teal-50 py-10 px-6">
      <div className="max-w-3xl mt-10 mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#003b73] mb-6">{title}</h1>
        <p className="text-center text-gray-700 mb-10">{description}</p>

        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          {content?.map((block, index) => (
            <div key={index}>
              {block && <PortableText value={block} components={portableTextComponents} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
