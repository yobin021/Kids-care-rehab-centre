"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { PlusCircle, Calendar as CalendarIcon, Clock, CheckCircle2, X } from "lucide-react";

export default function AppointmentBooking() {
  const { children, appointments, bookAppointment } = useDashboard();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || "");
  const [type, setType] = useState<"Assessment" | "Review" | "Therapy">("Therapy");
  const [therapist, setTherapist] = useState<"Priya" | "Meena">("Priya");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00 AM");
  const [confirmed, setConfirmed] = useState(true);
  const [notes, setNotes] = useState("");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) return;

    bookAppointment({
      childId: child.id,
      childName: child.name,
      therapist,
      date,
      time,
      type,
      confirmed,
      notes
    });

    setShowModal(false);
  };

  // Timeline slots
  const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C2C2A]">Appointment Booking & Schedule</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Manage clinic bookings, calendar slots, and daily timeline.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Book New Appointment</span>
        </button>
      </div>

      {/* Two Column Grid: Left Monthly Calendar, Right Today's Schedule Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Monthly Calendar View (Span 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A] flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#185FA5]" />
              <span>July 2026</span>
            </h3>
            <span className="text-xs font-bold text-[#185FA5]">Monthly View</span>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-[#5F5E5A] uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasAppt = day === 20 || day === 22 || day === 24 || day === 25 || day === 27;
              const isToday = day === 27;

              return (
                <div
                  key={day}
                  className={`p-2.5 rounded-[8px] border flex flex-col items-center justify-between min-h-[46px] transition-all ${
                    isToday
                      ? "bg-[#185FA5] text-white border-[#185FA5]"
                      : "bg-[#F8F8F6] text-[#2C2C2A] border-[#D3D1C7]/60 hover:bg-slate-200"
                  }`}
                >
                  <span>{day}</span>
                  {hasAppt && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white" : "bg-[#185FA5]"}`} />
                      <span className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-emerald-300" : "bg-[#0F6E56]"}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#D3D1C7]/40 flex items-center justify-center gap-4 text-[11px] font-bold text-[#5F5E5A]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#185FA5]" /> Assessment</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0F6E56]" /> Therapy</span>
          </div>
        </div>

        {/* RIGHT PANEL: Today's Schedule Timeline (Span 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Today&apos;s Schedule Timeline (27 Jul 2026)</h3>
            <span className="text-xs font-bold text-[#0F6E56] bg-emerald-50 px-2.5 py-1 rounded-full">
              {appointments.length} Appointments Booked
            </span>
          </div>

          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const matched = appointments.find((a) => a.time === slot);

              return (
                <div key={slot} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-extrabold text-[#5F5E5A] flex items-center gap-1 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {slot}
                  </span>

                  {matched ? (
                    <div className="flex-1 p-3 rounded-[8px] bg-[#185FA5]/5 border border-[#185FA5]/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#185FA5]">{matched.childName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#185FA5]">
                            {matched.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#5F5E5A] mt-0.5">
                          Therapist: {matched.therapist}
                        </p>
                      </div>

                      <span className="text-[10px] font-extrabold px-2 py-1 rounded bg-[#3B6D11]/10 text-[#3B6D11]">
                        Confirmed
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 p-2.5 rounded-[8px] bg-[#F8F8F6] border border-dashed border-[#D3D1C7] text-xs font-semibold text-slate-400 flex items-center justify-between">
                      <span>Available Slot</span>
                      <button
                        onClick={() => {
                          setTime(slot);
                          setShowModal(true);
                        }}
                        className="text-[11px] font-bold text-[#185FA5] hover:underline cursor-pointer"
                      >
                        + Book Slot
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* BOOKING MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] p-6 max-w-md w-full border border-[#D3D1C7] shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
              <h3 className="text-base font-extrabold text-[#185FA5]">Book New Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Select Child</label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-bold text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5]"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Appointment Type</label>
                <div className="flex items-center gap-4">
                  {(["Assessment", "Review", "Therapy"] as const).map((t) => (
                    <label key={t} className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="apptType"
                        checked={type === t}
                        onChange={() => setType(t)}
                        className="accent-[#185FA5]"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Assigned Therapist</label>
                <select
                  value={therapist}
                  onChange={(e) => setTherapist(e.target.value as any)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-bold text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5]"
                >
                  <option value="Priya">Priya (Senior Therapist)</option>
                  <option value="Meena">Meena (Occupational Therapist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C2C2A] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-semibold text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C2C2A] mb-1">Time Slot</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-bold text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5]"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Parent Confirmation</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmed(true)}
                    className={`px-3 py-1.5 rounded-[8px] font-bold border transition-colors ${
                      confirmed ? "bg-[#3B6D11] text-white border-[#3B6D11]" : "bg-white text-[#2C2C2A] border-[#D3D1C7]"
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmed(false)}
                    className={`px-3 py-1.5 rounded-[8px] font-bold border transition-colors ${
                      !confirmed ? "bg-[#854F0B] text-white border-[#854F0B]" : "bg-white text-[#2C2C2A] border-[#D3D1C7]"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions or parent requests"
                  className="w-full p-2.5 border border-[#D3D1C7] rounded-[8px] font-semibold outline-none focus:border-[#185FA5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] font-bold rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white font-bold rounded-[8px]"
                >
                  Book Appointment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
