import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin } from "@/lib/serverAuth";
import { 
  getClientIp, 
  checkServerRateLimit, 
  rateLimitExceededResponse 
} from "@/lib/serverRateLimit";
import { sanitizeInput } from "@/lib/security";

// GET /api/contact - List contact messages (Strictly Super Admin Only)
export async function GET(request) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    await dbConnect();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/contact - Submit new message (Public inquiry with IP Rate Limiting)
export async function POST(request) {
  // IP Rate limiting: Max 5 inquiries per 10 minutes per IP
  const ip = getClientIp(request);
  const rateCheck = checkServerRateLimit(`contact:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateCheck.allowed) {
    return rateLimitExceededResponse(
      rateCheck.resetInSeconds,
      "Too many contact submissions from your IP."
    );
  }

  try {
    await dbConnect();
    const body = await request.json();

    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const newMessage = await ContactMessage.create({
      name: sanitizeInput(name.trim()),
      email: email.trim().toLowerCase(),
      subject: sanitizeInput(subject.trim()),
      message: sanitizeInput(message.trim()),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully!",
        data: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
