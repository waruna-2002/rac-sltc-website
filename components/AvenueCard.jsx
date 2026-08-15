"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Briefcase, 
  HeartHandshake, 
  Globe2, 
  Code, 
  Trophy, 
  Megaphone, 
  DollarSign 
} from "lucide-react";

const iconMap = {
  Users,
  Briefcase,
  HeartHandshake,
  Globe2,
  Code,
  Trophy,
  Megaphone,
  DollarSign,
};

export default function AvenueCard({ title, tagline, description, icon }) {
  const IconComponent = iconMap[icon] || Users;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="p-7 rounded-2xl bg-[#0c1017]/80 border border-slate-800/90 hover:border-[#e6007e]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(230,0,126,0.2)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Top Corner Neon Accent Line */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#e6007e]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-bl-full" />

      <div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[#e6007e] group-hover:bg-[#e6007e] group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-5 shadow-inner">
          <IconComponent size={22} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ff4d94] transition-colors tracking-wide">
          {title}
        </h3>
        <p className="text-[11px] font-semibold text-cyan-400 mb-3 tracking-wider uppercase">
          {tagline}
        </p>
        <p className="text-slate-400 text-xs leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider group-hover:text-slate-300 transition-colors">
        <span>Avenue of Service</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#e6007e] group-hover:animate-ping" />
      </div>
    </motion.div>
  );
}