import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import mongoose from "mongoose";
import { requireAdmin, getSession } from "@/lib/serverAuth";
import { memoryStore } from "@/lib/memoryStore";
import { deleteCloudinaryFile, deleteCloudinaryFiles } from "@/lib/cloudinaryCleanup";

// GET /api/projects/[id] - Public project details
export async function GET(request, { params }) {
  const { id } = await params;
  const session = getSession(request);
  const isAdmin = session.authenticated;

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

    const dataObj = project.toObject ? project.toObject() : { ...project };
    if (!isAdmin) {
      delete dataObj.proposalPdf;
      delete dataObj.proposalPdfName;
      delete dataObj.proposalDriveLink;
      delete dataObj.reportPdf;
      delete dataObj.reportPdfName;
      delete dataObj.reportDriveLink;
    }

    return NextResponse.json({ success: true, data: dataObj });
  } catch (error) {
    console.warn("GET /api/projects/[id] fallback mode:", error.message);
    const item = memoryStore.projects.find((p) => p._id === id || p.id === id || p.slug === id);
    if (item) {
      const fallbackObj = { ...item };
      if (!isAdmin) {
        delete fallbackObj.proposalPdf;
        delete fallbackObj.proposalPdfName;
        delete fallbackObj.proposalDriveLink;
        delete fallbackObj.reportPdf;
        delete fallbackObj.reportPdfName;
        delete fallbackObj.reportDriveLink;
      }
      return NextResponse.json({ success: true, data: fallbackObj, fallback: true });
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

  if (Array.isArray(updates.images)) {
    updates.images = updates.images.slice(0, 3);
    if (!updates.image && updates.images.length > 0) {
      updates.image = updates.images[0];
    }
  }

  try {
    await dbConnect();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    // Check existing project to auto-clean replaced assets from Cloudinary
    const existing = await Project.findOne(query);
    if (existing) {
      if (updates.image && existing.image && existing.image !== updates.image) {
        deleteCloudinaryFile(existing.image).catch((err) =>
          console.warn("[Project Auto-Cleanup] Old image deletion note:", err.message)
        );
      }
      if (updates.proposalPdf && existing.proposalPdf && existing.proposalPdf !== updates.proposalPdf) {
        deleteCloudinaryFile(existing.proposalPdf, "raw").catch((err) =>
          console.warn("[Project Auto-Cleanup] Old proposal PDF deletion note:", err.message)
        );
      }
      if (updates.reportPdf && existing.reportPdf && existing.reportPdf !== updates.reportPdf) {
        deleteCloudinaryFile(existing.reportPdf, "raw").catch((err) =>
          console.warn("[Project Auto-Cleanup] Old report PDF deletion note:", err.message)
        );
      }
    }

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

// DELETE /api/projects/[id] - Delete project (Super Admin & Project Editor)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    await dbConnect();

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Project.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Project.findOneAndDelete({
        $or: [{ slug: id }, { title: id }],
      });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found in database" },
        { status: 404 }
      );
    }

    // Auto-clean all associated project images & PDFs from Cloudinary CDN
    const assetsToPurge = [
      deleted.image,
      ...(Array.isArray(deleted.images) ? deleted.images : []),
    ];
    deleteCloudinaryFiles(assetsToPurge).catch((err) =>
      console.warn("[Project Auto-Cleanup] Project images deletion note:", err.message)
    );
    if (deleted.proposalPdf) {
      deleteCloudinaryFile(deleted.proposalPdf, "raw").catch((err) =>
        console.warn("[Project Auto-Cleanup] Proposal PDF deletion note:", err.message)
      );
    }
    if (deleted.reportPdf) {
      deleteCloudinaryFile(deleted.reportPdf, "raw").catch((err) =>
        console.warn("[Project Auto-Cleanup] Report PDF deletion note:", err.message)
      );
    }

    // Keep memoryStore in sync
    if (memoryStore && Array.isArray(memoryStore.projects)) {
      memoryStore.projects = memoryStore.projects.filter(
        (p) => String(p._id || p.id) !== String(id) && p.slug !== id && p.title !== id
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project permanently deleted from database",
    });
  } catch (error) {
    console.warn("DELETE /api/projects/[id] fallback mode:", error.message);
    if (memoryStore && Array.isArray(memoryStore.projects)) {
      memoryStore.projects = memoryStore.projects.filter(
        (p) => String(p._id || p.id) !== String(id) && p.slug !== id && p.title !== id
      );
    }
    return NextResponse.json({
      success: true,
      message: "Project deleted successfully (Local mode)",
      fallback: true,
    });
  }
}
