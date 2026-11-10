import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { requireAdmin } from "@/lib/serverAuth";
import { sanitizeInput } from "@/lib/security";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// GET: Retrieve uploaded photos
export async function GET(req) {
  try {
    await dbConnect();
    const images = await Media.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upload verified image to Cloudinary and record in MongoDB (Admin Only)
export async function POST(req) {
  // 1. Enforce Server-Side Admin Authentication
  const auth = requireAdmin(req, ["super_admin", "project_editor"]);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawTitle = formData.get("title") || "Untitled Project Photo";
    const rawAvenue = formData.get("avenue") || "General";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No valid image file uploaded." },
        { status: 400 }
      );
    }

    // 2. Enforce File Size Limit (Max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 5 MB.`,
        },
        { status: 400 }
      );
    }

    // 3. Enforce Allowed MIME Types (Strict Whitelist)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format (${file.type || "unknown"}). Only JPEG, PNG, WEBP, and GIF images are permitted.`,
        },
        { status: 400 }
      );
    }

    // Check Cloudinary credentials
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === "your_cloudinary_cloud_name"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary storage credentials are not yet configured in .env.local",
        },
        { status: 503 }
      );
    }

    await dbConnect();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload securely to Cloudinary in rotaract_sltc folder
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "rotaract_sltc",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const title = sanitizeInput(String(rawTitle));
    const avenue = sanitizeInput(String(rawAvenue));

    // Save metadata and secure URL in MongoDB
    const newMedia = await Media.create({
      title,
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      avenue,
    });

    return NextResponse.json(
      { success: true, data: newMedia, message: "Image uploaded successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
