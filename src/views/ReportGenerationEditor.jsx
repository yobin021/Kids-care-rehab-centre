"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Printer,
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
import { exerciseService, resolveExerciseItem } from "../services/exerciseService";
import { childrenService } from "../services/childrenService";
import { assessmentService } from "../services/assessmentService";
import { printReportWithFilename } from "../utils/printHelpers";

function getDefaultFormState(child, category = "asd", assessment = null) {
  const name = child?.name || "Child";
  const age = child?.age || "5y";
  const gender = child?.gender || "Male";
  const concern = child?.primaryConcern || "developmental challenges";
  const today = new Date().toISOString().split("T")[0];

  if (category === "adhd") {
    const presentation = assessment?.adhd_presentation || "Combined Presentation";
    return {
      therapistReport: {
        background: `${name} is a ${age} ${gender} referred for evaluation of high motor activity, distractibility, and impulsivity. Evaluated using the Conners' ADHD Rating Scale.`,
        assessmentFindings: `Conners' ADHD evaluation indicates clinically elevated scores in ${presentation}. Primary challenges noted in sustained attention, impulse inhibition, and high motor activity during non-preferred tasks.`,
        currentStatus: `${name} demonstrates excellent energy, creative problem-solving, and responds well to 1-on-1 structured tasks with clear visual cues and frequent sensory breaks.`,
        recommendations: "Occupational therapy with sensory regulation 2x/week, Behavioral therapy for executive functioning and impulse control, Classroom accommodation plan with movement breaks.",
        reviewPlan: "Progress will be re-evaluated in 12 weeks to monitor sitting tolerance, task completion rates, and impulse regulation.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Occupational & Behavioral Therapist",
        date: today
      },
      parentReport: {
        aboutYourChild: `We are delighted to work with ${name}! They bring tremendous energy, curiosity, and warmth to our sessions.`,
        whatWeFound: `${name} is bright and learns rapidly through hands-on activities. They benefit from structured routines and short movement breaks to help sustain attention.`,
        strengths: [
          "High curiosity and eagerness to explore",
          "Responds warmly to positive reinforcement",
          "Enjoys energetic physical and sensory games",
          "Quick learner with interactive visual aids"
        ],
        workingOn: "Building sustained focus for table tasks, practicing 'stop-and-think' before acting, and smooth transitions between activities.",
        focusAreas: [
          "Attention span during structured tasks",
          "Impulse regulation and waiting turns",
          "Organizing materials and following multi-step directions"
        ],
        therapyPlan: "Occupational Therapy & Behavioral Intervention, 2 sessions/week for 6 months.",
        therapyType: "Occupational & Behavioral Therapy",
        sessionsPerWeek: 2,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Create predictable daily routines with visual timers. Provide physical movement before seated homework, and break tasks into 10-minute chunks.",
        homeSuggestions: [
          "Use a 10-minute visual countdown timer for homework",
          "Provide sensory heavy-work (pushing a wall, jumping) before seated tasks",
          "Use positive praise immediately when instructions are followed"
        ],
        encouragement: `With consistent routines and your encouragement at home, ${name}'s vibrant energy will become their greatest strength.`
      },
      exercises: {
        clinicExercises: [
          "Obstacle Course",
          "Single Leg Stance",
          "Trampoline Rebounding",
          "Deep Pressure Sensory Roll",
          "Puzzle Play"
        ],
        homeExercises: [
          "Bear Walk",
          "Jumping Jacks",
          "Deep Pressure Sensory Roll"
        ],
        parentNotes: "Practice movement breaks and visual timer routines daily at home.",
        therapyDays: ["Mon", "Wed", "Fri"],
        sessionTime: "10:00",
        sessionDuration: "60",
        frequencyPerWeek: 2,
        startDate: today,
        nextReviewDate: "12 weeks"
      }
    };
  }

  if (category === "developmental_delay") {
    const severity = assessment?.delay_severity || "Mild-to-Moderate Delay";
    const areas = assessment?.delay_areas?.join(", ") || "Gross Motor, Fine Motor, and Expressive Speech";
    return {
      therapistReport: {
        background: `${name} is a ${age} ${gender} evaluated for developmental delays across physical, motor, and communicative milestones.`,
        assessmentFindings: `Standardized developmental screening indicates ${severity} with primary delays observed in ${areas}. Early intervention is recommended to support milestone recovery.`,
        currentStatus: `${name} shows good engagement and willingness to imitate movements. Steady progress noted in basic motor planning and receptive comprehension.`,
        recommendations: "Early Intervention Occupational Therapy 2x/week, Pediatric Physiotherapy/Speech Therapy as indicated, Daily home developmental exercise regimen.",
        reviewPlan: "Quarterly milestone review in 12 weeks to benchmark progress against developmental age equivalents.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Pediatric Developmental Therapist",
        date: today
      },
      parentReport: {
        aboutYourChild: `${name} is an endearing, sweet child who showed great curiosity and perseverance during our developmental evaluation.`,
        whatWeFound: `${name} has strong receptive skills and enjoys interactive play. With targeted exercises, their motor coordination and speech milestones will steadily catch up.`,
        strengths: [
          "Tries hard during guided activities",
          "Good eye contact and smiling interaction",
          "Loves music and cause-and-effect toys",
          "Shows steady willingness to learn new movements"
        ],
        workingOn: "Strengthening core and fine motor grasping, expanding words for daily needs, and balance activities.",
        focusAreas: [
          "Gross and fine motor coordination",
          "Speech and language milestone achievement",
          "Independent self-help skills (spoon feeding, drinking)"
        ],
        therapyPlan: "Early Intervention & Pediatric Rehabilitation, 2 sessions/week for 6 months.",
        therapyType: "Early Intervention & Physical Therapy",
        sessionsPerWeek: 2,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Encourage floor play, tummy time, and hand-eye coordination games like stacking cups. Talk through daily activities to stimulate speech.",
        homeSuggestions: [
          "Encourage 15 minutes of obstacle course floor crawling daily",
          "Practice pincer grasp using safe finger foods",
          "Narrate everyday actions clearly to build vocabulary"
        ],
        encouragement: `Every child develops at their own unique pace. With early intervention and your love, ${name} will make wonderful strides.`
      },
      exercises: {
        clinicExercises: [
          "Prone on Elbows & Tummy Reaching",
          "Therapy Ball Reach",
          "Step-Ups",
          "Pegboard Activity",
          "Sensory Tactile Bin Exploration"
        ],
        homeExercises: [
          "Prone on Elbows & Tummy Reaching",
          "Pegboard Activity",
          "Mirror Imitation & Facial Expressions"
        ],
        parentNotes: "Spend 20 minutes daily on floor-based developmental play.",
        therapyDays: ["Tue", "Thu", "Sat"],
        sessionTime: "11:00",
        sessionDuration: "60",
        frequencyPerWeek: 2,
        startDate: today,
        nextReviewDate: "12 weeks"
      }
    };
  }

  if (category === "learning_disability") {
    const dyslexia = assessment?.ldst_subtest_scores?.dyslexiaRisk || "Moderate Risk";
    const dysgraphia = assessment?.ldst_subtest_scores?.dysgraphiaRisk || "Mild Risk";
    const dyscalculia = assessment?.ldst_subtest_scores?.dyscalculiaRisk || "Low Risk";
    return {
      therapistReport: {
        background: `${name} is a ${age} student evaluated for academic difficulties using the Learning Disability Screening Battery (LDST).`,
        assessmentFindings: `Screening indicates risk staging: Dyslexia (${dyslexia}), Dysgraphia (${dysgraphia}), Dyscalculia (${dyscalculia}). Digit span testing indicates working memory vulnerabilities during multi-step academic tasks.`,
        currentStatus: `${name} demonstrates strong verbal reasoning and conceptual intelligence, but experiences phonological processing bottlenecks and handwriting fatigue.`,
        recommendations: "Special Education & Remedial Therapy 2-3x/week, Multisensory phonics (Orton-Gillingham approach), Fine motor pencil grip modification, School accommodations (extra time).",
        reviewPlan: "Academic and screening re-evaluation in 12 weeks to gauge reading fluency and written expression gains.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Special Educator & Clinical Remediation Specialist",
        date: today
      },
      parentReport: {
        aboutYourChild: `${name} is a bright and capable child who expressed wonderful creativity and reasoning during our academic screening.`,
        whatWeFound: `${name} understands concepts very well when explained verbally. Their reading and writing difficulties are specific processing differences, not a lack of effort or capability.`,
        strengths: [
          "Strong verbal vocabulary and general knowledge",
          "Excellent creative problem-solving",
          "Understands stories well when read aloud",
          "Determined and hard-working attitude"
        ],
        workingOn: "Phonemic decoding for reading fluency, pencil grip comfort and letter spacing, and number-sense strategies.",
        focusAreas: [
          "Multisensory reading and spelling strategies",
          "Handwriting endurance and spacing",
          "Math visualization using manipulatives"
        ],
        therapyPlan: "Remedial Education & Occupational Therapy, 2-3 sessions/week for 6 months.",
        therapyType: "Remedial Education & Occupational Therapy",
        sessionsPerWeek: 3,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Read together daily using paired reading. Avoid comparing with peers, celebrate small reading victories, and allow audiobooks to nurture their love for stories.",
        homeSuggestions: [
          "15 minutes of paired reading daily with finger tracking",
          "Use pencil grips and slant boards to reduce hand fatigue",
          "Break homework into short, focused intervals with breaks"
        ],
        encouragement: `With the right multisensory tools and school accommodations, ${name}'s unique strengths and intellect will shine brightly.`
      },
      exercises: {
        clinicExercises: [
          "Pegboard Activity",
          "Bead Stringing",
          "Cutting with Scissors",
          "Playdough Clay Modeling",
          "Bilateral Hand Clapping & Pat-a-Cake"
        ],
        homeExercises: [
          "Bead Stringing",
          "Playdough Clay Modeling",
          "Finger Isolation / Pointing Games"
        ],
        parentNotes: "Practise 15 minutes of paired reading daily in a relaxed environment.",
        therapyDays: ["Mon", "Wed", "Fri"],
        sessionTime: "16:00",
        sessionDuration: "60",
        frequencyPerWeek: 3,
        startDate: today,
        nextReviewDate: "12 weeks"
      }
    };
  }

  // Default: ASD
  const isaaScore = assessment?.isaa_score || "88";
  const isaaSeverity = assessment?.isaa_severity || "Mild Autism";
  return {
    therapistReport: {
      background: `${name} is a ${age} ${gender} presenting with ${concern}. Evaluated using standard ISAA protocol by therapy team.`,
      assessmentFindings: `ISAA assessment yields a score of ${isaaScore}, indicating ${isaaSeverity}. Primary developmental challenges observed in reciprocal social communication, emotional responsiveness, and sensory modulation.`,
      currentStatus: `${name} responds to name call consistently and follows 1-step commands. Shows progress in understanding routines, while working on turn-taking.`,
      recommendations: "Speech therapy 2x/week, Occupational therapy with sensory integration 2x/week, Parent guidance program.",
      reviewPlan: "Progress will be re-evaluated in 12 weeks to assess gains in expressive vocabulary, turn-taking, and sitting tolerance.",
      preparedBy: "Senior Clinical Specialist",
      designation: "Occupational & Speech Therapist",
      date: today
    },
    parentReport: {
      aboutYourChild: `We are happy to share that ${name} has made progress during therapy sessions. They demonstrate good engagement and curiosity during interactive tasks.`,
      whatWeFound: `${name} shows strong visual processing and enthusiasm for learning activities. Speech clarity and social interaction are being actively supported.`,
      strengths: [
        "Responds consistently to name call",
        "Expresses needs clearly with gestures and words",
        "Warm and friendly with staff",
        "Enjoys sensory play activities"
      ],
      workingOn: "Building two-word phrase communication, sitting tolerance, and turn-taking with peers.",
      focusAreas: [
        "Expanding vocabulary and sentence length",
        "Social interaction in group settings",
        "Sitting tolerance during quiet table tasks"
      ],
      therapyPlan: "Speech + Occupational Therapy, 2 sessions/week for 6 months.",
      therapyType: "Speech + Occupational Therapy",
      sessionsPerWeek: 2,
      duration: "6 months",
      nextReviewDate: "12 weeks",
      homeAdvice: "Practise naming objects during daily routines (bathing, meal time). Encourage 2-word requests before handing items.",
      homeSuggestions: [
        "Practise naming objects during daily activities",
        "Use picture cards during meals and play time",
        "Encourage 2-word requests before giving items"
      ],
      encouragement: `With your support at home and our guidance at the clinic, ${name} will continue to grow beautifully.`
    },
    exercises: {
      clinicExercises: [
        "Swing Therapy (Vestibular Stimulation)",
        "Deep Pressure Sensory Roll",
        "Sensory Tactile Bin Exploration",
        "Oral Motor Straw Blowing & Bubbles",
        "Obstacle Course"
      ],
      homeExercises: [
        "Deep Pressure Sensory Roll",
        "Sensory Tactile Bin Exploration",
        "Oral Motor Straw Blowing & Bubbles"
      ],
      parentNotes: "Practise 15 minutes daily before bedtime.",
      therapyDays: ["Mon", "Wed", "Fri"],
      sessionTime: "10:00",
      sessionDuration: "60",
      frequencyPerWeek: 2,
      startDate: today,
      nextReviewDate: "12 weeks"
    }
  };
}

