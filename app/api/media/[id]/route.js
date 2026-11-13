import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MediaPost from "@/models/MediaPost";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/serverAuth";
import { memoryStore } from "@/lib/memoryStore";
import { deleteCloudinaryFile } from "@/lib/cloudinaryCleanup";

// PATCH /api/media/[id] - Update media post or status (Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const updates = await request.json().catch(() => ({}));

  try {
    await dbConnect();
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    // Auto-clean previous cover image if replaced
    const existing = await MediaPost.findOne(query);
    if (existing) {
      const oldImg = existing.coverImage || existing.image;
      const newImg = updates.coverImage || updates.image;
      if (newImg && oldImg && newImg !== oldImg) {
        deleteCloudinaryFile(oldImg).catch((err) =>
          console.warn("[Media Auto-Cleanup] Previous cover deletion note:", err.message)
        );
      }
    }

    const updated = await MediaPost.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      if (Array.isArray(memoryStore.media)) {
        const idx = memoryStore.media.findIndex((m) => (m._id || m.id) === id || m.slug === id);
        if (idx >= 0) memoryStore.media[idx] = { ...memoryStore.media[idx], ...updates };
      }
      return NextResponse.json({
        success: true,
        message: "Media item updated successfully",
        data: updated,
      });
    }
  } catch (error) {
    console.warn("PATCH /api/media/[id] fallback mode:", error.message);
  }

  // Memory fallback
  if (Array.isArray(memoryStore.media)) {
    const idx = memoryStore.media.findIndex((m) => (m._id || m.id) === id || m.slug === id);
    if (idx >= 0) {
      memoryStore.media[idx] = { ...memoryStore.media[idx], ...updates };
      return NextResponse.json({
        success: true,
        message: "Media item updated successfully (Local mode)",
        data: memoryStore.media[idx],
        fallback: true,
      });
    }
  }

  return NextResponse.json(
    { success: false, error: "Media item not found" },
    { status: 404 }
  );
}

// DELETE /api/media/[id] - Delete media post (Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    await dbConnect();
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const deleted = await MediaPost.findOneAndDelete(query);
    if (deleted) {
      const img = deleted.coverImage || deleted.image;
      if (img) {
        deleteCloudinaryFile(img).catch((err) =>
          console.warn("[Media Auto-Cleanup] Post image deletion note:", err.message)
        );
      }
    }
  } catch (error) {
    console.warn("DELETE /api/media/[id] fallback mode:", error.message);
  }

  if (Array.isArray(memoryStore.media)) {
    memoryStore.media = memoryStore.media.filter((m) => (m._id || m.id) !== id && m.slug !== id);
  }

  return NextResponse.json({
    success: true,
    message: "Media post deleted successfully",
  });
}
