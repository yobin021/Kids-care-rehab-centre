"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Users, ClipboardCheck, AlertTriangle, CalendarDays, Activity, NotebookPen, Clock } from "lucide-react";
import { Card } from "@/components/ui/ui";

export default function TherapistOverview() {
  const { children, appointments, assessments, escalations, activeTherapistId, therapists, setActiveTab } = useDashboard();

  const therapist = therapists.find((t) => t.id === activeTherapistId);
  const myChildren = children.filter((c) => c.assignedTherapistId === activeTherapistId);
  const myAppointments = appointments.filter(
    (a) => a.therapistId === activeTherapistId && a.date === "2026-06-25" && a.status !== "Cancelled"
  );
  const myPendingAssessments = assessments.filter(
    (a) => a.therapistId === activeTherapistId && a.status === "Pending Review"
  );
  const myActiveEscalations = escalations.filter(
    (e) => e.therapistId === activeTherapistId && e.status === "Open"
  );

  return (
    <div className="space-y-6">
      {/* Welcome Board */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-500/10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Therapist Workspace
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl mt-2">
            Hello, {therapist?.name || "Therapist"}
          </h2>
          <p className="text-xs text-blue-100 font-semibold max-w-lg mt-1">
            Specialization: {therapist?.specialization}. Today you have {myAppointments.length} sessions scheduled. All systems are online.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Kids</span>
            <h3 className="text-lg font-black text-slate-800">{myChildren.length} Children</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Sessions</span>
            <h3 className="text-lg font-black text-slate-800">{myAppointments.length} scheduled</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assessments Pending</span>
            <h3 className="text-lg font-black text-slate-800">{myPendingAssessments.length} files</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Escalations</span>
            <h3 className="text-lg font-black text-slate-800">{myActiveEscalations.length} cases</h3>
          </div>
        </Card>
      </div>

      {/* Appointments & Tasks Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Today's Schedule Timeline */}
        <Card className="md:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Today's Appointment Log</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Click log session to input results.</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {myAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 font-semibold">No appointments scheduled for you today.</p>
            ) : (
              myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50/50 p-3.5 border border-slate-100 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-100 text-blue-600">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{appt.childName}</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">Type: {appt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500">{appt.timeSlot}</span>
                    {appt.status === "Completed" ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        Logged
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveTab("therapist-session")}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] px-2.5 py-1.5 shadow-xs transition-colors flex items-center gap-1"
                      >
                        <NotebookPen className="h-3 w-3" />
                        Log Session
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Assigned Children Roster Widget */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">My Patient Roster</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quick lookup</p>
            </div>
            <button
              onClick={() => setActiveTab("therapist-patients")}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="flex-1 space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {myChildren.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No patients assigned yet.</p>
            ) : (
              myChildren.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveTab("therapist-patients")}
                  className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-2.5 border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate leading-none">{c.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 inline-block">
                      {c.diagnosis}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