export default function ReportGenerationEditor() {
  const { id, childId: paramChildId, reportId } = useParams();
  const targetId = paramChildId || reportId || id || "KCR-2024-002";
  const [searchParams] = useSearchParams();
  const queryAssessmentId = searchParams.get("assessmentId");
  const navigate = useNavigate();
  const { user, isAdmin, childrenList, updateChildDetails, showToast } = useAuth();
  const [activeChild, setActiveChild] = useState(
    () => childrenList?.find((c) => c.id === targetId) || childrenList?.[1] || childrenList?.[0] || null
  );
  const child = activeChild || childrenList?.find((c) => c.id === targetId) || {
    id: targetId,
    name: targetId === "KCR-2024-001" ? "Aditya Verma" : "Aarav Ramanathan",
    therapy_category: "ASD",
    program_type: targetId === "KCR-2024-001" ? "iep" : "therapy",
    parent: { name: "Mrs. Priya Ramanathan", phone: "9876543210" }
  };
  const [assessmentRecord, setAssessmentRecord] = useState(null);
  const [detectedCategory, setDetectedCategory] = useState("asd");

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
  const [reportStatus, setReportStatus] = useState(activeChild?.reportsCount > 0 ? "published" : "draft");
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
  const [formState, setFormState] = useState(() => getDefaultFormState(activeChild, "asd", null));

  // Load Child & Assessment details and apply category-tailored template
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        let c = childrenList.find((x) => x.id === targetId);
        if (!c) {
          c = await childrenService.getById(targetId);
        }
        if (c && isMounted) {
          setActiveChild(c);
        }

        let a = null;
        if (queryAssessmentId) {
          a = await assessmentService.getById(queryAssessmentId);
        }
        if (!a && targetId) {
          const list = await assessmentService.getByChildId(targetId);
          if (Array.isArray(list) && list.length > 0) a = list[0];
        }

        if (isMounted && a) {
          setAssessmentRecord(a);
        }

        const cat = (a?.source_table || c?.therapy_category || c?.profile || c?.diagnosis || "").toLowerCase();
        let pathway = "asd";
        if (cat.includes("adhd") || cat.includes("conner")) pathway = "adhd";
        else if (cat.includes("delay") || cat.includes("developmental")) pathway = "developmental_delay";
        else if (cat.includes("learn") || cat.includes("ldst") || cat.includes("sld") || cat.includes("dyslex")) pathway = "learning_disability";

        if (isMounted) setDetectedCategory(pathway);

        // Check if there is already a published report or saved draft in localStorage (only if not newly arriving from an assessment)
        const saved = !queryAssessmentId ? (localStorage.getItem(`report_published_${targetId}`) || localStorage.getItem(`report_draft_${targetId}`)) : null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.formState && isMounted) {
              setFormState(parsed.formState);
            } else if (isMounted) {
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
            if (isMounted && (parsed.publishedDate || localStorage.getItem(`report_published_${targetId}`))) {
              setReportStatus("published");
            }
          } catch (_) {}
        } else if (isMounted) {
          // Initialize fresh form with category-tailored initial template
          setFormState(getDefaultFormState(c || activeChild, pathway, a));
        }
      } catch (err) {
        console.warn("ReportGenerationEditor data load notice:", err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [targetId, queryAssessmentId, childrenList]);

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
          childData: activeChild || child,
          category: detectedCategory,
          assessmentData: assessmentRecord
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
      const savedResult = localStorage.getItem(`assessment_result_${activeChild?.id || child?.id}`);
      let isaaRes = null;
      let domainScores = null;
      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          isaaRes = parsed.isaa;
          domainScores = parsed.domainScores;
        } catch (_) {}
      }

      if (assessmentRecord?.source_table === "assessment_asd") {
        isaaRes = {
          totalScore: assessmentRecord.isaa_score,
          severity: assessmentRecord.isaa_severity
        };
        domainScores = assessmentRecord.domain_scores || domainScores;
      }

      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full",
          childData: activeChild || child,
          category: detectedCategory,
          assessmentData: assessmentRecord,
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

  // Action: Submit for Admin Review (Staff) or Approve & Publish to Parent Portal (Admin)
  const executePublish = async () => {
    setIsPublishing(true);
    const pubDate = new Date().toISOString().split("T")[0];

    try {
      const currentChildId = activeChild?.id || child?.id;
      const defaultTherapyType =
        detectedCategory === "adhd"
          ? "Occupational & Behavioral Therapy"
          : detectedCategory === "developmental_delay"
          ? "Early Intervention & Physical Therapy"
          : detectedCategory === "learning_disability"
          ? "Remedial Education & Occupational Therapy"
          : "Speech + Occupational Therapy";

      // Step 1: Build complete report object
      const reportPayload = {
        child_id: currentChildId,
        assessment_id: queryAssessmentId || assessmentRecord?.id || null,
        assessment_type: detectedCategory || activeChild?.therapy_category || "therapy",
        therapist_report: formState.therapistReport,
        parent_report: formState.parentReport,
        clinic_exercises: formState.exercises.clinicExercises,
        home_exercises: formState.exercises.homeExercises,
        therapy_details: {
          therapyType: formState.parentReport.therapyType || defaultTherapyType,
          sessionsPerWeek: formState.parentReport.sessionsPerWeek || "2 sessions/week",
          duration: formState.parentReport.duration || "6 months",
          nextReviewDate: formState.parentReport.nextReviewDate || "12 weeks"
        },
        prepared_by: formState.therapistReport.preparedBy || user?.name || null,
        prepared_by_id: user?.id || null,
        status: isAdmin ? "published" : "pending_review"
      };

      // Step 2: Save or update draft in DB
      let currentReportId = formState.reportId;
      if (!currentReportId) {
        const saved = await reportService.saveDraft(reportPayload);
        currentReportId = saved?.id || currentChildId;
        if (saved?.id) {
          setFormState((prev) => ({ ...prev, reportId: saved.id }));
        }
      } else {
        await reportService.update(currentReportId, reportPayload);
      }

      setShowPublishModal(false);

      if (isAdmin) {
        // ADMIN FLOW: Approve & Publish directly to Parent Portal
        try {
          await reportService.publish(
            currentReportId,
            user?.name || formState.therapistReport.preparedBy || null,
            user?.id || null,
            reportPayload
          );
        } catch (pubErr) {
          console.warn("DB publish warning:", pubErr);
        }

        const fullPublishedData = {
          childId: currentChildId,
          childName: activeChild?.name || child?.name,
          publishedDate: pubDate,
          status: "published",
          formState,
          therapistReport: formState.therapistReport,
          parentReport: formState.parentReport,
          clinicEx: formState.exercises.clinicExercises,
          homeEx: formState.exercises.homeExercises
        };
        if (currentChildId) {
          localStorage.setItem(`report_published_${currentChildId}`, JSON.stringify(fullPublishedData));
        }

        if (currentChildId) {
          updateChildDetails(currentChildId, {
            reportsCount: ((activeChild || child)?.reportsCount || 0) + 1,
            lastReportDate: pubDate
          });
        }

        setReportStatus("published");
        showToast(`Report approved & published to Parent Portal for ${activeChild?.name || child?.name || "child"}!`, "success");
      } else {
        // STAFF FLOW: Submit report for Admin Review (NOT published to parents yet)
        try {
          await reportService.submitForReview(
            currentReportId,
            user?.name || formState.therapistReport.preparedBy || null,
            user?.id || null,
            reportPayload
          );
        } catch (subErr) {
          console.warn("DB submit warning:", subErr);
        }

        const fullDraftData = {
          childId: currentChildId,
          childName: activeChild?.name || child?.name,
          status: "pending_review",
          formState,
          therapistReport: formState.therapistReport,
          parentReport: formState.parentReport,
          clinicEx: formState.exercises.clinicExercises,
          homeEx: formState.exercises.homeExercises
        };
        if (currentChildId) {
          localStorage.setItem(`report_draft_${currentChildId}`, JSON.stringify(fullDraftData));
        }

        setReportStatus("pending_review");
        showToast(`Report submitted for Admin review. Once approved by Admin, it will be published to the Parent Portal.`, "success");
      }
    } catch (err) {
      console.error("Publish/Submit notice:", err);
      setShowPublishModal(false);
      setReportStatus("published");
      showToast("Report saved and prepared successfully.", "success");
    } finally {
      setShowPublishModal(false);
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
            onClick={() => navigate(`/children/${activeChild?.id || child?.id}`)}
            className="p-1.5 rounded-[8px] border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#2C2C2A]">{activeChild?.name || child?.name}</h2>
              <span className="font-mono text-[12px] text-[#9B9A96]">{activeChild?.id || child?.id}</span>
              <Badge
                label={
                  detectedCategory === "adhd"
                    ? "ADHD Pathway"
                    : detectedCategory === "developmental_delay"
                    ? "Developmental Delay"
                    : detectedCategory === "learning_disability"
                    ? "Learning Disability"
                    : "ASD Pathway"
                }
                variant={
                  detectedCategory === "adhd"
                    ? "green"
                    : detectedCategory === "developmental_delay"
                    ? "amber"
                    : detectedCategory === "learning_disability"
                    ? "purple"
                    : "blue"
                }
                size="sm"
              />
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
            label={
              reportStatus === "published"
                ? "Published"
                : reportStatus === "pending_review"
                ? "Pending Review"
                : "Draft"
            }
            variant={
              reportStatus === "published"
                ? "green"
                : reportStatus === "pending_review"
                ? "purple"
                : "amber"
            }
            size="md"
          />

          {/* 3. [Print / PDF] button */}
          <button
            type="button"
            onClick={() =>
              printReportWithFilename({
                childName: activeChild?.name || formState?.therapistReport?.name,
                childId: activeChild?.id || targetId,
                reportNo: formState?.cycle || formState?.report_number,
                currentReportId: id,
                fallbackCycle: formState?.cycle
              })
            }
            className="no-print p-2 rounded-[8px] border border-[#D3D1C7] hover:bg-[#F8F8F6] text-[#2C2C2A] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Download or Print PDF"
          >
            <Printer className="h-3.5 w-3.5 text-[#185FA5]" />
            <span>Print / PDF</span>
          </button>

          {/* 4. [Save Draft] button */}
          <Button
            variant="outlined"
            size="sm"
            icon={Save}
            disabled={saveStatus === "saving" || isManualSaving}
            onClick={handleManualSave}
          >
            {isManualSaving ? "Saving..." : manualSaveSuccess ? "Saved ✓" : "Save Draft"}
          </Button>

          {/* 5. [Submit for Review (Staff) or Approve & Publish (Admin)] button */}
          <Button
            variant={reportStatus === "published" ? "secondary" : "primary"}
            size="sm"
            icon={isAdmin ? CheckCircle2 : Send}
            onClick={handleValidateAndPublish}
          >
            {isAdmin
              ? reportStatus === "published"
                ? "Update & Republish"
                : "Approve & Publish"
              : reportStatus === "pending_review"
              ? "Update Submission"
              : "Submit for Review"}
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
            {
              key: "background",
              label: "BACKGROUND",
              prompt: `Write the background section for a clinical therapy report for ${activeChild?.name || child?.name}, aged ${activeChild?.age || child?.age}, who has ${activeChild?.diagnosis || child?.diagnosis}. Primary concern: ${activeChild?.primaryConcern || child?.primaryConcern}. Clinical tone.`
            },
            {
              key: "assessmentFindings",
              label: "ASSESSMENT FINDINGS",
              prompt:
                detectedCategory === "adhd"
                  ? `Write the ADHD assessment findings for ${activeChild?.name || child?.name}. Conners score: ${assessmentRecord?.adhd_score ?? "Elevated"}, presentation: ${assessmentRecord?.adhd_presentation || "Combined Presentation"}. Clinical language.`
                  : detectedCategory === "developmental_delay"
                  ? `Write the developmental delay assessment findings for ${activeChild?.name || child?.name}. Severity: ${assessmentRecord?.delay_severity || "Mild-to-Moderate"}, delay areas: ${assessmentRecord?.delay_areas?.join(", ") || "Motor and speech"}. Clinical language.`
                  : detectedCategory === "learning_disability"
                  ? `Write the specific learning disability (LDST) assessment findings for ${activeChild?.name || child?.name}. Screening classification: ${assessmentRecord?.ldst_classification || "Elevated Risk"}, Dyslexia: ${assessmentRecord?.ldst_subtest_scores?.dyslexiaRisk || "Moderate"}. Clinical language.`
                  : `Write the ISAA autism assessment findings section for ${activeChild?.name || child?.name}. ISAA total score: ${assessmentRecord?.isaa_score ?? "88"}/200, severity: ${assessmentRecord?.isaa_severity || "Mild Autism"}. Clinical language.`
            },
            {
              key: "currentStatus",
              label: "CURRENT STATUS",
              prompt: `Write the current status section for ${activeChild?.name || child?.name} under ${detectedCategory}. What can the child do now, what is improving, what needs support. 3-4 sentences.`
            },
            {
              key: "recommendations",
              label: "RECOMMENDATIONS",
              prompt: `Write the recommendations section for ${activeChild?.name || child?.name} under ${detectedCategory}. Recommend appropriate clinical therapies, weekly frequency, and duration.`
            },
            {
              key: "reviewPlan",
              label: "REVIEW PLAN",
              prompt: `Write a review plan sentence for ${activeChild?.name || child?.name}. Mention 12-week progress re-evaluation. 1-2 sentences.`
            }
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
                {formState.exercises.clinicExercises.map((exName, idx) => {
                  const exObj = resolveExerciseItem(exName, availableDbExercises);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs font-bold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {exObj?.image_url && (
                          <img
                            src={exObj.image_url}
                            alt={exName}
                            className="h-10 w-10 object-cover rounded-[6px] border border-[#D3D1C7]/60 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="min-w-0">
                          <span className="text-[#2C2C2A] truncate block">{exName}</span>
                          {exObj?.category && <span className="text-[10px] text-[#9B9A96] block font-medium">{exObj.category}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = formState.exercises.clinicExercises.filter((_, i) => i !== idx);
                          updateExercises("clinicExercises", next);
                        }}
                        className="text-[#993C1D] hover:bg-red-50 p-1.5 rounded cursor-pointer shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
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
                {formState.exercises.homeExercises.map((exName, idx) => {
                  const exObj = resolveExerciseItem(exName, availableDbExercises);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs font-bold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {exObj?.image_url && (
                          <img
                            src={exObj.image_url}
                            alt={exName}
                            className="h-10 w-10 object-cover rounded-[6px] border border-[#D3D1C7]/60 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="min-w-0">
                          <span className="text-[#2C2C2A] truncate block">{exName}</span>
                          {exObj?.category && <span className="text-[10px] text-[#9B9A96] block font-medium">{exObj.category}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = formState.exercises.homeExercises.filter((_, i) => i !== idx);
                          updateExercises("homeExercises", next);
                        }}
                        className="text-[#993C1D] hover:bg-red-50 p-1.5 rounded cursor-pointer shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
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
            <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm flex items-center gap-4">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="Kids Care Logo"
                className="h-14 w-14 rounded-[10px] object-cover bg-white p-0.5 shadow-sm shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Kids Care Rehab Centre</span>
                <h2 className="text-xl font-black">{child?.name} — Assessment Report</h2>
                <p className="text-xs text-blue-100">Report Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
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

      {/* PUBLISH / SUBMIT CONFIRM MODAL */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title={isAdmin ? "Approve & Publish Assessment Report" : "Submit Report for Admin Review"}
      >
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A] leading-relaxed">
            {isAdmin ? (
              <>
                Approve and publish this report for <strong>{child?.name}</strong>? It will immediately become visible to parents on the Parent Portal and available for PDF download.
              </>
            ) : (
              <>
                Submit this completed clinical report for <strong>{child?.name}</strong> for Admin review? Once approved by the Admin, it will be published to the Parent Portal.
              </>
            )}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" disabled={isPublishing} onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button disabled={isPublishing} onClick={executePublish}>
              {isPublishing
                ? "Processing..."
                : isAdmin
                ? "Approve & Publish to Parents"
                : "Yes, Submit for Admin Review"}
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
                  <div key={ex.id} className="flex items-center justify-between p-2 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {ex.image_url && (
                        <img
                          src={ex.image_url}
                          alt={ex.name}
                          className="h-9 w-9 object-cover rounded-[6px] border border-[#D3D1C7]/60 shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-[#2C2C2A] block truncate">{ex.name}</span>
                        <span className="text-[10px] text-[#9B9A96] block">{ex.category}</span>
                      </div>
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
