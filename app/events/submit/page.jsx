"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Upload, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  Link2,
  User,
  Mail,
  AlertCircle
} from "lucide-react";

export default function SubmitUpcomingEventPage() {
  const avenues = [
    "Community Service Avenue",
    "Club Service Avenue",
    "Professional Development Avenue",
    "Membership Development Avenue",
    "International Service Avenue",
    "Public Relations and Public Image",
    "Sports and Recreational Activities",
    "Environmental Service Avenue",
  ];

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

  const [form, setForm] = useState(initialFormState);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setForm((prev) => ({ ...prev, image: evt.target.result }));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Failed to upload image to cloud. Using local preview.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setErrorMessage("Please fill in event title, date, and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || "Failed to submit event proposal.");
      }
    } catch (err) {
      console.error("Proposal error:", err);
      setErrorMessage("Network error while submitting proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-[#07090e]">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/#upcoming-events"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Upcoming Events</span>
        </Link>
        <span className="text-[11px] font-bold text-[#e6007e] uppercase tracking-widest">
          Event Proposal Portal
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light sm:font-normal uppercase tracking-[0.14em] text-white">
          Propose an <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e]">Upcoming Event</span>
        </h1>
        <p className="text-slate-300 text-sm mt-3 font-light leading-relaxed max-w-2xl">
          Have an impactful project, workshop, or community initiative in mind? Submit your proposal for the Rotaract SLTC Executive Board to review and publish to our official calendar.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1017] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Event Proposal Submitted Successfully!</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Thank you! Your event proposal has been queued for review by the Rotaract Club of SLTC Executive Board. Once approved, it will be published live on the official website.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setForm(initialFormState);
                setIsSuccess(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Propose Another Event
            </button>
            <Link
              href="/#upcoming-events"
              className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#e6007e]/30"
            >
              View Upcoming Events
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Event Title <span className="text-[#e6007e]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SLTC Youth Leadership Conclave 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
            />
          </div>

          {/* Subtitle & Avenue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Empowering Next-Gen Visionaries"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Avenue of Service
              </label>
              <select
                value={form.avenue}
                onChange={(e) => setForm({ ...form, avenue: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none transition-all"
              >
                {avenues.map((ave) => (
                  <option key={ave} value={ave}>{ave}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Event Date <span className="text-[#e6007e]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Time
              </label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM - 04:30 PM"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
              />
            </div>
          </div>

          {/* Location & Registration Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Event Location
              </label>
              <input
                type="text"
                placeholder="e.g. SLTC Main Auditorium, Padukka"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Registration / RSVP Link (Optional)
              </label>
              <input
                type="text"
                placeholder="https://forms.gle/... or /join-us"
                value={form.registrationLink}
                onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Event Description &amp; Objectives <span className="text-[#e6007e]">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the initiative, key activities, target audience, agenda, and anticipated community impact..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-[#e6007e] outline-none resize-none transition-all"
            />
          </div>

          {/* Cover Banner Image Upload */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Cover Banner Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-48 h-28 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <Image
                  src={form.image || "/images/hero.jpg"}
                  alt="Cover Banner"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <label className="flex-1 w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-[#e6007e] text-xs text-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload size={20} className="text-[#e6007e]" />
                <span className="font-semibold">
                  {isUploading ? "Uploading to Cloudinary CDN..." : "Upload Banner Image (JPG, PNG)"}
                </span>
                <span className="text-[10px] text-slate-500">Optimized high-resolution CDN upload</span>
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

          {/* Submitter Details */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submitter Information (For Board Verification)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Your Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Kasun Perera"
                    value={form.submittedBy}
                    onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Your Contact Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="e.g. kasun@gmail.com"
                    value={form.submitterEmail}
                    onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/#upcoming-events"
              className="px-5 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#e6007e]/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send size={15} />
              <span>{isSubmitting ? "Submitting Proposal..." : "Submit Event Proposal"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
