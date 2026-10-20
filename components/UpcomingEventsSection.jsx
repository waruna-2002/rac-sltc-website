"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  CheckCircle,
  ExternalLink,
  Users
} from "lucide-react";

export default function UpcomingEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [activeModalEvent, setActiveModalEvent] = useState(null);

  const avenues = [
    "All",
    "Community Service",
    "Professional Development",
    "Digital & IT",
    "Club Service",
  ];

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (selectedAvenue === "All") return true;
    return ev.avenue === selectedAvenue;
  });

  const formatDateParts = (dateString) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
        return { month: "EVENT", day: "--" };
      }
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: "EVENT", day: "--" };
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Background Glow */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#e6007e]/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
            <Sparkles size={12} />
            <span>WHAT&apos;S HAPPENING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">Events &amp; Initiatives</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-light max-w-xl">
            Stay plugged into our upcoming community projects, leadership summits, and university campus drives.
          </p>
        </div>

        <Link
          href="/join-us"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#e6007e] hover:text-white transition-colors uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-[#e6007e] px-4 py-2.5 rounded-xl self-start sm:self-auto shrink-0 shadow-lg"
        >
          <span>Join As Volunteer</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Avenue Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {avenues.map((ave) => (
          <button
            key={ave}
            onClick={() => setSelectedAvenue(ave)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedAvenue === ave
                ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30 border border-pink-400/40"
                : "bg-[#0c1017] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            {ave}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-8 bg-slate-800 rounded w-3/4" />
              <div className="h-16 bg-slate-800 rounded w-full" />
              <div className="h-8 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c1017]/60 border border-slate-800 relative z-10">
          <p className="text-slate-400 text-sm">No upcoming events found for this avenue right now.</p>
        </div>
      ) : (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredEvents.map((ev, index) => {
            const dateParts = formatDateParts(ev.date);
            return (
              <motion.div
                key={ev.id || ev._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-3xl bg-[#0c1017]/85 border border-slate-800/90 hover:border-[#e6007e]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_35px_rgba(230,0,126,0.22)] backdrop-blur-xl"
              >
                <div>
                  {/* Top Bar: Date Badge & Avenue Tag */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 group-hover:border-[#e6007e]/50 transition-colors shadow-inner shrink-0">
                      <span className="text-[10px] font-black tracking-wider text-[#e6007e] uppercase">
                        {dateParts.month}
                      </span>
                      <span className="text-lg font-black text-white leading-tight">
                        {dateParts.day}
                      </span>
                    </div>

                    {/* Avenue Badge */}
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#ff4d94] bg-[#0e131d] px-3 py-1 rounded-full border border-[#e6007e]/30">
                      {ev.avenue}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#ff4d94] transition-colors leading-snug mb-2 line-clamp-2">
                    {ev.title}
                  </h3>
                  {ev.subtitle && (
                    <p className="text-cyan-400 text-xs font-semibold mb-2">
                      {ev.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-slate-400 text-xs leading-relaxed font-light line-clamp-3 mb-5">
                    {ev.description}
                  </p>

                  {/* Logistics Meta (Time & Location) */}
                  <div className="space-y-2 mb-6 pt-3 border-t border-slate-800/70 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-[#e6007e] shrink-0" />
                      <span className="truncate">{ev.time || "Time TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{ev.location || "SLTC Research University"}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{ev.registrationOpen ? "Open for RSVP" : "Limited Slots"}</span>
                  </span>

                  <button
                    onClick={() => setActiveModalEvent(ev)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-[#e6007e] text-white hover:text-[#e6007e] text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Event Details / RSVP Modal */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setActiveModalEvent(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-700/80 space-y-6 z-10 shadow-2xl text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e6007e] bg-[#e6007e]/10 px-2.5 py-1 rounded-full border border-[#e6007e]/30">
                    {activeModalEvent.avenue}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2 leading-snug">
                    {activeModalEvent.title}
                  </h3>
                  {activeModalEvent.subtitle && (
                    <p className="text-cyan-400 text-xs font-semibold mt-1">
                      {activeModalEvent.subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Date &amp; Time</span>
                  <span className="text-white font-medium flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#e6007e]" />
                    {activeModalEvent.date}
                  </span>
                  <span className="text-slate-400 text-[11px] block">{activeModalEvent.time}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Location</span>
                  <span className="text-white font-medium flex items-center gap-1.5">
                    <MapPin size={13} className="text-cyan-400" />
                    {activeModalEvent.location}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Event Overview
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  {activeModalEvent.description}
                </p>
              </div>

              {activeModalEvent.tags && activeModalEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeModalEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModalEvent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={activeModalEvent.registrationLink || "/join-us"}
                  onClick={() => setActiveModalEvent(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-lg shadow-[#e6007e]/30"
                >
                  <span>RSVP / Register</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
