"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { ShieldCheck, LogOut, LayoutDashboard, PlusCircle, UserPlus, Edit3 } from "lucide-react";

export default function AdminToolbar() {
  const { isAdmin, logoutAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#e6007e] text-white py-2 px-4 shadow-xl border-b border-pink-400/40 text-xs font-bold flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <ShieldCheck size={16} />
        <span className="uppercase tracking-widest font-black">ADMIN IN-CONTEXT EDIT MODE ACTIVE</span>
        <span className="hidden sm:inline-block text-[11px] font-normal text-pink-100 bg-black/20 px-2 py-0.5 rounded-md">
          Hover over any section on the site to edit!
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/admin"
          className="px-3 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white font-bold flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <LayoutDashboard size={13} />
          <span>Full Dashboard</span>
        </Link>

        <Link
          href="/projects/submit"
          className="px-3 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white font-bold flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <PlusCircle size={13} />
          <span>Add Project</span>
        </Link>

        <button
          onClick={logoutAdmin}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
        >
          <LogOut size={13} />
          <span>Logout Admin</span>
        </button>
      </div>
    </div>
  );
}
