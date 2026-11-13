import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const docType = formData.get("docType") || "project_doc"; // "proposal" | "report"

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No PDF file was provided." },
        { status: 400 }
      );
    }

    // 25 MB max limit check
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "PDF file exceeds the maximum limit of 25 MB." },
        { status: 400 }
      );
    }

    const originalName = file.name || `${docType}.pdf`;
    const extension = path.extname(originalName).toLowerCase();

    if (extension !== ".pdf" && file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF documents (.pdf) are allowed for Project Proposals and Reports.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Primary Storage: Cloudinary CDN (raw resource type for PDF)
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name" &&
      process.env.CLOUDINARY_API_KEY
    ) {
      try {
        const sanitizedBase = path
          .basename(originalName, extension)
          .replace(/[^a-zA-Z0-9-_]/g, "_")
          .slice(0, 35);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `rotaract_sltc/project_docs/${docType}`,
                resource_type: "raw",
                public_id: `${Date.now()}_${sanitizedBase}.pdf`,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          fileName: originalName,
          fileSize: file.size,
          provider: "cloudinary",
        });
      } catch (cloudErr) {
        console.warn("Cloudinary project doc upload failed, falling back to local disk:", cloudErr.message);
      }
    }

    // 2. Fallback Storage: Local Disk
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "project_docs");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);
    const fileName = `${Date.now()}_${docType}_${sanitizedBase}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);
    const publicUrl = `/uploads/project_docs/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: file.size,
      provider: "local",
    });
  } catch (error) {
    console.error("Upload error in /api/upload/project-doc:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload project document." },
      { status: 500 }
    );
  }
}
