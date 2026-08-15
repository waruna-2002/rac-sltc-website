"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MapPin, Mail, Phone, Send } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#e6007e] uppercase mb-2 block">
          GET IN TOUCH
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Contact Us
        </h1>
        <p className="text-slate-400 text-sm mt-3">
          Have a project idea, partnership inquiry, or question? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="p-8 rounded-2xl bg-[#0e131d] border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Club Secretarial Office</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#e6007e] shrink-0 mt-1" size={18} />
                <span>
                  SLTC Research University,<br />
                  Ingiriya Road, Padukka, Sri Lanka
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-[#e6007e] shrink-0" size={18} />
                <span>rotaract@sltc.ac.lk</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-[#e6007e] shrink-0" size={18} />
                <span>+94 77 123 4567</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            Official Club Charter Affiliation: Rotary International District 3220
          </div>
        </div>

        {/* Form */}
        <div className="p-8 rounded-2xl bg-[#0e131d] border border-slate-800">
          {sent ? (
            <div className="text-center py-12 space-y-2">
              <h4 className="text-lg font-bold text-white">Message Sent!</h4>
              <p className="text-xs text-slate-400">We will respond to your message promptly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Your Name" required placeholder="John Doe" />
              <Input label="Your Email" type="email" required placeholder="john@example.com" />
              <Input label="Subject" required placeholder="Collaboration Inquiry" />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none"
                />
              </div>
              <Button type="submit" className="w-full">
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