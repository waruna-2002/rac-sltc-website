"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Mail, Award, GraduationCap, Sparkles } from "lucide-react";

const LinkedinIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function MemberModal({ member, onClose }) {
  if (!member) return null;

  const isPresident = member.role.trim().toLowerCase() === "president";
  const hasCustomImage = member.image && member.image !== "/images/team/placeholder.jpg";

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
          className={`relative w-full max-w-lg rounded-3xl bg-[#0c1017] border overflow-hidden shadow-2xl z-10 p-6 sm:p-8 ${
            isPresident
              ? "border-2 border-[#e6007e] shadow-[0_0_50px_rgba(230,0,126,0.4)]"
              : "border-slate-800"
          }`}
        >
          {/* Top Neon Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#e6007e]/20 blur-[80px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-[#e6007e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
          >
            <X size={18} />
          </button>

          {/* Header Info */}
          <div className="flex flex-col items-center text-center relative z-10">
            {isPresident && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#e6007e]/50 border border-pink-400/40">
                <Crown size={12} className="text-yellow-300" />
                <span>CLUB PRESIDENT</span>
              </div>
            )}

            <div
              className={`relative rounded-full overflow-hidden mb-4 ${
                isPresident
                  ? "w-28 h-28 sm:w-32 sm:h-32 border-4 border-[#e6007e] shadow-[0_0_30px_rgba(230,0,126,0.6)]"
                  : "w-24 h-24 border-2 border-slate-700/80 bg-slate-900"
              }`}
            >
              {hasCustomImage ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400 bg-slate-800">
                  {member.name.split(" ").slice(1, 3).map(n => n[0]).join("")}
                </div>
              )}
            </div>

            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {member.name}
            </h3>

            <p className="text-xs font-bold uppercase tracking-wider text-[#e6007e] mt-1">
              {member.role} • <span className="text-slate-400">{member.category}</span>
            </p>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
              <GraduationCap size={15} className="text-cyan-400" />
              <span>{member.faculty}</span>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 leading-relaxed relative z-10">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#e6007e]" />
                <span>About Leader</span>
              </h4>
              <p className="font-light text-slate-300">
                {member.bio || "Dedicated member driving youth initiatives and social change at Rotaract SLTC."}
              </p>
            </div>

            {/* Achievements */}
            {member.achievements && member.achievements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award size={13} className="text-yellow-400" />
                  <span>Key Highlights</span>
                </h4>
                <ul className="space-y-1.5">
                  {member.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e6007e] mt-1.5 shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Contact Actions */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {member.email ? (
              <a
                href={`mailto:${member.email}`}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-[#e6007e] px-3.5 py-2 rounded-xl transition-all"
              >
                <Mail size={14} className="text-[#e6007e]" />
                <span>{member.email}</span>
              </a>
            ) : (
              <span className="text-xs text-slate-500">Rotaract SLTC Chapter</span>
            )}

            <div className="flex items-center gap-3">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#e6007e] hover:bg-[#e6007e]/10 transition-colors"
                >
                  <LinkedinIcon />
                </a>
              )}
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#e6007e] hover:bg-[#e6007e]/10 transition-colors"
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
