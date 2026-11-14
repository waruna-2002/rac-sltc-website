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
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  ArrowLeft, 
  Trash2, 
  AlertCircle 
} from "lucide-react";
import AnimatedPageHeader from "@/components/AnimatedPageHeader";

export default function SubmitProjectPage() {
  const [activeTab, setActiveTab] = useState("submit");
  const [submitted, setSubmitted] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [myEmail, setMyEmail] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const initialFormState = {
    title: "",
    avenue: "Community Service Avenue",
    secondaryAvenue: "",
    date: "",
    endDate: "",
    isOneDay: true,
    impact: "",
    description: "",
    image: "",
    images: [],
    driveLink: "",
    proposalDriveLink: "",
    projectChair: "",
    projectSecretary: "",
    projectTreasurer: "",
    submittedBy: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setProjectsList(getStoredProjects());
    fetch("/api/projects?status=all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProjectsList(json.data);
        }
      })
      .catch((err) => console.log("Projects API fetch fallback:", err));
  }, [submitted, editingProject]);

  // Handle direct file upload for SHOWCASE PHOTOS (Min 1, Max 3)
  const handleMultipleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setFormError("");

    const currentCount = formData.images ? formData.images.length : 0;
    const remainingSlots = 3 - currentCount;

    if (remainingSlots <= 0) {
      setFormError("Maximum 3 showcase photos allowed on website. Please remove a photo first or add extra photos to your Google Drive link.");
      return;
    }

    if (files.length > remainingSlots) {
      setFormError(`Notice: Only up to 3 showcase photos are allowed for website display. The first ${remainingSlots} photo(s) were selected. Full album must be placed in the Google Drive folder.`);
    }

    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") {
          setFormData((prev) => {
            const current = prev.images || [];
            if (current.length >= 3) return prev;
            const updated = [...current, dataUrl].slice(0, 3);
            return {
              ...prev,
              image: updated[0] || "",
              images: updated,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoFromGallery = (indexToRemove) => {
    setFormData((prev) => {
      const filtered = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        image: filtered.length > 0 ? filtered[0] : "",
        images: filtered,
      };
    });
  };

  // Submit project proposal or update existing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.images || formData.images.length === 0) {
      setFormError("Please upload at least 1 showcase photo for the website (Maximum 3 photos allowed).");
      return;
    }

    if (formData.images.length > 3) {
      setFormError("Maximum 3 showcase photos are allowed for website display. Please remove extra photos.");
      return;
    }

    if (!formData.driveLink || !formData.driveLink.trim()) {
      setFormError("Google Drive Folder link is mandatory. Please provide a link with 'Anyone with the link can view' permission.");
      return;
    }

    if (!formData.projectChair?.trim() || !formData.projectSecretary?.trim() || !formData.projectTreasurer?.trim()) {
      setFormError("Please provide all Project Committee leads: Project Chair, Project Secretary, and Project Treasurer.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProject) {
        const targetId = editingProject.id || editingProject._id;
        updateProject(targetId, formData);
        await fetch(`/api/projects/${targetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch((err) => console.log("API update error:", err));
        setEditingProject(null);
      } else {
        addProjectSubmission(formData);
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch((err) => console.log("API submit error:", err));
      }
      setSubmitted(true);
      setMyEmail(formData.submittedBy);
    } catch (err) {
      console.error("Submit error:", err);
      setFormError("Network error while submitting proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || "",
      avenue: proj.avenue || "Community Service Avenue",
      secondaryAvenue: proj.secondaryAvenue || "",
      date: proj.date || "",
      endDate: proj.endDate || "",
      isOneDay: proj.isOneDay !== undefined ? proj.isOneDay : !proj.endDate,
      impact: proj.impact || "",
      description: proj.description || "",
      image: proj.image || (proj.images && proj.images[0]) || "",
      images: (proj.images && proj.images.length > 0) ? proj.images.slice(0, 3) : (proj.image ? [proj.image] : []),
      driveLink: proj.driveLink || "",
      proposalDriveLink: proj.proposalDriveLink || proj.reportDriveLink || "",
      projectChair: proj.projectChair || "",
      projectSecretary: proj.projectSecretary || "",
      projectTreasurer: proj.projectTreasurer || "",
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
            {editingProject ? "Edit Submission" : "Submit New"}
          </button>

          <button
            onClick={() => setActiveTab("my-submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "my-submissions"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            My Submissions
          </button>
        </div>
      </div>

      {/* Animated Drop-Down Header */}
      <AnimatedPageHeader
        badge={activeTab === "submit" ? "PROJECT PORTAL" : "MY SUBMISSIONS"}
        title={activeTab === "submit" 
          ? (editingProject ? "Edit Your Project" : "Submit a Project") 
          : "Track My Submissions"}
        highlightWord={activeTab === "submit" ? "Project" : "Submissions"}
        subtitle={activeTab === "submit"
          ? "Upload 1 to 3 showcase photos for the website, provide the Google Drive folder link for all event photos/videos, and fill in the project committee details."
          : "Check status of your submitted projects or update details anytime."}
      />

      {/* TAB 1: SUBMIT FORM */}
      {activeTab === "submit" && (
        <>
          {submitted ? (
            <div className="p-10 rounded-3xl bg-[#0c1017] border border-[#e6007e]/50 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center border border-[#e6007e]/40">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-white">
                {editingProject ? "Project Updated!" : "Project Proposal Submitted!"}
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
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/60 flex items-start gap-3 text-rose-300 text-xs shadow-lg">
                  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{formError}</span>
                </div>
              )}

              <Input
                label="Project Title"
                required
                placeholder="e.g. Neth Peheli - Book Drive"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Primary Service Avenue *
                  </label>
                  <select
                    value={formData.avenue}
                    onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
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

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Secondary Avenue <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <select
                    value={formData.secondaryAvenue || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryAvenue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                  >
                    <option value="">None / Not Applicable</option>
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

              {/* Project Date & Duration Timeline */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Project Timeline
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isOneDay}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          isOneDay: checked,
                          endDate: checked ? "" : formData.endDate,
                        });
                      }}
                      className="w-4 h-4 rounded text-[#e6007e] accent-[#e6007e] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-300">
                      One Day Project
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={formData.isOneDay ? "Project Date *" : "Start Date *"}
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                      End Date {formData.isOneDay && <span className="text-slate-400 font-normal lowercase">(disabled for 1-day project)</span>}
                    </label>
                    <input
                      type="date"
                      disabled={formData.isOneDay}
                      value={formData.isOneDay ? "" : formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs text-white outline-none transition-all ${
                        formData.isOneDay
                          ? "bg-slate-950/60 border-slate-900 text-slate-400 cursor-not-allowed opacity-50"
                          : "bg-slate-900 border-slate-800 focus:border-[#e6007e]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              {/* PROJECT LEADERSHIP COMMITTEE */}
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Project Leadership Committee *
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    label="Project Chairperson"
                    required
                    placeholder="e.g. Rtr. Kasun Perera"
                    value={formData.projectChair}
                    onChange={(e) => setFormData({ ...formData, projectChair: e.target.value })}
                  />
                  <Input
                    label="Project Secretary"
                    required
                    placeholder="e.g. Rtr. Amaya Silva"
                    value={formData.projectSecretary}
                    onChange={(e) => setFormData({ ...formData, projectSecretary: e.target.value })}
                  />
                  <Input
                    label="Project Treasurer"
                    required
                    placeholder="e.g. Rtr. Dineth Fernando"
                    value={formData.projectTreasurer}
                    onChange={(e) => setFormData({ ...formData, projectTreasurer: e.target.value })}
                  />
                </div>
              </div>

              {/* SHOWCASE PHOTOS (MIN 1, MAX 3) */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-700/80 hover:border-[#e6007e] transition-all space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white block mb-1">
                      Showcase Photos (Min 1, Max 3) *
                    </label>
                    <p className="text-[11px] text-slate-400 font-light">
                      Upload 1 to 3 highlight photos for the website card. All other event photos and videos belong in the Google Drive folder link.
                    </p>
                  </div>

                  <label className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md shrink-0 inline-flex items-center">
                    <span>Upload Showcase Photos ({formData.images ? formData.images.length : 0}/3)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Photo Album Preview Grid */}
                {formData.images && formData.images.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ✓ {formData.images.length} of 3 Showcase Photo(s) Selected
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-700 group">
                          <Image src={imgUrl} alt={`Showcase ${idx + 1}`} fill className="object-cover" />
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

              {/* GOOGLE DRIVE MEDIA FOLDER (MANDATORY) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-[#e6007e]/30 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-white block">
                  Google Drive Folder Link (All Photos &amp; Videos) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
                <div className="p-3 rounded-xl bg-[#07090e] border border-amber-500/30 text-[11px] text-amber-300/90 leading-relaxed space-y-1">
                  <p className="font-bold">Important Access Requirement:</p>
                  <p>
                    Please ensure the Google Drive folder sharing permission is set to <strong>&quot;Anyone with the link can view&quot;</strong> (General Access: Anyone with link → Viewer), so that club members and the public can view the full event album and videos.
                  </p>
                </div>
              </div>

              {/* PROJECT PROPOSAL & REPORT (GOOGLE DRIVE) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white block">
                    Project Proposal &amp; Report Google Drive Link
                  </label>
                  <p className="text-[11px] text-slate-400 font-light mt-1">
                    Provide a Google Drive folder or document link containing the official Project Proposal and Project Report for club administration records.
                  </p>
                </div>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/... or document link"
                  value={formData.proposalDriveLink || ""}
                  onChange={(e) => setFormData({ ...formData, proposalDriveLink: e.target.value, reportDriveLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-[#e6007e] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Project Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of project objectives, activities, and community impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#e6007e] outline-none"
                />
              </div>

              <Button type="submit" className="w-full py-4 text-xs font-bold uppercase tracking-widest">
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
