"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getStoredSiteContent } from "@/lib/siteStore";

export default function HeroSection() {
  const [site, setSite] = useState({
    heroTitle: "ROTARACT CLUB OF SLTC",
    heroSubtitle: "Ignite Potential • Inspire Impact • Serve with Passion",
    districtBadge: "Rotaract District 3220 • Sri Lanka & Maldives",
    heroButtonText: "JOIN US NOW",
  });

  useEffect(() => {
    setSite(getStoredSiteContent());

    const handleUpdate = (e) => {
      if (e.detail) {
        setSite((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener("rotaract_site_content_updated", handleUpdate);

    // Fetch dynamic content from MongoDB settings API
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSite((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch((err) => console.log("Hero settings API fallback:", err));

    return () => window.removeEventListener("rotaract_site_content_updated", handleUpdate);
  }, []);

  // Split title into words for the graceful drop-down entrance
  const titleString = site.heroTitle || "ROTARACT CLUB OF SLTC";
  const words = titleString.trim().split(/\s+/);
  const midPoint = words.length > 2 ? 2 : 1;
  const line1Words = words.slice(0, midPoint);
  const line2Words = words.slice(midPoint);

  // Stagger container for heading
  const headingContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  // Smooth drop-down entrance physics
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

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-32 pb-24 overflow-hidden bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(53,11,36,0.55)_0%,rgba(27,5,19,0.35)_40%,transparent_80%)] group">
      {/* Ambient Breathing Deep-Maroon/Burgundy Glow Layer 1 */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.38, 0.65, 0.38],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[950px] lg:w-[1150px] h-[450px] sm:h-[600px] bg-[radial-gradient(circle_at_center,_rgba(230,0,126,0.32)_0%,_rgba(139,15,75,0.28)_38%,_rgba(60,6,35,0.18)_65%,_transparent_80%)] blur-[110px] rounded-full pointer-events-none -z-0"
      />

      {/* Ambient Breathing Harmonic Layer 2 */}
      <motion.div
        animate={{
          scale: [1.12, 0.96, 1.12],
          opacity: [0.22, 0.44, 0.22],
        }}
        transition={{
          duration: 9.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[700px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle_at_center,_rgba(255,102,171,0.22)_0%,_rgba(95,10,50,0.3)_48%,_transparent_75%)] blur-[95px] rounded-full pointer-events-none -z-0"
      />

      {/* Optional Custom Hero Background Photo */}
      {site.heroBackgroundImage && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <Image
            src={site.heroBackgroundImage}
            alt="Hero Banner Background"
            fill
            unoptimized
            className="object-cover opacity-25 filter brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/80 via-transparent to-[#07090e]" />
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        {/* District Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs sm:text-sm font-semibold tracking-[0.24em] text-[#ff4d94] uppercase mb-6"
        >
          {site.districtBadge}
        </motion.p>

        {/* Main Headline with Sleek Tall Condensed Serif/Display Font & Drop-Down Entrance Animation */}
        <motion.h1
          variants={headingContainerVariants}
          initial="hidden"
          animate="visible"
          className="font-serif text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light sm:font-normal tracking-[0.10em] xs:tracking-[0.16em] sm:tracking-[0.24em] uppercase text-white leading-[1.24] max-w-5xl flex flex-col items-center select-none"
          style={{
            fontFamily: "var(--font-display, 'Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif)",
          }}
        >
          {/* Top Line: e.g. "ROTARACT CLUB" */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-7">
            {line1Words.map((word, i) => (
              <motion.span
                key={`line1-${i}`}
                variants={dropDownWordVariants}
                className="inline-block bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Bottom Line: e.g. "OF SLTC" */}
          {line2Words.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 mt-2 sm:mt-3">
              {line2Words.map((word, i) => {
                const isLast = i === line2Words.length - 1;
                return (
                  <motion.span
                    key={`line2-${i}`}
                    variants={dropDownWordVariants}
                    className={
                      isLast
                        ? "inline-block font-normal sm:font-medium tracking-[0.18em] sm:tracking-[0.26em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e] drop-shadow-[0_0_40px_rgba(230,0,126,0.65)]"
                        : "inline-block text-slate-300/90 font-light"
                    }
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          )}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-5 sm:mt-6 text-[11px] xs:text-xs sm:text-sm md:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed tracking-[0.10em] sm:tracking-[0.16em] uppercase px-2"
        >
          {site.heroSubtitle}
        </motion.p>

        {/* Refined Horizontal Divider Line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-7 sm:my-8 w-full max-w-md mx-auto flex items-center justify-center select-none"
          aria-hidden="true"
        >
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#e6007e]/50 to-transparent" />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none px-2 sm:px-0"
        >
          <Link
            href="/join-us"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-bold text-[10px] xs:text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(230,0,126,0.35)] sm:shadow-[0_0_30px_rgba(230,0,126,0.4)] hover:shadow-[0_0_45px_rgba(230,0,126,0.6)] flex items-center justify-center gap-1.5 sm:gap-2.5 group active:scale-95 border border-pink-400/30 whitespace-nowrap"
          >
            <span>{site.heroButtonText}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
          </Link>

          <Link
            href="/projects"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 font-bold text-[10px] xs:text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-md active:scale-95 shadow-lg whitespace-nowrap"
          >
            <span>EXPLORE PROJECTS</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}