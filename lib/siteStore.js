"use client";

import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const SITE_STORAGE_KEY = "rotaract_sltc_site_v1";

const defaultSiteContent = {
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

export function saveStoredSiteContent(newContent) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredSiteContent();
    const updated = { ...current, ...newContent };

    // Sanitize string values
    const sanitized = {};
    for (const [key, value] of Object.entries(updated)) {
      if (key.toLowerCase().includes("url") || key.toLowerCase().includes("link")) {
        sanitized[key] = sanitizeUrl(value);
      } else if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }

    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (e) {
    console.error("Failed to save site content to localStorage", e);
    return defaultSiteContent;
  }
}
