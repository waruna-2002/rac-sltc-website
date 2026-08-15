"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 overflow-hidden bg-[#07090e]">
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

      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#e6007e]/15 blur-[140px] rounded-full pointer-events-none -z-0"
      />

      <motion.div
        animate={{
          x: [20, -20, 20],
          y: [30, -30, 30],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none -z-0"
      />

      {/* Cybernetic Grid Matrix Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e6007e_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        {/* District Cyber Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-[#e6007e]/40 text-xs font-bold tracking-widest text-[#ff4d94] uppercase mb-8 shadow-[0_0_20px_rgba(230,0,126,0.2)] backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e6007e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e6007e]"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#e6007e]" />
          <span>Rotaract District 3220 • Sri Lanka & Maldives</span>
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
          Ignite Potential <span className="text-[#e6007e]">•</span> Inspire Impact <span className="text-cyan-400">•</span> Serve with Passion
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
            <span>JOIN US NOW</span>
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

        {/* Futuristic Floating HUD Tags */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 text-xs text-slate-400 max-w-3xl w-full"
        >
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-[#e6007e]" />
            <span className="font-semibold text-slate-300">District Recognized</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Active Innovation</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-300">500+ Community Members</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}