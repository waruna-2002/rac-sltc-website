"use client";

import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const SITE_STORAGE_KEY = "rotaract_sltc_site_v1";

export const defaultSiteContent = {
  // Hero Section
  heroTitle: "ROTARACT CLUB OF SLTC",
  heroSubtitle: "Ignite Potential • Inspire Impact • Serve with Passion",
  districtBadge: "Rotaract District 3220 • Sri Lanka & Maldives",
  heroButtonText: "JOIN US NOW",
  
  // Who We Are (Homepage)
  whoWeAreTitle: "Empowering Leaders, Transforming Communities.",
  whoWeAreDescription: "The Rotaract Club of SLTC brings together passionate undergraduates dedicated to leadership, tech innovation, and humanitarian service. Based at SLTC Research University, we empower students to lead meaningful community initiatives and cultivate high-impact skills.",
  missionText: "To foster responsible youth leadership through impactful service above self.",
  visionText: "Building an inspired university community dedicated to social impact.",
  
  // About Us Page
  aboutHistory: "Chartered under Rotary International District 3220, the Rotaract Club of SLTC Research University has grown into one of the most vibrant youth organizations in Sri Lanka. Our members drive sustainable development, professional skill enhancement, and youth empowerment.",
  charterYear: "2020",
  parentRotaryClub: "Rotary Club of Colombo West",
  
  // Contact & Official Info
  address: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka",
  email: "rotaract@sltc.ac.lk",
  phone: "+94 77 123 4567",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  youtubeUrl: "https://youtube.com",
  
  // Media / Newsletter
  newsletterTitle: "Rotaract SLTC Official Quarterly Gazette",
  newsletterLink: "https://rotaract.sltc.ac.lk/gazette.pdf",
};

/**
 * Synchronous read from local storage with fallback (safe for immediate rendering)
 */
export function getStoredSiteContent() {
  if (typeof window === "undefined") return defaultSiteContent;
  try {
    const data = localStorage.getItem(SITE_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(defaultSiteContent));
      return defaultSiteContent;
    }
    return { ...defaultSiteContent, ...JSON.parse(data) };
  } catch (e) {
    console.error("Failed to load site content from localStorage", e);
    return defaultSiteContent;
  }
}

/**
 * Asynchronously fetch global site content from MongoDB and synchronize local cache
 */
export async function syncSiteContentFromDatabase() {
  if (typeof window === "undefined") return defaultSiteContent;
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const merged = { ...defaultSiteContent, ...json.data };
        localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("rotaract_site_content_updated", { detail: merged }));
        return merged;
      }
    }
  } catch (e) {
    console.warn("Could not sync site settings from database API:", e);
  }
  return getStoredSiteContent();
}

/**
 * Save site content locally AND persist to MongoDB via /api/settings
 */
export function saveStoredSiteContent(newContent) {
  if (typeof window === "undefined") return defaultSiteContent;
  try {
    const current = getStoredSiteContent();
    const updated = { ...current, ...newContent };

    // Sanitize values
    const sanitized = {};
    for (const [key, value] of Object.entries(updated)) {
      if (typeof value === "string") {
        if (key.toLowerCase().includes("url") || key.toLowerCase().includes("link")) {
          sanitized[key] = sanitizeUrl(value);
        } else {
          sanitized[key] = sanitizeInput(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    // 1. Immediately cache in localStorage for instant UI responsiveness
    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(sanitized));

    // 2. Dispatch custom event so all active components on the page update live
    window.dispatchEvent(new CustomEvent("rotaract_site_content_updated", { detail: sanitized }));

    // 3. Persist to MongoDB through /api/settings (sends HTTP-Only cookie automatically)
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(sanitized),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.warn("MongoDB settings sync status:", data.error || data);
        }
      })
      .catch((err) => {
        console.warn("Failed to persist site content to backend API:", err);
      });

    return sanitized;
  } catch (e) {
    console.error("Failed to save site content", e);
    return defaultSiteContent;
  }
}
