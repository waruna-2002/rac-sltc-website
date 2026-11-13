import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

// GET /api/team - Fetch all team members (Public)
export async function GET() {
  try {
    await dbConnect();
    const members = await TeamMember.find({}).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.warn("GET /api/team database error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load team members" },
      { status: 500 }
    );
  }
}

// POST /api/team - Add new team member (Admin Only)
export async function POST(request) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const {
      name,
      role,
      category,
      avenue,
      faculty,
      image,
      bio,
      email,
      achievements,
      linkedin,
      instagram,
      order,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Member name is required." },
        { status: 400 }
      );
    }

    const rawLinkedin = linkedin ? String(linkedin).trim() : "";
    const isValidLinkedin =
      rawLinkedin &&
      rawLinkedin !== "https://linkedin.com" &&
      rawLinkedin !== "https://www.linkedin.com" &&
      rawLinkedin !== "#";

    const rawInstagram = instagram ? String(instagram).trim() : "";
    const isValidInstagram =
      rawInstagram &&
      rawInstagram !== "https://instagram.com" &&
      rawInstagram !== "https://www.instagram.com" &&
      rawInstagram !== "#";

    await dbConnect();

    const newMember = await TeamMember.create({
      name: sanitizeInput(name.trim()),
      role: sanitizeInput(role ? role.trim() : "Director"),
      category: category === "Executive Committee" ? "Executive Committee" : "Board of Directors",
      avenue: sanitizeInput(avenue || ""),
      faculty: sanitizeInput(faculty || ""),
      image: image ? sanitizeUrl(image) : "",
      bio: sanitizeInput(bio || ""),
      email: sanitizeInput(email || ""),
      achievements: Array.isArray(achievements) ? achievements.map(sanitizeInput) : [],
      linkedin: isValidLinkedin ? sanitizeUrl(rawLinkedin) : "",
      instagram: isValidInstagram ? sanitizeUrl(rawInstagram) : "",
      order: typeof order === "number" ? order : 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Team member added to MongoDB Atlas cloud database successfully.",
        data: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create team member." },
      { status: 500 }
    );
  }
}
