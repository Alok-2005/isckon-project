"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";

function TempleGlimpses() {
  const originalEvents = [
    {
      id: 1,
      title: "5th-10th Aug, Jhulan Ya...",
      date: "Aug 10, 2025",
      image: "/GaurNitai.jpg",
    },
    {
      id: 2,
      title: "Lord Jagannath's Divine ...",
      date: "Jul 05, 2025",
      image: "/GaurNitai.jpg",
    },
    {
      id: 3,
      title: "Narsimha Chaturdashi C...",
      date: "May 11, 2025",
      image: "/GaurNitai.jpg",
    },
  ];

  const events = [...originalEvents, ...originalEvents, ...originalEvents];
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const translateXRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const scrollSpeed = 0.5; // Adjust speed as needed
    const cardWidth = 320 + 32; // card width + margin
    const resetPoint = originalEvents.length * cardWidth;

    const animate = () => {
      if (!isPausedRef.current && content) {
        translateXRef.current -= scrollSpeed;

        if (Math.abs(translateXRef.current) >= resetPoint) {
          translateXRef.current = 0;
        }

        content.style.transform = `translateX(${translateXRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    content.addEventListener("mouseenter", handleMouseEnter);
    content.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      content.removeEventListener("mouseenter", handleMouseEnter);
      content.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [originalEvents.length]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-purple-600 mb-4">
            A few glimpses from the ground
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Captures from what happening in and around the temple and what our
            devotees are up to.
          </p>
        </div>

        <div className="relative w-full overflow-hidden py-4">
          <div
            ref={contentRef}
            className="flex transition-none will-change-transform"
            style={{
              width: "fit-content",
            }}
          >
            {events.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="mx-4 w-80 flex-shrink-0 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Event Image */}
                <div className="relative h-64">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Event Info */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-600">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link 
  href="/glimpses"
  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
>
  View More Glimpses
  <svg
    className="ml-2 w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
</Link>
        </div>
      </div>
    </section>
  );
}

export default TempleGlimpses;
