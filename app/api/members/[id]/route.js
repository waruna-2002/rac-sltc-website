import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRegistration from "@/models/MemberRegistration";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/serverAuth";
import { memoryStore } from "@/lib/memoryStore";

// PATCH /api/members/[id] - Update registration status (Super Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body;

  if (!status || !["pending", "contacted", "approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { success: false, error: "Invalid status value. Must be pending, contacted, approved, or rejected." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await MemberRegistration.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (updated) {
        // Also update memoryStore if present
        if (Array.isArray(memoryStore.members)) {
          const idx = memoryStore.members.findIndex((m) => (m._id || m.id) === id);
          if (idx >= 0) memoryStore.members[idx].status = status;
        }

        return NextResponse.json({
          success: true,
          message: `Registration marked as ${status}`,
          data: updated,
        });
      }
    }
  } catch (error) {
    console.warn("PATCH /api/members/[id] fallback mode:", error.message);
  }

  // Memory fallback
  if (Array.isArray(memoryStore.members)) {
    const idx = memoryStore.members.findIndex((m) => (m._id || m.id) === id);
    if (idx >= 0) {
      memoryStore.members[idx].status = status;
      return NextResponse.json({
        success: true,
        message: `Registration marked as ${status}`,
        data: memoryStore.members[idx],
        fallback: true,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Registration marked as ${status}`,
    fallback: true,
  });
}

// DELETE /api/members/[id] - Delete registration (Super Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    await dbConnect();

    if (mongoose.Types.ObjectId.isValid(id)) {
      await MemberRegistration.findByIdAndDelete(id);
    }
  } catch (error) {
    console.warn("DELETE /api/members/[id] fallback mode:", error.message);
  }

  if (Array.isArray(memoryStore.members)) {
    memoryStore.members = memoryStore.members.filter((m) => (m._id || m.id) !== id);
  }

  return NextResponse.json({
    success: true,
    message: "Registration deleted successfully",
  });
}
