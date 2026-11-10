"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getStoredMedia, 
  addMediaPost, 
  updateMediaPost, 
  updateMediaStatus, 
  deleteMediaPost 
} from "@/lib/mediaStore";
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
import AdminLoginPortal from "@/components/admin/AdminLoginPortal";
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
  Settings,
  Calendar,
  UserCheck,
  Mail,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  Phone,
  Tag,
  MapPin,
  FileText,
  BookOpen,
  Newspaper
} from "lucide-react";

export default function AdminDashboardPage() {
  const { isAdmin, isSuperAdmin, isProjectEditor, adminRole, loginAdmin, logoutAdmin } = useAdmin();

  // Toast Notification System (Replaces browser alert popups)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3500);
  };

  // Styled Confirmation Modal (Replaces browser confirm popups)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: "", id: null, title: "" });
  const requestDelete = (type, id, title = "") => {
    setDeleteConfirm({ show: true, type, id, title });
  };
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, type: "", id: null, title: "" });
  };
  const confirmExecuteDelete = async () => {
    const { type, id } = deleteConfirm;
    cancelDelete();
    if (!id) return;

    if (type === "project") {
      setProjects(deleteProject(id));
      showToast("Project deleted successfully.", "info");
      await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).catch((err) => console.log("Deletion sync error:", err));
    } else if (type === "event") {
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          setEvents((prev) => prev.filter((ev) => (ev._id || ev.id) !== id));
          showToast("Event deleted successfully.", "info");
        }
      } catch (err) {
        showToast("Failed to delete event.", "error");
      }
    } else if (type === "member") {
      try {
        const res = await fetch(`/api/members/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          setMemberApplicants((prev) => prev.filter((m) => (m._id || m.id) !== id));
          showToast("Application deleted.", "info");
        }
      } catch (err) {
        showToast("Failed to delete application.", "error");
      }
    } else if (type === "contact") {
      try {
        const res = await fetch(`/api/contact/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          setContactMessages((prev) => prev.filter((msg) => (msg._id || msg.id) !== id));
          showToast("Contact message deleted.", "info");
        }
      } catch (err) {
        showToast("Failed to delete message.", "error");
      }
    } else if (type === "team") {
      setTeam(deleteTeamMember(id));
      showToast("Team member removed from directory.", "info");
    }
  };

  const [activeTab, setActiveTab] = useState("approvals"); // "approvals" | "projects" | "events" | "members" | "inbox" | "team" | "site" | "stats"

  // Master State Managers
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [events, setEvents] = useState([]);
  const [memberApplicants, setMemberApplicants] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaFilterType, setMediaFilterType] = useState("all");
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [newMediaForm, setNewMediaForm] = useState({
    type: "blog",
    title: "",
    author: "Rtr. Club Member",
    authorRole: "Committee Member",
    avenue: "Community Service Avenue",
    readTime: "4 min read",
    image: "/images/projects/project1.jpg",
    summary: "",
    content: "",
    size: "3.5 MB",
    issue: "Volume 1 • Issue 1",
    fileUrl: "/bulletin.pdf",
  });

  // Search & Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [eventFilterAvenue, setEventFilterAvenue] = useState("All");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilterStatus, setMemberFilterStatus] = useState("all");
  const [messageFilterStatus, setMessageFilterStatus] = useState("all");

  // Edit Modals State
  const [editingProject, setEditingProject] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

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
    avenue: "Community Service Avenue",
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

  // New Event Form State
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    avenue: "Community Service Avenue",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 AM - 01:00 PM",
    location: "SLTC Research University, Padukka",
    image: "/images/hero.jpg",
    registrationLink: "/join-us",
    registrationOpen: true,
    featured: true,
    status: "upcoming",
    tags: "Leadership, Community, Rotaract",
  });

  // Load initial data
  useEffect(() => {
    setProjects(getStoredProjects());
    setTeam(getStoredTeam());
    setStats(getStoredStats());
    setSiteContent(getStoredSiteContent());
    setMediaItems(getStoredMedia());

    // Fetch live site settings from MongoDB API
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteContent(json.data);
        }
      })
      .catch((err) => console.log("Admin site settings API fallback:", err));

    // Fetch live projects from MongoDB API
    fetch("/api/projects?status=all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProjects(json.data);
        }
      })
      .catch((err) => console.log("Admin projects API fallback:", err));

    // Fetch live events from API
    fetch("/api/events")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      })
      .catch((err) => console.log("Admin events API fallback:", err));
  }, []);

  // Fetch admin protected data when authenticated
  useEffect(() => {
    if (isAdmin && isSuperAdmin) {
      // Fetch Member Applications
      fetch("/api/members", { credentials: "include" })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setMemberApplicants(json.data);
          }
        })
        .catch((err) => console.log("Admin members fetch:", err));

      // Fetch Contact Messages
      fetch("/api/contact", { credentials: "include" })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setContactMessages(json.data);
          }
        })
        .catch((err) => console.log("Admin contact fetch:", err));
    }
  }, [isAdmin, isSuperAdmin]);

  useEffect(() => {
    // If project_editor attempts to visit restricted tabs, redirect to approvals
    if (isProjectEditor && (activeTab === "team" || activeTab === "site" || activeTab === "stats" || activeTab === "members" || activeTab === "inbox")) {
      setActiveTab("approvals");
    }
  }, [isProjectEditor, activeTab]);

  // Direct File Reader for Admin Uploads (Photos)
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

  // --- PROJECT ACTIONS ---
  const handleApproveProject = async (id) => {
    setProjects(updateProjectStatus(id, "approved"));
    showToast("Project approved and published to live website!", "success");
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    }).catch((err) => console.log("Approval sync error:", err));
  };

  const handleRejectProject = async (id) => {
    setProjects(updateProjectStatus(id, "rejected"));
    showToast("Project proposal rejected.", "info");
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    }).catch((err) => console.log("Rejection sync error:", err));
  };

  const handleDeleteProject = (id) => {
    const proj = projects.find((p) => (p.id || p._id) === id);
    requestDelete("project", id, proj?.title || "this project");
  };

  const handleSaveProjectEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    const targetId = editingProject.id || editingProject._id;
    setProjects(updateProject(targetId, editingProject));
    await fetch(`/api/projects/${targetId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProject),
    }).catch((err) => console.log("Save edit sync error:", err));
    setEditingProject(null);
    showToast("Project details updated successfully!", "success");
  };

  const handleAddProjectSubmit = async (e) => {
    e.preventDefault();
    const newProj = { ...newProjectForm, status: "approved" };
    addProjectSubmission(newProj);
    setProjects(getStoredProjects());
    setIsAddingProject(false);
    showToast("New project published successfully!", "success");
    await fetch("/api/projects", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProj),
    }).catch((err) => console.log("Add project sync error:", err));
  };

  // --- EVENTS ACTIONS ---
  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    const tagArray = typeof newEventForm.tags === "string" 
      ? newEventForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      : newEventForm.tags;

    const payload = { ...newEventForm, tags: tagArray };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => [data.data, ...prev]);
        setIsAddingEvent(false);
        showToast("Event created successfully!", "success");
      } else {
        showToast(data.error || "Failed to create event", "error");
      }
    } catch (err) {
      console.error("Create event error:", err);
      showToast("Network error creating event", "error");
    }
  };

  const handleSaveEventEdit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    const targetId = editingEvent._id || editingEvent.id;

    const tagArray = typeof editingEvent.tags === "string"
      ? editingEvent.tags.split(",").map(t => t.trim()).filter(Boolean)
      : editingEvent.tags;

    const payload = { ...editingEvent, tags: tagArray };

    try {
      const res = await fetch(`/api/events/${targetId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => prev.map((ev) => ((ev._id || ev.id) === targetId ? data.data : ev)));
        setEditingEvent(null);
        showToast("Event updated successfully!", "success");
      } else {
        showToast(data.error || "Failed to update event", "error");
      }
    } catch (err) {
      console.error("Update event error:", err);
      showToast("Network error updating event", "error");
    }
  };

  const handleDeleteEvent = (id) => {
    const ev = events.find((e) => (e._id || e.id) === id);
    requestDelete("event", id, ev?.title || "this event");
  };

  // --- MEDIA CMS ACTIONS ---
  const handleAddMediaSubmit = (e) => {
    e.preventDefault();
    const updated = addMediaPost(newMediaForm);
    setMediaItems(updated);
    setIsAddingMedia(false);
    showToast("Media publication created successfully!", "success");
    setNewMediaForm({
      type: "blog",
      title: "",
      author: "Rtr. Club Member",
      authorRole: "Committee Member",
      avenue: "Community Service Avenue",
      readTime: "4 min read",
      image: "/images/projects/project1.jpg",
      summary: "",
      content: "",
      size: "3.5 MB",
      issue: "Volume 1 • Issue 1",
      fileUrl: "/bulletin.pdf",
    });
  };

  const handleApproveMedia = async (id) => {
    setMediaItems(updateMediaStatus(id, "approved"));
    showToast("Media publication approved and published live!", "success");
    await fetch(`/api/media/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    }).catch((err) => console.log("Media approve sync error:", err));
  };

  const handleRejectMedia = async (id) => {
    setMediaItems(updateMediaStatus(id, "rejected"));
    showToast("Media submission rejected.", "info");
    await fetch(`/api/media/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    }).catch((err) => console.log("Media reject sync error:", err));
  };

  const handleSaveMediaEdit = async (e) => {
    e.preventDefault();
    if (!editingMedia) return;
    const targetId = editingMedia.id || editingMedia._id;
    setMediaItems(updateMediaPost(targetId, editingMedia));
    await fetch(`/api/media/${targetId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingMedia),
    }).catch((err) => console.log("Media edit sync error:", err));
    setEditingMedia(null);
    showToast("Media publication details updated successfully!", "success");
  };

  const handleDeleteMedia = async (id) => {
    const updated = deleteMediaPost(id);
    setMediaItems(updated);
    showToast("Media item removed.", "info");
    await fetch(`/api/media/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch((err) => console.log("Media delete sync error:", err));
  };

  // --- MEMBERS APPLICATIONS ACTIONS ---
  const handleUpdateMemberStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMemberApplicants((prev) =>
          prev.map((m) => ((m._id || m.id) === id ? { ...m, status: newStatus } : m))
        );
        showToast(`Application marked as ${newStatus}!`, "success");
      }
    } catch (err) {
      console.error("Update member status error:", err);
    }
  };

  const handleDeleteMemberApplication = (id) => {
    const m = memberApplicants.find((a) => (a._id || a.id) === id);
    requestDelete("member", id, m?.fullName ? `${m.fullName}'s application` : "this application");
  };

  // --- CONTACT INBOX ACTIONS ---
  const handleUpdateMessageStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setContactMessages((prev) =>
          prev.map((msg) => ((msg._id || msg.id) === id ? { ...msg, status: newStatus } : msg))
        );
        showToast(`Message marked as ${newStatus}!`, "success");
      }
    } catch (err) {
      console.error("Update message status error:", err);
    }
  };

  const handleDeleteContactMessage = (id) => {
    const msg = contactMessages.find((m) => (m._id || m.id) === id);
    requestDelete("contact", id, msg?.subject ? `message "${msg.subject}"` : "this message");
  };

  // --- TEAM MEMBER MANAGEMENT ACTIONS ---
  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    setTeam(addTeamMember(newMemberForm));
    setIsAddingMember(false);
    showToast("New team member added to directory!", "success");
  };

  const handleSaveMemberEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setTeam(updateTeamMember(editingMember.id, editingMember));
    setEditingMember(null);
    showToast("Team member profile updated!", "success");
  };

  const handleDeleteMember = (id) => {
    const mem = team.find((t) => t.id === id);
    requestDelete("team", id, mem?.name || "this team member");
  };

  // --- STATS & GLOBAL SITE MANAGEMENT ACTIONS ---
  const handleSaveStats = (e) => {
    e.preventDefault();
    saveStoredStats(stats);
    showToast("Live Counter Stats updated and saved!", "success");
  };

  const handleSaveSiteCMS = (e) => {
    e.preventDefault();
    const updated = saveStoredSiteContent(siteContent);
    setSiteContent(updated);
    showToast("Full Website Global CMS Content saved & synchronized with MongoDB!", "success");
  };

  const pendingCount = projects.filter((p) => p.status === "pending").length;
  const unreadMessagesCount = contactMessages.filter((m) => m.status === "unread").length;
  const pendingMembersCount = memberApplicants.filter((m) => m.status === "pending").length;

  if (!isAdmin) {
    return <AdminLoginPortal />;
  }

  // Filtered lists
  const filteredProjects = projects.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.avenue || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredEvents = events.filter((ev) => {
    const matchAvenue =
      eventFilterAvenue === "All" ||
      ev.avenue === eventFilterAvenue ||
      (ev.avenue && eventFilterAvenue.toLowerCase().includes(ev.avenue.toLowerCase())) ||
      (ev.avenue && ev.avenue.toLowerCase().includes(eventFilterAvenue.toLowerCase().replace(" avenue", "")));
    return matchAvenue;
  });

  const filteredMembers = memberApplicants.filter((m) => {
    const matchStatus = memberFilterStatus === "all" || m.status === memberFilterStatus;
    const matchSearch =
      (m.fullName || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.studentId || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(memberSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredMessages = contactMessages.filter((m) => {
    if (messageFilterStatus === "all") return true;
    return m.status === messageFilterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <ShieldCheck size={14} />
            <span>Authenticated: {isSuperAdmin ? "Super Admin (Full Access)" : "Project Editor"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Club Master Dashboard
          </h1>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white self-start sm:self-auto cursor-pointer"
        >
          Logout Session ({isSuperAdmin ? "Master Admin" : "Project Editor"})
        </button>
      </div>

      {/* Executive Quick Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Approvals */}
        <div 
          onClick={() => setActiveTab("approvals")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
            activeTab === "approvals" 
              ? "bg-[#e6007e]/15 border-[#e6007e] shadow-lg shadow-[#e6007e]/15" 
              : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Approvals</span>
            <Clock size={16} className={pendingCount > 0 ? "text-[#e6007e] animate-pulse" : "text-slate-500"} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#e6007e] text-white text-[10px] font-black uppercase tracking-wider">
                Action
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending review</span>
        </div>

        {/* Projects */}
        <div 
          onClick={() => setActiveTab("projects")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
            activeTab === "projects" 
              ? "bg-[#e6007e]/15 border-[#e6007e] shadow-lg shadow-[#e6007e]/15" 
              : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Projects</span>
            <FolderKanban size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{projects.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              {projects.filter(p => p.status === "approved").length} Live
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Total catalog</span>
        </div>

        {/* Events */}
        <div 
          onClick={() => setActiveTab("events")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
            activeTab === "events" 
              ? "bg-[#e6007e]/15 border-[#e6007e] shadow-lg shadow-[#e6007e]/15" 
              : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Events</span>
            <Calendar size={16} className="text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{events.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">Calendar</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active entries</span>
        </div>

        {/* Applicants */}
        <div 
          onClick={() => setActiveTab("members")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
            activeTab === "members" 
              ? "bg-[#e6007e]/15 border-[#e6007e] shadow-lg shadow-[#e6007e]/15" 
              : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Applicants</span>
            <UserCheck size={16} className="text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{memberApplicants.length}</span>
            {pendingMembersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                {pendingMembersCount} New
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registrations</span>
        </div>

        {/* Inbox */}
        <div 
          onClick={() => setActiveTab("inbox")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
            activeTab === "inbox" 
              ? "bg-[#e6007e]/15 border-[#e6007e] shadow-lg shadow-[#e6007e]/15" 
              : "bg-[#0c1017] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Messages</span>
            <Mail size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{contactMessages.length}</span>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase animate-pulse">
                {unreadMessagesCount} Unread
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Inquiries</span>
        </div>
      </div>

      {/* Main Admin Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-[#0c1017] border border-slate-800">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "approvals"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Clock size={16} />
          <span>Approvals ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "projects"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FolderKanban size={16} />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "events"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Calendar size={16} />
          <span>Events ({events.length})</span>
        </button>

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "members"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <UserCheck size={16} />
              <span>Applicants ({memberApplicants.length})</span>
              {pendingMembersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "inbox"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Mail size={16} />
              <span>Inbox ({contactMessages.length})</span>
              {unreadMessagesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "team"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users size={16} />
              <span>Team ({team.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("site")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "site"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Globe size={16} />
              <span>Site CMS</span>
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "media"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Newspaper size={16} />
              <span>Media CMS ({mediaItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "stats"
                  ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <BarChart3 size={16} />
              <span>Stats</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: APPROVALS QUEUE */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Pending Project Submissions</h2>
            <span className="text-xs text-slate-400">{pendingCount} projects pending review</span>
          </div>

          {projects.filter((p) => p.status === "pending").length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0c1017] border border-slate-800">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">No pending submissions!</p>
              <p className="text-slate-400 text-xs mt-1">All project proposals are reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter((p) => p.status === "pending")
                .map((project) => (
                  <div
                    key={project.id || project._id}
                    className="p-5 rounded-2xl bg-[#0c1017] border border-amber-500/30 space-y-4 shadow-xl"
                  >
                    <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                      <Image
                        src={project.image || "/images/projects/project1.jpg"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                        Pending
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-[#e6007e] uppercase tracking-wider">
                        {project.avenue?.replace(/&amp;/gi, "&")}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        By: <span className="text-slate-300 font-medium">{project.submittedBy}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setEditingProject(project)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-[#e6007e] font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Edit project details before approving"
                      >
                        <Edit3 size={14} className="text-[#e6007e]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveProject(project.id || project._id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all cursor-pointer shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectProject(project.id || project._id)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase transition-all cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id || project._id)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-slate-800 transition-all cursor-pointer"
                        title="Delete Proposal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS MANAGEMENT */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <Button
              onClick={() => setIsAddingProject(true)}
              className="py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              <PlusCircle size={16} />
              <span>Add New Project</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id || project._id}
                className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <Image
                      src={project.image || "/images/projects/project1.jpg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full font-black text-[10px] tracking-wider uppercase ${
                        project.status === "approved"
                          ? "bg-emerald-500/90 text-slate-950"
                          : project.status === "pending"
                          ? "bg-amber-500/90 text-slate-950"
                          : "bg-rose-500/90 text-white"
                      }`}
                    >
                      {project.status || "approved"}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#e6007e] uppercase tracking-wider">
                    {project.avenue?.replace(/&amp;/gi, "&")}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{project.date}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit3 size={14} />
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteProject(project.id || project._id)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UPCOMING EVENTS MANAGEMENT */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={eventFilterAvenue}
                onChange={(e) => setEventFilterAvenue(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="All">All Avenues</option>
                <option value="Community Service Avenue">Community Service Avenue</option>
                <option value="Club Service Avenue">Club Service Avenue</option>
                <option value="Professional Development Avenue">Professional Development Avenue</option>
                <option value="Membership Development Avenue">Membership Development Avenue</option>
                <option value="International Service Avenue">International Service Avenue</option>
                <option value="Public Relations and Public Image">Public Relations and Public Image</option>
                <option value="Sports and Recreational Activities">Sports and Recreational Activities</option>
                <option value="Environmental Service Avenue">Environmental Service Avenue</option>
              </select>
              <span className="text-xs text-slate-400">{filteredEvents.length} events active</span>
            </div>

            {isSuperAdmin && (
              <Button
                onClick={() => setIsAddingEvent(true)}
                className="py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                <PlusCircle size={16} />
                <span>Create New Event</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <div
                key={ev._id || ev.id}
                className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <Image
                      src={ev.image || "/images/hero.jpg"}
                      alt={ev.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#e6007e] text-white text-[10px] font-bold uppercase tracking-wider">
                      {ev.avenue}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                      {ev.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{ev.title}</h3>
                  {ev.subtitle && <p className="text-xs text-[#ff66ab] mt-0.5">{ev.subtitle}</p>}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{ev.description}</p>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-[#e6007e]" />
                      <span>{ev.time || "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-[#e6007e]" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${ev.registrationOpen ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-400"}`}>
                    {ev.registrationOpen ? "Registration Open" : "Closed"}
                  </span>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingEvent(ev)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id || ev.id)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEMBERSHIP APPLICANTS VIEWER */}
      {isSuperAdmin && activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicant or student ID..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400"
                />
              </div>

              <select
                value={memberFilterStatus}
                onChange={(e) => setMemberFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span>Total: <strong className="text-white">{memberApplicants.length}</strong></span>
              <span>Pending: <strong className="text-amber-400">{pendingMembersCount}</strong></span>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0c1017] border border-slate-800">
              <UserCheck size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">No membership applications found</p>
              <p className="text-slate-400 text-xs mt-1">New registrations from /join-us will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMembers.map((m) => (
                <div
                  key={m._id || m.id}
                  className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl"
                >
                  {/* Header Row: Photo + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {m.photoUrl ? (
                        <a href={m.photoUrl} target="_blank" rel="noopener noreferrer" title="Click to view full photo">
                          <img
                            src={m.photoUrl}
                            alt={m.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e6007e]/60 shadow-md shrink-0 hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                          {(m.fullName || "M").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{m.fullName}</h3>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono font-bold">
                            {m.studentId}
                          </span>
                          {m.yearOfStudy && (
                            <span className="px-2 py-0.5 rounded bg-[#e6007e]/20 text-[#e6007e] border border-[#e6007e]/40 text-[10px] font-black">
                              {m.yearOfStudy}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {m.faculty} • <span className="text-slate-300">{m.gender || "Member"}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        m.status === "approved"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : m.status === "contacted"
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                          : m.status === "rejected"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {m.status || "pending"}
                    </span>
                  </div>

                  {/* Avenue & NIC Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-[#e6007e]/15 border border-[#e6007e]/40 text-[#e6007e] font-bold text-[11px]">
                      {m.avenue || (m.avenues && m.avenues[0]) || "General Avenue"}
                    </span>
                    {m.nic && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                        NIC: {m.nic}
                      </span>
                    )}
                    {m.dob && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                        DOB: {m.dob}
                      </span>
                    )}
                  </div>

                  {/* Contact Row with Direct WhatsApp Launcher */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <Mail size={14} className="text-[#e6007e] shrink-0" />
                      <a href={`mailto:${m.email}`} className="truncate hover:underline text-xs">{m.email}</a>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <Phone size={14} className="text-[#e6007e] shrink-0" />
                        <span className="text-xs truncate">{m.whatsapp || m.phone}</span>
                      </div>
                      {(m.whatsapp || m.phone) && (
                        <a
                          href={`https://wa.me/${(m.whatsapp || m.phone).replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase transition-all shrink-0"
                          title="Open WhatsApp chat"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {m.address && (
                    <p className="text-[11px] text-slate-400">
                      <span className="text-slate-400 font-semibold">Address:</span> {m.address}
                    </p>
                  )}

                  {/* Other Club Experience */}
                  {m.otherClub && (
                    <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300">
                      <span className="text-[#e6007e] font-bold">Other Club:</span> {m.otherClub}
                    </div>
                  )}

                  {/* Membership Fee Receipt Verification Box (Rs. 2,000) */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block text-xs">Membership Fee: Rs. 2,000</span>
                        <span className="text-[10px] text-slate-400">Commercial Bank • Acc: 8014276428</span>
                      </div>
                    </div>
                    {m.paymentReceiptUrl ? (
                      <a
                        href={m.paymentReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-950 shrink-0 flex items-center gap-1.5"
                      >
                        <FileText size={13} />
                        <span>View Receipt</span>
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Receipt Pending</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "Recent"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateMemberStatus(m._id || m.id, "approved")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold cursor-pointer"
                        title="Mark as Approved"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateMemberStatus(m._id || m.id, "contacted")}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold cursor-pointer"
                        title="Mark as Contacted"
                      >
                        Contacted
                      </button>
                      <button
                        onClick={() => handleDeleteMemberApplication(m._id || m.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONTACT INBOX */}
      {isSuperAdmin && activeTab === "inbox" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={messageFilterStatus}
                onChange={(e) => setMessageFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
              <span className="text-xs text-slate-400">{filteredMessages.length} inquiries</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span>Total: <strong className="text-white">{contactMessages.length}</strong></span>
              <span>Unread: <strong className="text-cyan-400">{unreadMessagesCount}</strong></span>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0c1017] border border-slate-800">
              <Mail size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">No messages in inbox</p>
              <p className="text-slate-400 text-xs mt-1">Inquiries from /contact will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className={`p-5 rounded-2xl bg-[#0c1017] border space-y-3 transition-all ${
                    msg.status === "unread" ? "border-cyan-500/50 shadow-lg shadow-cyan-950/20" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{msg.name}</h3>
                        <span className="text-xs text-slate-400">&lt;{msg.email}&gt;</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#ff66ab] mt-1">{msg.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          msg.status === "unread"
                            ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                            : msg.status === "replied"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {msg.status || "unread"}
                      </span>
                      <button
                        onClick={() => handleDeleteContactMessage(msg._id || msg.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Received: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Recently"}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        onClick={() => handleUpdateMessageStatus(msg._id || msg.id, "replied")}
                        className="px-3 py-1.5 rounded-lg bg-[#e6007e] text-white text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-[#c4006c]"
                      >
                        <ExternalLink size={12} />
                        <span>Reply Email</span>
                      </a>
                      {msg.status === "unread" ? (
                        <button
                          onClick={() => handleUpdateMessageStatus(msg._id || msg.id, "read")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateMessageStatus(msg._id || msg.id, "unread")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                        >
                          Mark Unread
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TEAM MANAGEMENT */}
      {isSuperAdmin && activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Board &amp; Leadership Directory</h2>
            <Button
              onClick={() => setIsAddingMember(true)}
              className="py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              <UserPlus size={16} />
              <span>Add Member</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <Image
                      src={member.image || "/images/team/placeholder.jpg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#e6007e] uppercase tracking-wider">
                    {member.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{member.name}</h3>
                  <p className="text-xs text-[#ff66ab] font-medium">{member.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{member.faculty}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: GLOBAL SITE CMS */}
      {isSuperAdmin && activeTab === "site" && (
        <form onSubmit={handleSaveSiteCMS} className="space-y-8 max-w-4xl">
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Globe size={18} className="text-[#e6007e]" />
              <span>Hero Section Banner Content</span>
            </h3>
            <Input
              label="Hero Main Title"
              value={siteContent.heroTitle || ""}
              onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
            />
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
            <Input
              label="Primary CTA Button Text"
              value={siteContent.heroButtonText || ""}
              onChange={(e) => setSiteContent({ ...siteContent, heroButtonText: e.target.value })}
            />
          </div>

          <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Users size={18} className="text-[#e6007e]" />
              <span>Who We Are &amp; Mission Statements</span>
            </h3>
            <Input
              label="Who We Are Heading"
              value={siteContent.whoWeAreTitle || ""}
              onChange={(e) => setSiteContent({ ...siteContent, whoWeAreTitle: e.target.value })}
            />
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                Main Organization Description
              </label>
              <textarea
                rows={4}
                value={siteContent.whoWeAreDescription || ""}
                onChange={(e) => setSiteContent({ ...siteContent, whoWeAreDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
            <Input
              label="Mission Statement"
              value={siteContent.missionText || ""}
              onChange={(e) => setSiteContent({ ...siteContent, missionText: e.target.value })}
            />
            <Input
              label="Vision Statement"
              value={siteContent.visionText || ""}
              onChange={(e) => setSiteContent({ ...siteContent, visionText: e.target.value })}
            />
          </div>

          <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Mail size={18} className="text-[#e6007e]" />
              <span>Official University &amp; Contact Coordinates</span>
            </h3>
            <Input
              label="Campus Address"
              value={siteContent.address || ""}
              onChange={(e) => setSiteContent({ ...siteContent, address: e.target.value })}
            />
            <Input
              label="Official Club Email"
              value={siteContent.email || ""}
              onChange={(e) => setSiteContent({ ...siteContent, email: e.target.value })}
            />
            <Input
              label="Facebook URL"
              value={siteContent.facebookUrl || ""}
              onChange={(e) => setSiteContent({ ...siteContent, facebookUrl: e.target.value })}
            />
            <Input
              label="Instagram URL"
              value={siteContent.instagramUrl || ""}
              onChange={(e) => setSiteContent({ ...siteContent, instagramUrl: e.target.value })}
            />
            <Input
              label="LinkedIn URL"
              value={siteContent.linkedinUrl || ""}
              onChange={(e) => setSiteContent({ ...siteContent, linkedinUrl: e.target.value })}
            />
          </div>

          <Button type="submit" className="py-3 px-8 text-xs font-bold uppercase tracking-wider">
            Save Global Site CMS Content
          </Button>
        </form>
      )}

      {/* TAB 8: LIVE COUNTER STATS */}
      {isSuperAdmin && activeTab === "stats" && (
        <form onSubmit={handleSaveStats} className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Configure Homepage Impact Counter
            </h3>
            {stats.map((st, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <Input
                  label="Label Title"
                  value={st.label}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[idx].label = e.target.value;
                    setStats(copy);
                  }}
                />
                <Input
                  label="Display Value (e.g., 50+)"
                  value={st.value}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[idx].value = e.target.value;
                    setStats(copy);
                  }}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="py-3 px-8 text-xs font-bold uppercase tracking-wider">
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
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-[#e6007e]" />
                <span>Edit Project Details (Admin)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <Input
              label="Project Title"
              value={editingProject.title || ""}
              onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue</label>
                <select
                  value={editingProject.avenue || "Community Service Avenue"}
                  onChange={(e) => setEditingProject({ ...editingProject, avenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
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
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Approval Status</label>
                <select
                  value={editingProject.status || "approved"}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                >
                  <option value="approved">Approved (Live on Website)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={editingProject.date || ""}
                onChange={(e) => setEditingProject({ ...editingProject, date: e.target.value })}
              />
              <Input
                label="Impact Metric"
                value={editingProject.impact || ""}
                placeholder="e.g. 500+ Beneficiaries"
                onChange={(e) => setEditingProject({ ...editingProject, impact: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Summary Description</label>
              <textarea
                rows={3}
                value={editingProject.description || ""}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Full Detailed Story / Overview</label>
              <textarea
                rows={4}
                value={editingProject.fullDescription || ""}
                placeholder="Detailed article about project objectives, execution, and outcomes..."
                onChange={(e) => setEditingProject({ ...editingProject, fullDescription: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                Upload New Photo / Album Images
              </label>
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
              {editingProject.image && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">Current Photo:</span>
                  <span className="text-[10px] font-mono text-[#e6007e] truncate max-w-xs">{editingProject.image}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#e6007e]/30 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {isAddingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingProject(false)} />
          <form
            onSubmit={handleAddProjectSubmit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white">Create New Project</h3>
            <Input label="Title" value={newProjectForm.title} onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue</label>
                <select
                  value={newProjectForm.avenue}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, avenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
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
              <Input label="Date" type="date" value={newProjectForm.date} onChange={(e) => setNewProjectForm({ ...newProjectForm, date: e.target.value })} required />
            </div>

            <Input label="Impact Metric" value={newProjectForm.impact} onChange={(e) => setNewProjectForm({ ...newProjectForm, impact: e.target.value })} />
            <Input label="Summary Description" value={newProjectForm.description} onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })} required />

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (url) => setNewProjectForm({ ...newProjectForm, image: url, images: [url] }))}
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsAddingProject(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase cursor-pointer">Create Project</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingEvent(false)} />
          <form
            onSubmit={handleAddEventSubmit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white">Create New Event</h3>
            <Input label="Event Title" value={newEventForm.title} onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })} required />
            <Input label="Subtitle" value={newEventForm.subtitle} onChange={(e) => setNewEventForm({ ...newEventForm, subtitle: e.target.value })} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue</label>
                <select
                  value={newEventForm.avenue}
                  onChange={(e) => setNewEventForm({ ...newEventForm, avenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
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
              <Input label="Date" type="date" value={newEventForm.date} onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Time" value={newEventForm.time} onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })} />
              <Input label="Location" value={newEventForm.location} onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })} />
            </div>

            <Input label="Registration Link" value={newEventForm.registrationLink} onChange={(e) => setNewEventForm({ ...newEventForm, registrationLink: e.target.value })} />
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={newEventForm.description}
                onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>

            <Input label="Tags (comma separated)" value={newEventForm.tags} onChange={(e) => setNewEventForm({ ...newEventForm, tags: e.target.value })} />

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Upload Event Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (url) => setNewEventForm({ ...newEventForm, image: url }))}
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsAddingEvent(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase cursor-pointer">Create Event</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingEvent(null)} />
          <form
            onSubmit={handleSaveEventEdit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white">Edit Event Details</h3>
            <Input label="Event Title" value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} required />
            <Input label="Subtitle" value={editingEvent.subtitle || ""} onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue</label>
                <select
                  value={editingEvent.avenue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, avenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
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
              <Input label="Date" type="date" value={editingEvent.date} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Time" value={editingEvent.time || ""} onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })} />
              <Input label="Location" value={editingEvent.location || ""} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} />
            </div>

            <Input label="Registration Link" value={editingEvent.registrationLink || ""} onChange={(e) => setEditingEvent({ ...editingEvent, registrationLink: e.target.value })} />

            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.registrationOpen ?? true}
                  onChange={(e) => setEditingEvent({ ...editingEvent, registrationOpen: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-[#e6007e]"
                />
                <span>Registration Open</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEvent.featured ?? true}
                  onChange={(e) => setEditingEvent({ ...editingEvent, featured: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-[#e6007e]"
                />
                <span>Featured Event</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Update Banner Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAdminFileUpload(e, (url) => setEditingEvent({ ...editingEvent, image: url }))}
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase cursor-pointer">Save Changes</button>
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
              <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase cursor-pointer">Save Changes</button>
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
                className="text-xs text-slate-400 mb-2 block"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsAddingMember(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-[#e6007e] text-white text-xs font-bold uppercase cursor-pointer">Add Member</button>
            </div>
          </form>
        </div>
      )}
      {/* STYLED CONFIRMATION MODAL (Replaces window.confirm) */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c1017] border border-rose-500/40 shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
                <Trash2 size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Permanently Delete?</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to delete <strong className="text-rose-300 font-semibold">{deleteConfirm.title}</strong>? This action cannot be reversed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmExecuteDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  Delete Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION (Replaces window.alert) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-[#0c1017] border border-[#e6007e]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#e6007e]/20 text-[#e6007e] flex items-center justify-center shrink-0 border border-[#e6007e]/40">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-xs font-semibold text-white flex-1 leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
      {/* TAB: MEDIA CMS */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={mediaFilterType}
                onChange={(e) => setMediaFilterType(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Media ({mediaItems.length})</option>
                <option value="blog">Blogs Only ({mediaItems.filter(m => m.type === "blog").length})</option>
                <option value="article">Articles Only ({mediaItems.filter(m => m.type === "article").length})</option>
                <option value="bulletin">Bulletins Only ({mediaItems.filter(m => m.type === "bulletin").length})</option>
              </select>
            </div>

            <Button
              onClick={() => setIsAddingMedia(true)}
              className="py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              <span>Create New Publication / Story</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems
              .filter((m) => mediaFilterType === "all" || m.type === mediaFilterType)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.type === "blog"
                            ? "bg-[#e6007e]/20 text-[#e6007e] border border-[#e6007e]/40"
                            : item.type === "article"
                            ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.summary || item.description}</p>
                    
                    {item.author && (
                      <p className="text-[11px] text-slate-400">
                        By <strong className="text-slate-300">{item.author}</strong> ({item.avenue || "General"})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400">{item.readTime || item.size || item.status}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingMedia(item)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-[#e6007e] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Edit publication"
                      >
                        <Edit3 size={13} className="text-[#e6007e]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800 transition-all cursor-pointer"
                        title="Delete publication"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE NEW MEDIA MODAL */}
      {isAddingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingMedia(false)} />
          <form
            onSubmit={handleAddMediaSubmit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper size={18} className="text-[#e6007e]" />
                <span>Publish New Media (Admin)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingMedia(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Publication Type *</label>
              <select
                value={newMediaForm.type}
                onChange={(e) => setNewMediaForm({ ...newMediaForm, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
              >
                <option value="blog">Blog (Student Volunteer Story / Reflection)</option>
                <option value="article">Article (Formal Editorial / Leadership Opinion)</option>
                <option value="bulletin">Bulletin (PDF Report / Magazine)</option>
              </select>
            </div>

            <Input
              label="Title *"
              value={newMediaForm.title}
              onChange={(e) => setNewMediaForm({ ...newMediaForm, title: e.target.value })}
              required
            />

            {newMediaForm.type !== "bulletin" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Author Name *"
                    value={newMediaForm.author}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, author: e.target.value })}
                    required
                  />
                  <Input
                    label="Author Role"
                    value={newMediaForm.authorRole}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, authorRole: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue *</label>
                    <select
                      value={newMediaForm.avenue}
                      onChange={(e) => setNewMediaForm({ ...newMediaForm, avenue: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
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
                  <Input
                    label="Reading Time"
                    placeholder="e.g. 4 min read"
                    value={newMediaForm.readTime}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, readTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Executive Summary *</label>
                  <textarea
                    rows={2}
                    value={newMediaForm.summary}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, summary: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Full Story Body *</label>
                  <textarea
                    rows={6}
                    value={newMediaForm.content}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    placeholder="Write the full article/blog content here..."
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Issue / Volume"
                    placeholder="Volume 1 • Issue 1"
                    value={newMediaForm.issue}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, issue: e.target.value })}
                  />
                  <Input
                    label="File Size"
                    placeholder="3.5 MB"
                    value={newMediaForm.size}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, size: e.target.value })}
                  />
                </div>

                <Input
                  label="PDF Link / Document URL *"
                  value={newMediaForm.fileUrl}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, fileUrl: e.target.value })}
                  required
                />

                <div>
                  <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={newMediaForm.summary}
                    onChange={(e) => setNewMediaForm({ ...newMediaForm, summary: e.target.value, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingMedia(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#e6007e]/30"
              >
                Publish Now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MEDIA PUBLICATION MODAL */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingMedia(null)} />
          <form
            onSubmit={handleSaveMediaEdit}
            className="relative w-full max-w-xl p-8 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 z-10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Edit Publication Details</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#e6007e]/20 text-[#e6007e] border border-[#e6007e]/30">
                {editingMedia.type}
              </span>
            </div>

            <Input
              label="Title"
              value={editingMedia.title || ""}
              onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author Name"
                value={editingMedia.author || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, author: e.target.value })}
              />
              <Input
                label="Author Role"
                value={editingMedia.authorRole || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, authorRole: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Avenue *</label>
                <select
                  value={editingMedia.avenue || "Community Service Avenue"}
                  onChange={(e) => setEditingMedia({ ...editingMedia, avenue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
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
              <Input
                label="Reading Time / Size"
                value={editingMedia.readTime || editingMedia.size || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, readTime: e.target.value, size: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Approval Status</label>
              <select
                value={editingMedia.status || "approved"}
                onChange={(e) => setEditingMedia({ ...editingMedia, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
              >
                <option value="approved">Approved (Live)</option>
                <option value="pending">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Summary / Excerpt</label>
              <textarea
                rows={3}
                value={editingMedia.summary || editingMedia.description || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, summary: e.target.value, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                required
              />
            </div>

            {editingMedia.content !== undefined && (
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Article / Blog Full Text</label>
                <textarea
                  rows={6}
                  value={editingMedia.content || ""}
                  onChange={(e) => setEditingMedia({ ...editingMedia, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#e6007e]/30"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

}