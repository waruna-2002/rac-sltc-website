"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStoredStats } from "@/lib/statsStore";
import { Users, Rocket, HeartHandshake, ShieldAlert } from "lucide-react";

const icons = [Users, Rocket, HeartHandshake, ShieldAlert];
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
            const Icon = icons[idx % icons.length];
            const glow = glows[idx % glows.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all shadow-xl group/card overflow-hidden"
              >
                <div
                  className={`absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br ${glow} rounded-full blur-2xl group-hover/card:scale-150 transition-all duration-500 pointer-events-none`}
                />

                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[#e6007e] mb-4 group-hover/card:scale-110 transition-transform">
                  <Icon size={20} />
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                  {item.value}
                </div>

                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
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
