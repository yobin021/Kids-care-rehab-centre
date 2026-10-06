"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, Target, Printer, Phone, School, FileText, AlertTriangle, ArrowLeft, Activity, Dumbbell } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import IepDomainRadarGraph from "../components/assessment/IepDomainRadarGraph";
import { useParams, useNavigate } from "react-router-dom";
import { reportService } from "../services/reportService";
import { iepService } from "../services/iepService";
import { exerciseService, resolveExerciseItem } from "../services/exerciseService";
import { assessmentService } from "../services/assessmentService";
import { isIepProgram } from "../utils/programHelpers";
import { printReportWithFilename, formatReportFilename } from "../utils/printHelpers";
import AssessmentReportTableRouter from "../components/assessment/AssessmentReportTables";
import { CATEGORY_CONFIG } from "./TherapistReportView";

export default function ParentReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, childrenList } = useAuth();
  const targetChildId = id || user?.childId;
  const child = childrenList.find((c) => c.id === targetChildId) || (targetChildId ? { id: targetChildId } : childrenList[0]);
  const isIep = isIepProgram(child) || isIepProgram(user);

  const activeChildId = id || user?.childId || user?.child_id || child?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState("parent");
  const [exerciseMap, setExerciseMap] = useState({});
  const [childReportsCount, setChildReportsCount] = useState(1);

  useEffect(() => {
    exerciseService.getAll().then((list) => {
      if (list && list.length > 0) {
        const map = {};
        list.forEach((e) => {
          map[e.id] = e;
          if (e.name) map[e.name.toLowerCase()] = e;
        });
        setExerciseMap(map);
      }
    }).catch(console.warn);
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = null;
      if (activeChildId) {
        // 1. Try IEP report first (must be published)
        try {
          const iepReps = await iepService.getReportsByChildId(activeChildId);
          if (Array.isArray(iepReps) && iepReps.length > 0) {
            result = iepReps.find((r) => r.status === "published" || r.review_status === "published") || null;
          }
        } catch (e) {
          console.warn("IEP report lookup notice:", e.message);
        }

        // 2. Try Clinical Therapy reports (must be published)
        if (!result || (!result.iep_report && !result.iepReport)) {
          try {
            result = await reportService.getPublishedByChildId(activeChildId);
            if (!result || (!result.therapist_report && !result.therapistReport)) {
              const allReps = await reportService.getByChildId(activeChildId);
              if (Array.isArray(allReps) && allReps.length > 0) {
                result = allReps.find((r) => r.status === "published" && (r.therapist_report || r.therapistReport)) || null;
              }
            }
          } catch (e) {
            console.warn("Therapy report lookup notice:", e.message);
          }
        }
      }

      // Calculate how many reports/assessments this child has taken
      if (activeChildId) {
        try {
          const [reps, asses] = await Promise.all([
            reportService.getByChildId(activeChildId),
            assessmentService.getByChildId(activeChildId)
          ]);
          const count = Math.max(
            Array.isArray(reps) ? reps.length : 0,
            Array.isArray(asses) ? asses.length : 0,
            1
          );
          setChildReportsCount(count);
        } catch (_) {}
      }

      // Check that report is genuinely approved and published before displaying to parents
      const isApproved = result && (result.status === "published" || result.review_status === "published");
      const hasContent = result && (result.iep_report || result.iepReport || result.therapist_report || result.therapistReport || result.parent_report || result.parentReport);

      if (isApproved && hasContent) {
        if (!result.assessments && result.assessment_id) {
          try {
            const assObj = await assessmentService.getById(result.assessment_id);
            if (assObj) result.assessments = assObj;
          } catch (_) {}
        }
        if (!result.assessments && activeChildId) {
          try {
            const assList = await assessmentService.getByChildId(activeChildId);
            if (Array.isArray(assList) && assList.length > 0) result.assessments = assList[0];
          } catch (_) {}
        }
        setData(result);
      } else {
        setData(null);
      }
    } catch (err) {
      console.warn("Published report fetch fallback:", err.message);
      setData(null);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (data) {
      const activeName = iep?.studentInfo?.name || child?.name || data?.childName;
      const activeId = child?.id || activeChildId;
      const reportNum = iep?.cycle || data?.iep_cycle || data?.cycle || childReportsCount || 1;
      if (activeName) {
        const titleStr = formatReportFilename({
          childName: activeName,
          childId: activeId,
          reportNo: reportNum
        });
        document.title = titleStr;
      }
    }
  }, [data, child, activeChildId, childReportsCount, iep]);

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
        <div className="bg-[#185FA5] text-white p-4 sm:p-6 rounded-[12px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="KIDS CARE 360 Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block truncate">
                KIDS CARE 360 — IEP Progress Report
              </span>
              <h2 className="text-base sm:text-xl font-black truncate">
                {iep.studentInfo?.name || child?.name} — Cycle {iep.cycle || 1} ({iep.period || "Month 0–3"})
              </h2>
              <p className="text-xs text-blue-100">
                Assessment Date: {iep.studentInfo?.assessmentDate || data?.published_at?.split("T")[0] || "Recently Assessed"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              printReportWithFilename({
                childName: iep.studentInfo?.name || child?.name,
                childId: child?.id || activeChildId,
                reportNo: iep.cycle || data?.iep_cycle || data?.cycle || childReportsCount || 1,
                currentReportId: data?.id,
                fallbackCycle: iep.cycle || data?.iep_cycle || data?.cycle
              })
            }
            className="no-print p-2 rounded-[8px] bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
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
  // 2. CLINICAL THERAPY REPORT VIEW (FOR THERAPY CHILDREN: ASD, ADHD, DELAY, LD)
  // ══════════════════════════════════════════════════════════════════════════
  const parentRep =
    data?.parent_report ||
    data?.parentReport ||
    data?.formState?.parentReport ||
    null;

  const therapistRep =
    data?.therapist_report ||
    data?.therapistReport ||
    data?.formState?.therapistReport ||
    report;

  const assignedClinicExercises =
    data?.clinic_exercises ||
    data?.clinicExercises ||
    data?.formState?.exercises?.clinicExercises ||
    data?.clinicEx ||
    [];

  const assignedHomeExercises =
    data?.home_exercises ||
    data?.homeExercises ||
    data?.formState?.exercises?.homeExercises ||
    data?.homeEx ||
    [];

  const detectedCategory = useMemo(() => {
    const raw = (
      data?.assessment_type ||
      child?.therapy_category ||
      child?.diagnosis ||
      ""
    ).toLowerCase();

    if (raw.includes("adhd") || raw.includes("conner")) return "adhd";
    if (raw.includes("delay") || raw.includes("developmental")) return "developmental_delay";
    if (raw.includes("learn") || raw.includes("ldst") || raw.includes("sld") || raw.includes("dyslex")) return "learning_disability";
    if (raw.includes("special") || raw.includes("iep")) return "special_school";
    return "asd";
  }, [data, child]);

  const currentTheme = useMemo(() => {
    return CATEGORY_CONFIG[detectedCategory] || CATEGORY_CONFIG.asd;
  }, [detectedCategory]);

  const activeClinicExercises = useMemo(() => {
    if (Array.isArray(assignedClinicExercises) && assignedClinicExercises.length > 0) {
      return assignedClinicExercises;
    }
    return currentTheme.defaultClinicExercises;
  }, [assignedClinicExercises, currentTheme]);

  const activeHomeExercises = useMemo(() => {
    if (Array.isArray(assignedHomeExercises) && assignedHomeExercises.length > 0) {
      return assignedHomeExercises;
    }
    return currentTheme.defaultHomeExercises;
  }, [assignedHomeExercises, currentTheme]);

  const therapyPlanInfo =
    data?.therapy_details ||
    data?.therapyDetails ||
    parentRep?.therapyDetails || {
      therapyType: parentRep?.therapyType || child?.therapy_category || currentTheme.name,
      sessionsPerWeek: parentRep?.sessionsPerWeek || "2 sessions/week",
      duration: parentRep?.duration || "6 months",
      nextReviewDate: parentRep?.nextReviewDate || "12 weeks"
    };

  const therapyCategory =
    data?.assessment_type ||
    child?.therapy_category ||
    child?.diagnosis ||
    currentTheme.name;

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 print:p-0 max-w-4xl mx-auto">
      {/* Header Banner Tailored to Assessment */}
      <div
        className="text-white p-4 sm:p-6 rounded-[14px] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ backgroundColor: currentTheme.themeColor }}
      >
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <img
            src="/kids_care_rehab_center_logo.jpg"
            alt="Kids Care Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest block truncate">
                KIDS CARE REHAB CENTRE — {currentTheme.protocolTitle}
              </span>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-white/30">
                {currentTheme.badgeLabel}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black truncate">
              {child?.name || data?.childName || "Child"}
            </h2>
            <p className="text-xs text-white/80">
              Published: {data?.published_at?.split("T")[0] || data?.created_at?.split("T")[0] || data?.publishedDate || "Recently Published"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() =>
              printReportWithFilename({
                childName: child?.name || data?.childName,
                childId: child?.id || activeChildId,
                reportNo: data?.report_number || data?.cycle || childReportsCount || 1,
                currentReportId: data?.id,
                fallbackCycle: data?.cycle
              })
            }
            className="no-print p-2 rounded-[8px] bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs (Parent Summary vs Clinical Evaluation) */}
      {parentRep && (
        <div className="no-print flex items-center bg-[#F1F3F5] p-1 rounded-[10px] w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveViewTab("parent")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-[8px] transition-all cursor-pointer text-center ${
              activeViewTab === "parent"
                ? "bg-white text-[#185FA5] shadow-xs"
                : "text-[#5F5E5A] hover:text-[#2C2C2A]"
            }`}
          >
            🌟 Parent-Friendly Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab("clinical")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-[8px] transition-all cursor-pointer text-center ${
              activeViewTab === "clinical"
                ? "bg-white text-[#185FA5] shadow-xs"
                : "text-[#5F5E5A] hover:text-[#2C2C2A]"
            }`}
          >
            📋 Clinical Evaluation Details
          </button>
        </div>
      )}

      {/* ═══ TAB A: PARENT-FRIENDLY REPORT SUMMARY ═══ */}
      {activeViewTab === "parent" && parentRep && (
        <div className="space-y-6">
          {/* About Your Child */}
          {parentRep.aboutYourChild && (
            <Card title="Warm Greeting & What We Noticed" padding="p-5" className="border-l-4 border-l-[#185FA5]">
              {renderSafeContent(parentRep.aboutYourChild)}
            </Card>
          )}

          {/* Strengths & Superpowers */}
          {parentRep.strengths && (
            <Card
              title="🌟 Strengths & Superpowers"
              padding="p-5"
              className="border-l-4 border-l-[#0F6E56] bg-emerald-50/20"
            >
              <div className="mb-2 text-xs text-[#5F5E5A]">
                Here are the wonderful qualities and capabilities your child demonstrated:
              </div>
              {renderSafeContent(parentRep.strengths)}
            </Card>
          )}

          {/* What We Observed & What We Are Working On */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentRep.whatWeFound && (
              <Card title="What We Observed in Evaluation" padding="p-5">
                {renderSafeContent(parentRep.whatWeFound)}
              </Card>
            )}
            {parentRep.workingOn && (
              <Card title="What We Are Working On Next" padding="p-5" className="border-l-4 border-l-[#185FA5]">
                {renderSafeContent(parentRep.workingOn)}
              </Card>
            )}
          </div>

          {/* Priority Focus Areas */}
          {parentRep.focusAreas && (
            <Card title="🎯 Key Focus Areas" padding="p-5">
              {renderSafeContent(parentRep.focusAreas)}
            </Card>
          )}

          {/* Therapy Plan & Schedule Overview */}
          <Card title="📅 Prescribed Therapy Plan & Schedule" padding="p-5" className="bg-[#F8F9FA]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-[10px] border border-[#E9ECEF]">
                <p className="text-[10px] uppercase font-bold text-[#868E96]">Therapy Focus</p>
                <p className="text-xs font-bold text-[#185FA5] mt-0.5">{therapyPlanInfo.therapyType || "Rehabilitation"}</p>
              </div>
              <div className="p-3 bg-white rounded-[10px] border border-[#E9ECEF]">
                <p className="text-[10px] uppercase font-bold text-[#868E96]">Frequency</p>
                <p className="text-xs font-bold text-[#0F6E56] mt-0.5">{therapyPlanInfo.sessionsPerWeek || "2x / week"}</p>
              </div>
              <div className="p-3 bg-white rounded-[10px] border border-[#E9ECEF]">
                <p className="text-[10px] uppercase font-bold text-[#868E96]">Target Duration</p>
                <p className="text-xs font-bold text-[#2C2C2A] mt-0.5">{therapyPlanInfo.duration || "6 months"}</p>
              </div>
              <div className="p-3 bg-white rounded-[10px] border border-[#E9ECEF]">
                <p className="text-[10px] uppercase font-bold text-[#868E96]">Next Review</p>
                <p className="text-xs font-bold text-[#854F0B] mt-0.5">{therapyPlanInfo.nextReviewDate || "12 weeks"}</p>
              </div>
            </div>
            {parentRep.therapyPlan && typeof parentRep.therapyPlan === "string" && (
              <p className="text-xs text-[#5F5E5A] mt-3 leading-relaxed border-t border-[#E9ECEF] pt-2">
                {parentRep.therapyPlan}
              </p>
            )}
          </Card>

          {/* Assigned Home Exercises (Prescribed for Home Routine) */}
          {activeHomeExercises && activeHomeExercises.length > 0 && (
            <Card
              title="🏠 Prescribed Home Exercises & Daily Routines"
              padding="p-5"
              className="border-l-4 border-l-[#854F0B]"
            >
              <p className="text-xs text-[#5F5E5A] mb-3 leading-relaxed">
                Consistent practice at home reinforces the neuro-developmental gains achieved in our therapy sessions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeHomeExercises.map((ex, idx) => {
                  const master = resolveExerciseItem(ex) || (typeof ex === "object" ? ex : { name: ex });
                  const name = master.name || (typeof ex === "string" ? ex : "Exercise");
                  const imageUrl = master.image_url || master.imageUrl;
                  const freq = master.frequency || "Daily (10-15 mins)";
                  const desc = master.home_description || master.description || "Daily home therapeutic exercise routine.";
                  const cat = master.category || "Home Routine";

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-[#EBEAE4] rounded-[10px] shadow-2xs space-y-2 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {imageUrl ? (
                          <div className="relative h-36 w-full rounded-[8px] overflow-hidden bg-slate-100 border border-slate-200 mb-2">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.nextElementSibling;
                                if (fb) fb.style.display = 'flex';
                              }}
                            />
                            <div style={{ display: 'none' }} className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-800 p-2 text-center">
                              <Activity className="h-6 w-6 text-amber-600 mb-1" />
                              <span className="text-xs font-bold">{name}</span>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-[#0F6E56] shrink-0" />
                            <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                          </div>
                          {cat && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-[#EEF4FB] text-[#185FA5] rounded-full uppercase shrink-0">
                              {cat}
                            </span>
                          )}
                        </div>
                        {desc && <p className="text-[11px] text-[#5F5E5A] leading-relaxed mt-1">{desc}</p>}
                      </div>
                      {freq && (
                        <p className="text-[10px] font-semibold text-[#854F0B] flex items-center gap-1 pt-1 border-t border-slate-100 mt-2">
                          <span>⏱ Frequency:</span> {freq}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Home Advice & Everyday Practice Tips */}
          {(parentRep.homeAdvice || parentRep.homeSuggestions) && (
            <Card title="💡 Daily Home Practice & Routines" padding="p-5">
              {parentRep.homeAdvice && (
                <div className="mb-3">
                  {renderSafeContent(parentRep.homeAdvice)}
                </div>
              )}
              {parentRep.homeSuggestions && (
                <div>
                  <p className="text-[11px] font-bold text-[#185FA5] mb-2 uppercase tracking-wider">
                    Practical Tips for Home
                  </p>
                  {renderSafeContent(parentRep.homeSuggestions)}
                </div>
              )}
            </Card>
          )}

          {/* Words of Encouragement */}
          {(parentRep.encouragement || parentRep.wordsOfEncouragement) && (
            <div className="p-5 bg-gradient-to-r from-[#EEF4FB] to-[#F1F8F5] border border-[#185FA5]/20 rounded-[12px] text-center space-y-2">
              <span className="text-2xl">🌱</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
                A Message from Your Therapy Team
              </h4>
              <p className="text-xs text-[#2C2C2A] leading-relaxed italic max-w-xl mx-auto font-medium">
                &ldquo;{parentRep.encouragement || parentRep.wordsOfEncouragement}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB B: CLINICAL THERAPIST EVALUATION DETAILS ═══ */}
      {(activeViewTab === "clinical" || !parentRep) && (
        <div className="space-y-6">
          {/* Functional Domain Profile Graph */}
          {data?.domain_scores && (
            <IepDomainRadarGraph
              domainScores={data.domain_scores}
              title="Clinical Functional Domain Profile"
            />
          )}

          {/* Standardized Assessment Evaluation Table */}
          <div className="bg-white rounded-[12px] border border-[#185FA5]/30 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#185FA5]/20 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#185FA5]">
                Standardized Clinical Assessment Table
              </h3>
              <span className="text-[10px] font-bold text-[#5F5E5A] bg-[#F1F3F5] px-2 py-0.5 rounded-full">
                Protocol: {therapyCategory.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <AssessmentReportTableRouter
              assessmentType={data?.assessment_type || therapyCategory}
              assessment={data?.assessments || data}
              domainScores={data?.domain_scores}
              isaaInfo={data?.isaa_score ? {
                score: data.isaa_score,
                severity: data.isaa_severity,
                sectionScores: data.isaa_section_scores
              } : null}
              formState={therapistRep}
            />
          </div>

          {/* Background Info */}
          {therapistRep.background && (
            <Card title="1. Background & Referral Information" padding="p-5">
              {renderSafeContent(therapistRep.background)}
            </Card>
          )}

          {/* Assessment Findings */}
          {therapistRep.assessmentFindings && (
            <Card title="2. Assessment Findings & Diagnostic Indices" padding="p-5">
              {renderSafeContent(therapistRep.assessmentFindings)}
            </Card>
          )}

          {/* Current Status */}
          {therapistRep.currentStatus && (
            <Card title="3. Current Clinical Status & Observations" padding="p-5">
              {renderSafeContent(therapistRep.currentStatus)}
            </Card>
          )}

          {/* Recommendations & Therapy Plan */}
          {therapistRep.recommendations && (
            <Card title="4. Clinical Recommendations & Therapy Plan" padding="p-5">
              {renderSafeContent(therapistRep.recommendations)}
            </Card>
          )}

          {/* Review Plan & Milestones */}
          {therapistRep.reviewPlan && (
            <Card title="5. Review Plan & Milestone Milestones" padding="p-5">
              {renderSafeContent(therapistRep.reviewPlan)}
            </Card>
          )}

          {/* 6. Prescribed Clinical & Home Exercises (With Visual Guides) */}
          {(activeClinicExercises.length > 0 || activeHomeExercises.length > 0) && (
            <div className="space-y-4 bg-white rounded-[12px] border border-[#D3D1C7] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-[#185FA5]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
                    6. Prescribed Therapy Exercises & Visual Guides
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#5F5E5A] bg-[#F1F3F5] px-2 py-0.5 rounded-full">
                  {activeClinicExercises.length + activeHomeExercises.length} Activities Prescribed
                </span>
              </div>

              {/* In-Clinic Exercises */}
              {activeClinicExercises.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-[#0F6E56] flex items-center gap-1.5">
                    <span>🏥 In-Clinic Therapeutic Exercises</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeClinicExercises.map((ex, idx) => {
                      const master = resolveExerciseItem(ex) || (typeof ex === "object" ? ex : { name: ex });
                      const name = master.name || (typeof ex === "string" ? ex : "Exercise");
                      const imageUrl = master.image_url || master.imageUrl;
                      const desc = master.description || "Structured therapeutic activity performed under therapist guidance.";
                      const cat = master.category || "Clinical Physiotherapy";
                      const duration = master.duration || "10–15 mins";
                      return (
                        <div key={idx} className="p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[10px] space-y-2 flex flex-col justify-between">
                          <div>
                            {imageUrl && (
                              <div className="relative h-32 w-full rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 mb-2">
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-[#185FA5] rounded-full uppercase shrink-0">
                                {cat}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3 mt-1">{desc}</p>
                          </div>
                          <p className="text-[10px] font-semibold text-[#0F6E56] pt-1 border-t border-slate-200 mt-2">⏱ Duration: {duration}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Home Routine Exercises */}
              {activeHomeExercises.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[11px] font-bold uppercase text-[#854F0B] flex items-center gap-1.5">
                    <span>🏠 Prescribed Home Exercise Routine</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeHomeExercises.map((ex, idx) => {
                      const master = resolveExerciseItem(ex) || (typeof ex === "object" ? ex : { name: ex });
                      const name = master.name || (typeof ex === "string" ? ex : "Exercise");
                      const imageUrl = master.image_url || master.imageUrl;
                      const desc = master.home_description || master.description || "Daily home therapeutic exercise routine.";
                      const cat = master.category || "Home Care";
                      const freq = master.frequency || "Daily";
                      return (
                        <div key={idx} className="p-3 bg-[#FEF6E7]/40 border border-[#854F0B]/30 rounded-[10px] space-y-2 flex flex-col justify-between">
                          <div>
                            {imageUrl && (
                              <div className="relative h-32 w-full rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200 mb-2">
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-[#854F0B] rounded-full uppercase shrink-0">
                                {cat}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3 mt-1">{desc}</p>
                          </div>
                          <p className="text-[10px] font-semibold text-[#854F0B] pt-1 border-t border-amber-200/40 mt-2">📅 Frequency: {freq}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signoff details */}
          {(therapistRep.preparedBy || data?.prepared_by) && (
            <div className="p-4 bg-white border border-[#D3D1C7] rounded-[10px] text-xs flex items-center justify-between text-[#5F5E5A]">
              <div>
                <p className="font-bold text-[#2C2C2A]">Evaluated By: {therapistRep.preparedBy || data?.prepared_by}</p>
                <p className="text-[11px] text-[#868E96]">{therapistRep.designation || currentTheme.defaultAssessorRole}</p>
              </div>
              <p className="font-mono text-[11px]">Kids Care Rehab Centre, Chennai</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

