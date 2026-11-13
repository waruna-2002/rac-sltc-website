import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract publicId and resourceType from any Cloudinary URL
 * Example: https://res.cloudinary.com/xsdnzxhx/image/upload/v1794582061/rotaract_sltc/yfo3ts2dlkxqirvs5o80.png
 * Returns: { publicId: 'rotaract_sltc/yfo3ts2dlkxqirvs5o80', resourceType: 'image' }
 */
export function extractCloudinaryAssetInfo(url) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return null;
  }
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let afterUpload = parts[1];

    // Strip version prefix if present (e.g. v1794582061/)
    afterUpload = afterUpload.replace(/^v\d+\//, "");

    const isRaw = url.includes("/raw/upload/");
    if (isRaw) {
      return { publicId: decodeURIComponent(afterUpload), resourceType: "raw" };
    } else {
      const dotIndex = afterUpload.lastIndexOf(".");
      const publicId = dotIndex > 0 ? afterUpload.substring(0, dotIndex) : afterUpload;
      return { publicId: decodeURIComponent(publicId), resourceType: "image" };
    }
  } catch (e) {
    return null;
  }
}

/**
 * Permanently delete a single asset from Cloudinary given its URL or publicId
 */
export async function deleteCloudinaryFile(urlOrPublicId, fallbackType = "image") {
  if (!urlOrPublicId) return { success: false, reason: "empty_target" };

  let publicId = urlOrPublicId;
  let resourceType = fallbackType;

  if (typeof urlOrPublicId === "string" && urlOrPublicId.startsWith("http")) {
    const parsed = extractCloudinaryAssetInfo(urlOrPublicId);
    if (!parsed) return { success: false, reason: "not_cloudinary_url" };
    publicId = parsed.publicId;
    resourceType = parsed.resourceType;
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return { success: false, reason: "no_credentials" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });
    return { success: true, result };
  } catch (err) {
    console.warn(`[CloudinaryCleanup] Failed to delete asset ${publicId}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Batch delete multiple Cloudinary URLs or files
 */
export async function deleteCloudinaryFiles(urls, fallbackType = "image") {
  if (!Array.isArray(urls)) return [];
  const validUrls = urls.filter((u) => Boolean(u) && typeof u === "string");
  return Promise.all(validUrls.map((u) => deleteCloudinaryFile(u, fallbackType)));
}
