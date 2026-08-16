import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: සියලුම Upload කළ ඡායාරූප ලබාගැනීම
export async function GET() {
  try {
    await dbConnect();
    const images = await Media.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: අලුත් Image එකක් Upload කර MongoDB හි save කිරීම
export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title") || "Untitled Project Photo";
    const avenue = formData.get("avenue") || "General";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "rotaract_sltc" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save metadata and URL in MongoDB
    const newMedia = await Media.create({
      title,
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      avenue,
    });

    return NextResponse.json({ success: true, data: newMedia }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}