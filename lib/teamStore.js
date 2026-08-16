"use client";

import initialTeam from "@/data/team.json";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const TEAM_STORAGE_KEY = "rotaract_sltc_team_v1";

const defaultTeam = initialTeam.map((m) => ({
  ...m,
  image: sanitizeUrl(m.image),
}));

export function getStoredTeam() {
  if (typeof window === "undefined") return defaultTeam;
  try {
    const data = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(defaultTeam));
      return defaultTeam;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load team from localStorage", e);
    return defaultTeam;
  }
}

export function saveStoredTeam(team) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  } catch (e) {
    console.error("Failed to save team to localStorage", e);
  }
}

export function addTeamMember(memberData) {
  const current = getStoredTeam();
  const newMember = {
    id: String(Date.now()),
    name: sanitizeInput(memberData.name || ""),
    role: sanitizeInput(memberData.role || "Director"),
    category: sanitizeInput(memberData.category || "Board of Directors"),
    faculty: sanitizeInput(memberData.faculty || "Faculty of Computing & IT"),
    image: sanitizeUrl(memberData.image || "/images/team/placeholder.jpg"),
    bio: sanitizeInput(memberData.bio || ""),
    email: sanitizeInput(memberData.email || ""),
    achievements: (memberData.achievements || []).map(sanitizeInput),
    linkedin: sanitizeUrl(memberData.linkedin || "https://linkedin.com"),
    instagram: sanitizeUrl(memberData.instagram || "https://instagram.com"),
  };

  const updated = [...current, newMember];
  saveStoredTeam(updated);
  return updated;
}

export function updateTeamMember(id, updatedFields) {
  const current = getStoredTeam();
  const sanitizedFields = {};

  for (const [key, value] of Object.entries(updatedFields)) {
    if (key === "image" || key === "linkedin" || key === "instagram") {
      sanitizedFields[key] = sanitizeUrl(value);
    } else if (typeof value === "string") {
      sanitizedFields[key] = sanitizeInput(value);
    } else {
      sanitizedFields[key] = value;
    }
  }

  const updated = current.map((m) => (m.id === id ? { ...m, ...sanitizedFields } : m));
  saveStoredTeam(updated);
  return updated;
}

export function deleteTeamMember(id) {
  const current = getStoredTeam();
  const updated = current.filter((m) => m.id !== id);
  saveStoredTeam(updated);
  return updated;
}
