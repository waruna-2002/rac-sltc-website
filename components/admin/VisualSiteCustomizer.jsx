"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, 
  Check, 
  Upload, 
  ChevronLeft, 
  Type, 
  Image as ImageIcon, 
  BarChart3, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Info,
  Globe
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function VisualSiteCustomizer({
  siteContent,
  setSiteContent,
  stats,
  setStats,
  avenues,
  setAvenues,
  events,
  onSave,
  showToast,
  handleFileUpload
}) {
  const [activePage, setActivePage] = useState("home"); // "home" | "about" | "contact"
  const [viewport, setViewport] = useState("desktop"); // "desktop" | "mobile"
  const [activeSection, setActiveSection] = useState(null); // "hero" | "who_we_are" | "mission" | "stats" | "avenues" | "about_story" | "contact"
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to update siteContent state and mark dirty
  const updateContent = (field, value) => {
    setSiteContent((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Dedicated image uploader for customizer
  const onImageSelected = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview for zero-latency UX
    const instantPreview = URL.createObjectURL(file);
    const previousImageUrl = siteContent[targetField] || "";
    updateContent(targetField, instantPreview);

    setIsUploadingPhoto(true);
    showToast("Uploading image to Cloudinary CDN...", "info");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name || "Site Asset");
      formData.append("avenue", "General");
      if (previousImageUrl) {
        formData.append("previousImageUrl", previousImageUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        body: formData,
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json.success && json.data?.imageUrl) {
        updateContent(targetField, json.data.imageUrl);
        showToast("Image uploaded to Cloudinary CDN successfully!", "success");
      } else {
        showToast(json.error || "Upload failed, retained local preview.", "warning");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Direct Cloudinary upload error:", err);
      if (err.name === "AbortError") {
        showToast("Upload timed out after 40s. Retained preview.", "error");
      } else {
        showToast("Error uploading image. Retained preview.", "error");
      }
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const handlePublish = (e) => {
    if (e) e.preventDefault();
    onSave(e);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Control Bar */}
      <div className="p-4 rounded-3xl bg-[#0c1017] border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Left: Page Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Editing Page:
          </span>
          <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActivePage("home"); setActiveSection(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePage === "home"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Home Page
            </button>
            <button
              type="button"
              onClick={() => { setActivePage("about"); setActiveSection(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePage === "about"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => { setActivePage("contact"); setActiveSection(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePage === "contact"
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewport === "desktop"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View (100% full width)"
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewport === "mobile"
                ? "bg-slate-800 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="Mobile View (390px phone container)"
          >
            Mobile (390px)
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved Changes
            </span>
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
            title="Open Live Public Site in new tab"
          >
            View Live Site
          </a>
          <button
            type="button"
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#ff2a9d] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#e6007e]/30 cursor-pointer transition-all"
          >
            Save &amp; Publish
          </button>
        </div>
      </div>

      {/* Main Studio Work Area: Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT INSPECTOR PANEL (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0c1017] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl sticky top-28 max-h-[85vh] overflow-y-auto">
          {!activeSection ? (
            /* Section Navigator Tree */
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e6007e]">Interactive Studio</span>
                <h3 className="text-base font-bold text-white mt-0.5">Select a Section to Edit</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click any section button below, or simply click on the section inside the live preview on the right!
                </p>
              </div>

              {activePage === "home" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("hero")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-[#ff66ab]">Hero Banner</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Headline, Tagline &amp; Badge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("who_we_are")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300">Who We Are</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Heading &amp; Organization Story</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("mission")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Mission &amp; Vision</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Statements of Purpose</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("stats")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Impact Stats Counter</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{stats.length} live statistics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("avenues")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300">8 Avenues of Service</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Titles &amp; Descriptions</span>
                  </button>
                </div>
              )}

              {activePage === "about" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("about_story")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-[#ff66ab]">Our Story &amp; Charter</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">History, Year, Parent Rotary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("mission")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Mission &amp; Vision</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Statements of Purpose</span>
                  </button>
                </div>
              )}

              {activePage === "contact" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection("contact")}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Coordinates &amp; Socials</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Email, Phone, Campus, Socials</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Focused Section Editor */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSection(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ChevronLeft size={14} />
                  <span>All Sections</span>
                </button>
                <span className="text-[10px] font-black uppercase text-[#e6007e]">
                  Editing: {activeSection.replace("_", " ")}
                </span>
              </div>

              {/* HERO SECTION FORM */}
              {activeSection === "hero" && (
                <div className="space-y-4">
                  <Input
                    label="District Badge"
                    value={siteContent.districtBadge || ""}
                    onChange={(e) => updateContent("districtBadge", e.target.value)}
                  />
                  <Input
                    label="Main Headline (Rotaract Club of SLTC)"
                    value={siteContent.heroTitle || ""}
                    onChange={(e) => updateContent("heroTitle", e.target.value)}
                  />
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Hero Subtitle / Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={siteContent.heroSubtitle || ""}
                      onChange={(e) => updateContent("heroSubtitle", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    />
                  </div>
                  <Input
                    label="Primary CTA Button Text"
                    value={siteContent.heroButtonText || "JOIN US NOW"}
                    onChange={(e) => updateContent("heroButtonText", e.target.value)}
                  />

                  {/* HERO BANNER BACKGROUND PHOTO UPLOAD */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#ff66ab] flex items-center gap-1.5">
                        <ImageIcon size={14} />
                        <span>Hero Background Photo</span>
                      </label>
                      {isUploadingPhoto && (
                        <span className="text-[10px] text-[#ff66ab] font-bold animate-pulse">
                          Uploading to Cloudinary...
                        </span>
                      )}
                    </div>

                    {siteContent.heroBackgroundImage && (
                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <Image
                          src={siteContent.heroBackgroundImage}
                          alt="Hero Background Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#ff2a9d] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-[#e6007e]/30 transition-all">
                        <Upload size={14} />
                        <span>Upload Hero Photo (Cloudinary)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageSelected(e, "heroBackgroundImage")}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Input
                      label="Or Direct Image URL"
                      value={siteContent.heroBackgroundImage || ""}
                      onChange={(e) => updateContent("heroBackgroundImage", e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                </div>
              )}

              {/* WHO WE ARE FORM */}
              {activeSection === "who_we_are" && (
                <div className="space-y-4">
                  <Input
                    label="Who We Are Heading"
                    value={siteContent.whoWeAreTitle || ""}
                    onChange={(e) => updateContent("whoWeAreTitle", e.target.value)}
                  />
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Full Description / Narrative
                    </label>
                    <textarea
                      rows={5}
                      value={siteContent.whoWeAreDescription || ""}
                      onChange={(e) => updateContent("whoWeAreDescription", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    />
                  </div>

                  {/* CLUB LEADERS GROUP PHOTO UPLOAD BOX */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#ff66ab] flex items-center gap-1.5">
                        <ImageIcon size={14} />
                        <span>Club Leaders Group Photo</span>
                      </label>
                      {isUploadingPhoto && (
                        <span className="text-[10px] text-[#ff66ab] font-bold animate-pulse">
                          Uploading to Cloudinary...
                        </span>
                      )}
                    </div>

                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                      <Image
                        src={siteContent.whoWeAreImage || "/images/hero.jpg"}
                        alt="Rotaract SLTC Leaders Group Photo"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#ff2a9d] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-[#e6007e]/30 transition-all">
                        <Upload size={14} />
                        <span>Upload New Group Photo (Cloudinary)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageSelected(e, "whoWeAreImage")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                        Uploads directly to Cloudinary CDN &amp; updates homepage in real time.
                      </p>
                    </div>

                    <Input
                      label="Or Direct Image URL"
                      value={siteContent.whoWeAreImage || ""}
                      onChange={(e) => updateContent("whoWeAreImage", e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                </div>
              )}

              {/* MISSION & VISION FORM */}
              {activeSection === "mission" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Mission Statement
                    </label>
                    <textarea
                      rows={3}
                      value={siteContent.missionText || ""}
                      onChange={(e) => updateContent("missionText", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Vision Statement
                    </label>
                    <textarea
                      rows={3}
                      value={siteContent.visionText || ""}
                      onChange={(e) => updateContent("visionText", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    />
                  </div>
                </div>
              )}

              {/* STATS COUNTER FORM */}
              {activeSection === "stats" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Edit the 4 main statistics displayed on the homepage:</p>
                  {stats.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <Input
                        label="Label Title"
                        value={st.label}
                        onChange={(e) => {
                          const copy = [...stats];
                          copy[idx].label = e.target.value;
                          setStats(copy);
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <Input
                        label="Display Value (e.g. 50+, 120+)"
                        value={st.value}
                        onChange={(e) => {
                          const copy = [...stats];
                          copy[idx].value = e.target.value;
                          setStats(copy);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* AVENUES FORM */}
              {activeSection === "avenues" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">Configure titles and descriptions for the 8 avenues:</p>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {avenues.map((ave, idx) => (
                      <div key={ave.id || idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase text-[#e6007e] block">
                          Avenue {idx + 1}: {ave.title}
                        </span>
                        <Input
                          label="Title"
                          value={ave.title || ""}
                          onChange={(e) => {
                            const copy = [...avenues];
                            copy[idx].title = e.target.value;
                            setAvenues(copy);
                            setHasUnsavedChanges(true);
                          }}
                        />
                        <Input
                          label="Tagline"
                          value={ave.tagline || ave.subtitle || ""}
                          onChange={(e) => {
                            const copy = [...avenues];
                            copy[idx].tagline = e.target.value;
                            copy[idx].subtitle = e.target.value;
                            setAvenues(copy);
                            setHasUnsavedChanges(true);
                          }}
                        />
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={ave.description || ""}
                            onChange={(e) => {
                              const copy = [...avenues];
                              copy[idx].description = e.target.value;
                              setAvenues(copy);
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABOUT STORY FORM */}
              {activeSection === "about_story" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                      Our History &amp; Journey
                    </label>
                    <textarea
                      rows={5}
                      value={siteContent.aboutHistory || ""}
                      onChange={(e) => updateContent("aboutHistory", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Charter Year"
                      value={siteContent.charterYear || "2020"}
                      onChange={(e) => updateContent("charterYear", e.target.value)}
                    />
                    <Input
                      label="Parent Rotary Club"
                      value={siteContent.parentRotaryClub || "Rotary Club of Colombo West"}
                      onChange={(e) => updateContent("parentRotaryClub", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* CONTACT FORM */}
              {activeSection === "contact" && (
                <div className="space-y-4">
                  <Input
                    label="Campus Address"
                    value={siteContent.address || ""}
                    onChange={(e) => updateContent("address", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Club Email"
                      value={siteContent.email || ""}
                      onChange={(e) => updateContent("email", e.target.value)}
                    />
                    <Input
                      label="Contact Phone"
                      value={siteContent.phone || ""}
                      onChange={(e) => updateContent("phone", e.target.value)}
                    />
                  </div>
                  <Input
                    label="Facebook URL"
                    value={siteContent.facebookUrl || ""}
                    onChange={(e) => updateContent("facebookUrl", e.target.value)}
                  />
                  <Input
                    label="Instagram URL"
                    value={siteContent.instagramUrl || ""}
                    onChange={(e) => updateContent("instagramUrl", e.target.value)}
                  />
                  <Input
                    label="LinkedIn URL"
                    value={siteContent.linkedinUrl || ""}
                    onChange={(e) => updateContent("linkedinUrl", e.target.value)}
                  />
                  <Input
                    label="YouTube URL"
                    value={siteContent.youtubeUrl || ""}
                    onChange={(e) => updateContent("youtubeUrl", e.target.value)}
                  />
                </div>
              )}

              {/* Done button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveSection(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Done Editing Section
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-4 py-2 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase cursor-pointer shadow-md shadow-[#e6007e]/30"
                >
                  Save Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT INTERACTIVE PREVIEW CANVAS (8 Columns) */}
        <div className="lg:col-span-8 flex justify-center">
          <div
            className={`transition-all duration-300 w-full ${
              viewport === "mobile"
                ? "max-w-[400px] border-[10px] border-slate-900 rounded-[45px] shadow-2xl overflow-hidden bg-[#07090e]"
                : "rounded-3xl border border-slate-800 bg-[#07090e] shadow-2xl overflow-hidden"
            }`}
          >
            {/* Mobile Header Bar Mockup */}
            {viewport === "mobile" && (
              <div className="bg-slate-900 px-6 py-2.5 flex items-center justify-between text-slate-400 text-[11px] font-bold border-b border-slate-800">
                <span>9:41</span>
                <div className="w-16 h-3 rounded-full bg-slate-800" />
                <span>5G 100%</span>
              </div>
            )}

            {/* PREVIEW CANVAS CONTAINER */}
            <div className="p-4 sm:p-6 space-y-8 select-none">
              {/* PAGE: HOME */}
              {activePage === "home" && (
                <>
                  {/* SECTION 1: HERO */}
                  <div
                    onClick={() => setActiveSection("hero")}
                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer group text-center overflow-hidden bg-gradient-to-b from-[#180410] to-[#07090e] ${
                      activeSection === "hero"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-[#e6007e]/60"
                    }`}
                  >
                    {siteContent.heroBackgroundImage && (
                      <div className="absolute inset-0 -z-0 opacity-25 pointer-events-none">
                        <Image
                          src={siteContent.heroBackgroundImage}
                          alt="Hero Background Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg z-10">
                      <Edit3 size={11} />
                      <span>Edit Hero</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 uppercase tracking-widest mb-4 relative z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e6007e]" />
                      <span>{siteContent.districtBadge || "Rotaract District 3220"}</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-serif font-light uppercase text-white tracking-widest leading-tight relative z-10">
                      {siteContent.heroTitle || "ROTARACT CLUB OF SLTC"}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 tracking-wider uppercase mt-3 max-w-lg mx-auto relative z-10">
                      {siteContent.heroSubtitle || "Ignite Potential • Inspire Impact • Serve with Passion"}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-10">
                      <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e6007e] to-[#ff2a9d] text-white text-xs font-bold uppercase shadow-md shadow-[#e6007e]/30">
                        {siteContent.heroButtonText || "JOIN US NOW"}
                      </span>
                      <span className="px-5 py-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase">
                        Explore Projects
                      </span>
                    </div>
                  </div>

                  {/* SECTION 2: WHO WE ARE */}
                  <div
                    onClick={() => setActiveSection("who_we_are")}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "who_we_are"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-purple-500/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg z-10">
                      <Edit3 size={11} />
                      <span>Edit Who We Are &amp; Group Photo</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      <div className="sm:col-span-7">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6007e]">WHO WE ARE</span>
                        <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                          {siteContent.whoWeAreTitle || "Empowering Leaders, Transforming Communities."}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
                          {siteContent.whoWeAreDescription || "Youth movement dedicated to service above self."}
                        </p>
                      </div>

                      <div className="sm:col-span-5 relative h-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg">
                        <Image
                          src={siteContent.whoWeAreImage || "/images/hero.jpg"}
                          alt="SLTC Rotaract Youth Leaders Group Photo"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017]/80 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur border border-white/20">
                            Club Group Photo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: MISSION & VISION */}
                  <div
                    onClick={() => setActiveSection("mission")}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "mission"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-cyan-500/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Edit3 size={11} />
                      <span>Edit Mission &amp; Vision</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-cyan-400">Our Mission</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {siteContent.missionText || "To foster responsible youth leadership."}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-[#e6007e]">Our Vision</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {siteContent.visionText || "Building an inspired university community."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: IMPACT STATS COUNTER */}
                  <div
                    onClick={() => setActiveSection("stats")}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "stats"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-emerald-500/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Edit3 size={11} />
                      <span>Edit Stats</span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Our Proven Track Record</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {stats.map((st, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                          <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff66ab]">
                            {st.value}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate">
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 5: AVENUES PREVIEW */}
                  <div
                    onClick={() => setActiveSection("avenues")}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "avenues"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-amber-500/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Edit3 size={11} />
                      <span>Edit Avenues</span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">8 Strategic Frontiers</span>
                    <h3 className="text-sm font-bold text-white mt-1">Avenues of Service</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {avenues.slice(0, 4).map((ave, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <h5 className="text-xs font-bold text-white truncate">{ave.title}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ave.tagline || ave.description}</p>
                        </div>
                      ))}
                    </div>
                    {avenues.length > 4 && (
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2 text-center">
                        + {avenues.length - 4} more avenues configured
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* PAGE: ABOUT US */}
              {activePage === "about" && (
                <>
                  <div
                    onClick={() => setActiveSection("about_story")}
                    className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "about_story"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-[#e6007e]/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Edit3 size={11} />
                      <span>Edit Story</span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6007e]">Our Roots</span>
                    <h2 className="text-2xl font-serif font-bold text-white mt-1">Our Story &amp; Charter</h2>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {siteContent.aboutHistory || "Chartered under Rotary International District 3220."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Chartered In</span>
                        <h4 className="text-base font-black text-white">{siteContent.charterYear || "2020"}</h4>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Sponsor Club</span>
                        <h4 className="text-base font-black text-white">{siteContent.parentRotaryClub || "Rotary Colombo West"}</h4>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSection("mission")}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                      activeSection === "mission"
                        ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                        : "border-slate-800/80 hover:border-cyan-500/60"
                    }`}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Edit3 size={11} />
                      <span>Edit Mission</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-cyan-400">Mission</span>
                        <p className="text-xs text-slate-300 mt-1">{siteContent.missionText}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] font-black uppercase text-[#e6007e]">Vision</span>
                        <p className="text-xs text-slate-300 mt-1">{siteContent.visionText}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: CONTACT */}
              {activePage === "contact" && (
                <div
                  onClick={() => setActiveSection("contact")}
                  className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer group bg-[#0c1017] ${
                    activeSection === "contact"
                      ? "border-[#e6007e] shadow-2xl shadow-[#e6007e]/20"
                      : "border-slate-800/80 hover:border-emerald-500/60"
                  }`}
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Edit3 size={11} />
                    <span>Edit Contact</span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Get In Touch</span>
                  <h2 className="text-2xl font-serif font-bold text-white mt-1">Official Coordinates</h2>

                  <div className="space-y-3 mt-6">
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                      <MapPin size={16} className="text-[#e6007e] shrink-0" />
                      <span className="text-xs text-slate-300">{siteContent.address}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                      <Mail size={16} className="text-[#e6007e] shrink-0" />
                      <span className="text-xs text-slate-300">{siteContent.email}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                      <Phone size={16} className="text-[#e6007e] shrink-0" />
                      <span className="text-xs text-slate-300">{siteContent.phone}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                    {siteContent.facebookUrl && (
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                        Facebook Connected
                      </span>
                    )}
                    {siteContent.instagramUrl && (
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                        Instagram Connected
                      </span>
                    )}
                    {siteContent.linkedinUrl && (
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                        LinkedIn Connected
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
