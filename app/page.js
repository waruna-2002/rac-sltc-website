"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import AvenueCard from "@/components/AvenueCard";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import { getStoredProjects } from "@/lib/projectsStore";
import { getStoredAvenues, updateAvenue } from "@/lib/avenuesStore";
import { getStoredSiteContent, saveStoredSiteContent } from "@/lib/siteStore";
import { useAdmin } from "@/context/AdminContext";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Target, Sparkles, Rocket, Edit3, Save, X, Upload } from "lucide-react";

export default function HomePage() {
  const { isAdmin, isSuperAdmin } = useAdmin();
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectsList, setProjectsList] = useState([]);
  const [avenuesList, setAvenuesList] = useState([]);
  const [siteContent, setSiteContent] = useState({});

  // In-Context Avenue Editing Modal State
  const [editingAvenue, setEditingAvenue] = useState(null);
  const [isEditingWhoWeAre, setIsEditingWhoWeAre] = useState(false);

  useEffect(() => {
    // 1. Initial cached / stored projects
    setProjectsList(getStoredProjects().filter((p) => (p.status || "approved") === "approved"));
    setAvenuesList(getStoredAvenues());
    setSiteContent(getStoredSiteContent());

    // 2. Fetch latest approved projects dynamically from MongoDB API
    fetch("/api/projects?status=approved")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProjectsList(json.data);
        }
      })
      .catch((err) => console.log("Database fetch fallback:", err));
  }, []);

  const handleSaveAvenueEdit = (e) => {
    e.preventDefault();
    if (!editingAvenue) return;
    const updated = updateAvenue(editingAvenue.id, editingAvenue);
    setAvenuesList(updated);
    setEditingAvenue(null);
  };

  const handleSaveWhoWeAre = (e) => {
    e.preventDefault();
    saveStoredSiteContent(siteContent);
    setIsEditingWhoWeAre(false);
  };

  const handleWhoWeArePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === "string") {
        const updated = saveStoredSiteContent({ whoWeAreImage: evt.target.result });
        setSiteContent(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-20 pb-20 bg-[#07090e] overflow-hidden">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Key Live Stats */}
      <StatsCounter />

      {/* 3. Who We Are Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative group">
        {/* ADMIN IN-CONTEXT EDIT BADGE FOR WHO WE ARE */}
        {isSuperAdmin && (
          <button
            onClick={() => setIsEditingWhoWeAre(true)}
            className="absolute top-2 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 border border-pink-300/40 cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Who We Are</span>
          </button>
        )}

        <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#e6007e]/10 blur-[130px] rounded-full pointer-events-none -z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
              <Sparkles size={12} />
              <span>WHO WE ARE</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light sm:font-normal tracking-[0.14em] sm:tracking-[0.2em] uppercase text-white leading-tight mb-5">
              {siteContent.whoWeAreTitle || "Empowering Leaders, Transforming Communities."}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 font-light">
              {siteContent.whoWeAreDescription || "The Rotaract Club of SLTC brings together passionate undergraduates dedicated to leadership, tech innovation, and humanitarian service."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-[#e6007e] mb-3">
                  <Target size={20} />
                </div>
                <h4 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">Our Mission</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {siteContent.missionText || "To foster responsible youth leadership through impactful service above self."}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 hover:border-[#e6007e]/50 backdrop-blur-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-3">
                  <Eye size={20} />
                </div>
                <h4 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">Our Vision</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {siteContent.visionText || "Building an inspired university community dedicated to social impact."}
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative group"
          >
            {/* ADMIN PHOTO UPLOAD BADGE ON IMAGE */}
            {isSuperAdmin && (
              <label className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 border border-pink-300/40 cursor-pointer">
                <Upload size={13} />
                <span>Upload New Chapter Photo</span>
                <input type="file" accept="image/*" onChange={handleWhoWeArePhotoUpload} className="hidden" />
              </label>
            )}

            <div className="absolute -inset-1 bg-gradient-to-r from-[#e6007e] to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
              <Image
                src={siteContent.whoWeAreImage || "/images/hero.jpg"}
                alt="SLTC Rotaract Youth Leaders"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold tracking-widest text-[#ff4d94] uppercase bg-[#0c1017]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#e6007e]/40">
                  SLTC Research University Chapter
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Our Avenues of Service */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
            <Rocket size={12} />
            <span>OUR AVENUES OF SERVICE</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light sm:font-normal tracking-[0.14em] sm:tracking-[0.2em] uppercase text-white leading-tight">
            Areas of <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e]">Impact</span>
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3 font-light">
            Explore the core avenues through which our members drive positive transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {avenuesList.map((ave) => (
            <AvenueCard
              key={ave.id}
              {...ave}
              onEdit={() => setEditingAvenue(ave)}
            />
          ))}
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
              <Sparkles size={12} />
              <span>PORTFOLIO</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light sm:font-normal tracking-[0.14em] sm:tracking-[0.2em] uppercase text-white leading-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff66ab] to-[#e6007e]">Projects</span>
            </h3>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#e6007e] hover:text-white transition-colors uppercase tracking-widest bg-slate-900 border border-slate-800 hover:border-[#e6007e] px-4 py-2.5 rounded-xl self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projectsList.slice(0, 3).map((proj) => (
            <ProjectCard
              key={proj.id}
              {...proj}
              onClick={() => setSelectedProject(proj)}
            />
          ))}
        </div>
      </section>

      {/* 6. Upcoming Events & Club Initiatives */}
      <UpcomingEventsSection />

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* IN-CONTEXT AVENUE EDIT MODAL */}
      {editingAvenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingAvenue(null)} />
          <form
            onSubmit={handleSaveAvenueEdit}
            className="relative w-full max-w-md p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Edit Service Avenue Details</h3>
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue Title</label>
              <input
                type="text"
                value={editingAvenue.title}
                onChange={(e) => setEditingAvenue({ ...editingAvenue, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Tagline</label>
              <input
                type="text"
                value={editingAvenue.subtitle}
                onChange={(e) => setEditingAvenue({ ...editingAvenue, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={editingAvenue.description}
                onChange={(e) => setEditingAvenue({ ...editingAvenue, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setEditingAvenue(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase">Save Avenue</button>
            </div>
          </form>
        </div>
      )}

      {/* IN-CONTEXT WHO WE ARE EDIT MODAL */}
      {isEditingWhoWeAre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditingWhoWeAre(false)} />
          <form
            onSubmit={handleSaveWhoWeAre}
            className="relative w-full max-w-lg p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Edit Who We Are Section</h3>
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Main Headline</label>
              <input
                type="text"
                value={siteContent.whoWeAreTitle || ""}
                onChange={(e) => setSiteContent({ ...siteContent, whoWeAreTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Description Paragraph</label>
              <textarea
                rows={3}
                value={siteContent.whoWeAreDescription || ""}
                onChange={(e) => setSiteContent({ ...siteContent, whoWeAreDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Our Mission</label>
              <input
                type="text"
                value={siteContent.missionText || ""}
                onChange={(e) => setSiteContent({ ...siteContent, missionText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Our Vision</label>
              <input
                type="text"
                value={siteContent.visionText || ""}
                onChange={(e) => setSiteContent({ ...siteContent, visionText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsEditingWhoWeAre(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase">Save Section</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}