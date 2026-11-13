import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";
import { deleteCloudinaryFile } from "@/lib/cloudinaryCleanup";

// PATCH /api/team/[id] - Update team member (Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Member ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const updateData = {};

    for (const [key, value] of Object.entries(body)) {
      if (key === "linkedin") {
        const raw = value ? String(value).trim() : "";
        const valid =
          raw &&
          raw !== "https://linkedin.com" &&
          raw !== "https://www.linkedin.com" &&
          raw !== "#";
        updateData[key] = valid ? sanitizeUrl(raw) : "";
      } else if (key === "instagram") {
        const raw = value ? String(value).trim() : "";
        const valid =
          raw &&
          raw !== "https://instagram.com" &&
          raw !== "https://www.instagram.com" &&
          raw !== "#";
        updateData[key] = valid ? sanitizeUrl(raw) : "";
      } else if (key === "image") {
        updateData[key] = value ? sanitizeUrl(value) : "";
      } else if (key === "achievements") {
        updateData[key] = Array.isArray(value) ? value.map(sanitizeInput) : [];
      } else if (typeof value === "string") {
        updateData[key] = sanitizeInput(value);
      } else {
        updateData[key] = value;
      }
    }

    await dbConnect();
    const existing = await TeamMember.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team member not found." },
        { status: 404 }
      );
    }

    // Auto-clean previous headshot if replaced with a new photo
    if (updateData.image && existing.image && existing.image !== updateData.image) {
      deleteCloudinaryFile(existing.image).catch((err) =>
        console.warn("[Team Auto-Cleanup] Previous photo deletion note:", err.message)
      );
    }

    const updated = await TeamMember.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({
      success: true,
      message: "Team member updated in MongoDB Atlas cloud database successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/team/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update team member." },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id] - Delete team member (Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Member ID is required." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const existing = await TeamMember.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team member not found." },
        { status: 404 }
      );
    }

    // Auto-clean headshot photo from Cloudinary
    if (existing.image) {
      deleteCloudinaryFile(existing.image).catch((err) =>
        console.warn("[Team Auto-Cleanup] Photo deletion note:", err.message)
      );
    }

    const deleted = await TeamMember.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Team member and photo permanently removed from cloud.",
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE /api/team/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete team member." },
      { status: 500 }
    );
  }
}
