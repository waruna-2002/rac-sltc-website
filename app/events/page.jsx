"use client";

import React from "react";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import Link from "next/link";
import { Calendar, PlusCircle, ArrowLeft } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="pt-24 pb-20 bg-[#07090e] min-h-screen">
      {/* Top Banner Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/events/submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#e6007e]/30 transition-all"
        >
          <PlusCircle size={14} />
          <span>Propose Event</span>
        </Link>
      </div>

      {/* Embedded Upcoming Events Section */}
      <UpcomingEventsSection />
    </div>
  );
}
