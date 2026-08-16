"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Target, Printer, Phone, School, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import IepDomainRadarGraph from "../components/assessment/IepDomainRadarGraph";
import { useParams, useNavigate } from "react-router-dom";
import { reportService } from "../services/reportService";
import { iepService } from "../services/iepService";

export default function ParentReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        // 1. Try IEP report first
        try {
          const iepReps = await iepService.getReportsByChildId(activeChildId);
          if (Array.isArray(iepReps) && iepReps.length > 0) {
            result = iepReps.find((r) => r.status === "published" || r.review_status === "published") || iepReps[0];
          }
        } catch (e) {
          console.warn("IEP report lookup notice:", e.message);
        }

        // 2. Try Clinical Therapy reports
        if (!result || (!result.iep_report && !result.iepReport)) {
          try {
            result = await reportService.getPublishedByChildId(activeChildId);
            if (!result || (!result.therapist_report && !result.therapistReport)) {
              const allReps = await reportService.getByChildId(activeChildId);
              if (Array.isArray(allReps) && allReps.length > 0) {
                result = allReps.find((r) => r.status === "published" && (r.therapist_report || r.therapistReport)) || allReps[0];
              }
            }
          } catch (e) {
            console.warn("Therapy report lookup notice:", e.message);
          }
        }
      }

      if (result && (result.iep_report || result.iepReport || result.therapist_report || result.therapistReport || result.parent_report || result.parentReport)) {
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
      const savedIep = localStorage.getItem(`iep_report_${targetId}`) || localStorage.getItem(`report_draft_${targetId}`);
      const savedPub = localStorage.getItem(`report_published_${targetId}`);

      if (savedIep) {
        try {
          setData(JSON.parse(savedIep));
          return;
        } catch (e) {}
      }
      if (savedPub) {
        try {
          setData(JSON.parse(savedPub));
          return;
        } catch (e) {}
      }
      setData(null);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeChildId]);

  const iep = data?.iep_report || data?.iepReport;
  const report =
    data?.therapist_report ||
    data?.therapistReport ||
    data?.formState?.therapistReport ||
    {};

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
          <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#2C2C2A]">Progress Report in Preparation</h2>
          <p className="text-xs text-[#5F5E5A] leading-relaxed">
            Your child&apos;s latest progress report is currently being evaluated and reviewed by our clinical and special education team. It will appear here as soon as it is published by the center.
          </p>
          <div className="pt-2">
            <Button variant="outlined" onClick={() => navigate("/parent/home")}>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Safe helper to render strings, arrays, or structured objects without crashing React
  const renderSafeContent = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      return <p className="text-xs text-[#2C2C2A] leading-relaxed whitespace-pre-wrap font-medium">{val}</p>;
    }
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-1.5">
          {val.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0F6E56] shrink-0 mt-0.5" />
              <span>{typeof item === "object" ? JSON.stringify(item) : item}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (typeof val === "object") {
      return (
        <div className="space-y-3">
          {val.overallSummary && (
            <div>
              <p className="text-[11px] font-bold text-[#5F5E5A] mb-0.5">Overall Status</p>
              <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{val.overallSummary}</p>
            </div>
          )}
          {val.domainHighlights && (
            <div>
              <p className="text-[11px] font-bold text-[#5F5E5A] mb-0.5">Domain Highlights</p>
              <p className="text-xs text-[#5F5E5A] leading-relaxed">{val.domainHighlights}</p>
            </div>
          )}
          {val.clinicalObservations && (
            <div>
              <p className="text-[11px] font-bold text-[#5F5E5A] mb-0.5">Clinical Observations</p>
              <p className="text-xs text-[#5F5E5A] leading-relaxed italic">{val.clinicalObservations}</p>
            </div>
          )}
          {val.goals && Array.isArray(val.goals) && (
            <div>
              <p className="text-[11px] font-bold text-[#185FA5] mb-1.5">Key Goals for this Period</p>
              <ul className="space-y-1.5">
                {val.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0F6E56] shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {val.approach && (
            <div>
              <p className="text-[11px] font-bold text-[#5F5E5A] mb-0.5">Recommended Approach</p>
              <p className="text-xs text-[#5F5E5A] leading-relaxed">{val.approach}</p>
            </div>
          )}
          {val.expectedOutcomes && (
            <div>
              <p className="text-[11px] font-bold text-[#5F5E5A] mb-0.5">Expected Outcomes</p>
              <p className="text-xs text-[#5F5E5A] leading-relaxed">{val.expectedOutcomes}</p>
            </div>
          )}
        </div>
      );
    }
    return <p className="text-xs text-[#2C2C2A] leading-relaxed">{String(val)}</p>;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. IEP PROGRESS REPORT VIEW (FOR IEP SPECIAL SCHOOL STUDENTS)
  // ══════════════════════════════════════════════════════════════════════════
  if (iep) {
    return (
      <div className="space-y-6 text-[#2C2C2A] py-2 print:p-0 max-w-3xl mx-auto">
        {/* Header Banner */}
        <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="KIDS CARE 360 Logo"
              className="h-12 w-12 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block">
                KIDS CARE 360 — IEP Progress Report
              </span>
              <h2 className="text-xl font-black">
                {iep.studentInfo?.name || child?.name} — Cycle {iep.cycle || 1} ({iep.period || "Month 0–3"})
              </h2>
              <p className="text-xs text-blue-100">
                Assessment Date: {iep.studentInfo?.assessmentDate || data?.published_at?.split("T")[0] || "Recently Assessed"}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print p-2 rounded-[8px] bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        {/* Functional Domain Profile Graph */}
        <IepDomainRadarGraph
          domainScores={iep.domainScores || data?.domain_scores || {}}
          title="Functional Domain Profile & Progress Graph"
        />

        {/* Assessment Summary */}
        {iep.assessmentSummary && (
          <Card title="Assessment & Clinical Summary" padding="p-5">
            {renderSafeContent(iep.assessmentSummary)}
          </Card>
        )}

        {/* Strengths & Priority Needs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {iep.strengths && (
            <Card title="Student Strengths & Capabilities" padding="p-5" className="border-l-4 border-l-[#0F6E56]">
              {renderSafeContent(iep.strengths)}
            </Card>
          )}
          {iep.priorityNeeds && (
            <Card title="Priority Learning Needs" padding="p-5" className="border-l-4 border-l-[#185FA5]">
              {renderSafeContent(iep.priorityNeeds)}
            </Card>
          )}
        </div>

        {/* 3-Month Plan */}
        {iep.threeMonthPlan && (
          <Card title="3-Month Individualized Education Plan (IEP)" padding="p-5">
            {renderSafeContent(iep.threeMonthPlan)}
          </Card>
        )}

        {/* Areas for Improvement */}
        {iep.areasForImprovement && Array.isArray(iep.areasForImprovement) && iep.areasForImprovement.length > 0 && (
          <Card title="Priority Areas for Improvement" padding="p-5">
            {renderSafeContent(iep.areasForImprovement)}
          </Card>
        )}

        {/* Home Recommendations */}
        {iep.homeRecommendations && (
          <Card title="Home Support & Guidance" padding="p-5" className="bg-[#F8F8F6]">
            {renderSafeContent(iep.homeRecommendations)}
          </Card>
        )}

        {/* Next Review */}
        <div className="p-4 bg-[#EEF4FB] border border-[#185FA5]/30 rounded-[10px] text-xs flex items-center justify-between text-[#185FA5] font-bold">
          <span>Next Cycle Evaluation:</span>
          <span>{iep.nextReviewDate || data?.next_review_date || "Scheduled every 3 months"}</span>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CLINICAL THERAPY REPORT VIEW (FOR THERAPY CHILDREN)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 print:p-0 max-w-3xl mx-auto">
      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/kids_care_rehab_center_logo.jpg"
            alt="KIDS CARE 360 Logo"
            className="h-12 w-12 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block">
              KIDS CARE 360 — Therapy Assessment Report
            </span>
            <h2 className="text-xl font-black">
              {child?.name} — {child?.therapy_category || child?.diagnosis || "Therapy"}
            </h2>
            <p className="text-xs text-blue-100">
              Published: {data?.published_at?.split("T")[0] || data?.created_at?.split("T")[0] || "Recently"}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print p-2 rounded-[8px] bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </button>
      </div>

      {/* Functional Domain Profile Graph */}
      {data?.domain_scores && (
        <IepDomainRadarGraph
          domainScores={data.domain_scores}
          title="Clinical Functional Domain Profile"
        />
      )}

      {/* Background Info */}
      {report.background && (
        <Card title="1. Background & Referral Information" padding="p-5">
          {renderSafeContent(report.background)}
        </Card>
      )}

      {/* Assessment Findings */}
      {report.assessmentFindings && (
        <Card title="2. Assessment Findings" padding="p-5">
          {renderSafeContent(report.assessmentFindings)}
        </Card>
      )}

      {/* Current Status */}
      {report.currentStatus && (
        <Card title="3. Current Status & Observations" padding="p-5">
          {renderSafeContent(report.currentStatus)}
        </Card>
      )}

      {/* Recommendations & Therapy Plan */}
      {report.recommendations && (
        <Card title="4. Recommendations & Therapy Plan" padding="p-5">
          {renderSafeContent(report.recommendations)}
        </Card>
      )}

      {/* Review Plan & Milestones */}
      {report.reviewPlan && (
        <Card title="5. Review Plan & Milestones" padding="p-5">
          {renderSafeContent(report.reviewPlan)}
        </Card>
      )}
    </div>
  );
}
