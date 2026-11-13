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

export const initialEventsList = [
  {
    _id: "event_1",
    id: "event_1",
    title: "SLTC Youth Leadership Conclave 2026",
    subtitle: "Empowering Next-Gen Visionaries",
    description: "An intensive full-day leadership summit featuring industry veterans, interactive breakout circles, and ethical leadership development modules tailored for university undergraduates.",
    avenue: "Professional Development Avenue",
    date: "2026-11-14",
    time: "09:00 AM - 04:30 PM",
    location: "SLTC Main Auditorium, Padukka",
    image: "/images/hero.jpg",
    registrationLink: "/join-us",
    registrationOpen: true,
    featured: true,
    status: "upcoming",
    approvalStatus: "approved",
    submittedBy: "Rotaract Executive Board",
    tags: ["Leadership", "Keynote", "Networking", "District 3220"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "event_2",
    id: "event_2",
    title: "EcoPulse: Mangrove & Coastal Restoration",
    subtitle: "Conserving Sri Lanka's Coastline",
    description: "Hands-on environmental conservation drive partnering with local environmentalists to restore coastal mangrove ecosystems, collect marine plastic, and conduct community awareness workshops.",
    avenue: "Environmental Service Avenue",
    date: "2026-11-28",
    time: "06:30 AM - 01:00 PM",
    location: "Kalutara Estuary & Coastal Reserve",
    image: "/images/projects/project1.jpg",
    registrationLink: "/contact",
    registrationOpen: true,
    featured: true,
    status: "upcoming",
    approvalStatus: "approved",
    submittedBy: "Rotaract Executive Board",
    tags: ["Sustainability", "EcoAction", "OceanCare", "Volunteer"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "event_3",
    id: "event_3",
    title: "CodeCraft 2.0: AI For Good Hackathon",
    subtitle: "Build Solutions for Social Impact",
    description: "A fast-paced 24-hour innovation challenge where student developers, UI/UX designers, and problem solvers collaborate to create open-source software addressing grassroots challenges.",
    avenue: "Professional Development Avenue",
    date: "2026-12-12",
    time: "08:30 AM Onwards",
    location: "SLTC Computing & Tech Park",
    image: "/images/projects/project2.jpg",
    registrationLink: "/projects/submit",
    registrationOpen: true,
    featured: true,
    status: "upcoming",
    approvalStatus: "approved",
    submittedBy: "Rotaract Executive Board",
    tags: ["Hackathon", "AI", "OpenSource", "TechInnovation"],
    createdAt: new Date().toISOString(),
  },
];

if (!global.__rac_memory_store.events || global.__rac_memory_store.events.length === 0) {
  global.__rac_memory_store.events = [...initialEventsList];
}

export const memoryStore = global.__rac_memory_store;
