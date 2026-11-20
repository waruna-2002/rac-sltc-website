"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStoredStats } from "@/lib/statsStore";

const glows = [
  "from-pink-500/20 to-[#e6007e]/30",
  "from-cyan-500/20 to-blue-600/30",
  "from-purple-500/20 to-pink-600/30",
  "from-emerald-500/20 to-teal-600/30",
];

export default function StatsCounter() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    setStats(getStoredStats());

    const handleUpdate = (e) => {
      if (e.detail?.stats && Array.isArray(e.detail.stats)) {
        setStats(e.detail.stats);
      }
    };
    window.addEventListener("rotaract_site_content_updated", handleUpdate);

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.stats && Array.isArray(json.data.stats) && json.data.stats.length > 0) {
          setStats(json.data.stats);
        }
      })
      .catch((err) => console.log("Stats API fallback:", err));

    return () => window.removeEventListener("rotaract_site_content_updated", handleUpdate);
  }, []);

  return (
    <section className="py-12 relative overflow-hidden group">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e6007e]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const glow = glows[idx % glows.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative py-8 px-4 sm:py-10 sm:px-6 rounded-3xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/60 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-[0_0_35px_rgba(230,0,126,0.25)] group/card overflow-hidden flex flex-col items-center justify-center text-center"
              >
                {/* Background Corner Glow Effect */}
                <div
                  className={`absolute -right-8 -bottom-8 w-28 h-28 bg-gradient-to-br ${glow} rounded-full blur-2xl group-hover/card:scale-150 transition-all duration-500 pointer-events-none opacity-40 group-hover/card:opacity-80`}
                />

                {/* Subtle Top Accent Pill */}
                <div className="w-8 h-1 rounded-full bg-slate-800 group-hover/card:bg-[#e6007e] group-hover/card:w-12 transition-all duration-300 mb-3" />

                {/* Centered Large Number */}
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-sans group-hover/card:text-[#ff4d94] transition-colors duration-300">
                  {item.value}
                </div>

                {/* Centered Label */}
                <div className="text-[11px] sm:text-xs font-bold text-slate-400 group-hover/card:text-slate-200 mt-2.5 uppercase tracking-widest max-w-[180px] leading-relaxed transition-colors duration-300">
                  {item.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
