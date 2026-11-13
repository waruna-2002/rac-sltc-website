import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { memoryStore } from "@/lib/memoryStore";
import { getSession } from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

const initialEvents = [
  {
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
    tags: ["Leadership", "Keynote", "Networking", "District 3220"],
  },
  {
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
    tags: ["Sustainability", "EcoAction", "OceanCare", "Volunteer"],
  },
  {
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
    tags: ["Hackathon", "AI", "OpenSource", "TechInnovation"],
  },
];

// GET /api/events - Retrieve upcoming club events (Public & Admin)
export async function GET(request) {
  try {
    await dbConnect();

    // Auto-seed if database collection is empty
    const count = await Event.countDocuments();
    if (count === 0) {
      await Event.insertMany(
        initialEvents.map((ev) => ({
          ...ev,
          approvalStatus: "approved",
          submittedBy: "Rotaract Executive Board",
        }))
      );
    }

    const { searchParams } = new URL(request.url);
    const avenue = searchParams.get("avenue");
    const status = searchParams.get("status");
    const approvalStatus = searchParams.get("approvalStatus");

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (avenue && avenue !== "All") {
      query.avenue = avenue;
    }

    // Default for public site: ONLY show approved events!
    // approvalStatus="all" -> returns all (used by Admin Events tab)
    // approvalStatus="pending" -> returns pending (used by Admin Approvals tab)
    if (approvalStatus === "all") {
      // no filter on approvalStatus
    } else if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    } else {
      query.approvalStatus = "approved";
    }

    const events = await Event.find(query).sort({ date: 1 });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.warn("GET /api/events DB fallback mode:", error.message);
    const { searchParams } = new URL(request.url);
    const avenue = searchParams.get("avenue");
    const status = searchParams.get("status");
    const approvalStatus = searchParams.get("approvalStatus");

    let list = memoryStore.events || [];

    if (status && status !== "all") {
      list = list.filter((e) => e.status === status);
    }
    if (avenue && avenue !== "All") {
      list = list.filter((e) => e.avenue === avenue);
    }

    if (approvalStatus === "all") {
      // return all
    } else if (approvalStatus) {
      list = list.filter((e) => e.approvalStatus === approvalStatus);
    } else {
      list = list.filter((e) => (e.approvalStatus || "approved") === "approved");
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
      fallback: true,
    });
  }
}

// POST /api/events - Create / Propose an Event (Viewer submissions -> Pending, Admin -> Approved)
export async function POST(request) {
  const ip = getClientIp(request);
  const session = await getSession(request);
  const isAdmin = session?.authenticated && (session.role === "super_admin" || session.role === "project_editor");

  // Rate-limit public guest submissions
  if (!isAdmin) {
    const rateCheck = checkServerRateLimit(`event-submit:${ip}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many event submissions. Please wait a moment."
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const { title, description, date, avenue, time, location, registrationLink, submittedBy, submitterEmail } = body;

  if (!title || !description || !date) {
    return NextResponse.json(
      { success: false, error: "Title, description, and date are required." },
      { status: 400 }
    );
  }

  // Admin submissions are auto-approved; Viewer submissions require Admin Approval!
  const approvalStatus = isAdmin ? (body.approvalStatus || "approved") : "pending";

  const eventData = {
    title: sanitizeInput(title.trim()),
    subtitle: sanitizeInput(body.subtitle || ""),
    description: sanitizeInput(description.trim()),
    avenue: sanitizeInput(avenue || "Community Service Avenue"),
    date: sanitizeInput(date),
    time: sanitizeInput(time || "TBD"),
    location: sanitizeInput(location || "SLTC Research University, Padukka"),
    image: sanitizeUrl(body.image || "/images/hero.jpg"),
    registrationLink: sanitizeUrl(registrationLink || "/join-us"),
    registrationOpen: body.registrationOpen ?? true,
    featured: body.featured ?? true,
    status: body.status || "upcoming",
    approvalStatus,
    submittedBy: sanitizeInput(submittedBy || (isAdmin ? "Rotaract Executive Board" : "Guest / Club Member")),
    submitterEmail: sanitizeInput(submitterEmail || ""),
    tags: Array.isArray(body.tags) ? body.tags.map(t => sanitizeInput(String(t))) : ["Rotaract SLTC"],
  };

  try {
    await dbConnect();
    const newEvent = await Event.create(eventData);

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? "Upcoming event published successfully!"
          : "Upcoming event proposal submitted successfully! It will appear on the site once approved by the Admin.",
        data: newEvent,
        isPending: !isAdmin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.warn("POST /api/events DB fallback mode:", error.message);
    const nowId = "event_" + Date.now();
    const fallbackCreated = {
      _id: nowId,
      id: nowId,
      ...eventData,
      createdAt: new Date().toISOString(),
    };

    memoryStore.events.unshift(fallbackCreated);

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? "Upcoming event published successfully!"
          : "Upcoming event proposal submitted successfully! It will appear on the site once approved by the Admin.",
        data: fallbackCreated,
        isPending: !isAdmin,
        fallback: true,
      },
      { status: 201 }
    );
  }
}
