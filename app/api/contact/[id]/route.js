import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/serverAuth";

// PATCH /api/contact/[id] - Mark message as read/replied (Super Admin Only)
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid message ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["unread", "read", "replied"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status must be unread, read, or replied." },
        { status: 400 }
      );
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Message marked as ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/contact/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/contact/[id] - Delete contact message (Super Admin Only)
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid message ID" }, { status: 400 });
    }

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/contact/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
