import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import NotificationSubscriber from "@/models/NotificationSubscriber";
import webpush from "@/lib/webPush";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, subscription, email, test } = body;

    if (!type || !["push", "email"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Valid subscription type ('push' or 'email') is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    if (type === "push") {
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return NextResponse.json(
          { success: false, error: "Invalid PushSubscription payload." },
          { status: 400 }
        );
      }

      const { endpoint, keys } = subscription;

      // Upsert subscriber in database
      const subscriber = await NotificationSubscriber.findOneAndUpdate(
        { endpoint },
        {
          type: "push",
          endpoint,
          keys,
          active: true,
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Optional test notification immediately on subscribe
      if (test) {
        try {
          const payload = JSON.stringify({
            title: "Notifications Enabled!",
            body: "You'll now receive reminder alerts 1 day before upcoming Rotaract SLTC events.",
            url: "/#upcoming-events",
          });
          await webpush.sendNotification(
            {
              endpoint,
              keys,
            },
            payload
          );
        } catch (pushErr) {
          console.warn("Test push failed:", pushErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to browser push reminders!",
        subscriberId: subscriber._id,
      });
    }

    if (type === "email") {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      const cleanEmail = email.trim().toLowerCase();

      const subscriber = await NotificationSubscriber.findOneAndUpdate(
        { email: cleanEmail },
        {
          type: "email",
          email: cleanEmail,
          active: true,
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send confirmation email via nodemailer if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Rotaract Club of SLTC" <${process.env.SMTP_USER}>`,
            to: cleanEmail,
            subject: "Rotaract Club of SLTC - Event Reminders Activated",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0c1017; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #e6007e; margin: 0; font-size: 24px; font-weight: 800;">ROTARACT CLUB OF SLTC</h2>
                  <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">SLTC Research University, Padukka</p>
                </div>
                <div style="background-color: #161f2e; padding: 20px; border-radius: 12px; border: 1px solid #334155;">
                  <h3 style="color: #38bdf8; margin-top: 0;">Event Reminders Activated!</h3>
                  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                    You are now subscribed to receive email notifications <strong>1 day prior</strong> to all upcoming Rotaract events, community drives, and university initiatives.
                  </p>
                  <p style="font-size: 13px; color: #94a3b8;">
                    Stay tuned for inspiring youth leadership opportunities and impactful projects.
                  </p>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#upcoming-events" style="background-color: #e6007e; color: #ffffff; padding: 10px 24px; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 8px; display: inline-block;">
                    View Upcoming Events
                  </a>
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.warn("Confirmation email error:", mailErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed for email reminders!",
        subscriberId: subscriber._id,
      });
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process subscription." },
      { status: 500 }
    );
  }
}
