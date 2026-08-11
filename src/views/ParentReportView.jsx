"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Target, Printer, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { useParams } from "react-router-dom";
import { reportService } from "../services/reportService";

export default function ParentReportView() {
  const { id } = useParams();
  const { user, childrenList } = useAuth();
  const targetChildId = id || user?.childId;
  const child = childrenList.find((c) => c.id === targetChildId) || childrenList[0];

  const activeChildId = id || user?.childId || user?.child_id || child?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = null;
      if (activeChildId) {
        result = await reportService.getPublishedByChildId(activeChildId);
        if (!result || (!result.therapist_report && !result.therapistReport)) {
          const allReps = await reportService.getByChildId(activeChildId);
          if (Array.isArray(allReps) && allReps.length > 0) {
            result = allReps.find((r) => r.status === "published" && (r.therapist_report || r.therapistReport)) || allReps[0];
          }
        }
      }

      if (result && (result.therapist_report || result.therapistReport || result.parent_report || result.parentReport)) {
        setData(result);
      } else {
        fallbackLocal(activeChildId);
      }
    } catch (err) {
      console.warn("Published report fetch fallback:", err.message);
      fallbackLocal(activeChildId);
    } finally {
      setLoading(false);
    }

    function fallbackLocal(targetId) {
      if (!targetId) return setData(null);
      const savedPub = localStorage.getItem(`report_published_${targetId}`);
      const savedDraft = localStorage.getItem(`report_draft_${targetId}`);

      if (savedPub) {
        try {
          setData(JSON.parse(savedPub));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      if (savedDraft) {
        try {
          setData(JSON.parse(savedDraft));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setData(null);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeChildId]);

  const report =
    data?.therapist_report ||
    data?.therapistReport ||
    data?.formState?.therapistReport ||
    {};
  const homeEx = data?.home_exercises || data?.homeEx || data?.formState?.exercises?.homeExercises || [];

  if (loading) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-4">
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchReport} />;
  }

  if (!data) {
    return (
      <div className="space-y-6 text-[#2C2C2A] max-w-xl mx-auto py-8">
        <Card className="text-center p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#2C2C2A]">Report Coming Soon</h2>
          <p className="text-xs text-[#5F5E5A] leading-relaxed">
            Your child&apos;s report is being prepared by the therapy team. Your therapist will let you know when it is ready to view.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 print:p-0">
      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-1">
        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Kids Care Rehab Centre — Therapist Clinical Report</span>
        <h2 className="text-xl font-black">{child?.name} — Assessment & Progress Report</h2>
        <p className="text-xs text-blue-100">Published Date: {data?.published_at?.split("T")[0] || data?.publishedDate || "Recently Published"}</p>
      </div>

      {report.background && (
        <Card title="📋 Background & Clinical Referral">
          <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium whitespace-pre-wrap">
            {report.background}
          </p>
        </Card>
      )}

      {report.assessmentFindings && (
        <Card title="🔍 Assessment Findings">
          <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium whitespace-pre-wrap">
            {report.assessmentFindings}
          </p>
        </Card>
      )}

      {report.currentStatus && (
        <Card title="📌 Current Clinical Status & Observations">
          <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium whitespace-pre-wrap">
            {report.currentStatus}
          </p>
        </Card>
      )}

      {report.recommendations && (
        <Card title="💡 Clinical Recommendations & Treatment Plan">
          <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium whitespace-pre-wrap">
            {report.recommendations}
          </p>
        </Card>
      )}

      {report.reviewPlan && (
        <Card title="📅 Review Plan & Follow-up">
          <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium whitespace-pre-wrap">
            {report.reviewPlan}
          </p>
        </Card>
      )}

      {homeEx && homeEx.length > 0 && (
        <div className="bg-emerald-50/70 p-6 rounded-[12px] border border-emerald-200 space-y-3">
          <h3 className="text-sm font-bold text-[#3B6D11] uppercase tracking-wider flex items-center gap-2">
            <span>🏋️ Prescribed Home Exercises & Tools</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#2C2C2A]">
            {homeEx.map((ex, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-white p-3 rounded-[8px] border border-emerald-200/60 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-[#3B6D11] shrink-0" />
                <span>{typeof ex === "string" ? ex : ex.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-[#2C2C2A]">Prepared by <strong>{data?.published_by || data?.prepared_by || report?.prepared_by || report?.preparedBy || user?.name || "Senior Therapist"}</strong></p>
          <p className="text-[#5F5E5A]">Kids Care Rehab Centre Clinical Team</p>
        </div>

        <Button icon={Printer} onClick={() => window.print()} className="print:hidden">
          Print Report
        </Button>
      </div>
    </div>
  );
}
