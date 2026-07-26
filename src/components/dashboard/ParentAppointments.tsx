"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, Badge, Dialog, Select } from "@/components/ui/ui";
import {
  Calendar,
  Clock,
  User,
  Plus,
  ChevronRight,
  Activity,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

export default function ParentAppointments() {
  const {
    appointments,
    children,
    activeChildId,
    therapists,
    bookAppointment,
  } = useDashboard();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    timeSlot: "10:30 AM",
    therapistId: therapists[0]?.id || "",
    type: "Therapy" as "Therapy" | "Review" | "Assessment",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const child = children.find((c) => c.id === activeChildId) || children[0];

  if (!child) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100 animate-in fade-in duration-300">
        <p className="text-sm font-semibold text-slate-400">No registered child found in this account.</p>
      </div>
    );
  }

  // Filter child-specific appointments
  const childAppointments = appointments.filter((a) => a.childId === child.id);
  
  // Split into upcoming and past
  const upcoming = childAppointments
    .filter((a) => a.status === "Confirmed" || a.status === "Pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const past = childAppointments
    .filter((a) => a.status === "Completed" || a.status === "Cancelled")
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTherapist = therapists.find((t) => t.id === formData.therapistId);
    if (!selectedTherapist) return;

    bookAppointment({
      childId: child.id,
      childName: child.name,
      therapistId: selectedTherapist.id,
      therapistName: selectedTherapist.name,
      timeSlot: formData.timeSlot,
      date: formData.date,
      type: formData.type,
    });

    setSuccessMessage("Appointment requested successfully and automatically confirmed!");
    setTimeout(() => {
      setSuccessMessage("");
      setBookingOpen(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "Confirmed":
        return <Badge variant="primary">Confirmed</Badge>;
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Therapy Schedule</h1>
          <p className="text-sm font-semibold text-slate-500">
            Keep track of {child.name}&apos;s therapy hours, assessment reviews, and consultations.
          </p>
        </div>
        <button
          onClick={() => setBookingOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Request Appointment
        </button>
      </div>

      {/* Roster splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming sessions */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Upcoming Appointments ({upcoming.length})
            </h3>

            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <Card
                    key={appt.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:border-blue-100 border-l-4 border-l-blue-600 transition-all"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Activity className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">
                          {appt.type} Session
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-bold mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {appt.timeSlot}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {appt.therapistName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start border-t border-slate-50 sm:border-t-0 pt-3 sm:pt-0">
                      <span className="text-xs font-extrabold text-slate-700">
                        📅 {appt.date}
                      </span>
                      {getStatusBadge(appt.status)}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 stroke-1 mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No upcoming visits.</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Book a speech, motor, or assessment session using the Request button.
                </p>
              </Card>
            )}
          </div>

          {/* Past sessions */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Completed & Past Sessions ({past.length})
            </h3>

            {past.length > 0 ? (
              <div className="space-y-3">
                {past.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        ✓
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-800">
                          {appt.type} Session - {appt.therapistName}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {appt.date} @ {appt.timeSlot}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 italic">No past sessions on file.</p>
            )}
          </div>
        </div>

        {/* Right 1 Column: Calendar schedule mock */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-extrabold text-slate-800">Center Schedule Hours</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Kids Care Rehab Centre is open for active sessions during the following hours:
            </p>

            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span>Monday - Friday</span>
                <span className="text-blue-700">08:00 AM - 06:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span>Saturday</span>
                <span className="text-blue-700">09:00 AM - 02:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-slate-400">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
            
            <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-50/40 text-[11px] text-blue-800 leading-relaxed font-semibold">
              ⚠️ In case of rescheduling requests, please reach out at least 24 hours prior via WhatsApp.
            </div>
          </Card>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Dialog isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Request Therapy Session" maxWidth="md">
        {successMessage ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black text-slate-800">Request Approved!</h4>
            <p className="text-xs text-slate-500 font-semibold">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleBookSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Session Type
              </label>
              <Select
                value={formData.type}
                onChange={(val) => setFormData((prev) => ({ ...prev, type: val as any }))}
                options={[
                  { label: "Therapy Session", value: "Therapy" },
                  { label: "Assessment Review", value: "Review" },
                  { label: "Initial Assessment", value: "Assessment" },
                ]}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Therapist
              </label>
              <Select
                value={formData.therapistId}
                onChange={(val) => setFormData((prev) => ({ ...prev, therapistId: val }))}
                options={therapists.map((t) => ({
                  label: `${t.name} (${t.specialization.split(" ")[0]})`,
                  value: t.id,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Time Slot
                </label>
                <Select
                  value={formData.timeSlot}
                  onChange={(val) => setFormData((prev) => ({ ...prev, timeSlot: val }))}
                  options={[
                    { label: "09:00 AM", value: "09:00 AM" },
                    { label: "10:30 AM", value: "10:30 AM" },
                    { label: "11:30 AM", value: "11:30 AM" },
                    { label: "01:30 PM", value: "01:30 PM" },
                    { label: "03:00 PM", value: "03:00 PM" },
                    { label: "04:30 PM", value: "04:30 PM" },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Request Booking
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
