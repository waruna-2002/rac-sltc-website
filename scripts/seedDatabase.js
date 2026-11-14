import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import AdminUser from "../models/AdminUser.js";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import MediaPost from "../models/MediaPost.js";
import SiteSetting from "../models/SiteSetting.js";

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

const DEFAULT_ADMIN_EMAIL = "rotaractsltc@gmail.com";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[Error] MONGODB_URI is not defined in .env.local!");
  process.exit(1);
}

async function seedDatabase() {
  console.log("\n=======================================================");
  console.log("ROTARACT CLUB OF SLTC - MONGODB ATLAS SEEDER");
  console.log("=======================================================");
  console.log(`Connecting to: ${MONGODB_URI.replace(/:([^:@]{3,})@/, ":***@")}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[Success] Successfully connected to MongoDB Atlas!\n");

    // 1. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL || "rotaractsltc@gmail.com").toLowerCase().trim();
    const adminPasscode = process.env.ADMIN_PASSCODE || "admin123";
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const { hash, salt } = hashPassword(adminPasscode);
      await AdminUser.create({
        email: adminEmail,
        role: "super_admin",
        passwordHash: hash,
        passwordSalt: salt,
        trustedDevices: [],
      });
      console.log(`[Admin] Master Admin created: ${adminEmail}`);
    } else {
      console.log(`[Admin] Master Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Projects from projects.json
    const projectsPath = path.resolve(process.cwd(), "data/projects.json");
    if (fs.existsSync(projectsPath)) {
      const projectsData = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
      let projectCount = 0;
      for (const p of projectsData) {
        const exists = await Project.findOne({ title: p.title });
        if (!exists) {
          const generatedSlug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
          await Project.create({
            title: p.title,
            slug: generatedSlug,
            avenue: p.avenue,
            date: p.date,
            impact: p.impact,
            description: p.description,
            fullDescription: p.fullDescription || p.description,
            image: p.image || "/images/projects/project1.jpg",
            images: p.images || [p.image || "/images/projects/project1.jpg"],
            videoUrl: p.videoUrl || "",
            submittedBy: p.submittedBy || adminEmail,
            status: p.status || "approved",
          });
          projectCount++;
        }
      }
      console.log(`[Projects] Projects seeded: ${projectCount} new (Total catalog: ${projectsData.length})`);
    }

    // 3. Seed Media from media.json
    const mediaPath = path.resolve(process.cwd(), "data/media.json");
    if (fs.existsSync(mediaPath)) {
      const mediaData = JSON.parse(fs.readFileSync(mediaPath, "utf-8"));
      let mediaCount = 0;
      for (const m of mediaData) {
        const exists = await MediaPost.findOne({ title: m.title });
        if (!exists) {
          await MediaPost.create({
            title: m.title,
            slug: m.slug,
            type: m.type || "blog",
            author: m.author || "Rotaract SLTC Editorial",
            authorRole: m.authorRole || "Editorial Board",
            authorEmail: adminEmail,
            avenue: m.avenue || "Public Relations and Public Image",
            summary: m.summary || m.description || "Rotaract SLTC Official Publication",
            content: m.content || "",
            mediaUrl: m.fileUrl || m.image || "/images/projects/project1.jpg",
            thumbnailUrl: m.image || "/images/projects/project1.jpg",
            readTime: m.readTime || "4 min read",
            date: m.date || "March 2026",
            status: m.status || "approved",
          });
          mediaCount++;
        }
      }
      console.log(`[Media] Media & Articles seeded: ${mediaCount} new (Total: ${mediaData.length})`);
    }

    // 4. Seed Site Settings (Hero, About, Mission, Vision, Contact)
    const defaultSiteSettings = [
      { key: "heroTitle", value: "ROTARACT CLUB OF SLTC" },
      { key: "heroSubtitle", value: "Ignite Potential • Inspire Impact • Serve with Passion" },
      { key: "districtBadge", value: "Rotaract District 3220 • Sri Lanka & Maldives" },
      { key: "heroButtonText", value: "JOIN US NOW" },
      { key: "aboutHistory", value: "Chartered under Rotary International District 3220, the Rotaract Club of SLTC Research University has grown into one of the most vibrant youth organizations in Sri Lanka. Our members drive sustainable development, professional skill enhancement, and youth empowerment across the nation." },
      { key: "charterYear", value: "2020" },
      { key: "parentRotaryClub", value: "Rotary Club of Colombo West" },
      { key: "missionText", value: "To foster responsible youth leadership through impactful service above self." },
      { key: "visionText", value: "Building an inspired university community dedicated to social impact." },
      { key: "address", value: "SLTC Research University, Ingiriya Road, Padukka, Sri Lanka" },
      { key: "email", value: "rotaractsltc@gmail.com" },
      { key: "phone", value: "+94 77 123 4567" },
      { key: "instagramUrl", value: "https://instagram.com" },
      { key: "linkedinUrl", value: "https://linkedin.com" },
      { key: "youtubeUrl", value: "https://youtube.com" },
    ];

    let settingCount = 0;
    for (const s of defaultSiteSettings) {
      const exists = await SiteSetting.findOne({ key: s.key });
      if (!exists) {
        await SiteSetting.create({
          key: s.key,
          value: s.value,
          updatedBy: "super_admin",
        });
        settingCount++;
      }
    }
    console.log(`[Settings] Site CMS Settings seeded: ${settingCount} initialized`);

    console.log("\n=======================================================");
    console.log("[Completed] ALL SEEDING TASKS COMPLETED SUCCESSFULLY!");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("[Error] Seeding failed with error:", err);
    process.exit(1);
  }
}

seedDatabase();
