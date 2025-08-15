"use client"

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

function EventsSection() {
  // Sample events data
  const events = [
    {
      id: 1,
      title: "Sri Krishna Janmashtami Celebration",
      description: "The appearance day of Lord Krishna, who the Vedic scriptures describe as the Supreme Lord, in this world is known as Janmashtami...",
      date: "15-16 Aug 2025",
      image: "/GaurNitai.jpg",
      tag: "SRI KRISHNA JANMASHTAMI"
    },
    {
      id: 2,
      title: "Radhashtami Celebration",
      description: "Celebrating the appearance day of Srimati Radharani, the divine consort of Lord Krishna...",
      date: "5 Sep 2025",
      image: "/RadhaKrishna.jpeg",
      tag: "RADHASTHAMI"
    },
    {
      id: 3,
      title: "Diwali Festival",
      description: "The festival of lights celebrating Lord Rama's return to Ayodhya and the victory of light over darkness...",
      date: "21 Oct 2025",
      image: "/GaurNitai.jpg",
      tag: "DIWALI"
    }
  ];

  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const nextEvent = () => {
    setCurrentEventIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevEvent = () => {
    setCurrentEventIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const currentEvent = events[currentEventIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-purple-600 mb-6">Events & Festivals</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Upcoming events and celebrations in the temple</p>
        </div>

        {/* Events Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows - Only show if there are multiple events */}
          {events.length > 1 && (
            <>
              <button 
                onClick={prevEvent}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>

              <button 
                onClick={nextEvent}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
                aria-label="Next event"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Featured Event Card */}
          <div className="overflow-hidden shadow-xl rounded-lg bg-white">
            <div className="flex flex-col lg:flex-row">
              {/* Event Image */}
              <div className="lg:w-1/3 relative h-64 lg:h-auto">
                <Image
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentEvent.tag}
                </div>
              </div>

              {/* Event Content */}
              <div className="lg:w-2/3 p-8 lg:p-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {currentEvent.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {currentEvent.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center text-purple-600 mb-6 sm:mb-0">
                    <Calendar className="h-6 w-6 mr-3" />
                    <span className="text-xl font-semibold">{currentEvent.date}</span>
                  </div>
                  <button className="text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg font-medium bg-transparent rounded-md">
                    Know more
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* See All Events Button */}
        <div className="text-center mt-12">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
            See All Events
          </button>
        </div>
      </div>
    </section>
  );
}

export default EventsSection;