"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import AvenueCard from "@/components/AvenueCard";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import { getStoredProjects } from "@/lib/projectsStore";
import { getStoredAvenues } from "@/lib/avenuesStore";
import { getStoredSiteContent } from "@/lib/siteStore";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Target } from "lucide-react";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [avenuesList, setAvenuesList] = useState([]);
  const [siteContent, setSiteContent] = useState({});

  useEffect(() => {
    // 1. Initial cached / stored data
    setProjectsList(getStoredProjects().filter((p) => (p.status || "approved") === "approved"));
    setAvenuesList(getStoredAvenues());
    setSiteContent(getStoredSiteContent());

    const handleUpdate = (e) => {
      if (e.detail) {
        setSiteContent((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("rotaract_site_content_updated", handleUpdate);

    // 2. Fetch latest approved projects dynamically from MongoDB API
    fetch("/api/projects?status=approved")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProjectsList(json.data);
        }
      })
      .catch((err) => console.log("Database fetch fallback:", err));

    // 3. Fetch latest site content from MongoDB settings API
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteContent((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch((err) => console.log("Settings API fallback:", err));

    return () => window.removeEventListener("rotaract_site_content_updated", handleUpdate);
  }, []);

  return (
    <div className="space-y-20 pb-20 bg-transparent overflow-hidden">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Key Live Stats */}
      <StatsCounter />

      {/* 3. Who We Are Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative group">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#e6007e]/10 blur-[130px] rounded-full pointer-events-none -z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-[#e6007e] uppercase mb-3">
              Who We Are
            </p>

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
            <div className="absolute -inset-1 bg-[#e6007e]/10 rounded-2xl blur-md transition duration-500" />
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
              <Image
                src={siteContent.whoWeAreImage || "/images/hero.jpg"}
                alt="SLTC Rotaract Youth Leaders"
                fill
                priority
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017]/80 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Our Avenues of Service */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-bold tracking-[0.2em] text-[#e6007e] uppercase mb-3">
            Our Avenues of Service
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Driving Action Across Key Frontiers
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Explore the core avenues through which our members drive positive transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {avenuesList.map((ave) => (
            <AvenueCard
              key={ave.id}
              {...ave}
            />
          ))}
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#e6007e] uppercase mb-3">
              Portfolio
            </p>
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light sm:font-normal tracking-[0.14em] sm:tracking-[0.2em] uppercase text-white leading-tight">
              FEATURED PROJECTS
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              A glimpse into our recent grassroots initiatives, community development missions, and professional breakthroughs.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e6007e] hover:text-white transition-colors group self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {projectsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectsList.slice(0, 3).map((project) => (
              <ProjectCard
                key={project._id || project.id || project.slug}
                {...project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#0c1017]/50 border border-slate-800/80 text-slate-500 text-xs">
            New community initiatives and avenue projects will be published soon.
          </div>
        )}
      </section>

      {/* 6. Upcoming Events */}
      <UpcomingEventsSection />

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
