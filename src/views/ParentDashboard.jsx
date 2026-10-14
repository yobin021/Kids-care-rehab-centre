"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, FileText, CheckCircle2, Activity, School, Calendar, ChevronRight, BookOpen, Clock, History } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { SkeletonCard } from "../components/ui/Skeleton";
import { reportService } from "../services/reportService";
import { iepService } from "../services/iepService";
import { parentService } from "../services/parentService";
import { exerciseService } from "../services/exerciseService";
import { appointmentService } from "../services/appointmentService";
import { formatAppointmentDate, formatAppointmentTime, getTypeLabel, getTypeStyle } from "../utils/appointmentHelpers";

export default function ParentDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  // Selected child or fallback to user's registered child
  const child = childrenList.find((c) => c.id === user?.childId) || childrenList[0];
  const isIep = child?.program_type === "iep";

  const [loading, setLoading] = useState(true);
  const [reportInfo, setReportInfo] = useState(null);
  const [iepReport, setIepReport] = useState(null);
  const [allReportsList, setAllReportsList] = useState([]);
  const [exerciseStats, setExerciseStats] = useState({ completed: 0, total: 0 });
  const [nextAppointment, setNextAppointment] = useState(null);

  const fetchDashboardData = async () => {
    if (!child?.id && !user?.childId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const candidateIds = Array.from(new Set([
        child?.id,
        user?.childId,
        user?.child_id,
        child?.custom_id
      ].filter(Boolean)));

      const reportMap = new Map();

      // 1. Fetch IEP reports
      for (const cid of candidateIds) {
        try {
          const reps = await iepService.getReportsByChildId(cid);
          if (Array.isArray(reps)) {
            reps.forEach((r) => {
              if (r && r.id && (r.status === "published" || r.review_status === "published" || r.published_at || r.publishedDate)) {
                reportMap.set(r.id, r);
              }
            });
          }
        } catch (_) {}
      }

      // 2. Fetch Therapy reports
      for (const cid of candidateIds) {
        try {
          const reps = await reportService.getByChildId(cid);
          if (Array.isArray(reps)) {
            reps.forEach((r) => {
              if (r && r.id && (r.status === "published" || r.review_status === "published" || r.published_at || r.publishedDate)) {
                if (!reportMap.has(r.id)) {
                  reportMap.set(r.id, r);
                }
              }
            });
          }
        } catch (_) {}
      }

      // 3. Fallback to localStorage history and single published report
      if (typeof window !== "undefined") {
        for (const cid of candidateIds) {
          try {
            const histRaw = localStorage.getItem(`reports_history_${cid}`);
            if (histRaw) {
              const histList = JSON.parse(histRaw);
              if (Array.isArray(histList)) {
                histList.forEach((h, idx) => {
                  if (h) {
                    const hId = h.id || `local-${cid}-${idx}`;
                    if (!reportMap.has(hId)) reportMap.set(hId, { ...h, id: hId });
                  }
                });
              }
            }
            const pubRaw = localStorage.getItem(`report_published_${cid}`);
            if (pubRaw) {
              const pubObj = JSON.parse(pubRaw);
              if (pubObj) {
                const pId = pubObj.id || `local-pub-${cid}`;
                if (!reportMap.has(pId)) reportMap.set(pId, { ...pubObj, id: pId });
              }
            }
          } catch (_) {}
        }
      }

      const publishedList = Array.from(reportMap.values()).sort((a, b) => {
        const dateA = new Date(a.published_at || a.publishedDate || a.created_at || a.last_edited_at || 0).getTime();
        const dateB = new Date(b.published_at || b.publishedDate || b.created_at || b.last_edited_at || 0).getTime();
        return dateB - dateA;
      });

      setAllReportsList(publishedList);

      const latest = publishedList[0] || null;

      if (isIep) {
        setIepReport(latest);
        setReportInfo({
          hasReport: !!latest,
          status: latest?.status || latest?.review_status || (latest ? "published" : null),
          date: latest?.published_at?.split("T")[0] || latest?.publishedDate || latest?.created_at?.split("T")[0] || null,
          cycle: latest?.iep_cycle || latest?.cycle || 1,
          nextReviewDate: latest?.next_review_date || null,
          totalReports: publishedList.length
        });
      } else {
        if (latest) {
          setReportInfo({
            hasReport: true,
            status: latest.status || latest.review_status || "published",
            date: latest.published_at?.split("T")[0] || latest.publishedDate || latest.created_at?.split("T")[0] || null,
            totalReports: publishedList.length
          });
        } else {
          setReportInfo({ hasReport: false });
        }

        // Home exercises strictly from latest published report
        const homeExercises = latest
          ? (latest.home_exercises || latest.homeExercises || latest.homeEx || latest.formState?.exercises?.homeExercises || [])
          : [];

        const targetId = child?.id || user?.childId;
        const logs = targetId ? await parentService.getTodayLogs(targetId) : [];
        const completedCount = logs ? logs.filter((l) => l.is_done).length : 0;

        setExerciseStats({
          completed: completedCount,
          total: Array.isArray(homeExercises) ? homeExercises.length : 0
        });
      }

      // Fetch next upcoming appointment
      try {
        const apt = await appointmentService.getNextForChild(child.id);
        setNextAppointment(apt);
      } catch (e) {
        setNextAppointment(null);
      }
    } catch (err) {
      console.warn("Parent dashboard fetch notice:", err.message);
      setReportInfo({ hasReport: false });
      setExerciseStats({ completed: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [child?.id, isIep]);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6 text-slate-800 pb-10">
      
      {/* Greeting Banner */}
      <div className={`relative rounded-3xl overflow-hidden p-5 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${isIep ? "bg-gradient-violet" : "bg-gradient-emerald"}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="text-xs sm:text-[13px] font-bold text-white/90 uppercase tracking-widest block">
            Hello, {user?.name || "Family"}! 👋
          </span>
          <span className="text-[10px] font-black px-2.5 sm:px-3 py-1 rounded-full bg-white text-slate-900 shadow-sm uppercase tracking-wider">
            {isIep ? "IEP Program" : `Therapy: ${child?.therapy_category || 'ASD'}`}
          </span>
        </div>
        
        <div className="relative z-10 space-y-2 mt-2 sm:mt-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Here is <span className="underline decoration-white/40">{child?.name}</span>'s <br className="hidden sm:block"/>update today.
          </h2>
          <p className="text-xs sm:text-[15px] text-white/80 font-medium">{todayStr}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCard count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Assessment / IEP Report */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 flex flex-col h-full group">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <FileText className="h-7 w-7" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">
                  {isIep ? "IEP 3-Month Progress" : "Clinical Assessment"}
                </h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1">
                  {isIep ? "Review quarterly educational and functional tracking." : "Detailed diagnostic and therapy recommendations."}
                </p>
              </div>

              {reportInfo?.hasReport ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Document</p>
                      <p className="text-[13px] font-bold text-slate-800">
                        {isIep ? `Cycle ${reportInfo.cycle || 1}` : `Date: ${reportInfo.date}`}
                      </p>
                    </div>
                    <Badge
                      label={reportInfo.status === "published" ? "Published" : "Draft"}
                      variant={reportInfo.status === "published" ? "green" : "amber-soft"}
                      size="sm"
                    />
                  </div>
                  {allReportsList && allReportsList.length > 1 && (
                    <div className="pt-2.5 border-t border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <History className="h-3 w-3 text-blue-600" />
                          <span>Reports History ({allReportsList.length})</span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Old &amp; New
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {allReportsList.map((r, idx) => (
                          <div
                            key={r.id || idx}
                            onClick={() => navigate(`/parent/report?reportId=${r.id}`)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              idx === 0
                                ? "bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100 text-emerald-950 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                            }`}
                          >
                            <span className="truncate">
                              {idx === 0 ? "🟢 Latest Report" : `📄 Previous Report (${r.published_at?.split("T")[0] || r.publishedDate || "Past"})`}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 shrink-0 ml-1.5">
                              View &rarr;
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-[12px] font-bold text-amber-700">Report in preparation.</p>
                  <p className="text-[11px] text-amber-600/80 mt-1">Your center will notify you when published.</p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Button
                variant={reportInfo?.hasReport ? "primary" : "outlined"}
                fullWidth
                onClick={() => navigate("/parent/report")}
                size="lg"
              >
                View Report
              </Button>
            </div>
          </div>

          {/* Card 2: IEP Milestones OR Home Exercises */}
          {isIep ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] transition-all hover:-translate-y-1 flex flex-col h-full group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-violet rounded-t-3xl" />
              <div className="h-14 w-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">School Milestones</h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-1">
                    Track the 24-section competency radar graph.
                  </p>
                </div>

                <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">Next Cycle Review</p>
                  <p className="text-[14px] font-bold text-violet-800">
                    {reportInfo?.nextReviewDate || "Scheduled every 3 months"}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Button variant="violet" fullWidth onClick={() => navigate(`/iep/report/${iepReport?.id || child?.id}`)} size="lg">
                  Review Goals &amp; Radar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(5,150,105,0.12)] transition-all hover:-translate-y-1 flex flex-col h-full group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-emerald rounded-t-3xl" />
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-7 w-7" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">Today's Exercises</h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-1">
                    Daily prescribed activities for home intervention.
                  </p>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Daily Progress</p>
                    <p className="text-[14px] font-black text-emerald-700">{exerciseStats.completed} / {exerciseStats.total}</p>
                  </div>
                  <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${exerciseStats.total > 0 ? (exerciseStats.completed / exerciseStats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Button variant="secondary" fullWidth onClick={() => navigate("/parent/exercises")} size="lg">
                  Start Exercises
                </Button>
              </div>
            </div>
          )}

          {/* Card 3: Next Appointment */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.12)] transition-all hover:-translate-y-1 flex flex-col h-full group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-amber rounded-t-3xl" />
            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="h-7 w-7" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">
                  {isIep ? "School Review Schedule" : "Next Appointment"}
                </h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1">
                  Upcoming sessions at the clinic.
                </p>
              </div>

              {nextAppointment ? (
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-amber-900">{formatAppointmentDate(nextAppointment.appointment_date)}</p>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: getTypeStyle(nextAppointment.appointment_type).bg, color: getTypeStyle(nextAppointment.appointment_type).text }}>
                      {getTypeLabel(nextAppointment.appointment_type)}
                    </span>
                  </div>
                  <p className="text-[13px] text-amber-700 font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatAppointmentTime(nextAppointment.appointment_time)} • {nextAppointment.duration_minutes || 60} min
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[12px] font-bold text-slate-600">
                    {isIep ? "Periodic evaluation scheduled every 3 months." : "No upcoming appointments."}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Call 044-28353136 to schedule.</p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Button variant="outlined" fullWidth onClick={() => {}} disabled size="lg">
                Schedule Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-base sm:text-[18px] font-bold text-slate-900">Need to reach the clinic?</h3>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">We're here to support you and your child.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 sm:gap-4 text-xs sm:text-[13px] font-semibold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
            <Phone className="h-4 w-4 shrink-0" />
            <span>044-28353136</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">kidscarerehabcenter@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl w-full sm:w-auto">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[240px] sm:max-w-[300px]">New no 52/2 old no 97 Gowdia mutt road, Chennai-14</span>
          </div>
        </div>
      </div>

    </div>
  );
}
