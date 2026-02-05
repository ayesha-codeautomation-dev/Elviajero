"use client"
import Link from "next/link";
import React from "react";
import { Link as ScrollLink } from "react-scroll";

const Footer = () => {
  return (
    <footer className="bg-[#f5f1eb] py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/faq">FAQ</Link></li>
              <li> <Link href="/privacy-policy"> Privacy Policy</Link></li>
              <li><Link href="/safety-information"> Safety Information</Link></li>
              <li><Link href="/disclaimer"> Disclaimer</Link></li>
            </ul>
          </div>
          {/* Experiences */}
          <div>
            <h3 className="text-lg font-bold mb-4">Experiences</h3>
            <ul className="space-y-2 text-gray-600">
              <ScrollLink
                to="boat"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <li className="cursor-pointer mb-2">
                  Boat Rental
                </li>
              </ScrollLink>
              <ScrollLink
                to="jet"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <li className="cursor-pointer mb-2">
                  Jet Ski Rental
                </li>
              </ScrollLink>
              <ScrollLink
                to="water"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <li className="cursor-pointer mb-2">Water Sports</li>
              </ScrollLink>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="text-lg font-bold mb-4">Popular Destinations</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Culebra</li>
              <li>Vieques</li>
              <li>Icacos Islands</li>
              <li>Isla Palominos</li>
              <li>Mar Chiquita</li>
              <li>Playa Buye</li>
              <li>Crash Boat Beach</li>

            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">24/7 Live Support</h3>
            <ul className="space-y-2 text-gray-600">
              <li>+1 787 988-9321</li>
              <li>eduard@elviajeropr.com</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        {/* <div className="border-t border-gray-300 my-8"></div> */}

        {/* Bottom Section */}
        {/* <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
          <div className="text-center md:text-left">
            <p className="text-gray-600 mb-3">
              Real reviews from happy El Viajero.
            </p>
            <p className=" flex flex-row text-gray-800 font-bold">
              <img src="/star.png" alt="star" className="h-4 pr-4 -mb-3 " />
              <span className="-mt-1">  4.9 out of 5! 500,000+ reviews</span>
            </p>
          </div>

        </div> */}

        {/* Social Media and Legal */}
        <div className="border-t border-gray-300 my-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm space-y-4 md:space-y-0">
          {/* Logo */}
          <div>
            <p>© El Viajero 2025</p>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/profile.php?id=61578483729063"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/facebook.png" alt="Facebook" className="w-8" />
            </a>
            <a
              href="https://www.instagram.com/el_viajero_pr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/instagram.png" alt="Instagram" className="w-8" />
            </a>
            <a
              href="https://wa.me/17879889321"
              target="_blank"
              rel="noopener noreferrer"
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
