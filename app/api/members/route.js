import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MemberRegistration from "@/models/MemberRegistration";
import { requireAdmin } from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import { sanitizeInput } from "@/lib/security";
import { memoryStore } from "@/lib/memoryStore";

// GET /api/members - List membership applications (Strictly Super Admin Only)
export async function GET(request) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const members = await MemberRegistration.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: members.length, data: members });
  } catch (error) {
    console.warn("GET /api/members fallback mode:", error.message);
    const localMembers = memoryStore.members || [];
    return NextResponse.json({
      success: true,
      count: localMembers.length,
      data: localMembers,
      fallback: true,
    });
  }
}

// POST /api/members - Submit new member application (Public submission with IP Rate Limiting)
export async function POST(request) {
  // IP Rate limiting: Max 10 registration attempts per 10 minutes per IP
  const ip = getClientIp(request);
  const rateCheck = checkServerRateLimit(`member_reg:${ip}`, {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateCheck.allowed) {
    return rateLimitExceededResponse(
      rateCheck.resetInSeconds,
      "Too many membership applications submitted from your network."
    );
  }

  try {
    const body = await request.json();

    const {
      fullName,
      email,
      gender,
      address,
      studentId,
      nic,
      whatsapp,
      dob,
      yearOfStudy,
      faculty,
      avenue,
      otherClub,
      photoUrl,
      photoFileName,
      paymentReceiptUrl,
      paymentReceiptFileName,
      agreedToTerms,
    } = body;

    // Validate essential required fields
    if (
      !fullName ||
      !email ||
      !gender ||
      !address ||
      !studentId ||
      !nic ||
      !whatsapp ||
      !dob ||
      !yearOfStudy ||
      !faculty ||
      !avenue
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in all required fields marked with *.",
        },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        {
          success: false,
          error: "You must confirm your commitment and agree to the membership terms.",
        },
        { status: 400 }
      );
    }

    const applicationDoc = {
      fullName: sanitizeInput(fullName.trim()),
      email: email.trim().toLowerCase(),
      gender: gender === "Female" ? "Female" : "Male",
      address: sanitizeInput(address.trim()),
      studentId: sanitizeInput(studentId.trim()),
      nic: sanitizeInput(nic.trim()),
      whatsapp: sanitizeInput(whatsapp.trim()),
      phone: sanitizeInput(whatsapp.trim()),
      dob: sanitizeInput(dob.trim()),
      yearOfStudy: sanitizeInput(yearOfStudy.trim()),
      faculty: sanitizeInput(faculty.trim()),
      avenue: sanitizeInput(avenue.trim()),
      avenues: [sanitizeInput(avenue.trim())],
      otherClub: otherClub ? sanitizeInput(otherClub.trim()) : "",
      reason: "",
      photoUrl: photoUrl || "",
      photoFileName: photoFileName ? sanitizeInput(photoFileName) : "photo.jpg",
      paymentReceiptUrl: paymentReceiptUrl || "",
      paymentReceiptFileName: paymentReceiptFileName ? sanitizeInput(paymentReceiptFileName) : "receipt.pdf",
      agreedToTerms: Boolean(agreedToTerms),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await dbConnect();
      const newRegistration = await MemberRegistration.create(applicationDoc);

      // Keep in-memory cache synchronized as well
      if (!Array.isArray(memoryStore.members)) {
        memoryStore.members = [];
      }
      memoryStore.members.unshift(newRegistration.toObject ? newRegistration.toObject() : newRegistration);

      return NextResponse.json(
        {
          success: true,
          message: "Application submitted successfully! Our membership team will contact you shortly.",
          data: newRegistration,
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("Database unavailable, storing in memory fallback store:", dbErr.message);
      const fallbackItem = {
        _id: `mem_${Date.now()}`,
        id: `mem_${Date.now()}`,
        ...applicationDoc,
      };
      if (!Array.isArray(memoryStore.members)) {
        memoryStore.members = [];
      }
      memoryStore.members.unshift(fallbackItem);

      return NextResponse.json(
        {
          success: true,
          message: "Application submitted successfully! Our membership team will contact you shortly.",
          data: fallbackItem,
          fallback: true,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST /api/members error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit membership application" },
      { status: 500 }
    );
  }
}
