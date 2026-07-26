"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  Users,
  Activity,
  CalendarDays,
  ClipboardList,
  AlertOctagon,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/ui";


export default function OverviewTab() {
  const { children, appointments, assessments, escalations, setActiveTab } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats computation
  const totalChildren = children.length;
  const activeSessions = children.filter((c) => c.status === "Active").length;
  const todayAppts = appointments.filter(
    (a) => a.date === "2026-06-25" && a.status !== "Cancelled"
  );
  const pendingReviews = assessments.filter((a) => a.status === "Pending Review").length;
  const activeEscalations = escalations.filter((e) => e.status === "Open").length;



  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 -mr-10 -mt-10" />
        <div className="absolute left-1/3 bottom-0 h-24 w-24 rounded-full bg-white/5 -mb-10" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Head Doctor Console
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back, Dr. Anand Iyer
          </h2>
          <p className="max-w-xl text-xs font-medium text-blue-100 md:text-sm">
            You have {activeEscalations} pending clinical escalations and {pendingReviews} assessments awaiting approval today. All systems are operational.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Children */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Children</span>
            <h3 className="text-xl font-black text-slate-800">{totalChildren}</h3>
          </div>
        </Card>

        {/* Active Therapy Sessions */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-100">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Cases</span>
            <h3 className="text-xl font-black text-slate-800">{activeSessions}</h3>
          </div>
        </Card>

        {/* Today's Appointments */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-100">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Appts</span>
            <h3 className="text-xl font-black text-slate-800">{todayAppts.length}</h3>
          </div>
        </Card>

        {/* Pending Reviews */}
        <Card
          onClick={() => setActiveTab("assessments")}
          className="flex items-center gap-4 relative overflow-hidden cursor-pointer group border-sky-100 hover:border-sky-300"
        >
          <div className="rounded-xl bg-sky-50 p-3 text-sky-600 transition-colors group-hover:bg-sky-100">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black text-slate-800">{pendingReviews}</h3>
              {pendingReviews > 0 && (
                <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-sky-700">
                  New
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Escalated Cases */}
        <Card
          onClick={() => setActiveTab("escalations")}
          className={`flex items-center gap-4 relative overflow-hidden cursor-pointer group border-rose-100 hover:border-rose-300 ${
            activeEscalations > 0 ? "bg-rose-50/20" : ""
          }`}
        >
          <div
            className={`rounded-xl p-3 transition-colors ${
              activeEscalations > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-rose-50 text-rose-600"
            }`}
          >
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Escalations</span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black text-slate-800">{activeEscalations}</h3>
              {activeEscalations > 0 && (
                <span className="rounded-full bg-rose-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 uppercase tracking-wider animate-bounce">
                  Urgent
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>


      {/* Schedule & Escalations Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule Widget */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Today's Appointment Log</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time attendance & check-ins</p>
            </div>
            <button
              onClick={() => setActiveTab("children")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Manage Slots
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-1">
            {todayAppts.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8 font-medium">No appointments scheduled today</p>
            ) : (
              todayAppts.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50/50 p-3.5 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-600">
                      <Clock className="h-4.5 w-4.5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{appt.childName}</h4>
                      <p className="text-[10px] font-medium text-slate-400">{appt.therapistName} ({appt.type})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500">{appt.timeSlot}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        appt.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Escalations Flag Alert List */}
        <Card className="flex flex-col border-rose-50 bg-rose-50/5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-50/40">
            <div>
              <h3 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                <AlertOctagon className="h-4.5 w-4.5 text-rose-600 animate-bounce" />
                Active Clinical Escalations
              </h3>
              <p className="text-[10px] text-rose-500 font-semibold mt-0.5">High priority cases flagged by clinical staff</p>
            </div>
            <button
              onClick={() => setActiveTab("escalations")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 transition-colors"
            >
              Go to Center
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-1">
            {escalations.filter((e) => e.status === "Open").length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8 font-medium">All clear! No open escalations.</p>
            ) : (
              escalations
                .filter((e) => e.status === "Open")
                .map((esc) => (
                  <div
                    key={esc.id}
                    className="flex flex-col gap-2 rounded-xl bg-white p-3.5 border border-rose-100 hover:border-rose-200 shadow-xs hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{esc.childName}</h4>
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-100">
                        {esc.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 italic">
                      "{esc.description}"
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50 text-[10px] font-semibold text-slate-400">
                      <span>Flagged by {esc.therapistName}</span>
                      <span>{esc.date}</span>
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
