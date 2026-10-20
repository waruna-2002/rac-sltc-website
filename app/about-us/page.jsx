"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Award, CheckCircle, Sparkles, Building2, Globe2, Edit3 } from "lucide-react";
import { getStoredSiteContent } from "@/lib/siteStore";
import { useAdmin } from "@/context/AdminContext";

export default function AboutUsPage() {
  const { isAdmin, isSuperAdmin, openEditModal } = useAdmin();
  const [site, setSite] = useState({
    aboutHistory: "Chartered under Rotary International District 3220, the Rotaract Club of SLTC Research University has grown into one of the most vibrant youth organizations in Sri Lanka. Our members drive sustainable development, professional skill enhancement, and youth empowerment.",
    charterYear: "2020",
    parentRotaryClub: "Rotary Club of Colombo West",
    missionText: "To foster responsible youth leadership through impactful service above self.",
    visionText: "Building an inspired university community dedicated to social impact.",
  });

  useEffect(() => {
    setSite(getStoredSiteContent());
  }, []);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 bg-[#07090e] relative">
      {/* ADMIN IN-CONTEXT EDIT BADGE */}
      {isSuperAdmin && (
        <button
          onClick={() => openEditModal("about")}
          className="absolute top-24 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 border border-pink-300/40 cursor-pointer"
        >
          <Edit3 size={14} />
          <span>Edit About Us Section</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
          <Sparkles size={12} />
          <span>ABOUT OUR CLUB</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">Service &amp; Leadership</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
          Empowering undergraduates at SLTC Research University to lead, innovate, and transform communities across Sri Lanka.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4">
          <Building2 size={28} className="text-[#e6007e]" />
          <h3 className="text-xl font-bold text-white">Chartered Chapter</h3>
          <p className="text-slate-300 text-xs leading-relaxed font-light">
            Official Rotaract Club of SLTC Research University, chartered in <strong className="text-white">{site.charterYear}</strong> under Rotary International District 3220.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4">
          <Globe2 size={28} className="text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Parent Sponsor Club</h3>
          <p className="text-slate-300 text-xs leading-relaxed font-light">
            Proudly sponsored and mentored by the <strong className="text-white">{site.parentRotaryClub}</strong>.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4">
          <Award size={28} className="text-purple-400" />
          <h3 className="text-xl font-bold text-white">Youth Impact</h3>
          <p className="text-slate-300 text-xs leading-relaxed font-light">
            Over 500+ student leaders empowered through community service, professional workshops, and international exchanges.
          </p>
        </div>
      </div>

      {/* History & Story */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1017]/80 border border-slate-800 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white">Our Journey &amp; Legacy</h2>
        <p className="text-slate-300 text-sm leading-relaxed font-light">{site.aboutHistory}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Target size={18} className="text-[#e6007e]" />
              <span>Our Mission</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">{site.missionText}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Eye size={18} className="text-cyan-400" />
              <span>Our Vision</span>
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">{site.visionText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}