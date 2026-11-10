"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Mobile-Optimized Global Floating Ambient Aurora Background
 * - Lightweight GPU-accelerated transforms
 * - Scaled blur radius and orb sizes for mobile battery and frame rate (smooth 60fps)
 * - Calibrated opacity to ensure maximum text readability on phone screens
 * - Strict overflow & touch-none to prevent mobile horizontal wobble
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none touch-none"
    >
      {/* Orb 1: Primary Rotaract Cranberry / Magenta (Floating Top-Left) */}
      <motion.div
        animate={{
          x: ["-5%", "12%", "-3%", "-5%"],
          y: ["-8%", "8%", "-4%", "-8%"],
          scale: [1, 1.12, 0.96, 1],
          opacity: [0.32, 0.48, 0.35, 0.32],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/4 w-[320px] sm:w-[650px] lg:w-[900px] h-[320px] sm:h-[600px] lg:h-[800px] rounded-full blur-[65px] sm:blur-[130px] lg:blur-[150px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(230,0,126,0.35) 0%, rgba(184,0,101,0.18) 50%, transparent 80%)",
        }}
      />

      {/* Orb 2: Royal Purple / Deep Violet (Floating Bottom-Right) */}
      <motion.div
        animate={{
          x: ["8%", "-12%", "6%", "8%"],
          y: ["10%", "-10%", "8%", "10%"],
          scale: [1.06, 0.94, 1.1, 1.06],
          opacity: [0.22, 0.38, 0.28, 0.22],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute bottom-0 right-1/4 translate-x-1/3 translate-y-1/4 w-[280px] sm:w-[600px] lg:w-[850px] h-[280px] sm:h-[550px] lg:h-[750px] rounded-full blur-[70px] sm:blur-[140px] lg:blur-[160px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(147,51,234,0.28) 0%, rgba(107,33,168,0.16) 50%, transparent 80%)",
        }}
      />

      {/* Orb 3: Deep Burgundy / Crimson Wine Accent (Floating Center Drift) */}
      <motion.div
        animate={{
          x: ["-6%", "8%", "-10%", "-6%"],
          y: ["8%", "-10%", "6%", "8%"],
          scale: [0.95, 1.12, 0.98, 0.95],
          opacity: [0.18, 0.34, 0.22, 0.18],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[500px] lg:w-[750px] h-[240px] sm:h-[450px] lg:h-[650px] rounded-full blur-[75px] sm:blur-[140px] lg:blur-[170px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at center, rgba(219,39,119,0.25) 0%, rgba(131,24,67,0.15) 50%, transparent 75%)",
        }}
      />

      {/* Mobile-Friendly Floor Glow */}
      <div
        className="absolute -bottom-24 sm:-bottom-40 left-1/2 -translate-x-1/2 w-[95vw] max-w-[1200px] h-[200px] sm:h-[350px] rounded-full blur-[80px] sm:blur-[160px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230,0,126,0.3) 0%, rgba(126,34,206,0.2) 50%, transparent 75%)",
        }}
      />
    </div>
  );
}
