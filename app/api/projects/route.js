import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import initialProjects from "@/data/projects.json";
import { getSession } from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

// GET /api/projects - Retrieve projects (with optional filters: status, avenue, search)
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const avenue = searchParams.get("avenue");
    const search = searchParams.get("search");

    const query = {};
    if (status === "all") {
      // Admin requested all projects
    } else if (status) {
      query.status = status;
    } else {
      // Public site defaults to only approved projects
      query.status = "approved";
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

    const session = getSession(request);
    const isAdmin = session.authenticated;

    const sanitized = projects.map((p) => {
      const obj = p.toObject ? p.toObject() : { ...p };
      if (!isAdmin) {
        delete obj.proposalPdf;
        delete obj.proposalPdfName;
        delete obj.reportPdf;
        delete obj.reportPdfName;
      }
      return obj;
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    // If DB is offline, filter initial static projects gracefully
    let filtered = memoryStore.projects || [];
    const session = getSession(request);
    const isAdmin = session.authenticated;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const avenue = searchParams.get("avenue");
    const search = searchParams.get("search");

    if (status === "all") {
      // return all
    } else if (status) {
      filtered = filtered.filter((p) => p.status === status);
    } else {
      // Public site defaults to only approved projects
      filtered = filtered.filter((p) => (p.status || "approved") === "approved");
    }
    if (avenue && avenue !== "All") {
      filtered = filtered.filter((p) => p.avenue === avenue);
    }
    if (search) {
      filtered = filtered.filter((p) => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const sanitizedFallback = filtered.map((p) => {
      const obj = { ...p };
      if (!isAdmin) {
        delete obj.proposalPdf;
        delete obj.proposalPdfName;
        delete obj.reportPdf;
        delete obj.reportPdfName;
      }
      return obj;
    });

    return NextResponse.json({
      success: true,
      count: sanitizedFallback.length,
      data: sanitizedFallback,
      fallback: true,
    });
  }
}

// POST /api/projects - Create/Submit a project (Hardened with Role Verification & Rate Limiting)
export async function POST(request) {
  const session = getSession(request);
  const isAdmin = session.authenticated;

  // Rate limiting for public submissions: Max 5 submissions per 30 minutes
  if (!isAdmin) {
    const ip = getClientIp(request);
    const rateCheck = checkServerRateLimit(`project_sub:${ip}`, {
      limit: 5,
      windowMs: 30 * 60 * 1000,
    });

    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(
        rateCheck.resetInSeconds,
        "Too many project proposals submitted from your IP."
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const {
    title,
    avenue,
    date,
    impact,
    description,
    fullDescription,
    image,
    images,
    driveLink,
    proposalPdf,
    proposalPdfName,
    reportPdf,
    reportPdfName,
    projectChair,
    projectSecretary,
    projectTreasurer,
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

  if (!driveLink || !driveLink.trim()) {
    return NextResponse.json(
      { success: false, error: "Google Drive link (Photos & Videos folder) is required." },
      { status: 400 }
    );
  }

  const cleanSlug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

  const rawPrimaryImage = image || (images && images[0]) || "";
  const primaryImage = rawPrimaryImage ? sanitizeUrl(rawPrimaryImage) : "";
  const galleryImages =
    images && images.length > 0
      ? images.slice(0, 3).map((img) => sanitizeUrl(String(img)))
      : (primaryImage ? [primaryImage] : []);

  const verifiedStatus = isAdmin ? (status || "approved") : "pending";

  try {
    await dbConnect();
    const newProject = await Project.create({
      title: sanitizeInput(title.trim()),
      slug: cleanSlug,
      avenue: sanitizeInput(avenue || "Community Service Avenue"),
      date: date || new Date().toISOString().split("T")[0],
      impact: sanitizeInput(impact || "Community Impact"),
      description: sanitizeInput(description.trim()),
      fullDescription: sanitizeInput(fullDescription || description),
      submittedBy: sanitizeInput(submittedBy || (isAdmin ? session.role : "Anonymous Rotaractor")),
      image: primaryImage || (galleryImages[0] || ""),
      images: galleryImages,
      driveLink: sanitizeUrl(driveLink.trim()),
      proposalPdf: proposalPdf ? sanitizeUrl(proposalPdf) : "",
      proposalPdfName: sanitizeInput(proposalPdfName || ""),
      reportPdf: reportPdf ? sanitizeUrl(reportPdf) : "",
      reportPdfName: sanitizeInput(reportPdfName || ""),
      projectChair: sanitizeInput(projectChair || ""),
      projectSecretary: sanitizeInput(projectSecretary || ""),
      projectTreasurer: sanitizeInput(projectTreasurer || ""),
      videoUrl: videoUrl ? sanitizeUrl(videoUrl) : "",
      status: verifiedStatus,
      organizers: sanitizeInput(organizers || (projectChair ? `Chair: ${projectChair}` : "Rotaract SLTC Member")),
      highlights:
        highlights && highlights.length > 0
          ? highlights.map((h) => sanitizeInput(String(h)))
          : ["Community Engagement Initiative"],
    });

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? "Project created successfully."
          : "Project proposal submitted successfully for executive board review.",
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.warn("POST /api/projects DB fallback mode:", error.message);
    const nowId = "proj_" + Date.now();
    const fallbackCreated = {
      _id: nowId,
      id: nowId,
      slug: cleanSlug,
      title: sanitizeInput(title.trim()),
      avenue: sanitizeInput(avenue || "Community Service Avenue"),
      date: date || new Date().toISOString().split("T")[0],
      impact: sanitizeInput(impact || "Community Impact"),
      description: sanitizeInput(description.trim()),
      fullDescription: sanitizeInput(fullDescription || description),
      submittedBy: sanitizeInput(submittedBy || (isAdmin ? session.role : "Anonymous Rotaractor")),
      image: primaryImage,
      images: galleryImages,
      videoUrl: videoUrl ? sanitizeUrl(videoUrl) : "",
      status: verifiedStatus,
      organizers: sanitizeInput(organizers || "Rotaract SLTC Member"),
      highlights: highlights && highlights.length > 0 ? highlights : ["Community Initiative"],
      createdAt: new Date().toISOString(),
    };

    memoryStore.projects.unshift(fallbackCreated);

    return NextResponse.json(
      {
        success: true,
        message: isAdmin
          ? "Project created successfully."
          : "Project proposal submitted successfully for executive board review.",
        data: fallbackCreated,
        fallback: true,
      },
      { status: 201 }
    );
  }
}
