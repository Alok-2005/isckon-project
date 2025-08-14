"use client";
import Navbar from "./Navbar";
import Hero from "./Hero";
import EventsSection from "./Event";
import Glimpse from "./Glimpse";

function HomePage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <EventsSection />
      <Glimpse/>
    </div>
  );
}

export default HomePage;
