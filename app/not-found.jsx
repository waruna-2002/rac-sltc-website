import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 flex items-center justify-center text-[#e6007e] font-black text-2xl mb-6 shadow-lg shadow-[#e6007e]/20">
        404
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md inline-flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}