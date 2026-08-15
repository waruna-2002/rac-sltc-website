"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Award, CheckCircle } from "lucide-react";

export default function AboutUsPage() {
  const values = [
    "Leadership Development",
    "Service Above Self",
    "Integrity & Ethics",
    "Innovation in Action",
    "Diversity & Inclusivity",
    "Fellowship & Unity"
  ];

  return (
    <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#e6007e] uppercase mb-2 block">
          DISCOVER OUR JOURNEY
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          About Rotaract Club of SLTC
        </h1>
        <p className="text-slate-400 text-sm mt-4 leading-relaxed">
          Chartered to foster impactful youth leadership and service excellence within SLTC Research University and beyond.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-white">Our Charter Story</h2>
          <p>
            The Rotaract Club of SLTC was established with a vision to unite forward-thinking undergraduates who are passionate about creating measurable societal impact while advancing their professional and personal capacities.
          </p>
          <p>
            Under the guidance of Rotary International District 3220, our club acts as a launchpad for community upliftment, educational outreach, digital empowerment, and international goodwill.
          </p>
        </div>
        <div className="h-72 rounded-2xl bg-[#0e131d] border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
          [ SLTC Campus & Charter Group Photo ]
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-[#0e131d] border border-slate-800">
          <Target className="text-[#e6007e] mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            To provide opportunities for university students to enhance the knowledge and skills that will assist them in personal development, to address the physical and social needs of their communities, and to promote better relations between all people worldwide through a framework of friendship and service.
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-[#0e131d] border border-slate-800">
          <Eye className="text-[#e6007e] mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            To emerge as a premier youth-led organization in Sri Lanka that inspires innovative solutions to contemporary community challenges and empowers undergraduates to become globally competent leaders.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="p-8 rounded-2xl bg-[#0e131d]/60 border border-slate-800">
        <h3 className="text-xl font-bold text-white text-center mb-6">Our Core Values</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {values.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <CheckCircle size={16} className="text-[#e6007e] shrink-0" />
              <span>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}