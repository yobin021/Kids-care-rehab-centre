"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, FileText, CheckCircle2, Activity, School, Calendar, ChevronRight } from "lucide-react";
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
import { isIepProgram } from "../utils/programHelpers";

export default function ParentDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  // Selected child or fallback to user's registered child
  const child =
    childrenList.find((c) => c.id === user?.childId) ||
    (user?.childId ? { id: user.childId, name: user.childName } : childrenList[0]);
  const isIep = isIepProgram(child) || isIepProgram(user);

  const [loading, setLoading] = useState(true);
  const [reportInfo, setReportInfo] = useState(null);
  const [iepReport, setIepReport] = useState(null);
  const [exerciseStats, setExerciseStats] = useState({ completed: 0, total: 0 });
  const [nextAppointment, setNextAppointment] = useState(null);

  const fetchDashboardData = async () => {
    if (!child?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isIep) {
        // 1. Fetch IEP reports
        const reps = await iepService.getReportsByChildId(child.id);
        const published = (reps || []).find((r) => r.status === "published" || r.review_status === "published") || reps?.[0];
        setIepReport(published || null);
        setReportInfo({
          hasReport: !!published,
          status: published?.status || "draft",
          date: published?.published_at?.split("T")[0] || published?.created_at?.split("T")[0] || null,
          cycle: published?.iep_cycle || 1,
          nextReviewDate: published?.next_review_date || null
        });
      } else {
        // 1. Fetch Therapy reports
        let rep = await reportService.getPublishedByChildId(child.id);
        if (!rep) {
          const reps = await reportService.getByChildId(child.id);
          if (reps && reps.length > 0) rep = reps[0];
        }

        const localRep = localStorage.getItem(`report_therapist_${child.id}`) || localStorage.getItem(`report_published_${child.id}`);
        if (rep || localRep) {
          setReportInfo({
            hasReport: true,
            status: rep?.status || "published",
            date: rep?.published_at?.split("T")[0] || rep?.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
          });
        } else {
          setReportInfo({ hasReport: false });
        }

        // 2. Fetch today's completed exercise logs strictly for Therapy children
        const [logs, allExercises] = await Promise.all([
          parentService.getTodayLogs(child.id),
          exerciseService.getHomeExercises()
        ]);

        const assignedHomeExercises = allExercises || [];
        const completedCount = logs ? logs.filter((l) => l.is_done).length : 0;

        setExerciseStats({
          completed: completedCount,
          total: assignedHomeExercises.length
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
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Greeting Banner */}
      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">
            Hello, {user?.name || "Parent"}! 👋
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
            {isIep ? "IEP Special School Student" : `Therapy Pathway: ${child?.therapy_category || 'ASD'}`}
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">
          Here is <span className="underline decoration-teal-400">{child?.name}</span>&apos;s update today.
        </h2>
        <p className="text-xs text-blue-100 font-medium">{todayStr}</p>
      </div>

      {loading ? (
        <SkeletonCard count={3} />
      ) : (
        <div className={`grid grid-cols-1 ${isIep ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
          {/* Card 1: Assessment / IEP Report */}
          <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
            <div className="space-y-2">
              <div className="text-3xl">{isIep ? "📘" : "📄"}</div>
              <h3 className="text-base font-bold text-[#2C2C2A]">
                {isIep ? "IEP 3-Month Progress Report" : "Clinical Assessment Report"}
              </h3>

              {reportInfo?.hasReport ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#5F5E5A]">
                    {isIep ? `Cycle ${reportInfo.cycle || 1}` : `Date: ${reportInfo.date}`}
                  </p>
                  <Badge
                    label={reportInfo.status === "published" ? "Published & Reviewed" : "Draft In Progress"}
                    variant="green"
                    size="sm"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#993C1D]">Report in preparation.</p>
                  <p className="text-[11px] text-[#9B9A96]">Your center will notify you when published.</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                variant={reportInfo?.hasReport ? "primary" : "outlined"}
                fullWidth
                onClick={() => navigate("/parent/report")}
              >
                View Report →
              </Button>
            </div>
          </Card>

          {/* For Therapy children: Card 2 (Home Exercises) + Card 3 (Next Appointment) */}
          {!isIep && (
            <>
              <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
                <div className="space-y-2">
                  <div className="text-3xl">🏃</div>
                  <h3 className="text-base font-bold text-[#2C2C2A]">Today&apos;s Home Exercises</h3>
                  <p className="text-xs font-bold text-[#185FA5]">{exerciseStats.total} exercises assigned</p>
                  <p className="text-xs text-[#5F5E5A] font-semibold">
                    Progress: <strong className="text-[#3B6D11]">{exerciseStats.completed} of {exerciseStats.total}</strong> completed today
                  </p>
                </div>

                <div className="pt-2">
                  <Button variant="secondary" fullWidth onClick={() => navigate("/parent/exercises")}>
                    Start Exercises →
                  </Button>
                </div>
              </Card>

              <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
                <div className="space-y-2">
                  <div className="text-3xl">📅</div>
                  <h3 className="text-base font-bold text-[#2C2C2A]">Next Therapy Appointment</h3>
                  {nextAppointment ? (
                    <div className="space-y-1.5">
                      {(() => {
                        const ts = getTypeStyle(nextAppointment.appointment_type);
                        return (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block"
                            style={{ backgroundColor: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}
                          >
                            {getTypeLabel(nextAppointment.appointment_type)}
                          </span>
                        );
                      })()}
                      <p className="text-xs font-bold text-[#2C2C2A]">{formatAppointmentDate(nextAppointment.appointment_date)}</p>
                      <p className="text-xs text-[#185FA5] font-semibold">
                        at {formatAppointmentTime(nextAppointment.appointment_time)} • {nextAppointment.duration_minutes || 60} min
                      </p>
                      {nextAppointment.notes && <p className="text-[11px] text-[#5F5E5A] italic">{nextAppointment.notes}</p>}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-[#5F5E5A] leading-relaxed">
                        No upcoming appointment scheduled yet.
                      </p>
                      <p className="text-[11px] text-[#9B9A96]">Need to schedule? Call us: <strong>044-28353136</strong></p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* For IEP Special School children: Regular Daily Attendance Schedule (no individual appointment needed) */}
          {isIep && (
            <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
              <div className="space-y-2">
                <div className="text-3xl">🏫</div>
                <h3 className="text-base font-bold text-[#2C2C2A]">Regular Clinic Attendance</h3>
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#085041] border border-[#86EFAC] inline-block">
                    Daily Attendance Active
                  </span>
                  <p className="text-xs font-bold text-[#2C2C2A] pt-1">Monday – Friday | 9:30 AM – 3:30 PM</p>
                  <p className="text-xs text-[#5F5E5A] leading-relaxed">
                    Your child attends regular daily rehabilitation and special school sessions at our centre. Individual appointment booking is not required.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D3D1C7]/40 text-[11px] text-[#5F5E5A]">
                Need to notify absence or leave? Call: <strong className="text-[#185FA5]">044-28353136</strong>
              </div>
            </Card>
          )}
        </div>
      )}

      <Card title="Need to reach us?">
        <div className="space-y-2 text-xs font-semibold text-[#5F5E5A]">
          <p className="flex items-center gap-2 text-[#2C2C2A]">
            <Phone className="h-4 w-4 text-[#185FA5]" />
            <span>Phone: <strong>044-28353136</strong></span>
          </p>
          <p className="flex items-center gap-2 text-[#2C2C2A]">
            <Mail className="h-4 w-4 text-[#0F6E56]" />
            <span>Email: <strong>kidscarerehabcenter@gmail.com</strong></span>
          </p>
          <p className="flex items-start gap-2 text-[#2C2C2A]">
            <MapPin className="h-4 w-4 text-[#993C1D] shrink-0 mt-0.5" />
            <span>Address: <strong>New no 52/2 old no 97 Gowdia mutt road, Royapettah, Chennai-600014</strong></span>
          </p>
        </div>
      </Card>
    </div>
  );
}
