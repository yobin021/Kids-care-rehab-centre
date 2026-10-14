"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Brain,
  Printer,
  Sparkles,
  FileText,
  Activity,
  RotateCcw,
  Info,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Send,
  Edit3,
  Trash2,
  ShieldCheck,
  Clock
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { printReportWithFilename } from "../utils/printHelpers";
import { calculateISAAScore, classifyProfile, selectExercises, calculateDomainScores } from "../utils/scoringEngine";
import { therapyAssessmentService } from "../services/therapyAssessmentService";
import { childAssignmentService } from "../services/childAssignmentService";
import { assessmentService } from "../services/assessmentService";
import { childrenService } from "../services/childrenService";
import { reportService } from "../services/reportService";
import { checkReassessmentEligibility } from "../utils/reassessmentHelpers";

export const ISAA_SECTIONS = [
  {
    id: "I",
    title: "I. SOCIAL RELATIONSHIP AND RECIPROCITY",
    description: "Evaluates eye contact, peer interactions, social smile, aloofness and reciprocity",
    maxScore: 45,
    items: [
      { id: 1, text: "Has poor eye contact" },
      { id: 2, text: "Lacks social smile" },
      { id: 3, text: "Remains aloof" },
      { id: 4, text: "Does not reach out to others" },
      { id: 5, text: "Unable to relate to people" },
      { id: 6, text: "Unable to respond to social/environmental cues" },
      { id: 7, text: "Engages in solitary and repetitive play activities" },
      { id: 8, text: "Unable to take turns in social interaction" },
      { id: 9, text: "Does not maintain peer relationships" }
    ]
  },
  {
    id: "II",
    title: "II. EMOTIONAL RESPONSIVENESS",
    description: "Evaluates emotional regulation, fear response, self-stimulation and agitation",
    maxScore: 25,
    items: [
      { id: 10, text: "Shows inappropriate emotional response" },
      { id: 11, text: "Shows exaggerated emotions" },
      { id: 12, text: "Engages in self-stimulating emotions" },
      { id: 13, text: "Lacks fear of danger" },
      { id: 14, text: "Excited or agitated for no apparent reason" }
    ]
  },
  {
    id: "III",
    title: "III. SPEECH-LANGUAGE AND COMMUNICATION",
    description: "Evaluates expressive communication, echolalia, non-verbal cues and speech patterns",
    maxScore: 30,
    items: [
      { id: 15, text: "Acquired speech and lost it" },
      { id: 16, text: "Has difficulty in using non-verbal language or gestures to communicate" },
      { id: 17, text: "Engages in stereotyped and repetitive use of language" },
      { id: 18, text: "Engages in echolalic speech" },
      { id: 19, text: "Produces infantile squeals/unusual noises" },
      { id: 20, text: "Unable to initiate or sustain conversation with others" }
    ]
  },
  {
    id: "IV",
    title: "IV. BEHAVIOUR PATTERNS",
    description: "Evaluates motor mannerisms, attachment to objects, hyperactivity, aggression and sameness",
    maxScore: 40,
    items: [
      { id: 21, text: "Engages in stereotyped and repetitive motor mannerisms" },
      { id: 22, text: "Shows attachment to inanimate objects" },
      { id: 23, text: "Shows hyperactivity/restlessness" },
      { id: 24, text: "Exhibits aggressive behaviour" },
      { id: 25, text: "Throws temper tantrums" },
      { id: 26, text: "Engages in self-injurious behaviour" },
      { id: 27, text: "Insists on sameness" },
      { id: 28, text: "Unusually sensitive to sensory stimuli" }
    ]
  },
  {
    id: "V",
    title: "V. COGNITIVE COMPONENT",
    description: "Evaluates responsiveness, delay, savant skills, abstract understanding and restricted interest",
    maxScore: 30,
    items: [
      { id: 29, text: "Responds to inconsistency in environment" },
      { id: 30, text: "Shows delay in responding" },
      { id: 31, text: "Has unusual memory of some kind" },
      { id: 32, text: "Shows 'savant' ability" },
      { id: 33, text: "Difficulty in understanding abstract concepts" },
      { id: 34, text: "Has restricted areas of interest" }
    ]
  },
  {
    id: "VI",
    title: "VI. SENSORY ASPECTS",
    description: "Evaluates auditory, visual, tactile, olfactory, pain sensitivity and sensory seeking",
    maxScore: 30,
    items: [
      { id: 35, text: "Unusually sensitive to sound" },
      { id: 36, text: "Unusually sensitive to light" },
      { id: 37, text: "Unusually sensitive to touch / texture" },
      { id: 38, text: "Unusually sensitive to smell / taste" },
      { id: 39, text: "Shows pain insensitivity / unusual tolerance" },
      { id: 40, text: "Craves or seeks sensory stimulation" }
    ]
  }
];

