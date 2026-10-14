"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, FileText, ClipboardList, Eye, PlusCircle, CalendarDays, Clock, ArrowRight, BookOpen, Activity } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { reportService } from "../services/reportService";
import { assessmentService } from "../services/assessmentService";
import { appointmentService } from "../services/appointmentService";
import { formatAppointmentTime, getTypeStyle, getStatusStyle, getTypeLabel } from "../utils/appointmentHelpers";

export default function StaffDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  const [publishedCount, setPublishedCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [todayApts, setTodayApts] = useState([]);

  useEffect(() => {
    Promise.all([
      reportService.getAllPublished(),
      assessmentService.getAllThisMonth(),
      appointmentService.getToday()
    ])
      .then(([reportsData, assessmentsData, aptsData]) => {
        if (reportsData) setPublishedCount(reportsData.length);
        if (assessmentsData) setAssessmentsCount(assessmentsData.length);
        if (aptsData) setTodayApts(aptsData);
      })
      .catch((err) => {
        console.warn("Staff dashboard fetch metrics notice:", err.message);
      });
  }, []);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const recentChildren = (childrenList || []).slice(-4).reverse();
  const totalChildrenCount = (childrenList || []).length;

  const getProfileVariant = (profile) => {
    switch (profile) {
      case "A": return "purple";
      case "B": return "blue";
      case "C": return "amber";
      case "D": return "teal";
      case "E": return "coral";
      default: return "blue-soft";
    }
  };

  return (
    <div className="space-y-8 text-slate-800 pb-10">
      
      {/* ─── Gradient Welcome Banner ─── */}
      <div className="relative bg-white rounded-3xl border border-white shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Good morning, <span className="gradient-text-blue">{user?.name || "Clinician"}</span>
          </h2>
          <p className="text-xs sm:text-[14px] font-semibold text-slate-500">{todayStr}</p>
        </div>
      </div>

      {/* ─── Dynamic Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        <StatCard
          title={user?.role === "admin" ? "Total Children" : "My Assigned Children"}
          value={totalChildrenCount}
          icon={Users}
          color="#2563EB"
        />
        <StatCard title="Reports Published" value={publishedCount} icon={FileText} color="#059669" />
        <StatCard title="Assessments (Month)" value={assessmentsCount} icon={ClipboardList} color="#7C3AED" />
      </div>

      {/* ─── TWO MAIN CLINICAL MODULES ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* IEP Module Card */}
        <div
          onClick={() => navigate("/iep")}
          className="group relative bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-8 flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-violet" />
          <div className="absolute -bottom-8 -right-8 text-violet-500/5 group-hover:text-violet-500/10 transition-colors pointer-events-none">
            <BookOpen className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-6 flex-1">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-violet text-white flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">IEP Program</h3>
              <p className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mt-1">Assessment &amp; Milestones</p>
            </div>

            <p className="text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
              Conduct IEP assessments, generate structured 3-month progress reports, and track competency growth over time.
            </p>
          </div>

          <div className="relative z-10 pt-5 sm:pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-violet-600 font-bold">
            <span className="text-sm sm:text-base">Open IEP Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Therapy Module Card */}
        <div
          onClick={() => navigate("/therapy")}
          className="group relative bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(5,150,105,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-8 flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-emerald" />
          <div className="absolute -bottom-8 -right-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none">
            <Activity className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-6 flex-1">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-emerald text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Therapy Pathways</h3>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Intervention &amp; Exercises</p>
            </div>

            <p className="text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
              Manage clinical tracks, assign daily home exercise regimens, and review parent progress logs.
            </p>
          </div>

          <div className="relative z-10 pt-5 sm:pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold">
            <span className="text-sm sm:text-base">Open Therapy Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-blue-400 group cursor-pointer" padding="p-0">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">Register New Child</h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1">Enroll a new patient into the system.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button onClick={() => navigate("/children/new")} fullWidth>
              Register Child
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-emerald-400 group cursor-pointer" padding="p-0">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">New Assessment</h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1">Start a fresh evaluation for a child.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate("/children")} fullWidth>
              Start Assessment
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-violet-400 group cursor-pointer" padding="p-0">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">View Directory</h3>
              <p className="text-[12px] text-slate-500 font-medium mt-1">Browse all registered children and files.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button variant="outlined" onClick={() => navigate("/children")} fullWidth className="group-hover:border-violet-300 group-hover:text-violet-700">
              View Children
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* ─── RECENTLY REGISTERED (2/3 width) ─── */}
        <div className="lg:col-span-2 space-y-4 overflow-hidden relative">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">
              {user?.role === "admin" ? "Recently Enrolled Children" : "My Assigned Students"}
            </h3>
            <div className="text-[12px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {recentChildren.length} {user?.role === "admin" ? "Enrolled" : "In Care Roster"}
            </div>
          </div>

          {recentChildren.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50 border-dashed">
              <p className="text-[14px] font-semibold text-slate-500 mb-4">
                {user?.role === "admin"
                  ? "No children registered yet."
                  : "No children are currently assigned to your care roster. Profiles will appear here when assigned by the administrator or when you perform an assessment."}
              </p>
              {user?.role === "admin" && (
                <Button icon={PlusCircle} onClick={() => navigate("/children/new")}>
                  Register First Child
                </Button>
              )}
            </Card>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden py-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
              {/* Duplicate the array to create a seamless loop */}
              <div className="animate-marquee flex gap-4">
                {[...recentChildren, ...recentChildren, ...recentChildren, ...recentChildren].map((c, i) => {
                  // Fallback for timestamp formatting
                  const regDate = c.registered_date 
                    ? new Date(c.registered_date).toLocaleDateString() 
                    : (c.created_at ? new Date(c.created_at).toLocaleDateString() : "Today");

                  return (
                    <div key={`${c.id}-${i}`} className="w-[280px] shrink-0">
                      <Card padding="p-5" accent="blue" className="group flex flex-col justify-between cursor-pointer hover:border-blue-300 h-full">
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[15px] font-bold text-slate-900 truncate pr-2">{c.name}</h4>
                            <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} size="sm" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-[12px] text-slate-500 font-medium">{c.age} yrs • {c.diagnosis}</p>
                            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">ID: {c.id}</p>
                            
                            {/* Attendance / Entry Timestamp */}
                            <div className="flex items-center gap-1.5 mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-[11px] font-semibold text-blue-700">
                                Entered: {regDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outlined"
                          size="sm"
                          fullWidth
                          icon={Eye}
                          onClick={() => navigate(`/children/${c.id}`)}
                          className="group-hover:border-blue-300 group-hover:text-blue-700 mt-auto"
                        >
                          View Details
                        </Button>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── TODAY'S SCHEDULE (1/3 width) ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Schedule
            </h3>
            <button onClick={() => navigate("/appointments")} className="text-[12px] font-bold text-blue-600 hover:underline">
              View all
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-col gap-2 min-h-[300px]">
            {todayApts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                <CalendarDays className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-[13px] font-semibold text-slate-500">No appointments scheduled for today.</p>
              </div>
            ) : (
              todayApts.map(a => {
                const child = a.children;
                const ts = getTypeStyle(a.appointment_type);
                const ss = getStatusStyle(a.status);
                
                return (
                  <div key={a.id} className="bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 p-3 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                    <div className="shrink-0 text-center w-14 border-r border-slate-200 pr-3">
                      <p className="text-[13px] font-black text-slate-700 leading-tight">{formatAppointmentTime(a.appointment_time)}</p>
                    </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <p className="font-bold text-[13px] text-slate-900 truncate">{child?.name || "Child"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ts.bg === '#F3F4F6' ? '#94A3B8' : ts.border }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ts.bg === '#F3F4F6' ? '#64748B' : ts.text }}>
                          {getTypeLabel(a.appointment_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
