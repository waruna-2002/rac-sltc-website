"use client";

import React, { useState, useEffect } from "react";
import PersonCard from "@/components/PersonCard";
import MemberModal from "@/components/MemberModal";
import { getStoredTeam, syncTeamFromDatabase } from "@/lib/teamStore";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function OurPeoplePage() {
  const [filter, setFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamList, setTeamList] = useState([]);

  useEffect(() => {
    // 1. Instant render from local cache
    setTeamList(getStoredTeam());

    // 2. Asynchronously sync live from MongoDB Atlas cloud database
    syncTeamFromDatabase().then((cloudList) => {
      if (cloudList && Array.isArray(cloudList)) {
        setTeamList(cloudList);
      }
    });

    // 3. React to live team updates
    const handleTeamUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTeamList(e.detail);
      }
    };
    window.addEventListener("rotaract_team_updated", handleTeamUpdate);
    return () => window.removeEventListener("rotaract_team_updated", handleTeamUpdate);
  }, []);

  const categories = ["All", "Executive Committee", "Board of Directors"];
  const filteredTeam = filter === "All" ? teamList : teamList.filter(m => m.category === filter);

  // Find president for special top spotlight banner
  const president = teamList.find(m => m.role.trim().toLowerCase() === "president");

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14 bg-[#07090e]">
      {/* Page Header */}
      <AnimatedPageHeader
        badge="Leadership & Directors"
        title="Our People"
        highlightWord="People"
        subtitle="Meet the passionate visionaries driving the Rotaract Club of SLTC forward for the Rotary Year 2025-26. Click on any member to view full details & achievements."
      >
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-2">
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
      </AnimatedPageHeader>

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

        {filteredTeam.length > 0 ? (
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
        ) : (
          <div className="text-center py-16 px-6 rounded-3xl bg-[#0c1017]/60 border border-slate-800 max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e6007e]/10 text-[#ff4d94] flex items-center justify-center mx-auto border border-[#e6007e]/30">
              <Users size={24} />
            </div>
            <h4 className="text-base font-bold text-white">Leadership Directory Updating</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Official Executive Committee and Board of Directors details for the Rotary Year 2025-26 are currently being prepared. Check back shortly!
            </p>
          </div>
        )}
      </div>

      {/* Member Details Modal Drawer */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}