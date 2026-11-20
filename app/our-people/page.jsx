"use client";

import React, { useState, useEffect, useMemo } from "react";
import PersonCard from "@/components/PersonCard";
import MemberModal from "@/components/MemberModal";
import { getStoredTeam, syncTeamFromDatabase, getRoleTier } from "@/lib/teamStore";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

const STANDARD_AVENUES = [
  "All",
  "Community Service Avenue",
  "Club Service Avenue",
  "Professional Development Avenue",
  "Membership Development Avenue",
  "International Service Avenue",
  "Public Relations and Public Image",
  "Sports and Recreational Activities",
  "Environmental Service Avenue",
];

export default function OurPeoplePage() {
  const [selectedAvenue, setSelectedAvenue] = useState("All");
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

  // Collect available avenues based on actual team members + standard list (excluding Executive roles)
  const avenuesList = useMemo(() => {
    const avenueSet = new Set();
    teamList.forEach((m) => {
      const list = Array.isArray(m.avenues) && m.avenues.length > 0
        ? m.avenues
        : (m.avenue ? String(m.avenue).split(",").map((a) => a.trim()) : []);
      list.forEach((ave) => {
        if (
          ave &&
          ave.trim() &&
          !ave.toLowerCase().includes("executive") &&
          !ave.toLowerCase().includes("general")
        ) {
          avenueSet.add(ave.trim());
        }
      });
    });
    STANDARD_AVENUES.slice(1).forEach((ave) => {
      if (!ave.toLowerCase().includes("executive") && !ave.toLowerCase().includes("general")) {
        avenueSet.add(ave);
      }
    });
    return ["All", ...Array.from(avenueSet)];
  }, [teamList]);

  // Filter team by selected avenue
  const activeList = useMemo(() => {
    if (selectedAvenue === "All") return teamList;
    const target = selectedAvenue.trim().toLowerCase();
    return teamList.filter((m) => {
      const list = Array.isArray(m.avenues) && m.avenues.length > 0
        ? m.avenues
        : (m.avenue ? String(m.avenue).split(",").map((a) => a.trim()) : []);
      return list.some((ave) => ave.trim().toLowerCase() === target);
    });
  }, [teamList, selectedAvenue]);

  // Split active members into 5 hierarchy layers
  // Layer 1: President
  const layer1 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 1), [activeList]);
  // Layer 2: Vice President
  const layer2 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 2), [activeList]);
  // Layer 3: Avenue Secretary, Avenue Treasurer, Editor
  const layer3 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 3), [activeList]);
  // Layer 4: Directors
  const layer4 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 4), [activeList]);
  // Layer 5: Remaining members (Assistant Director, Assistant Secretary, Assistant Treasurer, etc.)
  const layer5 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 5), [activeList]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#07090e]">
      {/* Page Header */}
      <AnimatedPageHeader
        badge="Leadership & Directors"
        title="Our People"
        highlightWord="People"
        subtitle="Meet the passionate visionaries driving the Rotaract Club of SLTC forward for the Rotary Year 2025-26. Click on any member to view full details & achievements."
      >
        {/* Filter Tabs by Avenue */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-5xl mx-auto">
          {avenuesList.map((ave) => (
            <button
              key={ave}
              onClick={() => setSelectedAvenue(ave)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedAvenue === ave
                  ? "bg-[#e6007e] text-white shadow-[0_0_20px_rgba(230,0,126,0.4)] border border-pink-400/40"
                  : "bg-[#0c1017] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {ave === "All" ? "All Avenues" : ave}
            </button>
          ))}
        </div>
      </AnimatedPageHeader>

      {/* Team Content By Hierarchy Layers (Without labels, auto-hiding empty layers) */}
      {activeList.length > 0 ? (
        <div className="space-y-10">
          {/* Layer 1: President */}
          {layer1.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer1.map((member) => (
                <div key={member.id || member._id} className="w-full max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 2: Vice President */}
          {layer2.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer2.map((member) => (
                <div key={member.id || member._id} className="w-full sm:w-[320px] max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 3: Avenue Secretary, Avenue Treasurer, Editor */}
          {layer3.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer3.map((member) => (
                <div key={member.id || member._id} className="w-full sm:w-[320px] max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 4: Directors */}
          {layer4.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {layer4.map((member) => (
                <PersonCard key={member.id || member._id} {...member} onClick={() => setSelectedMember(member)} />
              ))}
            </motion.div>
          )}

          {/* Layer 5: Remaining Members */}
          {layer5.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {layer5.map((member) => (
                <PersonCard key={member.id || member._id} {...member} onClick={() => setSelectedMember(member)} />
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-3xl bg-[#0c1017]/60 border border-slate-800 max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e6007e]/10 text-[#ff4d94] flex items-center justify-center mx-auto border border-[#e6007e]/30">
            <Users size={24} />
          </div>
          <h4 className="text-base font-bold text-white">Leadership Directory Updating</h4>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            {selectedAvenue === "All"
              ? "Official details for the Rotary Year 2025-26 are currently being prepared. Check back shortly!"
              : `No leadership profiles currently found under "${selectedAvenue}". Select "All" to view all members.`}
          </p>
        </div>
      )}

      {/* Member Details Modal Drawer */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
