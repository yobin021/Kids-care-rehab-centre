"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  Users,
  Activity,
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/ui";

export default function OverviewTab() {
  const { children, appointments, setActiveTab } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Stats computation
  const totalChildren = children.length;
  const activeSessions = children.filter((c) => c.status === "Active").length;
  const todayAppts = appointments.filter(
    (a) => a.date === "2026-07-25" && a.status !== "Cancelled"
  );

  return (
    <div className="space-y-6.5 animate-slide-up">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 p-7 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 -mr-8 -mt-8" />
        <div className="absolute left-1/3 bottom-0 h-24 w-24 rounded-full bg-white/5 -mb-10" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Head Doctor Console
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, Dr. Anand Iyer
          </h2>
          <p className="max-w-xl text-xs font-medium text-blue-100 md:text-sm">
            All systems are operational. You have {todayAppts.length} sessions scheduled today.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Total Children */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100 shadow-[inset_0_2px_4px_rgba(59,130,246,0.05)]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Total Children</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{totalChildren}</h3>
          </div>
        </Card>

        {/* Active Therapy Cases */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition-colors group-hover:bg-emerald-100 shadow-[inset_0_2px_4px_rgba(16,185,129,0.05)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Active Cases</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{activeSessions}</h3>
          </div>
        </Card>

        {/* Today's Appointments */}
        <Card className="flex items-center gap-4 relative overflow-hidden group">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition-colors group-hover:bg-indigo-100 shadow-[inset_0_2px_4px_rgba(99,102,241,0.05)]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Today's Appts</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{todayAppts.length}</h3>
          </div>
        </Card>
      </div>

      {/* Schedule Row (Full Width) */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Today's Appointment Log</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time attendance & check-ins</p>
          </div>
          <button
            onClick={() => setActiveTab("children")}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider cursor-pointer"
          >
            Manage Slots
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="flex-1 space-y-3 max-h-96 overflow-y-auto pr-1">
          {todayAppts.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-10 font-medium">No appointments scheduled today</p>
          ) : (
            todayAppts.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-xl bg-slate-50/50 p-3.5 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-150 text-slate-650 shadow-inner">
                    <Clock className="h-4.5 w-4.5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{appt.childName}</h4>
                    <p className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{appt.therapistName} ({appt.type})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500">{appt.timeSlot}</span>
                  <Badge variant={appt.status === "Completed" ? "success" : "warning"}>
                    {appt.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
