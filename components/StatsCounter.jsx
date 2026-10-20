"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStoredStats } from "@/lib/statsStore";
import { useAdmin } from "@/context/AdminContext";
import { Users, Rocket, HeartHandshake, ShieldAlert, Edit3 } from "lucide-react";

const icons = [Users, Rocket, HeartHandshake, ShieldAlert];
const glows = [
  "from-pink-500/20 to-[#e6007e]/30",
  "from-cyan-500/20 to-blue-600/30",
  "from-purple-500/20 to-pink-600/30",
  "from-emerald-500/20 to-teal-600/30",
];

export default function StatsCounter() {
  const [stats, setStats] = useState([]);
  const { isAdmin, isSuperAdmin, openEditModal } = useAdmin();

  useEffect(() => {
    setStats(getStoredStats());
  }, []);

  return (
    <section className="py-12 relative overflow-hidden group">
      {/* ADMIN IN-CONTEXT EDIT BADGE */}
      {isSuperAdmin && (
        <button
          onClick={() => openEditModal("stats")}
          className="absolute top-2 right-6 z-30 px-3 py-1 rounded-full bg-[#e6007e] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-1 cursor-pointer border border-pink-300/40"
        >
          <Edit3 size={13} />
          <span>Edit Stats</span>
        </button>
      )}

      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6007e]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            const glow = glows[idx % glows.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all duration-300 flex flex-col items-center text-center group shadow-xl relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

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