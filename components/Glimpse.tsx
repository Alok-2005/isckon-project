"use client"

import Image from "next/image";
import { useEffect, useRef } from "react";

function TempleGlimpses() {
  const originalEvents = [
    {
      id: 1,
      title: "5th-10th Aug, Jhulan Ya...",
      date: "Aug 10, 2025",
      image: "/GaurNitai.jpg"
    },
    {
      id: 2,
      title: "Lord Jagannath's Divine ...",
      date: "Jul 05, 2025",
      image: "/GaurNitai.jpg"
    },
    {
      id: 3,
      title: "Narsimha Chaturdashi C...",
      date: "May 11, 2025",
      image: "/GaurNitai.jpg"
    }
  ];

  // Duplicate the events to create seamless looping
  const events = [...originalEvents, ...originalEvents];
  const animationRef = useRef<number>();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollSpeed = 1; // Adjust this value to change speed

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let animationId: number;
    let isScrolling = true;

    const scrollContent = () => {
      if (!content) return;
      
      // Reset the position when we've scrolled one full width of original content
      if (content.scrollLeft >= (content.scrollWidth / 2)) {
        content.scrollLeft = 0;
      } else {
        content.scrollLeft += scrollSpeed;
      }
      
      animationId = requestAnimationFrame(scrollContent);
    };

    // Start the animation
    animationId = requestAnimationFrame(scrollContent);

    // Pause on hover
    const handleMouseEnter = () => {
      isScrolling = false;
      cancelAnimationFrame(animationId);
    };
    
    const handleMouseLeave = () => {
      isScrolling = true;
      animationId = requestAnimationFrame(scrollContent);
    };

    content.addEventListener('mouseenter', handleMouseEnter);
    content.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      content.removeEventListener('mouseenter', handleMouseEnter);
      content.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-purple-600 mb-4">A few glimpses from the ground</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Captures from what happening in and around the temple and what our devotees are up to.
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative w-full overflow-hidden py-4">
          <div 
            ref={contentRef}
            className="flex overflow-x-auto scrollbar-hide whitespace-nowrap"
            style={{
              scrollBehavior: 'auto',
            }}
          >
            {events.map((event, index) => (
              <div 
                key={`${event.id}-${index}`} 
                className="inline-block mx-4 w-80 flex-shrink-0 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Event Image */}
                <div className="relative h-64">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Event Info */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{event.title}</h3>
                  <p className="text-gray-600">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors">
            View More Glimpses
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default TempleGlimpses;