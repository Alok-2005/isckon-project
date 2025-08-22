"use client"

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 relative">
              <Image 
                src="/iskcon.jpg" 
                alt="ISKCON Logo" 
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ISKCON Shri Gauranga Dham</h1>
              <p className="text-xs text-gray-600">International Society for Krishna Consciousness</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium">About</Link>
            <Link href="/temple" className="text-gray-700 hover:text-purple-600 font-medium">Temple</Link>
            <Link href="/base" className="text-gray-700 hover:text-purple-600 font-medium">Base</Link>
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium">Events</Link>
            <Link href="/glimpses" className="text-gray-700 hover:text-purple-600 font-medium">Glimpse</Link>
            {/* <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">More</Link> */}
            <Link 
              href="/payment" 
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Donation
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="px-4 py-4 space-y-4 flex flex-col">
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
              <Link href="about" className="text-gray-700 hover:text-purple-600 font-medium">About</Link>
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">Temple</Link>
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">GuestHouse</Link>
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">Media</Link>
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">Donate</Link>
              <Link href="#" className="text-gray-700 hover:text-purple-600 font-medium">More</Link>
              <Link 
                href="#" 
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center"
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;