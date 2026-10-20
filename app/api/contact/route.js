import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

// GET /api/contact - List contact messages (for admin)
export async function GET() {
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

// POST /api/contact - Submit new message
export async function POST(request) {
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
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
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
