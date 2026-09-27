"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, FileText, ClipboardList, Eye, PlusCircle, CalendarDays, Clock, MessageSquare } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { reportService } from "../services/reportService";
import { assessmentService } from "../services/assessmentService";
import { appointmentService } from "../services/appointmentService";
import { parentService } from "../services/parentService";
import { formatAppointmentTime, getTypeStyle, getStatusStyle, getTypeLabel } from "../utils/appointmentHelpers";

export default function StaffDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  const [publishedCount, setPublishedCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [todayApts, setTodayApts] = useState([]);
  const [parentMessages, setParentMessages] = useState([]);

  useEffect(() => {
    Promise.all([
      reportService.getAllPublished(),
      assessmentService.getAllThisMonth(),
      appointmentService.getToday(),
      parentService.getAllMessages()
    ])
      .then(([reportsData, assessmentsData, aptsData, msgsData]) => {
        if (reportsData) setPublishedCount(reportsData.length);
        if (assessmentsData) setAssessmentsCount(assessmentsData.length);
        if (aptsData) setTodayApts(aptsData);
        if (msgsData) setParentMessages(msgsData);
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
      default: return "blue";
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div>
        <h2 className="text-[20px] font-bold text-[#2C2C2A]">Good morning, {user?.name || "Staff"}</h2>
        <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">{todayStr}</p>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Children" value={totalChildrenCount} icon={Users} color="#185FA5" />
        <StatCard title="Reports Published" value={publishedCount} icon={FileText} color="#0F6E56" />
        <StatCard title="Assessments This Month" value={assessmentsCount} icon={ClipboardList} color="#3C3489" />
      </div>

      {/* ═══ TWO MAIN BUTTONS: IEP + THERAPY ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className="flex flex-col justify-between bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#185FA5] transition-all duration-200 cursor-pointer group hover:shadow-md p-6"
          onClick={() => navigate("/iep")}
        >
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-[12px] bg-[#185FA5]/10 flex items-center justify-center group-hover:bg-[#185FA5]/20 transition-colors">
              <svg className="h-6 w-6 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#2C2C2A]">IEP</h3>
              <p className="text-[11px] font-bold text-[#185FA5] uppercase tracking-wide">Individualized Education Program</p>
            </div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Conduct IEP assessments and generate structured 3-month progress reports for each student. Track improvement cycles from initial assessment through discharge.
            </p>
          </div>
          <div className="pt-4 border-t border-[#D3D1C7]/60 mt-4">
            <Button onClick={(e) => { e.stopPropagation(); navigate("/iep"); }} fullWidth className="h-11">Open IEP →</Button>
          </div>
        </div>
        {/* Button 2: Therapy */}
        <div
          className="flex flex-col justify-between bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#0F6E56] transition-all duration-200 cursor-pointer group hover:shadow-md p-6"
          onClick={() => navigate("/therapy")}
        >
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-[12px] bg-[#0F6E56]/10 flex items-center justify-center group-hover:bg-[#0F6E56]/20 transition-colors">
              <svg className="h-6 w-6 text-[#0F6E56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#2C2C2A]">Therapy</h3>
              <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-wide">4 Therapy Pathways (ASD · ADHD · DD · LD)</p>
            </div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Manage clinical therapy pathways across ASD, ADHD, Developmental Delay, and Learning Disability. Assign clinic and home exercise regimens with progress logs.
            </p>
          </div>
          <div className="pt-4 border-t border-[#D3D1C7]/60 mt-4">
            <Button onClick={(e) => { e.stopPropagation(); navigate("/therapy"); }} fullWidth className="h-11 bg-[#0F6E56] hover:bg-[#085041]">Open Therapy →</Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">➕👶</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">Register New Child</h3>
            <p className="text-xs text-[#5F5E5A]">Add a new child to the system</p>
          </div>
          <div className="pt-4">
            <Button onClick={() => navigate("/children/new")} fullWidth>
              Register Child
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">📋</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">New Assessment</h3>
            <p className="text-xs text-[#5F5E5A]">Fill assessment form for a child</p>
          </div>
          <div className="pt-4">
            <Button variant="secondary" onClick={() => navigate("/children")} fullWidth>
              Start Assessment
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">👥</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">View All Children</h3>
            <p className="text-xs text-[#5F5E5A]">See all registered children and their reports</p>
          </div>
          <div className="pt-4">
            <Button variant="outlined" onClick={() => navigate("/children")} fullWidth>
              View Children
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-[16px] font-bold text-[#2C2C2A]">Recently Registered</h3>

        {recentChildren.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-xs font-semibold text-[#5F5E5A]">No children registered yet.</p>
            <Button icon={PlusCircle} size="sm" className="mx-auto" onClick={() => navigate("/children/new")}>
              + Register First Child
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentChildren.map((c) => (
              <Card key={c.id} padding="p-4" className="space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#2C2C2A] truncate">{c.name}</h4>
                    <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#5F5E5A] font-semibold">{c.age} • {c.diagnosis}</p>
                  <p className="text-[10px] font-mono text-[#9B9A96]">{c.id}</p>
                </div>

                <Button
                  variant="outlined"
                  size="sm"
                  fullWidth
                  icon={Eye}
                  onClick={() => navigate(`/children/${c.id}`)}
                >
                  View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ═══ PARENT MESSAGES & CLINICAL FEEDBACK ═══ */}
      {parentMessages && parentMessages.length > 0 && (
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#185FA5]" />
                <span className="font-bold text-sm text-[#2C2C2A]">Parent Messages &amp; Care Feedback</span>
              </div>
              <Badge label={`${parentMessages.length} message${parentMessages.length > 1 ? "s" : ""}`} variant="blue" size="sm" />
            </div>
          }
        >
          <div className="space-y-3">
            {parentMessages.slice(0, 5).map((m) => {
              const childObj = m.children || childrenList.find((c) => c.id === m.child_id);
              const childName = childObj?.name || m.child_id;
              const parentName = m.parent_accounts?.parent_name || "Parent";
              const parentPhone = m.parent_accounts?.phone || "";
              const dateStr = m.created_at ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : m.message_date;

              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-[#F8F8F6] border border-[#D3D1C7]/70 rounded-[10px] hover:border-[#185FA5] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold text-[#185FA5] cursor-pointer hover:underline"
                        onClick={() => navigate(`/children/${m.child_id}`)}
                      >
                        {childName}
                      </span>
                      <span className="text-[11px] text-[#5F5E5A] font-semibold">
                        from {parentName} {parentPhone ? `(${parentPhone})` : ""}
                      </span>
                      <span className="text-[10px] text-[#9B9A96]">
                        • {dateStr}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#2C2C2A] bg-white p-2.5 rounded-[6px] border border-[#D3D1C7]/50 shadow-2xs leading-relaxed">
                      &ldquo;{m.message}&rdquo;
                    </p>
                  </div>
                  <Button
                    variant="outlined"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => navigate(`/children/${m.child_id}`)}
                  >
                    View Child Profile →
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Today's Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#2C2C2A] flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#185FA5]" />
            Today&apos;s Schedule
          </h3>
          <button onClick={() => navigate("/appointments")} className="text-xs font-bold text-[#185FA5] hover:underline cursor-pointer">
            View all →
          </button>
        </div>
        {todayApts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-xs font-semibold text-[#5F5E5A]">No appointments scheduled for today.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayApts.map(a => {
              const child = a.children;
              const ts = getTypeStyle(a.appointment_type);
              const ss = getStatusStyle(a.status);
              return (
                <div key={a.id} className="bg-white rounded-[12px] border border-[#D3D1C7] flex items-center gap-4 p-4 shadow-xs">
                  <div className="shrink-0 text-center w-16">
                    <Clock className="h-4 w-4 text-[#185FA5] mx-auto mb-0.5" />
                    <p className="text-xs font-bold text-[#185FA5]">{formatAppointmentTime(a.appointment_time)}</p>
                  </div>
                  <div className="w-px h-8 bg-[#D3D1C7]/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-[#2C2C2A] truncate">{child?.name || "Child"}</p>
                    <p className="text-[11px] text-[#5F5E5A] font-semibold">{a.duration_minutes || 60} min</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>
                    {getTypeLabel(a.appointment_type)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: ss.bg, color: ss.text }}>
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
