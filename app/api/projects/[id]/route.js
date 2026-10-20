import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import mongoose from "mongoose";

// GET /api/projects/[id]
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const updates = await request.json();

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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
