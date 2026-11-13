/**
 * Calendar Utilities for Rotaract SLTC Website
 */

export const AVENUE_COLORS = {
  "Community Service Avenue": {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    pill: "bg-emerald-500",
    hex: "#10b981",
  },
  "Club Service Avenue": {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-400",
    pill: "bg-amber-500",
    hex: "#f59e0b",
  },
  "Professional Development Avenue": {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/40",
    text: "text-cyan-400",
    pill: "bg-cyan-500",
    hex: "#06b6d4",
  },
  "Membership Development Avenue": {
    bg: "bg-violet-500/15",
    border: "border-violet-500/40",
    text: "text-violet-400",
    pill: "bg-violet-500",
    hex: "#8b5cf6",
  },
  "International Service Avenue": {
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    text: "text-rose-400",
    pill: "bg-rose-500",
    hex: "#f43f5e",
  },
  "Public Relations and Public Image": {
    bg: "bg-fuchsia-500/15",
    border: "border-fuchsia-500/40",
    text: "text-fuchsia-400",
    pill: "bg-fuchsia-500",
    hex: "#d946ef",
  },
  "Sports and Recreational Activities": {
    bg: "bg-orange-500/15",
    border: "border-orange-500/40",
    text: "text-orange-400",
    pill: "bg-orange-500",
    hex: "#f97316",
  },
  "Environmental Service Avenue": {
    bg: "bg-teal-500/15",
    border: "border-teal-500/40",
    text: "text-teal-400",
    pill: "bg-teal-500",
    hex: "#14b8a6",
  },
  default: {
    bg: "bg-[#e6007e]/15",
    border: "border-[#e6007e]/40",
    text: "text-[#ff4d94]",
    pill: "bg-[#e6007e]",
    hex: "#e6007e",
  },
};

export function getAvenueStyle(avenue) {
  if (!avenue) return AVENUE_COLORS.default;
  for (const [key, val] of Object.entries(AVENUE_COLORS)) {
    if (key.toLowerCase() === avenue.toLowerCase() || avenue.toLowerCase().includes(key.toLowerCase().replace(" avenue", ""))) {
      return val;
    }
  }
  return AVENUE_COLORS.default;
}

/**
 * Parses time strings like "09:00 AM - 04:30 PM", "08:30 AM Onwards", or "6:00 PM"
 * Returns { startHours, startMinutes, endHours, endMinutes, durationHours }
 */
export function parseEventTimeSlots(timeString) {
  const defaultRes = {
    startHours: 9,
    startMinutes: 0,
    endHours: 13,
    endMinutes: 0,
    label: timeString || "09:00 AM - 01:00 PM",
  };

  if (!timeString || typeof timeString !== "string") return defaultRes;

  const parseSingle = (part) => {
    const match = part.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3] ? match[3].toUpperCase() : null;

    if (meridian === "PM" && h < 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;
    return { h, m };
  };

  const parts = timeString.split(/-|to/i);
  if (parts.length >= 1) {
    const start = parseSingle(parts[0]);
    if (start) {
      defaultRes.startHours = start.h;
      defaultRes.startMinutes = start.m;
      defaultRes.endHours = Math.min(start.h + 3, 23); // Default 3 hours if no end time
      defaultRes.endMinutes = start.m;
    }
  }
  if (parts.length >= 2) {
    const end = parseSingle(parts[1]);
    if (end) {
      defaultRes.endHours = end.h;
      defaultRes.endMinutes = end.m;
    }
  }

  return defaultRes;
}

/**
 * Generates direct Google Calendar "Add Event" URL
 */
export function getGoogleCalendarUrl(event) {
  if (!event) return "#";

  const { title = "Rotaract SLTC Event", description = "", location = "SLTC Research University, Padukka", date, time } = event;
  const timeSlots = parseEventTimeSlots(time);

  // Format YYYYMMDDTHHMMSS
  let startIso = "";
  let endIso = "";

  if (date) {
    const cleanDate = date.replace(/-/g, "");
    const pad = (n) => String(n).padStart(2, "0");

    const sH = pad(timeSlots.startHours);
    const sM = pad(timeSlots.startMinutes);
    const eH = pad(timeSlots.endHours);
    const eM = pad(timeSlots.endMinutes);

    startIso = `${cleanDate}T${sH}${sM}00`;
    endIso = `${cleanDate}T${eH}${eM}00`;
  }

  const details = `${description}\n\nAvenue: ${event.avenue || "Rotaract Club"}\nRSVP / More info: ${
    event.registrationLink ? event.registrationLink : "https://racsltc.org"
  }\nOrganized by Rotaract Club of SLTC`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startIso}/${endIso}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
