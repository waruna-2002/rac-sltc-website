"use client";

import initialProjects from "@/data/projects.json";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const STORAGE_KEY = "rotaract_sltc_projects_v1";

// Ensure initial projects have approved status & sanitized values
const defaultProjects = initialProjects.map((p) => ({
  ...p,
  status: p.status || "approved",
  submittedBy: p.submittedBy || "admin@sltc.ac.lk",
  createdAt: p.createdAt || new Date().toISOString(),
  image: sanitizeUrl(p.image),
  images: (p.images && p.images.length > 0) ? p.images.map(sanitizeUrl) : [sanitizeUrl(p.image)],
  videoUrl: sanitizeUrl(p.videoUrl || ""),
}));

export function getStoredProjects() {
  if (typeof window === "undefined") return defaultProjects;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
      return defaultProjects;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load projects from localStorage", e);
    return defaultProjects;
  }
}

export function saveStoredProjects(projects) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to localStorage", e);
  }
}

export function addProjectSubmission(newProject) {
  const current = getStoredProjects();
  
  const sanitizedTitle = sanitizeInput(newProject.title || "");
  const slug = sanitizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `project-${Date.now()}`;

  const primaryImage = sanitizeUrl(newProject.image || (newProject.images && newProject.images[0]));
  const galleryImages = (newProject.images && newProject.images.length > 0)
    ? newProject.images.map(sanitizeUrl)
    : [primaryImage];

  const submission = {
    id: String(Date.now()),
    title: sanitizedTitle,
    slug,
    avenue: sanitizeInput(newProject.avenue || "Community Service"),
    date: sanitizeInput(newProject.date || new Date().toISOString().split("T")[0]),
    impact: sanitizeInput(newProject.impact || "Community Impact"),
    description: sanitizeInput(newProject.description || ""),
    fullDescription: sanitizeInput(newProject.fullDescription || newProject.description || ""),
    submittedBy: sanitizeInput(newProject.submittedBy || "Anonymous"),
    image: primaryImage,
    images: galleryImages, // Multi-photo array support
    videoUrl: sanitizeUrl(newProject.videoUrl || ""),
    status: newProject.status || "pending", // Starts as pending unless admin creates it
    createdAt: new Date().toISOString(),
    highlights: (newProject.highlights || ["Community Engagement Initiative"]).map(sanitizeInput),
    organizers: sanitizeInput(newProject.organizers || "Rotaract SLTC Member"),
  };

  const updated = [submission, ...current];
  saveStoredProjects(updated);
  return submission;
}

export function updateProject(id, updatedFields) {
  const current = getStoredProjects();

  const sanitizedFields = {};
  for (const [key, value] of Object.entries(updatedFields)) {
    if (key === "image" || key === "videoUrl") {
      sanitizedFields[key] = sanitizeUrl(value);
    } else if (key === "images" && Array.isArray(value)) {
      sanitizedFields[key] = value.map(sanitizeUrl);
    } else if (typeof value === "string") {
      sanitizedFields[key] = sanitizeInput(value);
    } else {
      sanitizedFields[key] = value;
    }
  }

  const updated = current.map((p) => (p.id === id ? { ...p, ...sanitizedFields } : p));
  saveStoredProjects(updated);
  return updated;
}

export function updateProjectStatus(id, status) {
  const validStatuses = ["approved", "pending", "rejected"];
  const safeStatus = validStatuses.includes(status) ? status : "pending";
  return updateProject(id, { status: safeStatus });
}

export function deleteProject(id) {
  const current = getStoredProjects();
  const updated = current.filter((p) => p.id !== id);
  saveStoredProjects(updated);
  return updated;
}
