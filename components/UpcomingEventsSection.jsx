"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Tag, 
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  Users,
  PlusCircle,
  X,
  Upload
} from "lucide-react";

export default function UpcomingEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [activeModalEvent, setActiveModalEvent] = useState(null);

  // Viewer proposal modal states
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposeSuccess, setProposeSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialFormState = {
    title: "",
    subtitle: "",
    avenue: "Community Service Avenue",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 AM - 01:00 PM",
    location: "SLTC Research University, Padukka",
    description: "",
    image: "/images/hero.jpg",
    submittedBy: "",
    submitterEmail: "",
    registrationLink: "",
  };

  const [proposeForm, setProposeForm] = useState(initialFormState);

  const avenues = [
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

  const fetchEvents = async () => {
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
  };

  useEffect(() => {
    fetchEvents();

    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#propose-event") {
        setIsProposeModalOpen(true);
        setProposeSuccess(false);
        setErrorMessage("");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Upload image directly to Cloudinary via /api/upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rotaract_sltc/events");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setProposeForm((prev) => ({ ...prev, image: data.url }));
      } else {
        // Fallback to base64 preview
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setProposeForm((prev) => ({ ...prev, image: evt.target.result }));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Failed to upload image. Using fallback.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!proposeForm.title.trim() || !proposeForm.description.trim() || !proposeForm.date) {
      setErrorMessage("Please fill in event title, description, and date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposeForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProposeSuccess(true);
        setProposeForm(initialFormState);
      } else {
        setErrorMessage(data.error || "Failed to submit event proposal.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMessage("Network error while submitting proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (selectedAvenue === "All") return true;
    const evAve = (ev.avenue || "").toLowerCase();
    const targetAve = (selectedAvenue || "").toLowerCase();
    return (
      ev.avenue === selectedAvenue ||
      (evAve && targetAve.includes(evAve)) ||
      (evAve && evAve.includes(targetAve.replace(" avenue", "")))
    );
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
    <section id="upcoming-events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative scroll-mt-24">
      {/* Background Glow */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#e6007e]/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 relative z-10">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#e6007e] uppercase mb-3">
            What&apos;s Happening
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">Events &amp; Initiatives</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 font-light max-w-xl">
            Stay plugged into our upcoming community projects, leadership summits, and university campus drives.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsProposeModalOpen(true);
              setProposeSuccess(false);
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-white transition-all uppercase tracking-wider bg-[#e6007e] hover:bg-[#c4006c] px-4 py-2.5 rounded-xl shadow-lg shadow-[#e6007e]/30 cursor-pointer active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Propose Event</span>
          </button>

          <Link
            href="/join-us"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-[#e6007e] px-4 py-2.5 rounded-xl shadow-lg"
          >
            <span>Join Us</span>
            <ArrowRight size={14} />
          </Link>
        </div>
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
        <div className="p-12 text-center rounded-3xl bg-[#0c1017]/60 border border-slate-800/80 relative z-10">
          <Calendar size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-base">No upcoming events scheduled in this avenue.</p>
          <p className="text-slate-500 text-xs mt-1">Have an event in mind? Click &quot;Propose Event&quot; above to submit an upcoming initiative.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredEvents.map((ev, idx) => {
            const { month, day } = formatDateParts(ev.date);
            return (
              <motion.div
                key={ev._id || ev.id || idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Event Cover Photo */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={ev.image || "/images/hero.jpg"}
                      alt={ev.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-black/30" />

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1.5 text-center min-w-[50px] shadow-lg">
                      <span className="block text-[10px] font-black text-[#e6007e] tracking-widest uppercase">
                        {month}
                      </span>
                      <span className="block text-lg font-black text-white leading-tight">
                        {day}
                      </span>
                    </div>

                    {/* Avenue Badge */}
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#e6007e]/90 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-md shadow-md">
                      {ev.avenue?.replace(/&amp;/gi, "&")}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff4d94] transition-colors line-clamp-2">
                      {ev.title}
                    </h3>

                    {ev.subtitle && (
                      <p className="text-xs font-semibold text-cyan-400 line-clamp-1">
                        {ev.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 font-light line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#e6007e] shrink-0" />
                        <span className="truncate">{ev.time || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalEvent(ev)}
                    className="text-xs font-bold text-slate-300 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    View Details
                  </button>

                  <Link
                    href={ev.registrationLink || "/join-us"}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-white hover:bg-[#e6007e] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Register</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* EVENT DETAILS POPUP MODAL */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalEvent(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl bg-[#0c1017] border border-slate-800 p-6 sm:p-8 space-y-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900">
                <Image
                  src={activeModalEvent.image || "/images/hero.jpg"}
                  alt={activeModalEvent.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#e6007e] text-white text-xs font-black tracking-wider uppercase">
                  {activeModalEvent.avenue?.replace(/&amp;/gi, "&")}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">{activeModalEvent.title}</h3>
                {activeModalEvent.subtitle && (
                  <p className="text-sm font-semibold text-cyan-400 mt-1">
                    {activeModalEvent.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-[#e6007e]" />
                  <span>Date: <strong>{activeModalEvent.date}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-[#e6007e]" />
                  <span>Time: <strong>{activeModalEvent.time || "TBD"}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <MapPin size={15} className="text-cyan-400" />
                  <span>Location: <strong>{activeModalEvent.location}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Event Description &amp; Details
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
                  {activeModalEvent.description}
                </p>
              </div>

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

      {/* VIEWER UPCOMING EVENT PROPOSAL MODAL */}
      <AnimatePresence>
        {isProposeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProposeModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl bg-[#0c1017] border border-slate-800 p-6 sm:p-8 space-y-6 z-10 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-[#e6007e]" />
                    <span>Propose an Upcoming Event</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Submit an upcoming project or initiative for review by the Rotaract Executive Board.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {proposeSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-white">Event Proposal Submitted!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    Thank you! Your upcoming event proposal has been safely submitted to the Rotaract Executive Board. It will appear live on the website once approved by the Admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProposeModalOpen(false);
                      setProposeSuccess(false);
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#e6007e]/30"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProposeSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Event Title <span className="text-[#e6007e]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SLTC Youth Innovation Challenge 2026"
                      value={proposeForm.title}
                      onChange={(e) => setProposeForm({ ...proposeForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Empowering Next-Gen Visionaries"
                        value={proposeForm.subtitle}
                        onChange={(e) => setProposeForm({ ...proposeForm, subtitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Avenue of Service
                      </label>
                      <select
                        value={proposeForm.avenue}
                        onChange={(e) => setProposeForm({ ...proposeForm, avenue: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                      >
                        {avenues.filter(a => a !== "All").map((ave) => (
                          <option key={ave} value={ave}>{ave}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Event Date <span className="text-[#e6007e]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={proposeForm.date}
                        onChange={(e) => setProposeForm({ ...proposeForm, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 AM - 04:30 PM"
                        value={proposeForm.time}
                        onChange={(e) => setProposeForm({ ...proposeForm, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Event Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SLTC Main Auditorium, Padukka"
                      value={proposeForm.location}
                      onChange={(e) => setProposeForm({ ...proposeForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Event Description <span className="text-[#e6007e]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the initiative, key activities, target audience, and community impact..."
                      value={proposeForm.description}
                      onChange={(e) => setProposeForm({ ...proposeForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none resize-none"
                    />
                  </div>

                  {/* Image Upload directly to Cloudinary */}
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Cover Banner Image
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <Image
                          src={proposeForm.image || "/images/hero.jpg"}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <label className="flex-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-[#e6007e] text-xs text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <Upload size={14} className="text-[#e6007e]" />
                        <span>{isUploading ? "Uploading to Cloud..." : "Upload Photo (Cloudinary)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kasun Perera"
                        value={proposeForm.submittedBy}
                        onChange={(e) => setProposeForm({ ...proposeForm, submittedBy: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. kasun@gmail.com"
                        value={proposeForm.submitterEmail}
                        onChange={(e) => setProposeForm({ ...proposeForm, submitterEmail: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsProposeModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#e6007e]/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Event Proposal"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
