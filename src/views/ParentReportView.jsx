"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { mockDefaultReport } from "../data/mockData";
import { CheckCircle2, Target, Printer, Phone, Sparkles } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ParentReportView() {
  const { user, childrenList } = useAuth();
  const child = childrenList.find((c) => c.id === user?.childId) || childrenList[1] || childrenList[0];

  const [publishedReport, setPublishedReport] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`report_published_${child?.id}`);
    if (saved) {
      try {
        setPublishedReport(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [child?.id]);

  const report = publishedReport?.parentReport || mockDefaultReport;

  // "Not Ready" State Check
  if (child?.reportsCount === 0 && !publishedReport) {
    return (
      <div className="space-y-6 text-[#2C2C2A] max-w-xl mx-auto py-8">
        <Card className="text-center p-8 space-y-4">
          <Sparkles className="h-10 w-10 text-[#185FA5] mx-auto" />
          <h2 className="text-xl font-bold text-[#2C2C2A]">Report Coming Soon</h2>
          <p className="text-xs text-[#5F5E5A] leading-relaxed">
            Your child&apos;s report is being prepared by the therapy team. Your therapist will let you know when it is ready to view.
          </p>
          <div className="pt-2 border-t border-[#D3D1C7]/60 text-xs font-bold text-[#185FA5] flex items-center justify-center gap-1">
            <Phone className="h-4 w-4 text-[#5F5E5A]" />
            <span>Questions? Call us: 044-28353136</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 print:p-0">
      
      {/* Header (Blue Card) */}
      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-1">
        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Kids Care Rehab Centre</span>
        <h2 className="text-xl font-black">{child?.name} — Assessment Report</h2>
        <p className="text-xs text-blue-100">Report Date: {publishedReport?.publishedDate || child?.lastReportDate || "20 November 2025"}</p>
      </div>

      {/* Card 1 — About Your Child */}
      <Card title="About Your Child">
        <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">
          {report.aboutYourChild}
        </p>
      </Card>

      {/* Card 2 — What We Found (Light Green) */}
      <div className="bg-emerald-50/70 p-6 rounded-[12px] border border-emerald-200 space-y-3">
        <h3 className="text-sm font-bold text-[#3B6D11] uppercase tracking-wider flex items-center gap-2">
          <span>✨ Your Child&apos;s Strengths</span>
        </h3>
        <ul className="space-y-2 text-xs font-semibold text-[#2C2C2A]">
          {(report.strengths || mockDefaultReport.strengths).map((str, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
              <CheckCircle2 className="h-4 w-4 text-[#3B6D11] shrink-0 mt-0.5" />
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card 3 — What We Are Working On (Light Blue) */}
      <div className="bg-blue-50/70 p-6 rounded-[12px] border border-blue-200 space-y-3">
        <h3 className="text-sm font-bold text-[#185FA5] uppercase tracking-wider flex items-center gap-2">
          <span>📌 Areas We Are Supporting</span>
        </h3>
        <ul className="space-y-2 text-xs font-semibold text-[#2C2C2A]">
          {(report.supportAreas || mockDefaultReport.supportAreas).map((area, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
              <Target className="h-4 w-4 text-[#185FA5] shrink-0 mt-0.5" />
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card 4 — Therapy Plan */}
      <Card title="🏥 Therapy Plan">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Therapy Type</span>
            <strong className="text-[#185FA5]">{report.planType || mockDefaultReport.plan.type}</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Sessions / Week</span>
            <strong className="text-[#2C2C2A]">{report.planFrequency || mockDefaultReport.plan.frequency}</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Duration</span>
            <strong className="text-[#2C2C2A]">{report.planDuration || mockDefaultReport.plan.duration}</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Next Review</span>
            <strong className="text-[#0F6E56]">{report.planNextReview || mockDefaultReport.plan.nextReview}</strong>
          </div>
        </div>
      </Card>

      {/* Card 5 — Home Activities (Light Amber) */}
      <div className="bg-amber-50/70 p-6 rounded-[12px] border border-amber-200 space-y-3">
        <h3 className="text-sm font-bold text-[#854F0B] uppercase tracking-wider">
          🏠 What You Can Do At Home
        </h3>
        <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">
          {report.homeAdvice}
        </p>
        <ol className="space-y-2 text-xs font-semibold text-[#2C2C2A] pt-1">
          {(report.homeSuggestions || mockDefaultReport.homeSuggestions).map((sug, idx) => (
            <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-[8px] border border-amber-200/60">
              <span className="h-6 w-6 rounded-full bg-[#854F0B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </span>
              <span>{sug}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Card 6 — Encouraging Message (Teal Card, White Text) */}
      <div className="bg-[#0F6E56] text-white p-6 rounded-[12px] text-center italic text-xs font-semibold shadow-sm">
        &quot;{report.encouragement}&quot;
      </div>

      {/* Footer & Print Button */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#2C2C2A]">Prepared by <strong>{mockDefaultReport.therapistName}</strong></p>
          <p className="text-[#5F5E5A]">Reviewed by <strong>{mockDefaultReport.doctorName}</strong></p>
          <p className="text-[11px] text-[#9B9A96]">Kids Care Rehab Centre, Chennai</p>
        </div>

        <Button icon={Printer} onClick={() => window.print()} className="print:hidden">
          Print Report
        </Button>
      </div>

    </div>
  );
}
