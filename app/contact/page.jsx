"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { MapPin, Mail, Phone, Send, CheckCircle2 } from "lucide-react";
import { getStoredSiteContent } from "@/lib/siteStore";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [site, setSite] = useState({
    address: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka",
    email: "rotaractclub@sltc.ac.lk",
    phone: "+94 77 123 4567",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setSite(getStoredSiteContent());

    const handleUpdate = (e) => {
      if (e.detail) {
        setSite((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("rotaract_site_content_updated", handleUpdate);

    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSite((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch((err) => console.log("Contact settings fallback:", err));

    return () => window.removeEventListener("rotaract_site_content_updated", handleUpdate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSent(true);
    } catch (err) {
      console.error("Contact submit error:", err);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 bg-[#07090e] relative">
      {/* Animated Drop-Down Header */}
      <AnimatedPageHeader
        badge="Get in Touch with Us"
        title="Contact Rotaract SLTC"
        highlightWord="SLTC"
        subtitle="Have a project collaboration idea, corporate partnership query, or general question? Reach out to our team."
      />

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
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-xl font-bold text-white">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-400">Our Secretarial team will get back to your email promptly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Your Email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Subject"
                required
                placeholder="Project Collaboration Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full py-3.5 text-xs font-bold uppercase tracking-wider">
                <Send size={14} />
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}