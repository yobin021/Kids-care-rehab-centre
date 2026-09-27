"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, List, Plus, ChevronLeft, ChevronRight, X, Check, Eye, Edit3 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import { appointmentService } from "../services/appointmentService";
import { childrenService } from "../services/childrenService";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  getTypeLabel,
  getStatusLabel,
  getTypeStyle,
  getStatusStyle,
  generateTimeSlots,
  isToday,
  isPast,
  getProfileVariant
} from "../utils/appointmentHelpers";

// ─── TYPE BADGE ──────────────────────────────────────────
function TypeBadge({ type }) {
  const s = getTypeStyle(type);
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block"
      style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {getTypeLabel(type)}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = getStatusStyle(status);
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

// ─── BOOK APPOINTMENT MODAL ───────────────────────────────
export function BookAppointmentModal({ isOpen, onClose, onBooked, preselectedChildId = null, childrenList = [] }) {
  const { user, showToast } = useAuth();
  const [form, setForm] = useState({
    child_id: preselectedChildId || "",
    appointment_type: "",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "",
    duration: "60",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [childSearch, setChildSearch] = useState("");

  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split("T")[0];

  const filteredChildren = (childrenList || []).filter(c =>
    c.program_type !== "iep" && (
      childSearch === "" ||
      c.name?.toLowerCase().includes(childSearch.toLowerCase()) ||
      c.id?.toLowerCase().includes(childSearch.toLowerCase())
    )
  );

  const selectedChild = childrenList.find(c => c.id === form.child_id);

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.child_id) e.child_id = "Please select a child";
    if (!form.appointment_type) e.appointment_type = "Please select appointment type";
    if (!form.appointment_date) e.appointment_date = "Please select a date";
    if (!form.appointment_time) e.appointment_time = "Please select a time";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await appointmentService.create({
        child_id: form.child_id,
        appointment_type: form.appointment_type,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        duration_minutes: parseInt(form.duration),
        notes: form.notes || null
      }, user?.id);
      const child = childrenList.find(c => c.id === form.child_id);
      showToast(`Appointment booked for ${child?.name || "child"} on ${formatAppointmentDate(form.appointment_date)} at ${formatAppointmentTime(form.appointment_time)}`, "success");
      onClose();
      onBooked?.();
    } catch (err) {
      showToast("Failed to book appointment: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setForm({
        child_id: preselectedChildId || "",
        appointment_type: "",
        appointment_date: today,
        appointment_time: "",
        duration: "60",
        notes: ""
      });
      setErrors({});
      setChildSearch("");
    }
  }, [isOpen, preselectedChildId]);

  const types = [
    { value: "assessment", label: "📋 Assessment" },
    { value: "review", label: "🔄 Review" },
    { value: "therapy", label: "🏥 Therapy" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book New Appointment">
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">

        {/* Select Child */}
        <div className="space-y-1">
          <label className="font-bold text-[#2C2C2A] text-xs">Select Child *</label>
          {!form.child_id ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={childSearch}
                onChange={e => setChildSearch(e.target.value)}
                className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 text-xs font-semibold text-[#2C2C2A] focus:outline-none focus:border-[#185FA5]"
              />
              {childSearch && (
                <div className="border border-[#D3D1C7] rounded-[8px] max-h-48 overflow-y-auto">
                  {filteredChildren.length === 0 ? (
                    <p className="p-3 text-[#9B9A96]">No children found</p>
                  ) : (
                    filteredChildren.map(c => {
                      const ps = getProfileVariant(c.profile);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setField("child_id", c.id); setChildSearch(""); }}
                          className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[#F8F8F6] border-b border-[#D3D1C7]/60 last:border-0"
                        >
                          <div className="flex-1">
                            <span className="font-bold text-[#2C2C2A]">{c.name}</span>
                            <span className="ml-2 font-mono text-[10px] text-[#9B9A96]">{c.id?.slice(0, 8)}</span>
                          </div>
                          {c.profile && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: ps.bg, color: ps.text }}>
                              Profile {c.profile}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
              <div className="flex-1">
                <span className="font-bold text-[#2C2C2A]">{selectedChild?.name}</span>
                <span className="ml-2 font-mono text-[10px] text-[#9B9A96]">{form.child_id?.slice(0, 8)}</span>
              </div>
              <button type="button" onClick={() => setField("child_id", "")} className="text-[#9B9A96] hover:text-[#993C1D]">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {errors.child_id && <p className="text-[#993C1D] text-[11px] font-semibold">{errors.child_id}</p>}
        </div>

        {/* Appointment Type */}
        <div className="space-y-1">
          <label className="font-bold text-[#2C2C2A] text-xs">Appointment Type *</label>
          <div className="grid grid-cols-3 gap-2">
            {types.map(t => {
              const ts = getTypeStyle(t.value);
              const sel = form.appointment_type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setField("appointment_type", t.value)}
                  className="p-3 rounded-[8px] border-2 text-center font-bold text-xs transition-all cursor-pointer"
                  style={sel
                    ? { borderColor: ts.border, backgroundColor: ts.bg, color: ts.text }
                    : { borderColor: "#D3D1C7", backgroundColor: "white", color: "#5F5E5A" }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {errors.appointment_type && <p className="text-[#993C1D] text-[11px] font-semibold">{errors.appointment_type}</p>}
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-[#2C2C2A] text-xs">Date *</label>
            <input
              type="date"
              value={form.appointment_date}
              min={today}
              onChange={e => setField("appointment_date", e.target.value)}
              className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 text-xs font-semibold text-[#2C2C2A] focus:outline-none focus:border-[#185FA5]"
            />
            {errors.appointment_date && <p className="text-[#993C1D] text-[11px] font-semibold">{errors.appointment_date}</p>}
          </div>
          <div className="space-y-1">
            <label className="font-bold text-[#2C2C2A] text-xs">Time *</label>
            <select
              value={form.appointment_time}
              onChange={e => setField("appointment_time", e.target.value)}
              className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 text-xs font-semibold text-[#2C2C2A] focus:outline-none focus:border-[#185FA5]"
            >
              <option value="">Select time</option>
              {timeSlots.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.appointment_time && <p className="text-[#993C1D] text-[11px] font-semibold">{errors.appointment_time}</p>}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-1">
          <label className="font-bold text-[#2C2C2A] text-xs">Duration</label>
          <select
            value={form.duration}
            onChange={e => setField("duration", e.target.value)}
            className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 text-xs font-semibold text-[#2C2C2A] focus:outline-none focus:border-[#185FA5]"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="font-bold text-[#2C2C2A] text-xs">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => setField("notes", e.target.value)}
            rows={2}
            placeholder="Session notes or special instructions..."
            className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 text-xs font-semibold text-[#2C2C2A] focus:outline-none focus:border-[#185FA5] resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D3D1C7]">
          <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── APPOINTMENT DETAIL MODAL ─────────────────────────────
export function AppointmentDetailModal({ appointment, isOpen, onClose, onUpdated, childrenList = [] }) {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({});
  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (appointment) {
      setEditForm({
        appointment_type: appointment.appointment_type || "",
        appointment_date: appointment.appointment_date || "",
        appointment_time: appointment.appointment_time || "",
        duration_minutes: String(appointment.duration_minutes || 60),
        notes: appointment.notes || ""
      });
      setIsEditing(false);
      setShowCancelForm(false);
      setShowDoneConfirm(false);
      setCancelReason("");
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const child = appointment.children || childrenList.find(c => c.id === appointment.child_id);
  const canComplete = appointment.status === "upcoming" && (isToday(appointment.appointment_date) || isPast(appointment.appointment_date));
  const canCancel = appointment.status === "upcoming";

  async function handleMarkDone() {
    setLoading(true);
    try {
      await appointmentService.updateStatus(appointment.id, "completed");
      showToast("Appointment marked as completed", "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      showToast("Failed to update: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await appointmentService.updateStatus(appointment.id, "cancelled", cancelReason || null);
      showToast("Appointment cancelled", "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      showToast("Failed to cancel: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await appointmentService.update(appointment.id, {
        ...editForm,
        duration_minutes: parseInt(editForm.duration_minutes)
      });
      showToast("Appointment updated", "success");
      setIsEditing(false);
      onUpdated?.();
    } catch (err) {
      showToast("Failed to save: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const ps = getProfileVariant(child?.profile);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="space-y-5 text-xs">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-[18px] font-bold text-[#2C2C2A]">{child?.name || "Child"}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-[#9B9A96] bg-[#F8F8F6] px-2 py-0.5 rounded">{appointment.child_id?.slice(0, 8)}</span>
                {child?.profile && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: ps.bg, color: ps.text }}>
                    Profile {child.profile}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          {/* Details */}
          {!isEditing ? (
            <div className="bg-[#F8F8F6] rounded-[12px] p-4 space-y-3">
              <h4 className="font-bold text-[#9B9A96] uppercase text-[10px] tracking-wider">Appointment Details</h4>
              {[
                ["Type", <TypeBadge key="t" type={appointment.appointment_type} />],
                ["Date", formatAppointmentDate(appointment.appointment_date)],
                ["Time", formatAppointmentTime(appointment.appointment_time)],
                ["Duration", `${appointment.duration_minutes || 60} minutes`],
                ["Notes", appointment.notes || <span className="text-[#9B9A96]">No notes</span>],
                ["Booked by", appointment.created_by_name || "Staff"],
                ["Booked on", appointment.created_at?.split("T")[0] || "—"]
              ].map(([label, value], i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#9B9A96] font-bold w-20 shrink-0">{label}</span>
                  <span className="font-semibold text-[#2C2C2A] flex-1">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2A]">Type</label>
                <select value={editForm.appointment_type} onChange={e => setEditForm(f => ({ ...f, appointment_type: e.target.value }))}
                  className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 focus:outline-none focus:border-[#185FA5]">
                  <option value="assessment">Assessment</option>
                  <option value="review">Review</option>
                  <option value="therapy">Therapy</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#2C2C2A]">Date</label>
                  <input type="date" value={editForm.appointment_date} onChange={e => setEditForm(f => ({ ...f, appointment_date: e.target.value }))}
                    className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 focus:outline-none focus:border-[#185FA5]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#2C2C2A]">Time</label>
                  <select value={editForm.appointment_time} onChange={e => setEditForm(f => ({ ...f, appointment_time: e.target.value }))}
                    className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 focus:outline-none focus:border-[#185FA5]">
                    {timeSlots.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2A]">Duration</label>
                <select value={editForm.duration_minutes} onChange={e => setEditForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 focus:outline-none focus:border-[#185FA5]">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2A]">Notes</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full border border-[#D3D1C7] rounded-[8px] px-3 py-2.5 resize-none focus:outline-none focus:border-[#185FA5]" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {/* Actions */}
          {appointment.status === "upcoming" && !isEditing && !showCancelForm && !showDoneConfirm && (
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outlined" icon={Edit3} onClick={() => setIsEditing(true)}>Edit Appointment</Button>
              {(canComplete || canCancel) && (
                <div className="grid grid-cols-2 gap-2">
                  {canComplete && (
                    <button onClick={() => setShowDoneConfirm(true)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border-2 border-[#3B6D11] text-[#3B6D11] font-bold text-xs hover:bg-[#EAF3DE] transition-colors cursor-pointer">
                      <Check className="h-4 w-4" /> Mark Done
                    </button>
                  )}
                  {canCancel && (
                    <button onClick={() => setShowCancelForm(true)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border-2 border-[#993C1D] text-[#993C1D] font-bold text-xs hover:bg-[#FAECE7] transition-colors cursor-pointer">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {showDoneConfirm && (
            <div className="bg-[#EAF3DE] border border-[#3B6D11]/30 rounded-[8px] p-4 space-y-3">
              <p className="font-bold text-[#27500A]">Mark this appointment as completed?</p>
              <div className="flex gap-2">
                <Button onClick={handleMarkDone} disabled={loading}>{loading ? "Updating..." : "Yes, Mark Done"}</Button>
                <Button variant="outlined" onClick={() => setShowDoneConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {showCancelForm && (
            <div className="bg-[#FAECE7] border border-[#993C1D]/30 rounded-[8px] p-4 space-y-3">
              <p className="font-bold text-[#712B13]">Cancel Appointment</p>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={2}
                placeholder="Reason for cancellation (optional)..."
                className="w-full border border-[#993C1D]/30 rounded-[8px] px-3 py-2 text-xs bg-white resize-none focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleCancel} disabled={loading}
                  className="px-4 py-2 bg-[#993C1D] text-white rounded-[8px] font-bold text-xs cursor-pointer hover:bg-[#7a2f15] transition-colors">
                  {loading ? "Cancelling..." : "Cancel Appointment"}
                </button>
                <Button variant="outlined" onClick={() => setShowCancelForm(false)}>Back</Button>
              </div>
            </div>
          )}

          {appointment.status === "completed" && (
            <div className="bg-[#EAF3DE] border border-[#3B6D11]/30 rounded-[8px] p-4">
              <p className="font-bold text-[#27500A]">✅ This appointment was completed</p>
            </div>
          )}

          {appointment.status === "cancelled" && (
            <div className="bg-[#FAECE7] border border-[#993C1D]/30 rounded-[8px] p-4 space-y-2">
              <p className="font-bold text-[#712B13]">❌ This appointment was cancelled</p>
              {appointment.cancelled_reason && (
                <p className="text-[#712B13] text-[11px]">Reason: {appointment.cancelled_reason}</p>
              )}
              <Button size="sm" onClick={() => { onClose(); setBookModalOpen(true); }}>
                Book New Appointment
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>

      <BookAppointmentModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onBooked={() => onUpdated?.()}
        preselectedChildId={appointment.child_id}
        childrenList={childrenList}
      />
    </>
  );
}

// ─── MAIN APPOINTMENTS PAGE ───────────────────────────────
export default function AppointmentsPage() {
  const { user, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [view, setView] = useState("list");
  const [filterDate, setFilterDate] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [calSelectedDay, setCalSelectedDay] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [apts, kids] = await Promise.all([
        appointmentService.getAll(),
        childrenService.getAll()
      ]);
      setAppointments(apts || []);
      setChildren(kids || []);
    } catch (err) {
      console.warn("Appointments load notice:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  // ── Filtering ──
  const filtered = appointments.filter(a => {
    if (filterType !== "all" && a.appointment_type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    const d = a.appointment_date;
    if (filterDate === "today") return d === today;
    if (filterDate === "upcoming") return d >= today && a.status === "upcoming";
    if (filterDate === "week") {
      const end = new Date(); end.setDate(end.getDate() + 7);
      const endStr = end.toISOString().split("T")[0];
      return d >= today && d <= endStr;
    }
    if (filterDate === "month") {
      const m = today.slice(0, 7);
      return d.startsWith(m);
    }
    return true;
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time));

  // Group by date
  const grouped = filtered.reduce((acc, a) => {
    const d = a.appointment_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});
  const groupedDates = Object.keys(grouped).sort();

  // ── Calendar helpers ──
  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonthIdx, 1).getDay();
  const aptsByDate = appointments.reduce((acc, a) => {
    if (!acc[a.appointment_date]) acc[a.appointment_date] = [];
    acc[a.appointment_date].push(a);
    return acc;
  }, {});

  const calDayApts = calSelectedDay ? (aptsByDate[calSelectedDay] || []) : [];

  function prevMonth() { setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)); }
  function nextMonth() { setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)); }

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Appointments</h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">Schedule, manage and track all therapy appointments</p>
        </div>
        <Button icon={Plus} onClick={() => setBookOpen(true)}>+ Book Appointment</Button>
      </div>

      {/* Filters + View toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-[#D3D1C7] rounded-[8px] px-3 py-2 text-xs font-bold text-[#2C2C2A] bg-white focus:outline-none focus:border-[#185FA5]">
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="upcoming">Upcoming only</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-[#D3D1C7] rounded-[8px] px-3 py-2 text-xs font-bold text-[#2C2C2A] bg-white focus:outline-none focus:border-[#185FA5]">
            <option value="all">All types</option>
            <option value="assessment">Assessment</option>
            <option value="review">Review</option>
            <option value="therapy">Therapy</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-[#D3D1C7] rounded-[8px] px-3 py-2 text-xs font-bold text-[#2C2C2A] bg-white focus:outline-none focus:border-[#185FA5]">
            <option value="all">All status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-1 border border-[#D3D1C7] rounded-[8px] p-0.5 bg-white">
          <button onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${view === "list" ? "bg-[#185FA5] text-white" : "text-[#5F5E5A] hover:bg-[#F8F8F6]"}`}>
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button onClick={() => setView("calendar")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${view === "calendar" ? "bg-[#185FA5] text-white" : "text-[#5F5E5A] hover:bg-[#F8F8F6]"}`}>
            <Calendar className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : view === "list" ? (
        groupedDates.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-12 text-center space-y-4">
            <div className="text-5xl">📅</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">No appointments found</h3>
            <p className="text-xs text-[#5F5E5A]">Adjust filters or book a new appointment</p>
            <Button icon={Plus} onClick={() => setBookOpen(true)}>+ Book Appointment</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedDates.map(date => (
              <div key={date}>
                {/* Date heading */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-bold text-[#185FA5]">{formatAppointmentDate(date)}</h3>
                  <span className="px-2 py-0.5 bg-[#E6F1FB] text-[#185FA5] text-[11px] font-bold rounded-full">
                    {grouped[date].length} appointment{grouped[date].length !== 1 ? "s" : ""}
                  </span>
                  {isToday(date) && <span className="px-2 py-0.5 bg-[#185FA5] text-white text-[11px] font-bold rounded-full">Today</span>}
                </div>
                <div className="space-y-2">
                  {grouped[date].map(a => {
                    const child = a.children || children.find(c => c.id === a.child_id);
                    const ps = getProfileVariant(child?.profile);
                    const canDone = a.status === "upcoming" && (isToday(date) || isPast(date));
                    return (
                      <div key={a.id}
                        className="bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#185FA5] transition-all flex items-center gap-4 p-4 shadow-xs">
                        {/* Time */}
                        <div className="shrink-0 w-20 text-center">
                          <p className="text-[16px] font-bold text-[#185FA5]">{formatAppointmentTime(a.appointment_time)}</p>
                          <p className="text-[11px] text-[#9B9A96] font-semibold">{a.duration_minutes || 60} min</p>
                        </div>
                        <div className="w-px h-10 bg-[#D3D1C7]/60 shrink-0" />
                        {/* Child */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#2C2C2A] truncate">{child?.name || "Child"}</p>
                          <p className="font-mono text-[11px] text-[#9B9A96]">{a.child_id?.slice(0, 8)}</p>
                        </div>
                        {child?.profile && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0" style={{ backgroundColor: ps.bg, color: ps.text }}>
                            Profile {child.profile}
                          </span>
                        )}
                        <TypeBadge type={a.appointment_type} />
                        <StatusBadge status={a.status} />
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => setSelectedApt(a)}
                            className="px-2.5 py-1.5 border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#5F5E5A] hover:bg-[#F8F8F6] cursor-pointer flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          {canDone && (
                            <button onClick={async () => {
                              try {
                                await appointmentService.updateStatus(a.id, "completed");
                                showToast("Appointment marked as completed", "success");
                                load();
                              } catch { showToast("Failed to update", "error"); }
                            }}
                              className="px-2.5 py-1.5 border border-[#3B6D11] rounded-[6px] text-xs font-bold text-[#3B6D11] hover:bg-[#EAF3DE] cursor-pointer flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Done
                            </button>
                          )}
                          {a.status === "upcoming" && (
                            <button onClick={() => { setSelectedApt(a); }}
                              className="px-2.5 py-1.5 border border-[#993C1D] rounded-[6px] text-xs font-bold text-[#993C1D] hover:bg-[#FAECE7] cursor-pointer flex items-center gap-1">
                              <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-[8px] border border-[#D3D1C7] hover:bg-[#F8F8F6] cursor-pointer">
              <ChevronLeft className="h-4 w-4 text-[#5F5E5A]" />
            </button>
            <h3 className="text-sm font-bold text-[#2C2C2A]">
              {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-[8px] border border-[#D3D1C7] hover:bg-[#F8F8F6] cursor-pointer">
              <ChevronRight className="h-4 w-4 text-[#5F5E5A]" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-[#9B9A96] py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayApts = aptsByDate[dateStr] || [];
              const isSelected = calSelectedDay === dateStr;
              const isTodayDay = dateStr === today;
              return (
                <button key={dayNum} onClick={() => setCalSelectedDay(isSelected ? null : dateStr)}
                  className={`relative min-h-[48px] p-1.5 rounded-[8px] border text-xs font-bold cursor-pointer transition-all text-left ${isSelected ? "border-[#185FA5] bg-[#E6F1FB]" : isTodayDay ? "border-[#185FA5] bg-white" : "border-transparent hover:border-[#D3D1C7] hover:bg-[#F8F8F6]"}`}>
                  <span className={`block text-center mb-1 ${isTodayDay ? "text-[#185FA5]" : "text-[#2C2C2A]"}`}>{dayNum}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayApts.slice(0, 3).map((a, idx) => {
                      const ts = getTypeStyle(a.appointment_type);
                      return <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: ts.text }} />;
                    })}
                    {dayApts.length > 3 && <span className="text-[9px] text-[#9B9A96]">+{dayApts.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {calSelectedDay && (
            <div className="border-t border-[#D3D1C7] pt-4 space-y-2">
              <h4 className="text-sm font-bold text-[#2C2C2A]">{formatAppointmentDate(calSelectedDay)}</h4>
              {calDayApts.length === 0 ? (
                <p className="text-xs text-[#9B9A96] font-semibold">No appointments on this day</p>
              ) : (
                calDayApts.map(a => {
                  const child = a.children || children.find(c => c.id === a.child_id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-[#F8F8F6] rounded-[8px] hover:bg-[#E6F1FB] transition-colors cursor-pointer"
                      onClick={() => setSelectedApt(a)}>
                      <span className="font-bold text-[#185FA5] text-xs w-16 shrink-0">{formatAppointmentTime(a.appointment_time)}</span>
                      <span className="font-bold text-xs text-[#2C2C2A] flex-1">{child?.name || "Child"}</span>
                      <TypeBadge type={a.appointment_type} />
                      <StatusBadge status={a.status} />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BookAppointmentModal isOpen={bookOpen} onClose={() => setBookOpen(false)} onBooked={load} childrenList={children} />
      <AppointmentDetailModal appointment={selectedApt} isOpen={!!selectedApt} onClose={() => setSelectedApt(null)} onUpdated={load} childrenList={children} />
    </div>
  );
}
