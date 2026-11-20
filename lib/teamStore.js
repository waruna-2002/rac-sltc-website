"use client";

import initialTeam from "@/data/team.json";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";
import {
  TEAM_ROLE_OPTIONS,
  normalizeRole,
  getRoleTier,
  getRoleDetailedRank,
  compareTeamMembers,
  sortTeamByRoleTier,
  isExcoRole,
} from "./teamRoles";

// Re-export for components and backward compatibility
export {
  TEAM_ROLE_OPTIONS,
  normalizeRole,
  getRoleTier,
  getRoleDetailedRank,
  compareTeamMembers,
  sortTeamByRoleTier,
  isExcoRole,
};

const TEAM_STORAGE_KEY = "rotaract_sltc_team_v2";

function normalizeMember(m, idx = 0) {
  const validId = m?.id || (m?._id ? String(m._id) : `mem_${Date.now()}_${idx}`);
  return {
    ...m,
    id: validId,
    _id: m?._id ? String(m._id) : validId,
    order: typeof m?.order === "number" ? m.order : idx,
    image: sanitizeUrl(m?.image),
  };
}

const defaultTeam = sortTeamByRoleTier(
  (initialTeam || []).map((m, idx) => normalizeMember(m, idx))
);

export function getStoredTeam() {
  if (typeof window === "undefined") return defaultTeam;
  try {
    const data = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(defaultTeam));
      return defaultTeam;
    }
    const parsed = JSON.parse(data);
    const list = Array.isArray(parsed) ? parsed : defaultTeam;
    return sortTeamByRoleTier(list.map((m, idx) => normalizeMember(m, idx)));
  } catch (e) {
    console.error("Failed to load team from localStorage", e);
    return defaultTeam;
  }
}

export function saveStoredTeam(team) {
  if (typeof window === "undefined") return;
  try {
    const sorted = sortTeamByRoleTier(team).map((m, idx) => normalizeMember(m, idx));
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(sorted));
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
        const sorted = sortTeamByRoleTier(json.data).map((m, idx) => normalizeMember(m, idx));
        saveStoredTeam(sorted);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("rotaract_team_updated", { detail: sorted }));
        }
        return sorted;
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
    order: typeof memberData.order === "number" ? memberData.order : 0,
  };

  // Group members with the same role together and re-index orders
  const updated = sortTeamByRoleTier([...current, newMember]).map((m, idx) => normalizeMember(m, idx));
  saveStoredTeam(updated);

  const memberToSend = updated.find((m) => m.id === tempId) || newMember;

  // Persist to MongoDB Atlas via POST /api/team
  if (typeof window !== "undefined") {
    fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(memberToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const freshId = data.data._id ? String(data.data._id) : (data.data.id || tempId);
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
export function updateTeamMember(rawId, updatedFields) {
  const current = getStoredTeam();
  const id = rawId ? String(rawId).trim() : "";

  if (!id || id === "undefined") {
    console.warn("updateTeamMember called with empty or invalid id:", rawId);
    return current;
  }

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

  const updatedRaw = current.map((m) => {
    const isTarget =
      (m.id && String(m.id) === id) ||
      (m._id && String(m._id) === id);
    return isTarget
      ? { ...m, ...sanitizedFields, id: m.id || id, _id: m._id || id }
      : m;
  });

  // Group members with the same role together and re-index orders
  const updated = sortTeamByRoleTier(updatedRaw).map((m, idx) => normalizeMember(m, idx));
  saveStoredTeam(updated);

  const updatedTarget = updated.find((m) =>
    (m.id && String(m.id) === id) || (m._id && String(m._id) === id)
  );

  const targetMongoId = (updatedTarget && updatedTarget._id) ? String(updatedTarget._id) : id;

  // Persist to MongoDB Atlas via PATCH /api/team/[id]
  if (typeof window !== "undefined" && targetMongoId && targetMongoId !== "undefined" && !targetMongoId.startsWith("mem_")) {
    fetch(`/api/team/${targetMongoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...sanitizedFields,
        order: updatedTarget ? updatedTarget.order : undefined,
      }),
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
export function deleteTeamMember(rawId) {
  const current = getStoredTeam();
  const id = rawId ? String(rawId).trim() : "";

  if (!id || id === "undefined") {
    return current;
  }

  const target = current.find((m) => String(m.id) === id || String(m._id) === id);
  const targetMongoId = target?._id ? String(target._id) : id;

  const updated = sortTeamByRoleTier(
    current.filter((m) => String(m.id) !== id && String(m._id) !== id)
  ).map((m, idx) => normalizeMember(m, idx));
  saveStoredTeam(updated);

  // Persist deletion to MongoDB Atlas via DELETE /api/team/[id]
  if (typeof window !== "undefined" && targetMongoId && targetMongoId !== "undefined" && !targetMongoId.startsWith("mem_")) {
    fetch(`/api/team/${targetMongoId}`, {
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
