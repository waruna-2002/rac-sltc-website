"use client";

import React, { useState, useEffect } from "react";
import PersonCard from "@/components/PersonCard";
import MemberModal from "@/components/MemberModal";
import { getStoredTeam } from "@/lib/teamStore";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function OurPeoplePage() {
  const [filter, setFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamList, setTeamList] = useState([]);

  useEffect(() => {
    setTeamList(getStoredTeam());
  }, []);

  const categories = ["All", "Executive Committee", "Board of Directors"];
  const filteredTeam = filter === "All" ? teamList : teamList.filter(m => m.category === filter);

  // Find president for special top spotlight banner
  const president = teamList.find(m => m.role.trim().toLowerCase() === "president");

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14 bg-[#07090e]">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
          <Sparkles size={12} />
          <span>LEADERSHIP & DIRECTORS</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">People</span>
        </h1>
        
        <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
          Meet the passionate visionaries driving the Rotaract Club of SLTC forward for the Rotary Year 2025-26. Click on any member to view full details & achievements.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === cat
                  ? "bg-[#e6007e] text-white shadow-[0_0_20px_rgba(230,0,126,0.4)] border border-pink-400/40"
                  : "bg-[#0c1017] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* President Spotlight Section (If All or Executive filter selected) */}
      {(filter === "All" || filter === "Executive Committee") && president && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto relative"
        >
          <div className="text-center mb-3">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
              ✦ CLUB LEADERSHIP SPOTLIGHT ✦
            </span>
          </div>
          <PersonCard {...president} onClick={() => setSelectedMember(president)} />
        </motion.div>
      )}

      {/* Team Grid */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 text-center">
          {filter === "All" ? "ALL TEAM MEMBERS" : filter.toUpperCase()}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTeam
            .filter(m => (filter === "All" || filter === "Executive Committee") && president ? m.id !== president.id : true)
            .map((member) => (
              <PersonCard
                key={member.id}
                {...member}
                onClick={() => setSelectedMember(member)}
              />
            ))}
        </div>
      </div>

      {/* Member Details Modal Drawer */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}