import { NextResponse } from "next/server";
import { getLaunchControl, updateLaunchSettings } from "@/lib/launchStore";
import { requireAdmin } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return auth.response;
  }

  const config = await getLaunchControl();
  return NextResponse.json({
    success: true,
    config,
  });
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { mode, isLaunched, targetDate, zeroMessage, resetLaunch } = body;

    const updated = await updateLaunchSettings({
      mode,
      isLaunched,
      targetDate,
      zeroMessage,
      resetLaunch,
    });

    return NextResponse.json({
      success: true,
      message: "Launch settings updated successfully",
      config: updated,
    });
  } catch (err) {
    console.error("Error updating launch settings:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update launch settings.",
      },
      { status: 500 }
    );
  }
}
