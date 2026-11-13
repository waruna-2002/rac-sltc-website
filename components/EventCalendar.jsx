"use client";

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ExternalLink,
  Plus,
  Eye,
  CalendarCheck
} from "lucide-react";
import { getAvenueStyle, parseEventTimeSlots, getGoogleCalendarUrl } from "@/lib/calendarUtils";

export default function EventCalendar({ events = [], onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState("month"); // 'month' | 'week' | 'agenda'

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (calendarView === "month") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (calendarView === "week") {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevMonth = new Date(currentYear, currentMonth - 1, 1);
      setCurrentDate(prevMonth);
    }
  };

  const handleNext = () => {
    if (calendarView === "month") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (calendarView === "week") {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      setCurrentDate(nextMonth);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group approved events by date string (YYYY-MM-DD)
  const eventsByDate = React.useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.date) return;
      const cleanDate = ev.date.split("T")[0];
      if (!map[cleanDate]) map[cleanDate] = [];
      map[cleanDate].push(ev);
    });
    return map;
  }, [events]);

  // Month grid calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];
  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      month: currentMonth - 1,
      year: currentYear,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }
  // Next month leading days to complete grid (42 cells: 6 weeks)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      month: currentMonth + 1,
      year: currentYear,
      isCurrentMonth: false,
    });
  }

  // Week view calculation
  const weekDays = React.useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = (startOfWeek.getDay() + 6) % 7; // Mon = 0
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const today = new Date();
  const isToday = (y, m, d) => {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  };

  const formatDateStr = (y, m, d) => {
    const pad = (n) => String(n).padStart(2, "0");
    const normalDate = new Date(y, m, d);
    return `${normalDate.getFullYear()}-${pad(normalDate.getMonth() + 1)}-${pad(normalDate.getDate())}`;
  };

  return (
    <div className="w-full bg-[#0c1017]/90 rounded-3xl border border-slate-800 backdrop-blur-2xl overflow-hidden shadow-2xl relative z-10">
      {/* Top Toolbar (Google Calendar style) */}
      <div className="p-4 sm:p-6 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e6007e] to-pink-500 flex items-center justify-center text-white shadow-md shadow-[#e6007e]/30">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{monthNames[currentMonth]} {currentYear}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">SLTC Official Club Calendar</p>
            </div>
          </div>

          {/* Prev, Next, Today Buttons */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-4 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="w-[1px] h-4 bg-slate-800" />
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Switcher: Month | Week | Agenda */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-1 rounded-xl self-end md:self-auto">
          <button
            type="button"
            onClick={() => setCalendarView("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              calendarView === "month"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setCalendarView("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              calendarView === "week"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setCalendarView("agenda")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              calendarView === "agenda"
                ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {calendarView === "month" && (
        <div className="w-full">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800/80 bg-slate-950/60 text-center text-xs font-bold text-slate-400 py-2.5">
            {weekDayLabels.map((lbl, idx) => (
              <div key={lbl} className={idx >= 5 ? "text-[#ff4d94]/80" : ""}>
                {lbl}
              </div>
            ))}
          </div>

          {/* 7x6 Matrix */}
          <div className="grid grid-cols-7 border-l border-t border-slate-800/60">
            {calendarDays.map((cell, idx) => {
              const dateStr = formatDateStr(cell.year, cell.month, cell.day);
              const dayEvents = eventsByDate[dateStr] || [];
              const activeToday = isToday(cell.year, cell.month, cell.day);

              return (
                <div
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 border-r border-b border-slate-800/60 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth
                      ? "bg-transparent hover:bg-slate-900/30"
                      : "bg-slate-950/40 text-slate-600"
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        activeToday
                          ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/40 font-black"
                          : cell.isCurrentMonth
                          ? "text-slate-300"
                          : "text-slate-600"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-cyan-400 font-semibold hidden sm:inline">
                        {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const style = getAvenueStyle(ev.avenue);
                      return (
                        <button
                          key={ev._id || ev.title}
                          type="button"
                          onClick={() => onSelectEvent(ev)}
                          className={`w-full text-left px-1.5 py-0.5 sm:py-1 rounded-md text-[11px] font-medium truncate flex items-center gap-1.5 border transition-all cursor-pointer ${style.bg} ${style.border} ${style.text} hover:scale-[1.02] shadow-sm`}
                          title={`${ev.title} (${ev.time || "TBD"})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.pill}`} />
                          <span className="font-bold text-[10px] shrink-0 text-white/90">
                            {ev.time ? ev.time.split("-")[0].trim() : ""}
                          </span>
                          <span className="truncate">{ev.title}</span>
                        </button>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-semibold pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW (Time slots & Period Blocks) */}
      {calendarView === "week" && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header: Week Days */}
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-3">
              {weekDays.map((d, i) => {
                const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                const dayEvents = eventsByDate[dateStr] || [];
                const active = isToday(d.getFullYear(), d.getMonth(), d.getDate());

                return (
                  <div key={i} className="px-2 border-r last:border-r-0 border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {weekDayLabels[i]}
                    </p>
                    <p
                      className={`text-lg font-black mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                        active ? "bg-[#e6007e] text-white shadow-md shadow-[#e6007e]/40" : "text-white"
                      }`}
                    >
                      {d.getDate()}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-medium">
                      {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Week Columns with Event Blocks */}
            <div className="grid grid-cols-7 min-h-[380px] border-b border-slate-800 bg-slate-950/20 divide-x divide-slate-800/80">
              {weekDays.map((d, i) => {
                const dateStr = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                const dayEvents = eventsByDate[dateStr] || [];

                return (
                  <div key={i} className="p-2 space-y-2 relative">
                    {dayEvents.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[11px] text-slate-700 italic">No events</span>
                      </div>
                    ) : (
                      dayEvents.map((ev) => {
                        const style = getAvenueStyle(ev.avenue);
                        return (
                          <div
                            key={ev._id || ev.title}
                            onClick={() => onSelectEvent(ev)}
                            className={`p-2.5 rounded-xl border ${style.bg} ${style.border} hover:border-[#e6007e] cursor-pointer transition-all hover:scale-[1.02] shadow-lg space-y-1.5`}
                          >
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white ${style.pill}`}>
                              {ev.avenue?.split(" ")[0]}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {ev.title}
                            </h4>
                            <div className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                              <Clock size={11} className="text-[#e6007e] shrink-0" />
                              <span className="truncate">{ev.time || "TBD"}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin size={11} className="text-cyan-400 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AGENDA / LIST TIMELINE VIEW */}
      {calendarView === "agenda" && (
        <div className="p-4 sm:p-6 divide-y divide-slate-800/80">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No approved upcoming events found.
            </div>
          ) : (
            events.map((ev) => {
              const style = getAvenueStyle(ev.avenue);
              const gCalUrl = getGoogleCalendarUrl(ev);

              return (
                <div
                  key={ev._id || ev.title}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-md">
                      <span className="text-[10px] font-black uppercase text-[#e6007e]">
                        {ev.date ? new Date(ev.date).toLocaleString("en-US", { month: "short" }) : "EVT"}
                      </span>
                      <span className="text-lg font-black text-white leading-none">
                        {ev.date ? new Date(ev.date).getDate() : "--"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${style.pill}`}>
                          {ev.avenue}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} className="text-[#e6007e]" />
                          {ev.time || "TBD"}
                        </span>
                      </div>
                      <h4
                        onClick={() => onSelectEvent(ev)}
                        className="text-base font-bold text-white group-hover:text-[#ff4d94] transition-colors cursor-pointer"
                      >
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin size={12} className="text-cyan-400 shrink-0" />
                        <span>{ev.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a
                      href={gCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 text-xs font-bold text-slate-300 hover:text-white transition-all inline-flex items-center gap-1.5 shadow-sm"
                      title="Add to Google Calendar"
                    >
                      <CalendarCheck size={13} className="text-cyan-400" />
                      <span>Google Cal</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(ev)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#e6007e] hover:bg-[#c4006c] text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-md shadow-[#e6007e]/30 cursor-pointer"
                    >
                      <span>Details</span>
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Calendar Bottom Legend & Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Community</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 ml-2" />
          <span>Professional</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" />
          <span>Club Service</span>
          <span className="w-2 h-2 rounded-full bg-rose-400 ml-2" />
          <span>International</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Showing verified admin-approved events with scheduled time blocks.
        </p>
      </div>
    </div>
  );
}
