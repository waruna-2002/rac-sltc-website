"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, ArrowRight, Sparkles, CheckCircle2, Users } from "lucide-react";

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl rounded-3xl bg-[#0c1017] border border-slate-800 overflow-hidden shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0c1017]/80 backdrop-blur-md border border-slate-700/80 hover:border-[#e6007e] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-30"
          >
            <X size={18} />
          </button>

          {/* Project Image Banner */}
          <div className="relative h-56 sm:h-64 bg-slate-900 shrink-0 overflow-hidden">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm">
                ROTARACT SLTC PROJECT
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/40 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#ff4d94] bg-[#0c1017]/90 px-3 py-1 rounded-full border border-[#e6007e]/40 backdrop-blur-md">
                {project.avenue}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1.5 bg-[#0c1017]/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 font-semibold">
                <Calendar size={13} className="text-[#e6007e]" />
                {project.date}
              </span>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {project.title}
              </h3>
              <p className="text-cyan-400 font-bold text-xs mt-1 tracking-wide flex items-center gap-1.5">
                <Tag size={13} />
                <span>{project.impact}</span>
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#e6007e]" />
                <span>Project Overview</span>
              </h4>
              <p>{project.fullDescription || project.description}</p>
            </div>

            {/* Key Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Key Milestones & Impact</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {project.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e6007e] mt-1.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-6 border-t border-slate-800/80 bg-[#07090e] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Users size={14} className="text-[#e6007e]" />
              <span>{project.organizers || "Rotaract SLTC Team"}</span>
            </div>

            <Link
              href={`/projects/${project.slug}`}
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#e6007e]/30 flex items-center justify-center gap-2"
            >
              <span>Dedicated Project Page</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
