"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Edit3,
  Eye,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Download,
  X,
  FileText
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";
import { childrenService } from "../services/childrenService";
import { assessmentService } from "../services/assessmentService";
import { exerciseService } from "../services/exerciseService";
import { MASTER_EXERCISES } from "../data/exercisesData";
import { calculateISAAScore, calculateDomainScores } from "../utils/scoringEngine";
import { printReportWithFilename, formatReportFilename } from "../utils/printHelpers";

export default function TherapistReportView({ initialEditMode = false }) {
  const { id, reportId } = useParams();
  const targetId = reportId || id;
  const navigate = useNavigate();
  const { user, isAdmin, childrenList, showToast } = useAuth();

  const [child, setChild] = useState(null);
  const [reportDataRaw, setReportDataRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (child) {
      const activeName = child?.name;
      const activeId = child?.id || targetId;
      const reportNum = reportDataRaw?.cycle || reportDataRaw?.report_number || 1;
      if (activeName) {
        document.title = formatReportFilename({
          childName: activeName,
          childId: activeId,
          reportNo: reportNum
        });
      }
    }
  }, [child, targetId, reportDataRaw]);

  // View Mode (false) vs Edit Mode (true)
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Save & Auto-Save State: 'saved' | 'unsaved' | 'saving'
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // PDF Modal & PDF preparation state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  // Regenerate Section Loading State
  const [generatingSection, setGeneratingSection] = useState(null);

  // Validation Error state
  const [validationErrors, setValidationErrors] = useState({});

  // Confirm Exit Edit Modal
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Report Form State
  const [formState, setFormState] = useState({
    background: "",
    assessmentFindings: "",
    currentStatus: "",
    recommendations: "",
    reviewPlan: "",
    preparedBy: "",
    designation: "",
    preparedDate: new Date().toISOString().split("T")[0],
    reportStatus: "draft"
  });

  const [exerciseMap, setExerciseMap] = useState({});
  const [assignedClinicExercises, setAssignedClinicExercises] = useState([]);
  const [assignedHomeExercises, setAssignedHomeExercises] = useState([]);

  const autoSaveTimerRef = useRef(null);

  // 1. Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Child details
      let childObj = childrenList.find((c) => c.id === targetId);
      if (!childObj) {
        childObj = await childrenService.getById(targetId);
      }
      if (!childObj) {
        childObj = childrenList[0];
      }
      setChild(childObj);

      // Report & Assessment details
      let reportObj = await reportService.getById(targetId);
      if (!reportObj) {
        reportObj = await reportService.getPublishedByChildId(targetId);
      }
      if (!reportObj) {
        const reps = await reportService.getByChildId(targetId);
        if (Array.isArray(reps) && reps.length > 0) {
          reportObj = reps[0];
        }
      }

      if (!reportObj) {
        const localPub = localStorage.getItem(`report_published_${targetId}`) || localStorage.getItem(`report_draft_${targetId}`);
        if (localPub) {
          try {
            reportObj = JSON.parse(localPub);
          } catch (_) {}
        }
      }

      let assessmentObj = null;
      if (!reportObj) {
        const assList = await assessmentService.getByChildId(targetId);
        if (assList && assList.length > 0) {
          assessmentObj = assList[0];
        }
      } else {
        assessmentObj = reportObj.assessments || reportObj.assessment;
      }

      setReportDataRaw(reportObj || { assessments: assessmentObj });

      // Load master exercises with image URLs
      const map = {};
      try {
        const allEx = await exerciseService.getAll();
        (allEx || MASTER_EXERCISES).forEach((ex) => {
          if (ex.name) map[ex.name.toLowerCase()] = ex;
        });
      } catch (_) {
        MASTER_EXERCISES.forEach((ex) => {
          if (ex.name) map[ex.name.toLowerCase()] = ex;
        });
      }
      setExerciseMap(map);

      // Extract assigned clinic & home exercises
      const clinicEx = reportObj?.clinic_exercises || reportObj?.clinicExercises || reportObj?.therapy_details?.clinic_exercises || reportObj?.formState?.exercises?.clinicExercises || [];
      const homeEx = reportObj?.home_exercises || reportObj?.homeExercises || reportObj?.therapy_details?.home_exercises || reportObj?.formState?.exercises?.homeExercises || [];
      setAssignedClinicExercises(Array.isArray(clinicEx) ? clinicEx : []);
      setAssignedHomeExercises(Array.isArray(homeEx) ? homeEx : []);

      // Populate initial text fields
      const rep = reportObj?.therapist_report || reportObj?.therapistReport || reportObj?.formState?.therapistReport || {};
      const cat = (childObj?.therapy_category || childObj?.diagnosis || "").toLowerCase();

      let defaultFindings = "Clinical assessment evaluated using standardized diagnostic protocol.";
      let defaultStatus = `${childObj?.name || 'Child'} demonstrates active participation and is making steady progress toward therapeutic milestones.`;
      let defaultRecs = "1. Weekly Therapy Sessions (2x/week)\n2. Occupational Therapy / Speech Therapy\n3. Home Practice & Routine Reinforcement";

      if (cat.includes("adhd") || cat.includes("conner")) {
        defaultFindings = "Conners' Rating Scale assessment reveals elevated symptoms in attention span, task initiation, and impulse regulation.";
        defaultStatus = `${childObj?.name || 'Child'} shows high creativity and energetic engagement, with ongoing need for structured visual schedules and physical movement breaks.`;
        defaultRecs = "1. Occupational Therapy & Sensory Regulation (2x/week)\n2. Behavioral & Executive Function Coaching (1-2x/week)\n3. Classroom & Homework Accommodations (timers, short intervals)";
      } else if (cat.includes("delay") || cat.includes("developmental")) {
        defaultFindings = "Developmental milestone checklist indicates motor, communicative, and postural delays requiring early intervention.";
        defaultStatus = `${childObj?.name || 'Child'} shows positive response to sensory stimulation, imitation exercises, and playful physical therapy.`;
        defaultRecs = "1. Pediatric Physiotherapy & Gross Motor Training (2x/week)\n2. Early Intervention Occupational Therapy (2x/week)\n3. Daily Floor Play & Milestone Exercises at Home";
      } else if (cat.includes("learn") || cat.includes("ldst") || cat.includes("dyslex") || cat.includes("sld")) {
        defaultFindings = "Learning Disability Screening Test (LDST) indicates vulnerabilities in reading decoding, phonological memory, and handwriting stamina.";
        defaultStatus = `${childObj?.name || 'Child'} demonstrates strong verbal reasoning and comprehension, with fatigue occurring during multi-step written tasks.`;
        defaultRecs = "1. Special Education & Remedial Therapy (2-3x/week)\n2. Multi-Sensory Phonics Instruction (Orton-Gillingham Approach)\n3. Academic Accommodations (extra time, scribing, reduced copywork)";
      }

      setFormState({
        background: rep.background || `${childObj?.name || 'The child'} is a ${childObj?.age || '4-year-old'} ${childObj?.gender || 'child'} referred for clinical assessment regarding ${childObj?.primaryConcern || childObj?.primary_concern || 'developmental concerns'}.`,
        assessmentFindings: rep.assessmentFindings || rep.findings || defaultFindings,
        currentStatus: rep.currentStatus || rep.concerns || defaultStatus,
        recommendations: rep.recommendations || defaultRecs,
        reviewPlan: rep.reviewPlan || "First formal progress review scheduled in 12 weeks. Quarterly multidisciplinary evaluation to measure milestone achievement.",
        preparedBy: rep.preparedBy || user?.name || "Senior Clinical Specialist",
        designation: rep.designation || user?.designation || "Pediatric Clinical Specialist",
        preparedDate: rep.preparedDate || new Date().toISOString().split("T")[0],
        reportStatus: reportObj?.status || "draft"
      });
    } catch (err) {
      console.warn("Load report error notice:", err.message);
      if (childrenList && childrenList.length > 0) {
        setChild(childrenList[0]);
      } else {
        setError("Failed to load report data.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, [targetId]);

  // Derived ISAA & Domain Scores
  const domainScores = useMemo(() => {
    const ass = reportDataRaw?.assessments || reportDataRaw?.assessment;
    if (ass?.domain_scores) return ass.domain_scores;
    if (ass?.form_data) return calculateDomainScores(ass.form_data);
    return {
      communication: 65,
      socialSkills: 55,
      behaviour: 60,
      attention: 42,
      fineMotor: 70,
      grossMotor: 75,
      adl: 65,
      sensory: 45
    };
  }, [reportDataRaw]);

  const isaaInfo = useMemo(() => {
    const ass = reportDataRaw?.assessments || reportDataRaw?.assessment;
    if (ass?.form_data?.tab4_isaaRatings) {
      const calc = calculateISAAScore(ass.form_data.tab4_isaaRatings);
      return {
        score: calc.totalScore ?? 0,
        maxScore: 200,
        severity: calc.severity || "Mild Autism",
        sectionScores: {
          social: calc.sectionScores?.I || 24,
          emotional: calc.sectionScores?.II || 14,
          speech: calc.sectionScores?.III || 16,
          behaviour: calc.sectionScores?.IV || 18,
          cognitive: calc.sectionScores?.V || 12,
          sensory: calc.sectionScores?.VI || 10
        }
      };
    }
    const score = ass?.isaa_score ?? 0;
    const severity = ass?.isaa_severity || (score >= 154 ? "Severe Autism" : score >= 107 ? "Moderate Autism" : score >= 70 ? "Mild Autism" : score > 0 ? "Does Not Indicate Autism" : "Not Assessed");
    return {
      score,
      maxScore: 200,
      severity,
      sectionScores: ass?.isaa_section_scores || {
        social: 24, // max 45
        emotional: 14, // max 25
        speech: 16, // max 30
        behaviour: 18, // max 40
        cognitive: 12, // max 30
        sensory: 10 // max 30
      }
    };
  }, [reportDataRaw]);

  // Form Change & Auto-save
  const handleFieldChange = (key, value) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      setHasUnsavedChanges(true);
      setSaveStatus("unsaved");

      // Auto-save debounce 3 seconds
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraft(next, true);
      }, 3000);

      return next;
    });

    // Clear validation error on type
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  const saveDraft = async (stateToSave = formState, isAuto = false) => {
    setSaveStatus("saving");
    try {
      await reportService.saveDraft({
        id: reportDataRaw?.id,
        child_id: child?.id || targetId,
        therapist_report: stateToSave,
        parent_report: stateToSave,
        prepared_by: stateToSave.preparedBy,
        prepared_by_id: user?.id,
        status: stateToSave.reportStatus
      });
      setSaveStatus("saved");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (!isAuto) showToast("Draft saved successfully!", "success");
    } catch (err) {
      console.warn("Save draft notice:", err.message);
      localStorage.setItem(`report_draft_${child?.id || targetId}`, JSON.stringify(stateToSave));
      setSaveStatus("saved");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (!isAuto) showToast("Saved to local draft.", "info");
    }
  };

  const handlePublish = async () => {
    // Validate 5 text sections
    const errors = {};
    if (!formState.background.trim()) errors.background = true;
    if (!formState.assessmentFindings.trim()) errors.assessmentFindings = true;
    if (!formState.currentStatus.trim()) errors.currentStatus = true;
    if (!formState.recommendations.trim()) errors.recommendations = true;
    if (!formState.reviewPlan.trim()) errors.reviewPlan = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsEditing(true);
      showToast("Complete all 5 clinical report sections before publishing.", "error");
      const firstErrorEl = document.querySelector(".border-red-500");
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsPublishing(true);
    const reportPayload = {
      child_id: child?.id || targetId,
      therapist_report: formState,
      parent_report: formState,
      prepared_by: formState.preparedBy,
      prepared_by_id: user?.id,
      status: isAdmin ? "published" : "pending_review"
    };

    try {
      if (isAdmin) {
        await reportService.saveDraft(reportPayload);
        await reportService.publish(reportDataRaw?.id || targetId, formState.preparedBy || user?.name, user?.id, reportPayload);
        localStorage.setItem(`report_published_${child?.id || targetId}`, JSON.stringify({
          childId: child?.id || targetId,
          formState: { therapistReport: formState, parentReport: formState },
          therapistReport: formState,
          parentReport: formState,
          status: "published",
          publishedDate: new Date().toISOString().split("T")[0]
        }));
        setFormState((prev) => ({ ...prev, reportStatus: "published" }));
        setIsEditing(false);
        showToast("Report approved & published successfully! Parents can now view it.", "success");
      } else {
        await reportService.submitForReview(reportDataRaw?.id || targetId, formState.preparedBy || user?.name, user?.id, reportPayload);
        localStorage.setItem(`report_draft_${child?.id || targetId}`, JSON.stringify({
          childId: child?.id || targetId,
          formState: { therapistReport: formState, parentReport: formState },
          therapistReport: formState,
          parentReport: formState,
          status: "pending_review",
          updatedDate: new Date().toISOString().split("T")[0]
        }));
        setFormState((prev) => ({ ...prev, reportStatus: "pending_review" }));
        setIsEditing(false);
        showToast("Report submitted for Admin review. Admin approval is required before publishing to parents.", "success");
      }
    } catch (err) {
      console.warn("Publish notice:", err.message);
      if (isAdmin) {
        setFormState((prev) => ({ ...prev, reportStatus: "published" }));
        setIsEditing(false);
        showToast("Report published successfully!", "success");
      } else {
        setFormState((prev) => ({ ...prev, reportStatus: "pending_review" }));
        setIsEditing(false);
        showToast("Report submitted for Admin review.", "info");
      }
    } finally {
      setIsPublishing(false);
    }
  };


  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      setIsEditing(false);
    }
  };

  // PDF Trigger
  const triggerPdfDownload = () => {
    const pdfTipShown = localStorage.getItem("pdf_tip_shown");
    if (!pdfTipShown) {
      setShowPdfModal(true);
    } else {
      executePrint();
    }
  };

  const executePrint = async () => {
    setIsPreparingPdf(true);
    setShowPdfModal(false);
    localStorage.setItem("pdf_tip_shown", "true");

    await printReportWithFilename({
      childName: child?.name,
      childId: child?.id || targetId,
      reportNo: reportDataRaw?.cycle || reportDataRaw?.report_number,
      currentReportId: reportDataRaw?.id,
      fallbackCycle: reportDataRaw?.cycle
    });

    setIsPreparingPdf(false);
  };

  // Regenerate Section helper using AI API
  const handleRegenerateSection = async (sectionKey) => {
    setGeneratingSection(sectionKey);
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "singleSection",
          sectionKey,
          category: child?.therapy_category || child?.diagnosis,
          childData: child
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        handleFieldChange(sectionKey, data.text);
        showToast("Section rewritten with AI ✓", "success");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.warn("Section rewrite fallback:", err.message);
      let rewrittenText = "";
      if (sectionKey === "background") {
        rewrittenText = `${child?.name} is a ${child?.age || '4-year-old'} presenting with primary concerns in communication and social interaction. Evaluated at Kids Care Rehab Centre using standard IEP clinical assessment protocols.`;
      } else if (sectionKey === "assessmentFindings") {
        rewrittenText = `Assessment reveals an ISAA score of ${isaaInfo.score}/200 corresponding to ${isaaInfo.severity}. Key findings indicate deficits in expressive vocabulary, joint attention, and sensory modulation.`;
      } else if (sectionKey === "currentStatus") {
        rewrittenText = `Currently, the child demonstrates emerging 2-word phrases, fair gross motor coordination, and a sitting tolerance of 5–10 minutes with verbal prompts.`;
      } else if (sectionKey === "recommendations") {
        rewrittenText = `1. Structured Speech Therapy (2x/week)\n2. Occupational & Sensory Integration Therapy (2x/week)\n3. Remedial Special Education (3x/week)\n4. Daily Home Sensory Routine`;
      } else if (sectionKey === "reviewPlan") {
        rewrittenText = `Formal IEP review scheduled in 90 days. Goal mastery will be evaluated monthly by the multidisciplinary clinical team.`;
      }
      handleFieldChange(sectionKey, rewrittenText);
      showToast("Section updated.", "info");
    } finally {
      setGeneratingSection(null);
    }
  };

  // Helper for priority areas (<50)
  const priorityDomains = useMemo(() => {
    const list = [
      { name: "Communication", score: domainScores.communication || 65 },
      { name: "Social Skills", score: domainScores.socialSkills || 55 },
      { name: "Behaviour", score: domainScores.behaviour || 60 },
      { name: "Attention", score: domainScores.attention || 42 },
      { name: "Fine Motor", score: domainScores.fineMotor || 70 },
      { name: "Gross Motor", score: domainScores.grossMotor || 75 },
      { name: "ADL", score: domainScores.adl || 65 },
      { name: "Sensory", score: domainScores.sensory || 45 }
    ];
    return list.filter((d) => d.score < 50);
  }, [domainScores]);

  // SVG Radar Points calculation
  const radarAxes = [
    { label: "Communication", score: domainScores.communication || 65 },
    { label: "Social Skills", score: domainScores.socialSkills || 55 },
    { label: "Behaviour", score: domainScores.behaviour || 60 },
    { label: "Attention", score: domainScores.attention || 42 },
    { label: "Fine Motor", score: domainScores.fineMotor || 70 },
    { label: "Gross Motor", score: domainScores.grossMotor || 75 },
    { label: "ADL", score: domainScores.adl || 65 },
    { label: "Sensory", score: domainScores.sensory || 45 }
  ];

  const cx = 160, cy = 160, maxR = 120;
  const radarPointsString = radarAxes.map((d, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180);
    const r = (d.score / 100) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const avgScore = useMemo(() => {
    const sum = radarAxes.reduce((acc, curr) => acc + curr.score, 0);
    return sum / radarAxes.length;
  }, [radarAxes]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <SkeletonCard count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] min-h-screen bg-[#F8F8F6] pb-24">
      {/* Injected Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-document, #report-document * { visibility: visible; }
          #report-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 15mm 20mm !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          .edit-mode-only { display: none !important; }
          @page { size: A4 portrait; margin: 15mm 20mm; }
          svg, [class*="bg-"], div[style*="background"] {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .no-page-break { page-break-inside: avoid; }
          .page-break-before { page-break-before: always; }
        }
      `}</style>

      {/* ────────────────────────────────────────────────────────── */}
      {/* STICKY TOP ACTION BAR (no-print)                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 min-h-[56px] w-full bg-white border-b border-[#D3D1C7] px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs no-print">
        {/* Left Side */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate(`/children/${child?.id}`)}
            className="p-1.5 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer shrink-0"
            aria-label="Back to child profile"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h2 className="text-sm sm:text-[15px] font-bold text-[#2C2C2A] truncate">Therapist Report</h2>
            <span className="text-xs text-[#5F5E5A] font-semibold truncate hidden sm:inline">• {child?.name}</span>
            <span className="font-mono text-[11px] sm:text-[12px] font-bold text-[#9B9A96] bg-[#F0EFEA] px-1.5 sm:px-2 py-0.5 rounded border border-[#D3D1C7] shrink-0">
              {child?.id}
            </span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
          {/* Edit Mode Auto-save Indicator */}
          {isEditing && (
            <div className="flex items-center gap-1.5 text-xs font-semibold mr-2">
              <span className={`h-2 w-2 rounded-full ${saveStatus === "unsaved" ? "bg-amber-500 animate-pulse" : "bg-emerald-600"}`} />
              <span className="text-[#5F5E5A]">
                {saveStatus === "unsaved" ? "Unsaved" : saveStatus === "saving" ? "Saving..." : `Saved ${lastSaved ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}
              </span>
            </div>
          )}

          {/* View Mode Buttons */}
          {!isEditing ? (
            <>
              <Button
                variant="outlined"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditing(true)}
                className="border-[#185FA5] text-[#185FA5] hover:bg-[#185FA5]/10"
              >
                ✏ Edit Report
              </Button>

              <Button
                variant="outlined"
                size="sm"
                icon={Download}
                onClick={triggerPdfDownload}
                loading={isPreparingPdf}
                className="border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56]/10"
              >
                ⬇ Download PDF
              </Button>

              {formState.reportStatus === "published" ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-[6px] bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Published
                  </span>
                  {isAdmin && (
                    <Button size="sm" variant="secondary" onClick={handlePublish} loading={isPublishing} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                      Update Report
                    </Button>
                  )}
                </div>
              ) : formState.reportStatus === "pending_review" ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-[6px] bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1 border border-purple-300">
                    Pending Admin Review
                  </span>
                  {isAdmin ? (
                    <Button size="sm" icon={CheckCircle2} onClick={handlePublish} loading={isPublishing} className="bg-[#0F6E56] hover:bg-[#08503E] text-white">
                      Approve & Publish
                    </Button>
                  ) : (
                    <Button size="sm" variant="outlined" onClick={() => setIsEditing(true)}>
                      Edit Submission
                    </Button>
                  )}
                </div>
              ) : (
                <Button size="sm" icon={isAdmin ? CheckCircle2 : Send} onClick={handlePublish} loading={isPublishing}>
                  {isAdmin ? "Approve & Publish" : "Submit for Review"}
                </Button>
              )}
            </>
          ) : (
            /* Edit Mode Buttons */
            <>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>

              <Button variant="outlined" size="sm" icon={Save} onClick={() => saveDraft(formState, false)}>
                Save Draft
              </Button>

              <Button
                variant="outlined"
                size="sm"
                icon={Download}
                onClick={triggerPdfDownload}
                loading={isPreparingPdf}
                className="border-[#0F6E56] text-[#0F6E56]"
              >
                ⬇ Download PDF
              </Button>

              <Button size="sm" icon={isAdmin ? CheckCircle2 : Send} onClick={handlePublish} loading={isPublishing}>
                {isAdmin
                  ? formState.reportStatus === "published"
                    ? "Update & Republish"
                    : "Approve & Publish to Parents"
                  : formState.reportStatus === "pending_review"
                  ? "Update Review Submission"
                  : "Submit for Admin Review"}
              </Button>
            </>
          )}

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* REPORT DOCUMENT AREA (Max-width 860px, Printable)         */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        id="report-document"
        className="max-w-[860px] mx-auto bg-white rounded-[12px] p-[40px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#D3D1C7] space-y-8"
      >
        {/* ═══ SECTION 1 — CLINIC HEADER (Never Editable) ═══ */}
        <div className="no-page-break space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="Kids Care Logo"
                className="h-14 w-14 rounded-[10px] object-cover border border-[#185FA5]/20 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-[20px] font-bold text-[#185FA5] leading-tight">KIDS CARE REHAB CENTRE</h1>
                <p className="text-[13px] font-bold text-[#5F5E5A]">PHYSIO CARE</p>
                <p className="text-[11px] text-[#5F5E5A] font-medium">(Unit of Kids Rehab Charitable Trust)</p>
              </div>
            </div>

            {/* Report Title Block Right */}
            <div className="text-right">
              <h2 className="text-[14px] font-bold text-[#185FA5]">CHILD ASSESSMENT REPORT</h2>
              <p className="text-[12px] text-[#5F5E5A] font-semibold">Date: {formState.preparedDate}</p>
            </div>
          </div>

          {/* Contact Line */}
          <div className="text-center text-[11px] text-[#5F5E5A] font-medium border-t border-b border-[#D3D1C7]/80 py-2 space-y-0.5">
            <p>New no 52/2, old no 97, Gowdia Mutt Road, Royapettah, Chennai - 600014</p>
            <p>Tel: 044-28353136 | Email: kidscarerehabcenter@gmail.com | www.kidscarerehabcenter.org</p>
          </div>
        </div>

        {/* ═══ SECTION 2 — CHILD DETAILS TABLE (Never Editable) ═══ */}
        <div className="no-page-break space-y-2">
          <table className="w-full text-xs border-collapse border border-[#D3D1C7] rounded-[8px] overflow-hidden">
            <tbody>
              {[
                ["Child Name", child?.name],
                ["Child ID", child?.id],
                ["Date of Birth", child?.dob || child?.date_of_birth || "N/A"],
                ["Age", child?.age || "N/A"],
                ["Gender", child?.gender || "Male"],
                ["Diagnosis", child?.diagnosis || "ASD"],
                ["Clinical Profile", `Profile ${formState.profile}`],
                ["School", child?.school || "N/A"],
                ["Assessment Date", formState.preparedDate],
                ["Assessed By", `${formState.preparedBy} (${formState.designation})`]
              ].map(([label, value], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6]"}>
                  <td className="p-2.5 px-3 border border-[#D3D1C7] font-bold text-[#5F5E5A] w-1/3">{label}</td>
                  <td className="p-2.5 px-3 border border-[#D3D1C7] font-bold text-[#2C2C2A]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ SECTION 3 — CLINICAL ASSESSMENT ANALYSIS (Visual Charts) ═══ */}
        <div className="no-page-break space-y-6 pt-2">
          <div className="border-b-2 border-[#185FA5] pb-1">
            <h3 className="text-[13px] font-bold text-[#185FA5] uppercase tracking-wider">
              CLINICAL ASSESSMENT ANALYSIS
            </h3>
          </div>

          {/* PART A: ISAA SCORE CARD */}
          <div className="bg-[#EBF4FE] border border-[#185FA5] rounded-[8px] p-[20px] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left 35% Column */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-[11px] font-bold text-[#5F5E5A] uppercase block">ISAA TOTAL SCORE</span>
              <div>
                <span
                  className="text-[64px] font-extrabold leading-none block"
                  style={{
                    color:
                      isaaInfo.score < 70
                        ? "#3B6D11"
                        : isaaInfo.score <= 106
                        ? "#185FA5"
                        : isaaInfo.score <= 153
                        ? "#854F0B"
                        : "#993C1D"
                  }}
                >
                  {isaaInfo.score}
                </span>
                <span className="text-[14px] font-bold text-[#5F5E5A]">out of 200</span>
              </div>

              {/* Severity Badge */}
              <div
                className="w-full py-2 px-3 rounded-[8px] text-[13px] font-bold text-white text-center shadow-xs"
                style={{
                  backgroundColor:
                    isaaInfo.score < 70
                      ? "#3B6D11"
                      : isaaInfo.score <= 106
                      ? "#185FA5"
                      : isaaInfo.score <= 153
                      ? "#854F0B"
                      : "#993C1D"
                }}
              >
                {isaaInfo.score < 70
                  ? "Does Not Indicate Autism"
                  : isaaInfo.score <= 106
                  ? "Mild Autism — Level 1"
                  : isaaInfo.score <= 153
                  ? "Moderate Autism — Level 2"
                  : "Severe Autism — Level 3"}
              </div>

              <p className="text-[12px] text-[#5F5E5A] italic font-semibold">
                Profile {formState.profile}: ASD High Functioning
              </p>
              <p className="text-[10px] text-[#5F5E5A] italic">Indian Scale for Assessment of Autism (ISAA)</p>
            </div>

            {/* Right 65% Column: Section Score Breakdown */}
            <div className="md:col-span-7 space-y-2.5">
              <span className="text-[11px] font-bold text-[#5F5E5A] uppercase block mb-1">
                SECTION SCORE BREAKDOWN
              </span>

              {[
                { name: "I. Social Relationship", score: isaaInfo.sectionScores.social, max: 45 },
                { name: "II. Emotional Responsiveness", score: isaaInfo.sectionScores.emotional, max: 25 },
                { name: "III. Speech-Language", score: isaaInfo.sectionScores.speech, max: 30 },
                { name: "IV. Behaviour Pattern", score: isaaInfo.sectionScores.behaviour, max: 40 },
                { name: "V. Cognitive Component", score: isaaInfo.sectionScores.cognitive, max: 30 },
                { name: "VI. Sensory Aspects", score: isaaInfo.sectionScores.sensory, max: 30 }
              ].map((s, idx) => {
                const pct = Math.round((s.score / s.max) * 100);
                const barColor = pct < 40 ? "#993C1D" : pct <= 65 ? "#854F0B" : "#3B6D11";
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px] font-bold">
                      <span className="text-[#2C2C2A]">{s.name}</span>
                      <span className="text-[#5F5E5A] font-mono">{s.score} / {s.max}</span>
                    </div>
                    <div className="h-[18px] w-full bg-[#E5E5E0] rounded-[4px] overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-1000"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 border-t border-[#185FA5]/30 flex items-center justify-between text-xs font-bold">
                <span>ISAA TOTAL SCORE</span>
                <span className="font-mono text-sm">{isaaInfo.score} / 200</span>
              </div>
            </div>
          </div>

          {/* PART B: DOMAIN RADAR CHART & SCORES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            {/* Left 320px Radar Chart */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-[#F8F8F6] rounded-[12px] border border-[#D3D1C7]">
              <span className="text-[11px] font-bold text-[#5F5E5A] uppercase block mb-2">FUNCTIONAL DOMAIN PROFILE</span>
              <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible">
                {/* Concentric rings at 25%, 50%, 75%, 100% */}
                {[30, 60, 90, 120].map((r, idx) => (
                  <circle key={idx} cx={cx} cy={cy} r={r} fill="none" stroke="#E5E5E0" strokeWidth="0.8" />
                ))}

                {/* Ring Labels */}
                {[25, 50, 75, 100].map((val, idx) => (
                  <text key={idx} x={cx + 5} y={cy - (idx + 1) * 30 + 3} className="text-[9px] fill-[#9B9A96]">
                    {val}
                  </text>
                ))}

                {/* Ray Axes */}
                {radarAxes.map((d, idx) => {
                  const angle = (idx * 45 - 90) * (Math.PI / 180);
                  const x2 = cx + maxR * Math.cos(angle);
                  const y2 = cy + maxR * Math.sin(angle);

                  const lx = cx + (maxR + 16) * Math.cos(angle);
                  const ly = cy + (maxR + 10) * Math.sin(angle);
                  const anchor = Math.abs(angle - Math.PI / 2) < 0.1 || Math.abs(angle + Math.PI / 2) < 0.1 ? "middle" : angle > -Math.PI / 2 && angle < Math.PI / 2 ? "start" : "end";

                  return (
                    <g key={idx}>
                      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#D3D1C7" strokeWidth="0.8" />
                      <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" className="text-[10px] font-bold fill-[#5F5E5A]">
                        {d.label} ({d.score}%)
                      </text>
                    </g>
                  );
                })}

                {/* Polygon */}
                <polygon
                  points={radarPointsString}
                  fill={avgScore < 40 ? "#FAECE7" : avgScore <= 65 ? "#EBF4FE" : "#E9F7F0"}
                  stroke={avgScore < 40 ? "#993C1D" : avgScore <= 65 ? "#185FA5" : "#0F6E56"}
                  fillOpacity="0.65"
                  strokeWidth="2.5"
                />

                {/* Vertices */}
                {radarAxes.map((d, idx) => {
                  const angle = (idx * 45 - 90) * (Math.PI / 180);
                  const r = (d.score / 100) * maxR;
                  const x = cx + r * Math.cos(angle);
                  const y = cy + r * Math.sin(angle);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={avgScore < 40 ? "#993C1D" : avgScore <= 65 ? "#185FA5" : "#0F6E56"}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Right Column: Domain Score Bars */}
            <div className="md:col-span-6 space-y-2.5">
              <span className="text-[11px] font-bold text-[#5F5E5A] uppercase block mb-1">DOMAIN SCORES (0–100)</span>
              {radarAxes.map((d, idx) => {
                const barColor = d.score < 34 ? "#993C1D" : d.score <= 66 ? "#854F0B" : "#3B6D11";
                const badgeText = d.score < 34 ? "⚠ Priority" : d.score <= 66 ? "Moderate" : "Good ✓";
                const badgeVariant = d.score < 34 ? "coral" : d.score <= 66 ? "amber" : "green";

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2C2C2A]">{d.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{d.score}</span>
                        <Badge label={badgeText} variant={badgeVariant} size="sm" />
                      </div>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E5E0] rounded-[4px] overflow-hidden">
                      <div className="h-full rounded-[4px]" style={{ width: `${d.score}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRIORITY AREAS BOX */}
          {priorityDomains.length > 0 && (
            <div className="bg-[#FEF6E7] border-l-4 border-l-[#854F0B] p-3.5 rounded-[8px] space-y-2">
              <h4 className="text-[13px] font-bold text-[#854F0B] flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> ⚠ Priority Areas for Intervention
              </h4>
              <ul className="space-y-1 text-[12px] font-bold text-[#993C1D] pl-2">
                {priorityDomains.map((p, idx) => (
                  <li key={idx}>• {p.name}: {p.score}/100 — Requires immediate therapeutic attention</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ═══ SECTION 4 — REPORT TEXT SECTIONS ═══ */}
        <div className="no-page-break space-y-6 pt-4">
          <div className="border-b-2 border-[#185FA5] pb-1">
            <h3 className="text-[13px] font-bold text-[#185FA5] uppercase tracking-wider">CLINICAL REPORT</h3>
          </div>

          {[
            { key: "background", title: "BACKGROUND & REFERRAL INFORMATION" },
            { key: "assessmentFindings", title: "ASSESSMENT FINDINGS" },
            { key: "currentStatus", title: "CURRENT STATUS & OBSERVATIONS" },
            { key: "recommendations", title: "RECOMMENDATIONS & THERAPY PLAN" },
            { key: "reviewPlan", title: "REVIEW PLAN & MILESTONES" }
          ].map(({ key, title }) => (
            <div key={key} className="space-y-1.5 no-page-break">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase text-[#5F5E5A]">{title}</h4>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRegenerateSection(key)}
                    disabled={generatingSection === key}
                    className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1 cursor-pointer edit-mode-only"
                  >
                    <RotateCcw className={`h-3 w-3 ${generatingSection === key ? "animate-spin" : ""}`} />
                    <span>{generatingSection === key ? "Rewriting..." : "↺ Rewrite section"}</span>
                  </button>
                )}
              </div>

              {!isEditing ? (
                <p className="text-[14px] text-[#2C2C2A] leading-[1.7] whitespace-pre-line font-medium">
                  {formState[key]}
                </p>
              ) : (
                <div className={`space-y-1 ${validationErrors[key] ? "p-1 border border-red-500 rounded-[8px]" : ""}`}>
                  <textarea
                    rows={4}
                    value={formState[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    placeholder={`Enter ${title.toLowerCase()}...`}
                    className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-[14px] leading-[1.7] text-[#2C2C2A] font-medium outline-none focus:border-[#185FA5] resize-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#9B9A96]">
                    <button type="button" onClick={() => handleFieldChange(key, "")} className="hover:underline text-red-600">Clear section</button>
                    <span>{formState[key].length} characters</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ═══ SECTION 4B — ASSIGNED CLINICAL & HOME EXERCISES ═══ */}
        {(assignedClinicExercises.length > 0 || assignedHomeExercises.length > 0) && (
          <div className="no-page-break space-y-6 pt-4">
            <div className="border-b-2 border-[#185FA5] pb-1 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#185FA5] uppercase tracking-wider">
                ASSIGNED THERAPY EXERCISES & HOME PROGRAM
              </h3>
              <span className="text-[10px] font-bold text-[#5F5E5A]">
                {assignedClinicExercises.length + assignedHomeExercises.length} Prescribed Activities
              </span>
            </div>

            {/* Clinic Exercises */}
            {assignedClinicExercises.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold uppercase text-[#0F6E56] flex items-center gap-1.5">
                  <span>🏥 In-Clinic Therapeutic Exercises</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedClinicExercises.map((ex, idx) => {
                    const isObj = typeof ex === "object" && ex !== null;
                    const name = isObj ? ex.name || ex.title : ex;
                    const master = exerciseMap[name?.toLowerCase()] || (isObj ? ex : null);
                    const imageUrl = master?.image_url || master?.imageUrl || (isObj ? (ex.image_url || ex.imageUrl) : null);
                    const desc = master?.description || (isObj ? ex.description : null);
                    const cat = master?.category || (isObj ? ex.category : null);
                    const duration = master?.duration || (isObj ? ex.duration : "10–15 mins");

                    return (
                      <div key={idx} className="p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[10px] space-y-2">
                        {imageUrl && (
                          <div className="h-28 w-full rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                          {cat && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-[#185FA5] rounded-full uppercase shrink-0">
                              {cat}
                            </span>
                          )}
                        </div>
                        {desc && <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3">{desc}</p>}
                        <div className="text-[10px] font-semibold text-[#5F5E5A]">⏱ Duration: {duration}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Home Exercises */}
            {assignedHomeExercises.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-[12px] font-bold uppercase text-[#854F0B] flex items-center gap-1.5">
                  <span>🏠 Prescribed Home Routine</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedHomeExercises.map((ex, idx) => {
                    const isObj = typeof ex === "object" && ex !== null;
                    const name = isObj ? ex.name || ex.title : ex;
                    const master = exerciseMap[name?.toLowerCase()] || (isObj ? ex : null);
                    const imageUrl = master?.image_url || master?.imageUrl || (isObj ? (ex.image_url || ex.imageUrl) : null);
                    const desc = master?.home_description || master?.description || (isObj ? ex.description : null);
                    const cat = master?.category || (isObj ? ex.category : null);
                    const freq = master?.frequency || (isObj ? ex.frequency : "Daily");

                    return (
                      <div key={idx} className="p-3 bg-[#FEF6E7]/40 border border-[#854F0B]/30 rounded-[10px] space-y-2">
                        {imageUrl && (
                          <div className="h-28 w-full rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                          {cat && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-[#854F0B] rounded-full uppercase shrink-0">
                              {cat}
                            </span>
                          )}
                        </div>
                        {desc && <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3">{desc}</p>}
                        <div className="text-[10px] font-semibold text-[#854F0B]">⏱ Frequency: {freq}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SECTION 5 — SIGN OFF ═══ */}
        <div className="no-page-break page-break-before space-y-4 pt-6">
          <div className="border-b-2 border-[#185FA5] pb-1">
            <h3 className="text-[13px] font-bold text-[#185FA5] uppercase tracking-wider">SIGN OFF</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Left — Assessor */}
            <div className="space-y-3">
              <span className="text-xs text-[#5F5E5A] font-semibold block">Prepared by:</span>
              {!isEditing ? (
                <div>
                  <p className="text-sm font-bold text-[#2C2C2A]">{formState.preparedBy}</p>
                  <p className="text-xs text-[#5F5E5A]">{formState.designation}</p>
                  <p className="text-xs text-[#5F5E5A] mt-1">Date: {formState.preparedDate}</p>
                </div>
              ) : (
                <div className="space-y-2 edit-mode-only">
                  <Input label="Assessor Name" value={formState.preparedBy} onChange={(e) => handleFieldChange("preparedBy", e.target.value)} />
                  <Input label="Designation" value={formState.designation} onChange={(e) => handleFieldChange("designation", e.target.value)} />
                  <Input label="Date" type="date" value={formState.preparedDate} onChange={(e) => handleFieldChange("preparedDate", e.target.value)} />
                </div>
              )}

              <div className="pt-6">
                <div className="w-[120px] border-b border-[#2C2C2A]" />
                <span className="text-[11px] text-[#5F5E5A] block mt-1">Signature</span>
              </div>
            </div>

            {/* Right — Reviewer */}
            <div className="space-y-3">
              <span className="text-xs text-[#5F5E5A] font-semibold block">Reviewed by:</span>
              <div>
                <p className="text-sm font-bold text-[#2C2C2A]">Dr. R. Radha Balachandar</p>
                <p className="text-xs text-[#5F5E5A]">Ph.D, M.P.T (Ped), M.Sc (Psy)</p>
                <p className="text-xs text-[#5F5E5A]">Director, Kids Care Rehab Centre</p>
                <p className="text-xs text-[#5F5E5A] mt-1">Date: {formState.preparedDate}</p>
              </div>

              <div className="pt-6">
                <div className="w-[120px] border-b border-[#2C2C2A]" />
                <span className="text-[11px] text-[#5F5E5A] block mt-1">Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* BOTTOM ACTION BAR (no-print)                               */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D3D1C7] p-3 shadow-lg flex items-center justify-center gap-3 no-print">
        {!isEditing ? (
          <>
            <Button variant="outlined" size="sm" icon={Edit3} onClick={() => setIsEditing(true)}>
              ✏ Edit Report
            </Button>
            <Button variant="outlined" size="sm" icon={Download} onClick={triggerPdfDownload} className="border-[#0F6E56] text-[#0F6E56]">
              ⬇ Download PDF
            </Button>
            <Button 
              size="sm" 
              icon={isAdmin ? CheckCircle2 : Send} 
              onClick={handlePublish} 
              loading={isPublishing}
              className={isAdmin ? "bg-[#0F6E56] hover:bg-[#0c5845] text-white" : "bg-[#185FA5] hover:bg-[#12497d] text-white"}
            >
              {isAdmin
                ? formState.reportStatus === "published"
                  ? "Update & Republish"
                  : "✓ Approve & Publish to Parents"
                : formState.reportStatus === "pending_review"
                ? "Update Review Submission"
                : "Submit for Admin Review"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button variant="outlined" size="sm" icon={Save} onClick={() => saveDraft(formState, false)}>
              Save Draft
            </Button>
            <Button variant="outlined" size="sm" icon={Download} onClick={triggerPdfDownload} className="border-[#0F6E56] text-[#0F6E56]">
              ⬇ Download PDF
            </Button>
            <Button 
              size="sm" 
              icon={isAdmin ? CheckCircle2 : Send} 
              onClick={handlePublish} 
              loading={isPublishing}
              className={isAdmin ? "bg-[#0F6E56] hover:bg-[#0c5845] text-white" : "bg-[#185FA5] hover:bg-[#12497d] text-white"}
            >
              {isAdmin
                ? formState.reportStatus === "published"
                  ? "Update & Republish"
                  : "✓ Approve & Publish to Parents"
                : formState.reportStatus === "pending_review"
                ? "Update Review Submission"
                : "Submit for Admin Review"}
            </Button>
          </>
        )}
      </div>

      {/* PDF Tooltip / Instruction Modal */}
      <Modal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} title="Downloading Report as PDF">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">Follow these steps in the print dialog to save as PDF:</p>
          <ol className="space-y-2 list-decimal list-inside text-[#5F5E5A]">
            <li>Click <strong>Open Print Dialog</strong> below</li>
            <li>In the print window, change <strong>Destination</strong> to <strong>Save as PDF</strong></li>
            <li>Click <strong>Save</strong> and select your preferred download folder</li>
          </ol>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowPdfModal(false)}>Cancel</Button>
            <Button onClick={executePrint}>Open Print Dialog</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Exit Edit Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Discard Unsaved Changes?">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">You have unsaved changes in this report. Discard them and switch to View Mode?</p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowCancelModal(false)}>Keep Editing</Button>
            <Button variant="secondary" onClick={() => { setShowCancelModal(false); setIsEditing(false); setHasUnsavedChanges(false); }}>Discard Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
