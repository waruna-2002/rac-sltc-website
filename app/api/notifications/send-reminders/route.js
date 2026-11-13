import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import NotificationSubscriber from "@/models/NotificationSubscriber";
import webpush from "@/lib/webPush";
import nodemailer from "nodemailer";
import { getSession } from "@/lib/serverAuth";

export async function POST(request) {
  try {
    const session = await getSession(request);
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Check authorization: Admin session OR Bearer cron secret
    const isAuthorized =
      (session?.authenticated && (session.role === "super_admin" || session.role === "project_editor")) ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to reminder dispatcher." },
        { status: 401 }
      );
    }

    await dbConnect();

    // 1. Calculate time window: Events occurring tomorrow or within the next 48 hours
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find upcoming approved events happening today or tomorrow
    const upcomingEvents = await Event.find({
      approvalStatus: { $in: ["approved", null] },
      status: "upcoming",
      date: { $gte: todayStr, $lte: tomorrowStr },
    }).sort({ date: 1 });

    if (upcomingEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events scheduled for the next 24-48 hours. No reminders dispatched.",
        eventsChecked: 0,
        dispatched: { push: 0, email: 0 },
      });
    }

    // 2. Fetch active subscribers
    const subscribers = await NotificationSubscriber.find({ active: true });

    let pushSuccess = 0;
    let pushFailed = 0;
    let emailSuccess = 0;
    let emailFailed = 0;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Prepare transporter for email reminders
    let transporter = null;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Loop through upcoming events to notify
    for (const ev of upcomingEvents) {
      const isTomorrow = ev.date === tomorrowStr;
      const timingLabel = isTomorrow ? "Tomorrow" : "Today";

      const pushPayload = JSON.stringify({
        title: `Reminder: ${ev.title}`,
        body: `Happening ${timingLabel} at ${ev.time || "TBD"} (${ev.location}). Tap to view details and register!`,
        url: `/#upcoming-events`,
        icon: ev.image || "/images/rotaract-sltc-clean-logo.png",
      });

      // Send to Push Subscribers
      for (const sub of subscribers.filter((s) => s.type === "push")) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            pushPayload
          );
          pushSuccess++;
        } catch (err) {
          pushFailed++;
          // If endpoint has expired or unsubscribed, mark as inactive
          if (err.statusCode === 410 || err.statusCode === 404) {
            await NotificationSubscriber.findByIdAndUpdate(sub._id, { active: false });
          }
        }
      }

      // Send to Email Subscribers
      if (transporter) {
        for (const sub of subscribers.filter((s) => s.type === "email" && s.email)) {
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"Rotaract Club of SLTC" <${process.env.SMTP_USER}>`,
              to: sub.email,
              subject: `📅 Reminder: ${ev.title} is happening ${timingLabel}!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0c1017; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background-color: #e6007e; color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                      ${ev.avenue || "Rotaract Event"}
                    </span>
                    <h2 style="color: #ffffff; margin: 12px 0 4px; font-size: 22px;">${ev.title}</h2>
                    <p style="color: #38bdf8; font-size: 14px; margin: 0;">${ev.subtitle || ""}</p>
                  </div>

                  <div style="background-color: #161f2e; padding: 18px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155;">
                    <p style="margin: 6px 0; font-size: 14px; color: #cbd5e1;">📅 <strong>Date:</strong> ${ev.date} (${timingLabel})</p>
                    <p style="margin: 6px 0; font-size: 14px; color: #cbd5e1;">⏰ <strong>Time:</strong> ${ev.time || "TBD"}</p>
                    <p style="margin: 6px 0; font-size: 14px; color: #cbd5e1;">📍 <strong>Location:</strong> ${ev.location}</p>
                  </div>

                  <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px;">
                    ${ev.description}
                  </p>

                  <div style="text-align: center;">
                    <a href="${appUrl}/#upcoming-events" style="background-color: #e6007e; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 10px; display: inline-block;">
                      View Details &amp; RSVP
                    </a>
                  </div>
                </div>
              `,
            });
            emailSuccess++;
          } catch (mErr) {
            emailFailed++;
            console.error("Email reminder error for:", sub.email, mErr.message);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispatched reminders for ${upcomingEvents.length} event(s).`,
      events: upcomingEvents.map((e) => ({ id: e._id, title: e.title, date: e.date })),
      dispatched: {
        pushSuccess,
        pushFailed,
        emailSuccess,
        emailFailed,
      },
    });
  } catch (error) {
    console.error("Reminders execution failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch reminders." },
      { status: 500 }
    );
  }
}
