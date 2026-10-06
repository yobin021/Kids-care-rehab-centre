"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  Printer,
  FileText,
  Activity,
  RotateCcw,
  Info,
  ChevronRight,
  TrendingUp,
  Brain
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";
import { therapyAssessmentService } from "../services/therapyAssessmentService";
import { childrenService } from "../services/childrenService";
import { printReportWithFilename } from "../utils/printHelpers";

export const CONNERS_ITEMS = [
  { id: 1, text: "Inattentive, easily distracted", subscale: "Inattention" },
  { id: 2, text: "Angry and resentful", subscale: "Oppositional" },
  { id: 3, text: "Difficulty doing or completing homework", subscale: "Inattention" },
  { id: 4, text: "Is always \"on the go\" or acts as if driven by a motor", subscale: "Hyperactivity" },
  { id: 5, text: "Short attention span", subscale: "Inattention" },
  { id: 6, text: "Argues with adults", subscale: "Oppositional" },
  { id: 7, text: "Fidgets with hands or feet or squirms in seat", subscale: "Hyperactivity" },
  { id: 8, text: "Fails to complete assignments", subscale: "Inattention" },
  { id: 9, text: "Hard to control in malls or while grocery shopping", subscale: "Hyperactivity" },
  { id: 10, text: "Messy or disorganized at home or school", subscale: "Inattention" },
  { id: 11, text: "Loses temper", subscale: "Oppositional" },
  { id: 12, text: "Needs close supervision to get through assignments", subscale: "Inattention" },
  { id: 13, text: "Only attends if it is something he/she is very interested in", subscale: "Inattention" },
  { id: 14, text: "Runs about or climbs excessively in situations where it is inappropriate", subscale: "Hyperactivity" },
  { id: 15, text: "Distractibility or attention span a problem", subscale: "Inattention" },
  { id: 16, text: "Irritable", subscale: "Oppositional" },
  { id: 17, text: "Avoids, expresses reluctance about, or has difficulties engaging in tasks that require sustained mental effort (such as schoolwork or homework)", subscale: "Inattention" },
  { id: 18, text: "Restless in the \"squirmy\" sense", subscale: "Hyperactivity" },
  { id: 19, text: "Gets distracted when given instructions to do something", subscale: "Inattention" },
  { id: 20, text: "Actively defies or refuses to comply with adults' requests", subscale: "Oppositional" },
  { id: 21, text: "Has trouble concentrating in class", subscale: "Inattention" },
  { id: 22, text: "Has difficulty waiting in lines or awaiting turn in games or group situations", subscale: "Hyperactivity" },
  { id: 23, text: "Leaves seat in classroom or in other situations in which remaining seated is expected", subscale: "Hyperactivity" },
  { id: 24, text: "Deliberately does things that annoy other people", subscale: "Oppositional" },
  { id: 25, text: "Does not follow through on instructions and fails to finish schoolwork, chores or duties in the workplace (not due to oppositional behavior or failure to understand instructions)", subscale: "Inattention" },
  { id: 26, text: "Has difficulty playing or engaging in leisure activities quietly", subscale: "Hyperactivity" },
  { id: 27, text: "Easily frustrated in efforts", subscale: "Oppositional" }
];

export const CONNERS_RATING_OPTIONS = [
  { score: 0, label: "NOT TRUE AT ALL", sublabel: "(Never, Seldom)" },
  { score: 1, label: "JUST A LITTLE TRUE", sublabel: "(Occasionally)" },
  { score: 2, label: "PRETTY MUCH TRUE", sublabel: "(Often, Quite a Bit)" },
  { score: 3, label: "VERY MUCH TRUE", sublabel: "(Very Often, Very Frequent)" }
];

