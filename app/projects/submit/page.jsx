"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredProjects, 
  addProjectSubmission, 
  updateProject 
} from "@/lib/projectsStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  ArrowLeft, 
  FolderPlus, 
  User, 
  Send,
  Upload,
  Video,
  FileImage,
  Trash2
} from "lucide-react";

export default function SubmitProjectPage() {
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "my-submissions"
  const [submitted, setSubmitted] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [myEmail, setMyEmail] = useState("");
  const [projectsList, setProjectsList] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    avenue: "Community Service",
    date: new Date().toISOString().split("T")[0],
    impact: "100+ Participants",
    description: "",
    fullDescription: "",
    image: "/images/projects/project1.jpg",
    images: ["/images/projects/project1.jpg"],
    videoUrl: "",
    submittedBy: "",
  });

  useEffect(() => {
    setProjectsList(getStoredProjects());
  }, [submitted, editingProject]);

  // Handle direct file upload for MULTIPLE photos & videos
  const handleMultipleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") {
          if (file.type.startsWith("video/")) {
            setFormData((prev) => ({ ...prev, videoUrl: dataUrl }));
          } else {
            setFormData((prev) => {
              const updatedImages = [...(prev.images || []), dataUrl];
              return {
                ...prev,
                image: updatedImages[0], // Main cover image is 1st photo
                images: updatedImages,
              };
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoFromGallery = (indexToRemove) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        image: filtered.length > 0 ? filtered[0] : "/images/projects/project1.jpg",
        images: filtered,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, formData);
      setEditingProject(null);
    } else {
      addProjectSubmission(formData);
    }
    setSubmitted(true);
    setMyEmail(formData.submittedBy);
  };

  const startEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title,
      avenue: proj.avenue,
      date: proj.date,
      impact: proj.impact,
      description: proj.description,
      fullDescription: proj.fullDescription || proj.description,
      image: proj.image || "/images/projects/project1.jpg",
      images: (proj.images && proj.images.length > 0) ? proj.images : [proj.image || "/images/projects/project1.jpg"],
      videoUrl: proj.videoUrl || "",
      submittedBy: proj.submittedBy || "",
    });
    setActiveTab("submit");
  };

  const mySubmissions = projectsList.filter(
    (p) => myEmail && p.submittedBy?.toLowerCase() === myEmail.toLowerCase()
  );

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 bg-[#07090e]">
      {/* Navigation Top */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e6007e] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab("submit"); setSubmitted(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "submit"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <FolderPlus size={14} className="inline mr-1.5" />
            <span>{editingProject ? "Edit Submission" : "Submit New"}</span>
          </button>

          <button
            onClick={() => setActiveTab("my-submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "my-submissions"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <User size={14} className="inline mr-1.5" />
            <span>My Submissions</span>
          </button>
        </div>
      </div>

      {/* Header Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/10 border border-[#e6007e]/30 text-[11px] font-bold tracking-widest text-[#e6007e] uppercase mb-3">
          <Sparkles size={12} />
          <span>MULTI-PHOTO ALBUM &amp; VIDEO UPLOADER</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          {activeTab === "submit" 
            ? (editingProject ? "Edit Your Project" : "Submit a Project") 
            : "Track My Submissions"}
        </h1>
        <p className="text-slate-300 text-sm mt-3 font-light leading-relaxed">
          {activeTab === "submit"
            ? "Upload multiple album photos and videos for your project. Submissions are stored in database & go live upon Admin approval."
            : "Check status of your submitted projects or update details anytime."}
        </p>
      </div>

      {/* TAB 1: SUBMIT FORM */}
      {activeTab === "submit" && (
        <>
          {submitted ? (
            <div className="p-10 rounded-3xl bg-[#0c1017] border border-[#e6007e]/50 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center border border-[#e6007e]/40">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-white">
                {editingProject ? "Project Updated!" : "Project Album & Video Uploaded!"}
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                Your submission status is currently <span className="text-yellow-400 font-bold">PENDING APPROVAL</span>. Once an Admin reviews and approves it, it will automatically appear live on the website.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => { setSubmitted(false); setEditingProject(null); }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white"
                >
                  Submit Another Project
                </button>
                <button
                  onClick={() => setActiveTab("my-submissions")}
                  className="px-6 py-2.5 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase tracking-wider"
                >
                  View My Submissions
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-8 sm:p-10 rounded-3xl bg-[#0c1017]/90 border border-slate-800 space-y-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Project Title"
                  required
                  placeholder="e.g. Neth Peheli - Book Drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Service Avenue
                  </label>
                  <select
                    value={formData.avenue}
                    onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                  >
                    <option value="Community Service">Community Service</option>
                    <option value="Professional Development">Professional Development</option>
                    <option value="Digital & IT">Digital & IT</option>
                    <option value="Club Service">Club Service</option>
                    <option value="International Service">International Service</option>
                    <option value="Public Relations">Public Relations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Input
                  label="Project Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />

                <Input
                  label="Impact Metric"
                  required
                  placeholder="e.g. 300+ Students Supported"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                />

                <Input
                  label="Your Email (Submitter Email)"
                  type="email"
                  required
                  placeholder="you@sltc.ac.lk"
                  value={formData.submittedBy}
                  onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                />
              </div>

              {/* MULTI-PHOTO & VIDEO FILE UPLOADER */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-[#e6007e] transition-all space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-1">
                      <Upload size={16} className="text-[#e6007e]" />
                      <span>Multiple Photo Album &amp; Video Upload</span>
                    </label>
                    <p className="text-[11px] text-slate-400 font-light">
                      Select multiple photos (album gallery) or video files at once from your device.
                    </p>
                  </div>

                  <label className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md shrink-0 inline-flex items-center gap-1.5">
                    <FileImage size={14} />
                    <span>Upload Multiple Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photo Album Preview Grid */}
                {formData.images && formData.images.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ✓ {formData.images.length} Photo(s) in Album Gallery
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-700 group">
                          <Image src={imgUrl} alt={`Album ${idx}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhotoFromGallery(idx)}
                            className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Embed Link Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Video size={14} className="text-cyan-400" />
                  <span>Project Video Link / Embed URL (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or Video URL"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief 1-2 sentence summary of project objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Full Detailed Overview
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed description of execution, outcomes, and milestones..."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>

              <Button type="submit" className="w-full py-4 text-xs font-bold uppercase tracking-widest">
                <Send size={15} />
                <span>{editingProject ? "Save Changes" : "Submit Project & Upload Album to Database"}</span>
              </Button>
            </form>
          )}
        </>
      )}

      {/* TAB 2: MY SUBMISSIONS */}
      {activeTab === "my-submissions" && (
        <div className="space-y-6">
          {/* Email Search filter */}
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Enter your Submitter Email
              </label>
              <input
                type="email"
                placeholder="e.g. name@sltc.ac.lk"
                value={myEmail}
                onChange={(e) => setMyEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {mySubmissions.length} submission(s)
            </span>
          </div>

          {/* Submissions List */}
          {mySubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySubmissions.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d94] bg-[#07090e] px-2.5 py-1 rounded-md border border-[#e6007e]/30">
                      {proj.avenue}
                    </span>

                    {/* Status Badge */}
                    {proj.status === "approved" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                        <CheckCircle2 size={12} />
                        <span>LIVE / APPROVED</span>
                      </span>
                    )}

                    {proj.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 bg-yellow-950/60 px-2.5 py-1 rounded-full border border-yellow-500/40">
                        <Clock size={12} />
                        <span>PENDING REVIEW</span>
                      </span>
                    )}

                    {proj.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-500/40">
                        <XCircle size={12} />
                        <span>REJECTED</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{proj.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{proj.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Impact: <strong className="text-cyan-400">{proj.impact}</strong></span>
                    
                    <button
                      onClick={() => startEdit(proj)}
                      className="inline-flex items-center gap-1 text-[#e6007e] font-bold hover:text-white transition-colors"
                    >
                      <Edit3 size={13} />
                      <span>Edit Submission</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#0c1017] border border-slate-800 text-slate-400 text-xs">
              {myEmail ? "No submissions found for this email." : "Enter your submitter email address above to view your project submissions."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
