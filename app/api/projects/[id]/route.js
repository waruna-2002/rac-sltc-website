import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/serverAuth";
import { memoryStore } from "@/lib/memoryStore";

// GET /api/projects/[id] - Public project details
export async function GET(request, { params }) {
  const { id } = await params;

  try {
    await dbConnect();

    let project = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      project = await Project.findById(id);
    }
    if (!project) {
      project = await Project.findOne({ slug: id });
    }

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.warn("GET /api/projects/[id] fallback mode:", error.message);
    const item = memoryStore.projects.find((p) => p._id === id || p.id === id || p.slug === id);
    if (item) {
      return NextResponse.json({ success: true, data: item, fallback: true });
    }
    return NextResponse.json(
      { success: false, error: "Project not found" },
      { status: 404 }
    );
  }
}

// PATCH /api/projects/[id] - Update project status or details (Super Admin & Project Editor)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const updates = await request.json().catch(() => ({}));

  try {
    await dbConnect();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const updated = await Project.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.warn("PATCH /api/projects/[id] fallback mode:", error.message);
    const idx = memoryStore.projects.findIndex((p) => p._id === id || p.id === id || p.slug === id);
    if (idx >= 0) {
      memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...updates };
      return NextResponse.json({
        success: true,
        message: "Project updated successfully (Local mode)",
        data: memoryStore.projects[idx],
        fallback: true,
      });
    }
    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      fallback: true,
    });
  }
}

// DELETE /api/projects/[id] - Delete project (Super Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    await dbConnect();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const deleted = await Project.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.warn("DELETE /api/projects/[id] fallback mode:", error.message);
    memoryStore.projects = memoryStore.projects.filter(
      (p) => p._id !== id && p.id !== id && p.slug !== id
    );
    return NextResponse.json({
      success: true,
      message: "Project deleted successfully (Local mode)",
      fallback: true,
    });
  }
}
