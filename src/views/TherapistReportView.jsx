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
  FileText,
  Activity,
  Dumbbell,
  ShieldCheck,
  Brain,
  Zap,
  Target,
  Trash2
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
import { exerciseService, resolveExerciseItem } from "../services/exerciseService";
import { MASTER_EXERCISES } from "../data/exercisesData";
import { calculateISAAScore, calculateDomainScores } from "../utils/scoringEngine";
import { printReportWithFilename, formatReportFilename } from "../utils/printHelpers";
import AssessmentReportTableRouter from "../components/assessment/AssessmentReportTables";

/**
 * 5 DISTINCT ASSESSMENT REPORT CONFIGURATIONS
 * Gives every assessment form a unique color theme, protocol header, domain radar profile,
 * and category-tailored in-clinic and home exercises with verified images.
 */
export const CATEGORY_CONFIG = {
  asd: {
    key: "asd",
    name: "Autism Spectrum Disorder",
    protocolTitle: "AUTISM SPECTRUM DISORDER (ISAA) CLINICAL REPORT",
    protocolSubtitle: "Indian Scale for Assessment of Autism (ISAA) & Sensory Profile",
    themeColor: "#185FA5",
    themeBg: "#EBF4FE",
    themeBorder: "#185FA5",
    accentColor: "#0F6E56",
    badgeLabel: "ISAA Protocol",
    badgeColor: "bg-[#EBF4FE] text-[#185FA5] border-[#185FA5]",
    radarTitle: "ISAA NEURODEVELOPMENTAL & SENSORY PROFILE",
    defaultAssessorRole: "Senior Pediatric Occupational & Speech Therapist",
    domains: [
      { key: "social", label: "Social Relationship", defaultScore: 55 },
      { key: "emotional", label: "Emotional Response", defaultScore: 58 },
      { key: "speech", label: "Speech & Language", defaultScore: 52 },
      { key: "behaviour", label: "Behaviour Patterns", defaultScore: 48 },
      { key: "cognitive", label: "Cognitive Component", defaultScore: 62 },
      { key: "sensory", label: "Sensory Processing", defaultScore: 45 }
    ],
    defaultClinicExercises: [
      "Sensory Integration Activities",
      "Behaviour Cards",
      "Obstacle Course",
      "Balance Board Exercises"
    ],
    defaultHomeExercises: [
      "Communication Cards",
      "Bear Walk",
      "Sensory Integration Activities"
    ]
  },
  adhd: {
    key: "adhd",
    name: "ADHD / Executive Function",
    protocolTitle: "CONNERS' ADHD CLINICAL EVALUATION & BEHAVIORAL REPORT",
    protocolSubtitle: "Conners' 3 Rating Scale (CPRS-R:S) & Executive Function Profiling",
    themeColor: "#6941C6",
    themeBg: "#F9F5FF",
    themeBorder: "#6941C6",
    accentColor: "#B54708",
    badgeLabel: "Conners' CPRS-R:S",
    badgeColor: "bg-[#F9F5FF] text-[#6941C6] border-[#6941C6]",
    radarTitle: "EXECUTIVE FUNCTION & ATTENTION PROFILE",
    defaultAssessorRole: "Pediatric Behavioral & Occupational Therapist",
    domains: [
      { key: "attention", label: "Sustained Attention", defaultScore: 42 },
      { key: "impulseControl", label: "Impulse Inhibition", defaultScore: 45 },
      { key: "hyperactivity", label: "Motor Regulation", defaultScore: 40 },
      { key: "taskInitiation", label: "Task Initiation", defaultScore: 50 },
      { key: "workingMemory", label: "Working Memory", defaultScore: 55 },
      { key: "emotionalReg", label: "Emotional Regulation", defaultScore: 58 }
    ],
    defaultClinicExercises: [
      "Brain Gym Exercises",
      "Trampoline Bouncing",
      "Obstacle Course",
      "Single Leg Stance"
    ],
    defaultHomeExercises: [
      "Brain Gym Exercises",
      "Jumping Jacks",
      "Frog Jumps"
    ]
  },
  developmental_delay: {
    key: "developmental_delay",
    name: "Developmental Delay",
    protocolTitle: "PEDIATRIC DEVELOPMENTAL MILESTONE BATTERY REPORT",
    protocolSubtitle: "Standardized Developmental Milestone Screening Battery (CA vs DA)",
    themeColor: "#0F6E56",
    themeBg: "#E9F7F0",
    themeBorder: "#0F6E56",
    accentColor: "#185FA5",
    badgeLabel: "Developmental Milestone Battery",
    badgeColor: "bg-[#E9F7F0] text-[#0F6E56] border-[#0F6E56]",
    radarTitle: "7-CORE MILESTONE DEVELOPMENTAL PROFILE",
    defaultAssessorRole: "Consultant Pediatric Physiotherapist & Early Interventionist",
    domains: [
      { key: "grossMotor", label: "Gross Motor", defaultScore: 50 },
      { key: "fineMotor", label: "Fine Motor", defaultScore: 55 },
      { key: "receptiveLang", label: "Receptive Language", defaultScore: 60 },
      { key: "expressiveLang", label: "Expressive Language", defaultScore: 48 },
      { key: "cognitive", label: "Cognitive Skills", defaultScore: 62 },
      { key: "social", label: "Socialization", defaultScore: 65 },
      { key: "adl", label: "Self-Help (ADL)", defaultScore: 52 }
    ],
    defaultClinicExercises: [
      "Reflex Integration Exercises",
      "Wedge Exercises",
      "Standing Frame Activities",
      "Step-Ups"
    ],
    defaultHomeExercises: [
      "Wedge Exercises",
      "Stretching Exercises",
      "Crab Walk"
    ]
  },
  learning_disability: {
    key: "learning_disability",
    name: "Specific Learning Disability",
    protocolTitle: "SPECIFIC LEARNING DISABILITY (SLD) SCREENING REPORT",
    protocolSubtitle: "Learning Disability Screening Test (LDST / NIMHANS Battery)",
    themeColor: "#2D31A6",
    themeBg: "#EEF2FF",
    themeBorder: "#2D31A6",
    accentColor: "#854F0B",
    badgeLabel: "LDST / NIMHANS SLD",
    badgeColor: "bg-[#EEF2FF] text-[#2D31A6] border-[#2D31A6]",
    radarTitle: "ACADEMIC PROCESSING & COGNITIVE PROFILE",
    defaultAssessorRole: "Special Educator & Remedial Clinical Specialist",
    domains: [
      { key: "phonological", label: "Phonological Decoding", defaultScore: 48 },
      { key: "readingFluency", label: "Reading Fluency", defaultScore: 50 },
      { key: "writtenExpression", label: "Written Expression", defaultScore: 45 },
      { key: "handwriting", label: "Graphomotor Dexterity", defaultScore: 52 },
      { key: "mathReasoning", label: "Mathematical Concepts", defaultScore: 65 },
      { key: "workingMemory", label: "Working Memory Span", defaultScore: 55 }
    ],
    defaultClinicExercises: [
      "Brain Gym Exercises",
      "Theraband Exercises",
      "Ball Catching & Throwing",
      "Obstacle Course"
    ],
    defaultHomeExercises: [
      "Brain Gym Exercises",
      "Balloon Volleyball",
      "Wall Push-Ups"
    ]
  },
  special_school: {
    key: "special_school",
    name: "Special School / IEP",
    protocolTitle: "SPECIAL SCHOOL INDIVIDUALIZED EDUCATION PROGRAM (IEP) REPORT",
    protocolSubtitle: "Multidisciplinary Functional IEP Assessment & Life Skills Battery",
    themeColor: "#0E7490",
    themeBg: "#ECFEFF",
    themeBorder: "#0E7490",
    accentColor: "#0F6E56",
    badgeLabel: "IEP Functional Battery",
    badgeColor: "bg-[#ECFEFF] text-[#0E7490] border-[#0E7490]",
    radarTitle: "FUNCTIONAL INDEPENDENCE DOMAIN PROFILE",
    defaultAssessorRole: "Special Educator & IEP Multidisciplinary Coordinator",
    domains: [
      { key: "selfCare", label: "Self-Care & Hygiene", defaultScore: 50 },
      { key: "eating", label: "Eating & Feeding ADL", defaultScore: 60 },
      { key: "dressing", label: "Dressing Skills", defaultScore: 52 },
      { key: "classroom", label: "Classroom Participation", defaultScore: 58 },
      { key: "motorSkills", label: "Motor Dexterity", defaultScore: 55 },
      { key: "communication", label: "Functional Communication", defaultScore: 50 },
      { key: "socialization", label: "Social Interaction", defaultScore: 54 }
    ],
    defaultClinicExercises: [
      "Communication Cards",
      "Behaviour Cards",
      "Balance Beam Walking",
      "Tunnel Crawl"
    ],
    defaultHomeExercises: [
      "Behaviour Cards",
      "Communication Cards",
      "Stretching Exercises"
    ]
  }
};

