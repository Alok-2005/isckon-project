"use client"

import { Facebook, Twitter, Youtube, Instagram } from "lucide-react"
import Image from "next/image"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-6">
        
          {/* ISKCON Info with Logo */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <Image 
                src="/iskcon.jpg" 
                alt="ISKCON Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <h2 className="text-2xl font-bold">ISKCON</h2>
            </div>
            <p className="text-gray-300 text-center md:text-left">
              International Society for Krishna Consciousness<br />
              Hare Krishna Land, Juhu, Mumbai - 400049
            </p>
          </div>

          {/* Office Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-2">Head Office of ISKCON India</h3>
            <p className="text-gray-300">
              Hare Krishna Land, Juhu, Mumbai - 400049, India<br />
              Registered under Maharashtra Public Trust Act 1950<br />
              vide Registration No. F-2179 (Bom)
            </p>
          </div>

          {/* Founder Info with Image */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Founder-Acharya</h3>
            <p className="text-gray-300 text-center mb-3">
              His Divine Grace<br />
              A.C. Bhaktivedanta Swami Prabhupada
            </p>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold-500">
              <Image
                src="/gurudev.jpg"
                alt="A.C. Bhaktivedanta Swami Prabhupada"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-4"></div>

        {/* Bottom Section - Responsive Stacking */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright - Always first on mobile */}
          <p className="text-gray-400 order-1 sm:order-none">© 2024 ISKCON Guranga Dham, Pune</p>
          
          {/* Contact Links - Center on mobile */}
          <div className="flex flex-col sm:flex-row items-center gap-4 order-3 sm:order-none mt-4 sm:mt-0">
            <a href="mailto:shrigaurangadham@gmail.com" className="text-gray-400 hover:text-white transition-colors">
              shrigaurangadham@gmail.com
            </a>
            <a href="/policies" className="text-gray-400 hover:text-white transition-colors">
              Policies of Usage
            </a>
          </div>
          
          {/* Social Icons - Last on mobile */}
          <div className="flex gap-4 order-2 sm:order-none">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer