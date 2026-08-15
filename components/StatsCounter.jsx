"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Rocket, HeartHandshake, ShieldAlert } from "lucide-react";

export default function StatsCounter() {
  const stats = [
    { label: "Active Members", value: "150+", icon: Users, glow: "from-pink-500/20 to-[#e6007e]/30" },
    { label: "Projects Completed", value: "35+", icon: Rocket, glow: "from-cyan-500/20 to-blue-600/30" },
    { label: "Lives Impacted", value: "5000+", icon: HeartHandshake, glow: "from-purple-500/20 to-pink-600/30" },
    { label: "Years of Excellence", value: "5+", icon: ShieldAlert, glow: "from-emerald-500/20 to-teal-600/30" },
  ];

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6007e]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all duration-300 flex flex-col items-center text-center group shadow-xl hover:shadow-[0_0_30px_rgba(230,0,126,0.2)] relative overflow-hidden"
              >
                {/* Subtle Hover Glow Gradient inside Card */}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 group-hover:border-[#e6007e] flex items-center justify-center text-[#e6007e] group-hover:scale-110 transition-all mb-3 shadow-inner">
                  <Icon size={20} />
                </div>

                <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white group-hover:text-[#ff4d94] transition-colors">
                  {item.value}
                </span>

                <span className="mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}