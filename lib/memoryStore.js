import initialProjects from "@/data/projects.json";

/**
 * Resilient In-Memory Fallback Cache for Rotaract SLTC
 * Ensures the website and Admin Portal remain 100% functional
 * when MongoDB is unreachable in local development or undergoing maintenance.
 */

// Global memory cache preserving state across hot-reloads
if (!global.__rac_memory_store) {
  global.__rac_memory_store = {
    projects: [],
    events: [],
    members: [],
    contact: [],
    media: [],
    settings: {
      heroTitle: "Inspiring Leadership & Community Service",
      heroSubtitle: "Rotaract Club of SLTC Research University",
      whoWeAreTitle: "Who We Are",
      whoWeAreDescription: "Youth-led movement dedicated to community leadership.",
      missionText: "To empower youth to create positive change.",
      visionText: "A world where young leaders build connected communities.",
      address: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka",
      email: "rotaract@sltc.ac.lk",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      linkedinUrl: "https://linkedin.com",
    },
  };
}

// Ensure projects reflect latest initial data with standardized avenues
global.__rac_memory_store.projects = (initialProjects || []).map((p, idx) => ({
  _id: p.id || `proj_${idx + 1}`,
  id: p.id || `proj_${idx + 1}`,
  slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title: p.title,
  avenue: p.avenue || "Community Service Avenue",
  date: p.date || "2026-03-15",
  impact: p.impact || "Community Impact",
  description: p.description,
  fullDescription: p.fullDescription || p.description,
  submittedBy: "SLTC Rotaract Executive Board",
  image: p.image || "",
  images: p.images || (p.image ? [p.image] : []),
  status: p.status || "approved",
  organizers: p.organizers || "Rotaract SLTC Member",
  highlights: p.highlights || ["Community Initiative"],
  createdAt: new Date().toISOString(),
}));

export const initialEventsList = [];

global.__rac_memory_store.events = [];

export const memoryStore = global.__rac_memory_store;
