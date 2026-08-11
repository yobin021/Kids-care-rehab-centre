"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { reportService } from "../services/reportService";
import { exerciseService } from "../services/exerciseService";

export default function ReportGenerationEditor() {
  const { id, childId: paramChildId, reportId } = useParams();
  const targetId = paramChildId || reportId || id || "KCR-2024-002";
  const navigate = useNavigate();
  const { user, childrenList, updateChildDetails, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === targetId) || childrenList[1] || childrenList[0];

  // Exercises fetched from Supabase DB
  const [availableDbExercises, setAvailableDbExercises] = useState([]);

  useEffect(() => {
    exerciseService.getAll().then((list) => {
      if (list) setAvailableDbExercises(list);
    }).catch(console.error);
  }, []);

  // Active Tab: therapist | parent | exercises
  const [activeTab, setActiveTab] = useState("therapist");

  // Save Status: idle | unsaved | saving | saved
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSavedTime, setLastSavedTime] = useState(new Date());
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // Status: draft | published
  const [reportStatus, setReportStatus] = useState(child?.reportsCount > 0 ? "published" : "draft");
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals & Banners
  const [showParentPreviewModal, setShowParentPreviewModal] = useState(false);
  const [showRegenTherapistModal, setShowRegenTherapistModal] = useState(false);
  const [showRegenParentModal, setShowRegenParentModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [addExType, setAddExType] = useState("clinic"); // clinic | home
  const [exSearch, setExSearch] = useState("");

  // Validation & Section Loading States
  const [validationErrors, setValidationErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // Single Form State Object for All Editable Fields
  const [formState, setFormState] = useState({
    therapistReport: {
      background: `${child?.name} is a ${child?.age} ${child?.gender} presenting with ${child?.primaryConcern}. Evaluated using ISAA protocol by therapy team.`,
      assessmentFindings: "Clinical assessment evaluated using standard clinical IEP & ISAA protocols. Primary deficits in communication, social interaction, and attention are monitored.",
      currentStatus: `${child?.name} responds to name call consistently and follows 1-step commands. Shows progress in understanding routines, while working on turn-taking.`,
      recommendations: "Speech therapy 2x/week, Occupational therapy with sensory integration 2x/week, Parent guidance program.",
      reviewPlan: "Progress will be re-evaluated in 12 weeks to assess gains in expressive vocabulary and sitting tolerance.",
      preparedBy: "Priya S",
      designation: "Senior Therapist",
      date: new Date().toISOString().split("T")[0]
    },
    parentReport: {
      aboutYourChild: `We are happy to share that ${child?.name || "your child"} has made progress during therapy sessions. They demonstrate good engagement and curiosity during interactive tasks.`,
      whatWeFound: `${child?.name || "Your child"} shows strong visual processing and enthusiasm for learning activities. Speech clarity and social interaction are being actively supported.`,
      strengths: [
        "Responds consistently to name call",
        "Expresses needs clearly",
        "Warm and friendly with staff",
        "Enjoys sensory play activities"
      ],
      workingOn: "Building two-word phrase communication, sitting tolerance, and turn-taking with peers.",
      focusAreas: [
        "Expanding vocabulary and sentence length",
        "Social interaction in group settings",
        "Sitting tolerance during quiet table tasks"
      ],
      therapyPlan: "Speech + Occupational Therapy",
      therapyType: "Speech + Occupational Therapy",
      sessionsPerWeek: 2,
      duration: "6 months",
      nextReviewDate: "2026-10-15",
      homeAdvice: "Practise naming objects during daily routines (bathing, meal time). Encourage 2-word requests before handing items.",
      homeSuggestions: [
        "Practise naming objects during daily activities",
        "Use picture cards during meals and play time",
        "Encourage 2-word requests before giving items"
      ],
      encouragement: `With your support at home and our guidance at the clinic, ${child?.name || "your child"} will continue to grow beautifully.`
    },
    exercises: {
      clinicExercises: [
        "Brain Gym Exercises",
        "Sensory Integration Activities",
        "Speech Therapy Exercises",
        "Communication Cards",
        "Social Skills Training"
      ],
      homeExercises: [
        "Brain Gym Exercises",
        "Communication Cards",
        "Sensory Integration Activities"
      ],
      parentNotes: "Practise 15 minutes daily before bedtime.",
      therapyDays: ["Mon", "Wed", "Fri"],
      sessionTime: "10:00",
      sessionDuration: "60",
      frequencyPerWeek: 2,
      startDate: new Date().toISOString().split("T")[0],
      nextReviewDate: "2026-10-15"
    }
  });

  // Load saved draft/published report from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`report_published_${child?.id}`) || localStorage.getItem(`report_draft_${child?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formState) {
          setFormState(parsed.formState);
        } else {
          setFormState((prev) => ({
            ...prev,
            therapistReport: { ...prev.therapistReport, ...(parsed.therapistReport || {}) },
            parentReport: { ...prev.parentReport, ...(parsed.parentReport || {}) },
            exercises: {
              ...prev.exercises,
              clinicExercises: parsed.clinicEx || prev.exercises.clinicExercises,
              homeExercises: parsed.homeEx || prev.exercises.homeExercises
            }
          }));
        }
        if (parsed.publishedDate || localStorage.getItem(`report_published_${child?.id}`)) {
          setReportStatus("published");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [child?.id]);

  // Auto-Save Debounce Handler (3 seconds)
  const autoSaveTimer = useRef(null);

  const triggerAutoSave = (nextState) => {
    setSaveStatus("unsaved");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      const payload = {
        childId: child?.id,
        formState: nextState || formState,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`report_draft_${child?.id}`, JSON.stringify(payload));
      setTimeout(() => {
        setSaveStatus("saved");
        setLastSavedTime(new Date());
      }, 400);
    }, 3000);
  };

  // Keyboard Shortcuts (Ctrl+S / Cmd+S and Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
      if (e.key === "Escape" && showParentPreviewModal) {
        setShowParentPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formState, showParentPreviewModal]);

  // Manual Immediate Save
  const handleManualSave = () => {
    setIsManualSaving(true);
    setSaveStatus("saving");
    const payload = {
      childId: child?.id,
      formState,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`report_draft_${child?.id}`, JSON.stringify(payload));
    setTimeout(() => {
      setIsManualSaving(false);
      setManualSaveSuccess(true);
      setSaveStatus("saved");
      setLastSavedTime(new Date());
      showToast("Report draft saved manually.", "success");
      setTimeout(() => setManualSaveSuccess(false), 2000);
    }, 500);
  };

  // State Update Helpers
  const updateTherapist = (field, val) => {
    const next = {
      ...formState,
      therapistReport: { ...formState.therapistReport, [field]: val }
    };
    setFormState(next);
    triggerAutoSave(next);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const updateParent = (field, val) => {
    const next = {
      ...formState,
      parentReport: { ...formState.parentReport, [field]: val }
    };
    setFormState(next);
    triggerAutoSave(next);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const updateExercises = (field, val) => {
    const next = {
      ...formState,
      exercises: { ...formState.exercises, [field]: val }
    };
    setFormState(next);
    triggerAutoSave(next);
  };

  // Single Section Rewrite API Call
  const handleRewriteSection = async (sectionKey, promptText, targetTab = "therapist") => {
    setSectionLoading((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "singleSection",
          sectionKey,
          customPrompt: promptText,
          childData: child
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        if (targetTab === "therapist") {
          updateTherapist(sectionKey, data.text);
        } else {
          updateParent(sectionKey, data.text);
        }
        showToast("✓ Section updated", "success");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not regenerate this section. Please edit manually.", "danger");
      setValidationErrors((prev) => ({ ...prev, [sectionKey]: true }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Full Tab Regeneration API Call
  const handleRegenerateEntireReport = async (targetTab) => {
    if (targetTab === "therapist") setShowRegenTherapistModal(false);
    else setShowRegenParentModal(false);

    setSectionLoading((prev) => ({ ...prev, fullTab: true }));

    try {
      const savedResult = localStorage.getItem(`assessment_result_${child?.id}`);
      let isaaRes = null;
      let domainScores = null;
      if (savedResult) {
        const parsed = JSON.parse(savedResult);
        isaaRes = parsed.isaa;
        domainScores = parsed.domainScores;
      }

      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full",
          childData: child,
          isaaResults: isaaRes,
          domainScores
        })
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        if (targetTab === "therapist" && resData.data.therapistReport) {
          setFormState((prev) => ({
            ...prev,
            therapistReport: { ...prev.therapistReport, ...resData.data.therapistReport }
          }));
        } else if (targetTab === "parent" && resData.data.parentReport) {
          setFormState((prev) => ({
            ...prev,
            parentReport: { ...prev.parentReport, ...resData.data.parentReport }
          }));
        }
        triggerAutoSave();
        showToast("Report regenerated successfully", "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Regeneration failed. Please edit manually.", "danger");
    } finally {
      setSectionLoading((prev) => ({ ...prev, fullTab: false }));
    }
  };

  // Validation Check before Publish
  const handleValidateAndPublish = () => {
    const errors = {};
    const fallbackPhrases = ["please write this section.", "please fill manually.", ""];

    // Check therapist report fields
    ["background", "assessmentFindings", "currentStatus", "recommendations", "reviewPlan"].forEach((f) => {
      const val = (formState.therapistReport[f] || "").trim().toLowerCase();
      if (fallbackPhrases.includes(val)) {
        errors[f] = true;
      }
    });

    // Check parent report fields
    ["aboutYourChild", "whatWeFound", "workingOn", "homeAdvice", "encouragement"].forEach((f) => {
      const val = (formState.parentReport[f] || "").trim().toLowerCase();
      if (fallbackPhrases.includes(val)) {
        errors[f] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast(`${Object.keys(errors).length} section(s) need attention before publishing.`, "danger");

      // Auto scroll to first failed element
      const firstFailed = document.querySelector(".border-red-500");
      if (firstFailed) {
        firstFailed.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setValidationErrors({});
    setShowPublishModal(true);
  };

  // Publish / Republish Action — saves to DB (insert/update + publish) + localStorage cache
  const executePublish = async () => {
    setIsPublishing(true);
    const pubDate = new Date().toISOString().split("T")[0];

    try {
      // Step 1: Build complete report object
      const reportPayload = {
        child_id: child?.id,
        therapist_report: formState.therapistReport,
        parent_report: formState.therapistReport,
        clinic_exercises: formState.exercises.clinicExercises,
        home_exercises: formState.exercises.homeExercises,
        therapy_details: {
          therapyType: formState.parentReport.therapyType || "Occupational & Speech Therapy",
          sessionsPerWeek: formState.parentReport.sessionsPerWeek || "2 sessions/week",
          duration: formState.parentReport.duration || "6 months",
          nextReviewDate: formState.parentReport.nextReviewDate || "12 weeks"
        },
        prepared_by: formState.therapistReport.preparedBy || user?.name || null,
        prepared_by_id: user?.id || null,
        status: "draft"
      };

      // Step 2: Save draft or update existing draft in DB
      let currentReportId = formState.reportId;
      if (!currentReportId) {
        const saved = await reportService.saveDraft(reportPayload);
        currentReportId = saved?.id || child?.id;
        if (saved?.id) {
          setFormState((prev) => ({ ...prev, reportId: saved.id }));
        }
      } else {
        await reportService.update(currentReportId, reportPayload);
      }

      // Step 3: Mark as published in DB
      await reportService.publish(
        currentReportId,
        formState.therapistReport.preparedBy || user?.name || null,
        user?.id || null,
        reportPayload
      );

      // Step 4: Update localStorage as cache
      const fullPublishedData = {
        childId: child?.id,
        childName: child?.name,
        publishedDate: pubDate,
        formState,
        therapistReport: formState.therapistReport,
        parentReport: formState.therapistReport,
        clinicEx: formState.exercises.clinicExercises,
        homeEx: formState.exercises.homeExercises
      };
      if (child?.id) {
        localStorage.setItem(`report_published_${child.id}`, JSON.stringify(fullPublishedData));
      }

      // Step 5: Update child details & show success
      if (child?.id) {
        updateChildDetails(child.id, {
          reportsCount: (child.reportsCount || 0) + 1,
          lastReportDate: pubDate
        });
      }

      setReportStatus("published");
      setShowPublishModal(false);
      showToast(`Report published successfully for ${child?.name || "child"}!`, "success");
    } catch (err) {
      console.error("Publish failed:", err);
      showToast("Failed to publish report. Please try again.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper for Auto-save Time String
  const getTimeAgoStr = () => {
    const diffMins = Math.floor((new Date() - lastSavedTime) / 60000);
    if (diffMins < 1) return "Just now";
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="space-y-4 text-[#2C2C2A] pb-24 max-w-6xl mx-auto">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/children/${child?.id}`)}
            className="p-1.5 rounded-[8px] border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#2C2C2A]">{child?.name}</h2>
              <span className="font-mono text-[12px] text-[#9B9A96]">{child?.id}</span>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden md:block text-sm font-bold text-[#185FA5]">
          Report Review & Edit
        </div>

        {/* RIGHT (Four items in a row) */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* 1. Auto-save indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {saveStatus === "unsaved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-800 font-bold">Unsaved changes</span>
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#185FA5] animate-spin" />
                <span className="text-[#185FA5] font-bold">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[#5F5E5A]">Saved {getTimeAgoStr()}</span>
              </>
            )}
          </div>

          {/* 2. Status Badge */}
          <Badge
            label={reportStatus === "published" ? "Published" : "Draft"}
            variant={reportStatus === "published" ? "green" : "amber"}
            size="md"
          />

          {/* 3. [Save Draft] button */}
          <Button
            variant="outlined"
            size="sm"
            icon={Save}
            disabled={saveStatus === "saving" || isManualSaving}
            onClick={handleManualSave}
          >
            {isManualSaving ? "Saving..." : manualSaveSuccess ? "Saved ✓" : "Save Draft"}
          </Button>

          {/* 4. [Publish Report] button */}
          <Button
            variant={reportStatus === "published" ? "secondary" : "primary"}
            size="sm"
            icon={Send}
            onClick={handleValidateAndPublish}
          >
            {reportStatus === "published" ? "Update & Republish" : "Publish Report"}
          </Button>
        </div>

      </div>

      {/* PUBLISHED REPORT EDIT BANNER */}
      {reportStatus === "published" && (
        <div className="bg-[#FEF3C7] border-l-4 border-[#854F0B] p-4 rounded-r-[8px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-[#854F0B] shrink-0 mt-0.5" />
            <div className="text-xs text-[#854F0B]">
              <strong className="font-bold block">You are editing a published report.</strong>
              <span>Any changes you save will immediately update what {child?.parent?.name} sees on their portal.</span>
            </div>
          </div>

          <Button
            variant="outlined"
            size="sm"
            className="border-[#854F0B] text-[#854F0B] hover:bg-amber-100 shrink-0"
            icon={Eye}
            onClick={() => setShowParentPreviewModal(true)}
          >
            View Current Parent Version
          </Button>
        </div>
      )}

      {/* TOP VALIDATION ERROR BANNER */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-300 rounded-[12px] text-red-900 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            <span>{Object.keys(validationErrors).length} section(s) need attention before you can publish.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setValidationErrors({})}>Dismiss</Button>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("therapist")}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "therapist" ? "bg-[#185FA5] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"
          }`}
        >
          Clinical Report (Editable)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exercises")}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "exercises" ? "bg-[#3C3489] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"
          }`}
        >
          Assigned Exercises & Tools
        </button>
      </div>

      {/* TAB 1: THERAPIST REPORT */}
      {activeTab === "therapist" && (
        <div className="space-y-6">
          
          {/* TOOLBAR */}
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-2 text-xs">
            <span className="text-[12px] text-[#5F5E5A] font-medium">AI Generated — Edit as needed</span>
            <Button
              variant="outlined"
              size="sm"
              icon={RotateCcw}
              onClick={() => setShowRegenTherapistModal(true)}
            >
              🔄 Regenerate Entire Report
            </Button>
          </div>

          {/* FIVE SECTION CARDS */}
          {[
            { key: "background", label: "BACKGROUND", prompt: `Write the background section for a clinical therapy report for ${child?.name}, aged ${child?.age}, who has ${child?.diagnosis}. Primary concern: ${child?.primaryConcern}. Clinical tone.` },
            { key: "assessmentFindings", label: "ASSESSMENT FINDINGS", prompt: `Write the assessment findings section for ${child?.name}. ISAA total score: ${assessmentData?.isaa_score ?? "Not Assessed"}/200, severity: ${assessmentData?.isaa_severity || "Not Assessed"}. Clinical language.` },
            { key: "currentStatus", label: "CURRENT STATUS", prompt: `Write the current status section for ${child?.name} with ${child?.diagnosis}. What can the child do now, what is improving, what needs support. 3-4 sentences.` },
            { key: "recommendations", label: "RECOMMENDATIONS", prompt: `Write the recommendations section for ${child?.name}. Recommended therapies: Speech & OT. Include frequency and duration.` },
            { key: "reviewPlan", label: "REVIEW PLAN", prompt: `Write a review plan sentence for ${child?.name} with ${child?.diagnosis}. Mention when to review progress. 1-2 sentences.` }
          ].map((sec) => {
            const textVal = formState.therapistReport[sec.key] || "";
            const isSecLoading = sectionLoading[sec.key];
            const hasError = validationErrors[sec.key];

            return (
              <div
                key={sec.key}
                className={`bg-white rounded-[12px] border p-5 space-y-3 relative shadow-xs transition-all ${
                  hasError ? "border-red-500 bg-red-50/20" : "border-[#D3D1C7]"
                }`}
              >
                {/* Section Top Bar */}
                <div className="flex items-center justify-between border-b border-[#D3D1C7]/40 pb-2">
                  <span className="text-[11px] font-bold text-[#9B9A96] tracking-wider uppercase">{sec.label}</span>
                  <button
                    type="button"
                    disabled={isSecLoading}
                    onClick={() => handleRewriteSection(sec.key, sec.prompt, "therapist")}
                    className="text-xs font-bold text-[#185FA5] hover:text-[#0F6E56] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isSecLoading ? "animate-spin" : ""}`} />
                    <span>↺ Rewrite</span>
                  </button>
                </div>

                {/* Section Textarea Area with Loading Overlay */}
                <div className="relative min-h-[100px]">
                  <textarea
                    rows={4}
                    value={textVal}
                    onChange={(e) => updateTherapist(sec.key, e.target.value)}
                    className={`w-full p-3 text-xs font-medium text-[#2C2C2A] bg-white rounded-[8px] border outline-none resize-none transition-colors ${
                      hasError ? "border-red-500" : "border-[#D3D1C7] focus:border-[#185FA5]"
                    }`}
                  />

                  {/* Loading Overlay */}
                  {isSecLoading && (
                    <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs rounded-[8px] flex flex-col items-center justify-center gap-2">
                      <Sparkles className="h-6 w-6 text-[#185FA5] animate-spin" />
                      <span className="text-xs font-bold text-[#185FA5]">Generating...</span>
                    </div>
                  )}
                </div>

                {/* Section Bottom Bar */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#D3D1C7]/30">
                  <button
                    type="button"
                    onClick={() => updateTherapist(sec.key, "")}
                    className="text-[#993C1D] hover:underline font-semibold cursor-pointer"
                  >
                    Clear text
                  </button>
                  <span className="text-[#9B9A96] font-mono">{textVal.length} characters</span>
                </div>

                {hasError && (
                  <p className="text-[11px] font-bold text-red-600">This section needs content before publishing.</p>
                )}
              </div>
            );
          })}

        </div>
      )}

      {/* TAB 3: EXERCISES & PLAN */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CLINIC EXERCISES COLUMN */}
            <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/40 pb-2">
                <h3 className="text-xs font-bold text-[#185FA5] uppercase">CLINIC PRESCRIBED EXERCISES</h3>
                <span className="text-[11px] font-bold text-[#9B9A96]">{formState.exercises.clinicExercises.length} selected</span>
              </div>

              <div className="space-y-2">
                {formState.exercises.clinicExercises.map((exName, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs font-bold">
                    <span className="text-[#2C2C2A]">{exName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formState.exercises.clinicExercises.filter((_, i) => i !== idx);
                        updateExercises("clinicExercises", next);
                      }}
                      className="text-[#993C1D] hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="outlined"
                fullWidth
                size="sm"
                icon={Plus}
                onClick={() => {
                  setAddExType("clinic");
                  setShowAddExModal(true);
                }}
              >
                + Add Clinic Exercise
              </Button>
            </div>

            {/* HOME EXERCISES COLUMN */}
            <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/40 pb-2">
                <h3 className="text-xs font-bold text-[#0F6E56] uppercase">HOME PARENT EXERCISES</h3>
                <span className="text-[11px] font-bold text-[#9B9A96]">{formState.exercises.homeExercises.length} selected</span>
              </div>

              {formState.exercises.homeExercises.length > 5 && (
                <p className="text-[11px] font-bold text-[#854F0B] bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠ More than 5 exercises may overwhelm parents.
                </p>
              )}

              <div className="space-y-2">
                {formState.exercises.homeExercises.map((exName, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs font-bold">
                    <span className="text-[#2C2C2A]">{exName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formState.exercises.homeExercises.filter((_, i) => i !== idx);
                        updateExercises("homeExercises", next);
                      }}
                      className="text-[#993C1D] hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="outlined"
                fullWidth
                size="sm"
                icon={Plus}
                onClick={() => {
                  setAddExType("home");
                  setShowAddExModal(true);
                }}
              >
                + Add Home Exercise
              </Button>
            </div>

          </div>

          {/* SCHEDULE CARD */}
          <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-[#2C2C2A] uppercase border-b border-[#D3D1C7]/40 pb-2">SCHEDULE & APPOINTMENT DETAILS</h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#2C2C2A]">Therapy Days</label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
                  const isSel = formState.exercises.therapyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const arr = [...formState.exercises.therapyDays];
                        const next = isSel ? arr.filter((d) => d !== day) : [...arr, day];
                        updateExercises("therapyDays", next);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSel ? "bg-[#185FA5] text-white shadow-xs" : "bg-[#F8F8F6] text-[#5F5E5A] border border-[#D3D1C7]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <Input
                label="Session Time"
                type="time"
                value={formState.exercises.sessionTime}
                onChange={(e) => updateExercises("sessionTime", e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2A]">Duration</label>
                <select
                  value={formState.exercises.sessionDuration}
                  onChange={(e) => updateExercises("sessionDuration", e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] outline-none"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <Input
                label="Frequency per week"
                type="number"
                min="1"
                max="7"
                value={formState.exercises.frequencyPerWeek}
                onChange={(e) => updateExercises("frequencyPerWeek", e.target.value)}
              />

              <Input
                label="Start Date"
                type="date"
                value={formState.exercises.startDate}
                onChange={(e) => updateExercises("startDate", e.target.value)}
              />
            </div>
          </div>

        </div>
      )}

      {/* FULL-SCREEN PARENT PREVIEW MODAL */}
      {showParentPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col animate-in fade-in">
          
          {/* TOP BAR */}
          <div className="bg-white border-b border-[#D3D1C7] p-4 flex items-center justify-between shadow-md">
            <div>
              <h3 className="text-base font-bold text-[#2C2C2A]">Parent Portal Preview</h3>
              <p className="text-xs text-[#5F5E5A] font-semibold">{child?.name}&apos;s report as seen by parent</p>
            </div>
            <button
              onClick={() => setShowParentPreviewModal(false)}
              className="p-2 rounded-full hover:bg-slate-100 text-[#5F5E5A] cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* SCROLLABLE LIVE PREVIEW CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            
            {/* Header Card */}
            <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-1">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Kids Care Rehab Centre</span>
              <h2 className="text-xl font-black">{child?.name} — Assessment Report</h2>
              <p className="text-xs text-blue-100">Report Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            {/* About Your Child */}
            <Card title="About Your Child">
              <p className="text-xs text-[#2C2C2A] leading-relaxed font-medium">
                {formState.parentReport.aboutYourChild}
              </p>
            </Card>

            {/* What We Found */}
            <div className="bg-emerald-50/70 p-6 rounded-[12px] border border-emerald-200 space-y-3">
              <h3 className="text-sm font-bold text-[#3B6D11] uppercase tracking-wider flex items-center gap-2">
                <span>✨ Your Child&apos;s Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-[#2C2C2A]">
                {formState.parentReport.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
                    <CheckCircle2 className="h-4 w-4 text-[#3B6D11] shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Working On */}
            <div className="bg-blue-50/70 p-6 rounded-[12px] border border-blue-200 space-y-3">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase tracking-wider">
                📌 Areas We Are Supporting
              </h3>
              <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">
                {formState.parentReport.workingOn}
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#2C2C2A]">
                {formState.parentReport.focusAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
                    <span className="h-2 w-2 rounded-full bg-[#185FA5] mt-1.5 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Therapy Plan */}
            <Card title="🏥 Therapy Plan">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                  <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Therapy Type</span>
                  <strong className="text-[#185FA5]">{formState.parentReport.therapyType}</strong>
                </div>
                <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                  <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Sessions / Week</span>
                  <strong className="text-[#2C2C2A]">{formState.parentReport.sessionsPerWeek}</strong>
                </div>
                <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                  <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Duration</span>
                  <strong className="text-[#2C2C2A]">{formState.parentReport.duration}</strong>
                </div>
                <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                  <span className="text-[10px] font-bold text-[#5F5E5A] uppercase block">Next Review</span>
                  <strong className="text-[#0F6E56]">{formState.parentReport.nextReviewDate}</strong>
                </div>
              </div>
            </Card>

            {/* Home Advice */}
            <div className="bg-amber-50/70 p-6 rounded-[12px] border border-amber-200 space-y-3">
              <h3 className="text-sm font-bold text-[#854F0B] uppercase tracking-wider">
                🏠 What You Can Do At Home
              </h3>
              <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">
                {formState.parentReport.homeAdvice}
              </p>
              <ol className="space-y-2 text-xs font-semibold text-[#2C2C2A] pt-1">
                {formState.parentReport.homeSuggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-[8px] border border-amber-200/60">
                    <span className="h-6 w-6 rounded-full bg-[#854F0B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Closing Message */}
            <div className="bg-[#0F6E56] text-white p-6 rounded-[12px] text-center italic text-sm font-bold shadow-sm">
              &quot;{formState.parentReport.encouragement}&quot;
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="bg-white border-t border-[#D3D1C7] p-4 flex items-center justify-between shadow-md">
            <span className="text-xs font-semibold text-[#5F5E5A]">This is exactly what {child?.parent?.name} will see after publishing.</span>
            <Button onClick={() => setShowParentPreviewModal(false)}>Close Preview</Button>
          </div>

        </div>
      )}

      {/* CONFIRM REGEN THERAPIST MODAL */}
      <Modal isOpen={showRegenTherapistModal} onClose={() => setShowRegenTherapistModal(false)} title="Regenerate Therapist Report?">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            This will replace all current therapist report content with a new AI-generated version. Your edits will be lost.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowRegenTherapistModal(false)}>Cancel</Button>
            <Button onClick={() => handleRegenerateEntireReport("therapist")}>Yes, Regenerate</Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM REGEN PARENT MODAL */}
      <Modal isOpen={showRegenParentModal} onClose={() => setShowRegenParentModal(false)} title="Regenerate Parent Report?">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            This will replace all current parent report sections with new AI-generated content. Your edits will be lost.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowRegenParentModal(false)}>Cancel</Button>
            <Button onClick={() => handleRegenerateEntireReport("parent")}>Yes, Regenerate</Button>
          </div>
        </div>
      </Modal>

      {/* PUBLISH CONFIRM MODAL */}
      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish Assessment Report">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Publish this report for <strong>{child?.name}</strong>? It will immediately become visible to {child?.parent?.name} on the Parent Portal.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" disabled={isPublishing} onClick={() => setShowPublishModal(false)}>Cancel</Button>
            <Button disabled={isPublishing} onClick={executePublish}>
              {isPublishing ? "Publishing..." : "Yes, Publish Report"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* SEARCHABLE EXERCISE SELECTOR MODAL */}
      <Modal isOpen={showAddExModal} onClose={() => setShowAddExModal(false)} title={`Add ${addExType === "clinic" ? "Clinic" : "Home"} Exercise`}>
        <div className="space-y-4 text-xs font-semibold">
          <Input
            placeholder="Search exercises..."
            value={exSearch}
            onChange={(e) => setExSearch(e.target.value)}
          />

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {availableDbExercises
              .filter((ex) => ex.name?.toLowerCase().includes(exSearch.toLowerCase()))
              .map((ex) => {
                const targetList = addExType === "clinic" ? formState.exercises.clinicExercises : formState.exercises.homeExercises;
                const isAdded = targetList.includes(ex.name);

                return (
                  <div key={ex.id} className="flex items-center justify-between p-2.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                    <div>
                      <span className="font-bold text-[#2C2C2A] block">{ex.name}</span>
                      <span className="text-[10px] text-[#9B9A96]">{ex.category}</span>
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? "ghost" : "outlined"}
                      disabled={isAdded}
                      onClick={() => {
                        const next = [...targetList, ex.name];
                        updateExercises(addExType === "clinic" ? "clinicExercises" : "homeExercises", next);
                        showToast(`Added ${ex.name}`, "success");
                      }}
                    >
                      {isAdded ? "✓ Added" : "+ Add"}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>

    </div>
  );
}
