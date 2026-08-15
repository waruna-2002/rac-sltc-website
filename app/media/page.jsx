"use client";

import React from "react";
import { Download, ExternalLink } from "lucide-react";

export default function MediaPage() {
  const bulletins = [
    { title: "SLTC Rotaract Quarterly Bulletin - Q1", date: "Jan 2026", size: "3.2 MB" },
    { title: "Annual Impact Report 2024-25", date: "Jul 2025", size: "5.8 MB" }
  ];

  return (
    <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#e6007e] uppercase mb-2 block">
          PUBLICATIONS & MEDIA
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Media & Bulletins
        </h1>
        <p className="text-slate-400 text-sm mt-3">
          Explore our latest magazines, newsletters, official press releases, and event albums.
        </p>
      </div>

      {/* Bulletins Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white border-l-2 border-[#e6007e] pl-3">
          Official Bulletins & Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bulletins.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0e131d] border border-slate-800 flex items-center justify-between hover:border-[#e6007e]/60 transition-colors"
            >
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.date} • {item.size}</p>
              </div>
              <button className="p-2.5 rounded-xl bg-slate-900 text-[#e6007e] hover:bg-[#e6007e] hover:text-white transition-colors border border-slate-800">
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery Placeholders */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white border-l-2 border-[#e6007e] pl-3">
          Event Albums
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((img) => (
            <div
              key={img}
              className="h-36 rounded-xl bg-[#0e131d] border border-slate-800 flex items-center justify-center text-xs text-slate-500 hover:border-[#e6007e]/40 transition-colors"
            >
              [ Event Photo {img} ]
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}