import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Allow file uploads up to 100MB as specified by Rotaract SLTC membership instructions
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // 100 MB max limit check (100 * 1024 * 1024)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum size of 100 MB." },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const extension = path.extname(originalName).toLowerCase() || ".png";
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".gif", ".doc", ".docx"];

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a PDF, document, or image (JPG, PNG, WEBP, PDF).",
        },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create safe unique filename
    const sanitizedBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);
    const fileName = `${Date.now()}_${sanitizedBase}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: file.size,
      mimeType: file.type || extension,
    });
  } catch (error) {
    console.error("Upload error in /api/upload/member-doc:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
