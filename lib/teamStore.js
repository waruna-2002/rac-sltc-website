"use client";

import initialTeam from "@/data/team.json";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const TEAM_STORAGE_KEY = "rotaract_sltc_team_v2";

const defaultTeam = (initialTeam || []).map((m) => ({
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

/**
 * Fetch all team members from MongoDB Atlas and synchronize local storage
 */
export async function syncTeamFromDatabase() {
  if (typeof window === "undefined") return defaultTeam;
  try {
    const res = await fetch("/api/team", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        saveStoredTeam(json.data);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("rotaract_team_updated", { detail: json.data }));
        }
        return json.data;
      }
    }
  } catch (e) {
    console.warn("Could not sync team members from cloud API:", e);
  }
  return getStoredTeam();
}

/**
 * Add team member to local state and persist to MongoDB Atlas cloud database
 */
export function addTeamMember(memberData) {
  const current = getStoredTeam();
  const rawLinkedin = memberData.linkedin ? String(memberData.linkedin).trim() : "";
  const isValidLinkedin =
    rawLinkedin &&
    rawLinkedin !== "https://linkedin.com" &&
    rawLinkedin !== "https://www.linkedin.com" &&
    rawLinkedin !== "#";

  const rawInstagram = memberData.instagram ? String(memberData.instagram).trim() : "";
  const isValidInstagram =
    rawInstagram &&
    rawInstagram !== "https://instagram.com" &&
    rawInstagram !== "https://www.instagram.com" &&
    rawInstagram !== "#";

  const avenuesArr = Array.isArray(memberData.avenues)
    ? memberData.avenues.filter(Boolean)
    : (memberData.avenue ? [memberData.avenue] : []);

  const tempId = `mem_${Date.now()}`;
  const newMember = {
    id: tempId,
    _id: tempId,
    name: sanitizeInput(memberData.name || ""),
    role: sanitizeInput(memberData.role || "Director"),
    category: sanitizeInput(memberData.category || "Board of Directors"),
    avenues: avenuesArr.map(sanitizeInput),
    avenue: sanitizeInput(memberData.avenue || avenuesArr.join(", ")),
    faculty: sanitizeInput(memberData.faculty || ""),
    image: memberData.image ? sanitizeUrl(memberData.image) : "",
    bio: sanitizeInput(memberData.bio || ""),
    email: sanitizeInput(memberData.email || ""),
    achievements: (memberData.achievements || []).map(sanitizeInput),
    linkedin: isValidLinkedin ? sanitizeUrl(rawLinkedin) : "",
    instagram: isValidInstagram ? sanitizeUrl(rawInstagram) : "",
  };

  const updated = [...current, newMember];
  saveStoredTeam(updated);

  // Persist to MongoDB Atlas via POST /api/team
  if (typeof window !== "undefined") {
    fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newMember),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const freshId = data.data._id || data.data.id;
          const reconciled = getStoredTeam().map((m) =>
            m.id === tempId ? { ...m, id: freshId, _id: freshId } : m
          );
          saveStoredTeam(reconciled);
          window.dispatchEvent(new CustomEvent("rotaract_team_updated", { detail: reconciled }));
        }
      })
      .catch((err) => console.warn("Failed to persist team member to MongoDB:", err));
  }

  return updated;
}

/**
 * Update team member in local state and persist to MongoDB Atlas cloud database
 */
