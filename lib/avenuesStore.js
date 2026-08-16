"use client";

import { sanitizeInput } from "@/lib/security";

const AVENUES_STORAGE_KEY = "rotaract_sltc_avenues_v1";

const defaultAvenues = [
  {
    id: "ave-1",
    title: "Community Service",
    subtitle: "CARING FOR COMMUNITIES EVERYWHERE",
    description: "Fostering environmental conservation, health drives, educational support, and disaster relief across local communities.",
  },
  {
    id: "ave-2",
    title: "Professional Development",
    subtitle: "SKILLS FOR SUCCESS, GROWTH FOR LIFE",
    description: "Empowering undergraduates with leadership skills, corporate etiquette, CV writing, and tech workshops.",
  },
  {
    id: "ave-3",
    title: "Club Service",
    subtitle: "UNITY THROUGH SERVICE & FELLOWSHIP",
    description: "Strengthening bonds among members through fellowship trips, social gatherings, and university-wide team events.",
  },
  {
    id: "ave-4",
    title: "International Service",
    subtitle: "CONNECTING CONTINENTS & CULTURES",
    description: "Collaborating with twin clubs globally, promoting cultural exchange, and supporting international initiatives.",
  },
  {
    id: "ave-5",
    title: "Digital & IT",
    subtitle: "INNOVATING TOMORROW, CONNECTING TODAY",
    description: "Developing tech solutions, web systems, cybersecurity awareness campaigns, and digital infrastructure.",
  },
  {
    id: "ave-6",
    title: "Sports & Recreation",
    subtitle: "FITNESS FOR ALL, UNITY IN PLAY",
    description: "Organizing sports encounters, e-sports tournaments, and promoting health & fitness across faculties.",
  },
  {
    id: "ave-7",
    title: "Public Relations",
    subtitle: "AMPLIFYING IMPACT & STORYTELLING",
    description: "Managing media presence, social media storytelling, press releases, and building the Rotaract brand.",
  },
  {
    id: "ave-8",
    title: "Fundraising & Partnerships",
    subtitle: "BUILDING BRIDGES, CREATING CHANGE",
    description: "Driving corporate sponsorships, grant applications, and raising resources for community projects.",
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
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load avenues from localStorage", e);
    return defaultAvenues;
  }
}

export function saveStoredAvenues(avenues) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = avenues.map((a) => ({
      id: a.id,
      title: sanitizeInput(a.title),
      subtitle: sanitizeInput(a.subtitle),
      description: sanitizeInput(a.description),
    }));
    localStorage.setItem(AVENUES_STORAGE_KEY, JSON.stringify(sanitized));
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
