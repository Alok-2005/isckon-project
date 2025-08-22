"use client"
import { useState } from 'react';
import Image from 'next/image';
import Navbar from "../../components/Homepage/Navbar";
import Footer from "../../components/Homepage/Footer";

const GlimpseGrid = () => {
  const [images] = useState([
    { id: 1, src: '/RadhaKrishna.jpeg', title: 'Radha Krishna Celebration' },
    { id: 2, src: '/RadhaKrishna.jpeg', title: 'Temple Festival' },
    { id: 3, src: '/RadhaKrishna.jpeg', title: 'Bhajan Night' },
    { id: 4, src: '/RadhaKrishna.jpeg', title: 'Community Gathering' },
    { id: 5, src: '/RadhaKrishna.jpeg', title: 'Spiritual Discourse' },
    { id: 6, src: '/RadhaKrishna.jpeg', title: 'Festival Preparation' },
    { id: 7, src: '/RadhaKrishna.jpeg', title: 'Cultural Performance' },
    { id: 8, src: '/RadhaKrishna.jpeg', title: 'Prayer Ceremony' },
    { id: 9, src: '/RadhaKrishna.jpeg', title: 'Youth Event' },
    { id: 10, src: '/RadhaKrishna.jpeg', title: 'Charity Work' },
    { id: 11, src: '/RadhaKrishna.jpeg', title: 'Meditation Session' },
    { id: 12, src: '/RadhaKrishna.jpeg', title: 'Annual Celebration' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      
      <div className="max-w-7xl container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-800 mb-4">
            Glimpse of Old Events
          </h1>
          <p className="text-purple-600 max-w-2xl mx-auto text-lg">
            Relive the beautiful memories from our past events and celebrations
          </p>
        </div>
        
        {/* Uniform Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 
                         hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-purple-500"
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk9kISqWyDdUfjVdrUBo3UURpLa4n//Z"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-transparent to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                              flex items-end p-4">
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-lg">{image.title}</h3>
                    <p className="text-sm text-purple-200">Event #{image.id}</p>
                  </div>
                </div>
                
                {/* Quick view button */}
                <button className="absolute top-3 right-3 bg-white/90 text-purple-700 p-2 rounded-full 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                  hover:bg-white hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
       
      </div>
      <Footer/>
    </div>
  );
};

export default GlimpseGrid;