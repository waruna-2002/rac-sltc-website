"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import projectsData from "@/data/projects.json";
import { ArrowLeft, Calendar, Tag, Users, FolderArchive, ExternalLink } from "lucide-react";

export default function SingleProjectPage() {
  const params = useParams();
  const slug = params?.slug;

  const localProject = (projectsData || []).find((p) => p.slug === slug) || {
    title: "Project Details",
    avenue: "Community Service Avenue",
    date: "2026",
    description: "Detailed description of the project initiatives and community impact.",
    impact: "Impactful Project"
  };

  const [project, setProject] = useState(localProject);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/projects/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProject(json.data);
        }
      })
      .catch((err) => console.log("Single project fetch fallback:", err));
  }, [slug]);

  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-8 bg-[#07090e]">
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

      {/* Hero Showcase Photo */}
      <div className="relative h-80 sm:h-96 rounded-2xl bg-[#0e131d] border border-slate-800 overflow-hidden flex items-center justify-center">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">
            Rotaract Club of SLTC Research University
          </div>
        )}
      </div>

      {/* Google Drive Full Album Link */}
      {project.driveLink && (
        <a
          href={project.driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-5 rounded-2xl bg-[#0c1017] border border-[#e6007e]/40 hover:border-[#e6007e] transition-all group shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6007e]/20 text-[#e6007e] flex items-center justify-center font-bold shrink-0">
              <FolderArchive size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#e6007e] transition-colors flex items-center gap-1.5">
                <span>Full Photo &amp; Video Album (Google Drive)</span>
                <ExternalLink size={13} className="text-[#e6007e]" />
              </h4>
              <p className="text-xs text-slate-400">
                View all high-resolution event photos and video footage in the cloud folder
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#e6007e] group-hover:underline hidden sm:inline">
            Open Drive Folder ↗
          </span>
        </a>
      )}

      {/* Project Leadership Committee */}
      {(project.projectChair || project.projectSecretary || project.projectTreasurer) && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Users size={15} className="text-[#e6007e]" />
            <span>Project Leadership Committee</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {project.projectChair && (
              <div className="p-3 rounded-xl bg-[#0c1017] border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Chairperson</span>
                <span className="text-xs font-bold text-white block mt-0.5">{project.projectChair}</span>
              </div>
            )}
            {project.projectSecretary && (
              <div className="p-3 rounded-xl bg-[#0c1017] border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Secretary</span>
                <span className="text-xs font-bold text-white block mt-0.5">{project.projectSecretary}</span>
              </div>
            )}
            {project.projectTreasurer && (
              <div className="p-3 rounded-xl bg-[#0c1017] border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Treasurer</span>
                <span className="text-xs font-bold text-white block mt-0.5">{project.projectTreasurer}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        <h3 className="text-xl font-bold text-white">Project Overview</h3>
        <p>{project.fullDescription || project.description}</p>
      </div>
    </div>
  );
}