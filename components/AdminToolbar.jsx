"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  Edit3, 
  Eye, 
  EyeOff, 
  ChevronUp 
} from "lucide-react";

export default function AdminToolbar() {
  const { 
    isAdmin, 
    isSuperAdmin, 
    isProjectEditor, 
    logoutAdmin, 
    editMode, 
    toggleEditMode,
    isToolbarMinimized,
    toggleToolbarMinimize
  } = useAdmin();

  if (!isAdmin) return null;

  // Discreet floating button when toolbar is minimized
  if (isToolbarMinimized) {
    return (
      <button
        type="button"
        onClick={toggleToolbarMinimize}
        className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-full bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-pink-300/40 cursor-pointer backdrop-blur-md"
        title="Open Admin Bar"
      >
        <ShieldCheck size={16} />
        <span>Admin Controls</span>
        <ChevronUp size={14} />
      </button>
    );
  }

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
          {isSuperAdmin ? "MASTER ADMIN ACTIVE" : "PROJECT EDITOR ACTIVE"}
        </span>
        <span className="hidden md:inline-block text-[11px] font-normal text-white/90 bg-black/25 px-2 py-0.5 rounded-md">
          {editMode ? "✏️ In-Page Edit Badges Visible" : "👁️ Clean Normal Preview Mode"}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle between Clean Normal View and On-Page Edit Buttons */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={toggleEditMode}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              editMode
                ? "bg-white text-[#e6007e] border-white shadow-md font-black"
                : "bg-black/35 hover:bg-black/55 text-white border-white/30"
            }`}
            title={editMode ? "Switch to clean normal view (hide edit buttons)" : "Show on-page edit buttons"}
          >
            {editMode ? <Edit3 size={13} /> : <Eye size={13} />}
            <span>{editMode ? "Edit Badges: ON" : "Edit Badges: OFF"}</span>
          </button>
        )}

        <Link
          href="/admin?tab=overview"
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
          type="button"
          onClick={toggleToolbarMinimize}
          className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white font-medium flex items-center gap-1 transition-colors border border-white/20 text-xs cursor-pointer"
          title="Minimize toolbar to corner"
        >
          <EyeOff size={13} />
          <span className="hidden sm:inline">Minimize</span>
        </button>

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
