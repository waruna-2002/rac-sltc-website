import React from "react";

export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-[#e6007e] focus:ring-1 focus:ring-[#e6007e] text-sm text-white placeholder-slate-500 outline-none transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}