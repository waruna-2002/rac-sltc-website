"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredProjects, 
  updateProjectStatus, 
  updateProject, 
  addProjectSubmission, 
  deleteProject 
} from "@/lib/projectsStore";
import { 
  getStoredTeam, 
  addTeamMember, 
  updateTeamMember, 
  deleteTeamMember 
} from "@/lib/teamStore";
import { 
  getStoredStats, 
  saveStoredStats 
} from "@/lib/statsStore";
import { 
  getStoredSiteContent, 
  saveStoredSiteContent 
} from "@/lib/siteStore";
import { 
  checkRateLimit, 
  registerFailedAttempt, 
  resetRateLimit 
} from "@/lib/security";
import { useAdmin } from "@/context/AdminContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Lock, 
  Unlock, 
  AlertTriangle,
  ShieldAlert,
  Users,
  FolderKanban,
  BarChart3,
  PlusCircle,
  Upload,
  UserPlus,
  Globe,
  Settings
} from "lucide-react";

export default function AdminDashboardPage() {
  const { isAdmin, isSuperAdmin, isProjectEditor, adminRole, loginAdmin, logoutAdmin } = useAdmin();
  const [passcode, setPasscode] = useState("");
  const [lockoutMsg, setLockoutMsg] = useState("");

  const [activeTab, setActiveTab] = useState("approvals"); // "approvals" | "projects" | "team" | "stats" | "site"

  // Master State Managers
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState([]);
  const [siteContent, setSiteContent] = useState({});

  // Search & Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Edit Modals State
  const [editingProject, setEditingProject] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    role: "Director",
    category: "Board of Directors",
    faculty: "Faculty of Computing & IT",
    image: "/images/team/placeholder.jpg",
    bio: "",
    email: "",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  });

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    title: "",
    avenue: "Community Service",
    date: new Date().toISOString().split("T")[0],
    impact: "100+ Participants",
    description: "",
    fullDescription: "",
    image: "/images/projects/project1.jpg",
    images: ["/images/projects/project1.jpg"],
    videoUrl: "",
    submittedBy: "admin@sltc.ac.lk",
    status: "approved",
  });

  useEffect(() => {
    setProjects(getStoredProjects());
    setTeam(getStoredTeam());
    setStats(getStoredStats());
    setSiteContent(getStoredSiteContent());
  }, []);

  useEffect(() => {
    // If project_editor attempts to visit restricted tabs, redirect to approvals
    if (isProjectEditor && (activeTab === "team" || activeTab === "site" || activeTab === "stats")) {
      setActiveTab("approvals");
    }
  }, [isProjectEditor, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLockoutMsg("");

    const rateCheck = checkRateLimit("admin_login");
    if (!rateCheck.allowed) {
      setLockoutMsg(`Too many failed attempts! Login locked for ${rateCheck.remainingSecs} seconds.`);
      return;
    }

    const result = await loginAdmin(passcode);
    if (result.success) {
      setPasscode("");
      resetRateLimit("admin_login");
    } else {
      const failRecord = registerFailedAttempt("admin_login");
      if (failRecord.locked) {
        setLockoutMsg(`Account locked due to 5 consecutive failed attempts. Please wait ${failRecord.remainingSecs} seconds.`);
      } else {
        setLockoutMsg(`Incorrect passcode! ${failRecord.remainingAttempts} attempts remaining.`);
      }
    }
  };

  // Direct File Reader for Admin Uploads (Team Photos / Project Images)
  const handleAdminFileUpload = (e, callback) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const readUrls = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (typeof evt.target?.result === "string") {
          readUrls.push(evt.target.result);
          if (readUrls.length === files.length) {
            callback(readUrls.length === 1 ? readUrls[0] : readUrls);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // --- PROJECT MANAGEMENT ACTIONS ---
  const handleApproveProject = (id) => {
    setProjects(updateProjectStatus(id, "approved"));
  };

  const handleRejectProject = (id) => {
    setProjects(updateProjectStatus(id, "rejected"));
  };

  const handleDeleteProject = (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(deleteProject(id));
    }
  };

  const handleSaveProjectEdit = (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setProjects(updateProject(editingProject.id, editingProject));
    setEditingProject(null);
  };

  const handleAddProjectSubmit = (e) => {
    e.preventDefault();
    addProjectSubmission({ ...newProjectForm, status: "approved" });
    setProjects(getStoredProjects());
    setIsAddingProject(false);
  };

  // --- TEAM MEMBER MANAGEMENT ACTIONS ---
  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    setTeam(addTeamMember(newMemberForm));
    setIsAddingMember(false);
  };

  const handleSaveMemberEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setTeam(updateTeamMember(editingMember.id, editingMember));
    setEditingMember(null);
  };

  const handleDeleteMember = (id) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      setTeam(deleteTeamMember(id));
    }
  };

  // --- STATS & GLOBAL SITE MANAGEMENT ACTIONS ---
  const handleSaveStats = (e) => {
    e.preventDefault();
    saveStoredStats(stats);
    alert("Live Counter Stats updated successfully!");
  };

  const handleSaveSiteCMS = (e) => {
    e.preventDefault();
    const updated = saveStoredSiteContent(siteContent);
    setSiteContent(updated);
    alert("Full Website Global CMS Content saved & updated across all pages!");
  };

  const pendingCount = projects.filter((p) => p.status === "pending").length;

  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 pt-28 pb-20 bg-[#07090e]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-6 shadow-2xl backdrop-blur-xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#e6007e]/20 text-[#e6007e] mx-auto flex items-center justify-center border border-[#e6007e]/40 shadow-[0_0_20px_rgba(230,0,126,0.3)]">
            <ShieldAlert size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Admin Access Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Secure role-based administration dashboard.
            </p>
          </div>

          {lockoutMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold leading-relaxed flex items-center gap-2 text-left">
              <AlertTriangle size={18} className="shrink-0 text-rose-400" />
              <span>{lockoutMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Admin Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-3.5 text-xs font-bold uppercase tracking-widest">
              <Unlock size={14} />
              <span>Login to Dashboard</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-2 text-left">
            <p className="font-bold text-slate-200">Passcode Credentials Notice:</p>
            <div className="flex flex-col gap-1 text-[11px]">
              <p>• Full Master Admin: <code className="text-[#e6007e]">admin123</code> (All Features)</p>
              <p>• Project Editor: <code className="text-cyan-400">project123</code> (Approvals &amp; Projects)</p>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 bg-[#07090e]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-2 ${
            isSuperAdmin
              ? "bg-[#e6007e]/10 border border-[#e6007e]/30 text-[#e6007e]"
              : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
          }`}>
            <ShieldCheck size={12} />
            <span>
              {isSuperAdmin ? "FULL WEBSITE MASTER CMS CONTROL CENTER" : "PROJECT EDITOR & APPROVALS CONTROL"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isSuperAdmin ? "Rotaract SLTC Master Admin Dashboard" : "Rotaract SLTC Project Editor Dashboard"}
          </h1>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white self-start sm:self-auto cursor-pointer"
        >
          Logout Session ({isSuperAdmin ? "Master Admin" : "Project Editor"})
        </button>
      </div>

      {/* Main Admin Tab Navigation Bar */}
      <div className="flex flex-wrap gap-3 p-2 rounded-2xl bg-[#0c1017] border border-slate-800">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "approvals"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Clock size={16} />
          <span>Approvals Queue ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "projects"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FolderKanban size={16} />
          <span>Projects &amp; Gallery ({projects.length})</span>
        </button>

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab("team")}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "team"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users size={16} />
              <span>Team &amp; People ({team.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("site")}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "site"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Globe size={16} />
              <span>Global Site CMS Content</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "stats"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <BarChart3 size={16} />
              <span>Live Counter Stats</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: APPROVALS QUEUE */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Pending Submission Approvals</h2>
            <span className="text-xs font-bold text-yellow-400 bg-yellow-950/60 border border-yellow-500/40 px-3 py-1 rounded-full">
              {pendingCount} Submission(s) Waiting
            </span>
          </div>

          <div className="space-y-4">
            {projects.filter((p) => p.status === "pending").length > 0 ? (
              projects
                .filter((p) => p.status === "pending")
                .map((proj) => (
                  <div
                    key={proj.id}
                    className="p-6 rounded-2xl bg-[#0c1017] border border-yellow-500/40 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d94] bg-slate-900 px-2.5 py-1 rounded-md border border-[#e6007e]/30">
                        {proj.avenue}
                      </span>
                      <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                        <Clock size={13} />
                        <span>Submitted on {proj.date}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{proj.title}</h3>
                      <p className="text-slate-300 text-xs leading-relaxed">{proj.description}</p>
                      <div className="text-xs text-cyan-400 font-medium mt-2">
                        Submitter: <strong className="text-white">{proj.submittedBy}</strong> • Impact: <strong>{proj.impact}</strong>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleRejectProject(proj.id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 text-xs font-bold uppercase tracking-wider"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => setEditingProject(proj)}
                        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#e6007e] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider"
                      >
                        Edit Details
                      </button>

                      <button
                        onClick={() => handleApproveProject(proj.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve Live</span>
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#0c1017] border border-slate-800 text-slate-400 text-xs">
                No pending submissions waiting for approval!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & MULTI-PHOTO GALLERY MANAGER */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">All Projects Catalog ({projects.length})</h2>

            <button
              onClick={() => setIsAddingProject(true)}
              className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider shadow-md inline-flex items-center gap-2"
            >
              <PlusCircle size={15} />
              <span>Add New Project (Admin)</span>
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#ff4d94] bg-slate-900 px-2.5 py-1 rounded-md border border-[#e6007e]/30">
                      {proj.avenue}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      proj.status === "approved" ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/40" : "text-yellow-400 bg-yellow-950/60 border border-yellow-500/40"
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{proj.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingProject(proj)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#e6007e] text-slate-300 hover:text-white text-xs font-bold uppercase"
                  >
                    <Edit3 size={14} className="inline mr-1" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM & PEOPLE MANAGER */}
      {isSuperAdmin && activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Manage Executive Committee &amp; Board ({team.length})</h2>

            <button
              onClick={() => setIsAddingMember(true)}
              className="px-5 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider shadow-md inline-flex items-center gap-2"
            >
              <UserPlus size={15} />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 text-center space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-slate-700 bg-slate-900 relative mb-2">
                    {member.image ? (
                      <Image src={member.image} alt={member.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-white">{member.name}</h4>
                  <p className="text-xs font-bold text-[#e6007e] uppercase mt-0.5">{member.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{member.faculty}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL SITE CONTENT CMS */}
      {isSuperAdmin && activeTab === "site" && (
        <form onSubmit={handleSaveSiteCMS} className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-6 max-w-4xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Full Website Content CMS Manager</h2>
            <p className="text-xs text-slate-400 mt-1">Edit text, hero subtitle, contact address, and social links across all pages instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Hero Subtitle / Tagline"
              value={siteContent.heroSubtitle || ""}
              onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
            />
            <Input
              label="District Badge Text"
              value={siteContent.districtBadge || ""}
              onChange={(e) => setSiteContent({ ...siteContent, districtBadge: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Official Secretarial Address"
              value={siteContent.address || ""}
              onChange={(e) => setSiteContent({ ...siteContent, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Official Email"
                value={siteContent.email || ""}
                onChange={(e) => setSiteContent({ ...siteContent, email: e.target.value })}
              />
              <Input
                label="Official Phone"
                value={siteContent.phone || ""}
                onChange={(e) => setSiteContent({ ...siteContent, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-300 block mb-1">About Us History Overview</label>
            <textarea
              rows={4}
              value={siteContent.aboutHistory || ""}
              onChange={(e) => setSiteContent({ ...siteContent, aboutHistory: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
            />
          </div>

          <Button type="submit" className="w-full py-4 text-xs font-bold uppercase tracking-widest">
            Save Full Website Global CMS Content
          </Button>
        </form>
      )}

      {/* TAB 5: LIVE STATS MANAGER */}
      {isSuperAdmin && activeTab === "stats" && (
        <form onSubmit={handleSaveStats} className="p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold text-white">Edit Homepage Live Counter Stats</h2>

          {stats.map((st, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <Input
                label="Label"
                value={st.label}
                onChange={(e) => {
                  const copy = [...stats];
                  copy[idx].label = e.target.value;
                  setStats(copy);
                }}
              />
              <Input
                label="Counter Value"
                value={st.value}
                onChange={(e) => {
                  const copy = [...stats];
                  copy[idx].value = e.target.value;
                  setStats(copy);
                }}
              />
            </div>
          ))}

          <Button type="submit" className="w-full py-3.5 text-xs font-bold uppercase tracking-wider">
            Save Counter Stats
          </Button>
        </form>
      )}

      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingProject(null)} />
          <form
            onSubmit={handleSaveProjectEdit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-5 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white">Edit Project Details (Admin)</h3>

            <Input label="Title" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} required />

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Direct Upload Multiple Album Photos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (urls) => {
                  const newArray = Array.isArray(urls) ? urls : [urls];
                  setEditingProject({
                    ...editingProject,
                    image: newArray[0],
                    images: newArray,
                  });
                })}
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Approval Status</label>
              <select
                value={editingProject.status}
                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="approved">Approved (Live)</option>
                <option value="pending">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Input label="Description" value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} required />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT TEAM MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingMember(null)} />
          <form
            onSubmit={handleSaveMemberEdit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8"
          >
            <h3 className="text-xl font-bold text-white">Edit Team Member</h3>
            <Input label="Name" value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} required />
            <Input label="Role" value={editingMember.role} onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })} required />
            <Input label="Faculty" value={editingMember.faculty} onChange={(e) => setEditingMember({ ...editingMember, faculty: e.target.value })} required />
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Direct Photo File Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (url) => setEditingMember({ ...editingMember, image: url }))}
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Bio / Profile Summary</label>
              <textarea
                rows={3}
                value={editingMember.bio || ""}
                onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingMember(false)} />
          <form
            onSubmit={handleAddMemberSubmit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8"
          >
            <h3 className="text-xl font-bold text-white">Add New Team Member</h3>
            <Input label="Name" value={newMemberForm.name} onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })} required />
            <Input label="Role" value={newMemberForm.role} onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })} required />
            <Input label="Faculty" value={newMemberForm.faculty} onChange={(e) => setNewMemberForm({ ...newMemberForm, faculty: e.target.value })} required />
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Direct Photo File Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (url) => setNewMemberForm({ ...newMemberForm, image: url }))}
                className="text-xs text-[#slate-400] mb-2 block"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsAddingMember(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase">Add Member</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
