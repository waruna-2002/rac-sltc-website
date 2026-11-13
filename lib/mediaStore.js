"use client";

import initialMediaItems from "@/data/media.json";
import { sanitizeInput, sanitizeUrl } from "@/lib/security";

export { initialMediaItems };

const MEDIA_STORAGE_KEY = "rotaract_sltc_media_v2";

export function getStoredMedia() {
  if (typeof window === "undefined") return initialMediaItems || [];
  try {
    const data = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(initialMediaItems || []));
      return initialMediaItems || [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load media from localStorage", e);
    return initialMediaItems || [];
  }
}

export function saveStoredMedia(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("rotaract_media_updated", { detail: items }));
  } catch (e) {
    console.error("Failed to save media to localStorage", e);
  }
}

export function addMediaPost(newItem) {
  const current = getStoredMedia();
  const slug = (newItem.title || "post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const post = {
    id: `media-${Date.now()}`,
    type: newItem.type || "blog",
    title: sanitizeInput(newItem.title || ""),
    slug: slug || `media-${Date.now()}`,
    author: sanitizeInput(newItem.author || "Rotaract SLTC"),
    authorRole: sanitizeInput(newItem.authorRole || "Member"),
    authorEmail: sanitizeInput(newItem.authorEmail || ""),
    avenue: sanitizeInput(newItem.avenue || "Community Service Avenue"),
    date: sanitizeInput(newItem.date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })),
    readTime: sanitizeInput(newItem.readTime || "4 min read"),
    image: sanitizeUrl(newItem.image || "/images/projects/project1.jpg"),
    summary: sanitizeInput(newItem.summary || ""),
    content: sanitizeInput(newItem.content || ""),
    size: sanitizeInput(newItem.size || "2.5 MB"),
    issue: sanitizeInput(newItem.issue || "Official Publication"),
    fileUrl: sanitizeUrl(newItem.fileUrl || "/bulletin.pdf"),
    description: sanitizeInput(newItem.description || newItem.summary || ""),
    status: newItem.status || "pending", // Pending by default for user submissions
    createdAt: new Date().toISOString(),
  };

  const updated = [post, ...current];
  saveStoredMedia(updated);
  return updated;
}

export function updateMediaPost(id, updatedFields) {
  const current = getStoredMedia();
  const updated = current.map((item) => {
    if (item.id === id || item._id === id) {
      const sanitized = {};
      for (const [k, v] of Object.entries(updatedFields)) {
        if (k === "image" || k === "fileUrl") sanitized[k] = sanitizeUrl(v);
        else if (typeof v === "string") sanitized[k] = sanitizeInput(v);
        else sanitized[k] = v;
      }
      return { ...item, ...sanitized };
    }
    return item;
  });
  saveStoredMedia(updated);
  return updated;
}

export function updateMediaStatus(id, newStatus) {
  const current = getStoredMedia();
  const updated = current.map((item) =>
    item.id === id || item._id === id ? { ...item, status: newStatus } : item
  );
  saveStoredMedia(updated);
  return updated;
}

export function deleteMediaPost(id) {
  const current = getStoredMedia();
  const updated = current.filter((m) => m.id !== id && m._id !== id);
  saveStoredMedia(updated);
  return updated;
}