export function updateTeamMember(id, updatedFields) {
  const current = getStoredTeam();
  const sanitizedFields = {};

  for (const [key, value] of Object.entries(updatedFields)) {
    if (key === "linkedin") {
      const raw = value ? String(value).trim() : "";
      const valid =
        raw &&
        raw !== "https://linkedin.com" &&
        raw !== "https://www.linkedin.com" &&
        raw !== "#";
      sanitizedFields[key] = valid ? sanitizeUrl(raw) : "";
    } else if (key === "instagram") {
      const raw = value ? String(value).trim() : "";
      const valid =
        raw &&
        raw !== "https://instagram.com" &&
        raw !== "https://www.instagram.com" &&
        raw !== "#";
      sanitizedFields[key] = valid ? sanitizeUrl(raw) : "";
    } else if (key === "image") {
      sanitizedFields[key] = value ? sanitizeUrl(value) : "";
    } else if (typeof value === "string") {
      sanitizedFields[key] = sanitizeInput(value);
    } else {
      sanitizedFields[key] = value;
    }
  }

  const updated = current.map((m) =>
    m.id === id || m._id === id ? { ...m, ...sanitizedFields } : m
  );
  saveStoredTeam(updated);

  // Persist to MongoDB Atlas via PATCH /api/team/[id]
  if (typeof window !== "undefined") {
    fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(sanitizedFields),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.warn("MongoDB team update note:", data.error || data);
        }
      })
      .catch((err) => console.warn("Failed to persist team member update to MongoDB:", err));
  }

  return updated;
}

/**
 * Delete team member from local state and remove from MongoDB Atlas cloud database
 */
export function deleteTeamMember(id) {
  const current = getStoredTeam();
  const updated = current.filter((m) => m.id !== id && m._id !== id);
  saveStoredTeam(updated);

  // Persist deletion to MongoDB Atlas via DELETE /api/team/[id]
  if (typeof window !== "undefined") {
    fetch(`/api/team/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.warn("MongoDB team deletion note:", data.error || data);
        }
      })
      .catch((err) => console.warn("Failed to delete team member from MongoDB:", err));
  }

  return updated;
}

/**
 * Check if a role is an Executive Committee (ExCo) role that has no mandatory avenue
 */
export function isExcoRole(role) {
  if (!role) return false;
  const r = String(role).trim().toLowerCase();
  return (
    r === "president" ||
    (r.includes("president") && !r.includes("assistant")) ||
    r.includes("vice president") ||
    r === "vp" ||
    r === "secretary" ||
    r === "treasurer" ||
    r.includes("sergeant at arms") ||
    r.includes("sargent at arms") ||
    r.includes("sergeant-at-arms") ||
    r === "editor"
  );
}

/**
 * Calculate leadership hierarchy level (1 to 5) for a team role
 * Tier 1: President
 * Tier 2: Vice President
 * Tier 3: Secretary, Treasurer, Sergeant at Arms, Editor, Avenue Secretary, Avenue Treasurer
 * Tier 4: Directors
 * Tier 5: Remaining roles (Assistant Director, Assistant Secretary, Assistant Treasurer, etc.)
 */
export function getRoleTier(role) {
  if (!role) return 5;
  const r = String(role).trim().toLowerCase();

  // Tier 1: President
  if (r === "president" || (r.includes("president") && !r.includes("vice") && !r.includes("assistant"))) {
    return 1;
  }

  // Tier 2: Vice President
  if (r.includes("vice president") || r === "vp" || r.includes("vice-president")) {
    return 2;
  }

  // Tier 3: Secretary, Treasurer, Sergeant at Arms, Editor, Avenue Secretary, Avenue Treasurer
  if (
    r === "secretary" ||
    (r.includes("secretary") && !r.includes("assistant")) ||
    r === "treasurer" ||
    (r.includes("treasurer") && !r.includes("assistant")) ||
    r.includes("sergeant at arms") ||
    r.includes("sargent at arms") ||
    r.includes("sergeant-at-arms") ||
    r.includes("editor") ||
    r.includes("avenue secretary") ||
    r.includes("avenue treasurer")
  ) {
    return 3;
  }

  // Tier 4: Directors
  if (r.includes("director") && !r.includes("assistant") && !r.includes("associate")) {
    return 4;
  }

  // Tier 5: Remaining members
  return 5;
}

/**
 * Sort an array of team members by their role tier (1 -> 5)
 */
export function sortTeamByRoleTier(members = []) {
  return [...members].sort((a, b) => {
    const tierA = getRoleTier(a.role);
    const tierB = getRoleTier(b.role);
    if (tierA !== tierB) return tierA - tierB;
    return (a.order || 0) - (b.order || 0);
  });
}
