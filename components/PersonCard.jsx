"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, UserCheck, Edit3 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function PersonCard({ id, name, role, faculty, image, linkedin, instagram, onClick }) {
  const { isAdmin } = useAdmin();
  const isPresident = role && role.trim().toLowerCase() === "president";
  const hasCustomImage = image && image !== "/images/team/placeholder.jpg";

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, scale: isPresident ? 1.03 : 1.02 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden backdrop-blur-xl cursor-pointer ${
        isPresident
          ? "bg-gradient-to-b from-[#e6007e]/20 via-[#0c1017] to-[#0c1017] border-2 border-[#e6007e] shadow-[0_0_40px_rgba(230,0,126,0.35)] col-span-1 md:col-span-2 lg:col-span-1"
          : "bg-[#0c1017]/80 border border-slate-800/90 hover:border-[#e6007e]/60 shadow-xl hover:shadow-[0_0_25px_rgba(230,0,126,0.2)]"
      }`}
    >
      {/* ADMIN IN-CONTEXT EDIT BADGE ON PERSON CARD */}
      {isAdmin && (
        <a
          href="/admin"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1 border border-pink-300/40"
        >
          <Edit3 size={11} />
          <span>Edit Member</span>
        </a>
      )}

      {/* President Top Cyber Highlight Badge */}
      {isPresident && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#e6007e]/50 border border-pink-400/40">
          <Crown size={12} className="text-yellow-300" />
          <span>CLUB PRESIDENT</span>
        </div>
      )}

      {/* Avatar Display */}
      <div
        className={`relative rounded-full overflow-hidden mb-4 transition-all duration-300 ${
          isPresident
            ? "w-28 h-28 sm:w-32 sm:h-32 border-4 border-[#e6007e] shadow-[0_0_25px_rgba(230,0,126,0.6)] group-hover:scale-105"
            : "w-24 h-24 border-2 border-slate-700/80 group-hover:border-[#e6007e] group-hover:scale-105 bg-slate-900"
        }`}
      >
        {hasCustomImage ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400 group-hover:text-white bg-slate-800">
            {name.split(" ").slice(1, 3).map(n => n[0]).join("")}
          </div>
        )}
      </div>

      <h4
        className={`font-extrabold text-white group-hover:text-[#ff4d94] transition-colors leading-tight ${
          isPresident ? "text-lg sm:text-xl" : "text-base"
        }`}
      >
        {name}
      </h4>

      <p
        className={`text-xs font-bold uppercase tracking-wider mt-1.5 ${
          isPresident ? "text-[#ff4d94]" : "text-[#e6007e]"
        }`}
      >
        {role}
      </p>

      <p className="text-[11px] text-slate-400 mt-1 mb-4 font-light">
        {faculty}
      </p>

      {/* View Profile Indicator Button */}
      <div className="mb-4 inline-flex items-center gap-1 text-[10px] font-bold text-[#e6007e] group-hover:text-white uppercase tracking-wider bg-[#e6007e]/10 group-hover:bg-[#e6007e] px-3 py-1 rounded-full transition-colors border border-[#e6007e]/30">
        <UserCheck size={12} />
        <span>View Profile</span>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-800/80 w-full justify-center">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${name}'s LinkedIn`}
            className="w-8.5 h-8.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#e6007e] hover:bg-[#e6007e]/10 transition-colors"
          >
            <LinkedinIcon />
          </a>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${name}'s Instagram`}
            className="w-8.5 h-8.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#e6007e] hover:bg-[#e6007e]/10 transition-colors"
          >
            <InstagramIcon />
          </a>
        )}
      </div>
    </motion.div>
  );
}