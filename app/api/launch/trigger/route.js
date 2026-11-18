import { NextResponse } from "next/server";
import { executeLaunch } from "@/lib/launchStore";
import { getSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { key, name } = body;

    const expectedKey = process.env.LAUNCH_SECRET_KEY || "rsltc2026";
    const session = getSession(request);

    // Allow if key matches OR if user has a verified admin session
    const isKeyValid = key && key.trim() === expectedKey.trim();
    const isAdmin = session.authenticated && ["super_admin", "project_editor"].includes(session.role);

    if (!isKeyValid && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid launch authorization key. Access denied.",
        },
        { status: 401 }
      );
    }

    const launcherName = name?.trim() || (isAdmin ? `Admin (${session.role})` : "Chief Guest");
    const result = await executeLaunch({ launchedBy: launcherName });

    return NextResponse.json({
      success: true,
      message: "Website has been officially launched!",
      launchedAt: result.launchedAt,
      launchedBy: launcherName,
    });
  } catch (error) {
    console.error("Error during launch trigger:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error triggering launch sequence.",
      },
      { status: 500 }
    );
  }
}
