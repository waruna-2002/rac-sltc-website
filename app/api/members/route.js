import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRegistration from "@/models/MemberRegistration";

// GET /api/members - List membership applications (for admin)
export async function GET() {
  try {
    await dbConnect();
    const members = await MemberRegistration.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: members.length, data: members });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// POST /api/members - Submit new member application
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { fullName, email, phone, studentId, faculty, avenues, reason } = body;

    if (!fullName || !email || !phone || !studentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Full Name, Email, Phone Number, and Student ID are required.",
        },
        { status: 400 }
      );
    }

    const newRegistration = await MemberRegistration.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      studentId: studentId.trim(),
      faculty: faculty || "Computing & IT",
      avenues: Array.isArray(avenues) ? avenues : [],
      reason: reason ? reason.trim() : "",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully! Our team will contact you shortly.",
        data: newRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/members error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit membership application" },
      { status: 500 }
    );
  }
}
