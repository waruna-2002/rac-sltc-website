import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

// GET /api/events/[id] - Public event details
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID" }, { status: 400 });
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/events/[id] - Update event details (Super Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID" }, { status: 400 });
    }

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
    if (Array.isArray(body.tags)) updates.tags = body.tags.map((t) => sanitizeInput(String(t)));

    const updated = await Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete an event (Super Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid event ID" }, { status: 400 });
    }

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
