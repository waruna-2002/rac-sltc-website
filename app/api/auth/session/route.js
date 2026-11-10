import { NextResponse } from "next/server";
import { getSession } from "@/lib/serverAuth";

export async function GET(request) {
  try {
    const session = getSession(request);

    if (session.authenticated) {
      return NextResponse.json({
        authenticated: true,
        role: session.role,
      });
    }

    return NextResponse.json({
      authenticated: false,
      role: null,
    });
  } catch (error) {
    console.error("GET /api/auth/session error:", error);
    return NextResponse.json(
      { authenticated: false, role: null, error: "Session verification error." },
      { status: 500 }
    );
  }
}