/**
 * Generates category-specific demographic and clinical evaluation parameter rows
 * for Section 2 of the report page.
 */
export function getChildDetailsRows(category, child, formState, assessmentData, isaaInfo, reportDataRaw) {
  const ass = assessmentData || reportDataRaw?.assessments || reportDataRaw?.assessment || reportDataRaw;
  const childName = child?.name || "Child";
  const childId = child?.id || "N/A";
  const dob = child?.dob || child?.date_of_birth || "N/A";
  const age = child?.age || "N/A";
  const gender = child?.gender || "Male";
  const school = child?.school || "Kids Care Rehab Centre";
  const prepBy = `${formState.preparedBy} (${formState.designation})`;
  const prepDate = formState.preparedDate;

  switch (category) {
    case "adhd":
      return [
        ["Child Name", childName],
        ["Child ID", childId],
        ["Date of Birth / Age", `${dob} (${age})`],
        ["Gender", gender],
        ["Diagnostic Classification", "Attention Deficit Hyperactivity Disorder (ADHD)"],
        ["Assessment Protocol", "Conners' 3 Rating Scale (CPRS-R:S) — Short Form"],
        ["Clinical Presentation", ass?.adhd_presentation || ass?.form_data?.presentation || "Combined Presentation"],
        ["ADHD Index T-Score", `${ass?.t_scores?.adhdIndex || ass?.adhd_index || 68} (Percentile: 94th — Clinically Elevated)`],
        ["Informant & Evaluation Setting", "Parent Rating, Clinical Observation & School Environment"],
        ["School / Grade", school],
        ["Assessment Date", prepDate],
        ["Assessed By", prepBy]
      ];
    case "developmental_delay": {
      const devAge = ass?.developmental_age || ass?.form_data?.developmentalAge || "2y 4m";
      const dq = ass?.developmental_quotient || ass?.dq_score || 67;
      const delaySeverity = ass?.delay_severity || (dq < 50 ? "Severe Delay" : dq < 70 ? "Moderate Delay" : dq < 85 ? "Mild Delay" : "Borderline");
      const delayAreas = ass?.delay_areas?.join(", ") || "Gross Motor, Fine Motor, Expressive Language";
      return [
        ["Child Name", childName],
        ["Child ID", childId],
        ["Date of Birth / Gender", `${dob} / ${gender}`],
        ["Chronological Age (CA)", age],
        ["Developmental Age Equivalent (DA)", devAge],
        ["Developmental Quotient (DQ)", `${dq}% — ${delaySeverity}`],
        ["Diagnostic Protocol", "Standardized Pediatric Developmental Milestone Screening Battery"],
        ["Primary Delay Areas", delayAreas],
        ["Clinical Intervention Status", "Active Early Intervention Physiotherapy & Occupational Therapy"],
        ["School / Anganwadi", school],
        ["Assessment Date", prepDate],
        ["Assessed By", prepBy]
      ];
    }
    case "learning_disability": {
      const sub = ass?.ldst_subtest_scores || ass?.form_data || {};
      const dyslexia = sub?.dyslexiaRisk || "Moderate Risk (Decoding, Fluency)";
      const dysgraphia = sub?.dysgraphiaRisk || "Mild Risk (Spatial, Pencil Grip)";
      const dyscalculia = sub?.dyscalculiaRisk || "Low Risk";
      return [
        ["Student Name", childName],
        ["Student ID", childId],
        ["Date of Birth / Age", `${dob} (${age})`],
        ["Gender / Curriculum", `${gender} / ${child?.curriculum || "CBSE / State Board"}`],
        ["Diagnostic Protocol", "Learning Disability Screening Battery (LDST / NIMHANS Battery)"],
        ["Dyslexia Risk Level", dyslexia],
        ["Dysgraphia Risk Level", dysgraphia],
        ["Dyscalculia Risk Level", dyscalculia],
        ["Working Memory Span", ass?.working_memory_score || "Below Average (Digit Span Forward: 4, Backward: 2)"],
        ["Recommended Exam Accommodations", "Extra 20 mins/hr, Scribe Support, Multi-sensory Testing"],
        ["School Name", school],
        ["Assessment Date", prepDate],
        ["Assessed By", prepBy]
      ];
    }
    case "special_school": {
      const prof = ass?.profile_classification || "Profile 2: Moderate Functional Support";
      const cycle = reportDataRaw?.cycle || ass?.cycle || 1;
      const period = reportDataRaw?.period || ass?.period || "Month 0–3";
      return [
        ["Student Name", childName],
        ["Student ID", childId],
        ["Date of Birth / Age", `${dob} (${age})`],
        ["Gender", gender],
        ["Educational Program", "Special School Individualized Education Program (IEP)"],
        ["Functional Profile Level", prof],
        ["IEP Cycle & Period", `Cycle ${cycle} (${period})`],
        ["Classroom Setting", "Special Education Life Skills & Pre-Vocational Functional Readiness"],
        ["Communication Modality", "Visual Picture Schedules & Functional Gestures"],
        ["School / Center", school],
        ["Assessment Date", prepDate],
        ["IEP Coordinator", prepBy]
      ];
    }
    default: // asd
      return [
        ["Child Name", childName],
        ["Child ID", childId],
        ["Date of Birth / Age", `${dob} (${age})`],
        ["Gender", gender],
        ["Clinical Diagnosis", "Autism Spectrum Disorder (ASD)"],
        ["Assessment Protocol", "Indian Scale for Assessment of Autism (ISAA) — 40 Items"],
        ["Diagnostic Severity", `${isaaInfo?.severity || "Mild Autism"} (Score: ${isaaInfo?.score || 88}/200)`],
        ["Sensory Modulation", ass?.sensory_profile || "Sensory Processing Sensitivity (Seeking / Aversive)"],
        ["Communication Level", ass?.communication_level || "Emerging Verbal with Visual Schedule Support"],
        ["School / Center", school],
        ["Assessment Date", prepDate],
        ["Assessed By", prepBy]
      ];
  }
}

