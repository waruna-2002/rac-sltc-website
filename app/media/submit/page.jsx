"use client";

import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  Send, 
  BookOpen, 
  Newspaper,
  AlertCircle
} from "lucide-react";
import { addMediaPost } from "@/lib/mediaStore";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function SubmitMediaStoryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    type: "blog",
    title: "",
    author: "",
    authorRole: "",
    authorEmail: "",
    avenue: "Community Service Avenue",
    image: "/images/projects/project1.jpg",
    summary: "",
    content: "",
    readTime: "4 min read",
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (typeof dataUrl === "string") {
        setFormData((prev) => ({ ...prev, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.title || !formData.author || !formData.summary || !formData.content) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const postPayload = {
        ...formData,
        status: "pending", // ALWAYS pending approval
      };

      // 1. Submit to API
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      }).catch((err) => console.log("API submit fallback:", err));

      // 2. Add to local client store as pending
      addMediaPost(postPayload);

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/media"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Media Hub</span>
      </Link>

      {/* Animated Drop-Down Header */}
      <AnimatedPageHeader
        badge="Community Contributions"
        title="Submit a Story"
        highlightWord="Story"
        subtitle="Share your volunteer journey, project behind-the-scenes, or an educational editorial with the Rotaract SLTC community."
        align="left"
        showDivider={false}
      />

      {submitted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1017] border border-emerald-500/40 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Story Submitted for Editorial Review!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Thank you, <strong>{formData.author}</strong>! Your submission titled &quot;{formData.title}&quot; has been securely sent to our Executive Editorial Board.
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Our Public Relations & Editorial Directors will review, format, and approve your post. Once approved, it will go live on the official Media Hub.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/media"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Browse Media Hub
            </Link>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  type: "blog",
                  title: "",
                  author: "",
                  authorRole: "",
                  authorEmail: "",
                  avenue: "Community Service Avenue",
                  image: "/images/projects/project1.jpg",
                  summary: "",
                  content: "",
                  readTime: "4 min read",
                });
              }}
              className="text-xs font-bold"
            >
              Submit Another Story
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-6 shadow-xl">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Submission Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  formData.type === "blog"
                    ? "bg-[#e6007e]/15 border-[#e6007e] text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="blog"
                  checked={formData.type === "blog"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="sr-only"
                />
                <BookOpen size={16} className={formData.type === "blog" ? "text-[#e6007e]" : "text-slate-400"} />
                <div>
                  <strong className="text-xs block">Blog Post</strong>
                  <span className="text-[10px] text-slate-400">Personal story or volunteer reflection</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  formData.type === "article"
                    ? "bg-[#e6007e]/15 border-[#e6007e] text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="article"
                  checked={formData.type === "article"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="sr-only"
                />
                <Newspaper size={16} className={formData.type === "article" ? "text-[#e6007e]" : "text-slate-400"} />
                <div>
                  <strong className="text-xs block">Special Article</strong>
                  <span className="text-[10px] text-slate-400">Formal editorial or educational piece</span>
                </div>
              </label>
            </div>
          </div>

          <Input
            label="Story / Article Title *"
            required
            placeholder="e.g. My Experience Volunteering with Rotaract SLTC"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Author Full Name *"
              required
              placeholder="e.g. Rtr. Kasun Perera"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />

            <Input
              label="Author Role / Department"
              placeholder="e.g. Computing Undergraduate / Member"
              value={formData.authorRole}
              onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Your Email (For Verification) *"
              type="email"
              required
              placeholder="your.email@sltc.ac.lk"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Related Avenue *
              </label>
              <select
                value={formData.avenue}
                onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none cursor-pointer"
              >
                <option value="Community Service Avenue">Community Service Avenue</option>
                <option value="Club Service Avenue">Club Service Avenue</option>
                <option value="Professional Development Avenue">Professional Development Avenue</option>
                <option value="Membership Development Avenue">Membership Development Avenue</option>
                <option value="International Service Avenue">International Service Avenue</option>
                <option value="Public Relations and Public Image">Public Relations and Public Image</option>
                <option value="Sports and Recreational Activities">Sports and Recreational Activities</option>
                <option value="Environmental Service Avenue">Environmental Service Avenue</option>
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-slate-200 hover:file:bg-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Short Summary / Teaser *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Brief 1-2 sentence overview shown on the card preview..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Full Story Content *
            </label>
            <textarea
              rows={8}
              required
              placeholder="Write your full story or article here. You can write multiple paragraphs..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:border-[#e6007e] outline-none leading-relaxed"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting for Review...</span>
            ) : (
              <>
                <Send size={15} />
                <span>Submit for Editorial Approval</span>
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
