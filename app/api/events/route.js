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

const initialEvents = [];

// GET /api/events - Retrieve upcoming club events (Public & Admin)
export async function GET(request) {
  try {
    await dbConnect();

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

    // Public filter: approved events only
    if (approvalStatus === "all") {
      // no filter on approvalStatus
    } else if (approvalStatus === "pending") {
      query.approvalStatus = "pending";
    } else if (approvalStatus === "rejected") {
      query.approvalStatus = "rejected";
    } else {
      query.$or = [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ];
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
    image: sanitizeUrl(body.image || ""),
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
