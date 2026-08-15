"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function JoinUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    faculty: "Computing & IT",
    avenues: [],
    reason: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-4xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#e6007e] uppercase mb-2 block">
          BECOME A ROTARACTOR
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Join the Movement
        </h1>
        <p className="text-slate-400 text-sm mt-3">
          Step up, build your leadership potential, connect with inspiring peers, and serve the community.
        </p>
      </div>

      {submitted ? (
        <div className="p-10 rounded-2xl bg-[#0e131d] border border-[#e6007e]/50 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Thank you for applying to join the Rotaract Club of SLTC. Our membership team will contact you soon via WhatsApp / Email.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-2xl bg-[#0e131d] border border-slate-800 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Waruna Chandima"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@sltc.ac.lk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="WhatsApp / Phone Number"
              required
              placeholder="+94 77 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="SLTC Student Registration No."
              required
              placeholder="e.g. AA1234"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Faculty / Department
            </label>
            <select
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none"
            >
              <option value="Computing & IT">Faculty of Computing & IT</option>
              <option value="Engineering">Faculty of Engineering</option>
              <option value="Technology">Faculty of Technology</option>
              <option value="Business">Faculty of Business</option>
              <option value="Science">Faculty of Science</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Why do you want to join SLTC Rotaract?
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your interests, skills, or expectations..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-[#e6007e] outline-none"
            />
          </div>

          <Button type="submit" className="w-full py-3.5 text-sm">
            <Sparkles size={16} />
            <span>Submit Application</span>
          </Button>
        </form>
      )}
    </div>
  );
}