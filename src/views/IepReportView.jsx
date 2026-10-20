"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Printer, Edit3, CheckCircle2, AlertTriangle, Clock, FileText, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import IepDomainRadarGraph from "../components/assessment/IepDomainRadarGraph";
import { iepService } from "../services/iepService";
import { printReportWithFilename, formatReportFilename } from "../utils/printHelpers";

export default function IepReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isParent, showToast } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeleteReport = async () => {
    if (window.confirm("Are you sure you want to delete this IEP report? This action cannot be undone.")) {
      try {
        await iepService.deleteReport(reportId);
        if (showToast) showToast("IEP report deleted successfully", "success");
        navigate(reportData?.child_id ? `/iep/${reportData.child_id}` : "/iep");
      } catch (err) {
        console.error("Failed to delete IEP report:", err);
        if (showToast) showToast("Failed to delete report.", "danger");
      }
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await iepService.getReportById(reportId);

      // If not found by direct report UUID, check if reportId is actually a childId (e.g. KCR-2026-xxx)
      if (!data && reportId) {
        try {
          const childReports = await iepService.getReportsByChildId(reportId);
          if (Array.isArray(childReports) && childReports.length > 0) {
            data = childReports.find((r) => r.status === "published" || r.review_status === "published") || childReports[0];
          }
        } catch (_) {}
      }

      if (!data && typeof window !== "undefined") {
        const saved = localStorage.getItem(`iep_report_${reportId}`) || localStorage.getItem(`report_draft_${reportId}`) || localStorage.getItem(`report_published_${reportId}`);
        if (saved) {
          try { data = JSON.parse(saved); } catch (_) {}
        }
      }

      if (!data) {
        setReportData(null);
        return;
      }

      // Parents can only see published reports
      if (isParent && data.status !== "published" && data.review_status !== "published") {
        setReportData(null);
        return;
      }
      setReportData(data);
    } catch (err) {
      console.warn("IepReportView fetch error:", err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [reportId]);

  const iep = reportData?.iep_report || {};
  const child = reportData?.children;
  const isPublished = reportData?.status === "published" || reportData?.review_status === "published";
  const isPending = reportData?.review_status === "pending_review";

  useEffect(() => {
    if (reportData) {
      const activeName = child?.name || iep.studentInfo?.name || reportData?.student_name;
      const activeId = child?.id || reportData?.child_id;
      const reportNum = iep.cycle || reportData?.iep_cycle || reportData?.cycle || 1;
      if (activeName) {
        document.title = formatReportFilename({
          childName: activeName,
          childId: activeId,
          reportNo: reportNum
        });
      }
    }
  }, [reportData, child, iep]);

  if (loading) return <div className="space-y-4"><SkeletonCard count={5} /></div>;
  if (error) return <ErrorMessage error={error} />;

  if (!reportData) {
    return (
      <div className="space-y-6 text-[#2C2C2A] max-w-xl mx-auto py-8">
        <Card className="text-center p-8 space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#2C2C2A]">IEP Report in Preparation</h2>
          <p className="text-xs text-[#5F5E5A] leading-relaxed">
            Your child&apos;s latest IEP 3-month progress report is currently being evaluated and reviewed by our special education and clinical team. It will appear here as soon as it is published.
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

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isParent ? "/parent/report" : (reportData?.child_id ? `/iep/${reportData.child_id}` : "/iep"))}
            className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#2C2C2A]">IEP Report — {iep.period || `Cycle ${iep.cycle || 1}`}</h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">{child?.name || "Student"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && <Badge label="Published" variant="green" />}
          {isPending && <Badge label="Pending Review" variant="amber" />}
          {isAdmin && isPending && (
            <Button size="sm" icon={Edit3} onClick={() => navigate(`/iep/report/${reportId}/review`)}>
              Review & Publish
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            icon={Printer}
            onClick={() =>
              printReportWithFilename({
                childName: child?.name || iep.studentInfo?.name || reportData?.student_name,
                childId: child?.id || reportData?.child_id,
                reportNo: iep.cycle || reportData?.iep_cycle || reportData?.cycle || 1,
                currentReportId: reportData?.id,
                fallbackCycle: iep.cycle || reportData?.iep_cycle || reportData?.cycle
              })
            }
          >
            Print
          </Button>
          {!isParent && (
            <Button
              variant="outlined"
              size="sm"
              icon={Trash2}
              onClick={handleDeleteReport}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              title="Delete this IEP report"
            >
              Delete Report
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isPending && !isParent && (
        <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[10px] px-4 py-3 flex items-center gap-3 no-print">
          <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" />
          <p className="text-xs font-semibold text-[#92400E]">
            This report is <strong>Pending Admin Review</strong>. It is not yet visible to parents.
          </p>
        </div>
      )}

      {/* Report Document */}
      <div className="space-y-5" id="iep-report-printable">
        {/* Title Header */}
        <Card padding="p-4 sm:p-6" className="bg-gradient-to-br from-[#185FA5] to-[#0F3F6E] text-white border-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="KIDS CARE 360 Logo"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-85 truncate">KIDS CARE 360 — Clinical System</p>
                <h1 className="text-lg sm:text-xl font-black truncate">IEP Progress Report</h1>
                <p className="text-xs sm:text-sm font-semibold opacity-90 truncate">
                  Cycle {iep.cycle || 1} · {iep.period || ""}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPublished ? "bg-white/20" : "bg-yellow-400/30"}`}>
                {isPublished ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {isPublished ? "Published" : "Draft"}
              </div>
            </div>
          </div>
        </Card>

        {/* Student Info */}
        <Card padding="p-5">
          <SectionTitle title="Student Information" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <InfoField label="Student Name" value={iep.studentInfo?.name || child?.name || "—"} />
            <InfoField label="Student ID" value={iep.studentInfo?.id || child?.id || "—"} mono />
            <InfoField label="Diagnosis" value={iep.studentInfo?.diagnosis || child?.diagnosis || "—"} />
            <InfoField label="Assessment Date" value={iep.studentInfo?.assessmentDate || "—"} />
            <InfoField label="IEP Period" value={iep.period || "—"} />
            <InfoField label="IEP Cycle" value={`Cycle ${iep.cycle || 1}`} />
            <InfoField label="Next Review Date" value={iep.studentInfo?.nextReviewDate || iep.nextReview?.date || "—"} />
            <InfoField label="Report Status" value={isPublished ? "Published" : "Pending Review"} />
          </div>
        </Card>

        {/* Functional Domain Profile Graph */}
        <IepDomainRadarGraph
          domainScores={iep.domainScores || reportData?.assessments?.domain_scores || {}}
          title="Functional Domain Profile & Progress Graph"
        />

        {/* Assessment Summary */}
        {iep.assessmentSummary && (
          <Card padding="p-5" className="space-y-3">
            <SectionTitle title="Assessment Summary" />
            {iep.assessmentSummary.overallSummary && (
              <div>
                <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Overall Status</p>
                <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{iep.assessmentSummary.overallSummary}</p>
              </div>
            )}
            {iep.assessmentSummary.domainHighlights && (
              <div>
                <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Domain Highlights</p>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">{iep.assessmentSummary.domainHighlights}</p>
              </div>
            )}
            {iep.assessmentSummary.clinicalObservations && (
              <div>
                <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Clinical Observations</p>
                <p className="text-xs text-[#5F5E5A] leading-relaxed italic">{iep.assessmentSummary.clinicalObservations}</p>
              </div>
            )}
          </Card>
        )}

        {/* Progress Comparison */}
        {iep.progressComparison && (
          <Card padding="p-5" className="space-y-3">
            <SectionTitle title={iep.progressComparison.isFirstCycle ? "Baseline Assessment" : "Progress Since Previous Assessment"} />
            {iep.progressComparison.isFirstCycle ? (
              <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{iep.progressComparison.baseline}</p>
            ) : (
              <div className="space-y-4">
                {iep.progressComparison.narrative && (
                  <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{iep.progressComparison.narrative}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {iep.progressComparison.improved?.length > 0 && (
                    <ComparisonCard title="✅ Improved" items={iep.progressComparison.improved} bg="bg-[#ECFDF5]" border="border-[#86EFAC]" textColor="text-[#085041]" />
                  )}
                  {iep.progressComparison.unchanged?.length > 0 && (
                    <ComparisonCard title="⏸ Unchanged" items={iep.progressComparison.unchanged} bg="bg-[#F0F0EE]" border="border-[#D3D1C7]" textColor="text-[#5F5E5A]" />
                  )}
                  {iep.progressComparison.needsImprovement?.length > 0 && (
                    <ComparisonCard title="🎯 Needs Improvement" items={iep.progressComparison.needsImprovement} bg="bg-[#FEF3C7]" border="border-[#F59E0B]/50" textColor="text-[#92400E]" />
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Areas for Improvement */}
        {iep.areasForImprovement?.length > 0 && (
          <Card padding="p-5">
            <SectionTitle title="Priority Areas for Improvement" />
            <ul className="space-y-2 mt-2">
              {iep.areasForImprovement.map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-[#185FA5]/10 text-[#185FA5] text-[9px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  {area}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 3-Month Plan */}
        {iep.threeMonthPlan && (
          <Card padding="p-5" className="space-y-4 border-[#185FA5]/30">
            <SectionTitle title="3-Month Improvement Plan" accent />
            {iep.threeMonthPlan.goals?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-[#185FA5] mb-2">Goals for This Period</p>
                <ul className="space-y-2">
                  {iep.threeMonthPlan.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0F6E56] shrink-0 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {iep.threeMonthPlan.approach && (
              <div>
                <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Approach</p>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">{iep.threeMonthPlan.approach}</p>
              </div>
            )}
            {iep.threeMonthPlan.expectedOutcomes && (
              <div>
                <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Expected Outcomes</p>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">{iep.threeMonthPlan.expectedOutcomes}</p>
              </div>
            )}
          </Card>
        )}

        {/* Recommended Outcomes */}
        {iep.recommendedOutcomes && (
          <Card padding="p-5" className="bg-[#F0F7FF] border-[#185FA5]/20">
            <SectionTitle title="Recommended Outcomes" />
            <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium mt-2">{iep.recommendedOutcomes}</p>
          </Card>
        )}

        {/* Next Review */}
        {iep.nextReview && (
          <Card padding="p-5">
            <SectionTitle title="Next Review" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mt-2">
              <InfoField label="Next Assessment Date" value={iep.nextReview.date || "—"} />
              <InfoField label="Next Period" value={iep.nextReview.period || "—"} />
              {iep.nextReview.notes && <InfoField label="Notes" value={iep.nextReview.notes} />}
            </div>
          </Card>
        )}

        {/* Approval Info */}
        {isPublished && (
          <Card padding="p-5" className="bg-[#ECFDF5] border-[#86EFAC]">
            <SectionTitle title="Publication Information" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mt-2">
              <InfoField label="Prepared By" value={iep.approvalInfo?.preparedBy || reportData?.prepared_by || "—"} />
              <InfoField label="Prepared Date" value={iep.approvalInfo?.preparedDate || "—"} />
              <InfoField label="Reviewed By" value={iep.approvalInfo?.reviewedBy || reportData?.reviewed_by || "—"} />
              <InfoField label="Published By" value={iep.approvalInfo?.publishedBy || reportData?.published_by || "—"} />
              <InfoField label="Published Date" value={reportData?.published_at?.split("T")[0] || iep.approvalInfo?.publishedDate || "—"} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, accent }) {
  return (
    <h3 className={`text-sm font-bold border-b pb-2 mb-3 ${accent ? "text-[#185FA5] border-[#185FA5]/30" : "text-[#2C2C2A] border-[#E8E6DF]"}`}>
      {title}
    </h3>
  );
}

function InfoField({ label, value, mono }) {
  return (
    <div>
      <p className="font-semibold text-[#5F5E5A] text-[10px]">{label}</p>
      <p className={`font-bold text-[#2C2C2A] ${mono ? "font-mono text-[10px]" : ""}`}>{value}</p>
    </div>
  );
}

function ComparisonCard({ title, items, bg, border, textColor }) {
  return (
    <div className={`${bg} ${border} border rounded-[8px] p-3`}>
      <p className={`text-[10px] font-bold ${textColor} mb-2`}>{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={`text-[11px] font-medium ${textColor}`}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