export const ISAA_SCALE_OPTIONS = [
  { score: 1, label: "Rarely", sublabel: "Upto 20%", scoreLabel: "Score 1" },
  { score: 2, label: "Sometimes", sublabel: "21 – 40%", scoreLabel: "Score 2" },
  { score: 3, label: "Frequently", sublabel: "41 – 60%", scoreLabel: "Score 3" },
  { score: 4, label: "Mostly", sublabel: "61 – 80%", scoreLabel: "Score 4" },
  { score: 5, label: "Always", sublabel: "81 – 100%", scoreLabel: "Score 5" }
];

export default function IsaaAssessmentForm() {
  const { childId: routeChildId } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const [searchParams] = useSearchParams();
  const queryAssessmentId = searchParams.get("assessmentId");
  const [currentAssessmentId, setCurrentAssessmentId] = useState(queryAssessmentId || null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const [selectedChildId, setSelectedChildId] = useState(routeChildId || "");
  const [child, setChild] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessorNotes, setAssessorNotes] = useState("");
  const [assessorName, setAssessorName] = useState(user?.name || "Occupational Therapist");

  // Read-only Lock Flag: Set to true if a report has already been generated
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [existingReport, setExistingReport] = useState(null);
  const [intervalEligibility, setIntervalEligibility] = useState(null);
  const [isIntervalLocked, setIsIntervalLocked] = useState(false);

  // Ratings map: { item1: 1..5, ..., item40: 1..5 }
  const [ratings, setRatings] = useState({});

  const checkExistingReport = async (cId, aId) => {
    if (!cId) return;
    try {
      const [reps, assList] = await Promise.all([
        reportService.getByChildId(cId).catch(() => []),
        assessmentService.getByChildId(cId).catch(() => [])
      ]);

      if (aId) {
        // Specific assessment requested: check if this assessment has a report
        let matched = null;
        if (Array.isArray(reps)) {
          matched = reps.find((r) => r.assessment_id === aId || r.assessmentId === aId);
        }
        if (matched) {
          setIsReadOnly(true);
          setExistingReport(matched);
          setIsIntervalLocked(false);
        } else {
          setIsReadOnly(false);
          setExistingReport(null);
          setIsIntervalLocked(false);
        }
      } else {
        // New assessment requested: check 3-month reassessment interval
        const eligibility = checkReassessmentEligibility(assList, reps);
        setIntervalEligibility(eligibility);
        if (Array.isArray(assList) && assList.length > 0 && !eligibility.eligible) {
          setIsIntervalLocked(true);
          setIsReadOnly(true);
          setExistingReport(null);
        } else {
          setIsIntervalLocked(false);
          setIsReadOnly(false);
          setExistingReport(null);
        }
      }
    } catch (err) {
      console.warn("Isaa check existing report notice:", err);
    }
  };

  // Load children and selected child / existing assessment
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await childrenService.getAll();
        const asdOrAll = (list && list.length > 0) ? list : childrenList;
        setAllChildren(asdOrAll);

        const targetId = routeChildId || (asdOrAll.find(c => c.therapy_category === "ASD" || c.diagnosis?.includes("ASD"))?.id || asdOrAll[0]?.id);
        if (targetId) {
          setSelectedChildId(targetId);
          let found = asdOrAll.find(c => c.id === targetId);
          if (!found) {
            found = await childrenService.getById(targetId);
          }
          setChild(found || null);

          // If query assessment ID is passed, load that specific assessment
          if (queryAssessmentId) {
            try {
              let existing = await therapyAssessmentService.getById(queryAssessmentId, "asd");
              if (!existing) existing = await assessmentService.getById(queryAssessmentId);
              if (existing) {
                setCurrentAssessmentId(existing.id);
                setIsEditingExisting(true);
                if (existing.form_data?.isaaRatings) {
                  setRatings(existing.form_data.isaaRatings);
                }
                if (existing.form_data?.assessorNotes) {
                  setAssessorNotes(existing.form_data.assessorNotes);
                }
                if (existing.assessment_date) {
                  setAssessmentDate(existing.assessment_date);
                }
                if (existing.form_data?.assessorName) {
                  setAssessorName(existing.form_data.assessorName);
                }
                setLastSavedTime(new Date(existing.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
              }
            } catch (err) {
              console.warn("Could not load existing ISAA assessment:", err);
            }
          } else {
            // New assessment mode: reset form
            setRatings({});
            setAssessorNotes("");
            setCurrentAssessmentId(null);
            setIsEditingExisting(false);
            setAssessmentDate(new Date().toISOString().split("T")[0]);
          }

          // Check if report has already been generated or if 3-month interval is active
          await checkExistingReport(targetId, queryAssessmentId);
        }
      } catch (err) {
        console.warn("IsaaAssessmentForm load error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [routeChildId, queryAssessmentId]);

  const loadDraft = (cId) => {
    if (!cId) return;
    try {
      const saved = localStorage.getItem(`isaa_draft_${cId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ratings) setRatings(parsed.ratings);
        if (parsed.notes) setAssessorNotes(parsed.notes);
        if (parsed.date) setAssessmentDate(parsed.date);
        setLastSavedTime(parsed.savedAt || "Draft Loaded");
      } else {
        setRatings({});
        setAssessorNotes("");
      }
    } catch (e) {
      console.warn("Draft load error:", e);
    }
  };

  const handleChildChange = (newId) => {
    setSelectedChildId(newId);
    const found = allChildren.find(c => c.id === newId);
    setChild(found || null);
    loadDraft(newId);
    checkExistingReport(newId, null);
  };

  const setItemRating = (itemNum, score) => {
    if (isReadOnly) return;
    setRatings(prev => {
      const next = { ...prev, [`item${itemNum}`]: score };
      if (selectedChildId) {
        localStorage.setItem(`isaa_draft_${selectedChildId}`, JSON.stringify({
          ratings: next,
          notes: assessorNotes,
          date: assessmentDate,
          savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      return next;
    });
  };

  const handleQuickFillSection = (sectionItems, score) => {
    if (isReadOnly) return;
    setRatings(prev => {
      const next = { ...prev };
      sectionItems.forEach(it => {
        next[`item${it.id}`] = score;
      });
      if (selectedChildId) {
        localStorage.setItem(`isaa_draft_${selectedChildId}`, JSON.stringify({
          ratings: next,
          notes: assessorNotes,
          date: assessmentDate,
          savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      return next;
    });
  };

  const handleClearAll = () => {
    if (isReadOnly) return;
    if (window.confirm("Are you sure you want to clear all ratings in this form?")) {
      setRatings({});
      if (selectedChildId) {
        localStorage.removeItem(`isaa_draft_${selectedChildId}`);
      }
      showToast("Form ratings reset.", "info");
    }
  };

  // Calculate ISAA statistics
  const isaaResults = useMemo(() => {
    return calculateISAAScore(ratings);
  }, [ratings]);

  const ratedPercentage = Math.round((isaaResults.ratedCount / 40) * 100);

  const getSeverityBadgeVariant = (severityLevel) => {
    if (severityLevel === 3) return "danger";
    if (severityLevel === 2) return "amber";
    if (severityLevel === 1) return "blue";
    return "success";
  };

  const buildIsaaPayload = (status = "completed") => {
    const domainScores = calculateDomainScores({
      s5_communication: {
        respondsName: ratings.item1 > 2 ? 1 : 3,
        eyeContact: ratings.item1 > 2 ? 0 : 3,
        simpleInstructions: ratings.item6 > 2 ? 1 : 3,
        gestures: ratings.item16 > 2 ? 1 : 3,
        usesWords: ratings.item17 > 2 ? 1 : 3,
        answersQuestions: ratings.item20 > 2 ? 0 : 3
      },
      s8_social: {
        respondsAdults: ratings.item5 > 2 ? 1 : 3,
        respondsPeers: ratings.item9 > 2 ? 1 : 3,
        greetsOthers: ratings.item2 > 2 ? 1 : 3,
        takesTurns: ratings.item8 > 2 ? 1 : 3,
        functionalPlay: ratings.item7 > 2 ? 1 : 3
      },
      s6_attention: {
        sitsForActivity: ratings.item23 > 2 ? 1 : 3,
        attendsTeacher: ratings.item30 > 2 ? 1 : 3,
        completesSimpleTask: ratings.item23 > 2 ? 1 : 3,
        transitionsActivities: ratings.item27 > 2 ? 1 : 3
      },
      s14_emotional: {
        ageAppropriateResponse: ratings.item10 > 2 ? 1 : 3,
        expressesCalmly: ratings.item14 > 2 ? 1 : 3,
        calmsAfterUpset: ratings.item25 > 2 ? 1 : 3
      },
      s10_fineMotor: {
        reachesGrasps: 2,
        stacksBlocks: 2,
        usesCrayons: 2
      },
      s11_grossMotor: {
        sittingBalance: 3,
        walking: 3,
        running: 3
      },
      s13_adl: {
        eatingIndependently: 2,
        handWashing: 2,
        dressing: 2
      },
      sensoryConcerns: [
        ratings.item35 > 2 ? "Sound Sensitivity" : null,
        ratings.item36 > 2 ? "Light Sensitivity" : null,
        ratings.item37 > 2 ? "Tactile Sensitivity" : null,
        ratings.item38 > 2 ? "Taste/Smell Sensitivity" : null,
        ratings.item40 > 2 ? "Sensory Seeking" : null
      ].filter(Boolean)
    });

    const profileInfo = classifyProfile(domainScores, isaaResults.severityLevel);
    const exercises = selectExercises(profileInfo.profile, domainScores);

    return {
      id: currentAssessmentId || undefined,
      child_id: selectedChildId,
      assessment_date: assessmentDate,
      assessed_by: user?.id || null,
      isaa_score: isaaResults.totalScore,
      isaa_severity: isaaResults.severity,
      isaa_level: isaaResults.severityLevel,
      isaa_section_scores: isaaResults.sectionScores,
      domain_scores: domainScores,
      profile: profileInfo.profile,
      profile_description: profileInfo.profileDescription,
      clinic_exercises: exercises.clinicExercises,
      home_exercises: exercises.homeExercises,
      form_data: {
        isaaRatings: ratings,
        assessorName,
        assessorNotes,
        ratedCount: isaaResults.ratedCount,
        completedDate: new Date().toISOString()
      },
      status
    };
  };

  // Action 1: Save Assessment Only (Updates existing or creates draft, keeps user on form)
  const handleSaveAssessmentOnly = async () => {
    if (isReadOnly) {
      showToast("This assessment is finalized and cannot be modified.", "warning");
      return;
    }
    if (!selectedChildId) {
      showToast("Please select a child before saving.", "danger");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildIsaaPayload("draft");
      const res = await therapyAssessmentService.saveASD(payload);
      if (res?.id) setCurrentAssessmentId(res.id);
      setIsEditingExisting(true);
      const savedPayload = { ...payload, id: res?.id || currentAssessmentId };
      if (typeof window !== "undefined") {
        localStorage.setItem(`assessment_result_${selectedChildId}`, JSON.stringify(savedPayload));
        if (res?.id) localStorage.setItem(`assessment_result_${res.id}`, JSON.stringify(savedPayload));
      }

      // Automatically link child to assessing staff
      if (user && selectedChildId) {
        await childAssignmentService.recordStaffAssessment(selectedChildId, user, "ISAA Autism Assessment");
      }

      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      showToast("ISAA Assessment saved successfully! You can continue editing or generate a report.", "success");
    } catch (err) {
      console.warn("ISAA save notice:", err);
      if (user && selectedChildId) {
        await childAssignmentService.recordStaffAssessment(selectedChildId, user, "ISAA Autism Assessment");
      }
      showToast("Assessment saved locally.", "info");
    } finally {
      setSubmitting(false);
    }
  };

  // Action 2: Generate Report & Submit for Review
  const handleSubmit = async () => {
    if (isIntervalLocked) {
      showToast(
        `Clinical Protocol: Re-assessments can only be taken once every 3 months. Next eligible date: ${intervalEligibility?.nextEligibleDateFormatted}`,
        "warning"
      );
      return;
    }
    if (isReadOnly) {
      showToast("A clinical report has already been generated for this assessment.", "info");
      navigate(`/reports/${existingReport?.id || selectedChildId}/therapist`);
      return;
    }
    if (!selectedChildId) {
      showToast("Please select a child before submitting.", "danger");
      return;
    }

    if (isaaResults.ratedCount < 40) {
      const remaining = 40 - isaaResults.ratedCount;
      if (!window.confirm(`You have ${remaining} unrated item(s). Do you still want to generate report and submit for review?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = buildIsaaPayload("completed");
      setShowConfirmModal(false);
      let res = null;
      try {
        res = await therapyAssessmentService.saveASD(payload);
      } catch (saveErr) {
        console.warn("DB save warning, saving locally:", saveErr);
      }

      const assessmentId = res?.id || currentAssessmentId || `local-asd-${Date.now()}`;
      setCurrentAssessmentId(assessmentId);
      const savedPayload = { ...payload, id: assessmentId };
      if (typeof window !== "undefined") {
        localStorage.setItem(`assessment_result_${selectedChildId}`, JSON.stringify(savedPayload));
        localStorage.setItem(`assessment_result_${assessmentId}`, JSON.stringify(savedPayload));
        localStorage.removeItem(`isaa_draft_${selectedChildId}`);
      }

      // Automatically link child to assessing staff
      if (user && selectedChildId) {
        await childAssignmentService.recordStaffAssessment(selectedChildId, user, "ISAA Autism Assessment");
      }

      showToast("ISAA Assessment saved! Directing to report generator...", "success");
      navigate(`/reports/new/${selectedChildId}?assessmentId=${assessmentId}&submitForReview=true`);
    } catch (err) {
      console.error("ISAA submission error:", err);
      setShowConfirmModal(false);
      const fallbackId = currentAssessmentId || `local-asd-${Date.now()}`;
      if (user && selectedChildId) {
        await childAssignmentService.recordStaffAssessment(selectedChildId, user, "ISAA Autism Assessment");
      }
      showToast("Assessment saved locally. Redirecting to report generator...", "info");
      navigate(`/reports/new/${selectedChildId}?assessmentId=${fallbackId}&submitForReview=true`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (window.confirm("Are you sure you want to delete this ISAA Autism assessment form? All entered item ratings will be permanently removed.")) {
      try {
        setSubmitting(true);
        if (currentAssessmentId) {
          await assessmentService.delete(currentAssessmentId, selectedChildId);
        } else if (selectedChildId) {
          localStorage.removeItem(`isaa_draft_${selectedChildId}`);
          localStorage.removeItem(`assessment_result_${selectedChildId}`);
        }
        showToast("ISAA Assessment deleted successfully.", "success");
        navigate(selectedChildId ? `/children/${selectedChildId}` : "/therapy");
      } catch (err) {
        showToast("Failed to delete assessment: " + err.message, "danger");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* ═══ TOP BREADCRUMB & HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F5E5A]">
            <Link to="/therapy" className="hover:text-[#185FA5] transition-colors flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#185FA5]" />
              Therapy Pathways
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#185FA5] font-bold">ASD Pathway</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2C2C2A] font-bold">ISAA Clinical Assessment</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-8 w-8 rounded-[8px] bg-[#185FA5]/10 flex items-center justify-center text-[#185FA5]">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#2C2C2A] tracking-tight">
                  Indian Scale for Assessment of Autism (ISAA)
                </h1>
                {isEditingExisting && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Edit3 className="h-3 w-3" /> Editing Saved Assessment
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5F5E5A] font-semibold">
                Official 40-item standardized clinical diagnostic scale for ASD evaluation &amp; severity staging.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outlined"
            icon={ArrowLeft}
            onClick={() => navigate(selectedChildId ? `/children/${selectedChildId}` : "/therapy")}
          >
            Back
          </Button>
          <Button
            size="sm"
            variant="outlined"
            icon={Printer}
            onClick={() =>
              printReportWithFilename({
                childName: child?.name,
                childId: child?.id || selectedChildId
              })
            }
          >
            Print Form
          </Button>
          {isReadOnly ? (
            <Button
              size="sm"
              icon={FileText}
              className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs font-bold"
              onClick={() => navigate(`/reports/${existingReport?.id || selectedChildId}/therapist`)}
            >
              View Generated Report
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outlined"
                icon={Trash2}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                disabled={submitting}
                onClick={handleDeleteAssessment}
                title="Delete this assessment"
              >
                Delete Form
              </Button>
              <Button
                size="sm"
                variant="outlined"
                icon={Save}
                loading={submitting}
                onClick={handleSaveAssessmentOnly}
              >
                Save Assessment
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Send}
                className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs font-bold"
                onClick={() => setShowConfirmModal(true)}
              >
                Generate Report &amp; Submit for Review
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ═══ 3-MONTH INTERVAL PROTOCOL RESTRICTION BANNER ═══ */}
      {isIntervalLocked && intervalEligibility && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <Clock className="h-7 w-7 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-950 leading-snug">
                Clinical Protocol Restriction: 3-Month Re-assessment Interval Active
              </h4>
              <p className="text-xs sm:text-[13px] text-amber-800 font-medium mt-0.5">
                Clinical reassessments can only be conducted once every 3 months. Previous assessment was conducted on <strong>{intervalEligibility.lastAssessmentDateFormatted}</strong>. Next eligible assessment: <strong className="underline text-amber-950">{intervalEligibility.nextEligibleDateFormatted}</strong> ({intervalEligibility.daysRemaining} days remaining).
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/children/${selectedChildId}`)}
            className="shrink-0 font-bold shadow-xs text-xs"
          >
            Back to Child Profile
          </Button>
        </div>
      )}

      {/* ═══ READ-ONLY FINALIZED BANNER ═══ */}
      {!isIntervalLocked && isReadOnly && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <ShieldCheck className="h-7 w-7 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-900 leading-snug">
                Assessment Form Finalized — Clinical Report Generated
              </h4>
              <p className="text-xs sm:text-[13px] text-amber-700 font-medium mt-0.5">
                This assessment form is in <strong>view-only mode</strong> because a clinical report has already been generated. Responses cannot be modified.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            icon={FileText}
            onClick={() => navigate(`/reports/${existingReport?.id || selectedChildId}/therapist`)}
            className="bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0 font-bold shadow-xs"
          >
            View Generated Report
          </Button>
        </div>
      )}

      {/* ═══ PATIENT SELECTOR & META BAR ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
            Select Therapy Child (ASD)
          </label>
          <select
            value={selectedChildId}
            disabled={isReadOnly}
            onChange={(e) => handleChildChange(e.target.value)}
            className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#185FA5] focus:bg-white cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {allChildren.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id}) — {c.therapy_category || c.diagnosis || "Therapy"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
            Assessment Date &amp; Evaluator
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={assessmentDate}
              disabled={isReadOnly}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="h-9 px-2.5 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#185FA5] disabled:opacity-75 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={assessorName}
              disabled={isReadOnly}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="Assessor Name"
              className="flex-1 h-9 px-2.5 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5] disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
            Form Autosave Status
          </label>
          <div className="flex items-center justify-between h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs">
            <span className="font-semibold text-[#5F5E5A]">
              {isReadOnly ? "Finalized (Locked)" : lastSavedTime ? `Autosaved at ${lastSavedTime}` : "No draft saved"}
            </span>
            {!isReadOnly && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-[#D85A5A] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Form
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ LIVE ISAA SCORE & SEVERITY MONITOR ═══ */}
      <div className="bg-gradient-to-r from-[#185FA5]/10 via-[#0F6E56]/10 to-transparent p-5 rounded-[12px] border-2 border-[#185FA5]/30 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#185FA5] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#185FA5]">
                Live Diagnostic Scoring Engine
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-[#2C2C2A]">
                {isaaResults.totalScore}
              </span>
              <span className="text-sm font-bold text-[#5F5E5A]">/ 200 Total Score</span>
              <Badge
                label={isaaResults.severity}
                variant={getSeverityBadgeVariant(isaaResults.severityLevel)}
                size="md"
              />
            </div>
            <p className="text-xs font-semibold text-[#5F5E5A]">
              Completion Progress: <strong className="text-[#2C2C2A]">{isaaResults.ratedCount} of 40 items rated ({ratedPercentage}%)</strong>
            </p>
          </div>

          {/* Severity Reference Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-[8px] border transition-all ${isaaResults.totalScore < 70 && isaaResults.ratedCount > 0 ? "bg-emerald-50 border-emerald-500 font-bold" : "bg-white border-[#D3D1C7]"}`}>
              <span className="text-[10px] text-[#5F5E5A] block">&lt; 70</span>
              <span className="text-xs font-bold text-emerald-700">No Autism</span>
            </div>
            <div className={`p-2.5 rounded-[8px] border transition-all ${isaaResults.totalScore >= 70 && isaaResults.totalScore <= 106 ? "bg-blue-50 border-blue-500 font-bold" : "bg-white border-[#D3D1C7]"}`}>
              <span className="text-[10px] text-[#5F5E5A] block">70 – 106</span>
              <span className="text-xs font-bold text-[#185FA5]">Mild Autism</span>
            </div>
            <div className={`p-2.5 rounded-[8px] border transition-all ${isaaResults.totalScore >= 107 && isaaResults.totalScore <= 153 ? "bg-amber-50 border-amber-500 font-bold" : "bg-white border-[#D3D1C7]"}`}>
              <span className="text-[10px] text-[#5F5E5A] block">107 – 153</span>
              <span className="text-xs font-bold text-amber-700">Moderate</span>
            </div>
            <div className={`p-2.5 rounded-[8px] border transition-all ${isaaResults.totalScore >= 154 ? "bg-red-50 border-red-500 font-bold" : "bg-white border-[#D3D1C7]"}`}>
              <span className="text-[10px] text-[#5F5E5A] block">154 – 200</span>
              <span className="text-xs font-bold text-red-700">Severe</span>
            </div>
          </div>
        </div>

        {/* Section Score Breakdown Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#D3D1C7]/60">
          {ISAA_SECTIONS.map((sec) => (
            <div key={sec.id} className="bg-white/80 backdrop-blur-xs p-2 rounded-[6px] border border-[#D3D1C7] text-center">
              <span className="text-[10px] font-bold text-[#5F5E5A] block">Sec {sec.id}</span>
              <span className="text-sm font-black font-mono text-[#185FA5]">
                {isaaResults.sectionScores[sec.id] || 0}
                <span className="text-[10px] text-[#5F5E5A] font-medium">/{sec.maxScore}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SCORING GUIDELINES INSTRUCTION BANNER ═══ */}
      <div className="bg-[#F0F4F8] p-4 rounded-[10px] border border-[#185FA5]/20 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#185FA5] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-[#2C2C2A]">
          <p className="font-bold text-[#185FA5]">
            ISAA Rating Guide:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
            <span className="bg-white px-2 py-1 rounded border border-[#D3D1C7]">
              <strong>Score 1: Rarely</strong> (Upto 20%)
            </span>
            <span className="bg-white px-2 py-1 rounded border border-[#D3D1C7]">
              <strong>Score 2: Sometimes</strong> (21 – 40%)
            </span>
            <span className="bg-white px-2 py-1 rounded border border-[#D3D1C7]">
              <strong>Score 3: Frequently</strong> (41 – 60%)
            </span>
            <span className="bg-white px-2 py-1 rounded border border-[#D3D1C7]">
              <strong>Score 4: Mostly</strong> (61 – 80%)
            </span>
            <span className="bg-white px-2 py-1 rounded border border-[#D3D1C7]">
              <strong>Score 5: Always</strong> (81 – 100%)
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 40-ITEM ISAA ASSESSMENT TABLE (FAITHFUL TO USER IMAGE) ═══ */}
      <div className="space-y-6">
        {ISAA_SECTIONS.map((sec) => {
          const secRatedCount = sec.items.filter(it => ratings[`item${it.id}`] > 0).length;
          const secScore = isaaResults.sectionScores[sec.id] || 0;

          return (
            <div key={sec.id} className="bg-white rounded-[12px] border border-[#D3D1C7] overflow-hidden shadow-2xs">
              {/* Section Header */}
              <div className="bg-[#185FA5] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black tracking-wide uppercase">{sec.title}</h3>
                  <p className="text-[11px] text-white/80 font-medium">{sec.description}</p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
                    Score: {secScore} / {sec.maxScore} ({secRatedCount}/{sec.items.length})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickFillSection(sec.items, 1)}
                      className="text-[10px] font-bold bg-white/15 hover:bg-white/30 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Set all in this section to Score 1"
                    >
                      All 1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillSection(sec.items, 3)}
                      className="text-[10px] font-bold bg-white/15 hover:bg-white/30 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Set all in this section to Score 3"
                    >
                      All 3
                    </button>
                  </div>
                </div>
              </div>

              {/* ISAA Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#2C2C2A] font-bold">
                      <th className="py-3 px-3 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[280px]">Items</th>
                      {ISAA_SCALE_OPTIONS.map((opt) => (
                        <th
                          key={opt.score}
                          className="py-3 px-2 text-center w-24 sm:w-28 border-l border-[#D3D1C7]/60"
                        >
                          <span className="block font-bold text-[#185FA5]">{opt.label}</span>
                          <span className="block text-[10px] text-[#5F5E5A] font-medium">{opt.sublabel}</span>
                          <span className="block text-[10px] font-mono font-bold text-[#2C2C2A] mt-0.5">{opt.scoreLabel}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((it, idx) => {
                      const currentVal = ratings[`item${it.id}`];
                      const isEven = idx % 2 === 0;

                      return (
                        <tr
                          key={it.id}
                          className={`border-b border-[#E8E6DF] transition-colors ${
                            currentVal ? "bg-white hover:bg-[#F0F7FD]" : isEven ? "bg-[#FAF9F5] hover:bg-[#F0F7FD]" : "bg-white hover:bg-[#F0F7FD]"
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-bold text-[#5F5E5A]">
                            {it.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#2C2C2A]">
                            {it.text}
                          </td>

                          {ISAA_SCALE_OPTIONS.map((opt) => {
                            const isSelected = currentVal === opt.score;

                            return (
                              <td
                                key={opt.score}
                                onClick={() => !isReadOnly && setItemRating(it.id, opt.score)}
                                className={`py-3 px-2 text-center border-l border-[#D3D1C7]/60 transition-all ${
                                  isReadOnly
                                    ? isSelected
                                      ? "bg-[#185FA5]/15 font-bold cursor-default"
                                      : "opacity-60 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-[#185FA5]/15 font-bold cursor-pointer"
                                    : "hover:bg-[#185FA5]/5 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`isaa-item-${it.id}`}
                                    checked={isSelected}
                                    disabled={isReadOnly}
                                    onChange={() => setItemRating(it.id, opt.score)}
                                    className="h-4.5 w-4.5 text-[#185FA5] focus:ring-[#185FA5] accent-[#185FA5] disabled:cursor-not-allowed"
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ CLINICAL NOTES & RECOMMENDATION CARD ═══ */}
      <Card padding="p-5" className="space-y-4">
        <h3 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#185FA5]" />
          Clinical Observations &amp; Evaluator Notes
        </h3>
        <textarea
          rows={4}
          value={assessorNotes}
          disabled={isReadOnly}
          onChange={(e) => setAssessorNotes(e.target.value)}
          placeholder="Enter qualitative clinical impressions, sensory observations, behavioral triggers, or therapy recommendations..."
          className="w-full p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[8px] text-xs text-[#2C2C2A] outline-none focus:border-[#185FA5] focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#D3D1C7]">
          <div>
            <p className="text-xs font-bold text-[#2C2C2A]">
              ISAA Score Summary: <span className="text-[#185FA5] font-mono">{isaaResults.totalScore}/200</span> ({isaaResults.severity})
            </p>
            <p className="text-[11px] text-[#5F5E5A]">
              {isReadOnly
                ? "This assessment is locked and linked to the finalized clinical report."
                : "Submitting this assessment will record the ISAA evaluation and link it to the child's therapy profile."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isReadOnly ? (
              <Button
                size="md"
                variant="primary"
                icon={FileText}
                className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs font-bold"
                onClick={() => navigate(`/reports/${existingReport?.id || selectedChildId}/therapist`)}
              >
                View Generated Report
              </Button>
            ) : (
              <>
                <Button
                  size="md"
                  variant="outlined"
                  icon={Trash2}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  disabled={submitting}
                  onClick={handleDeleteAssessment}
                >
                  Delete
                </Button>
                <Button
                  size="md"
                  variant="outlined"
                  icon={Save}
                  loading={submitting}
                  onClick={handleSaveAssessmentOnly}
                >
                  Save Assessment
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  icon={Send}
                  className="bg-[#185FA5] hover:bg-[#114B84] text-white shadow-xs font-bold"
                  loading={submitting}
                  onClick={() => setShowConfirmModal(true)}
                >
                  Generate Report &amp; Submit for Review
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ═══ CONFIRMATION MODAL ═══ */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Generate Report & Submit for Review"
      >
        <div className="space-y-4 text-xs text-[#2C2C2A]">
          <div className="bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7] space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Child:</span>
              <span className="font-bold">{child?.name} ({child?.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Assessment Date:</span>
              <span className="font-bold">{assessmentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">ISAA Total Score:</span>
              <span className="font-bold font-mono text-[#185FA5]">{isaaResults.totalScore} / 200</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Autism Severity:</span>
              <Badge
                label={isaaResults.severity}
                variant={getSeverityBadgeVariant(isaaResults.severityLevel)}
                size="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Rated Items:</span>
              <span className="font-bold">{isaaResults.ratedCount} / 40 items</span>
            </div>
          </div>

          <div className="bg-[#ECFDF5] border border-[#86EFAC] rounded-[8px] p-3 text-[#085041] space-y-1">
            <p>✓ All 40 ISAA items and severity levels will be saved to the child's profile</p>
            <p>✓ Dual clinical and parent reports will be prepared</p>
            <p>✓ Report will be marked as submitted for Admin review</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D3D1C7]">
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              loading={submitting}
              className="bg-[#185FA5] hover:bg-[#114B84] text-white"
              onClick={handleSubmit}
            >
              Generate &amp; Submit for Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
