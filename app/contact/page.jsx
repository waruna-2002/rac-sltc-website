"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MapPin, Mail, Phone, Send, Sparkles, Edit3 } from "lucide-react";
import { getStoredSiteContent } from "@/lib/siteStore";
import { useAdmin } from "@/context/AdminContext";

export default function ContactPage() {
  const { isAdmin, isSuperAdmin, openEditModal } = useAdmin();
  const [sent, setSent] = useState(false);
  const [site, setSite] = useState({
    address: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka",
    email: "rotaract@sltc.ac.lk",
    phone: "+94 77 123 4567",
  });

  useEffect(() => {
    setSite(getStoredSiteContent());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 bg-[#07090e] relative">
      {/* ADMIN IN-CONTEXT EDIT BADGE */}
      {isSuperAdmin && (
        <button
          onClick={() => openEditModal("contact")}
          className="absolute top-24 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 border border-pink-300/40 cursor-pointer"
        >
          <Edit3 size={14} />
          <span>Edit Contact Section</span>
        </button>
      )}

      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
          <Sparkles size={12} />
          <span>GET IN TOUCH WITH US</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6007e] via-[#ff4d94] to-cyan-300">Rotaract SLTC</span>
        </h1>
        <p className="text-slate-300 text-sm mt-3 font-light leading-relaxed">
          Have a project collaboration idea, corporate partnership query, or general question? Reach out to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Official Contact Info */}
        <div className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Club Secretarial Office</h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-light">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#e6007e] shrink-0 mt-1" size={18} />
                <span>{site.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-[#e6007e] shrink-0" size={18} />
                <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">
                  {site.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-[#e6007e] shrink-0" size={18} />
                <a href={`tel:${site.phone}`} className="hover:text-white transition-colors">
                  {site.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-medium">
            Official Club Charter Affiliation: Rotary International District 3220
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c1017] border border-slate-800">
          {sent ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h4 className="text-xl font-bold text-white">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-400">Our Secretarial team will get back to your email promptly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Your Name" required placeholder="John Doe" />
              <Input label="Your Email" type="email" required placeholder="john@example.com" />
              <Input label="Subject" required placeholder="Project Collaboration Inquiry" />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>
              <Button type="submit" className="w-full py-3.5 text-xs font-bold uppercase tracking-wider">
                <Send size={14} />
                <span>Send Message</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}