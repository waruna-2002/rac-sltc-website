import { NextResponse } from "next/server";
import { getLaunchControl } from "@/lib/launchStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const status = await getLaunchControl();
  return NextResponse.json(
    {
      ...status,
      serverTime: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
