import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { memoryStore } from "@/lib/memoryStore";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

// GET /api/events/[id] - Public event details
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    await dbConnect();

    if (mongoose.Types.ObjectId.isValid(id)) {
      const event = await Event.findById(id);
      if (event) {
        return NextResponse.json({ success: true, data: event });
      }
    }
  } catch (error) {
    console.warn("GET /api/events/[id] DB error:", error.message);
  }

  const memEvent = (memoryStore.events || []).find((e) => (e._id || e.id) === id);
  if (memEvent) {
    return NextResponse.json({ success: true, data: memEvent });
  }

  return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
}

// PATCH /api/events/[id] - Update event details / Approve / Reject (Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const updates = {};

  if (body.title) updates.title = sanitizeInput(body.title.trim());
  if (body.subtitle !== undefined) updates.subtitle = sanitizeInput(body.subtitle);
  if (body.description) updates.description = sanitizeInput(body.description.trim());
  if (body.avenue) updates.avenue = sanitizeInput(body.avenue);
  if (body.date) updates.date = body.date;
  if (body.time) updates.time = sanitizeInput(body.time);
  if (body.location) updates.location = sanitizeInput(body.location);
  if (body.image) updates.image = sanitizeUrl(body.image);
  if (body.registrationLink) updates.registrationLink = sanitizeUrl(body.registrationLink);
  if (body.registrationOpen !== undefined) updates.registrationOpen = Boolean(body.registrationOpen);
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);
  if (body.status) updates.status = body.status;
  if (body.approvalStatus) updates.approvalStatus = sanitizeInput(body.approvalStatus); // "approved" | "rejected" | "pending"
  if (body.submittedBy) updates.submittedBy = sanitizeInput(body.submittedBy);
  if (body.submitterEmail) updates.submitterEmail = sanitizeInput(body.submitterEmail);
  if (Array.isArray(body.tags)) updates.tags = body.tags.map((t) => sanitizeInput(String(t)));

  try {
    await dbConnect();

    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (updated) {
        return NextResponse.json({
          success: true,
          message: "Event updated successfully",
          data: updated,
        });
      }
    }
  } catch (error) {
    console.warn("PATCH /api/events/[id] DB error:", error.message);
  }

  // Memory fallback update
  const idx = (memoryStore.events || []).findIndex((e) => (e._id || e.id) === id);
  if (idx !== -1) {
    memoryStore.events[idx] = { ...memoryStore.events[idx], ...updates };
    return NextResponse.json({
      success: true,
      message: "Event updated successfully (local)",
      data: memoryStore.events[idx],
    });
  }

  return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
}

// DELETE /api/events/[id] - Delete an event (Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    await dbConnect();

    if (mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await Event.findByIdAndDelete(id);
      if (deleted) {
        return NextResponse.json({
          success: true,
          message: "Event deleted successfully",
        });
      }
    }
  } catch (error) {
    console.warn("DELETE /api/events/[id] DB error:", error.message);
  }

  // Memory fallback delete
  const initialLen = (memoryStore.events || []).length;
  memoryStore.events = (memoryStore.events || []).filter((e) => (e._id || e.id) !== id);
  if (memoryStore.events.length < initialLen) {
    return NextResponse.json({
      success: true,
      message: "Event deleted successfully (local)",
    });
  }

  return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
}
