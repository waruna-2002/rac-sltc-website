"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import PersonCard from "@/components/PersonCard";
import MemberModal from "@/components/MemberModal";
import { getStoredTeam, syncTeamFromDatabase, getRoleTier, sortTeamByRoleTier } from "@/lib/teamStore";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Filter, ChevronDown, Check } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filter and sort team by selected avenue and hierarchy
  const activeList = useMemo(() => {
    let list = teamList;
    if (selectedAvenue !== "All") {
      const target = selectedAvenue.trim().toLowerCase();
      list = teamList.filter((m) => {
        const listAvenues = Array.isArray(m.avenues) && m.avenues.length > 0
          ? m.avenues
          : (m.avenue ? String(m.avenue).split(",").map((a) => a.trim()) : []);
        return listAvenues.some((ave) => ave.trim().toLowerCase() === target);
      });
    }
    return sortTeamByRoleTier(list);
  }, [teamList, selectedAvenue]);

  // Split active members into hierarchy layers according to required order:
  // 1: President
  const layer1 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 1), [activeList]);
  // 2: Secretary
  const layer2 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 2), [activeList]);
  // 3: Treasurer
  const layer3 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 3), [activeList]);
  // 4: Vice President
  const layer4 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 4), [activeList]);
  // 5: Sergeant-at-Arms
  const layer5 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 5), [activeList]);
  // 6: Editor (if present)
  const layer6 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 6), [activeList]);
  // 7: Directors
  const layer7 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 7), [activeList]);
  // 8: Remaining members (Assistant Director, Assistant Secretary, Assistant Treasurer, Avenue Officers, etc.)
  const layer8 = useMemo(() => activeList.filter((m) => getRoleTier(m.role) === 8), [activeList]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#07090e]">
      {/* Page Header */}
      <AnimatedPageHeader
        badge="Leadership & Directors"
        title="Our People"
        highlightWord="People"
        subtitle="Meet the passionate visionaries driving the Rotaract Club of SLTC forward for the Rotary Year 2025-26. Click on any member to view full details & achievements."
      />

      {/* Directory Filter Bar (Corner-Aligned) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#e6007e]" />
          <span>Showing: <strong className="text-white">{activeList.length}</strong> {activeList.length === 1 ? "Leader" : "Leaders"}</span>
          {selectedAvenue !== "All" && (
            <span className="text-[11px] text-[#ff66ab] bg-[#e6007e]/10 px-2 py-0.5 rounded-md border border-[#e6007e]/20">
              Filtered
            </span>
          )}
        </div>

        {/* Sleek Avenue Filter Dropdown (Right Corner Aligned) */}
        <div className="relative self-end sm:self-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-xl ${
              selectedAvenue !== "All"
                ? "bg-[#e6007e] text-white border border-pink-400/40 shadow-[#e6007e]/25"
                : "bg-[#0c1017] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            <Filter size={14} className={selectedAvenue !== "All" ? "text-white" : "text-[#e6007e]"} />
            <span className="truncate max-w-[200px] sm:max-w-[240px]">
              {selectedAvenue === "All" ? "Filter by Avenue" : selectedAvenue}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 p-2 rounded-2xl bg-[#0c1017]/95 border border-slate-800 shadow-2xl backdrop-blur-2xl z-50 space-y-1 overflow-hidden"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>Select Avenue</span>
                  {selectedAvenue !== "All" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAvenue("All");
                        setIsDropdownOpen(false);
                      }}
                      className="text-[#ff66ab] hover:underline cursor-pointer lowercase"
                    >
                      reset
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {avenuesList.map((ave) => {
                    const isSelected = selectedAvenue === ave;
                    return (
                      <button
                        key={ave}
                        type="button"
                        onClick={() => {
                          setSelectedAvenue(ave);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30 font-bold"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                        }`}
                      >
                        <span className="truncate mr-2">{ave === "All" ? "All Avenues" : ave}</span>
                        {isSelected && <Check size={14} className="stroke-[3] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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

          {/* Layer 2: Secretary */}
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

          {/* Layer 3: Treasurer */}
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

          {/* Layer 4: Vice President */}
          {layer4.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer4.map((member) => (
                <div key={member.id || member._id} className="w-full sm:w-[320px] max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 5: Sergeant-at-Arms */}
          {layer5.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer5.map((member) => (
                <div key={member.id || member._id} className="w-full sm:w-[320px] max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 6: Editor (if any) */}
          {layer6.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {layer6.map((member) => (
                <div key={member.id || member._id} className="w-full sm:w-[320px] max-w-sm">
                  <PersonCard {...member} onClick={() => setSelectedMember(member)} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Layer 7: Directors */}
          {layer7.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {layer7.map((member) => (
                <PersonCard key={member.id || member._id} {...member} onClick={() => setSelectedMember(member)} />
              ))}
            </motion.div>
          )}

          {/* Layer 8: Remaining Members */}
          {layer8.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {layer8.map((member) => (
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
