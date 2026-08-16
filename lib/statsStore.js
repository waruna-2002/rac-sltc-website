"use client";

import { sanitizeInput } from "@/lib/security";

const STATS_STORAGE_KEY = "rotaract_sltc_stats_v1";

const defaultStats = [
  { label: "Active Members", value: "150+" },
  { label: "Projects Completed", value: "35+" },
  { label: "Lives Impacted", value: "5000+" },
  { label: "Years of Excellence", value: "5+" },
];

export function getStoredStats() {
  if (typeof window === "undefined") return defaultStats;
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(defaultStats));
      return defaultStats;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load stats from localStorage", e);
    return defaultStats;
  }
}

export function saveStoredStats(stats) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = stats.map((s) => ({
      label: sanitizeInput(s.label),
      value: sanitizeInput(s.value),
    }));
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Failed to save stats to localStorage", e);
  }
}