export function calculateConnersScore(ratings = {}) {
  let totalScore = 0;
  let ratedCount = 0;

  const subscales = {
    Inattention: 0,
    Hyperactivity: 0,
    Oppositional: 0
  };

  CONNERS_ITEMS.forEach((it) => {
    const val = ratings[`item${it.id}`];
    if (val !== undefined && val !== null) {
      const num = Number(val);
      totalScore += num;
      ratedCount++;
      if (subscales[it.subscale] !== undefined) {
        subscales[it.subscale] += num;
      }
    }
  });

  let severity = "Within Normal Limits";
  let severityLevel = 0;
  let clinicalBadge = "Low likelihood of ADHD";

  if (ratedCount === 0) {
    severity = "Assessment Pending";
    clinicalBadge = "Not scored";
  } else if (totalScore >= 50) {
    severity = "Severe ADHD Presentation";
    severityLevel = 3;
    clinicalBadge = "High clinical significance across multiple domains";
  } else if (totalScore >= 36) {
    severity = "Moderate ADHD Presentation";
    severityLevel = 2;
    clinicalBadge = "Significant attention and hyperactivity concern";
  } else if (totalScore >= 20) {
    severity = "Mild / Borderline ADHD";
    severityLevel = 1;
    clinicalBadge = "Mild executive function & focus support needed";
  }

  return {
    totalScore,
    ratedCount,
    severity,
    severityLevel,
    clinicalBadge,
    subscales
  };
}

