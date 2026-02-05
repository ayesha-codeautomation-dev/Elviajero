"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Link as ScrollLink } from "react-scroll";

export default function NavigationBar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="bg-white border-b shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 md:h-[60px] h-[60px]">

          {/* Mobile Logo */}
          <div className="block md:hidden absolute -top-1 left-4 z-10">
            <Link href="/" className="flex items-center">
                <img
                  src="/logo-desk-1.png"
                  alt="Logo"
                  className="h-[110px] w-auto"
                />
              </Link>
          </div>

          {/* Mobile Menu Button on the right side */}
          <div className="md:hidden flex items-center ml-auto">
            <div
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-700"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-between text-center max-w-[1100px] w-full mx-auto relative">
            {/* Left Side Links */}
            <div className="flex items-center space-x-16">
              <ScrollLink
                to="boat"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div className="text-black cursor-pointer hover:text-[#e17b38] font-medium transition-colors duration-200">
                  Boat Rental
                </div>
              </ScrollLink>
              <ScrollLink
                to="jet"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div className="text-black cursor-pointer hover:text-[#e17b38] font-medium transition-colors duration-200">
                  JetSkis
                </div>
              </ScrollLink>
              <ScrollLink
                to="water"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div className="text-black cursor-pointer hover:text-[#e17b38] font-medium transition-colors duration-200">
                  Water Sports
                </div>
              </ScrollLink>
            </div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 z-10">
              <Link href="/" className="flex items-center">
                <img
                  src="/logo-desk-1.png"
                  alt="Logo"
                  className="h-[120px] w-auto"
                />
              </Link>
            </div>

            {/* Right Side Links */}
            <div className="flex items-center space-x-16 -ml-8 justify-start">
              <Link href="/faq" className="text-black cursor-pointer hover:text-[#e17b38] font-medium transition-colors duration-200">
                FAQ
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <div className="text-black cursor-pointer hover:text-[#e17b38] font-medium duration-200 flex items-center space-x-3">
                  <img src="/flag.png" alt="Flag" className="w-6 h-6" />
                  <span>Translate</span>
                </div>
              </div>

              <Link href="/contact" className="text-black cursor-pointer hover:text-[#e17b38] font-medium transition-colors duration-200">
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Sidebar (Mobile Menu) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="fixed top-0 left-0 w-64 bg-white h-full shadow-lg transform transition-transform duration-300">
            <div className="flex justify-between items-center p-4 border-b">
              <h2>Menu</h2>
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-700 cursor-pointer"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <ScrollLink
                to="boat"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              > <div
                className="block cursor-pointer mt-2  mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                  Boat Rental
                </div>
              </ScrollLink>
              <ScrollLink
                to="jet"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div
                  className="block cursor-pointer mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  JetSkis Rental
                </div>
              </ScrollLink>
              <ScrollLink
                to="water"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div
                  className="block  cursor-pointer mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Water Sports
                </div>
              </ScrollLink>
              <Link
              href="/faq"
                className="block cursor-pointer  mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                FAQ
              </Link>
              <ScrollLink
                to="book"
                spy={true}
                smooth={true}
                offset={-50}
                duration={500}
              >
                <div
                  className=" flex flex-row space-x-2 block cursor-pointer  mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <img src="/flag.png" alt="Flag" className="w-6 h-6" />
                  <span>Translate</span>
                </div>
              </ScrollLink>

              <Link
              href="/contact"
                className="block cursor-pointer  mb-6 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
