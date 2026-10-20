import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import initialProjects from "@/data/projects.json";

// GET /api/projects - Retrieve projects (with optional filters: status, avenue, search)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const avenue = searchParams.get("avenue");
    const search = searchParams.get("search");

    // Auto-seed if database collection is empty
    const count = await Project.countDocuments();
    if (count === 0 && initialProjects && initialProjects.length > 0) {
      await Project.insertMany(
        initialProjects.map((p) => ({
          title: p.title,
          slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          avenue: p.avenue || "Community Service",
          date: p.date || new Date().toISOString().split("T")[0],
          impact: p.impact || "Community Impact",
          description: p.description,
          fullDescription: p.fullDescription || p.description,
          submittedBy: "SLTC Rotaract Executive Board",
          image: p.image || "/images/projects/project1.jpg",
          images: p.images || [p.image || "/images/projects/project1.jpg"],
          status: "approved",
          organizers: p.organizers || "Rotaract SLTC Member",
          highlights: p.highlights || ["Community Engagement Initiative"],
        }))
      );
    }

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (avenue && avenue !== "All") {
      query.avenue = avenue;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { avenue: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch projects from database",
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create/Submit a new project
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      title,
      avenue,
      date,
      impact,
      description,
      fullDescription,
      image,
      images,
      videoUrl,
      submittedBy,
      organizers,
      highlights,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required fields." },
        { status: 400 }
      );
    }

    // Auto-generate clean URL slug
    const cleanSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const primaryImage = image || (images && images[0]) || "/images/projects/project1.jpg";
    const galleryImages = images && images.length > 0 ? images : [primaryImage];

    const newProject = await Project.create({
      title: title.trim(),
      slug: cleanSlug,
      avenue: avenue || "Community Service",
      date: date || new Date().toISOString().split("T")[0],
      impact: impact || "Community Impact",
      description: description.trim(),
      fullDescription: fullDescription || description,
      submittedBy: submittedBy || "Anonymous Rotaractor",
      image: primaryImage,
      images: galleryImages,
      videoUrl: videoUrl || "",
      status: status || "pending",
      organizers: organizers || "Rotaract SLTC Member",
      highlights: highlights && highlights.length > 0 ? highlights : ["Community Engagement Initiative"],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project submitted successfully!",
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit project to database",
      },
      { status: 500 }
    );
  }
}