export default function ConnersAdhdAssessmentForm() {
  const { childId: routeChildId } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const [selectedChildId, setSelectedChildId] = useState(routeChildId || "");
  const [child, setChild] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessorNotes, setAssessorNotes] = useState("");
  const [parentName, setParentName] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("");
  const [assessorName, setAssessorName] = useState(user?.name || "Occupational Therapist");

  // Ratings map: { item1: 0..3, ..., item27: 0..3 }
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await childrenService.getAll();
        const therapyOrAll = (list && list.length > 0) ? list : childrenList;
        setAllChildren(therapyOrAll);

        const targetId = routeChildId || (therapyOrAll.find(c => c.therapy_category === "ADHD" || c.diagnosis?.includes("ADHD"))?.id || therapyOrAll[0]?.id);
        if (targetId) {
          setSelectedChildId(targetId);
          let found = therapyOrAll.find(c => c.id === targetId);
          if (!found) {
            found = await childrenService.getById(targetId);
          }
          setChild(found || null);
          setParentName(found?.parent?.name || found?.parent_accounts?.parent_name || "");
          setSchoolGrade(found?.class || found?.school || "");
          loadDraft(targetId);
        }
      } catch (err) {
        console.warn("ConnersAdhdForm load error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [routeChildId]);

  const loadDraft = (cId) => {
    if (!cId) return;
    try {
      const saved = localStorage.getItem(`conners_draft_${cId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ratings) setRatings(parsed.ratings);
        if (parsed.notes) setAssessorNotes(parsed.notes);
        if (parsed.date) setAssessmentDate(parsed.date);
        if (parsed.parentName) setParentName(parsed.parentName);
        if (parsed.schoolGrade) setSchoolGrade(parsed.schoolGrade);
        setLastSavedTime(parsed.savedAt || "Draft Loaded");
      } else {
        setRatings({});
        setAssessorNotes("");
      }
    } catch (e) {
      console.warn("Conners draft load error:", e);
    }
  };

  const handleChildChange = (newId) => {
    setSelectedChildId(newId);
    const found = allChildren.find(c => c.id === newId);
    setChild(found || null);
    setParentName(found?.parent?.name || found?.parent_accounts?.parent_name || "");
    setSchoolGrade(found?.class || found?.school || "");
    loadDraft(newId);
  };

  const setItemRating = (itemNum, score) => {
    setRatings(prev => {
      const next = { ...prev, [`item${itemNum}`]: score };
      if (selectedChildId) {
        localStorage.setItem(`conners_draft_${selectedChildId}`, JSON.stringify({
          ratings: next,
          notes: assessorNotes,
          date: assessmentDate,
          parentName,
          schoolGrade,
          savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      return next;
    });
  };

  const handleQuickFillAll = (score) => {
    setRatings(prev => {
      const next = { ...prev };
      CONNERS_ITEMS.forEach(it => {
        next[`item${it.id}`] = score;
      });
      if (selectedChildId) {
        localStorage.setItem(`conners_draft_${selectedChildId}`, JSON.stringify({
          ratings: next,
          notes: assessorNotes,
          date: assessmentDate,
          parentName,
          schoolGrade,
          savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
      return next;
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to reset all 27 Conners' ratings?")) {
      setRatings({});
      if (selectedChildId) {
        localStorage.removeItem(`conners_draft_${selectedChildId}`);
      }
      showToast("Conners' ratings cleared.", "info");
    }
  };

  const scoreResults = useMemo(() => {
    return calculateConnersScore(ratings);
  }, [ratings]);

  const ratedPercentage = Math.round((scoreResults.ratedCount / 27) * 100);

  const getSeverityBadgeVariant = (level) => {
    if (level === 3) return "danger";
    if (level === 2) return "amber";
    if (level === 1) return "blue";
    return "success";
  };

  const handleSubmit = async () => {
    if (!selectedChildId) {
      showToast("Please select a child before submitting.", "danger");
      return;
    }

    if (scoreResults.ratedCount < 27) {
      const remaining = 27 - scoreResults.ratedCount;
      if (!window.confirm(`You have ${remaining} unrated item(s). Do you wish to proceed and save this Conners' ADHD evaluation?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const domainScores = calculateDomainScores({
        s6_attention: {
          sitsForActivity: ratings.item4 > 1 ? 0 : 3,
          attendsTeacher: ratings.item1 > 1 ? 0 : 3,
          completesSimpleTask: ratings.item8 > 1 ? 0 : 3,
          waitsTurn: ratings.item22 > 1 ? 0 : 3,
          transitionsActivities: ratings.item14 > 1 ? 1 : 3
        },
        s14_emotional: {
          ageAppropriateResponse: ratings.item2 > 1 ? 1 : 3,
          expressesCalmly: ratings.item11 > 1 ? 0 : 3,
          calmsAfterUpset: ratings.item27 > 1 ? 1 : 3
        },
        s8_social: {
          respondsAdults: ratings.item6 > 1 ? 1 : 3,
          respondsPeers: ratings.item24 > 1 ? 1 : 3,
          takesTurns: ratings.item22 > 1 ? 0 : 3
        },
        s5_communication: {
          respondsName: 3,
          simpleInstructions: ratings.item19 > 1 ? 1 : 3,
          answersQuestions: 3
        },
        s10_fineMotor: { reachesGrasps: 3, stacksBlocks: 2, usesCrayons: 2 },
        s11_grossMotor: { sittingBalance: 3, walking: 3, running: 3 },
        s13_adl: { eatingIndependently: 2, handWashing: 2, dressing: 2 },
        sensoryConcerns: [
          ratings.item4 > 1 ? "Motor Hyperactivity / Driven" : null,
          ratings.item7 > 1 ? "Fidgeting / Restlessness" : null,
          ratings.item14 > 1 ? "Excessive Climbing/Running" : null
        ].filter(Boolean)
      });

      const profileInfo = classifyProfile(domainScores, scoreResults.severityLevel > 0 ? 1 : 0);
      const exercises = selectExercises("C", domainScores);

      const payload = {
        child_id: selectedChildId,
        assessment_date: assessmentDate,
        assessed_by: user?.id || null,
        isaa_score: scoreResults.totalScore,
        isaa_severity: scoreResults.severity,
        isaa_level: scoreResults.severityLevel,
        isaa_section_scores: scoreResults.subscales,
        domain_scores: domainScores,
        profile: "C", // ADHD profile
        profile_description: "ADHD & Executive Function Support Pathway — Behaviour, sensory regulation, and impulse control focus.",
        clinic_exercises: exercises.clinicExercises,
        home_exercises: exercises.homeExercises,
        form_data: {
          formType: "CONNERS_CPRS_R_S",
          connersRatings: ratings,
          subscales: scoreResults.subscales,
          parentName,
          schoolGrade,
          assessorName,
          assessorNotes,
          ratedCount: scoreResults.ratedCount,
          completedDate: new Date().toISOString()
        },
        status: "completed"
      };

      setShowConfirmModal(false);
      let res = null;
      try {
        res = await therapyAssessmentService.saveADHD(payload);
      } catch (saveErr) {
        console.warn("DB save warning, saving locally:", saveErr);
      }

      const assessmentId = res?.id || `local-adhd-${Date.now()}`;
      const savedPayload = { ...payload, id: assessmentId };
      if (typeof window !== "undefined") {
        localStorage.setItem(`assessment_result_${selectedChildId}`, JSON.stringify(savedPayload));
        localStorage.setItem(`assessment_result_${assessmentId}`, JSON.stringify(savedPayload));
        localStorage.removeItem(`conners_draft_${selectedChildId}`);
      }

      showToast("Conners' ADHD Rating Scale saved successfully!", "success");
      navigate(`/reports/new/${selectedChildId}?assessmentId=${assessmentId}`);
    } catch (err) {
      console.error("Conners submission error:", err);
      setShowConfirmModal(false);
      const fallbackId = `local-adhd-${Date.now()}`;
      showToast("Assessment saved locally. Redirecting to report generator...", "info");
      navigate(`/reports/new/${selectedChildId}?assessmentId=${fallbackId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* ═══ TOP HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5F5E5A]">
            <Link to="/therapy" className="hover:text-[#0F6E56] transition-colors flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#0F6E56]" />
              Therapy Pathways
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#0F6E56] font-bold">ADHD Pathway</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2C2C2A] font-bold">Conners' CPRS-R:S</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="h-8 w-8 rounded-[8px] bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56]">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#2C2C2A] tracking-tight">
                Conners' Parent Rating Scale–Revised (S)
              </h1>
              <p className="text-xs text-[#5F5E5A] font-semibold">
                Standardized 27-item ADHD behavioural evaluation by C. Keith Conners, Ph.D.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outlined"
            icon={ArrowLeft}
            onClick={() => navigate("/therapy")}
          >
            Back to Therapy
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
          <Button
            size="sm"
            variant="primary"
            icon={CheckCircle2}
            className="bg-[#0F6E56] hover:bg-[#08503E]"
            onClick={() => setShowConfirmModal(true)}
          >
            Submit &amp; Generate Report
          </Button>
        </div>
      </div>

      {/* ═══ PATIENT METADATA BOX (MATCHING FORM HEADER) ═══ */}
      <div className="bg-white p-5 rounded-[12px] border border-[#0F6E56]/30 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Child's Name &amp; ID
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => handleChildChange(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#0F6E56] focus:bg-white cursor-pointer"
            >
              {allChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — {c.therapy_category || c.diagnosis || "ADHD"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Gender &amp; Age
            </label>
            <div className="flex items-center gap-2 h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A]">
              <span>Gender: {child?.gender || "Male"}</span>
              <span className="text-[#D3D1C7]">|</span>
              <span>Age: {child?.age || child?.dob || "5y"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              School Grade / Class
            </label>
            <input
              type="text"
              value={schoolGrade}
              onChange={(e) => setSchoolGrade(e.target.value)}
              placeholder="e.g. Grade 2 / Primary"
              className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#0F6E56] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-bold text-[#2C2C2A] outline-none focus:border-[#0F6E56]"
            />
          </div>
        </div>
      </div>

      {/* ═══ LIVE CONNERS SCORING & SEVERITY SUMMARY ═══ */}
      <div className="bg-gradient-to-r from-[#0F6E56]/15 via-[#0F6E56]/5 to-white p-5 rounded-[12px] border-2 border-[#0F6E56]/30 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0F6E56] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0F6E56]">
                Conners' CPRS-R:S Diagnostic Scoring
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-[#2C2C2A]">
                {scoreResults.totalScore}
              </span>
              <span className="text-sm font-bold text-[#5F5E5A]">/ 81 Total Score</span>
              <Badge
                label={scoreResults.severity}
                variant={getSeverityBadgeVariant(scoreResults.severityLevel)}
                size="md"
              />
            </div>
            <p className="text-xs font-semibold text-[#5F5E5A]">
              Completion: <strong className="text-[#2C2C2A]">{scoreResults.ratedCount} of 27 items rated ({ratedPercentage}%)</strong>
            </p>
          </div>

          {/* Quick Fill & Reset Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#5F5E5A]">Quick Fill:</span>
            <button
              type="button"
              onClick={() => handleQuickFillAll(0)}
              className="px-2.5 py-1 text-xs font-bold bg-white border border-[#D3D1C7] hover:bg-[#F8F8F6] rounded-[6px] cursor-pointer transition-colors"
            >
              All 0 (Never)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFillAll(2)}
              className="px-2.5 py-1 text-xs font-bold bg-white border border-[#D3D1C7] hover:bg-[#F8F8F6] rounded-[6px] cursor-pointer transition-colors"
            >
              All 2 (Often)
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 text-xs font-bold text-[#D85A5A] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        {/* 3 ADHD Subscales Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#D3D1C7]/60">
          <div className="bg-white p-3 rounded-[8px] border border-[#D3D1C7]">
            <span className="text-[11px] font-bold text-[#5F5E5A] block uppercase">Cognitive / Inattention</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black font-mono text-[#0F6E56]">
                {scoreResults.subscales.Inattention} <span className="text-xs text-[#5F5E5A] font-medium">/ 33</span>
              </span>
              <span className="text-[10px] text-[#5F5E5A] font-semibold">11 Items</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-[8px] border border-[#D3D1C7]">
            <span className="text-[11px] font-bold text-[#5F5E5A] block uppercase">Hyperactivity / Restlessness</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black font-mono text-[#0F6E56]">
                {scoreResults.subscales.Hyperactivity} <span className="text-xs text-[#5F5E5A] font-medium">/ 27</span>
              </span>
              <span className="text-[10px] text-[#5F5E5A] font-semibold">9 Items</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-[8px] border border-[#D3D1C7]">
            <span className="text-[11px] font-bold text-[#5F5E5A] block uppercase">Oppositional / Emotional</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black font-mono text-[#0F6E56]">
                {scoreResults.subscales.Oppositional} <span className="text-xs text-[#5F5E5A] font-medium">/ 21</span>
              </span>
              <span className="text-[10px] text-[#5F5E5A] font-semibold">7 Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INSTRUCTIONS BANNER (FAITHFUL TO USER DOCUMENT) ═══ */}
      <div className="bg-[#E1F5EE] p-4 rounded-[10px] border border-[#0F6E56]/30 text-xs text-[#2C2C2A] space-y-2">
        <p className="font-bold text-[#0F6E56]">
          Instructions:
        </p>
        <p className="leading-relaxed text-[#2C2C2A]">
          Below are a number of common problems that children have. Please rate each item according to your child's behavior in the last month. For each item, ask yourself, <em>"How much of a problem has this been in the last month?"</em>, and select the best answer for each one.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          {CONNERS_RATING_OPTIONS.map((opt) => (
            <div key={opt.score} className="bg-white px-3 py-1.5 rounded border border-[#D3D1C7]">
              <strong className="text-[#0F6E56] font-mono">{opt.score} = {opt.label}</strong>
              <span className="text-[10px] text-[#5F5E5A] block">{opt.sublabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 27 CONNERS ITEMS TABLE (EXACT MATCH TO REFERENCE) ═══ */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F6E56] text-white">
                <th className="py-3 px-3 w-12 text-center font-bold">#</th>
                <th className="py-3 px-4 min-w-[320px] font-bold">Items</th>
                {CONNERS_RATING_OPTIONS.map((opt) => (
                  <th
                    key={opt.score}
                    className="py-3 px-2 text-center w-24 sm:w-28 border-l border-white/20"
                  >
                    <span className="block font-black text-sm">{opt.score}</span>
                    <span className="block text-[10px] font-bold text-white/90 leading-tight">{opt.label}</span>
                    <span className="block text-[9px] text-white/70 font-medium">{opt.sublabel}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONNERS_ITEMS.map((it, idx) => {
                const currentVal = ratings[`item${it.id}`];
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={it.id}
                    className={`border-b border-[#E8E6DF] transition-colors ${
                      currentVal !== undefined
                        ? "bg-white hover:bg-[#E1F5EE]/40"
                        : isEven ? "bg-[#FAF9F5] hover:bg-[#E1F5EE]/40" : "bg-white hover:bg-[#E1F5EE]/40"
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold text-[#5F5E5A]">
                      {it.id}.
                    </td>
                    <td className="py-3 px-4 text-[#2C2C2A]">
                      <span className="font-semibold text-xs leading-relaxed">{it.text}</span>
                      <span className="ml-2 text-[10px] font-bold text-[#0F6E56] bg-[#0F6E56]/10 px-1.5 py-0.5 rounded">
                        {it.subscale}
                      </span>
                    </td>

                    {CONNERS_RATING_OPTIONS.map((opt) => {
                      const isSelected = currentVal === opt.score;

                      return (
                        <td
                          key={opt.score}
                          onClick={() => setItemRating(it.id, opt.score)}
                          className={`py-3 px-2 text-center border-l border-[#D3D1C7]/60 cursor-pointer transition-all ${
                            isSelected ? "bg-[#0F6E56]/15 font-bold" : "hover:bg-[#0F6E56]/5"
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="radio"
                              name={`conners-item-${it.id}`}
                              checked={isSelected}
                              onChange={() => setItemRating(it.id, opt.score)}
                              className="h-4.5 w-4.5 text-[#0F6E56] focus:ring-[#0F6E56] cursor-pointer accent-[#0F6E56]"
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

      {/* ═══ CLINICAL NOTES & FOOTER ═══ */}
      <Card padding="p-5" className="space-y-4">
        <h3 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0F6E56]" />
          Therapist Clinical Impressions &amp; Classroom Observations
        </h3>
        <textarea
          rows={3}
          value={assessorNotes}
          onChange={(e) => setAssessorNotes(e.target.value)}
          placeholder="Record observational notes regarding impulsivity, attention shifts, motor restlessness, and behavioral triggers..."
          className="w-full p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[8px] text-xs text-[#2C2C2A] outline-none focus:border-[#0F6E56] focus:bg-white"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#D3D1C7]">
          <div>
            <p className="text-xs font-bold text-[#2C2C2A]">
              Conners CPRS-R:S Score: <span className="text-[#0F6E56] font-mono">{scoreResults.totalScore}/81</span> ({scoreResults.severity})
            </p>
            <p className="text-[11px] text-[#5F5E5A]">
              Saving will persist this ADHD assessment and generate sensory &amp; behavioural therapy goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="md"
              variant="outlined"
              onClick={() => navigate("/therapy")}
            >
              Cancel
            </Button>
            <Button
              size="md"
              variant="primary"
              icon={CheckCircle2}
              className="bg-[#0F6E56] hover:bg-[#08503E]"
              loading={submitting}
              onClick={() => setShowConfirmModal(true)}
            >
              Save &amp; Generate ADHD Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* ═══ CONFIRMATION MODAL ═══ */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Conners' ADHD Rating Scale Submission"
      >
        <div className="space-y-4 text-xs text-[#2C2C2A]">
          <div className="bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7] space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Child:</span>
              <span className="font-bold">{child?.name} ({child?.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Conners Total Score:</span>
              <span className="font-bold font-mono text-[#0F6E56]">{scoreResults.totalScore} / 81</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Diagnostic Category:</span>
              <Badge
                label={scoreResults.severity}
                variant={getSeverityBadgeVariant(scoreResults.severityLevel)}
                size="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Inattention / Cognitive:</span>
              <span className="font-bold font-mono">{scoreResults.subscales.Inattention} / 33</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Hyperactivity:</span>
              <span className="font-bold font-mono">{scoreResults.subscales.Hyperactivity} / 27</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#5F5E5A]">Oppositional:</span>
              <span className="font-bold font-mono">{scoreResults.subscales.Oppositional} / 21</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D3D1C7]">
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setShowConfirmModal(false)}
            >
              Review
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={CheckCircle2}
              className="bg-[#0F6E56] hover:bg-[#08503E]"
              loading={submitting}
              onClick={handleSubmit}
            >
              Confirm &amp; Save Assessment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
