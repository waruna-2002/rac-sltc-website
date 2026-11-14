"use client";

import React from "react";
import { motion } from "framer-motion";

// Stagger container for heading
const headingContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

// Smooth drop-down entrance physics identical to Home Hero Banner
const dropDownWordVariants = {
  hidden: {
    opacity: 0,
    y: -75,
    filter: "blur(8px)",
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 85,
      mass: 0.85,
    },
  },
};

export default function AnimatedPageHeader({
  badge,
  title = "",
  highlightWord,
  subtitle,
  children,
  align = "center",
  showDivider = true,
  ambientGlow = true,
  className = "",
}) {
  const words = typeof title === "string" ? title.trim().split(/\s+/) : [];

  return (
    <div className={`relative max-w-4xl ${align === "center" ? "mx-auto text-center" : "text-left"} ${className}`}>
      {/* Ambient Breathing Deep-Pink/Burgundy Glow Layer identical to Home Banner */}
      {ambientGlow && (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[500px] sm:w-[750px] h-[280px] sm:h-[380px] bg-[radial-gradient(circle_at_center,_rgba(230,0,126,0.22)_0%,_rgba(139,15,75,0.18)_40%,_transparent_75%)] blur-[95px] rounded-full pointer-events-none -z-0"
        />
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Eyebrow / Category Badge */}
        {badge && (
          <motion.p
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#ff4d94] uppercase mb-4"
          >
            {badge}
          </motion.p>
        )}

        {/* Main Headline with Staggered Drop-Down Entrance */}
        <motion.h1
          variants={headingContainerVariants}
          initial="hidden"
          animate="visible"
          className={`font-serif text-3xl sm:text-5xl lg:text-6xl font-light sm:font-normal tracking-[0.12em] sm:tracking-[0.2em] uppercase text-white leading-tight flex flex-wrap items-center ${
            align === "center" ? "justify-center" : "justify-start"
          } gap-x-2.5 sm:gap-x-4 select-none`}
        >
          {words.map((word, i) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9&]/g, "").toLowerCase();
            const cleanHighlight = highlightWord ? highlightWord.toLowerCase() : null;
            const isHighlighted = cleanHighlight
              ? cleanWord === cleanHighlight
              : i === words.length - 1;

            return (
              <motion.span
                key={`${word}-${i}`}
                variants={dropDownWordVariants}
                className={
                  isHighlighted
                    ? "inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e] drop-shadow-[0_0_35px_rgba(230,0,126,0.6)] font-normal"
                    : "inline-block text-slate-100"
                }
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtitle / Narrative Description */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="text-slate-300 text-xs sm:text-sm md:text-base mt-4 font-light leading-relaxed max-w-2xl mx-auto tracking-[0.04em]"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Refined Horizontal Neon Accent Line */}
        {showDivider && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.75, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className={`relative my-6 w-full max-w-xs ${
              align === "center" ? "mx-auto" : ""
            } flex items-center justify-center select-none`}
            aria-hidden="true"
          >
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#e6007e]/60 to-transparent" />
          </motion.div>
        )}

        {/* Optional Actions / Filters Slot */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
