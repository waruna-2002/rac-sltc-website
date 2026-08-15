"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import projectsData from "@/data/projects.json";
import { ArrowLeft, Calendar, Tag, Users } from "lucide-react";

export default function SingleProjectPage() {
  const params = useParams();
  const slug = params?.slug;

  const project = projectsData.find((p) => p.slug === slug) || {
    title: "Project Details",
    avenue: "Initiative",
    date: "2026",
    description: "Detailed description of the project initiatives and community impact.",
    impact: "Impactful Project"
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6007e] hover:underline"
      >
        <ArrowLeft size={14} />
        <span>Back to Projects</span>
      </Link>

      <div className="space-y-4">
        <span className="text-xs font-bold tracking-widest uppercase text-[#e6007e] bg-[#e6007e]/10 px-3 py-1 rounded-md">
          {project.avenue}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-6">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#e6007e]" />
            {project.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag size={14} className="text-[#e6007e]" />
            {project.impact}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-80 rounded-2xl bg-[#0e131d] border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
        [ High-Resolution Project Showcase Photo ]
      </div>

      {/* Content */}
      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        <h3 className="text-xl font-bold text-white">Project Overview</h3>
        <p>{project.description}</p>
        <p>
          Organized by the undergraduates of SLTC Research University, this initiative brought together club members, faculty mentors, and community partners to deliver meaningful results adhering to Rotary ideals.
        </p>

        <h3 className="text-xl font-bold text-white pt-4">Outcomes & Key Milestones</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Direct community engagement and empowerment.</li>
          <li>Hands-on leadership opportunities for student organizers.</li>
          <li>Strengthened collaborative bonds across multiple university faculties.</li>
        </ul>
      </div>
    </div>
  );
}