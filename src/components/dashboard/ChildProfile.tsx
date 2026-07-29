"use client";

import React, { useState } from "react";
import { useDashboard, Child } from "@/context/DashboardContext";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  FileText,
  Activity,
  Edit,
  CheckCircle2,
  X,
  Flag,
  Send,
  Eye,
  Play,
  Share2
} from "lucide-react";

export default function ChildProfile() {
  const {
    children,
    activeChildId,
    setActiveTab,
    createParentPortalLogin,
    sessions,
    reports,
    assessments,
    showToast
  } = useDashboard();

  const [activeProfileTab, setActiveProfileTab] = useState<"overview" | "assessments" | "sessions" | "reports">("overview");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal form state
  const child: Child = children.find((c) => c.id === activeChildId) || children[0] || {
    id: "KCR-2024-002",
    name: "Arsh Mohammed",
    dob: "2021-01-15",
    age: "5y 6m",
    gender: "Male",
    parentName: "Sirajudeen",
    relationship: "Father",
    whatsapp: "9841000001",
    email: "siraj@email.com",
    address: "T. Nagar, Chennai",
    mainConcern: "Poor eye contact and reduced social communication skills",
    diagnosis: "ASD",
    profile: "Profile B",
    assignedTherapist: "Priya",
    schoolName: "St. Christopher's Academy",
    dateOfRegistration: "2022-07-27",
    lastSessionDate: "25 Jul 2026",
    status: "Active",
    primaryConcern: "Poor eye contact and reduced social communication skills",
    previousTherapy: true,
    previousTherapyDetails: "OT 6 months",
    languagesSpoken: "Tamil, English, Urdu",
    schoolFeedback: "Friendly with peers, needs prompt for table activities.",
    parentPortalActive: true
  };

  const [phone, setPhone] = useState(child.whatsapp || "9841000001");
  const [password, setPassword] = useState("parent123");
  const [confirmPassword, setConfirmPassword] = useState("parent123");

  const handleCreateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    createParentPortalLogin(child.id, phone, password);
    setShowLoginModal(false);
  };

  const getProfileBadgeStyle = (profile?: string) => {
    switch (profile) {
      case "Profile A":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Profile B":
        return "bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20";
      case "Profile C":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Profile D":
        return "bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/20";
      case "Profile E":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const childSessions = sessions.filter((s) => s.childId === child.id || child.id === "KCR-2024-002");
  const childReports = reports.filter((r) => r.childId === child.id || child.id === "KCR-2024-002");

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Tab Navigation Header */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-2 overflow-x-auto">
        {(["overview", "assessments", "sessions", "reports"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProfileTab(tab)}
            className={`px-5 py-2.5 rounded-[8px] text-xs font-extrabold capitalize transition-colors cursor-pointer ${
              activeProfileTab === tab
                ? "bg-[#185FA5] text-white shadow-xs"
                : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeProfileTab === "overview" && (
        <div className="space-y-6">
          
          {/* Top Section — Child Info Card (Full Width) */}
          <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#185FA5]/15 text-[#185FA5] flex items-center justify-center font-black text-xl border-2 border-[#185FA5]/30 shrink-0">
                {child.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-[#2C2C2A]">{child.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F8F8F6] border border-[#D3D1C7] text-[#185FA5]">
                    {child.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getProfileBadgeStyle(child.profile)}`}>
                    {child.profile || "Profile B"} — {child.diagnosis}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#5F5E5A] border border-slate-200">
                    Diagnosis: {child.diagnosis}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side — 2 Column Detail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#D3D1C7]/60">
              <div>
                <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Age / DOB</span>
                <strong className="text-[#2C2C2A]">{child.age}</strong>
                <span className="block text-[10px] text-[#5F5E5A]">{child.dob}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Gender / School</span>
                <strong className="text-[#2C2C2A]">{child.gender}</strong>
                <span className="block text-[10px] text-[#5F5E5A] truncate max-w-[100px]">{child.schoolName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Therapist / Reg Date</span>
                <strong className="text-[#185FA5]">{child.assignedTherapist || "Priya"}</strong>
                <span className="block text-[10px] text-[#5F5E5A]">{child.dateOfRegistration}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Status / Last Session</span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B6D11]/10 text-[#3B6D11]">
                  {child.status}
                </span>
                <span className="block text-[10px] text-[#5F5E5A] mt-0.5">{child.lastSessionDate || "25 Jul 2026"}</span>
              </div>
            </div>

          </div>

          {/* Two Columns Grid Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Parent / Guardian Details Card */}
            <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
                <h3 className="text-sm font-extrabold text-[#2C2C2A]">Parent / Guardian Details</h3>
                <button
                  onClick={() => setActiveTab("child-edit")}
                  className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Parent Name</span>
                    <strong className="text-[#2C2C2A] text-sm">{child.parentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Relationship</span>
                    <strong className="text-[#2C2C2A] text-sm">{child.relationship || "Father"}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Phone / WhatsApp</span>
                    <strong className="text-[#185FA5] font-mono text-xs flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#5F5E5A]" />
                      {child.whatsapp}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Email</span>
                    <strong className="text-[#2C2C2A] text-xs flex items-center gap-1 truncate">
                      <Mail className="h-3.5 w-3.5 text-[#5F5E5A]" />
                      {child.email || "parent@email.com"}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Address</span>
                  <p className="text-[#5F5E5A] font-medium">{child.address}</p>
                </div>

                {/* Parent Portal Status Card */}
                <div className="pt-3 border-t border-[#D3D1C7]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F5E5A] block mb-1">
                      Parent Portal Status
                    </span>
                    {child.parentPortalActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3B6D11]/10 text-[#3B6D11] border border-[#3B6D11]/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Portal Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#854F0B]/10 text-[#854F0B] border border-[#854F0B]/30">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Portal Not Set Up</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-3 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
                  >
                    Create Parent Login
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Primary Concern + Referral Card */}
            <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
              <div className="border-b border-[#D3D1C7]/60 pb-3">
                <h3 className="text-sm font-extrabold text-[#2C2C2A]">Primary Concern & Referral Info</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Primary Concern</span>
                  <p className="text-[#2C2C2A] font-semibold bg-[#F8F8F6] p-2.5 rounded-[8px] border border-[#D3D1C7]/50 mt-1">
                    {child.primaryConcern || child.mainConcern}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Referred By</span>
                    <strong className="text-[#2C2C2A]">{child.referredBy || "Self / Pediatrician"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Languages Spoken</span>
                    <strong className="text-[#2C2C2A]">{child.languagesSpoken || "Tamil, English"}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Previous Therapy</span>
                  <p className="text-[#5F5E5A] font-medium">
                    {child.previousTherapy ? `Yes — ${child.previousTherapyDetails || "Speech & OT"}` : "No previous therapy taken"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">School Feedback</span>
                  <p className="text-[#5F5E5A] font-medium italic">
                    &quot;{child.schoolFeedback || "Teacher reported progress in sitting tolerance and peer engagement."}&quot;
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions Bar (Horizontal Full Width) */}
          <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-extrabold text-[#2C2C2A]">Child Quick Actions:</h4>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("new-assessment")}
                className="px-3.5 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ New Assessment</span>
              </button>

              <button
                onClick={() => setActiveTab("daily-session")}
                className="px-3.5 py-2 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="h-4 w-4" />
                <span>+ Log Session</span>
              </button>

              <button
                onClick={() => setActiveProfileTab("reports")}
                className="px-3.5 py-2 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-[#5F5E5A]" />
                <span>View Latest Report</span>
              </button>

              <button
                onClick={() => setActiveTab("child-edit")}
                className="px-3.5 py-2 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="h-4 w-4 text-[#5F5E5A]" />
                <span>Edit Child Details</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ASSESSMENTS */}
      {activeProfileTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Assessment History</h3>
            <button
              onClick={() => setActiveTab("new-assessment")}
              className="px-3.5 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ New Assessment</span>
            </button>
          </div>

          <div className="space-y-4">
            {assessments.length > 0 ? (
              assessments.map((ass) => (
                <div key={ass.id} className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#185FA5]">{ass.type}</span>
                      <span className="text-xs text-[#5F5E5A]">• {ass.assessmentDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#2C2C2A]">
                      Assessed By: <strong>{ass.therapistName}</strong>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#185FA5]">
                        ISAA Score: {ass.isaaScore || 92} ({ass.severityBand || "Mild Autism"})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getProfileBadgeStyle(ass.profileAssigned)}`}>
                        {ass.profileAssigned || "Profile B"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("new-assessment")}
                      className="px-3 py-1.5 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors cursor-pointer"
                    >
                      View Full Assessment
                    </button>
                    <button
                      onClick={() => showToast("Displaying assessment summary", "info")}
                      className="px-3 py-1.5 bg-[#185FA5] text-white text-xs font-bold rounded-[8px] hover:bg-[#12487e] transition-colors cursor-pointer"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center rounded-[12px] border border-[#D3D1C7] space-y-3">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#5F5E5A]">No assessments recorded yet.</p>
                <button
                  onClick={() => setActiveTab("new-assessment")}
                  className="px-4 py-2 bg-[#185FA5] text-white text-xs font-bold rounded-[8px]"
                >
                  Start First Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SESSIONS */}
      {activeProfileTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Session History</h3>
            <button
              onClick={() => setActiveTab("daily-session")}
              className="px-3.5 py-2 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Log New Session</span>
            </button>
          </div>

          <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                    <th className="p-3.5 font-extrabold">Date</th>
                    <th className="p-3.5 font-extrabold">Therapist</th>
                    <th className="p-3.5 font-extrabold">Type</th>
                    <th className="p-3.5 font-extrabold">Duration</th>
                    <th className="p-3.5 font-extrabold">Response</th>
                    <th className="p-3.5 font-extrabold text-center">Escalated</th>
                    <th className="p-3.5 font-extrabold">Notes</th>
                    <th className="p-3.5 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {childSessions.map((s) => (
                    <tr key={s.id} className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/60">
                      <td className="p-3.5 font-bold text-[#2C2C2A] whitespace-nowrap">{s.date}</td>
                      <td className="p-3.5 font-semibold text-[#185FA5]">{s.therapistName}</td>
                      <td className="p-3.5 font-semibold text-[#2C2C2A]">{s.type}</td>
                      <td className="p-3.5 font-mono text-[#5F5E5A]">{s.duration}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.response === "Good" ? "bg-[#3B6D11]/10 text-[#3B6D11]" : s.response === "Moderate" ? "bg-[#854F0B]/10 text-[#854F0B]" : "bg-[#993C1D]/10 text-[#993C1D]"
                        }`}>
                          {s.response}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {s.escalated ? (
                          <span className="inline-flex items-center gap-1 text-[#993C1D] font-extrabold text-xs">
                            <Flag className="h-4 w-4 fill-[#993C1D]" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">No</span>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-[#5F5E5A] max-w-xs truncate">{s.notes}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => s.escalated ? setActiveTab("escalation-detail") : showToast(`Session notes: ${s.notes}`, "info")}
                          className="px-2.5 py-1 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] rounded-[6px] border border-[#D3D1C7] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3 text-[#5F5E5A]" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeProfileTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Published & Clinical Reports</h3>
            <button
              onClick={() => setActiveTab("report-review")}
              className="px-3.5 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Create / Review Report</span>
            </button>
          </div>

          <div className="space-y-4">
            {childReports.map((rep) => (
              <div key={rep.id} className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3D1C7]/40 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#2C2C2A]">Developmental Assessment & Progress Report</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        rep.status === "Published" ? "bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/30" : "bg-[#854F0B]/10 text-[#854F0B] border-[#854F0B]/30"
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F5E5A] mt-0.5">
                      Report Date: <strong>{rep.reportDate}</strong> | Generated By: <strong>{rep.generatedBy}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab("report-review")}
                    className="px-3 py-1.5 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors cursor-pointer"
                  >
                    View Therapist Report
                  </button>

                  <button
                    onClick={() => setActiveTab("parent-report-view")}
                    className="px-3 py-1.5 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors cursor-pointer"
                  >
                    View Parent Report
                  </button>

                  {child.parentPortalActive && (
                    <button
                      onClick={() => showToast("Report shared to parent portal via WhatsApp notification.", "success")}
                      className="px-3 py-1.5 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Send to Parent</span>
                    </button>
                  )}

                  {rep.status === "Draft" && (
                    <button
                      onClick={() => setActiveTab("report-review")}
                      className="px-3 py-1.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
                    >
                      Review + Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARENT LOGIN CREATION MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] p-6 max-w-md w-full border border-[#D3D1C7] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#185FA5]">Create Parent Portal Access</h3>
                <p className="text-xs text-[#5F5E5A] mt-0.5">
                  The parent will use their phone number and this password to log in to the parent portal.
                </p>
              </div>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLogin} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Phone Number (Login ID)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-mono text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Set Password (Unmasked)</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-mono text-[#2C2C2A] bg-amber-50/50 outline-none focus:border-[#185FA5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Confirm Password</label>
                <input
                  type="text"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-mono text-[#2C2C2A] bg-amber-50/50 outline-none focus:border-[#185FA5]"
                />
              </div>

              {/* Yellow Info Box */}
              <div className="p-3.5 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <strong className="block font-bold text-amber-950">Share these login details with the parent in person or via WhatsApp:</strong>
                <p><strong>Login:</strong> {phone}</p>
                <p><strong>Password:</strong> {password}</p>
                <p><strong>Portal URL:</strong> parents.kidscarerehabcenter.in</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]/60">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] font-bold rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white font-bold rounded-[8px]"
                >
                  Create Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
