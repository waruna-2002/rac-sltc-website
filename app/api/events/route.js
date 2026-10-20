import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

const initialEvents = [
  {
    title: "SLTC Youth Leadership Conclave 2026",
    subtitle: "Empowering Next-Gen Visionaries",
    description: "An intensive full-day leadership summit featuring industry veterans, interactive breakout circles, and ethical leadership development modules tailored for university undergraduates.",
    avenue: "Professional Development",
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
    avenue: "Community Service",
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
    avenue: "Digital & IT",
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

// GET /api/events - Retrieve upcoming club events
export async function GET(request) {
  try {
    await dbConnect();

    // Auto-seed if database collection is empty
    const count = await Event.countDocuments();
    if (count === 0) {
      await Event.insertMany(initialEvents);
    }

    const { searchParams } = new URL(request.url);
    const avenue = searchParams.get("avenue");
    const status = searchParams.get("status") || "upcoming";

    const query = {};
    if (avenue && avenue !== "All") {
      query.avenue = avenue;
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const events = await Event.find(query).sort({ date: 1 });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    // If DB is offline, return fallback initial events to maintain frontend stability
    return NextResponse.json({
      success: true,
      count: initialEvents.length,
      data: initialEvents,
      fallback: true,
    });
  }
}

// POST /api/events - Create a new event
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, description, date, avenue, time, location, registrationLink } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { success: false, error: "Title, description, and date are required." },
        { status: 400 }
      );
    }

    const newEvent = await Event.create({
      title: title.trim(),
      subtitle: body.subtitle || "",
      description: description.trim(),
      avenue: avenue || "General",
      date,
      time: time || "TBD",
      location: location || "SLTC Research University",
      image: body.image || "/images/hero.jpg",
      registrationLink: registrationLink || "/join-us",
      registrationOpen: body.registrationOpen ?? true,
      featured: body.featured ?? true,
      status: body.status || "upcoming",
      tags: body.tags || ["Rotaract SLTC"],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
