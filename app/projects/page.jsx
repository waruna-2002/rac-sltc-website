"use client";

import React, { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import { getStoredProjects } from "@/lib/projectsStore";
import Link from "next/link";
import { Search, Sparkles, PlusCircle } from "lucide-react";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    setAllProjects(getStoredProjects());
  }, []);

  const avenues = [
    "All",
    "Community Service",
    "Professional Development",
    "Digital & IT",
    "Club Service",
    "International Service"
  ];

  // Show only approved projects on public view
  const approvedProjects = allProjects.filter((p) => (p.status || "approved") === "approved");

  const filteredProjects = approvedProjects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesAvenue = selectedAvenue === "All" || p.avenue === selectedAvenue;
    return matchesSearch && matchesAvenue;
  });

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#07090e]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
            <Sparkles size={12} />
            <span>PORTFOLIO OF IMPACT</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">Projects</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
            Explore the high-impact initiatives and activities conducted across our service avenues. Click on any project card for instant details.
          </p>
        </div>

        <Link
          href="/projects/submit"
          className="px-6 py-3.5 rounded-2xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(230,0,126,0.4)] inline-flex items-center gap-2 shrink-0 border border-pink-400/30"
        >
          <PlusCircle size={16} />
          <span>Submit a Project</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1017] border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#e6007e] outline-none transition-all"
          />
        </div>

        {/* Avenue Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {avenues.map((ave) => (
            <button
              key={ave}
              onClick={() => setSelectedAvenue(ave)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedAvenue === ave
                  ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                  : "bg-[#0c1017] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {ave}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 text-sm">
          No approved projects found matching your criteria.
        </div>
      )}

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}