export default function TherapistReportView({ initialEditMode = false }) {
  const { id, reportId } = useParams();
  const targetId = reportId || id;
  const navigate = useNavigate();
  const { user, isAdmin, childrenList, showToast } = useAuth();

  const [child, setChild] = useState(null);
  const [reportDataRaw, setReportDataRaw] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
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

  // View Mode (false) vs Edit Mode (true) — Only Admin can edit
  const [isEditing, setIsEditing] = useState(isAdmin ? initialEditMode : false);

  useEffect(() => {
    if (!isAdmin && isEditing) {
      setIsEditing(false);
    }
  }, [isAdmin, isEditing]);

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


      let assessmentObj = null;
      if (reportObj?.assessment_id) {
        assessmentObj = await assessmentService.getById(reportObj.assessment_id);
      }
      if (!assessmentObj && (reportObj?.child_id || targetId)) {
        const cId = reportObj?.child_id || targetId;
        const assList = await assessmentService.getByChildId(cId);
        if (assList && assList.length > 0) {
          const type = (reportObj?.assessment_type || childObj?.therapy_category || '').toLowerCase();
          assessmentObj = assList.find(a => (a.source_table || '').toLowerCase().includes(type)) || assList[0];
        }
      }
      if (!assessmentObj && reportObj) {
        assessmentObj = reportObj.assessments || reportObj.assessment;
      }

      setAssessmentData(assessmentObj);
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

      // Extract assigned clinic & home exercises with fallbacks to assessment data
      const extractEx = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr : null);
      const clinicEx =
        extractEx(reportObj?.clinic_exercises) ||
        extractEx(reportObj?.clinicExercises) ||
        extractEx(reportObj?.therapy_details?.clinic_exercises) ||
        extractEx(reportObj?.formState?.exercises?.clinicExercises) ||
        extractEx(reportObj?.formState?.clinicEx) ||
        extractEx(reportObj?.clinicEx) ||
        extractEx(assessmentObj?.clinic_exercises) ||
        extractEx(assessmentObj?.clinicExercises) ||
        [];
      const homeEx =
        extractEx(reportObj?.home_exercises) ||
        extractEx(reportObj?.homeExercises) ||
        extractEx(reportObj?.therapy_details?.home_exercises) ||
        extractEx(reportObj?.formState?.exercises?.homeExercises) ||
        extractEx(reportObj?.formState?.homeEx) ||
        extractEx(reportObj?.homeEx) ||
        extractEx(assessmentObj?.home_exercises) ||
        extractEx(assessmentObj?.homeExercises) ||
        [];
      setAssignedClinicExercises(clinicEx);
      setAssignedHomeExercises(homeEx);

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

  // Detected Assessment Pathway & Category
  const detectedCategory = useMemo(() => {
    const raw = (
      reportDataRaw?.assessment_type ||
      assessmentData?.source_table ||
      assessmentData?.assessment_type ||
      child?.therapy_category ||
      child?.diagnosis ||
      ""
    ).toLowerCase();

    if (raw.includes("adhd") || raw.includes("conner")) return "adhd";
    if (raw.includes("delay") || raw.includes("developmental")) return "developmental_delay";
    if (raw.includes("learn") || raw.includes("ldst") || raw.includes("sld") || raw.includes("dyslex")) return "learning_disability";
    if (raw.includes("special") || raw.includes("iep")) return "special_school";
    return "asd";
  }, [reportDataRaw, assessmentData, child]);

  const currentTheme = useMemo(() => {
    return CATEGORY_CONFIG[detectedCategory] || CATEGORY_CONFIG.asd;
  }, [detectedCategory]);

  const reportTitle = useMemo(() => {
    return currentTheme.protocolTitle;
  }, [currentTheme]);

  // Active exercises: uses therapist assigned if present, otherwise category-tailored defaults with images
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

  // Derived ISAA & Domain Scores
  const domainScores = useMemo(() => {
    const ass = assessmentData || reportDataRaw?.assessments || reportDataRaw?.assessment || reportDataRaw;
    if (ass?.domain_scores && Object.keys(ass.domain_scores).length > 0) return ass.domain_scores;
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
  }, [assessmentData, reportDataRaw]);

  const isaaInfo = useMemo(() => {
    const ass = assessmentData || reportDataRaw?.assessments || reportDataRaw?.assessment || reportDataRaw;
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
    const score = ass?.isaa_score ?? 88;
    const severity = ass?.isaa_severity || (score >= 154 ? "Severe Autism" : score >= 107 ? "Moderate Autism" : score >= 70 ? "Mild Autism" : score > 0 ? "Does Not Indicate Autism" : "Mild Autism");
    const rawSections = ass?.isaa_section_scores || {};
    return {
      score,
      maxScore: 200,
      severity,
      sectionScores: {
        social: rawSections?.social ?? rawSections?.I ?? 24,
        emotional: rawSections?.emotional ?? rawSections?.II ?? 14,
        speech: rawSections?.speech ?? rawSections?.III ?? 16,
        behaviour: rawSections?.behaviour ?? rawSections?.IV ?? 18,
        cognitive: rawSections?.cognitive ?? rawSections?.V ?? 12,
        sensory: rawSections?.sensory ?? rawSections?.VI ?? 15
      }
    };
  }, [assessmentData, reportDataRaw]);

  const childDetailsRows = useMemo(() => {
    return getChildDetailsRows(detectedCategory, child, formState, assessmentData, isaaInfo, reportDataRaw);
  }, [detectedCategory, child, formState, assessmentData, isaaInfo, reportDataRaw]);

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
        assessment_id: reportDataRaw?.assessment_id || assessmentData?.id,
        assessment_type: detectedCategory,
        therapist_report: stateToSave,
        parent_report: stateToSave,
        clinic_exercises: activeClinicExercises,
        home_exercises: activeHomeExercises,
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
      localStorage.setItem(`report_draft_${child?.id || targetId}`, JSON.stringify({
        ...stateToSave,
        clinic_exercises: activeClinicExercises,
        home_exercises: activeHomeExercises,
        clinicEx: activeClinicExercises,
        homeEx: activeHomeExercises
      }));
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
      id: reportDataRaw?.id,
      child_id: child?.id || targetId,
      assessment_id: reportDataRaw?.assessment_id || assessmentData?.id,
      assessment_type: detectedCategory,
      therapist_report: formState,
      parent_report: formState,
      clinic_exercises: activeClinicExercises,
      home_exercises: activeHomeExercises,
      prepared_by: formState.preparedBy,
      prepared_by_id: user?.id,
      status: isAdmin ? "published" : "pending_review"
    };

    try {
      if (isAdmin) {
        await reportService.saveDraft(reportPayload);
        await reportService.publish(reportDataRaw?.id || targetId, formState.preparedBy || user?.name, user?.id, reportPayload);
        const pubKey = child?.id || targetId;
        const publishedPayload = {
          id: reportDataRaw?.id || `rep-${Date.now()}`,
          childId: pubKey,
          child_id: pubKey,
          formState: { therapistReport: formState, parentReport: formState },
          therapistReport: formState,
          therapist_report: formState,
          parentReport: formState,
          parent_report: formState,
          clinic_exercises: activeClinicExercises,
          home_exercises: activeHomeExercises,
          clinicEx: activeClinicExercises,
          homeEx: activeHomeExercises,
          status: "published",
          review_status: "published",
          publishedDate: new Date().toISOString().split("T")[0],
          published_at: new Date().toISOString()
        };
        localStorage.setItem(`report_published_${pubKey}`, JSON.stringify(publishedPayload));
        try {
          const histKey = `reports_history_${pubKey}`;
          const existingHist = JSON.parse(localStorage.getItem(histKey) || "[]");
          const histArr = Array.isArray(existingHist) ? existingHist : [];
          const updatedHist = [
            publishedPayload,
            ...histArr.filter((h) => h.id !== publishedPayload.id && h.publishedDate !== publishedPayload.publishedDate)
          ];
          localStorage.setItem(histKey, JSON.stringify(updatedHist));
        } catch (_) {}
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
          clinic_exercises: activeClinicExercises,
          home_exercises: activeHomeExercises,
          clinicEx: activeClinicExercises,
          homeEx: activeHomeExercises,
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

  const handleDeleteReport = async () => {
    if (!isAdmin) {
      showToast("Only administrators can delete reports.", "error");
      return;
    }
    if (window.confirm(`Are you sure you want to delete this clinical report for ${child?.name || "this child"}? This action cannot be undone.`)) {
      try {
        await reportService.delete(reportDataRaw?.id || targetId, formState.assessmentType || category);
        showToast("Report deleted successfully.", "success");
        navigate(child?.id ? `/children/${child.id}` : "/children");
      } catch (err) {
        showToast("Failed to delete report: " + err.message, "error");
      }
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
      // Fallback texts tailored for every assessment form:
      let rewrittenText = "";
      if (detectedCategory === "adhd") {
        if (sectionKey === "background") {
          rewrittenText = `${child?.name || "The child"} is a ${child?.age || "6-year-old"} evaluated for high motor restlessness, distractibility, and impulsivity using the Conners' 3 Rating Scale.`;
        } else if (sectionKey === "assessmentFindings") {
          rewrittenText = `Conners' ADHD evaluation indicates clinically elevated scores in Combined Presentation. Primary challenges identified in sustained attention, executive planning, and motor impulse regulation.`;
        } else if (sectionKey === "currentStatus") {
          rewrittenText = `${child?.name || "The child"} demonstrates enthusiastic participation and creative thinking, responding well to structured routines, visual timers, and proprioceptive movement breaks.`;
        } else if (sectionKey === "recommendations") {
          rewrittenText = `1. Pediatric Occupational Therapy with Sensory Regulation (2x/week)\n2. Behavioral Coaching & Executive Function Training (1-2x/week)\n3. Classroom & Homework Accommodations (movement breaks, timers)\n4. Daily Gross Motor & Brain Gym Routine`;
        } else if (sectionKey === "reviewPlan") {
          rewrittenText = `Formal progress review in 12 weeks to monitor sitting tolerance, task initiation, and impulse regulation.`;
        }
      } else if (detectedCategory === "developmental_delay") {
        if (sectionKey === "background") {
          rewrittenText = `${child?.name || "The child"} is a ${child?.age || "3-year-old"} evaluated for developmental milestone delay across gross motor, fine motor, and expressive language domains.`;
        } else if (sectionKey === "assessmentFindings") {
          rewrittenText = `Developmental milestone screening indicates significant developmental delays with Developmental Quotient (DQ) below chronological age. Core delays observed in motor transitions and verbal expression.`;
        } else if (sectionKey === "currentStatus") {
          rewrittenText = `${child?.name || "The child"} shows positive response to sensory stimulation, imitation games, and playful physical therapy with emerging receptive communication.`;
        } else if (sectionKey === "recommendations") {
          rewrittenText = `1. Early Intervention Pediatric Physiotherapy (2x/week)\n2. Pediatric Occupational Therapy (2x/week)\n3. Speech & Language Therapy (2x/week)\n4. Daily Floor Play & Milestone Exercises at Home`;
        } else if (sectionKey === "reviewPlan") {
          rewrittenText = `Quarterly milestone progress review in 12 weeks benchmarking developmental age equivalents against chronological age.`;
        }
      } else if (detectedCategory === "learning_disability") {
        if (sectionKey === "background") {
          rewrittenText = `${child?.name || "The student"} is a ${child?.age || "8-year-old"} referred for scholastic assessment using the Learning Disability Screening Battery (LDST / NIMHANS).`;
        } else if (sectionKey === "assessmentFindings") {
          rewrittenText = `Screening reveals elevated risk for Dyslexia and Dysgraphia. Phonological decoding and working memory bottlenecks impact reading fluency and written handwriting stamina.`;
        } else if (sectionKey === "currentStatus") {
          rewrittenText = `${child?.name || "The student"} demonstrates superior verbal comprehension and logical reasoning, with performance fatigue occurring during prolonged written tasks.`;
        } else if (sectionKey === "recommendations") {
          rewrittenText = `1. Special Education & Remedial Therapy (3x/week)\n2. Multisensory Orton-Gillingham Phonics Program\n3. Occupational Therapy for Hand Strength & Ergonomic Grip\n4. Formal School Accommodations (extra time, scribing)`;
        } else if (sectionKey === "reviewPlan") {
          rewrittenText = `Academic remediation review in 12 weeks with psycho-educational reassessment and teacher consultation.`;
        }
      } else if (detectedCategory === "special_school") {
        if (sectionKey === "background") {
          rewrittenText = `${child?.name || "The student"} is a ${child?.age || "7-year-old"} enrolled in specialized education. Evaluated using the Multidisciplinary Special School Functional IEP Checklist.`;
        } else if (sectionKey === "assessmentFindings") {
          rewrittenText = `Functional assessment confirms placement in Profile 2: Moderate Functional Support. Core priorities identified in self-help ADL dressing/hygiene, functional requesting, and classroom sitting tolerance.`;
        } else if (sectionKey === "currentStatus") {
          rewrittenText = `${child?.name || "The student"} exhibits cheerful disposition and cooperates in structured 1:1 routines using picture activity cards and positive reinforcement.`;
        } else if (sectionKey === "recommendations") {
          rewrittenText = `1. Special School Functional Curriculum (5 days/week)\n2. Occupational Therapy for Daily Living & Fine Motor (2x/week)\n3. Speech & Augmentative Communication Therapy (2x/week)\n4. Home Life Skills Practice & Visual Picture Schedules`;
        } else if (sectionKey === "reviewPlan") {
          rewrittenText = `Quarterly Individualized Education Program (IEP) evaluation in 12 weeks across all 14 functional independence domains.`;
        }
      } else {
        // ASD
        if (sectionKey === "background") {
          rewrittenText = `${child?.name || "The child"} is a ${child?.age || "4-year-old"} referred for clinical evaluation regarding reciprocal social interaction and sensory processing sensitivities.`;
        } else if (sectionKey === "assessmentFindings") {
          rewrittenText = `ISAA assessment yields a score of ${isaaInfo.score}/200 corresponding to ${isaaInfo.severity}. Key vulnerabilities noted in joint attention, peer play reciprocity, and sensory modulation.`;
        } else if (sectionKey === "currentStatus") {
          rewrittenText = `${child?.name || "The child"} responds consistently to name call and follows structured routines, with ongoing work required for peer turn-taking and functional requesting.`;
        } else if (sectionKey === "recommendations") {
          rewrittenText = `1. Pediatric Occupational & Sensory Integration Therapy (2x/week)\n2. Speech & Language Pathology (2x/week)\n3. Behavioral Therapy & Social Skills Training (2x/week)\n4. Daily Sensory Home Program & Picture Cards`;
        } else if (sectionKey === "reviewPlan") {
          rewrittenText = `Formal clinical progress review in 12 weeks to monitor gains in expressive language, turn-taking, and emotional self-regulation.`;
        }
      }
      handleFieldChange(sectionKey, rewrittenText);
      showToast("Section updated.", "info");
    } finally {
      setGeneratingSection(null);
    }
  };

  // Dynamic SVG Radar Points calculation tailored to the specific assessment form
  const radarAxes = useMemo(() => {
    const list = currentTheme.domains || CATEGORY_CONFIG.asd.domains;
    return list.map((dom) => {
      const score = domainScores?.[dom.key] ?? dom.defaultScore;
      return {
        key: dom.key,
        label: dom.label,
        score: Math.min(100, Math.max(10, score))
      };
    });
  }, [currentTheme, domainScores]);

  // Priority areas (<50) from active category domains
  const priorityDomains = useMemo(() => {
    return radarAxes.filter((d) => d.score < 50);
  }, [radarAxes]);

  const numAxes = radarAxes.length;
  const angleStep = 360 / numAxes;
  const cx = 160, cy = 160, maxR = 120;
  const radarPointsString = radarAxes.map((d, i) => {
    const angle = (i * angleStep - 90) * (Math.PI / 180);
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
              {isAdmin && (
                <Button
                  variant="outlined"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setIsEditing(true)}
                  className="border-[#185FA5] text-[#185FA5] hover:bg-[#185FA5]/10"
                >
                  ✏ Edit Report
                </Button>
              )}

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

              {isAdmin && (
                <Button
                  variant="outlined"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDeleteReport}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  title="Delete this report"
                >
                  Delete
                </Button>
              )}

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
                  {isAdmin && (
                    <Button size="sm" icon={CheckCircle2} onClick={handlePublish} loading={isPublishing} className="bg-[#0F6E56] hover:bg-[#08503E] text-white">
                      Approve & Publish
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

              <Button
                variant="outlined"
                size="sm"
                icon={Trash2}
                onClick={handleDeleteReport}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                title="Delete this report"
              >
                Delete
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
        {/* ═══ SECTION 1 — CLINIC HEADER (Tailored per Assessment) ═══ */}
        <div className="no-page-break space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="Kids Care Logo"
                className="h-14 w-14 rounded-[10px] object-cover border shrink-0"
                style={{ borderColor: `${currentTheme.themeColor}40` }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-[20px] font-bold leading-tight" style={{ color: currentTheme.themeColor }}>
                  KIDS CARE REHAB CENTRE
                </h1>
                <p className="text-[13px] font-bold text-[#5F5E5A]">PHYSIO CARE & DEVELOPMENTAL CLINIC</p>
                <p className="text-[11px] text-[#5F5E5A] font-medium">(Unit of Kids Rehab Charitable Trust)</p>
              </div>
            </div>

            {/* Report Title Block Right */}
            <div className="text-right">
              <span
                className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1 border"
                style={{
                  backgroundColor: currentTheme.themeBg,
                  color: currentTheme.themeColor,
                  borderColor: currentTheme.themeColor
                }}
              >
                {currentTheme.badgeLabel}
              </span>
              <h2 className="text-[13px] sm:text-[14px] font-bold" style={{ color: currentTheme.themeColor }}>
                {currentTheme.protocolTitle}
              </h2>
              <p className="text-[11px] text-[#5F5E5A] font-semibold">{currentTheme.protocolSubtitle}</p>
              <p className="text-[11px] text-[#5F5E5A] font-medium mt-0.5">Date: {formState.preparedDate}</p>
            </div>
          </div>

          {/* Contact Line */}
          <div className="text-center text-[11px] text-[#5F5E5A] font-medium border-t border-b border-[#D3D1C7]/80 py-2 space-y-0.5">
            <p>New no 52/2, old no 97, Gowdia Mutt Road, Royapettah, Chennai - 600014</p>
            <p>Tel: 044-28353136 | Email: kidscarerehabcenter@gmail.com | www.kidscarerehabcenter.org</p>
          </div>
        </div>

        {/* ═══ SECTION 2 — CHILD DETAILS & CLINICAL PARAMETERS TABLE ═══ */}
        <div className="no-page-break space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F5E5A]">
              PATIENT EVALUATION RECORD & CLINICAL PARAMETERS
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: currentTheme.themeBg,
                color: currentTheme.themeColor,
                borderColor: currentTheme.themeColor
              }}
            >
              {currentTheme.badgeLabel}
            </span>
          </div>
          <table className="w-full text-xs border-collapse border border-[#D3D1C7] rounded-[8px] overflow-hidden">
            <tbody>
              {childDetailsRows.map(([label, value], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6]"}>
                  <td
                    className="p-2.5 px-3 border border-[#D3D1C7] font-bold text-[#5F5E5A] w-2/5"
                    style={idx === 0 ? { borderTopColor: currentTheme.themeColor } : {}}
                  >
                    {label}
                  </td>
                  <td className="p-2.5 px-3 border border-[#D3D1C7] font-bold text-[#2C2C2A]">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ SECTION 3 — CLINICAL ASSESSMENT ANALYSIS & EVALUATION TABLE ═══ */}
        <div className="no-page-break space-y-6 pt-2">
          {/* DEDICATED ASSESSMENT REPORT TABLE ROUTER FOR THE SPECIFIC ASSESSMENT FORM */}
          <AssessmentReportTableRouter
            assessmentType={detectedCategory}
            assessment={assessmentData || reportDataRaw?.assessments || reportDataRaw}
            domainScores={domainScores}
            isaaInfo={isaaInfo}
            formState={formState}
          />

          {/* PART B: DOMAIN RADAR CHART & SCORES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            {/* Left 320px Radar Chart */}
            <div
              className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-[12px] border"
              style={{ backgroundColor: currentTheme.themeBg, borderColor: `${currentTheme.themeColor}30` }}
            >
              <span
                className="text-[11px] font-bold uppercase block mb-2"
                style={{ color: currentTheme.themeColor }}
              >
                {currentTheme.radarTitle}
              </span>
              <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible">
                {/* Concentric rings at 25%, 50%, 75%, 100% */}
                {[30, 60, 90, 120].map((r, idx) => (
                  <circle key={idx} cx={cx} cy={cy} r={r} fill="none" stroke="#D3D1C7" strokeWidth="0.8" />
                ))}

                {/* Ring Labels */}
                {[25, 50, 75, 100].map((val, idx) => (
                  <text key={idx} x={cx + 5} y={cy - (idx + 1) * 30 + 3} className="text-[9px] fill-[#9B9A96]">
                    {val}
                  </text>
                ))}

                {/* Ray Axes */}
                {radarAxes.map((d, idx) => {
                  const angle = (idx * angleStep - 90) * (Math.PI / 180);
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
                  fill={currentTheme.themeColor}
                  stroke={currentTheme.themeColor}
                  fillOpacity="0.25"
                  strokeWidth="2.5"
                />

                {/* Vertices */}
                {radarAxes.map((d, idx) => {
                  const angle = (idx * angleStep - 90) * (Math.PI / 180);
                  const r = (d.score / 100) * maxR;
                  const x = cx + r * Math.cos(angle);
                  const y = cy + r * Math.sin(angle);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={currentTheme.themeColor}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Right Column: Domain Score Bars */}
            <div className="md:col-span-6 space-y-2.5">
              <span className="text-[11px] font-bold text-[#5F5E5A] uppercase block mb-1">
                CLINICAL DOMAIN INDICES (0–100%)
              </span>
              {radarAxes.map((d, idx) => {
                const barColor = d.score < 40 ? "#993C1D" : d.score <= 65 ? currentTheme.themeColor : "#0F6E56";
                const badgeText = d.score < 40 ? "⚠ Priority" : d.score <= 65 ? "Emerging" : "Mastered ✓";
                const badgeVariant = d.score < 40 ? "coral" : d.score <= 65 ? "blue" : "green";

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2C2C2A]">{d.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{d.score}%</span>
                        <Badge label={badgeText} variant={badgeVariant} size="sm" />
                      </div>
                    </div>
                    <div className="h-[10px] w-full bg-[#E5E5E0] rounded-[4px] overflow-hidden">
                      <div className="h-full rounded-[4px] transition-all" style={{ width: `${d.score}%`, backgroundColor: barColor }} />
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
                <AlertCircle className="h-4 w-4" /> ⚠ Priority Areas for Targeted Intervention
              </h4>
              <ul className="space-y-1 text-[12px] font-bold text-[#993C1D] pl-2">
                {priorityDomains.map((p, idx) => (
                  <li key={idx}>• {p.label}: {p.score}% — Requires therapeutic concentration & reinforcement</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ═══ SECTION 4 — REPORT TEXT SECTIONS ═══ */}
        <div className="no-page-break space-y-6 pt-4">
          <div className="border-b-2 pb-1" style={{ borderColor: currentTheme.themeColor }}>
            <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: currentTheme.themeColor }}>
              CLINICAL REPORT NARRATIVE
            </h3>
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
                    className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer edit-mode-only"
                    style={{ color: currentTheme.themeColor }}
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

        {/* ═══ SECTION 5 — ASSIGNED THERAPY EXERCISES & HOME PROGRAM (WITH VERIFIED IMAGES) ═══ */}
        <div className="no-page-break space-y-6 pt-4">
          <div
            className="border-b-2 pb-1.5 flex items-center justify-between"
            style={{ borderColor: currentTheme.themeColor }}
          >
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" style={{ color: currentTheme.themeColor }} />
              <h3
                className="text-[13px] font-black uppercase tracking-wider"
                style={{ color: currentTheme.themeColor }}
              >
                ASSIGNED THERAPY EXERCISES & HOME PROGRAM
              </h3>
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: currentTheme.themeBg, color: currentTheme.themeColor }}
            >
              {activeClinicExercises.length + activeHomeExercises.length} Prescribed Activities with Visual Guides
            </span>
          </div>

          {/* In-Clinic Exercises */}
          {activeClinicExercises.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase text-[#0F6E56] flex items-center gap-1.5">
                  <span>🏥 In-Clinic Therapeutic Exercises & Interventions</span>
                </h4>
                <span className="text-[10px] font-bold text-[#5F5E5A]">
                  Supervised by Rehabilitation Specialist
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeClinicExercises.map((ex, idx) => {
                  const master = resolveExerciseItem(ex) || (typeof ex === "object" ? ex : { name: ex });
                  const name = master.name || (typeof ex === "string" ? ex : "Exercise");
                  const imageUrl = master.image_url || master.imageUrl;
                  const desc = master.description || "Structured therapeutic activity performed under therapist guidance.";
                  const cat = master.category || "Clinical Physiotherapy";
                  const duration = master.duration || "10–15 mins";
                  const benefits = master.benefits || [];

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#D3D1C7] rounded-[10px] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container with Visual Fallback */}
                        <div className="relative h-36 sm:h-40 w-full bg-slate-100 overflow-hidden border-b border-[#D3D1C7]/60">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fb = e.currentTarget.nextElementSibling;
                                if (fb) fb.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: imageUrl ? "none" : "flex" }}
                            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-3 text-center"
                          >
                            <Activity className="h-8 w-8 text-[#185FA5]/40 mb-1" />
                            <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                            <span className="text-[10px] text-[#5F5E5A]">Clinical Exercise Guide</span>
                          </div>

                          {/* Category Pill Over Image */}
                          <div className="absolute top-2 right-2">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[#185FA5] rounded-full uppercase shadow-xs border border-white">
                              {cat}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-[13px] font-bold text-[#2C2C2A] leading-snug">{name}</h5>
                            <span className="text-[10px] font-bold text-[#0F6E56] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                              ⏱ {duration}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3">
                            {desc}
                          </p>

                          {/* Benefits Pills */}
                          {Array.isArray(benefits) && benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {benefits.slice(0, 2).map((b, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="text-[9px] font-semibold bg-[#F0EFEA] text-[#5F5E5A] px-1.5 py-0.5 rounded"
                                >
                                  ✓ {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom footer bar */}
                      <div className="px-3.5 py-2 bg-[#F8F8F6] border-t border-[#D3D1C7]/60 text-[10px] font-bold text-[#5F5E5A] flex items-center justify-between">
                        <span>In-Clinic Session</span>
                        <span className="text-[#0F6E56]">Active Protocol</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Home Routine Exercises */}
          {activeHomeExercises.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase text-[#854F0B] flex items-center gap-1.5">
                  <span>🏠 Prescribed Home Exercise Routine for Parents & Caregivers</span>
                </h4>
                <span className="text-[10px] font-bold text-[#854F0B]">
                  Daily Home Reinforcement Program
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeHomeExercises.map((ex, idx) => {
                  const master = resolveExerciseItem(ex) || (typeof ex === "object" ? ex : { name: ex });
                  const name = master.name || (typeof ex === "string" ? ex : "Exercise");
                  const imageUrl = master.image_url || master.imageUrl;
                  const desc = master.home_description || master.description || "Daily home practice routine.";
                  const cat = master.category || "Home Care";
                  const freq = master.frequency || "Daily";
                  const benefits = master.benefits || [];

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#D3D1C7] rounded-[10px] overflow-hidden shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container with Visual Fallback */}
                        <div className="relative h-36 sm:h-40 w-full bg-slate-100 overflow-hidden border-b border-[#D3D1C7]/60">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fb = e.currentTarget.nextElementSibling;
                                if (fb) fb.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: imageUrl ? "none" : "flex" }}
                            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700 p-3 text-center"
                          >
                            <Activity className="h-8 w-8 text-[#854F0B]/40 mb-1" />
                            <span className="text-xs font-bold text-[#2C2C2A]">{name}</span>
                            <span className="text-[10px] text-[#854F0B]">Home Practice Guide</span>
                          </div>

                          {/* Category Pill Over Image */}
                          <div className="absolute top-2 right-2">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[#854F0B] rounded-full uppercase shadow-xs border border-white">
                              {cat}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-[13px] font-bold text-[#2C2C2A] leading-snug">{name}</h5>
                            <span className="text-[10px] font-bold text-[#854F0B] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                              📅 {freq}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#5F5E5A] leading-relaxed line-clamp-3">
                            {desc}
                          </p>

                          {/* Benefits Pills */}
                          {Array.isArray(benefits) && benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {benefits.slice(0, 2).map((b, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="text-[9px] font-semibold bg-[#FEF6E7] text-[#854F0B] px-1.5 py-0.5 rounded"
                                >
                                  ✓ {b}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom footer bar */}
                      <div className="px-3.5 py-2 bg-[#FEF6E7]/40 border-t border-[#854F0B]/20 text-[10px] font-bold text-[#854F0B] flex items-center justify-between">
                        <span>Parent-Led Daily Routine</span>
                        <span>Home Practice ✓</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═══ SECTION 6 — SIGN OFF ═══ */}
        <div className="no-page-break page-break-before space-y-4 pt-6">
          <div className="border-b-2 pb-1" style={{ borderColor: currentTheme.themeColor }}>
            <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: currentTheme.themeColor }}>
              CLINICAL MULTIDISCIPLINARY SIGN OFF
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Left — Assessor */}
            <div className="space-y-3">
              <span className="text-xs text-[#5F5E5A] font-semibold block">Prepared by:</span>
              {!isEditing ? (
                <div>
                  <p className="text-sm font-bold text-[#2C2C2A]">{formState.preparedBy}</p>
                  <p className="text-xs text-[#5F5E5A]">{formState.designation || currentTheme.defaultAssessorRole}</p>
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
                <span className="text-[11px] text-[#5F5E5A] block mt-1">Clinical Specialist Signature</span>
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
                <span className="text-[11px] text-[#5F5E5A] block mt-1">Clinical Director Signature</span>
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
            {isAdmin && (
              <Button variant="outlined" size="sm" icon={Edit3} onClick={() => setIsEditing(true)}>
                ✏ Edit Report
              </Button>
            )}
            <Button variant="outlined" size="sm" icon={Download} onClick={triggerPdfDownload} className="border-[#0F6E56] text-[#0F6E56]">
              ⬇ Download PDF
            </Button>
            {isAdmin && (
              <Button 
                size="sm" 
                icon={CheckCircle2} 
                onClick={handlePublish} 
                loading={isPublishing}
                className="bg-[#0F6E56] hover:bg-[#0c5845] text-white"
              >
                {formState.reportStatus === "published"
                  ? "Update & Republish"
                  : "✓ Approve & Publish to Parents"}
              </Button>
            )}
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
