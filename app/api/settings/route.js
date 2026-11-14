import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

export const defaultSiteContent = {
  // Hero Section
  heroTitle: "ROTARACT CLUB OF SLTC",
  heroSubtitle: "Ignite Potential • Inspire Impact • Serve with Passion",
  districtBadge: "Rotaract District 3220 • Sri Lanka & Maldives",
  heroButtonText: "JOIN US NOW",

  // Who We Are (Homepage)
  whoWeAreTitle: "Empowering Leaders, Transforming Communities.",
  whoWeAreDescription:
    "The Rotaract Club of SLTC brings together passionate undergraduates dedicated to leadership, tech innovation, and humanitarian service. Based at SLTC Research University, we empower students to lead meaningful community initiatives and cultivate high-impact skills.",
  missionText: "To foster responsible youth leadership through impactful service above self.",
  visionText: "Building an inspired university community dedicated to social impact.",

  // About Us Page
  aboutHistory:
    "Chartered under Rotary International District 3220, the Rotaract Club of SLTC Research University has grown into one of the most vibrant youth organizations in Sri Lanka. Our members drive sustainable development, professional skill enhancement, and youth empowerment.",
  charterYear: "2020",
  parentRotaryClub: "Rotary Club of Colombo West",

  // Contact & Official Info
  address: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka",
  email: "rotaractclub@sltc.ac.lk",
  phone: "+94 77 123 4567",
  facebookUrl: "https://www.facebook.com/share/19mguwo9sP/",
  instagramUrl: "https://www.instagram.com/rotaract_sltc?mdxt=dzl0cHJwNGJzejE0",
  linkedinUrl: "",
  youtubeUrl: "",

  // Media / Newsletter
  newsletterTitle: "Rotaract SLTC Official Quarterly Gazette",
  newsletterLink: "https://rotaract.sltc.ac.lk/gazette.pdf",
};

// GET /api/settings - Retrieve global website CMS content (Public)
export async function GET() {
  try {
    await dbConnect();

    const record = await SiteSetting.findOne({ key: "global_site_content" });
    if (record && record.content && Object.keys(record.content).length > 0) {
      return NextResponse.json({
        success: true,
        data: { ...defaultSiteContent, ...record.content },
        source: "database",
      });
    }

    return NextResponse.json({
      success: true,
      data: defaultSiteContent,
      source: "default",
    });
  } catch (error) {
    // Graceful fallback if MongoDB is not reachable
    return NextResponse.json({
      success: true,
      data: defaultSiteContent,
      source: "fallback",
      error: error.message,
    });
  }
}

// POST /api/settings - Save global website CMS content (Super Admin Only)
export async function POST(request) {
  const auth = requireAdmin(request, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const rawContent = await request.json();

    if (!rawContent || typeof rawContent !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid content payload." },
        { status: 400 }
      );
    }

    // Sanitize string inputs and URLs
    const sanitized = {};
    for (const [key, value] of Object.entries(rawContent)) {
      if (typeof value === "string") {
        if (key.toLowerCase().includes("url") || key.toLowerCase().includes("link")) {
          sanitized[key] = sanitizeUrl(value);
        } else {
          sanitized[key] = sanitizeInput(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    await dbConnect();

    const updated = await SiteSetting.findOneAndUpdate(
      { key: "global_site_content" },
      {
        content: sanitized,
        updatedBy: auth.role,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Site content updated and saved to MongoDB successfully.",
      data: updated.content,
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist settings in database." },
      { status: 500 }
    );
  }
}
