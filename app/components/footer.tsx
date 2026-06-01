"use client"
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Link as ScrollLink } from "react-scroll";

const sectionLinks = [
  { label: "Boat Rental", id: "boat" },
  { label: "Jet Ski Rental", id: "jet" },
  { label: "Water Sports", id: "water" },
];

const Footer = () => {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const currentYear = new Date().getFullYear();

  const renderSectionLink = (label: string, id: string) => {
    if (isHome) {
      return (
        <ScrollLink
          to={id}
          spy={true}
          smooth={true}
          offset={-50}
          duration={500}
          className="cursor-pointer hover:text-amber-300 transition-colors"
        >
          {label}
        </ScrollLink>
      );
    }

    return (
      <Link
        href={`/#${id}`}
        className="cursor-pointer hover:text-amber-300 transition-colors"
      >
        {label}
      </Link>
    );
  };

  return (
    <footer className="bg-[#01294f] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">About</h3>
            <ul className="space-y-2 text-slate-200">
              <li>
                <Link href="/faq" className="hover:text-amber-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safety-information" className="hover:text-amber-300 transition-colors">
                  Safety Information
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-amber-300 transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">Experiences</h3>
            <ul className="space-y-2 text-slate-200">
              {sectionLinks.map((section) => (
                <li key={section.id} className="hover:text-amber-300 transition-colors">
                  {renderSectionLink(section.label, section.id)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">Popular Destinations</h3>
            <ul className="space-y-2 text-slate-200">
              <li>Culebra</li>
              <li>Vieques</li>
              <li>Icacos Islands</li>
              <li>Isla Palominos</li>
              <li>Mar Chiquita</li>
              <li>Playa Buye</li>
              <li>Crash Boat Beach</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-200">24/7 Live Support</h3>
            <ul className="space-y-2 text-slate-200">
              <li>+1 787 988-9321</li>
              <li>eduard@elviajeropr.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-600 my-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center text-slate-300 text-sm space-y-4 md:space-y-0">
          <div>
            <p>© El Viajero {currentYear}</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61578483729063"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors"
            >
              <img src="/facebook.png" alt="Facebook" className="w-8" />
            </a>
            <a
              href="https://www.instagram.com/el_viajero_pr/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors"
            >
              <img src="/instagram.png" alt="Instagram" className="w-8" />
            </a>
            <a
              href="https://wa.me/17879889321"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors"
            >
              <img src="/whatsapp.png" alt="WhatsApp" className="w-8" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
