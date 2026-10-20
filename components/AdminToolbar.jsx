"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { ShieldCheck, LogOut, LayoutDashboard, PlusCircle, UserPlus, Edit3 } from "lucide-react";

export default function AdminToolbar() {
  const { isAdmin, isSuperAdmin, isProjectEditor, logoutAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 text-white py-2 px-4 shadow-xl border-b text-xs font-bold flex flex-wrap items-center justify-between gap-3 backdrop-blur-md ${
        isSuperAdmin
          ? "bg-[#e6007e] border-pink-400/40"
          : "bg-cyan-700 border-cyan-500/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <ShieldCheck size={16} />
        <span className="uppercase tracking-widest font-black">
          {isSuperAdmin ? "MASTER ADMIN EDIT MODE ACTIVE" : "PROJECT EDITOR MODE ACTIVE"}
        </span>
        <span className="hidden sm:inline-block text-[11px] font-normal text-white/90 bg-black/25 px-2 py-0.5 rounded-md">
          {isSuperAdmin
            ? "Full website editing access granted!"
            : "Project approvals & project catalog editing enabled"}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/admin"
          className="px-3 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white font-bold flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <LayoutDashboard size={13} />
          <span>Dashboard</span>
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
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
