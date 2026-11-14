"use client";

import React, { useState, useEffect } from "react";
import ProjectCard from "@/components/ProjectCard";
import ProjectModal from "@/components/ProjectModal";
import { getStoredProjects } from "@/lib/projectsStore";
import Link from "next/link";
import { Search, PlusCircle } from "lucide-react";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedAvenue, setSelectedAvenue] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    // Instant fallback from local cache
    setAllProjects(getStoredProjects());

    // Fetch dynamic project documents from database API
    fetch("/api/projects?status=approved")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAllProjects(json.data);
        }
      })
      .catch((err) => console.log("Database fetch fallback:", err));
  }, []);

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

  // Show only approved projects on public view
  const approvedProjects = allProjects.filter((p) => (p.status || "approved") === "approved");

  const filteredProjects = approvedProjects.filter((p) => {
    const s = (search || "").toLowerCase();
    const matchesSearch =
      !s ||
      (p.title || "").toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s) ||
      (p.avenue || "").toLowerCase().includes(s);
    const pAve = (p.avenue || "").toLowerCase();
    const targetAve = (selectedAvenue || "").toLowerCase();
    const matchesAvenue =
      selectedAvenue === "All" ||
      p.avenue === selectedAvenue ||
      (pAve && targetAve.includes(pAve)) ||
      (pAve && pAve.includes(targetAve.replace(" avenue", "")));
    return matchesSearch && matchesAvenue;
  });

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#07090e]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <AnimatedPageHeader
          badge="Portfolio of Impact"
          title="Our Projects"
          highlightWord="Projects"
          subtitle="Explore the high-impact initiatives and activities conducted across our service avenues. Click on any project card for instant details."
          align="left"
          showDivider={false}
          className="max-w-2xl"
        />

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
              key={project._id || project.id || project.slug}
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