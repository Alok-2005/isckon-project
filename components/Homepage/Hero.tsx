"use client";

import { Phone, Navigation, Play } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type FlowerConfig = {
  size: number;
  duration: number;
  delay: number;
  flower: string;
  x: number;
  rotate: number;
};

function Hero() {
  const flowers = ["❀", "✿", "🌸", "💮", "🏵️", "🌼", "🌺", "🌻"];

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [flowerConfigs, setFlowerConfigs] = useState<FlowerConfig[]>([]);

  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Handle resize
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    // Generate flower configs only once (stable random values)
    const configs: FlowerConfig[] = [...Array(30)].map(() => ({
      size: Math.random() * 20 + 10,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      flower: flowers[Math.floor(Math.random() * flowers.length)],
      x: Math.random() * window.innerWidth,
      rotate: Math.random() * 360,
    }));
    setFlowerConfigs(configs);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/GaurNitai.jpg"
          alt="Shri Gauranga Temple"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      {/* Flower Rain */}
      <div className="absolute inset-0 overflow-hidden">
        {windowSize.width > 0 &&
          flowerConfigs.map((cfg, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-200/70"
              style={{
                left: `${Math.random() * 100}%`,
                fontSize: `${cfg.size}px`,
                top: "-50px",
              }}
              initial={{
                y: -50,
                x: cfg.x,
                rotate: cfg.rotate,
                opacity: 0,
              }}
              animate={{
                y: windowSize.height + 50,
                rotate: Math.random() * 360,
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: cfg.duration,
                repeat: Infinity,
                delay: cfg.delay,
                ease: "linear",
              }}
            >
              {cfg.flower}
            </motion.div>
          ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Welcome Text */}
        <motion.h2
          className="text-2xl md:text-3xl font-medium text-white/90 mt-44"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to
        </motion.h2>

        {/* Temple Name */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 text-shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
            Shri
          </span>{" "}
          <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            Gauranga Dham
          </span>
        </motion.h1>

        {/* Status Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-2xl max-w-md w-full border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-lg font-semibold text-gray-800">
              OPEN - Next: Sandhya Arati @19:00
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">Open all days from</p>
          <p className="text-gray-500 text-xs mb-4">
            4:30 am - 1 pm | 4:15 pm - 9 pm IST
          </p>
          <button className="text-purple-600 text-sm font-medium hover:underline hover:text-purple-700 transition-colors">
            View Temple Schedule →
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button className="bg-green-600/90 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/20">
            <Phone className="h-5 w-5" />
            <span>Call Us</span>
          </button>
          <button className="bg-blue-600/90 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/20">
            <Navigation className="h-5 w-5" />
            <span>Navigate</span>
          </button>
          <button className="bg-purple-600/90 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20">
            <Play className="h-5 w-5" />
            <span>Watch LIVE</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
