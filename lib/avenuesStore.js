"use client";

import { sanitizeInput } from "@/lib/security";

const AVENUES_STORAGE_KEY = "rotaract_sltc_avenues_v2";

const defaultAvenues = [
  {
    id: "ave-1",
    title: "Community Service Avenue",
    subtitle: "CARING FOR COMMUNITIES EVERYWHERE",
    tagline: "CARING FOR COMMUNITIES EVERYWHERE",
    description: "Fostering health drives, educational support, underprivileged school aids, and disaster relief across local communities.",
    icon: "HeartHandshake",
  },
  {
    id: "ave-2",
    title: "Club Service Avenue",
    subtitle: "UNITY THROUGH FELLOWSHIP & SERVICE",
    tagline: "UNITY THROUGH FELLOWSHIP & SERVICE",
    description: "Strengthening bonds among members through fellowship trips, social gatherings, club assemblies, and university-wide team events.",
    icon: "Users",
  },
  {
    id: "ave-3",
    title: "Professional Development Avenue",
    subtitle: "SKILLS FOR SUCCESS, GROWTH FOR LIFE",
    tagline: "SKILLS FOR SUCCESS, GROWTH FOR LIFE",
    description: "Empowering undergraduates with leadership skills, corporate etiquette, CV writing, networking, and industry workshops.",
    icon: "Briefcase",
  },
  {
    id: "ave-4",
    title: "Membership Development Avenue",
    subtitle: "EMPOWERING & EXPANDING OUR FAMILY",
    tagline: "EMPOWERING & EXPANDING OUR FAMILY",
    description: "Recruiting passionate undergraduates, onboarding new rotaractors, conducting mentorship, and fostering member engagement.",
    icon: "UserPlus",
  },
  {
    id: "ave-5",
    title: "International Service Avenue",
    subtitle: "CONNECTING CONTINENTS & CULTURES",
    tagline: "CONNECTING CONTINENTS & CULTURES",
    description: "Collaborating with twin clubs globally, promoting cultural exchange, peace initiatives, and supporting international projects.",
    icon: "Globe2",
  },
  {
    id: "ave-6",
    title: "Public Relations and Public Image",
    subtitle: "AMPLIFYING IMPACT & DIGITAL STORYTELLING",
    tagline: "AMPLIFYING IMPACT & DIGITAL STORYTELLING",
    description: "Managing media presence, social media storytelling, press releases, photography, and building the Rotaract brand.",
    icon: "Megaphone",
  },
  {
    id: "ave-7",
    title: "Sports and Recreational Activities",
    subtitle: "FITNESS FOR ALL, UNITY IN PLAY",
    tagline: "FITNESS FOR ALL, UNITY IN PLAY",
    description: "Organizing athletic encounters, cricket fiestas, e-sports tournaments, and promoting health & wellness across faculties.",
    icon: "Trophy",
  },
  {
    id: "ave-8",
    title: "Environmental Service Avenue",
    subtitle: "SUSTAINABILITY & PLANET CONSERVATION",
    tagline: "SUSTAINABILITY & PLANET CONSERVATION",
    description: "Leading tree planting drives, beach cleanups, climate awareness campaigns, and eco-friendly campus sustainability projects.",
    icon: "Leaf",
  },
];

export function getStoredAvenues() {
  if (typeof window === "undefined") return defaultAvenues;
  try {
    const data = localStorage.getItem(AVENUES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(AVENUES_STORAGE_KEY, JSON.stringify(defaultAvenues));
      return defaultAvenues;
    }
    const parsed = JSON.parse(data);
    // If older storage format or missing count, refresh to official 8 avenues
    if (!Array.isArray(parsed) || parsed.length !== 8) {
      localStorage.setItem(AVENUES_STORAGE_KEY, JSON.stringify(defaultAvenues));
      return defaultAvenues;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to load avenues from localStorage", e);
    return defaultAvenues;
  }
}

export function saveStoredAvenues(avenues) {
  if (typeof window === "undefined") return defaultAvenues;
  try {
    const sanitized = avenues.map((a) => ({
      id: a.id,
      title: sanitizeInput(a.title),
      subtitle: sanitizeInput(a.subtitle || a.tagline || ""),
      tagline: sanitizeInput(a.tagline || a.subtitle || ""),
      description: sanitizeInput(a.description),
      icon: a.icon || "Users",
    }));

    localStorage.setItem(AVENUES_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(
      new CustomEvent("rotaract_site_content_updated", { detail: { avenues: sanitized } })
    );

    // Persist to MongoDB Atlas via /api/settings
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ avenues: sanitized }),
    }).catch((err) => console.warn("Failed to persist avenues to MongoDB:", err));

    return sanitized;
  } catch (e) {
    console.error("Failed to save avenues to localStorage", e);
    return defaultAvenues;
  }
}

export function updateAvenue(id, updatedFields) {
  const current = getStoredAvenues();
  const updated = current.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
  saveStoredAvenues(updated);
  return updated;
}
