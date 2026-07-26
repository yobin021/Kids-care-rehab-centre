"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, Badge, Progress } from "@/components/ui/ui";
import {
  Heart,
  Calendar,
  Activity,
  Award,
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Info,
  ChevronRight,
} from "lucide-react";

export default function ParentOverview() {
  const { children, activeChildId, appointments, therapists, setActiveTab } = useDashboard();

  // Find active child (defaults to Aarav Patel)
  const child = children.find((c) => c.id === activeChildId) || children[0];

  if (!child) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100 animate-in fade-in duration-300">
        <p className="text-sm font-semibold text-slate-400">No registered child found in this account.</p>
      </div>
    );
  }

  const therapist = child.assignedTherapistId ? therapists.find((t) => t.id === child.assignedTherapistId) : undefined;

  // Find child's upcoming appointment
  const childAppointments = appointments
    .filter((a) => a.childId === child.id && a.status === "Confirmed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextAppointment = childAppointments[0];

  // Calculate home program statistics
  const exercises = child.therapyPlan?.exercises || [];
  const exerciseCount = exercises.length;

  // Calculate generic progress percentage based on session logs
  const logsCount = child.sessionLogs.length;
  const progressPercent = logsCount > 0 ? Math.min(65 + logsCount * 5, 95) : 45; // simulated progression

  // Find recent notifications for child/parent
  const recentTips = [
    "Practice the straw drinking exercise using thick mango juice to build stronger lip seal.",
    "Aarav showed excellent attention span when using visual flashcards in his last session.",
    "Try to complete the morning sensory brushing routine before heading out to play school.",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Friendly Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 h-32 w-32 rounded-full bg-indigo-500/20 blur-xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
              Parent Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Hello, {child.parentName}!
            </h1>
            <p className="text-blue-100 text-sm font-semibold max-w-md">
              Here is a summary of {child.name}&apos;s progress, therapy schedules, and home activities. Keep up the amazing work!
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 self-start md:self-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-extrabold text-lg shadow-inner">
              ⭐
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none">
                Weekly Streak
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                4 Days Active
              </div>
              <p className="text-[10px] text-blue-100 font-medium">Home exercises logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left child info and next appointments, Right metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Child Profile Info Card */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Child Profile</h2>
                <p className="text-xs text-slate-400 font-medium">Official registration details</p>
              </div>
            </div>
            <Badge variant="primary" className="text-[10px] font-extrabold uppercase">
              ID: {child.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-bold text-slate-800">{child.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth / Age</span>
                <span className="text-sm font-bold text-slate-800">{child.dob} ({child.age} years old)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnosis</span>
                <span className="inline-block mt-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold">
                  {child.diagnosis}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School Details</span>
                <span className="text-sm font-bold text-slate-800">
                  {child.schoolName} ({child.schoolClass})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Clinical Concern</span>
                <span className="text-xs font-semibold text-slate-600 block mt-0.5">{child.mainConcern}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Therapist</span>
                {therapist ? (
                  <div className="mt-1 flex items-center justify-between rounded-xl bg-blue-50/50 p-2.5 border border-blue-50/40">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{therapist.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">
                        {therapist.specialization}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${therapist.whatsapp.replace(/\+/g, "").replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors"
                      title="Contact on WhatsApp"
                    >
                      <Phone className="h-3.5 w-3.5 fill-current" />
                    </a>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-500">Not Assigned</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Highlights / Stats Panel */}
        <Card className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Therapy Progression</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Overall Progress Score</span>
                <span className="text-sm font-black text-blue-600">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-slate-100" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Based on active milestones evaluated during therapist-led physical, behavioral, and motor sessions.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-4 justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-xl font-black text-slate-800">{exerciseCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Home Exercises
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex-1">
              <div className="text-xl font-black text-slate-800">{logsCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Sessions Logged
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex-1">
              <div className="text-xl font-black text-emerald-600">
                {child.therapyPlan?.status === "Approved" ? "Approved" : "Reviewing"}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Plan Status
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointment and Home Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Next Appointment Card */}
        <Card className="space-y-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Next Session</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Up Next</span>
          </div>

          {nextAppointment ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-blue-50/40 p-4 border border-blue-50/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">
                      {nextAppointment.type} Session
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Therapist: {nextAppointment.therapistName}
                    </p>
                  </div>
                  <Badge variant="success" className="text-[10px] font-black uppercase">
                    Confirmed
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 border-t border-blue-100/40 pt-3">
                  <div>📅 {nextAppointment.date}</div>
                  <div>⏰ {nextAppointment.timeSlot}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("parent-appointments")}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View full schedule <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm font-bold text-slate-500">No upcoming appointments booked.</p>
              <button
                onClick={() => setActiveTab("parent-appointments")}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
              >
                Request Appointment
              </button>
            </div>
          )}
        </Card>

        {/* Clinical Tips & Home Advice */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Therapist Tips & Reminders
            </h3>
          </div>

          <div className="space-y-3.5">
            {recentTips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-600">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[10px] font-black text-rose-600">
                  {idx + 1}
                </div>
                <p className="font-semibold">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Navigation shortcuts (Large friendly buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab("parent-exercises")}
          className="flex items-center justify-between rounded-2xl border border-blue-50/60 bg-white p-5 text-left shadow-xs transition-all hover:scale-[1.01] hover:shadow-md group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <Activity className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Home Exercises</h4>
              <p className="text-[11px] font-bold text-slate-400">Play instructions & videos</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          onClick={() => setActiveTab("parent-progress")}
          className="flex items-center justify-between rounded-2xl border border-blue-50/60 bg-white p-5 text-left shadow-xs transition-all hover:scale-[1.01] hover:shadow-md group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <Award className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Track Progress</h4>
              <p className="text-[11px] font-bold text-slate-400">Milestones & charts</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          onClick={() => setActiveTab("parent-reports")}
          className="flex items-center justify-between rounded-2xl border border-blue-50/60 bg-white p-5 text-left shadow-xs transition-all hover:scale-[1.01] hover:shadow-md group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
              <MessageSquare className="h-5.5 w-5.5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Reports & Assessments</h4>
              <p className="text-[11px] font-bold text-slate-400">Finalized clinic documents</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}
