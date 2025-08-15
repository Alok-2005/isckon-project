"use client";
import Navbar from "./Navbar";
import Hero from "./Hero";
import EventsSection from "./Event";
import Glimpse from "./Glimpse";
import ReasonSection from "./Reason";
import DiscoverMore from "./programs";
import Footer from "./Footer";

function HomePage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <EventsSection />
      <Glimpse/>
      <ReasonSection/>
      <DiscoverMore/>
      <Footer/>
    </div>
  );
}

export default HomePage;
