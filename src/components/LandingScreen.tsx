"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BackgroundOrbs } from "./BackgroundOrbs";

interface LandingScreenProps {
  onNext: () => void;
}

export function LandingScreen({ onNext }: LandingScreenProps) {
  const transitioned = useRef(false);

  const handleTransition = () => {
    if (transitioned.current) return;
    transitioned.current = true;
    onNext();
  };

  useEffect(() => {
    // 4 seconds auto-transition
    const timer = setTimeout(() => {
      handleTransition();
    }, 4000);

    // Scroll and click event listeners
    const handleEvent = () => {
      handleTransition();
    };

    window.addEventListener("click", handleEvent);
    window.addEventListener("wheel", handleEvent, { passive: true });
    window.addEventListener("touchmove", handleEvent, { passive: true });
    // Support basic keyboard scroll hints like Space or Down arrow
    window.addEventListener("keydown", handleEvent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleEvent);
      window.removeEventListener("wheel", handleEvent);
      window.removeEventListener("touchmove", handleEvent);
      window.removeEventListener("keydown", handleEvent);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-sunset-gradient-1 px-6 select-none cursor-pointer">
      {/* Floating Ambient Orbs */}
      <BackgroundOrbs />

      {/* Hero content wrapper */}
      <div className="relative z-10 text-center max-w-4xl flex flex-col items-center justify-center gap-6">
        {/* Main Heading: SRMConnect */}
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="font-playfair text-6xl md:text-8xl lg:text-9xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-[#FFC4B1] to-[#F27F3D] select-none filter drop-shadow-[0_4px_12px_rgba(88,67,108,0.3)]"
        >
          SRMConnect
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="font-inter text-lg md:text-2xl lg:text-3xl font-light text-[#FFC4B1]/90 max-w-3xl leading-relaxed tracking-wide px-4"
        >
          A LinkedIn-like Academic Networking and Project Collaboration Platform
        </motion.p>
      </div>

      {/* Pulse Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center justify-center"
      >
        <span className="pulse-indicator font-inter text-sm md:text-base font-medium text-sunset-peach tracking-widest uppercase flex flex-col items-center gap-2">
          <span>Scroll or click to continue</span>
          <span className="text-xl">↓</span>
        </span>
      </motion.div>
    </div>
  );
}
