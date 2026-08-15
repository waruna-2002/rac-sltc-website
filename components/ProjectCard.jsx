"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";

export default function ProjectCard({ title, slug, avenue, date, description, impact, image, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-[#0c1017]/80 border border-slate-800/90 overflow-hidden hover:border-[#e6007e]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(230,0,126,0.25)] backdrop-blur-xl cursor-pointer"
    >
      <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-slate-500 text-xs font-medium">
            ROTARACT SLTC
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-transparent opacity-90" />
        
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d94] bg-[#0c1017]/90 px-3 py-1 rounded-full border border-[#e6007e]/40 backdrop-blur-md">
            {avenue}
          </span>
        </div>

        <div className="absolute top-4 right-4 bg-[#0c1017]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-700/60">
          <Calendar size={11} className="text-[#e6007e]" />
          <span>{date}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ff4d94] transition-colors leading-snug line-clamp-1">
            {title}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 font-light line-clamp-3">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-bold text-cyan-400 text-[11px] tracking-wide">{impact}</span>
          <span
            className="text-[#e6007e] font-bold hover:text-white transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}