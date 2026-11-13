"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  getStoredAvenues, 
  saveStoredAvenues 
} from "@/lib/avenuesStore";
import { 
  checkRateLimit, 
  registerFailedAttempt, 
  resetRateLimit 
} from "@/lib/security";
import { useAdmin } from "@/context/AdminContext";
import AdminLoginPortal from "@/components/admin/AdminLoginPortal";
import VisualSiteCustomizer from "@/components/admin/VisualSiteCustomizer";
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
  Newspaper,
  Sparkles
} from "lucide-react";

function AdminDashboardInner() {
  const { isAdmin, isSuperAdmin, isProjectEditor, isVerifying, adminRole, loginAdmin, logoutAdmin } = useAdmin();
  const searchParams = useSearchParams();
  const tabQuery = searchParams ? searchParams.get("tab") : null;
  const [activeTab, setActiveTab] = useState(tabQuery || "overview");

  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    }
    if (searchParams?.get("logout") === "true") {
      logoutAdmin();
    }
  }, [tabQuery, searchParams, logoutAdmin]);

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
      deleteProject(id);
      setProjects((prev) =>
        prev.filter((p) => {
          const pId = String(p._id || p.id || "").toLowerCase();
          const target = String(id || "").toLowerCase();
          const pSlug = String(p.slug || "").toLowerCase();
          const pTitle = String(p.title || "").toLowerCase();
          return pId !== target && pSlug !== target && pTitle !== target;
        })
      );
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showToast("Project permanently deleted from database.", "info");
        } else {
          showToast(json.error || "Failed to delete project from database", "error");
        }
      } catch (err) {
        console.error("Deletion sync error:", err);
        showToast("Network error deleting project", "error");
      }
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

  // Master State Managers
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [events, setEvents] = useState([]);
  const [avenues, setAvenues] = useState([]);
  const [memberApplicants, setMemberApplicants] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState([]);
  const [mediaViewMode, setMediaViewMode] = useState("gallery"); // "gallery" | "articles"
  const [isUploadingCloudinaryPhoto, setIsUploadingCloudinaryPhoto] = useState(false);
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
    image: "",
    images: [],
    driveLink: "",
    proposalPdf: "",
    proposalPdfName: "",
    reportPdf: "",
    reportPdfName: "",
    projectChair: "",
    projectSecretary: "",
    projectTreasurer: "",
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
    setAvenues(getStoredAvenues());

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
        if (json.success && Array.isArray(json.data)) {
          setProjects(json.data);
        }
      })
      .catch((err) => console.log("Admin projects API fallback:", err));

    // Fetch live events from API (fetch all approval statuses for admin)
    fetch("/api/events?approvalStatus=all&status=all")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
        }
      })
      .catch((err) => console.log("Admin events API fallback:", err));

    // Fetch live Cloudinary uploaded media assets
    fetch("/api/upload")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCloudinaryPhotos(json.data);
        }
      })
      .catch((err) => console.log("Admin Cloudinary photos API fallback:", err));
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

  // Cloudinary Direct Media Upload for Admin
  const handleAdminFileUpload = async (e, callback) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    showToast(`Uploading ${files.length} asset(s) to Cloudinary CDN...`, "info");
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name || "Admin Upload");
        formData.append("avenue", "General");

        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const json = await res.json();
        if (json.success && json.data?.imageUrl) {
          uploadedUrls.push(json.data.imageUrl);
        } else {
          // Fallback to local DataURL if direct upload returns error
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (evt) => resolve(evt.target?.result);
            reader.readAsDataURL(file);
          });
          if (base64) uploadedUrls.push(base64);
        }
      } catch (uploadErr) {
        console.warn("Upload fallback to local reader:", uploadErr);
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result);
          reader.readAsDataURL(file);
        });
        if (base64) uploadedUrls.push(base64);
      }
    }

    if (uploadedUrls.length > 0) {
      showToast("Media successfully saved to Cloudinary CDN!", "success");
      callback(uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls);
    }
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

  const handleApproveEvent = async (id) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: "approved" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => prev.map((e) => ((e._id || e.id) === id ? { ...e, approvalStatus: "approved" } : e)));
        showToast("Upcoming Event approved and published to live website!", "success");
      } else {
        showToast(data.error || "Failed to approve event", "error");
      }
    } catch (err) {
      console.error("Approve event error:", err);
      showToast("Network error approving event", "error");
    }
  };

  const handleRejectEvent = async (id) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: "rejected" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => prev.map((e) => ((e._id || e.id) === id ? { ...e, approvalStatus: "rejected" } : e)));
        showToast("Upcoming Event proposal rejected.", "info");
      } else {
        showToast(data.error || "Failed to reject event", "error");
      }
    } catch (err) {
      console.error("Reject event error:", err);
      showToast("Network error rejecting event", "error");
    }
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

  const handleDirectCloudinaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCloudinaryPhoto(true);
    showToast("Uploading photo to Cloudinary CDN...", "info");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("avenue", "General");
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCloudinaryPhotos((prev) => [json.data, ...prev]);
        showToast("Photo uploaded to Cloudinary successfully!", "success");
      } else {
        showToast(json.error || "Failed to upload photo", "error");
      }
    } catch (err) {
      showToast("Error uploading photo", "error");
    } finally {
      setIsUploadingCloudinaryPhoto(false);
      e.target.value = "";
    }
  };

  const handleDeleteCloudinaryPhoto = async (id) => {
    try {
      const res = await fetch(`/api/upload?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setCloudinaryPhotos((prev) => prev.filter((p) => p._id !== id));
        showToast("Photo deleted from Cloudinary & database!", "success");
      } else {
        showToast(json.error || "Failed to delete photo", "error");
      }
    } catch (err) {
      showToast("Error deleting photo", "error");
    }
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
    if (e) e.preventDefault();
    const payload = {
      ...siteContent,
      stats,
      avenues,
    };
    const updated = saveStoredSiteContent(payload);
    setSiteContent(updated);
    if (avenues && avenues.length > 0) {
      saveStoredAvenues(avenues);
    }
    if (stats && stats.length > 0) {
      saveStoredStats(stats);
    }
    showToast("Website Global Content saved & synchronized to MongoDB Atlas!", "success");
  };

  const pendingProjects = projects.filter((p) => p.status === "pending");
  const pendingEvents = events.filter((e) => e.approvalStatus === "pending");
  const pendingCount = pendingProjects.length + pendingEvents.length;
  const unreadMessagesCount = contactMessages.filter((m) => m.status === "unread").length;
  const pendingMembersCount = memberApplicants.filter((m) => m.status === "pending").length;

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#07090e] pt-32 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-[#e6007e] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-bold">Verifying Administrator Session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginPortal />;
  }

  // Filtered lists
  const filteredProjects = projects.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const s = (search || "").toLowerCase();
    const matchSearch =
      !s ||
      (p.title || "").toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s) ||
      (p.avenue || "").toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  const filteredEvents = events.filter((ev) => {
    if (eventFilterAvenue === "All") return true;
    const evAve = (ev.avenue || "").toLowerCase();
    const targetAve = (eventFilterAvenue || "").toLowerCase();
    return (
      evAve === targetAve ||
      (evAve && targetAve.includes(evAve)) ||
      (evAve && evAve.includes(targetAve.replace(" avenue", "")))
    );
  });

  const filteredMembers = memberApplicants.filter((m) => {
    const matchStatus = memberFilterStatus === "all" || m.status === memberFilterStatus;
    const ms = (memberSearch || "").toLowerCase();
    const matchSearch =
      !ms ||
      (m.fullName || "").toLowerCase().includes(ms) ||
      (m.studentId || "").toLowerCase().includes(ms) ||
      (m.email || "").toLowerCase().includes(ms) ||
      (m.avenue || "").toLowerCase().includes(ms);
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Globe size={14} className="text-[#e6007e]" />
            <span>View Public Website</span>
          </Link>
          <button
            onClick={logoutAdmin}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-xs font-bold text-slate-300 hover:text-rose-300 cursor-pointer transition-all"
          >
            Logout ({isSuperAdmin ? "Master Admin" : "Editor"})
          </button>
        </div>
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
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#e6007e] text-white shadow-lg shadow-[#e6007e]/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <BarChart3 size={16} />
          <span>Overview</span>
        </button>

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
              <span>Visual Site Studio</span>
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

      {/* TAB 0: MASTER CLUB OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Welcome & Command Status Hero */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#160613] via-[#0c1017] to-[#07090e] border border-[#e6007e]/30 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,_rgba(230,0,126,0.18)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6007e]/15 border border-[#e6007e]/40 text-[#ff66ab] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>Club Master Command Center</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome to Rotaract SLTC Master Dashboard
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Oversee all frontline operations, review pending submissions, manage 8 avenues of service, 
                  track club membership growth, and update dynamic media across the SLTC website in realtime.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="px-4 py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#e6007e]/30 cursor-pointer"
                >
                  <Clock size={15} />
                  <span>Review Approvals ({pendingCount})</span>
                </button>
                <button
                  onClick={() => { setActiveTab("projects"); setIsAddingProject(true); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={15} />
                  <span>Add Project</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FolderKanban size={16} className="text-[#e6007e]" />
              <span>Quick Operational Shortcuts</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setActiveTab("approvals")}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-[#e6007e] text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <Clock size={20} className="text-[#e6007e] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Approvals</span>
                <span className="text-[10px] text-slate-400">{pendingCount} awaiting</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-purple-500 text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <Users size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Applicants</span>
                <span className="text-[10px] text-slate-400">{memberApplicants.length} registered</span>
              </button>

              <button
                onClick={() => { setActiveTab("projects"); setIsAddingProject(true); }}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-cyan-500 text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle size={20} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">New Project</span>
                <span className="text-[10px] text-slate-400">Publish service</span>
              </button>

              <button
                onClick={() => { setActiveTab("events"); setIsAddingEvent(true); }}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-amber-500 text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <Calendar size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">New Event</span>
                <span className="text-[10px] text-slate-400">Schedule flyer</span>
              </button>

              <button
                onClick={() => setActiveTab("media")}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-pink-500 text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <Newspaper size={20} className="text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Media CMS</span>
                <span className="text-[10px] text-slate-400">{mediaItems.length} publications</span>
              </button>

              <button
                onClick={() => setActiveTab("site")}
                className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800 hover:border-emerald-500 text-left transition-all group hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Visual Studio</span>
                <span className="text-[10px] text-slate-400">Live Page Editor</span>
              </button>
            </div>
          </div>

          {/* Split Section: Pending Approvals Queue Peek & Latest Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approvals Peek */}
            <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#e6007e]" />
                  <h3 className="text-base font-bold text-white">Pending Approvals Queue</h3>
                </div>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="text-xs text-[#ff66ab] hover:underline font-semibold cursor-pointer"
                >
                  View All ({pendingCount})
                </button>
              </div>

              {pendingCount === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 size={32} className="text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-slate-400 font-semibold">Approvals Queue is Clear!</p>
                  <p className="text-slate-600 mt-0.5">No pending project proposals awaiting approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.filter(p => p.status === "pending").slice(0, 3).map((p) => (
                    <div key={p.id || p._id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <span className="text-[10px] text-cyan-400 block">{p.avenue}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("approvals")}
                        className="px-3 py-1.5 rounded-lg bg-[#e6007e] text-white text-[10px] font-bold uppercase shrink-0 cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Member Applicants Peek */}
            <div className="p-6 rounded-3xl bg-[#0c1017] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  <h3 className="text-base font-bold text-white">Recent Member Applicants</h3>
                </div>
                <button
                  onClick={() => setActiveTab("members")}
                  className="text-xs text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  View All ({memberApplicants.length})
                </button>
              </div>

              {memberApplicants.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Users size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 font-semibold">No member applications yet</p>
                  <p className="text-slate-600 mt-0.5">New signups from /join-us will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberApplicants.slice(0, 3).map((m) => (
                    <div key={m._id || m.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{m.fullName}</h4>
                        <span className="text-[10px] text-slate-400 block">{m.studentId || m.faculty || m.email}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        m.status === "approved"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}>
                        {m.status || "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* System Status & Infrastructure Bar */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">Admin Account:</span>
              <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                rotaractsltc@gmail.com
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Role: <strong className="text-emerald-400 uppercase">{isSuperAdmin ? "Super Admin" : "Project Editor"}</strong></span>
              <span>Session: <strong className="text-white">Active Cryptographic HMAC</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: APPROVALS QUEUE (PROJECTS & UPCOMING EVENTS) */}
      {activeTab === "approvals" && (
        <div className="space-y-10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-[#e6007e]" />
                <span>Executive Approvals Queue</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, edit, approve, or reject public proposals submitted by club members and visitors.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#e6007e]/15 border border-[#e6007e]/40 text-[#ff4d94] text-xs font-bold">
              {pendingCount} Total In Queue
            </span>
          </div>

          {/* SECTION 1: PENDING PROJECTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderKanban size={16} className="text-cyan-400" />
                <span>Pending Project Submissions</span>
              </h3>
              <span className="text-xs text-slate-400">{pendingProjects.length} projects pending</span>
            </div>

            {pendingProjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0c1017] border border-slate-800">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-300 text-sm font-semibold">No pending project proposals!</p>
                <p className="text-slate-500 text-xs mt-0.5">All submitted projects have been processed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProjects.map((project) => (
                  <div
                    key={project.id || project._id}
                    className="p-5 rounded-2xl bg-[#0c1017] border border-amber-500/30 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase bg-slate-950">
                            No Showcase Photo
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                          Pending Project
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

                        {project.driveLink && (
                          <a
                            href={project.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#e6007e] hover:underline font-semibold mt-2"
                          >
                            📁 View Media Album (Google Drive) ↗
                          </a>
                        )}

                        {(project.projectChair || project.projectSecretary || project.projectTreasurer) && (
                          <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1 mt-2.5">
                            {project.projectChair && <div><strong className="text-slate-300">Chair:</strong> {project.projectChair}</div>}
                            {project.projectSecretary && <div><strong className="text-slate-300">Secretary:</strong> {project.projectSecretary}</div>}
                            {project.projectTreasurer && <div><strong className="text-slate-300">Treasurer:</strong> {project.projectTreasurer}</div>}
                          </div>
                        )}

                        {(project.proposalPdf || project.reportPdf) && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1.5 mt-2.5">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                              📄 Project Documents (PDF):
                            </span>
                            <div className="flex flex-col gap-1.5">
                              {project.proposalPdf && (
                                <a
                                  href={project.proposalPdf}
                                  target="_blank"
                                  download={project.proposalPdfName || `${project.title}_Proposal.pdf`}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0c1017] hover:bg-[#e6007e]/20 border border-slate-700 hover:border-[#e6007e] text-xs font-semibold text-white transition-colors"
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span className="text-[#e6007e]">📥</span>
                                    <span className="truncate">Proposal: {project.proposalPdfName || "Proposal.pdf"}</span>
                                  </span>
                                  <span className="text-[10px] text-[#e6007e] font-bold shrink-0 ml-2">Download</span>
                                </a>
                              )}
                              {project.reportPdf && (
                                <a
                                  href={project.reportPdf}
                                  target="_blank"
                                  download={project.reportPdfName || `${project.title}_Report.pdf`}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0c1017] hover:bg-[#e6007e]/20 border border-slate-700 hover:border-[#e6007e] text-xs font-semibold text-white transition-colors"
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span className="text-cyan-400">📥</span>
                                    <span className="truncate">Report: {project.reportPdfName || "Report.pdf"}</span>
                                  </span>
                                  <span className="text-[10px] text-cyan-400 font-bold shrink-0 ml-2">Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

          {/* SECTION 2: PENDING UPCOMING EVENTS */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-[#e6007e]" />
                <span>Pending Upcoming Event Submissions</span>
              </h3>
              <span className="text-xs text-slate-400">{pendingEvents.length} events pending</span>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#0c1017] border border-slate-800">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-300 text-sm font-semibold">No pending event proposals!</p>
                <p className="text-slate-500 text-xs mt-0.5">All upcoming event submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingEvents.map((ev) => (
                  <div
                    key={ev._id || ev.id}
                    className="p-5 rounded-2xl bg-[#0c1017] border border-amber-500/30 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                        <Image
                          src={ev.image || "/images/hero.jpg"}
                          alt={ev.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                          Pending Event
                        </span>
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                          {ev.date}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-[#e6007e] uppercase tracking-wider">
                          {ev.avenue}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1 line-clamp-1">
                          {ev.title}
                        </h3>
                        {ev.subtitle && <p className="text-xs text-[#ff66ab] mt-0.5 line-clamp-1">{ev.subtitle}</p>}
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {ev.description}
                        </p>
                        
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

                        <p className="text-[11px] text-slate-400 mt-2">
                          Submitted by: <span className="text-slate-300 font-medium">{ev.submittedBy || "Club Member"}</span>
                          {ev.submitterEmail && <span className="text-slate-500 block truncate">({ev.submitterEmail})</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(ev)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-[#e6007e] font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Edit event details before approving"
                      >
                        <Edit3 size={14} className="text-[#e6007e]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveEvent(ev._id || ev.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all cursor-pointer shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectEvent(ev._id || ev.id)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase transition-all cursor-pointer"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev._id || ev.id)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-slate-800 transition-all cursor-pointer"
                        title="Delete Event Proposal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase bg-slate-950">
                        No Photo
                      </div>
                    )}
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

                  {(project.proposalPdf || project.reportPdf) && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/60">
                      {project.proposalPdf && (
                        <a
                          href={project.proposalPdf}
                          target="_blank"
                          download={project.proposalPdfName || "Proposal.pdf"}
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#e6007e] hover:underline font-bold flex items-center gap-1"
                          title="Download Project Proposal"
                        >
                          📄 Proposal PDF ↗
                        </a>
                      )}
                      {project.reportPdf && (
                        <a
                          href={project.reportPdf}
                          target="_blank"
                          download={project.reportPdfName || "Report.pdf"}
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline font-bold flex items-center gap-1"
                          title="Download Project Report"
                        >
                          📊 Report PDF ↗
                        </a>
                      )}
                    </div>
                  )}
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
                    {(isSuperAdmin || isAdmin || isProjectEditor) && (
                      <button
                        onClick={() => handleDeleteProject(project.id || project._id)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300"
                        title="Delete Project"
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

      {/* TAB 7: VISUAL SITE CUSTOMIZER STUDIO (WYSIWYG) */}
      {isSuperAdmin && activeTab === "site" && (
        <VisualSiteCustomizer
          siteContent={siteContent}
          setSiteContent={setSiteContent}
          stats={stats}
          setStats={setStats}
          avenues={avenues}
          setAvenues={setAvenues}
          events={events}
          onSave={handleSaveSiteCMS}
          showToast={showToast}
          handleFileUpload={handleAdminFileUpload}
        />
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

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-300 block">Project Leadership Committee</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Project Chair"
                  value={editingProject.projectChair || ""}
                  placeholder="e.g. Kasun Perera"
                  onChange={(e) => setEditingProject({ ...editingProject, projectChair: e.target.value })}
                />
                <Input
                  label="Project Secretary"
                  value={editingProject.projectSecretary || ""}
                  placeholder="e.g. Amaya Silva"
                  onChange={(e) => setEditingProject({ ...editingProject, projectSecretary: e.target.value })}
                />
                <Input
                  label="Project Treasurer"
                  value={editingProject.projectTreasurer || ""}
                  placeholder="e.g. Dineth Fernando"
                  onChange={(e) => setEditingProject({ ...editingProject, projectTreasurer: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Input
                label="Google Drive Folder Link (Photos & Videos Album)"
                type="url"
                value={editingProject.driveLink || ""}
                placeholder="https://drive.google.com/drive/folders/..."
                onChange={(e) => setEditingProject({ ...editingProject, driveLink: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-300 block">
                Project Documents (PDF)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Proposal PDF */}
                <div className="p-3 rounded-lg bg-[#0c1017] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Proposal PDF</span>
                  {editingProject.proposalPdf ? (
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={editingProject.proposalPdf}
                        target="_blank"
                        download={editingProject.proposalPdfName || "Proposal.pdf"}
                        rel="noopener noreferrer"
                        className="text-xs text-[#e6007e] hover:underline font-semibold truncate"
                      >
                        📥 {editingProject.proposalPdfName || "Download Proposal"}
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, proposalPdf: "", proposalPdfName: "" })}
                        className="text-rose-400 text-[10px] hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("docType", "proposal");
                        const res = await fetch("/api/upload/project-doc", { method: "POST", body: fd });
                        const json = await res.json();
                        if (json.success && json.url) {
                          setEditingProject({ ...editingProject, proposalPdf: json.url, proposalPdfName: json.fileName || file.name });
                        }
                      }}
                      className="text-xs text-slate-400 block"
                    />
                  )}
                </div>

                {/* Report PDF */}
                <div className="p-3 rounded-lg bg-[#0c1017] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Report PDF</span>
                  {editingProject.reportPdf ? (
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={editingProject.reportPdf}
                        target="_blank"
                        download={editingProject.reportPdfName || "Report.pdf"}
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline font-semibold truncate"
                      >
                        📥 {editingProject.reportPdfName || "Download Report"}
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, reportPdf: "", reportPdfName: "" })}
                        className="text-rose-400 text-[10px] hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("docType", "report");
                        const res = await fetch("/api/upload/project-doc", { method: "POST", body: fd });
                        const json = await res.json();
                        if (json.success && json.url) {
                          setEditingProject({ ...editingProject, reportPdf: json.url, reportPdfName: json.fileName || file.name });
                        }
                      }}
                      className="text-xs text-slate-400 block"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Project Description *</label>
              <textarea
                rows={3}
                value={editingProject.description || ""}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#e6007e]"
                required
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

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-300 block">Project Leadership Committee</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Project Chair"
                  value={newProjectForm.projectChair || ""}
                  placeholder="e.g. Kasun Perera"
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, projectChair: e.target.value })}
                />
                <Input
                  label="Project Secretary"
                  value={newProjectForm.projectSecretary || ""}
                  placeholder="e.g. Amaya Silva"
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, projectSecretary: e.target.value })}
                />
                <Input
                  label="Project Treasurer"
                  value={newProjectForm.projectTreasurer || ""}
                  placeholder="e.g. Dineth Fernando"
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, projectTreasurer: e.target.value })}
                />
              </div>
            </div>

            <Input
              label="Google Drive Folder Link (Photos & Videos Album)"
              type="url"
              value={newProjectForm.driveLink || ""}
              placeholder="https://drive.google.com/drive/folders/..."
              onChange={(e) => setNewProjectForm({ ...newProjectForm, driveLink: e.target.value })}
            />

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-300 block">
                Project Documents (PDF)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Proposal PDF */}
                <div className="p-3 rounded-lg bg-[#0c1017] border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Proposal PDF</span>
                  {newProjectForm.proposalPdf ? (
                    <div className="flex items-center justify-between text-[#e6007e]">
                      <span className="truncate text-xs">✓ {newProjectForm.proposalPdfName || "Proposal Attached"}</span>
                      <button
                        type="button"
                        onClick={() => setNewProjectForm({ ...newProjectForm, proposalPdf: "", proposalPdfName: "" })}
                        className="text-rose-400 text-[10px] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("docType", "proposal");
                        const res = await fetch("/api/upload/project-doc", { method: "POST", body: fd });
                        const json = await res.json();
                        if (json.success && json.url) {
                          setNewProjectForm({ ...newProjectForm, proposalPdf: json.url, proposalPdfName: json.fileName || file.name });
                        }
                      }}
                      className="text-xs text-slate-400 block"
                    />
                  )}
                </div>

                {/* Report PDF */}
                <div className="p-3 rounded-lg bg-[#0c1017] border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Report PDF</span>
                  {newProjectForm.reportPdf ? (
                    <div className="flex items-center justify-between text-cyan-400">
                      <span className="truncate text-xs">✓ {newProjectForm.reportPdfName || "Report Attached"}</span>
                      <button
                        type="button"
                        onClick={() => setNewProjectForm({ ...newProjectForm, reportPdf: "", reportPdfName: "" })}
                        className="text-rose-400 text-[10px] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("docType", "report");
                        const res = await fetch("/api/upload/project-doc", { method: "POST", body: fd });
                        const json = await res.json();
                        if (json.success && json.url) {
                          setNewProjectForm({ ...newProjectForm, reportPdf: json.url, reportPdfName: json.fileName || file.name });
                        }
                      }}
                      className="text-xs text-slate-400 block"
                    />
                  )}
                </div>
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Approval Status</label>
                <select
                  value={editingEvent.approvalStatus || "approved"}
                  onChange={(e) => setEditingEvent({ ...editingEvent, approvalStatus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="approved">Approved (Live on website)</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">Event Status</label>
                <select
                  value={editingEvent.status || "upcoming"}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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

      {/* TAB: MEDIA CMS */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Sub Navigation: Switch between Cloudinary Photo Gallery and Articles */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0c1017] border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaViewMode("gallery")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mediaViewMode === "gallery"
                    ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Cloudinary Photo Assets ({cloudinaryPhotos.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaViewMode("articles")}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  mediaViewMode === "articles"
                    ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Articles & Publications ({mediaItems.length})
              </button>
            </div>

            {mediaViewMode === "gallery" ? (
              <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e6007e] to-[#ff4081] text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#e6007e]/20">
                <Upload size={14} />
                <span>{isUploadingCloudinaryPhoto ? "Uploading..." : "Upload Photo to Cloudinary"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectCloudinaryUpload}
                  disabled={isUploadingCloudinaryPhoto}
                  className="hidden"
                />
              </label>
            ) : (
              <Button
                onClick={() => setIsAddingMedia(true)}
                className="py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <PlusCircle size={16} />
                <span>Create New Publication</span>
              </Button>
            )}
          </div>

          {/* VIEW 1: CLOUDINARY PHOTO ASSETS GALLERY */}
          {mediaViewMode === "gallery" && (
            <div className="space-y-4">
              {cloudinaryPhotos.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#0c1017] border border-slate-800 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#e6007e] mx-auto">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">No Cloudinary Photos Uploaded Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click &ldquo;Upload Photo to Cloudinary&rdquo; above to host high-speed images on Cloudinary CDN and MongoDB Atlas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cloudinaryPhotos.map((photo) => (
                    <div
                      key={photo._id || photo.imageUrl}
                      className="group relative rounded-2xl bg-[#0c1017] border border-slate-800 overflow-hidden shadow-xl hover:border-[#e6007e]/50 transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || "Uploaded Photo"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                          CDN Active
                        </span>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <h4 className="text-xs font-bold text-white truncate" title={photo.title}>
                          {photo.title || "Untitled Asset"}
                        </h4>
                        <span className="text-[10px] text-cyan-400 block font-medium">
                          {photo.avenue || "General"}
                        </span>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(photo.imageUrl);
                              showToast("CDN URL copied to clipboard!", "success");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                            title={photo.imageUrl}
                          >
                            Copy URL
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCloudinaryPhoto(photo._id)}
                            className="p-1 rounded-lg bg-slate-900 hover:bg-rose-950 border border-slate-800 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                            title="Delete Photo from Cloudinary"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: ARTICLES & PUBLICATIONS */}
          {mediaViewMode === "articles" && (
            <div className="space-y-4">
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
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] pt-32 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-[#e6007e] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest font-bold">Loading Admin Command Center...</p>
        </div>
      }
    >
      <AdminDashboardInner />
    </Suspense>
  );
}