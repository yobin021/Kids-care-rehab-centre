"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Send, Printer, Edit3, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import {
  IepRatingTable,
  MilestoneTable,
  BehaviourTable,
  SensoryTable,
  CheckboxGrid
} from "../components/assessment/RatingComponents";
import { therapyAssessmentService } from "../services/therapyAssessmentService";
import { assessmentService } from "../services/assessmentService";
import { childAssignmentService } from "../services/childAssignmentService";
import { calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";

export default function AssessmentForm() {
  const { childId, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const queryAssessmentId = searchParams.get("assessmentId");
  const [currentAssessmentId, setCurrentAssessmentId] = useState(queryAssessmentId || (id && id.length > 20 ? id : null));
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [loadedChildId, setLoadedChildId] = useState(null);

  const targetChildId = loadedChildId || childId || (id && id.length < 20 ? id : null) || childId;
  const child = childrenList.find((c) => c.id === targetChildId) || childrenList[0];

  const [activeTab, setActiveTab] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Student Info
    childName: child?.name || "",
    dobAge: child?.dob || child?.date_of_birth || child?.age || "",
    gender: child?.gender || "Male",
    assessmentDate: new Date().toISOString().split("T")[0],
    diagnosis: child?.diagnosis || "",
    parentName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    phone: child?.parent?.phone || child?.parent_accounts?.phone || "",
    address: child?.address || "",
    assessedBy: user?.name || "",
    designation: user?.designation || "Special Educator",
    schoolClass: child?.school ? `${child.school} / ${child.class || ""}` : "",
    udidNumber: child?.udid_number || "",
    assessmentType: "Initial",

    // Section 1: Reason for Assessment
    reasonForReferral: child?.primaryConcern || child?.primary_concern || "",
    mainDifficulties: [],
    difficultyOther: "",

    // Section 2: Developmental and Medical History
    birthHistory: [],
    birthDetails: "",
    milestones: {
      neckHolding: { status: "ontime", remarks: "" },
      sitting: { status: "ontime", remarks: "" },
      crawling: { status: "ontime", remarks: "" },
      walking: { status: "ontime", remarks: "" },
      speech: { status: "ontime", remarks: "" },
      toiletTraining: { status: "ontime", remarks: "" }
    },
    medicalHistory: [],
    medicalHistoryOther: "",
    medicalDetails: "",

    // Section 3: Previous Therapy / School History
    previousTherapy: [],
    previousTherapyDetails: "",
    schoolHistory: [],
    schoolHistoryDetails: "",

    // Section 4: Parent Priority Goals
    parentGoal1: "", parentGoal2: "", parentGoal3: "", parentGoal4: "", parentGoal5: "",

    // Section 5: Communication and Language Assessment
    s5_communication: {
      respondsName: 0, eyeContact: 0, simpleInstructions: 0,
      oneStep: 0, twoStep: 0, gestures: 0,
      requestsNeeds: 0, usesWords: 0, usesPhrases: 0,
      namesObjects: 0, answersQuestions: 0, communicatesPain: 0
    },
    s5_remarks: {},
    s5_summary: "",

    // Section 6: Attention, Sitting Tolerance and Task Behaviour
    s6_attention: {
      sitsForActivity: 0, attendsTeacher: 0, completesSimpleTask: 0,
      waitsTurn: 0, respondsRedirection: 0, transitionsActivities: 0,
      worksPrompts: 0, worksIndependently: 0
    },
    s6_remarks: {},
    s6_summary: "",
    sittingTolerance: "2–5 minutes",

    // Section 7: Behaviour Assessment
    s7_behaviour: {
      hyperactivity: { present: false, remarks: "" },
      poorAttention: { present: false, remarks: "" },
      tantrums: { present: false, remarks: "" },
      cryingEpisodes: { present: false, remarks: "" },
      aggression: { present: false, remarks: "" },
      selfInjurious: { present: false, remarks: "" },
      repetitiveBehaviour: { present: false, remarks: "" },
      resistanceToTask: { present: false, remarks: "" },
      difficultyWithChange: { present: false, remarks: "" },
      sensorySeeking: { present: false, remarks: "" },
      fearAnxiety: { present: false, remarks: "" },
      sleepBehaviour: { present: false, remarks: "" }
    },
    possibleTriggers: [],
    s7_summary: "",

    // Section 8: Social Skills and Play Skills
    s8_social: {
      respondsAdults: 0, respondsPeers: 0, greetsOthers: 0,
      sharesToys: 0, takesTurns: 0, imitatesActions: 0,
      functionalPlay: 0, pretendPlay: 0, groupActivity: 0,
      classroomRules: 0
    },
    s8_remarks: {},
    s8_summary: "",

    // Section 9: Pre-Academic and Academic Skills
    s9_academic: {
      matchesObjects: 0, matchesPictures: 0, sortsObjects: 0,
      identifiesColours: 0, identifiesShapes: 0, identifiesBodyParts: 0,
      identifiesAnimals: 0, identifiesFruitsVeg: 0, identifiesAlphabets: 0,
      identifiesNumbers: 0, countsObjects: 0, recitesRhymes: 0,
      recognisesName: 0, copiesLinesShapes: 0, prewritingReadiness: 0
    },
    s9_remarks: {},
    s9_summary: "",

    // Section 10: Fine Motor Skills
    s10_fineMotor: {
      reachesGrasps: 0, transfersHand: 0, stacksBlocks: 0,
      pegboard: 0, beading: 0, tearsPaper: 0,
      pastesPaper: 0, usesCrayons: 0, pencilGrip: 0,
      scribbling: 0, tracing: 0, usesScissors: 0,
      buttoning: 0
    },
    s10_remarks: {},
    s10_summary: "",

    // Section 11: Gross Motor Skills
    s11_grossMotor: {
      sittingBalance: 0, standingBalance: 0, walking: 0,
      running: 0, jumping: 0, climbingStairs: 0,
      kickingBall: 0, throwingBall: 0, catchingBall: 0,
      bodyCoordination: 0, postureControl: 0, muscleTone: 0
    },
    s11_remarks: {},
    s11_summary: "",

    // Section 12: Sensory Processing Assessment
    s12_sensory: {
      sound: { response: "", remarks: "" },
      touch: { response: "", remarks: "" },
      movement: { response: "", remarks: "" },
      visual: { response: "", remarks: "" },
      smell: { response: "", remarks: "" },
      taste: { response: "", remarks: "" },
      oral: { response: "", remarks: "" },
      deepPressure: { response: "", remarks: "" }
    },
    sensoryConcerns: [],
    s12_summary: "",

    // Section 13: Activities of Daily Living Assessment
    s13_adl: {
      eatingIndependently: 0, drinkingCup: 0, handWashing: 0,
      brushing: 0, dressing: 0, undressing: 0,
      toileting: 0, indicatesToilet: 0, wearsFootwear: 0,
      arrangesBag: 0, cleansUp: 0, followsRoutine: 0
    },
    s13_remarks: {},
    s13_summary: "",

    // Section 14: Emotional Regulation
    s14_emotional: {
      expressesCalmly: 0, waitsWithoutDistress: 0, acceptsNo: 0,
      handlesCorrection: 0, calmsAfterUpset: 0, acceptsChangeRoutine: 0,
      ageAppropriateResponse: 0
    },
    s14_remarks: {},
    s14_summary: "",

    // Section 15: Learning Style
    learningStyles: [],
    learningStyleRemarks: "",

    // Section 16: Strengths of the Child
    strength1: "", strength2: "", strength3: "", strength4: "", strength5: "",

    // Section 17: Areas Requiring Support
    supportAreas: [],
    supportDetails: "",

    // Section 18: Present Level of Performance
    perfCommunication: "",
    perfAcademic: "",
    perfBehaviour: "",
    perfSocial: "",
    perfAdl: "",
    perfMotor: "",
    perfSensory: "",

    // Section 19: Short-Term Goals: 3 Months
    shortTermGoals: {
      communication: { goal: "", strategy: "", review: "" },
      attention: { goal: "", strategy: "", review: "" },
      behaviour: { goal: "", strategy: "", review: "" },
      socialSkills: { goal: "", strategy: "", review: "" },
      preAcademics: { goal: "", strategy: "", review: "" },
      adl: { goal: "", strategy: "", review: "" },
      fineMotor: { goal: "", strategy: "", review: "" },
      grossMotor: { goal: "", strategy: "", review: "" },
      sensory: { goal: "", strategy: "", review: "" }
    },

    // Section 20: Long-Term Goals: 6 to 12 Months
    longTermGoals: {
      communication: { goal: "", outcome: "", review: "" },
      behaviour: { goal: "", outcome: "", review: "" },
      learningAcademics: { goal: "", outcome: "", review: "" },
      socialSkills: { goal: "", outcome: "", review: "" },
      adlIndependence: { goal: "", outcome: "", review: "" },
      therapySupport: { goal: "", outcome: "", review: "" },
      schoolReadiness: { goal: "", outcome: "", review: "" }
    },

    // Section 21: Recommended Intervention Plan
    interventionPlan: [],
    interventionFrequency: "",

    // Section 22: Home Programme Suggestions
    homeSuggestion1: "", homeSuggestion2: "", homeSuggestion3: "", homeSuggestion4: "", homeSuggestion5: "",

    // Section 23: Review Plan
    firstReviewDate: "",
    secondReviewDate: "",
    thirdReviewDate: "",

    // Section 24: Final Remarks by Special Educator / Therapy Team
    finalRemarks: "",
    assessorName: user?.name || "",
    assessorDesignation: user?.designation || "Special Educator",
    assessorSignature: "",
    assessorDate: new Date().toISOString().split("T")[0],
    parentGuardianName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    parentRelationship: child?.parent?.relationship || "Parent",
    parentSignature: "",
    parentDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (child) {
      setFormData((prev) => ({
        ...prev,
        childName: prev.childName || child.name || "",
        dobAge: prev.dobAge || child.dob || child.date_of_birth || child.age || "",
        gender: child.gender || prev.gender,
        diagnosis: prev.diagnosis || child.diagnosis || "",
        parentName: prev.parentName || child.parent?.name || child.parent_accounts?.parent_name || "",
        phone: prev.phone || child.parent?.phone || child.parent_accounts?.phone || "",
        address: prev.address || child.address || "",
        schoolClass: prev.schoolClass || (child.school ? `${child.school} / ${child.class || ""}` : ""),
        udidNumber: prev.udidNumber || child.udid_number || "",
        reasonForReferral: prev.reasonForReferral || child.primaryConcern || child.primary_concern || ""
      }));
    }
  }, [child]);

  // Load existing assessment if assessmentId is passed
  useEffect(() => {
    const targetAssId = queryAssessmentId || (id && id.length > 20 ? id : null);
    if (targetAssId) {
      assessmentService.getById(targetAssId)
        .then((existing) => {
          if (existing) {
            setCurrentAssessmentId(existing.id);
            if (existing.child_id) setLoadedChildId(existing.child_id);
            setIsEditingExisting(true);
            if (existing.form_data) {
              setFormData((prev) => ({
                ...prev,
                ...existing.form_data,
                assessmentDate: existing.assessment_date || existing.form_data.assessmentDate || prev.assessmentDate
              }));
            }
            setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        })
        .catch((err) => console.warn("AssessmentForm existing load notice:", err.message));
    }
  }, [queryAssessmentId, id]);

  useEffect(() => {
    const draftKey = `iep_assessment_draft_${targetChildId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved && !isEditingExisting) setShowRestoreBanner(true);
  }, [targetChildId, isEditingExisting]);

  const handleRestoreDraft = () => {
    const draftKey = `iep_assessment_draft_${targetChildId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        showToast("Draft restored successfully.", "success");
      } catch (e) {
        console.error(e);
      }
    }
    setShowRestoreBanner(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(`iep_assessment_draft_${targetChildId}`);
    setShowRestoreBanner(false);
    showToast("Started fresh assessment.", "info");
  };

  const updateField = (key, val) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem(`iep_assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const updateNested = (parentKey, childKey, val) => {
    setFormData((prev) => {
      const next = { ...prev, [parentKey]: { ...(prev[parentKey] || {}), [childKey]: val } };
      localStorage.setItem(`iep_assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const updateDeepGoal = (sectionKey, rowKey, fieldKey, val) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] || {}),
          [rowKey]: {
            ...((prev[sectionKey] || {})[rowKey] || {}),
            [fieldKey]: val
          }
        }
      };
      localStorage.setItem(`iep_assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const domainScores = useMemo(() => calculateDomainScores(formData), [formData]);
  const profileInfo = useMemo(() => classifyProfile(domainScores, 1), [domainScores]);
  const exercises = useMemo(() => selectExercises(profileInfo.profile, domainScores), [profileInfo, domainScores]);

  // Action 1: Save Assessment (Keeps user on form, updates existing record or creates draft)
  const handleSaveAssessmentOnly = async () => {
    const activeChildId = child?.id || targetChildId;
    if (!activeChildId) {
      showToast("Please select a valid child before saving.", "danger");
      return;
    }

    setIsSubmitting(true);
    const assessmentPayload = {
      id: currentAssessmentId || undefined,
      child_id: activeChildId,
      assessment_date: formData.assessmentDate || new Date().toISOString().split("T")[0],
      assessed_by: user?.id || formData.assessedBy || "Special Educator",
      isaa_score: null,
      isaa_severity: null,
      isaa_level: 1,
      domain_scores: domainScores,
      profile: profileInfo.profile,
      clinic_exercises: exercises.clinicExercises,
      home_exercises: exercises.homeExercises,
      form_data: formData,
      status: "draft"
    };

    try {
      const res = await therapyAssessmentService.saveSpecialSchool(assessmentPayload);
      if (res?.id) setCurrentAssessmentId(res.id);
      setIsEditingExisting(true);
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      // Automatically link child to this staff member
      if (user && activeChildId) {
        await childAssignmentService.recordStaffAssessment(activeChildId, user, "Special School IEP");
      }

      showToast("IEP Assessment saved successfully! You can continue editing or generate a report.", "success");
    } catch (err) {
      console.warn("Save IEP error:", err);
      if (user && activeChildId) {
        await childAssignmentService.recordStaffAssessment(activeChildId, user, "Special School IEP");
      }
      showToast("Assessment saved locally.", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 2: Generate Report and Submit for Review
  const handleSubmitAssessment = async () => {
    const activeChildId = child?.id || targetChildId;
    if (!activeChildId) {
      showToast("Please select a valid child before submitting.", "danger");
      return;
    }

    setIsSubmitting(true);
    const assessmentPayload = {
      id: currentAssessmentId || undefined,
      child_id: activeChildId,
      assessment_date: formData.assessmentDate || new Date().toISOString().split("T")[0],
      assessed_by: user?.id || formData.assessedBy || "Special Educator",
      isaa_score: null,
      isaa_severity: null,
      isaa_level: 1,
      domain_scores: domainScores,
      profile: profileInfo.profile,
      clinic_exercises: exercises.clinicExercises,
      home_exercises: exercises.homeExercises,
      form_data: formData,
      status: "completed"
    };

    try {
      const res = await therapyAssessmentService.saveSpecialSchool(assessmentPayload);
      const assId = res?.id || currentAssessmentId || activeChildId;
      setCurrentAssessmentId(assId);
      localStorage.removeItem(`iep_assessment_draft_${activeChildId}`);
      localStorage.setItem(`assessment_result_${assId}`, JSON.stringify(res || assessmentPayload));

      // Automatically link child to this staff member
      if (user && activeChildId) {
        await childAssignmentService.recordStaffAssessment(activeChildId, user, "Special School IEP");
      }

      showToast("IEP Assessment saved! Directing to report generator...", "success");
      setShowSubmitModal(false);
      navigate(`/iep/${activeChildId}/generate/${assId}?submitForReview=true`);
    } catch (err) {
      console.warn("Local submission fallback:", err.message);
      const fallbackResult = {
        id: currentAssessmentId || activeChildId,
        child_id: activeChildId,
        assessment_date: formData.assessmentDate,
        assessed_by: formData.assessedBy,
        domain_scores: domainScores,
        profile: profileInfo.profile,
        form_data: formData
      };
      localStorage.removeItem(`iep_assessment_draft_${activeChildId}`);
      localStorage.setItem(`assessment_result_${activeChildId}`, JSON.stringify(fallbackResult));

      if (user && activeChildId) {
        await childAssignmentService.recordStaffAssessment(activeChildId, user, "Special School IEP");
      }

      showToast("IEP Assessment saved! Directing to report generator...", "info");
      setShowSubmitModal(false);
      navigate(`/iep/${activeChildId}/generate/${activeChildId}?submitForReview=true`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssessment = async () => {
    const activeChildId = child?.id || targetChildId;
    if (window.confirm("Are you sure you want to delete this IEP assessment form? All entered domain ratings and exercise configurations will be deleted.")) {
      try {
        setIsSubmitting(true);
        if (currentAssessmentId) {
          await assessmentService.delete(currentAssessmentId, activeChildId);
        } else if (activeChildId) {
          localStorage.removeItem(`iep_assessment_draft_${activeChildId}`);
          localStorage.removeItem(`assessment_result_${activeChildId}`);
        }
        showToast("IEP Assessment deleted successfully.", "success");
        navigate(activeChildId ? `/children/${activeChildId}` : "/children");
      } catch (err) {
        showToast("Failed to delete assessment: " + err.message, "danger");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const tabsList = [
    { num: 1, name: "General Info", sec: "1" },
    { num: 2, name: "History", sec: "2–3" },
    { num: 3, name: "Goals & Comm.", sec: "4–5" },
    { num: 4, name: "Attention & Behaviour", sec: "6–7" },
    { num: 5, name: "Social & Academic", sec: "8–9" },
    { num: 6, name: "Motor Skills", sec: "10–11" },
    { num: 7, name: "Sensory & ADL", sec: "12–14" },
    { num: 8, name: "Strengths & Levels", sec: "15–18" },
    { num: 9, name: "Goals & Intervention", sec: "19–23" },
    { num: 10, name: "Sign Off", sec: "24" }
  ];

  const goNext = () => setActiveTab((t) => Math.min(t + 1, 10));
  const goPrev = () => setActiveTab((t) => Math.max(t - 1, 1));

  return (
    <div className="space-y-4 text-[#2C2C2A] pb-24 max-w-5xl mx-auto">
      {/* Draft Restore Banner */}
      {showRestoreBanner && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-[12px] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#854F0B] shrink-0" />
            <span>Unsaved draft found for {child?.name || "this student"}. Restore it?</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleRestoreDraft}>Restore Draft</Button>
            <Button size="sm" variant="outlined" onClick={handleStartFresh}>Start Fresh</Button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/children/${child?.id}`)} className="p-1.5 rounded-[8px] border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#2C2C2A]">{child?.name || "Student Assessment"}</h2>
              <span className="font-mono text-xs text-[#9B9A96]">{child?.id}</span>
              {isEditingExisting && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Editing Saved Assessment
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">Kids Care Rehab Special School — IEP Assessment Sheet</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {lastSaved && <span className="text-[11px] font-bold text-[#3B6D11] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}</span>}
          <Button
            variant="outlined"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteAssessment}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            disabled={isSubmitting}
            title="Delete this assessment"
          >
            Delete Form
          </Button>
          <Button variant="outlined" size="sm" icon={Save} onClick={handleSaveAssessmentOnly} loading={isSubmitting}>
            Save Assessment
          </Button>
          <Button size="sm" icon={Send} className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs" onClick={() => setShowSubmitModal(true)}>
            Generate Report &amp; Submit for Review
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-20 bg-white border-b border-[#D3D1C7] p-2 shadow-xs overflow-x-auto flex items-center gap-1.5">
        {tabsList.map((t) => (
          <button
            key={t.num}
            type="button"
            onClick={() => setActiveTab(t.num)}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === t.num
                ? "bg-[#185FA5] text-white shadow-xs"
                : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
            }`}
          >
            <span>{t.num}. {t.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              activeTab === t.num ? "bg-white/20 text-white" : "bg-[#EBEAE4] text-[#5F5E5A]"
            }`}>
              S{t.sec}
            </span>
          </button>
        ))}
      </div>

      {/* Form Container (matches PDF Document) */}
      <div className="bg-white p-6 sm:p-8 rounded-[12px] border border-[#D3D1C7] shadow-sm space-y-6">
        {/* Document Official Header */}
        <div className="text-center border-b border-[#D3D1C7] pb-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#5F5E5A]">Kids Care Rehab Special School | Individualised Education Plan Assessment</p>
          <h1 className="text-xl sm:text-2xl font-black text-[#185FA5]">Kids Care Rehab Special School</h1>
          <h2 className="text-sm sm:text-base font-bold text-[#2C2C2A]">Individualised Education Plan Assessment Sheet</h2>
          <p className="text-xs italic text-[#5F5E5A]">For Special Education, Therapy Planning, Behaviour Support and Progress Review</p>
        </div>

        {/* Rating Scale Legend */}
        <div className="bg-[#F0F4F8] border border-[#185FA5]/30 p-2.5 rounded-[6px] text-xs font-semibold text-[#185FA5] flex items-center justify-between flex-wrap gap-2">
          <span><strong>Rating Scale:</strong> 0 – Not Developed | 1 – Emerging / With Full Support | 2 – With Partial Support | 3 – Independent / Age Appropriate</span>
        </div>

        {/* ═══ TAB 1: Student Details & S1 Reason for Assessment ═══ */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* Details Table */}
            <div className="border border-[#D3D1C7] rounded-[8px] overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-[#D3D1C7]">
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] w-1/4 border-r border-[#D3D1C7]">Child’s Name</td>
                    <td className="p-2 w-1/4 border-r border-[#D3D1C7]">
                      <input type="text" value={formData.childName} onChange={(e) => updateField("childName", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] w-1/4 border-r border-[#D3D1C7]">Date of Birth / Age</td>
                    <td className="p-2 w-1/4">
                      <input type="text" value={formData.dobAge} onChange={(e) => updateField("dobAge", e.target.value)} placeholder="e.g. 2019-05-12 / 6y" className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#D3D1C7]">
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Gender</td>
                    <td className="p-2 border-r border-[#D3D1C7]">
                      <select value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium bg-white">
                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Date of Assessment</td>
                    <td className="p-2">
                      <input type="date" value={formData.assessmentDate} onChange={(e) => updateField("assessmentDate", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#D3D1C7]">
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Diagnosis / Condition</td>
                    <td className="p-2 border-r border-[#D3D1C7]">
                      <input type="text" value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Parent / Guardian Name</td>
                    <td className="p-2">
                      <input type="text" value={formData.parentName} onChange={(e) => updateField("parentName", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#D3D1C7]">
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Contact Number</td>
                    <td className="p-2 border-r border-[#D3D1C7]">
                      <input type="text" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Address</td>
                    <td className="p-2">
                      <input type="text" value={formData.address} onChange={(e) => updateField("address", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#D3D1C7]">
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Assessed By</td>
                    <td className="p-2 border-r border-[#D3D1C7]">
                      <input type="text" value={formData.assessedBy} onChange={(e) => updateField("assessedBy", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Designation</td>
                    <td className="p-2">
                      <input type="text" value={formData.designation} onChange={(e) => updateField("designation", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">School / Class</td>
                    <td className="p-2 border-r border-[#D3D1C7]">
                      <input type="text" value={formData.schoolClass} onChange={(e) => updateField("schoolClass", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                    <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">UDID / Disability ID if any</td>
                    <td className="p-2">
                      <input type="text" value={formData.udidNumber} onChange={(e) => updateField("udidNumber", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Assessment Type */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <span>Assessment Type:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="assessmentType" checked={formData.assessmentType === "Initial"} onChange={() => updateField("assessmentType", "Initial")} className="h-4 w-4 accent-[#185FA5]" />
                <span>Initial</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="assessmentType" checked={formData.assessmentType === "Review"} onChange={() => updateField("assessmentType", "Review")} className="h-4 w-4 accent-[#185FA5]" />
                <span>Review</span>
              </label>
            </div>

            {/* Section 1 */}
            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">1. Reason for Assessment</h3>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2C2C2A]">Reason for referral / parent concern:</label>
                <textarea rows={4} value={formData.reasonForReferral} onChange={(e) => updateField("reasonForReferral", e.target.value)} className="w-full p-2.5 border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]" />
              </div>

              <CheckboxGrid
                label="Main areas of difficulty noticed by parent:"
                options={[
                  "Speech delay", "Poor attention", "Hyperactivity",
                  "Behaviour issues", "Poor social interaction", "Learning difficulty",
                  "Sensory issues", "Motor difficulty", "Poor ADL skills",
                  "School readiness concern"
                ]}
                value={formData.mainDifficulties}
                onChange={(v) => updateField("mainDifficulties", v)}
              />

              <Input label="Other:" placeholder="Specify any other difficulty..." value={formData.difficultyOther} onChange={(e) => updateField("difficultyOther", e.target.value)} />
            </div>

            <div className="flex justify-end pt-4"><Button onClick={goNext}>Next: History (S2–3) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 2: S2 Developmental and Medical History & S3 Previous Therapy ═══ */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">2. Developmental and Medical History</h3>
              <CheckboxGrid
                label="Birth History:"
                options={["Normal delivery", "C-section", "Preterm", "Low birth weight", "NICU admission", "Birth complications"]}
                value={formData.birthHistory}
                onChange={(v) => updateField("birthHistory", v)}
              />
              <Input label="Details:" type="textarea" rows={2} value={formData.birthDetails} onChange={(e) => updateField("birthDetails", e.target.value)} />

              <p className="text-xs font-bold text-[#2C2C2A] pt-2">Milestones:</p>
              <MilestoneTable
                items={[
                  { key: "neckHolding", label: "Neck holding" },
                  { key: "sitting", label: "Sitting" },
                  { key: "crawling", label: "Crawling" },
                  { key: "walking", label: "Walking" },
                  { key: "speech", label: "Speech development" },
                  { key: "toiletTraining", label: "Toilet training" }
                ]}
                values={formData.milestones}
                onStatusChange={(k, st) => updateDeepGoal("milestones", k, "status", st)}
                onRemarksChange={(k, rem) => updateDeepGoal("milestones", k, "remarks", rem)}
              />

              <CheckboxGrid
                label="Medical History:"
                options={["Seizure history", "Hearing difficulty", "Vision difficulty", "Sleep issues", "Feeding difficulty", "Frequent illness", "Medication"]}
                value={formData.medicalHistory}
                onChange={(v) => updateField("medicalHistory", v)}
              />
              <Input label="Other medical history:" value={formData.medicalHistoryOther} onChange={(e) => updateField("medicalHistoryOther", e.target.value)} />
              <Input label="Medical details:" type="textarea" rows={2} value={formData.medicalDetails} onChange={(e) => updateField("medicalDetails", e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">3. Previous Therapy / School History</h3>
              <CheckboxGrid
                label="Previous Therapy Taken:"
                options={[
                  "Physiotherapy", "Occupational therapy", "Speech therapy",
                  "Special education", "Behaviour therapy", "Psychological counselling",
                  "Sensory integration", "Early intervention", "None"
                ]}
                value={formData.previousTherapy}
                onChange={(v) => updateField("previousTherapy", v)}
              />
              <Input label="Details:" type="textarea" rows={2} value={formData.previousTherapyDetails} onChange={(e) => updateField("previousTherapyDetails", e.target.value)} />

              <CheckboxGrid
                label="School History:"
                options={["Not yet admitted", "Playschool", "Mainstream school", "Special school", "Home-based learning"]}
                value={formData.schoolHistory}
                onChange={(v) => updateField("schoolHistory", v)}
              />
              <Input label="School name / class / concerns:" type="textarea" rows={2} value={formData.schoolHistoryDetails} onChange={(e) => updateField("schoolHistoryDetails", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Goals & Comm. (S4–5) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 3: S4 Parent Priority Goals & S5 Communication ═══ */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">4. Parent Priority Goals</h3>
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C2C2A] w-5">{num}.</span>
                  <input
                    type="text"
                    value={formData[`parentGoal${num}`]}
                    onChange={(e) => updateField(`parentGoal${num}`, e.target.value)}
                    placeholder={`Goal ${num}...`}
                    className="flex-1 h-8 px-2.5 border border-[#D3D1C7] rounded-[6px] text-xs font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">5. Communication and Language Assessment</h3>
              <IepRatingTable
                items={[
                  { key: "respondsName", label: "Responds to name" },
                  { key: "eyeContact", label: "Maintains eye contact" },
                  { key: "simpleInstructions", label: "Understands simple instructions" },
                  { key: "oneStep", label: "Follows one-step commands" },
                  { key: "twoStep", label: "Follows two-step commands" },
                  { key: "gestures", label: "Uses gestures / pointing" },
                  { key: "requestsNeeds", label: "Requests needs appropriately" },
                  { key: "usesWords", label: "Uses sounds / words" },
                  { key: "usesPhrases", label: "Uses phrases / sentences" },
                  { key: "namesObjects", label: "Names familiar objects" },
                  { key: "answersQuestions", label: "Answers simple questions" },
                  { key: "communicatesPain", label: "Communicates pain / discomfort" }
                ]}
                values={formData.s5_communication}
                remarks={formData.s5_remarks}
                onRatingChange={(k, v) => updateNested("s5_communication", k, v)}
                onRemarksChange={(k, rem) => updateNested("s5_remarks", k, rem)}
              />
              <Input label="Communication and Language Assessment Summary:" type="textarea" rows={3} value={formData.s5_summary} onChange={(e) => updateField("s5_summary", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Attention & Behaviour (S6–7) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 4: S6 Attention & S7 Behaviour ═══ */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">6. Attention, Sitting Tolerance and Task Behaviour</h3>
              <IepRatingTable
                items={[
                  { key: "sitsForActivity", label: "Sits for activity" },
                  { key: "attendsTeacher", label: "Attends to teacher" },
                  { key: "completesSimpleTask", label: "Completes simple task" },
                  { key: "waitsTurn", label: "Waits for turn" },
                  { key: "respondsRedirection", label: "Responds to redirection" },
                  { key: "transitionsActivities", label: "Transitions between activities" },
                  { key: "worksPrompts", label: "Works with prompts" },
                  { key: "worksIndependently", label: "Works independently" }
                ]}
                values={formData.s6_attention}
                remarks={formData.s6_remarks}
                onRatingChange={(k, v) => updateNested("s6_attention", k, v)}
                onRemarksChange={(k, rem) => updateNested("s6_remarks", k, rem)}
              />
              <Input label="Attention, Sitting Tolerance and Task Behaviour Summary:" type="textarea" rows={3} value={formData.s6_summary} onChange={(e) => updateField("s6_summary", e.target.value)} />

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2C2C2A]">Sitting tolerance:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]">
                  {["Less than 2 minutes", "2–5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"].map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input type="radio" name="sittingTolerance" checked={formData.sittingTolerance === opt} onChange={() => updateField("sittingTolerance", opt)} className="h-4 w-4 accent-[#185FA5]" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">7. Behaviour Assessment</h3>
              <BehaviourTable
                items={[
                  { key: "hyperactivity", label: "Hyperactivity" },
                  { key: "poorAttention", label: "Poor attention" },
                  { key: "tantrums", label: "Tantrums" },
                  { key: "cryingEpisodes", label: "Crying episodes" },
                  { key: "aggression", label: "Aggression" },
                  { key: "selfInjurious", label: "Self-injurious behaviour" },
                  { key: "repetitiveBehaviour", label: "Repetitive behaviour" },
                  { key: "resistanceToTask", label: "Resistance to task" },
                  { key: "difficultyWithChange", label: "Difficulty with change" },
                  { key: "sensorySeeking", label: "Sensory-seeking behaviour" },
                  { key: "fearAnxiety", label: "Fear / anxiety" },
                  { key: "sleepBehaviour", label: "Sleep-related behaviour concern" }
                ]}
                values={formData.s7_behaviour}
                onPresenceChange={(k, pres) => updateDeepGoal("s7_behaviour", k, "present", pres)}
                onRemarksChange={(k, rem) => updateDeepGoal("s7_behaviour", k, "remarks", rem)}
              />

              <CheckboxGrid
                label="Possible triggers:"
                options={["Denied object", "Waiting", "Noise", "New place", "Task demand", "Hunger", "Fatigue", "Transition", "Unknown"]}
                value={formData.possibleTriggers}
                onChange={(v) => updateField("possibleTriggers", v)}
              />
              <Input label="Behaviour Summary:" type="textarea" rows={3} value={formData.s7_summary} onChange={(e) => updateField("s7_summary", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Social & Academic (S8–9) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 5: S8 Social Skills & S9 Pre-Academic and Academic Skills ═══ */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">8. Social Skills and Play Skills</h3>
              <IepRatingTable
                items={[
                  { key: "respondsAdults", label: "Responds to adults" },
                  { key: "respondsPeers", label: "Responds to peers" },
                  { key: "greetsOthers", label: "Greets others" },
                  { key: "sharesToys", label: "Shares toys / materials" },
                  { key: "takesTurns", label: "Takes turns" },
                  { key: "imitatesActions", label: "Imitates actions" },
                  { key: "functionalPlay", label: "Functional play" },
                  { key: "pretendPlay", label: "Pretend play" },
                  { key: "groupActivity", label: "Participates in group activity" },
                  { key: "classroomRules", label: "Understands simple classroom rules" }
                ]}
                values={formData.s8_social}
                remarks={formData.s8_remarks}
                onRatingChange={(k, v) => updateNested("s8_social", k, v)}
                onRemarksChange={(k, rem) => updateNested("s8_remarks", k, rem)}
              />
              <Input label="Social Skills and Play Skills Summary:" type="textarea" rows={3} value={formData.s8_summary} onChange={(e) => updateField("s8_summary", e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">9. Pre-Academic and Academic Skills</h3>
              <IepRatingTable
                items={[
                  { key: "matchesObjects", label: "Matches objects" },
                  { key: "matchesPictures", label: "Matches pictures" },
                  { key: "sortsObjects", label: "Sorts objects" },
                  { key: "identifiesColours", label: "Identifies colours" },
                  { key: "identifiesShapes", label: "Identifies shapes" },
                  { key: "identifiesBodyParts", label: "Identifies body parts" },
                  { key: "identifiesAnimals", label: "Identifies animals" },
                  { key: "identifiesFruitsVeg", label: "Identifies fruits / vegetables" },
                  { key: "identifiesAlphabets", label: "Identifies alphabets" },
                  { key: "identifiesNumbers", label: "Identifies numbers" },
                  { key: "countsObjects", label: "Counts objects" },
                  { key: "recitesRhymes", label: "Recites rhymes" },
                  { key: "recognisesName", label: "Recognises name" },
                  { key: "copiesLinesShapes", label: "Copies lines / shapes" },
                  { key: "prewritingReadiness", label: "Pre-writing readiness" }
                ]}
                values={formData.s9_academic}
                remarks={formData.s9_remarks}
                onRatingChange={(k, v) => updateNested("s9_academic", k, v)}
                onRemarksChange={(k, rem) => updateNested("s9_remarks", k, rem)}
              />
              <Input label="Pre-Academic and Academic Skills Summary:" type="textarea" rows={3} value={formData.s9_summary} onChange={(e) => updateField("s9_summary", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Motor Skills (S10–11) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 6: S10 Fine Motor & S11 Gross Motor ═══ */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">10. Fine Motor Skills</h3>
              <IepRatingTable
                items={[
                  { key: "reachesGrasps", label: "Reaches and grasps objects" },
                  { key: "transfersHand", label: "Transfers objects hand to hand" },
                  { key: "stacksBlocks", label: "Stacks blocks" },
                  { key: "pegboard", label: "Peg board activity" },
                  { key: "beading", label: "Beading / threading" },
                  { key: "tearsPaper", label: "Tears paper" },
                  { key: "pastesPaper", label: "Pastes paper" },
                  { key: "usesCrayons", label: "Uses crayons" },
                  { key: "pencilGrip", label: "Pencil grip" },
                  { key: "scribbling", label: "Scribbling" },
                  { key: "tracing", label: "Tracing" },
                  { key: "usesScissors", label: "Uses scissors safely" },
                  { key: "buttoning", label: "Buttoning / unbuttoning" }
                ]}
                values={formData.s10_fineMotor}
                remarks={formData.s10_remarks}
                onRatingChange={(k, v) => updateNested("s10_fineMotor", k, v)}
                onRemarksChange={(k, rem) => updateNested("s10_remarks", k, rem)}
              />
              <Input label="Fine Motor Skills Summary:" type="textarea" rows={3} value={formData.s10_summary} onChange={(e) => updateField("s10_summary", e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">11. Gross Motor Skills</h3>
              <IepRatingTable
                items={[
                  { key: "sittingBalance", label: "Sitting balance" },
                  { key: "standingBalance", label: "Standing balance" },
                  { key: "walking", label: "Walking" },
                  { key: "running", label: "Running" },
                  { key: "jumping", label: "Jumping" },
                  { key: "climbingStairs", label: "Climbing stairs" },
                  { key: "kickingBall", label: "Kicking ball" },
                  { key: "throwingBall", label: "Throwing ball" },
                  { key: "catchingBall", label: "Catching ball" },
                  { key: "bodyCoordination", label: "Body coordination" },
                  { key: "postureControl", label: "Posture control" },
                  { key: "muscleTone", label: "Muscle tone concern" }
                ]}
                values={formData.s11_grossMotor}
                remarks={formData.s11_remarks}
                onRatingChange={(k, v) => updateNested("s11_grossMotor", k, v)}
                onRemarksChange={(k, rem) => updateNested("s11_remarks", k, rem)}
              />
              <Input label="Gross Motor Skills Summary:" type="textarea" rows={3} value={formData.s11_summary} onChange={(e) => updateField("s11_summary", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sensory & ADL (S12–14) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 7: S12 Sensory, S13 ADL, S14 Emotional Regulation ═══ */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">12. Sensory Processing Assessment</h3>
              <SensoryTable
                items={[
                  { key: "sound", label: "Sound" },
                  { key: "touch", label: "Touch" },
                  { key: "movement", label: "Movement" },
                  { key: "visual", label: "Light / visual input" },
                  { key: "smell", label: "Smell" },
                  { key: "taste", label: "Taste / food texture" },
                  { key: "oral", label: "Oral sensory needs" },
                  { key: "deepPressure", label: "Deep pressure need" }
                ]}
                values={formData.s12_sensory}
                onResponseChange={(k, resp) => updateDeepGoal("s12_sensory", k, "response", resp)}
                onRemarksChange={(k, rem) => updateDeepGoal("s12_sensory", k, "remarks", rem)}
              />

              <CheckboxGrid
                label="Sensory Concerns Noted:"
                options={[
                  "Covers ears", "Avoids touch", "Toe walking",
                  "Spins objects", "Hand flapping", "Chews objects",
                  "Seeks pressure", "Avoids certain food textures", "Fear of movement",
                  "Constant movement seeking"
                ]}
                value={formData.sensoryConcerns}
                onChange={(v) => updateField("sensoryConcerns", v)}
              />
              <Input label="Sensory Summary:" type="textarea" rows={3} value={formData.s12_summary} onChange={(e) => updateField("s12_summary", e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">13. Activities of Daily Living Assessment</h3>
              <IepRatingTable
                items={[
                  { key: "eatingIndependently", label: "Eating independently" },
                  { key: "drinkingCup", label: "Drinking from cup / bottle" },
                  { key: "handWashing", label: "Hand washing" },
                  { key: "brushing", label: "Brushing" },
                  { key: "dressing", label: "Dressing" },
                  { key: "undressing", label: "Undressing" },
                  { key: "toileting", label: "Toileting" },
                  { key: "indicatesToilet", label: "Indicates toilet need" },
                  { key: "wearsFootwear", label: "Wears footwear" },
                  { key: "arrangesBag", label: "Arranges school bag" },
                  { key: "cleansUp", label: "Cleans up after activity" },
                  { key: "followsRoutine", label: "Follows daily routine" }
                ]}
                values={formData.s13_adl}
                remarks={formData.s13_remarks}
                onRatingChange={(k, v) => updateNested("s13_adl", k, v)}
                onRemarksChange={(k, rem) => updateNested("s13_remarks", k, rem)}
              />
              <Input label="Activities of Daily Living Assessment Summary:" type="textarea" rows={3} value={formData.s13_summary} onChange={(e) => updateField("s13_summary", e.target.value)} />
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">14. Emotional Regulation</h3>
              <IepRatingTable
                items={[
                  { key: "expressesCalmly", label: "Expresses needs calmly" },
                  { key: "waitsWithoutDistress", label: "Waits without distress" },
                  { key: "acceptsNo", label: "Accepts “no”" },
                  { key: "handlesCorrection", label: "Handles correction" },
                  { key: "calmsAfterUpset", label: "Calms after upset" },
                  { key: "acceptsChangeRoutine", label: "Accepts change in routine" },
                  { key: "ageAppropriateResponse", label: "Shows age-appropriate emotional response" }
                ]}
                values={formData.s14_emotional}
                remarks={formData.s14_remarks}
                onRatingChange={(k, v) => updateNested("s14_emotional", k, v)}
                onRemarksChange={(k, rem) => updateNested("s14_remarks", k, rem)}
              />
              <Input label="Emotional Regulation Summary:" type="textarea" rows={3} value={formData.s14_summary} onChange={(e) => updateField("s14_summary", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Strengths & Levels (S15–18) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 8: S15 Learning Style, S16 Strengths, S17 Support Areas, S18 Present Performance ═══ */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">15. Learning Style</h3>
              <CheckboxGrid
                label="Child learns better through:"
                options={[
                  "Visual method", "Verbal instruction", "Picture cards",
                  "Objects / real materials", "Music / rhymes", "Movement-based learning",
                  "Repetition", "Imitation", "Play-based learning",
                  "Smart TV / digital learning", "One-to-one teaching", "Group activity"
                ]}
                value={formData.learningStyles}
                onChange={(v) => updateField("learningStyles", v)}
              />
              <Input label="Remarks:" type="textarea" rows={2} value={formData.learningStyleRemarks} onChange={(e) => updateField("learningStyleRemarks", e.target.value)} />
            </div>

            <div className="space-y-3 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">16. Strengths of the Child</h3>
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C2C2A] w-5">{num}.</span>
                  <input
                    type="text"
                    value={formData[`strength${num}`]}
                    onChange={(e) => updateField(`strength${num}`, e.target.value)}
                    placeholder={`Strength ${num}...`}
                    className="flex-1 h-8 px-2.5 border border-[#D3D1C7] rounded-[6px] text-xs font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">17. Areas Requiring Support</h3>
              <CheckboxGrid
                options={[
                  "Communication", "Attention", "Behaviour",
                  "Social skills", "Play skills", "Pre-academics",
                  "Academics", "Fine motor", "Gross motor",
                  "Sensory processing", "ADL skills", "Emotional regulation",
                  "School readiness", "Parent guidance"
                ]}
                value={formData.supportAreas}
                onChange={(v) => updateField("supportAreas", v)}
              />
              <Input label="Details:" type="textarea" rows={2} value={formData.supportDetails} onChange={(e) => updateField("supportDetails", e.target.value)} />
            </div>

            <div className="space-y-3 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">18. Present Level of Performance</h3>
              <Input label="Communication Level:" value={formData.perfCommunication} onChange={(e) => updateField("perfCommunication", e.target.value)} />
              <Input label="Academic / Pre-Academic Level:" value={formData.perfAcademic} onChange={(e) => updateField("perfAcademic", e.target.value)} />
              <Input label="Behaviour Level:" value={formData.perfBehaviour} onChange={(e) => updateField("perfBehaviour", e.target.value)} />
              <Input label="Social Skill Level:" value={formData.perfSocial} onChange={(e) => updateField("perfSocial", e.target.value)} />
              <Input label="ADL Level:" value={formData.perfAdl} onChange={(e) => updateField("perfAdl", e.target.value)} />
              <Input label="Motor Skill Level:" value={formData.perfMotor} onChange={(e) => updateField("perfMotor", e.target.value)} />
              <Input label="Sensory Level:" value={formData.perfSensory} onChange={(e) => updateField("perfSensory", e.target.value)} />
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Goals & Intervention (S19–23) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 9: S19 Short Goals, S20 Long Goals, S21 Intervention, S22 Home Prog, S23 Review ═══ */}
        {activeTab === 9 && (
          <div className="space-y-6">
            {/* Section 19: Short-Term Goals: 3 Months */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">19. Short-Term Goals: 3 Months</h3>
              <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
                      <th className="py-2.5 px-3 w-36">Area</th>
                      <th className="py-2.5 px-3">Goal</th>
                      <th className="py-2.5 px-3">Strategy / Activity</th>
                      <th className="py-2.5 px-3 w-32">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { k: "communication", l: "Communication" },
                      { k: "attention", l: "Attention" },
                      { k: "behaviour", l: "Behaviour" },
                      { k: "socialSkills", l: "Social Skills" },
                      { k: "preAcademics", l: "Pre-Academics" },
                      { k: "adl", l: "ADL" },
                      { k: "fineMotor", l: "Fine Motor" },
                      { k: "grossMotor", l: "Gross Motor" },
                      { k: "sensory", l: "Sensory" }
                    ].map(({ k, l }) => (
                      <tr key={k} className="border-b border-[#E8E6DF]">
                        <td className="py-2 px-3 font-semibold text-[#2C2C2A] bg-[#F8F8F6]">{l}</td>
                        <td className="p-1.5"><input type="text" value={formData.shortTermGoals[k]?.goal || ""} onChange={(e) => updateDeepGoal("shortTermGoals", k, "goal", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                        <td className="p-1.5"><input type="text" value={formData.shortTermGoals[k]?.strategy || ""} onChange={(e) => updateDeepGoal("shortTermGoals", k, "strategy", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                        <td className="p-1.5"><input type="text" value={formData.shortTermGoals[k]?.review || ""} onChange={(e) => updateDeepGoal("shortTermGoals", k, "review", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 20: Long-Term Goals: 6 to 12 Months */}
            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">20. Long-Term Goals: 6 to 12 Months</h3>
              <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
                      <th className="py-2.5 px-3 w-40">Area</th>
                      <th className="py-2.5 px-3">Goal</th>
                      <th className="py-2.5 px-3">Expected Outcome</th>
                      <th className="py-2.5 px-3 w-32">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { k: "communication", l: "Communication" },
                      { k: "behaviour", l: "Behaviour" },
                      { k: "learningAcademics", l: "Learning / Academics" },
                      { k: "socialSkills", l: "Social Skills" },
                      { k: "adlIndependence", l: "ADL Independence" },
                      { k: "therapySupport", l: "Therapy Support" },
                      { k: "schoolReadiness", l: "School Readiness" }
                    ].map(({ k, l }) => (
                      <tr key={k} className="border-b border-[#E8E6DF]">
                        <td className="py-2 px-3 font-semibold text-[#2C2C2A] bg-[#F8F8F6]">{l}</td>
                        <td className="p-1.5"><input type="text" value={formData.longTermGoals[k]?.goal || ""} onChange={(e) => updateDeepGoal("longTermGoals", k, "goal", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                        <td className="p-1.5"><input type="text" value={formData.longTermGoals[k]?.outcome || ""} onChange={(e) => updateDeepGoal("longTermGoals", k, "outcome", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                        <td className="p-1.5"><input type="text" value={formData.longTermGoals[k]?.review || ""} onChange={(e) => updateDeepGoal("longTermGoals", k, "review", e.target.value)} className="w-full h-7 px-2 border border-[#D3D1C7] rounded outline-none font-medium" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 21: Recommended Intervention Plan */}
            <div className="space-y-4 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">21. Recommended Intervention Plan</h3>
              <CheckboxGrid
                options={[
                  "Special education", "Behaviour support", "Speech and communication support",
                  "Physiotherapy", "Occupational therapy", "Sensory integration activities",
                  "Developmental therapy", "ADL training", "Social skill training",
                  "Parent counselling", "Home programme", "Group activity",
                  "School readiness programme"
                ]}
                value={formData.interventionPlan}
                onChange={(v) => updateField("interventionPlan", v)}
              />
              <Input label="Frequency / duration recommended:" type="textarea" rows={2} value={formData.interventionFrequency} onChange={(e) => updateField("interventionFrequency", e.target.value)} />
            </div>

            {/* Section 22: Home Programme Suggestions */}
            <div className="space-y-3 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">22. Home Programme Suggestions</h3>
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C2C2A] w-5">{num}.</span>
                  <input
                    type="text"
                    value={formData[`homeSuggestion${num}`]}
                    onChange={(e) => updateField(`homeSuggestion${num}`, e.target.value)}
                    placeholder={`Suggestion ${num}...`}
                    className="flex-1 h-8 px-2.5 border border-[#D3D1C7] rounded-[6px] text-xs font-medium outline-none focus:border-[#185FA5]"
                  />
                </div>
              ))}
            </div>

            {/* Section 23: Review Plan */}
            <div className="space-y-3 pt-4 border-t border-[#D3D1C7]">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">23. Review Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="First Review Date:" type="date" value={formData.firstReviewDate} onChange={(e) => updateField("firstReviewDate", e.target.value)} />
                <Input label="Second Review Date:" type="date" value={formData.secondReviewDate} onChange={(e) => updateField("secondReviewDate", e.target.value)} />
                <Input label="Third Review Date:" type="date" value={formData.thirdReviewDate} onChange={(e) => updateField("thirdReviewDate", e.target.value)} />
              </div>
              <p className="text-xs italic text-[#5F5E5A] bg-[#F8F8F6] p-3 rounded-[6px] border border-[#D3D1C7]/60">
                Progress will be reviewed regularly and goals will be modified according to the child’s improvement, readiness and individual needs.
              </p>
            </div>

            <div className="flex justify-between pt-4"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sign Off (S24) →</Button></div>
          </div>
        )}

        {/* ═══ TAB 10: S24 Final Remarks by Special Educator / Therapy Team & Sign Off ═══ */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#185FA5] uppercase">24. Final Remarks by Special Educator / Therapy Team</h3>
              <Input label="Final remarks:" type="textarea" rows={4} value={formData.finalRemarks} onChange={(e) => updateField("finalRemarks", e.target.value)} />

              {/* Sign Off Table */}
              <div className="border border-[#D3D1C7] rounded-[8px] overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-[#D3D1C7]">
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] w-1/4 border-r border-[#D3D1C7]">Assessor Name:</td>
                      <td className="p-2 w-1/4 border-r border-[#D3D1C7]">
                        <input type="text" value={formData.assessorName} onChange={(e) => updateField("assessorName", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] w-1/4 border-r border-[#D3D1C7]">Parent / Guardian Name:</td>
                      <td className="p-2 w-1/4">
                        <input type="text" value={formData.parentGuardianName} onChange={(e) => updateField("parentGuardianName", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                    </tr>
                    <tr className="border-b border-[#D3D1C7]">
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Designation:</td>
                      <td className="p-2 border-r border-[#D3D1C7]">
                        <input type="text" value={formData.assessorDesignation} onChange={(e) => updateField("assessorDesignation", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Relationship:</td>
                      <td className="p-2">
                        <input type="text" value={formData.parentRelationship} onChange={(e) => updateField("parentRelationship", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                    </tr>
                    <tr className="border-b border-[#D3D1C7]">
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Signature:</td>
                      <td className="p-2 border-r border-[#D3D1C7]">
                        <input type="text" value={formData.assessorSignature} onChange={(e) => updateField("assessorSignature", e.target.value)} placeholder="Type name or sign..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Signature:</td>
                      <td className="p-2">
                        <input type="text" value={formData.parentSignature} onChange={(e) => updateField("parentSignature", e.target.value)} placeholder="Type name or sign..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Date:</td>
                      <td className="p-2 border-r border-[#D3D1C7]">
                        <input type="date" value={formData.assessorDate} onChange={(e) => updateField("assessorDate", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                      <td className="p-2.5 bg-[#F8F8F6] font-bold text-[#2C2C2A] border-r border-[#D3D1C7]">Date:</td>
                      <td className="p-2">
                        <input type="date" value={formData.parentDate} onChange={(e) => updateField("parentDate", e.target.value)} className="w-full h-8 px-2 border border-[#D3D1C7] rounded outline-none font-medium" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#D3D1C7]">
              <Button variant="outlined" onClick={goPrev}>← Back</Button>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outlined"
                  size="lg"
                  icon={Trash2}
                  onClick={handleDeleteAssessment}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
                <Button variant="outlined" size="lg" icon={Save} onClick={handleSaveAssessmentOnly} loading={isSubmitting}>
                  Save Assessment
                </Button>
                <Button size="lg" icon={Send} className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs" onClick={() => setShowSubmitModal(true)}>
                  Generate Report &amp; Submit for Review
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Generate Report & Submit for Review">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Generate the IEP report and submit it for clinical review for <strong>{formData.childName || child?.name}</strong>?
          </p>
          <div className="bg-[#ECFDF5] border border-[#86EFAC] rounded-[8px] p-3 text-[#085041] space-y-1">
            <p>✓ Current assessment inputs and 24-domain ratings will be saved</p>
            <p>✓ 3-Month IEP report with baseline comparisons will be compiled</p>
            <p>✓ Report will be queued for Admin review</p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitAssessment} loading={isSubmitting} className="bg-[#185FA5] hover:bg-[#114B84] text-white">
              Generate &amp; Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
