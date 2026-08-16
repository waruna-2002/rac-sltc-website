"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Edit3 } from "lucide-react";
import { getStoredSiteContent } from "@/lib/siteStore";
import { useAdmin } from "@/context/AdminContext";

export default function HeroSection() {
  const { isAdmin, openEditModal } = useAdmin();
  const [site, setSite] = useState({
    heroTitle: "ROTARACT CLUB OF SLTC",
    heroSubtitle: "Ignite Potential • Inspire Impact • Serve with Passion",
    districtBadge: "Rotaract District 3220 • Sri Lanka & Maldives",
    heroButtonText: "JOIN US NOW",
  });

  useEffect(() => {
    setSite(getStoredSiteContent());
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden bg-[#07090e] group">
      {/* ADMIN IN-CONTEXT EDIT BADGE */}
      {isAdmin && (
        <button
          onClick={() => openEditModal("hero")}
          className="absolute top-24 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 border border-pink-300/40 cursor-pointer"
        >
          <Edit3 size={14} />
          <span>Edit Hero Section</span>
        </button>
      )}

      {/* Background Animated Cyber Ambient Lights */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-gradient-to-r from-[#e6007e]/25 via-purple-600/20 to-cyan-500/20 blur-[150px] rounded-full pointer-events-none -z-0"
      />

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        {/* District Cyber Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-[#e6007e]/40 text-xs font-bold tracking-widest text-[#ff4d94] uppercase mb-8 shadow-[0_0_20px_rgba(230,0,126,0.2)] backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#e6007e]" />
          <span>{site.districtBadge}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.08] max-w-4xl"
        >
          ROTARACT CLUB <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300 drop-shadow-[0_0_35px_rgba(230,0,126,0.4)]">
            OF SLTC
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed tracking-wide"
        >
          {site.heroSubtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/join-us"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-bold text-xs sm:text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(230,0,126,0.4)] hover:shadow-[0_0_45px_rgba(230,0,126,0.6)] flex items-center justify-center gap-2.5 group active:scale-95 border border-pink-400/30"
          >
            <span>{site.heroButtonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <Link
            href="/projects"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 font-bold text-xs sm:text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 shadow-lg"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE PROJECTS</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}