import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MediaPost from "@/models/MediaPost";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";
import { memoryStore } from "@/lib/memoryStore";
import initialMediaItems from "@/data/media.json";

// Initialize in-memory fallback store if needed
if (!Array.isArray(memoryStore.media) || memoryStore.media.length === 0) {
  memoryStore.media = [...initialMediaItems];
}

// GET /api/media - Fetch media items (Public gets approved only, Admin gets all)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");

  try {
    await dbConnect();
    const query = {};
    if (statusParam && statusParam !== "all") {
      query.status = statusParam;
    } else if (!statusParam) {
      query.status = "approved"; // Default to approved for public
    }

    if (typeParam && typeParam !== "all") {
      query.type = typeParam;
    }

    const items = await MediaPost.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.warn("GET /api/media fallback mode:", error.message);
    let fallbackItems = memoryStore.media || initialMediaItems;

    if (statusParam && statusParam !== "all") {
      fallbackItems = fallbackItems.filter((m) => m.status === statusParam);
    } else if (!statusParam) {
      fallbackItems = fallbackItems.filter((m) => m.status === "approved" || !m.status);
    }

    if (typeParam && typeParam !== "all") {
      fallbackItems = fallbackItems.filter((m) => m.type === typeParam);
    }

    return NextResponse.json({
      success: true,
      count: fallbackItems.length,
      data: fallbackItems,
      fallback: true,
    });
  }
}

// POST /api/media - Submit a new Blog or Article
export async function POST(request) {
  try {
    const auth = requireAdmin(request, ["super_admin", "project_editor"]);
    const isUserAdmin = auth.authorized;

    const body = await request.json();
    const {
      title,
      type = "blog",
      author,
      authorRole = "Club Member",
      authorEmail = "",
      avenue = "General",
      image,
      summary,
      content,
      readTime = "4 min read",
      size,
      issue,
      fileUrl,
      status,
    } = body;

    if (!title || !author || !summary) {
      return NextResponse.json(
        { success: false, error: "Title, Author, and Summary are required." },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `media-${Date.now()}`;

    // Non-admins CANNOT publish directly; forced to pending
    const verifiedStatus = isUserAdmin ? (status || "approved") : "pending";

    const mediaDoc = {
      title: sanitizeInput(title),
      slug,
      type: sanitizeInput(type),
      author: sanitizeInput(author),
      authorRole: sanitizeInput(authorRole),
      authorEmail: authorEmail ? sanitizeInput(authorEmail) : "",
      avenue: sanitizeInput(avenue),
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      readTime: sanitizeInput(readTime),
      image: sanitizeUrl(image || "/images/projects/project1.jpg"),
      summary: sanitizeInput(summary),
      content: sanitizeInput(content || ""),
      size: size ? sanitizeInput(size) : "",
      issue: issue ? sanitizeInput(issue) : "",
      fileUrl: fileUrl ? sanitizeUrl(fileUrl) : "",
      status: verifiedStatus,
      createdAt: new Date().toISOString(),
    };

    try {
      await dbConnect();
      const created = await MediaPost.create(mediaDoc);

      if (!Array.isArray(memoryStore.media)) memoryStore.media = [];
      memoryStore.media.unshift(created.toObject ? created.toObject() : created);

      return NextResponse.json(
        {
          success: true,
          message: verifiedStatus === "pending"
            ? "Story submitted successfully! Our editorial board will review and approve it soon."
            : "Publication created and published live successfully!",
          data: created,
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("DB unavailable, saving to memoryStore:", dbErr.message);
      const fallbackItem = {
        _id: `media_${Date.now()}`,
        id: `media_${Date.now()}`,
        ...mediaDoc,
      };

      if (!Array.isArray(memoryStore.media)) memoryStore.media = [];
      memoryStore.media.unshift(fallbackItem);

      return NextResponse.json(
        {
          success: true,
          message: verifiedStatus === "pending"
            ? "Story submitted successfully! Our editorial board will review and approve it soon."
            : "Publication created and published live successfully!",
          data: fallbackItem,
          fallback: true,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit media" },
      { status: 500 }
    );
  }
}
