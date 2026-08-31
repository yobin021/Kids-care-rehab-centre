"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Sparkles, Send, FileText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/Skeleton";
import IepDomainRadarGraph from "../components/assessment/IepDomainRadarGraph";
import { assessmentService } from "../services/assessmentService";
import { iepService } from "../services/iepService";
import { calculateDomainScores, classifyProfile } from "../utils/scoringEngine";

export default function IepReportGenerator() {
  const { childId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const child = childrenList.find(c => c.id === childId) || childrenList[0];

  const [assessment, setAssessment] = useState(null);
  const [previousAssessment, setPreviousAssessment] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [cycleNumber, setCycleNumber] = useState(1);

  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState(null);

  // Load assessment + previous assessment
  useEffect(() => {
    async function load() {
      try {
        setLoadingData(true);
        setError(null);

        const aData = await assessmentService.getById(assessmentId);
        setAssessment(aData);

        // Get previous assessment (excludes current)
        const prev = await iepService.getPreviousAssessment(childId, assessmentId);
        setPreviousAssessment(prev);

        // Determine cycle number from history
        const history = await iepService.getIepHistory(childId);
        setCycleNumber(history.length || 1);

        // Auto-generate on load
        if (aData) {
          await generateReport(aData, prev, history.length || 1);
        }
      } catch (err) {
        setError(err.message);
        console.warn("IepReportGenerator load:", err.message);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [assessmentId, childId]);

  const generateReport = async (aData, prevApt, cycle) => {
    try {
      setGenerating(true);

      const formData = aData?.form_data || {};
      const domainScores = aData?.domain_scores || calculateDomainScores(formData);
      const isaaRaw = aData?.isaa_section_scores || formData?.tab4_isaa || formData?.isaaRatings || {};
      const isaaResults = {
        totalScore: aData?.isaa_score,
        severity: aData?.isaa_severity,
        severityLevel: aData?.isaa_level,
        sectionScores: isaaRaw
      };

      const parentGoals = [
        formData.parentGoal1, formData.parentGoal2, formData.parentGoal3,
        formData.parentGoal4, formData.parentGoal5
      ].filter(Boolean).join("; ");

      const childData = {
        name: child?.name || formData.childName || "Child",
        age: child?.age || formData.age || "5y",
        diagnosis: child?.diagnosis || formData.diagnosis || "ASD",
        assessmentDate: aData?.assessment_date || new Date().toISOString().split("T")[0],
        parentGoals: parentGoals || null,
        clinicalObservations: formData.tab11_finalRemarks || null,
      };

      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "iepReport",
          childData,
          isaaResults,
          domainScores,
          previousAssessment: prevApt,
          cycleNumber: cycle
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Enrich with student info and approval info
        const nextReviewDate = addDays(aData?.assessment_date || new Date().toISOString().split("T")[0], 90);
        const enriched = {
          cycle,
          period: `Month ${(cycle - 1) * 3}–${cycle * 3}`,
          domainScores: domainScores || aData?.domain_scores || {},
          studentInfo: {
            name: child?.name || "Child",
            id: child?.id || childId,
            dob: child?.dob || child?.date_of_birth || "—",
            diagnosis: child?.diagnosis || "ASD",
            assessmentDate: aData?.assessment_date,
            nextReviewDate
          },
          assessmentSummary: json.data.assessmentSummary || {},
          progressComparison: json.data.progressComparison || { isFirstCycle: !prevApt },
          areasForImprovement: json.data.areasForImprovement || [],
          threeMonthPlan: json.data.threeMonthPlan || {},
          recommendedOutcomes: json.data.recommendedOutcomes || "",
          nextReview: {
            date: nextReviewDate,
            period: `Month ${cycle * 3}–${(cycle + 1) * 3}`,
            notes: "Progress will be formally re-assessed at the 3-month mark."
          },
          approvalInfo: {
            preparedBy: user?.name || "Therapist",
            preparedDate: new Date().toISOString().split("T")[0],
            reviewedBy: "",
            reviewedDate: "",
            publishedBy: "",
            publishedDate: "",
            status: "pending_review"
          }
        };
        setGeneratedReport(enriched);
      } else {
        throw new Error("Report generation returned no data");
      }
    } catch (err) {
      console.warn("generateReport error:", err.message);
      showToast("Report generation failed — using template report.", "warning");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (assessment) generateReport(assessment, previousAssessment, cycleNumber);
  };

  const handleSubmitForReview = async () => {
    if (!generatedReport) return;
    setSubmitting(true);
    try {
      await iepService.saveIepDraft({
        childId,
        assessmentId,
        previousAssessmentId: previousAssessment?.id || null,
        iepReport: generatedReport,
        preparedBy: user?.name || "Therapist",
        preparedById: user?.id || null,
        cycle: cycleNumber
      });
      showToast("IEP Report submitted for admin review!", "success");
      navigate(`/iep/${childId}`);
    } catch (err) {
      showToast("Failed to submit report. Please try again.", "danger");
      console.error("Submit for review error:", err.message);
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const isFirstCycle = !previousAssessment;

  if (loadingData) {
    return (
      <div className="space-y-4">
        <SkeletonCard count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/iep/${childId}`)} className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">
              Generate IEP Report — Cycle {cycleNumber}
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">
              {child?.name} · {isFirstCycle ? "First Assessment (Establishing Baseline)" : `Follow-up (vs Cycle ${cycleNumber - 1})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            icon={RefreshCw}
            onClick={handleRegenerate}
            loading={generating}
          >
            Regenerate
          </Button>
          {generatedReport && (
            <Button
              icon={Send}
              size="sm"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      {/* AI Generation Status */}
      {generating && (
        <Card padding="p-6" className="text-center border-[#185FA5]/30 bg-[#F0F7FF]">
          <Sparkles className="h-6 w-6 text-[#185FA5] mx-auto mb-2 animate-pulse" />
          <p className="text-sm font-bold text-[#185FA5]">Generating IEP Report...</p>
          <p className="text-xs text-[#5F5E5A] font-semibold mt-1">
            Analysing assessment data{!isFirstCycle ? " and comparing with previous cycle" : ""}...
          </p>
        </Card>
      )}

      {/* Report Preview */}
      {!generating && generatedReport && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[10px] px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B45309]">Draft Report — Pending Admin Review</p>
              <p className="text-[11px] text-[#92400E] font-semibold">
                This report will be submitted to the admin for review before it is published. Staff and parents cannot view it until admin publishes it.
              </p>
            </div>
          </div>

          {/* Student Info */}
          <Card padding="p-5" className="space-y-2 bg-gradient-to-r from-[#185FA5]/5 to-transparent border-[#185FA5]/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#185FA5]">IEP Report — Cycle {generatedReport.cycle} · {generatedReport.period}</h3>
              <Badge label="Draft" variant="amber" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div><span className="font-semibold text-[#5F5E5A]">Student:</span><p className="font-bold text-[#2C2C2A]">{generatedReport.studentInfo?.name}</p></div>
              <div><span className="font-semibold text-[#5F5E5A]">Diagnosis:</span><p className="font-bold text-[#2C2C2A]">{generatedReport.studentInfo?.diagnosis}</p></div>
              <div><span className="font-semibold text-[#5F5E5A]">Assessment Date:</span><p className="font-bold text-[#2C2C2A]">{generatedReport.studentInfo?.assessmentDate}</p></div>
              <div><span className="font-semibold text-[#5F5E5A]">Next Review:</span><p className="font-bold text-[#2C2C2A]">{generatedReport.studentInfo?.nextReviewDate}</p></div>
            </div>
          </Card>

          {/* Functional Domain Profile Graph */}
          <IepDomainRadarGraph
            domainScores={generatedReport.domainScores || assessment?.domain_scores}
            title="Functional Domain Profile & Progress Graph"
          />

          {/* Assessment Summary */}
          <ReportSection title="Assessment Summary" icon="📋">
            <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{generatedReport.assessmentSummary?.overallSummary}</p>
            {generatedReport.assessmentSummary?.domainHighlights && (
              <p className="text-xs text-[#5F5E5A] leading-relaxed mt-2">{generatedReport.assessmentSummary.domainHighlights}</p>
            )}
            {generatedReport.assessmentSummary?.clinicalObservations && (
              <p className="text-xs text-[#5F5E5A] leading-relaxed mt-2 italic">{generatedReport.assessmentSummary.clinicalObservations}</p>
            )}
          </ReportSection>

          {/* Progress Comparison */}
          <ReportSection title={isFirstCycle ? "Baseline Status" : "Progress Since Last Assessment"} icon={isFirstCycle ? "📊" : "📈"}>
            {isFirstCycle ? (
              <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{generatedReport.progressComparison?.baseline}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">{generatedReport.progressComparison?.narrative}</p>
                {generatedReport.progressComparison?.improved?.length > 0 && (
                  <ComparisonList title="Areas Improved ✅" items={generatedReport.progressComparison.improved} color="green" />
                )}
                {generatedReport.progressComparison?.unchanged?.length > 0 && (
                  <ComparisonList title="Areas Unchanged" items={generatedReport.progressComparison.unchanged} color="gray" />
                )}
                {generatedReport.progressComparison?.needsImprovement?.length > 0 && (
                  <ComparisonList title="Still Requires Improvement" items={generatedReport.progressComparison.needsImprovement} color="amber" />
                )}
              </div>
            )}
          </ReportSection>

          {/* Areas for Improvement */}
          <ReportSection title="Priority Areas for Next 3 Months" icon="🎯">
            <ul className="space-y-1.5">
              {(generatedReport.areasForImprovement || []).map((area, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
                  <span className="h-4 w-4 shrink-0 rounded-full bg-[#185FA5]/10 text-[#185FA5] text-[9px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  {area}
                </li>
              ))}
            </ul>
          </ReportSection>

          {/* 3-Month Plan */}
          <ReportSection title="3-Month Improvement Plan" icon="📅">
            <div className="space-y-3">
              {generatedReport.threeMonthPlan?.goals?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-[#185FA5] mb-1.5">Goals for This Period:</p>
                  <ul className="space-y-1.5">
                    {generatedReport.threeMonthPlan.goals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#2C2C2A] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0F6E56] shrink-0 mt-0.5" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {generatedReport.threeMonthPlan?.approach && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Approach:</p>
                  <p className="text-xs text-[#5F5E5A] leading-relaxed">{generatedReport.threeMonthPlan.approach}</p>
                </div>
              )}
              {generatedReport.threeMonthPlan?.expectedOutcomes && (
                <div>
                  <p className="text-[11px] font-bold text-[#5F5E5A] mb-1">Expected Outcomes:</p>
                  <p className="text-xs text-[#5F5E5A] leading-relaxed">{generatedReport.threeMonthPlan.expectedOutcomes}</p>
                </div>
              )}
            </div>
          </ReportSection>

          {/* Next Review */}
          <ReportSection title="Next Review" icon="🗓️">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="font-semibold text-[#5F5E5A]">Next Assessment Date</p><p className="font-bold text-[#2C2C2A]">{generatedReport.nextReview?.date}</p></div>
              <div><p className="font-semibold text-[#5F5E5A]">Next Period</p><p className="font-bold text-[#2C2C2A]">{generatedReport.nextReview?.period}</p></div>
            </div>
            {generatedReport.nextReview?.notes && (
              <p className="text-xs text-[#5F5E5A] italic mt-2">{generatedReport.nextReview.notes}</p>
            )}
          </ReportSection>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button icon={Send} onClick={() => setShowSubmitModal(true)}>
              Submit for Admin Review
            </Button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit IEP Report for Review">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Submit this IEP Report (Cycle {cycleNumber}) for <strong>{child?.name}</strong> to admin for review?
          </p>
          <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[8px] px-3 py-2 text-[#92400E]">
            The report will be saved as <strong>Pending Review</strong>. It will NOT be visible to the parent until an admin reviews and publishes it.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitForReview} loading={submitting}>Submit for Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ReportSection({ title, icon, children }) {
  return (
    <Card padding="p-5" className="space-y-3">
      <h4 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2 border-b border-[#E8E6DF] pb-2">
        <span>{icon}</span>
        {title}
      </h4>
      {children}
    </Card>
  );
}

function ComparisonList({ title, items, color }) {
  const colorMap = {
    green: "bg-[#E1F5EE] text-[#085041]",
    gray: "bg-[#F0F0EE] text-[#5F5E5A]",
    amber: "bg-[#FEF3C7] text-[#92400E]"
  };
  return (
    <div>
      <p className="text-[11px] font-bold text-[#5F5E5A] mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorMap[color] || colorMap.gray}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function addDays(dateStr, days) {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  } catch {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }
}
