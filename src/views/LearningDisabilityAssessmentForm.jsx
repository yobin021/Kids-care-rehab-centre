"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Play,
  Timer,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  BookOpen,
  Printer,
  FileText,
  Activity,
  RotateCcw,
  Info,
  ChevronRight,
  TrendingUp,
  Brain,
  Eye,
  Headphones,
  Calculator,
  PenTool,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Save,
  HelpCircle
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { therapyAssessmentService } from "../services/therapyAssessmentService";
import { childrenService } from "../services/childrenService";
import { therapyService } from "../services/therapyService";
import { printReportWithFilename } from "../utils/printHelpers";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TEST BATTERY DATA
// ═══════════════════════════════════════════════════════════════════════════

export const VISUAL_MEMORY_ROWS = [
  {
    id: 1,
    title: "Row 1: Dog, Boy",
    items: "Dog, Boy",
    imgSrc: "/ldst/vm_row1_dog_boy.png",
    exposureSec: 2,
    exposure: "2 sec",
    norm: "2 items (Recalls both)"
  },
  {
    id: 2,
    title: "Row 2: Clock, Fish",
    items: "Clock, Fish",
    imgSrc: "/ldst/vm_row2_clock_fish.png",
    exposureSec: 2,
    exposure: "2 sec",
    norm: "2 items (Recalls both)"
  },
  {
    id: 3,
    title: "Row 3: Cow, Shoe, Tree",
    items: "Cow / Bull, Shoe, Tree",
    imgSrc: "/ldst/vm_row3_cow_shoe_tree.png",
    exposureSec: 3,
    exposure: "3 sec",
    norm: "3 items (Adequate Age 5)"
  },
  {
    id: 4,
    title: "Row 4: Rooster, Bucket, Dress, Spoon",
    items: "Rooster / Hen, Bucket, Dress, Spoon",
    imgSrc: "/ldst/vm_row4_rooster_bucket_dress_spoon.png",
    exposureSec: 4,
    exposure: "4 sec",
    norm: "4 items (Adequate Age 6+)"
  },
  {
    id: 5,
    title: "Row 5: Scissors, Cat, Glass, Comb, Bicycle",
    items: "Scissors, Cat, Glass / Tumbler, Comb, Bicycle",
    imgSrc: "/ldst/vm_row5_scissors_cat_glass_comb_bicycle.png",
    exposureSec: 5,
    exposure: "5 sec",
    norm: "5 items (Advanced Recall)"
  },
  {
    id: 6,
    title: "Supplementary Row: Car, Bucket, Ball",
    items: "Car, Bucket, Football / Ball",
    imgSrc: "/ldst/visual_memory_car_bucket_ball.png",
    exposureSec: 3,
    exposure: "3 sec",
    norm: "3 items (Trial 2 Verification)"
  }
];

export const AUDITORY_PAIRS = [
  { id: 1, w1: "pin", w2: "pen", same: false },
  { id: 2, w1: "cat", w2: "cap", same: false },
  { id: 3, w1: "fan", w2: "van", same: false },
  { id: 4, w1: "sit", w2: "set", same: false },
  { id: 5, w1: "boat", w2: "coat", same: false },
  { id: 6, w1: "ring", w2: "ring", same: true },
  { id: 7, w1: "man", w2: "men", same: false },
  { id: 8, w1: "tall", w2: "toll", same: false },
  { id: 9, w1: "bake", w2: "cake", same: false },
  { id: 10, w1: "pot", w2: "pod", same: false },
  { id: 11, w1: "pat", w2: "bat", same: false },
  { id: 12, w1: "pet", w2: "pet", same: true },
  { id: 13, w1: "tub", w2: "tug", same: false },
  { id: 14, w1: "see", w2: "she", same: false },
  { id: 15, w1: "fin", w2: "pin", same: false }
];

export const VISUAL_DISCRIM_ROWS = [
  { id: 1, content: "M   T   M   P   O", expectedOdd: "T, P, O (Non-M)", matchTarget: "M" },
  { id: 2, content: "3   2   3   5   8", expectedOdd: "2, 5, 8", matchTarget: "3" },
  { id: 3, content: "II  M   N   U   II", expectedOdd: "M, N, U", matchTarget: "II" },
  { id: 4, content: "b   D   P   b   G", expectedOdd: "D, P, G", matchTarget: "b" },
  { id: 5, content: "ME  SHE WE  HE  ME", expectedOdd: "SHE, WE, HE", matchTarget: "ME" },
  { id: 6, content: "SHIP SNIP SLIP SHIP SKIP", expectedOdd: "SNIP, SLIP, SKIP", matchTarget: "SHIP" },
  { id: 7, content: "ARE AIR FIRE ARE ART", expectedOdd: "AIR, FIRE, ART", matchTarget: "ARE" },
  { id: 8, content: "◇   △   ◇   ○   □", expectedOdd: "△, ○, □", matchTarget: "◇" }
];

export const SPELLING_COLUMNS = [
  {
    grade: "List A (Grade 2)",
    words: ["cat", "dog", "sun", "bed", "cup", "fish", "hand", "milk", "frog", "tree"]
  },
  {
    grade: "List B (Grade 3)",
    words: ["train", "clock", "brush", "green", "plant", "stamp", "sweet", "drink", "flash", "stone"]
  },
  {
    grade: "List C (Grade 4)",
    words: ["bridge", "summer", "butter", "window", "yellow", "blanket", "rabbit", "candle", "silver", "basket"]
  },
  {
    grade: "List D (Grade 5)",
    words: ["kitchen", "village", "feather", "dragon", "planet", "shadow", "silent", "journey", "doctor", "plastic"]
  },
  {
    grade: "List E (Grade 6)",
    words: ["adventure", "beautiful", "celebrate", "important", "telephone", "dangerous", "wonderful", "scientist", "hospital", "discover"]
  }
];

export const DIGIT_SPAN_FORWARD = [
  { id: 1, digits: "3 - 8", count: 2 },
  { id: 2, digits: "6 - 1 - 5", count: 3 },
  { id: 3, digits: "4 - 7 - 2 - 9", count: 4 },
  { id: 4, digits: "5 - 2 - 8 - 1 - 6", count: 5 },
  { id: 5, digits: "3 - 9 - 1 - 7 - 4 - 8", count: 6 },
  { id: 6, digits: "7 - 1 - 5 - 2 - 8 - 4 - 3", count: 7 },
  { id: 7, digits: "6 - 3 - 9 - 2 - 5 - 8 - 1 - 4", count: 8 }
];

export const DIGIT_SPAN_BACKWARD = [
  { id: 1, digits: "5 - 2", reversed: "2 - 5", count: 2 },
  { id: 2, digits: "7 - 4 - 1", reversed: "1 - 4 - 7", count: 3 },
  { id: 3, digits: "3 - 9 - 6 - 2", reversed: "2 - 6 - 9 - 3", count: 4 },
  { id: 4, digits: "8 - 1 - 5 - 3 - 7", reversed: "7 - 3 - 5 - 1 - 8", count: 5 },
  { id: 5, digits: "4 - 2 - 9 - 7 - 1 - 6", reversed: "6 - 1 - 7 - 9 - 2 - 4", count: 6 },
  { id: 6, digits: "9 - 3 - 6 - 1 - 8 - 5 - 2", reversed: "2 - 5 - 8 - 1 - 6 - 3 - 9", count: 7 }
];

export const SENTENCE_MEMORY_ITEMS = [
  { id: 1, text: "The cat drank milk.", words: 4, syllables: 4 },
  { id: 2, text: "Little birds fly high in the morning.", words: 7, syllables: 9 },
  { id: 3, text: "Mother made sweet mango pudding for our picnic yesterday.", words: 9, syllables: 16 },
  { id: 4, text: "When the school bell rang loudly, all children ran outside into the playground.", words: 13, syllables: 21 },
  { id: 5, text: "Although it was raining heavily, the brave farmer went into the green field to protect his crops.", words: 17, syllables: 26 }
];

export const PAIRED_ASSOCIATES = [
  { id: 1, p1: "Sun", p2: "Light", type: "Easy / Meaningful" },
  { id: 2, p1: "Book", p2: "Read", type: "Easy / Meaningful" },
  { id: 3, p1: "Table", p2: "Chair", type: "Easy / Meaningful" },
  { id: 4, p1: "River", p2: "Fish", type: "Easy / Meaningful" },
  { id: 5, p1: "Cloud", p2: "Stone", type: "Hard / Arbitrary" },
  { id: 6, p1: "Grass", p2: "Clock", type: "Hard / Arbitrary" }
];

export const ARITHMETIC_PROBLEMS = [
  { id: 1, q: "4 + 3", ans: "7", level: "Basic Addition" },
  { id: 2, q: "9 - 5", ans: "4", level: "Basic Subtraction" },
  { id: 3, q: "27 + 15", ans: "42", level: "2-Digit Addition (Regroup)" },
  { id: 4, q: "52 - 18", ans: "34", level: "2-Digit Subtraction (Borrow)" },
  { id: 5, q: "6 × 7", ans: "42", level: "Multiplication Table" },
  { id: 6, q: "45 ÷ 5", ans: "9", level: "Single-Digit Division" },
  { id: 7, q: "124 × 6", ans: "744", level: "Multi-Digit Multiplication" },
  { id: 8, q: "156 ÷ 4", ans: "39", level: "Long Division" },
  { id: 9, q: "1/2 + 1/4", ans: "3/4 or 0.75", level: "Fractions" },
  { id: 10, q: "Raju has 15 apples. He gives 4 to Priya and 3 to Amit. How many apples are left?", ans: "8", level: "Word Problem" }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LearningDisabilityAssessmentForm() {
  const { childId: routeChildId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("level1"); // "level1" | "level2" | "memory" | "summary"
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(routeChildId || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessModal, setSaveSuccessModal] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState("");
  const [autoSavedTime, setAutoSavedTime] = useState(null);

  // Visual Memory Stimulus Presentation Timer State
  const [presentingRow, setPresentingRow] = useState(null);
  const [presentationTimer, setPresentationTimer] = useState(0);
  const [isCovered, setIsCovered] = useState(false);
  const [fullPlateModal, setFullPlateModal] = useState(false);

  useEffect(() => {
    let interval = null;
    if (presentingRow && presentationTimer > 0 && !isCovered) {
      interval = setInterval(() => {
        setPresentationTimer((prev) => {
          if (prev <= 1) {
            setIsCovered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [presentingRow, presentationTimer, isCovered]);

  const handleStartPresentation = (row) => {
    setPresentingRow(row);
    setPresentationTimer(row.exposureSec);
    setIsCovered(false);
  };

  // Demographic / Case Info
  const [caseInfo, setCaseInfo] = useState({
    name: "",
    age: "",
    sex: "",
    classGrade: "",
    section: "",
    school: "",
    fatherOccupation: "",
    motherOccupation: "",
    dateOfAssessment: new Date().toISOString().split("T")[0],
    examiner: user?.name || "Clinical Psychologist / Special Educator"
  });

  // ════════════ LEVEL I STATE ════════════
  const [level1Data, setLevel1Data] = useState({
    // Attention
    cancellation1Time: "",
    cancellation1Correct: "",
    cancellation1Errors: "",
    cancellation2Time: "",
    cancellation2Correct: "",
    cancellation2Errors: "",
    // Visual Discrimination
    shapeMatchAnswer: "",
    shapeMatchCorrect: false,
    discrimRows: {},
    totalDiscrimErrors: "",
    // Visual Memory
    vmRow1: "",
    vmRow2: "",
    vmRow3: "",
    vmRow4: "",
    vmRow5: "",
    vmRow6: "",
    vmRow7: "",
    // Auditory Discrimination
    auditoryPairs: {},
    totalAuditoryErrors: "",
    // Language & Motor
    speechArticulation: "Normal",
    receptiveLangScore: "Adequate",
    expressiveLangScore: "Adequate",
    fineMotorGrip: "Normal Tripod",
    spatialOrientation: "Adequate",
    directionalityErrors: "None",
    preReadingScore: "",
    preWritingScore: "",
    preMathScore: "",
    level1Notes: ""
  });

  // ════════════ LEVEL II STATE ════════════
  const [level2Data, setLevel2Data] = useState({
    // Attention & Cancellation
    letterCancTime: "",
    letterCancHits: "",
    letterCancOmissions: "",
    letterCancCommissions: "",
    // Reading Passage 1
    p1ReadingTime: "",
    p1Wpm: "",
    p1Substitutions: "0",
    p1Omissions: "0",
    p1Insertions: "0",
    p1Hesitations: "0",
    p1Q1: "",
    p1Q2: "",
    p1Q3: "",
    p1Q4: "",
    p1Q5: "",
    // Reading Passage 2
    p2ReadingTime: "",
    p2Wpm: "",
    p2Errors: "0",
    p2Q1: "",
    p2Q2: "",
    p2Q3: "",
    p2Q4: "",
    p2Q5: "",
    // Spelling Test
    spellingChecked: {},
    // Arithmetic
    arithmeticAnswers: {},
    arithmeticErrors: {},
    // Written Expression
    handwritingLegibility: "Good",
    letterReversals: "None",
    spacingPunctuation: "Adequate",
    syntaxGrammar: "Adequate",
    writtenCompositionScore: "",
    level2Notes: ""
  });

  // ════════════ MEMORY BATTERY STATE ════════════
  const [memoryData, setMemoryData] = useState({
    digitSpanForwardPassed: {},
    maxForwardSpan: 0,
    digitSpanBackwardPassed: {},
    maxBackwardSpan: 0,
    sentenceMemoryAnswers: {},
    pairedAssociatesScores: { trial1: "", trial2: "", trial3: "" },
    visualSpatialScore: "",
    memoryNotes: ""
  });

  // ════════════ DIAGNOSTIC SUMMARY STATE ════════════
  const [diagnosticSummary, setDiagnosticSummary] = useState({
    dyslexiaRisk: "Pending Assessment",
    dysgraphiaRisk: "Pending Assessment",
    dyscalculiaRisk: "Pending Assessment",
    workingMemoryDeficit: "Pending Assessment",
    clinicalImpression: "",
    recommendedAccommodations: "Extra time in exams (25-30%), Multi-sensory phonics instruction, Audio-visual aids, Step-by-step math breakdown.",
    remedialGoals: ""
  });

  // ════════════ COMPUTED SCORES & SLD INDICES ════════════
  const computedScores = useMemo(() => {
    // 1. Level 1 Visual Discrimination Errors
    let l1DiscrimErrors = 0;
    let discrimAttempted = false;
    VISUAL_DISCRIM_ROWS.forEach((row) => {
      const checked = level1Data.discrimRows[`row${row.id}`];
      if (checked !== undefined && checked !== null && checked !== "") discrimAttempted = true;
      if (checked === false || checked === "incorrect") l1DiscrimErrors++;
    });
    if (level1Data.totalDiscrimErrors) {
      discrimAttempted = true;
      l1DiscrimErrors = Math.max(l1DiscrimErrors, Number(level1Data.totalDiscrimErrors) || 0);
    }

    // 2. Level 1 Auditory Discrimination Errors
    let l1AuditoryErrors = 0;
    let auditoryAttempted = false;
    AUDITORY_PAIRS.forEach((pair) => {
      const ans = level1Data.auditoryPairs[`pair${pair.id}`];
      if (ans !== undefined && ans !== null && ans !== "") {
        auditoryAttempted = true;
        const isSame = ans === "same" || ans === true;
        if (isSame !== pair.same) l1AuditoryErrors++;
      }
    });

    // 3. Level 2 Spelling Score
    let spellingCorrect = 0;
    let spellingAttempted = Object.keys(level2Data.spellingChecked || {}).length > 0;
    let spellingTotal = 50;
    SPELLING_COLUMNS.forEach((col, cIdx) => {
      col.words.forEach((w, wIdx) => {
        if (level2Data.spellingChecked[`${cIdx}_${wIdx}`]) spellingCorrect++;
      });
    });
    // Only calculate errors if spelling test was actually administered
    const spellingErrors = spellingAttempted ? Math.max(0, spellingTotal - spellingCorrect) : 0;

    // 4. Level 2 Arithmetic Score
    let arithCorrect = 0;
    let arithAttempted = Object.keys(level2Data.arithmeticAnswers || {}).length > 0;
    ARITHMETIC_PROBLEMS.forEach((prob) => {
      if (level2Data.arithmeticAnswers[`prob${prob.id}`] === "correct") arithCorrect++;
    });

    // 5. Memory Digit Span
    let maxFwd = 0;
    let fwdAttempted = Object.keys(memoryData.digitSpanForwardPassed || {}).length > 0;
    DIGIT_SPAN_FORWARD.forEach((it) => {
      if (memoryData.digitSpanForwardPassed[`fwd${it.id}`]) maxFwd = Math.max(maxFwd, it.count);
    });
    let maxBwd = 0;
    let bwdAttempted = Object.keys(memoryData.digitSpanBackwardPassed || {}).length > 0;
    DIGIT_SPAN_BACKWARD.forEach((it) => {
      if (memoryData.digitSpanBackwardPassed[`bwd${it.id}`]) maxBwd = Math.max(maxBwd, it.count);
    });

    // Sentence Memory
    const sentenceAnswers = memoryData.sentenceMemoryAnswers || {};
    const sentenceRepCount = Object.keys(sentenceAnswers).filter(k => sentenceAnswers[k] !== "").length;
    const sentenceRepStatus = sentenceRepCount >= SENTENCE_MEMORY_ITEMS.length
      ? "Sentence Repetition complete."
      : sentenceRepCount > 0
      ? `Sentence Repetition in progress (${sentenceRepCount}/${SENTENCE_MEMORY_ITEMS.length}).`
      : "Sentence Repetition not administered.";

    // Track whether any sub-tests have actually been administered
    const readingAttempted = Boolean(level2Data.p1ReadingTime || level2Data.p2ReadingTime || level2Data.p1Wpm);
    const writingAttempted = Boolean(
      level2Data.writtenCompositionScore ||
      (level1Data.fineMotorGrip && level1Data.fineMotorGrip !== "Normal Tripod") ||
      (level2Data.handwritingLegibility && level2Data.handwritingLegibility !== "Good") ||
      (level2Data.letterReversals && level2Data.letterReversals !== "None")
    );
    const memoryAttempted = fwdAttempted || bwdAttempted || sentenceRepCount > 0 || Boolean(memoryData.pairedAssociatesScores?.trial1);
    const hasAnyAdministered = discrimAttempted || auditoryAttempted || spellingAttempted || arithAttempted || readingAttempted || writingAttempted || memoryAttempted;

    // 6. Risk Scoring Indices
    let dyslexiaScore = 0;
    if (discrimAttempted && l1DiscrimErrors >= 3) dyslexiaScore += 2;
    if (auditoryAttempted && l1AuditoryErrors >= 4) dyslexiaScore += 2;
    if (spellingAttempted && spellingErrors >= 20) dyslexiaScore += 3;
    if (writingAttempted && (level2Data.letterReversals === "Frequent" || level2Data.letterReversals === "Moderate")) dyslexiaScore += 2;

    let dysgraphiaScore = 0;
    if (writingAttempted && (level1Data.fineMotorGrip.includes("Poor") || level1Data.fineMotorGrip.includes("Immature"))) dysgraphiaScore += 2;
    if (writingAttempted && (level2Data.handwritingLegibility === "Illegible" || level2Data.handwritingLegibility === "Poor")) dysgraphiaScore += 3;
    if (spellingAttempted && spellingErrors >= 15) dysgraphiaScore += 2;

    let dyscalculiaScore = 0;
    if (arithAttempted) {
      if (arithCorrect <= 4 && (readingAttempted || spellingAttempted)) dyscalculiaScore += 4;
      else if (arithCorrect <= 6) dyscalculiaScore += 2;
    }

    let workingMemoryScore = maxFwd + maxBwd;

    // Severity labels (only provide clinical risk label if subtest was administered)
    const getRiskLabel = (score, isAttempted) => {
      if (!isAttempted) return "Pending Assessment (Not Administered)";
      if (score >= 5) return "High Clinical Risk (Significant Deficit)";
      if (score >= 3) return "Moderate Risk (Needs Targeted Remediation)";
      if (score >= 2) return "Mild Risk (Monitor & Provide Scaffolding)";
      return "Within Normal Limits (Low Risk)";
    };

    const dyslexiaRiskLabel = getRiskLabel(dyslexiaScore, discrimAttempted || auditoryAttempted || spellingAttempted || readingAttempted);
    const dysgraphiaRiskLabel = getRiskLabel(dysgraphiaScore, writingAttempted || spellingAttempted);
    const dyscalculiaRiskLabel = getRiskLabel(dyscalculiaScore, arithAttempted);
    const memoryRiskLabel = memoryAttempted
      ? (workingMemoryScore < 5 ? "Significant Deficit" : workingMemoryScore < 8 ? "Mild Vulnerability" : "Adequate Span")
      : "Pending Assessment (Not Administered)";

    return {
      l1DiscrimErrors,
      l1AuditoryErrors,
      spellingCorrect,
      spellingErrors,
      arithCorrect,
      maxFwd,
      maxBwd,
      totalDigitSpan: maxFwd + maxBwd,
      dyslexiaRiskLabel,
      dysgraphiaRiskLabel,
      dyscalculiaRiskLabel,
      memoryRiskLabel,
      sentenceRepStatus,
      dyslexiaScore,
      dysgraphiaScore,
      dyscalculiaScore,
      workingMemoryScore,
      hasAnyAdministered
    };
  }, [level1Data, level2Data, memoryData]);

  // Sync route param childId if available
  useEffect(() => {
    if (routeChildId) {
      setSelectedChildId(routeChildId);
    }
  }, [routeChildId]);

  // Load Children for quick selection
  useEffect(() => {
    async function loadKids() {
      try {
        const list = await childrenService.getAll();
        setChildrenList(list || []);
      } catch (e) {
        console.warn("Child list load notice:", e.message);
      }
    }
    loadKids();
  }, []);

  // Pre-fill selected child data if available & check for existing saved assessment in DB
  useEffect(() => {
    if (!selectedChildId) return;
    const found = childrenList.find((c) => c.id === selectedChildId);
    if (found) {
      setCaseInfo((prev) => ({
        ...prev,
        name: found.name || prev.name,
        age: found.age ? String(found.age) : prev.age,
        sex: found.gender || prev.sex,
        school: found.school || prev.school,
        classGrade: found.grade || found.class || prev.classGrade,
        fatherOccupation: found.parent?.occupation || prev.fatherOccupation
      }));
    } else {
      // Direct URL route fallback: fetch child directly from DB/service
      childrenService.getById(selectedChildId).then((c) => {
        if (c) {
          setCaseInfo((prev) => ({
            ...prev,
            name: c.name || prev.name,
            age: c.age ? String(c.age) : prev.age,
            sex: c.gender || prev.sex,
            school: c.school || prev.school,
            classGrade: c.grade || c.class || prev.classGrade,
            fatherOccupation: c.parent?.occupation || c.parent_accounts?.parent_name || prev.fatherOccupation
          }));
        }
      }).catch(() => {});
    }

    // Check database first: if a completed assessment exists in the DB, load it; otherwise clean stale local data
    async function checkDbAssessment() {
      try {
        const records = await therapyAssessmentService.getByChildId(selectedChildId, 'learning_disability');
        if (Array.isArray(records) && records.length > 0) {
          const latest = records[0];
          setSavedAssessmentId(latest.id);
          if (latest.form_data) {
            if (latest.form_data.caseInfo) setCaseInfo(latest.form_data.caseInfo);
            if (latest.form_data.level1Data) setLevel1Data(latest.form_data.level1Data);
            if (latest.form_data.level2Data) setLevel2Data(latest.form_data.level2Data);
            if (latest.form_data.memoryData) setMemoryData(latest.form_data.memoryData);
            if (latest.form_data.diagnosticSummary) setDiagnosticSummary(latest.form_data.diagnosticSummary);
          }
          return;
        }
      } catch (e) {
        console.warn("Check DB assessment notice:", e.message);
      }

      // If no DB assessment, child has NOT completed assessment
      setSavedAssessmentId("");
      if (typeof window !== "undefined") {
        localStorage.removeItem(`assessment_result_${selectedChildId}`);
      }

      // Try restore draft from localStorage only if present and legitimately administered
      const draftKey = `ldst_draft_${selectedChildId}`;
      const savedDraft = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Check if the saved draft actually contains any administered sub-test data
          const hasAnyInDraft =
            Boolean(parsed.level1Data && (
              Object.keys(parsed.level1Data.discrimRows || {}).length > 0 ||
              parsed.level1Data.totalDiscrimErrors ||
              Object.keys(parsed.level1Data.auditoryPairs || {}).length > 0 ||
              parsed.level1Data.totalAuditoryErrors ||
              (parsed.level1Data.fineMotorGrip && parsed.level1Data.fineMotorGrip !== "Normal Tripod")
            )) ||
            Boolean(parsed.level2Data && (
              Object.keys(parsed.level2Data.spellingChecked || {}).length > 0 ||
              Object.keys(parsed.level2Data.arithmeticAnswers || {}).length > 0 ||
              parsed.level2Data.p1ReadingTime ||
              parsed.level2Data.p2ReadingTime ||
              parsed.level2Data.writtenCompositionScore
            )) ||
            Boolean(parsed.memoryData && (
              Object.keys(parsed.memoryData.digitSpanForwardPassed || {}).length > 0 ||
              Object.keys(parsed.memoryData.digitSpanBackwardPassed || {}).length > 0 ||
              Object.keys(parsed.memoryData.sentenceMemoryAnswers || {}).length > 0 ||
              parsed.memoryData.pairedAssociatesScores?.trial1
            ));

          // If the draft was merely an empty template with no administered items, purge it to prevent stale state
          if (!hasAnyInDraft) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(draftKey);
            }
            return;
          }

          if (parsed.caseInfo) setCaseInfo(parsed.caseInfo);
          if (parsed.level1Data) setLevel1Data(parsed.level1Data);
          if (parsed.level2Data) setLevel2Data(parsed.level2Data);
          if (parsed.memoryData) setMemoryData(parsed.memoryData);
          if (parsed.diagnosticSummary) setDiagnosticSummary(parsed.diagnosticSummary);
          setAutoSavedTime("Restored from draft");
        } catch (e) {
          console.warn("Draft restore notice:", e.message);
        }
      }
    }

    checkDbAssessment();
  }, [selectedChildId, childrenList]);

  // Auto-save draft on changes (ONLY if at least one sub-test has actually been administered)
  useEffect(() => {
    if (!selectedChildId) return;
    // Do not auto-save an un-administered blank form as a draft
    if (!computedScores.hasAnyAdministered) return;

    const timer = setTimeout(() => {
      const draftKey = `ldst_draft_${selectedChildId}`;
      const payload = {
        caseInfo,
        level1Data,
        level2Data,
        memoryData,
        diagnosticSummary,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      const now = new Date();
      setAutoSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1200);

    return () => clearTimeout(timer);
  }, [caseInfo, level1Data, level2Data, memoryData, diagnosticSummary, selectedChildId, computedScores.hasAnyAdministered]);

  // Handle Submit / Save
  const handleSaveAssessment = async () => {
    if (!selectedChildId && !caseInfo.name) {
      alert("Please select or enter the child's name before submitting.");
      return;
    }

    try {
      setSaving(true);
      const childId = selectedChildId || `child_sld_${Date.now()}`;

      // Ensure child exists in db
      await therapyAssessmentService.ensureChildExists(childId, {
        name: caseInfo.name || "SLD Assessment Child",
        gender: caseInfo.sex || "Male",
        diagnosis: "Learning Disability (SLD)",
        profile: "SLD",
        therapy_category: "Learning Disability"
      });

      const payload = {
        child_id: childId,
        childId: childId,
        assessment_date: caseInfo.dateOfAssessment,
        status: "completed",
        form_data: {
          testName: "Learning Disability Screening Test (LDST)",
          caseInfo,
          level1Data,
          level2Data,
          memoryData,
          computedScores,
          diagnosticSummary: {
            ...diagnosticSummary,
            dyslexiaRisk: computedScores.dyslexiaRiskLabel,
            dysgraphiaRisk: computedScores.dysgraphiaRiskLabel,
            dyscalculiaRisk: computedScores.dyscalculiaRiskLabel
          }
        },
        isaa_score: computedScores.dyslexiaScore + computedScores.dyscalculiaScore + computedScores.dysgraphiaScore,
        isaa_severity: computedScores.dyslexiaRiskLabel,
        profile: "SLD",
        profile_description: `Learning Disability Screening Battery completed. Dyslexia: ${computedScores.dyslexiaRiskLabel}, Dysgraphia: ${computedScores.dysgraphiaRiskLabel}, Dyscalculia: ${computedScores.dyscalculiaRiskLabel}. Digit Span: Fwd ${computedScores.maxFwd}, Bwd ${computedScores.maxBwd}.`
      };

      let res = null;
      try {
        res = await therapyAssessmentService.saveLearningDisability(payload);
      } catch (saveErr) {
        console.warn("DB save warning, saving locally:", saveErr);
      }

      const assessmentId = res?.id || `local-sld-${Date.now()}`;
      setSavedAssessmentId(assessmentId);

      const savedPayload = { ...payload, id: assessmentId };
      if (typeof window !== "undefined") {
        localStorage.setItem(`assessment_result_${selectedChildId}`, JSON.stringify(savedPayload));
        localStorage.setItem(`assessment_result_${assessmentId}`, JSON.stringify(savedPayload));
        localStorage.removeItem(`ldst_draft_${selectedChildId}`);
      }

      setSaveSuccessModal(true);
    } catch (err) {
      console.error("Save SLD Assessment error:", err);
      const fallbackId = `local-sld-${Date.now()}`;
      setSavedAssessmentId(fallbackId);
      setSaveSuccessModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    printReportWithFilename({
      childName: caseInfo?.name,
      childId: selectedChildId,
      currentReportId: savedAssessmentId
    });
  };

  const handleResetDraft = () => {
    if (confirm("Are you sure you want to clear this assessment draft? All entered responses will be reset.")) {
      if (selectedChildId) {
        localStorage.removeItem(`ldst_draft_${selectedChildId}`);
        localStorage.removeItem(`assessment_result_${selectedChildId}`);
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-[#1f2a24] max-w-6xl mx-auto pb-24">
      {/* ════════════ TOP HEADER BAR ════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[12px] border border-[#d9e0da] shadow-xs print:hidden">
        <div className="flex items-center gap-3.5">
          <Link
            to="/therapy"
            className="h-9 w-9 rounded-[8px] bg-[#f2f5f1] hover:bg-[#e7f1ec] border border-[#d9e0da] flex items-center justify-center text-[#2f6f5e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#e7f1ec] text-[#2f6f5e] px-2 py-0.5 rounded-full border border-[#2f6f5e]/20">
                SLD Diagnostic Battery
              </span>
              <span className="text-xs text-[#4b5a52] font-semibold">Level I (5–7 yrs) &amp; Level II (8–12 yrs)</span>
            </div>
            <h1 className="text-xl font-black text-[#1f2a24] tracking-tight">
              Learning Disability Screening Test (LDST)
            </h1>
            <p className="text-xs text-[#4b5a52] font-medium">
              Diagnostic assessment battery — Attention, Perceptual, Academic &amp; Memory sub-tests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold"
            style={{
              backgroundColor: savedAssessmentId ? "#e7f1ec" : computedScores.hasAnyAdministered ? "#FEF3C7" : "#F3F4F6",
              color: savedAssessmentId ? "#0F6E56" : computedScores.hasAnyAdministered ? "#854F0B" : "#5F5E5A",
              borderColor: savedAssessmentId ? "#0F6E56" : computedScores.hasAnyAdministered ? "#854F0B" : "#D1D5DB"
            }}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                savedAssessmentId
                  ? "bg-emerald-600"
                  : computedScores.hasAnyAdministered
                  ? "bg-amber-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <span>
              {savedAssessmentId
                ? "Assessment Completed"
                : computedScores.hasAnyAdministered
                ? "Assessment In Progress"
                : "Assessment Not Started"}
            </span>
          </div>

          {autoSavedTime && (
            <span className="text-[11px] font-semibold text-[#4b5a52] bg-[#f3f6f2] px-2.5 py-1 rounded-full border border-[#d9e0da] flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#2f6f5e]" />
              {autoSavedTime}
            </span>
          )}
          <Button size="sm" variant="outlined" icon={RotateCcw} onClick={handleResetDraft}>
            Reset
          </Button>
          <Button size="sm" variant="outlined" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Save}
            className="bg-[#2f6f5e] hover:bg-[#23584a] text-white"
            onClick={handleSaveAssessment}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </div>

      {/* ════════════ CASE / STUDENT INFORMATION CARD ════════════ */}
      <Card padding="p-5" className="bg-white border-[#d9e0da] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9e0da] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#2f6f5e]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2f6f5e]">
              Student &amp; Case Demographic Profile
            </h2>
          </div>

          {childrenList.length > 0 && (
            <div className="flex items-center gap-2 print:hidden">
              <label className="text-[11px] font-bold text-[#4b5a52]">Select Student:</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="text-xs font-semibold bg-[#fbfaf6] border border-[#d9e0da] rounded-md px-2.5 py-1 text-[#1f2a24] focus:outline-none focus:border-[#2f6f5e]"
              >
                <option value="">-- Choose registered child --</option>
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) {c.therapy_category ? `· ${c.therapy_category}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={caseInfo.name}
              onChange={(e) => setCaseInfo({ ...caseInfo, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              min="3"
              max="18"
              value={caseInfo.age}
              onChange={(e) => setCaseInfo({ ...caseInfo, age: e.target.value })}
              placeholder="e.g. 7"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Gender / Sex
            </label>
            <select
              value={caseInfo.sex}
              onChange={(e) => setCaseInfo({ ...caseInfo, sex: e.target.value })}
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Class / Grade
            </label>
            <input
              type="text"
              value={caseInfo.classGrade}
              onChange={(e) => setCaseInfo({ ...caseInfo, classGrade: e.target.value })}
              placeholder="e.g. Grade 2"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Section
            </label>
            <input
              type="text"
              value={caseInfo.section}
              onChange={(e) => setCaseInfo({ ...caseInfo, section: e.target.value })}
              placeholder="e.g. A"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              School Name
            </label>
            <input
              type="text"
              value={caseInfo.school}
              onChange={(e) => setCaseInfo({ ...caseInfo, school: e.target.value })}
              placeholder="e.g. Delhi Public School"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Father's Occupation
            </label>
            <input
              type="text"
              value={caseInfo.fatherOccupation}
              onChange={(e) => setCaseInfo({ ...caseInfo, fatherOccupation: e.target.value })}
              placeholder="e.g. Engineer"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Mother's Occupation
            </label>
            <input
              type="text"
              value={caseInfo.motherOccupation}
              onChange={(e) => setCaseInfo({ ...caseInfo, motherOccupation: e.target.value })}
              placeholder="e.g. Teacher"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              value={caseInfo.dateOfAssessment}
              onChange={(e) => setCaseInfo({ ...caseInfo, dateOfAssessment: e.target.value })}
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5a52] mb-1">
              Examiner
            </label>
            <input
              type="text"
              value={caseInfo.examiner}
              onChange={(e) => setCaseInfo({ ...caseInfo, examiner: e.target.value })}
              placeholder="Examiner name"
              className="w-full bg-[#fff] border border-[#d9e0da] rounded-md px-2.5 py-1.5 font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
            />
          </div>
        </div>
      </Card>

      {/* ════════════ TAB NAVIGATION ════════════ */}
      <div className="flex items-center gap-2 border-b border-[#d9e0da] pb-1 overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("level1")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer ${
            activeTab === "level1"
              ? "bg-white border-t-2 border-x border-[#d9e0da] text-[#2f6f5e] shadow-2xs border-t-[#2f6f5e]"
              : "text-[#4b5a52] hover:text-[#1f2a24] hover:bg-[#e7f1ec]/50"
          }`}
        >
          <Eye className="h-4 w-4" />
          Level I — Younger Students (5–7 yrs)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("level2")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer ${
            activeTab === "level2"
              ? "bg-white border-t-2 border-x border-[#d9e0da] text-[#2f6f5e] shadow-2xs border-t-[#2f6f5e]"
              : "text-[#4b5a52] hover:text-[#1f2a24] hover:bg-[#e7f1ec]/50"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Level II — Older Students (8–12 yrs)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("memory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer ${
            activeTab === "memory"
              ? "bg-white border-t-2 border-x border-[#d9e0da] text-[#2f6f5e] shadow-2xs border-t-[#2f6f5e]"
              : "text-[#4b5a52] hover:text-[#1f2a24] hover:bg-[#e7f1ec]/50"
          }`}
        >
          <Brain className="h-4 w-4" />
          Test of Memory for Children
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-xs transition-all cursor-pointer ${
            activeTab === "summary"
              ? "bg-white border-t-2 border-x border-[#d9e0da] text-[#2f6f5e] shadow-2xs border-t-[#2f6f5e]"
              : "text-[#4b5a52] hover:text-[#1f2a24] hover:bg-[#e7f1ec]/50"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Diagnostic Summary &amp; SLD Profile
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. LEVEL I — YOUNGER STUDENTS (5–7 YRS) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(activeTab === "level1" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
        <div className="space-y-6">
          {/* Section: Attention */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs group" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2f6f5e]" />
                1. Attention — Colour Cancellation Sub-Test
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Time limit: 1 minute per task</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Examiner Prompt:</strong> "I am going to show you a sheet which has different coloured dots. I want you to cancel out all the black and yellow colours as fast as you can." (Time limit: 60 seconds).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Simple Cancellation */}
                <div className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-3">
                  <h4 className="font-bold text-[#2f6f5e] uppercase text-[11px] tracking-wider">
                    Task 1: Simple Colour Cancellation (One Target Colour)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Time Taken (sec)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60"
                        value={level1Data.cancellation1Time}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation1Time: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Correct Cancelled</label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={level1Data.cancellation1Correct}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation1Correct: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Errors / Missed</label>
                      <input
                        type="number"
                        placeholder="e.g. 2"
                        value={level1Data.cancellation1Errors}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation1Errors: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-rose-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Double Cancellation */}
                <div className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-3">
                  <h4 className="font-bold text-[#2f6f5e] uppercase text-[11px] tracking-wider">
                    Task 2: Double Colour Cancellation (Two Target Colours)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Time Taken (sec)</label>
                      <input
                        type="number"
                        placeholder="e.g. 60"
                        value={level1Data.cancellation2Time}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation2Time: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Correct Cancelled</label>
                      <input
                        type="number"
                        placeholder="e.g. 38"
                        value={level1Data.cancellation2Correct}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation2Correct: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4b5a52]">Errors / Missed</label>
                      <input
                        type="number"
                        placeholder="e.g. 4"
                        value={level1Data.cancellation2Errors}
                        onChange={(e) => setLevel1Data({ ...level1Data, cancellation2Errors: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-rose-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Section: Visual Discrimination */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#2f6f5e]" />
                2. Visual Discrimination &amp; Shape/Letter Matching
              </span>
              <span className="text-xs text-[#a4622a] font-semibold">
                3+ errors suggest significant visual discrimination difficulty
              </span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Prompt:</strong> "Mark the one that looks the same as the first one."
              </p>

              {/* Shape Matching Row 1 */}
              <div className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-2">
                <h4 className="font-bold text-[#2f6f5e] uppercase text-[11px]">
                  Row 1: Geometric Shape Matching
                </h4>
                <div className="flex items-center gap-3 flex-wrap py-2">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-[#2f6f5e]">Target:</span>
                    <div className="w-14 h-14 border-2 border-[#2f6f5e] bg-white rounded flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 40 40" className="w-9 h-9">
                        <circle cx="20" cy="20" r="15" fill="none" stroke="#2f6f5e" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-[#d9e0da]">|</span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-14 h-14 border border-[#d9e0da] bg-white rounded flex flex-col items-center justify-center">
                      <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <rect x="7" y="7" width="26" height="26" fill="none" stroke="#1f2a24" strokeWidth="2" />
                      </svg>
                      <span className="text-[9px] text-[#4b5a52]">1: Square</span>
                    </div>

                    <div className="w-14 h-14 border border-[#d9e0da] bg-white rounded flex flex-col items-center justify-center">
                      <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <ellipse cx="20" cy="20" rx="10" ry="16" fill="none" stroke="#1f2a24" strokeWidth="2" />
                      </svg>
                      <span className="text-[9px] text-[#4b5a52]">2: Oval</span>
                    </div>

                    <div className="w-14 h-14 border border-[#d9e0da] bg-white rounded flex flex-col items-center justify-center">
                      <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <polygon points="20,6 35,34 5,34" fill="none" stroke="#1f2a24" strokeWidth="2" />
                      </svg>
                      <span className="text-[9px] text-[#4b5a52]">3: Triangle</span>
                    </div>

                    <div className="w-14 h-14 border border-[#d9e0da] bg-white rounded flex flex-col items-center justify-center">
                      <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <circle cx="20" cy="20" r="15" fill="none" stroke="#1f2a24" strokeWidth="2" />
                      </svg>
                      <span className="text-[9px] font-bold text-emerald-700">4: Circle</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-[#4b5a52]">Child's Answer:</label>
                    <input
                      type="text"
                      placeholder="e.g. 4th (Circle)"
                      value={level1Data.shapeMatchAnswer}
                      onChange={(e) => setLevel1Data({ ...level1Data, shapeMatchAnswer: e.target.value })}
                      className="bg-white border border-[#d9e0da] rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700">
                    <input
                      type="checkbox"
                      checked={level1Data.shapeMatchCorrect}
                      onChange={(e) => setLevel1Data({ ...level1Data, shapeMatchCorrect: e.target.checked })}
                      className="rounded text-[#2f6f5e]"
                    />
                    Correct Match?
                  </label>
                </div>
              </div>

              {/* Rows 2-9 Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[#d9e0da] text-xs">
                  <thead>
                    <tr className="bg-[#f2f5f1] text-[#4b5a52] text-left">
                      <th className="p-2.5 border border-[#d9e0da] w-12 text-center">#</th>
                      <th className="p-2.5 border border-[#d9e0da]">Stimulus Row Content</th>
                      <th className="p-2.5 border border-[#d9e0da] w-48">Child's Identified Odd/Target</th>
                      <th className="p-2.5 border border-[#d9e0da] w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VISUAL_DISCRIM_ROWS.map((row) => {
                      const isCorrect = level1Data.discrimRows[`row${row.id}`] === true;
                      return (
                        <tr key={row.id} className="hover:bg-[#fbfaf6]">
                          <td className="p-2.5 border border-[#d9e0da] text-center font-bold text-[#2f6f5e]">
                            {row.id}
                          </td>
                          <td className="p-2.5 border border-[#d9e0da] font-mono text-sm tracking-wider font-bold text-[#1f2a24]">
                            {row.content}
                          </td>
                          <td className="p-2.5 border border-[#d9e0da]">
                            <input
                              type="text"
                              placeholder={`Target: ${row.matchTarget}`}
                              value={level1Data.discrimRows[`ans${row.id}`] || ""}
                              onChange={(e) =>
                                setLevel1Data({
                                  ...level1Data,
                                  discrimRows: { ...level1Data.discrimRows, [`ans${row.id}`]: e.target.value }
                                })
                              }
                              className="w-full bg-white border border-[#d9e0da] rounded px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="p-2.5 border border-[#d9e0da] text-center">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                              <input
                                type="checkbox"
                                checked={isCorrect}
                                onChange={(e) =>
                                  setLevel1Data({
                                    ...level1Data,
                                    discrimRows: { ...level1Data.discrimRows, [`row${row.id}`]: e.target.checked }
                                  })
                                }
                                className="rounded text-[#2f6f5e]"
                              />
                              {isCorrect ? (
                                <span className="text-emerald-700">Correct</span>
                              ) : (
                                <span className="text-rose-600">Error</span>
                              )}
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#fbf1e6] border-l-4 border-[#a4622a] rounded-r-md text-[#a4622a]">
                <span className="text-xs font-semibold">
                  <strong>Clinical Observation Note:</strong> Check for letter reversals (b vs d, p vs q), loses place copying from board, or difficulty recognizing partially masked figures.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs">Computed Errors:</span>
                  <span className="font-mono text-base font-black px-2 py-0.5 bg-white rounded border border-[#a4622a]">
                    {computedScores.l1DiscrimErrors}
                  </span>
                </div>
              </div>
            </div>
          </details>

          {/* Section: Visual Memory */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#2f6f5e]" />
                3. Visual Sequential Memory Sub-Test (Card 76 Stimulus Battery)
              </span>
              <span className="text-xs text-[#4b5a52] font-semibold">Adequate norm: 3 items (Age 5), 4 items (Age 6+)</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <p className="italic text-[#4b5a52]">
                  <strong>Standard Examiner Prompt:</strong> "I am going to show you a row of pictures. After I cover the pictures, tell me exactly what pictures you saw in the same order."
                </p>
                <Button
                  size="sm"
                  variant="outlined"
                  icon={ImageIcon}
                  className="bg-white text-[#2f6f5e] border-[#2f6f5e] hover:bg-[#e7f1ec] shrink-0 text-xs font-bold"
                  onClick={() => setFullPlateModal(true)}
                >
                  View Full Card 76 Plate
                </Button>
              </div>

              <div className="space-y-4">
                {VISUAL_MEMORY_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-[10px] flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[#2f6f5e]/40 transition-colors"
                  >
                    {/* Stimulus Image Strip */}
                    <div className="space-y-2 lg:w-5/12 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#2f6f5e]">{row.title}</span>
                          <span className="text-[10px] font-bold text-[#4b5a52] bg-white border border-[#d9e0da] px-1.5 py-0.5 rounded">
                            Exp: {row.exposure}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#854F0B]">{row.norm}</span>
                      </div>

                      <div className="bg-white border border-[#d9e0da] rounded-lg p-2 flex items-center justify-center min-h-[72px] shadow-2xs overflow-hidden">
                        <img
                          src={row.imgSrc}
                          alt={row.title}
                          className="h-14 sm:h-16 w-auto max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#4b5a52]">
                          Items: <strong className="text-[#1f2a24]">{row.items}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartPresentation(row)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2f6f5e] text-white hover:bg-[#23584a] text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          Present ({row.exposureSec}s Timer)
                        </button>
                      </div>
                    </div>

                    {/* Response Input */}
                    <div className="flex-1 space-y-2 border-t lg:border-t-0 lg:border-l border-[#d9e0da] pt-3 lg:pt-0 lg:pl-4">
                      <label className="block text-[11px] font-bold text-[#4b5a52]">
                        Child's Recall Response (Record items &amp; sequence order recalled):
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${row.items}`}
                        value={level1Data[`vmRow${row.id}`] || ""}
                        onChange={(e) => setLevel1Data({ ...level1Data, [`vmRow${row.id}`]: e.target.value })}
                        className="w-full bg-white border border-[#d9e0da] rounded-md px-3 py-2 text-xs font-medium text-[#1f2a24] focus:outline-none focus:ring-1 focus:ring-[#2f6f5e]"
                      />
                      <div className="flex items-center justify-between text-[11px] text-[#4b5a52]">
                        <span>Age 5 norm: 3 items recalled in any order</span>
                        <span>Age 6+ norm: 4 items in correct sequence</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>

          {/* Section: Auditory Discrimination */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-[#2f6f5e]" />
                4. Auditory Discrimination (Phonemic Word Pairs)
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">15 Standard Word Pairs</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Prompt:</strong> "Listen carefully. Tell me if these two words sound the SAME or DIFFERENT."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AUDITORY_PAIRS.map((pair) => {
                  const val = level1Data.auditoryPairs[`pair${pair.id}`];
                  const isCorrect = val !== undefined && (val === "same" ? pair.same : !pair.same);

                  return (
                    <div
                      key={pair.id}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                        val === undefined
                          ? "bg-[#fbfaf6] border-[#d9e0da]"
                          : isCorrect
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-rose-50/50 border-rose-300"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-[#4b5a52] mr-1.5">#{pair.id}</span>
                        <span className="font-bold text-sm text-[#1f2a24]">
                          {pair.w1} — {pair.w2}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setLevel1Data({
                              ...level1Data,
                              auditoryPairs: { ...level1Data.auditoryPairs, [`pair${pair.id}`]: "same" }
                            })
                          }
                          className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                            val === "same"
                              ? "bg-[#2f6f5e] text-white"
                              : "bg-white border border-[#d9e0da] text-[#4b5a52] hover:bg-[#e7f1ec]"
                          }`}
                        >
                          Same
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLevel1Data({
                              ...level1Data,
                              auditoryPairs: { ...level1Data.auditoryPairs, [`pair${pair.id}`]: "different" }
                            })
                          }
                          className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                            val === "different"
                              ? "bg-[#2f6f5e] text-white"
                              : "bg-white border border-[#d9e0da] text-[#4b5a52] hover:bg-[#e7f1ec]"
                          }`}
                        >
                          Diff
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#e7f1ec] rounded-lg text-[#2f6f5e]">
                <span className="font-semibold">Auditory Discrimination Summary:</span>
                <span className="font-bold">
                  Total Phonemic Errors: <span className="text-rose-700 font-mono text-base font-black">{computedScores.l1AuditoryErrors}</span> / 15
                </span>
              </div>
            </div>
          </details>

          {/* Section: Motor, Spatial & Pre-Academic Readiness */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-[#2f6f5e]" />
                5. Fine Motor, Visual-Motor &amp; Pre-Academic Readiness
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Clinical checklist</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Pencil Grip &amp; Hand Dominance
                  </label>
                  <select
                    value={level1Data.fineMotorGrip}
                    onChange={(e) => setLevel1Data({ ...level1Data, fineMotorGrip: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option>Normal Tripod Grip</option>
                    <option>Immature Palmar / Digital Pronate</option>
                    <option>Hyper-extended / Excessive Tight Grip</option>
                    <option>Mixed / Undetermined Dominance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Spatial Orientation &amp; Laterality
                  </label>
                  <select
                    value={level1Data.spatialOrientation}
                    onChange={(e) => setLevel1Data({ ...level1Data, spatialOrientation: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option>Adequate (Distinguishes Left/Right)</option>
                    <option>Left-Right Confusion on Self</option>
                    <option>Left-Right Confusion on Examiner</option>
                    <option>Spatial Concept Deficit (under/over/behind)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Speech &amp; Articulation
                  </label>
                  <select
                    value={level1Data.speechArticulation}
                    onChange={(e) => setLevel1Data({ ...level1Data, speechArticulation: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option>Normal Clear Speech</option>
                    <option>Mild Articulation Errors / Substitutions</option>
                    <option>Significant Slurring / Lisping</option>
                    <option>Stuttering / Dysfluency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                  Level I Qualitative Clinical Observations &amp; Behavioural Notes:
                </label>
                <textarea
                  rows={3}
                  value={level1Data.level1Notes}
                  onChange={(e) => setLevel1Data({ ...level1Data, level1Notes: e.target.value })}
                  placeholder="Record observations regarding hyperactivity, distractibility, frustration tolerance, letter formation reversals..."
                  className="w-full bg-white border border-[#d9e0da] rounded p-2.5 text-xs text-[#1f2a24]"
                />
              </div>
            </div>
          </details>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. LEVEL II — OLDER STUDENTS (8–12 YRS) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(activeTab === "level2" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
        <div className="space-y-6">
          {/* Section: Attention & Cancellation */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2f6f5e]" />
                1. Rapid Letter &amp; Symbol Cancellation (Attention &amp; Speed)
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Timed sustained attention</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Prompt:</strong> "Cancel out all instances of the letter 'b' and 'd' on this paragraph sheet as quickly and accurately as you can."
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#fbfaf6] border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Time (sec)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={level2Data.letterCancTime}
                    onChange={(e) => setLevel2Data({ ...level2Data, letterCancTime: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div className="p-3 bg-[#fbfaf6] border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Correct Hits</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={level2Data.letterCancHits}
                    onChange={(e) => setLevel2Data({ ...level2Data, letterCancHits: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                  />
                </div>
                <div className="p-3 bg-[#fbfaf6] border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Omission Errors (Missed)</label>
                  <input
                    type="number"
                    placeholder="e.g. 6"
                    value={level2Data.letterCancOmissions}
                    onChange={(e) => setLevel2Data({ ...level2Data, letterCancOmissions: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-amber-700"
                  />
                </div>
                <div className="p-3 bg-[#fbfaf6] border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Commission Errors (Wrong)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={level2Data.letterCancCommissions}
                    onChange={(e) => setLevel2Data({ ...level2Data, letterCancCommissions: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-rose-600"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Section: Reading & Comprehension */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2f6f5e]" />
                2. Graded Reading Passages &amp; Comprehension
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Reading speed, miscues &amp; comprehension</span>
            </summary>
            <div className="p-5 space-y-5 text-xs">
              {/* Passage 1 */}
              <div className="p-4 bg-[#fcfdfb] border border-[#d9e0da] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#2f6f5e] text-xs uppercase tracking-wider">
                    Graded Passage 1 (Primary Level — 46 Words)
                  </h4>
                  <span className="text-[10px] bg-[#e7f1ec] text-[#2f6f5e] font-bold px-2 py-0.5 rounded">
                    Grades 2–3 Difficulty
                  </span>
                </div>

                <div className="p-3 bg-white border border-[#d9e0da] rounded font-serif text-sm leading-relaxed text-[#1f2a24]">
                  "Raju and his faithful dog Bruno went to the village river. The water was cool and clear. Suddenly, Raju saw a tiny bird trapped in the thorn bush. Raju gently freed the bird, and it flew happily into the sky."
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#4b5a52]">Reading Time (sec)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={level2Data.p1ReadingTime}
                      onChange={(e) => setLevel2Data({ ...level2Data, p1ReadingTime: e.target.value })}
                      className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4b5a52]">Words Per Minute (WPM)</label>
                    <input
                      type="number"
                      placeholder="Calculated / WPM"
                      value={level2Data.p1Wpm}
                      onChange={(e) => setLevel2Data({ ...level2Data, p1Wpm: e.target.value })}
                      className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4b5a52]">Substitutions / Mispron.</label>
                    <input
                      type="number"
                      value={level2Data.p1Substitutions}
                      onChange={(e) => setLevel2Data({ ...level2Data, p1Substitutions: e.target.value })}
                      className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4b5a52]">Hesitations / Stalls</label>
                    <input
                      type="number"
                      value={level2Data.p1Hesitations}
                      onChange={(e) => setLevel2Data({ ...level2Data, p1Hesitations: e.target.value })}
                      className="w-full bg-white border border-[#d9e0da] rounded p-1.5 text-xs text-amber-700"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#d9e0da]">
                  <h5 className="font-bold text-[#2f6f5e] text-[11px]">Reading Comprehension Questions:</h5>
                  {[
                    { id: 1, q: "1. Who went to the river with Raju?", exp: "Bruno / His dog" },
                    { id: 2, q: "2. How was the river water described?", exp: "Cool and clear" },
                    { id: 3, q: "3. What did Raju see trapped?", exp: "A tiny bird in thorn bush" },
                    { id: 4, q: "4. What did Raju do for the bird?", exp: "Gently freed / rescued it" },
                    { id: 5, q: "5. Why did the bird fly happily? (Inferential)", exp: "It was free / unharmed" }
                  ].map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-xs py-1 border-b border-[#d9e0da]/40">
                      <span className="font-medium text-[#1f2a24]">{item.q}</span>
                      <span className="italic text-[11px] text-[#4b5a52]">Expected: {item.exp}</span>
                      <select
                        value={level2Data[`p1Q${item.id}`] || ""}
                        onChange={(e) => setLevel2Data({ ...level2Data, [`p1Q${item.id}`]: e.target.value })}
                        className="bg-white border border-[#d9e0da] rounded p-1 text-xs"
                      >
                        <option value="">Select Score</option>
                        <option value="2">2 - Complete &amp; Accurate</option>
                        <option value="1">1 - Partial Answer</option>
                        <option value="0">0 - Incorrect / No response</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* Section: Spelling Battery (5 Graded Columns) */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-[#2f6f5e]" />
                3. Graded Spelling Battery (50 Words · 5 Graded Lists)
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">
                Score: {computedScores.spellingCorrect} / 50 Correct ({computedScores.spellingErrors} Errors)
              </span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Prompt:</strong> "I will dictate words one by one. Write each word carefully on your sheet." Check the box if the child spelled the word correctly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {SPELLING_COLUMNS.map((col, cIdx) => (
                  <div key={cIdx} className="p-3 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-2">
                    <h4 className="font-bold text-[#2f6f5e] text-[11px] border-b border-[#d9e0da] pb-1">
                      {col.grade}
                    </h4>
                    <div className="space-y-1.5">
                      {col.words.map((word, wIdx) => {
                        const key = `${cIdx}_${wIdx}`;
                        const isChecked = !!level2Data.spellingChecked[key];
                        return (
                          <label
                            key={wIdx}
                            className={`flex items-center justify-between p-1 rounded cursor-pointer transition-colors ${
                              isChecked ? "bg-emerald-50 text-emerald-900 font-bold" : "hover:bg-white text-[#1f2a24]"
                            }`}
                          >
                            <span className="font-mono text-xs">
                              {wIdx + 1}. {word}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setLevel2Data({
                                  ...level2Data,
                                  spellingChecked: { ...level2Data.spellingChecked, [key]: e.target.checked }
                                })
                              }
                              className="rounded text-[#2f6f5e]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#e7f1ec] rounded-lg text-[#2f6f5e]">
                <span className="font-semibold">Spelling Mastery Quotient:</span>
                <span className="font-bold">
                  {Math.round((computedScores.spellingCorrect / 50) * 100)}% Accuracy ({computedScores.spellingCorrect}/50 correct)
                </span>
              </div>
            </div>
          </details>

          {/* Section: Arithmetic Calculation */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#2f6f5e]" />
                4. Arithmetic &amp; Mathematical Calculations (Dyscalculia Screen)
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">
                Score: {computedScores.arithCorrect} / 10 Correct
              </span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {ARITHMETIC_PROBLEMS.map((prob) => {
                  const status = level2Data.arithmeticAnswers[`prob${prob.id}`];
                  return (
                    <div
                      key={prob.id}
                      className={`p-3 rounded-lg border space-y-2 ${
                        status === "correct"
                          ? "bg-emerald-50/50 border-emerald-300"
                          : status === "incorrect"
                          ? "bg-rose-50/50 border-rose-300"
                          : "bg-[#fbfaf6] border-[#d9e0da]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#4b5a52]">#{prob.id} ({prob.level})</span>
                      </div>
                      <p className="font-mono text-base font-black text-[#1f2a24]">{prob.q}</p>
                      <p className="text-[10px] italic text-[#4b5a52]">Ans: {prob.ans}</p>

                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setLevel2Data({
                              ...level2Data,
                              arithmeticAnswers: { ...level2Data.arithmeticAnswers, [`prob${prob.id}`]: "correct" }
                            })
                          }
                          className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            status === "correct"
                              ? "bg-emerald-700 text-white"
                              : "bg-white border border-[#d9e0da] text-emerald-800"
                          }`}
                        >
                          ✓ Correct
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLevel2Data({
                              ...level2Data,
                              arithmeticAnswers: { ...level2Data.arithmeticAnswers, [`prob${prob.id}`]: "incorrect" }
                            })
                          }
                          className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                            status === "incorrect"
                              ? "bg-rose-600 text-white"
                              : "bg-white border border-[#d9e0da] text-rose-700"
                          }`}
                        >
                          ✗ Error
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>

          {/* Section: Written Expression & Reversals */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-[#2f6f5e]" />
                5. Written Expression, Letter Reversals &amp; Dysgraphia Signs
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Writing mechanics &amp; syntax</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Letter / Word Reversals
                  </label>
                  <select
                    value={level2Data.letterReversals}
                    onChange={(e) => setLevel2Data({ ...level2Data, letterReversals: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option value="None">None (No reversals)</option>
                    <option value="Mild">Mild / Occasional (b/d or p/q)</option>
                    <option value="Moderate">Moderate (Letter &amp; word was/saw, on/no)</option>
                    <option value="Frequent">Frequent / Severe Reversals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Handwriting Legibility
                  </label>
                  <select
                    value={level2Data.handwritingLegibility}
                    onChange={(e) => setLevel2Data({ ...level2Data, handwritingLegibility: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option value="Good">Good / Clear &amp; Easy to Read</option>
                    <option value="Fair">Fair / Slow but Legible</option>
                    <option value="Poor">Poor / Irregular Letter Sizes</option>
                    <option value="Illegible">Very Poor / Illegible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Spacing &amp; Punctuation
                  </label>
                  <select
                    value={level2Data.spacingPunctuation}
                    onChange={(e) => setLevel2Data({ ...level2Data, spacingPunctuation: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option value="Adequate">Adequate spacing &amp; punctuation</option>
                    <option value="Crowded">Crowded / Words run together</option>
                    <option value="NoPunctuation">Omits capitals &amp; full stops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                    Syntax &amp; Sentence Formation
                  </label>
                  <select
                    value={level2Data.syntaxGrammar}
                    onChange={(e) => setLevel2Data({ ...level2Data, syntaxGrammar: e.target.value })}
                    className="w-full bg-white border border-[#d9e0da] rounded p-2 text-xs font-semibold"
                  >
                    <option value="Adequate">Adequate / Age-appropriate syntax</option>
                    <option value="Fragmented">Fragmented sentences</option>
                    <option value="SevereGrammar">Significant grammatical errors</option>
                  </select>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. TEST OF MEMORY FOR CHILDREN */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(activeTab === "memory" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
        <div className="space-y-6">
          {/* Digit Span Forward & Backward */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#2f6f5e]" />
                1. Digit Span Working Memory (Forward &amp; Backward)
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">
                Span Forward: {computedScores.maxFwd} digits · Span Backward: {computedScores.maxBwd} digits
              </span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <p className="italic text-[#4b5a52] bg-[#f3f6f2] border-l-4 border-[#2f6f5e] p-3 rounded-r-md">
                <strong>Standard Prompt:</strong> Forward: "Listen carefully. I am going to say some numbers. When I stop, say them back in the exact same order." | Backward: "Now say these numbers BACKWARDS / in reverse order."
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Forward Span */}
                <div className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-2.5">
                  <h4 className="font-bold text-[#2f6f5e] text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Digit Span Forward (Auditory Recall)</span>
                    <span className="text-emerald-700 font-mono">Max: {computedScores.maxFwd}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {DIGIT_SPAN_FORWARD.map((item) => {
                      const passed = !!memoryData.digitSpanForwardPassed[`fwd${item.id}`];
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white border border-[#d9e0da] rounded">
                          <span className="font-mono text-sm font-bold text-[#1f2a24] tracking-wider">
                            {item.digits}
                          </span>
                          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={passed}
                              onChange={(e) =>
                                setMemoryData({
                                  ...memoryData,
                                  digitSpanForwardPassed: {
                                    ...memoryData.digitSpanForwardPassed,
                                    [`fwd${item.id}`]: e.target.checked
                                  }
                                })
                              }
                              className="rounded text-[#2f6f5e]"
                            />
                            {passed ? <span className="text-emerald-700">Pass</span> : <span className="text-rose-600">Fail</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Backward Span */}
                <div className="p-4 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-2.5">
                  <h4 className="font-bold text-[#2f6f5e] text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Digit Span Backward (Working Memory)</span>
                    <span className="text-emerald-700 font-mono">Max: {computedScores.maxBwd}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {DIGIT_SPAN_BACKWARD.map((item) => {
                      const passed = !!memoryData.digitSpanBackwardPassed[`bwd${item.id}`];
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white border border-[#d9e0da] rounded">
                          <div>
                            <span className="font-mono text-sm font-bold text-[#1f2a24] tracking-wider block">
                              {item.digits}
                            </span>
                            <span className="text-[10px] italic text-[#4b5a52]">Reverse: {item.reversed}</span>
                          </div>
                          <label className="flex items-center gap-1.5 font-bold cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={passed}
                              onChange={(e) =>
                                setMemoryData({
                                  ...memoryData,
                                  digitSpanBackwardPassed: {
                                    ...memoryData.digitSpanBackwardPassed,
                                    [`bwd${item.id}`]: e.target.checked
                                  }
                                })
                              }
                              className="rounded text-[#2f6f5e]"
                            />
                            {passed ? <span className="text-emerald-700">Pass</span> : <span className="text-rose-600">Fail</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Sentence Memory / Auditory Sentence Repetition */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-[#2f6f5e]" />
                2. Sentence Memory / Auditory Sentence Repetition
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Syllable span testing</span>
            </summary>
            <div className="p-5 space-y-3 text-xs">
              {SENTENCE_MEMORY_ITEMS.map((s) => (
                <div key={s.id} className="p-3.5 bg-[#fbfaf6] border border-[#d9e0da] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2f6f5e]">Sentence {s.id} ({s.words} words · {s.syllables} syllables):</span>
                    <select
                      value={memoryData.sentenceMemoryAnswers[`s${s.id}`] || ""}
                      onChange={(e) =>
                        setMemoryData({
                          ...memoryData,
                          sentenceMemoryAnswers: { ...memoryData.sentenceMemoryAnswers, [`s${s.id}`]: e.target.value }
                        })
                      }
                      className="bg-white border border-[#d9e0da] rounded px-2 py-1 text-xs font-semibold"
                    >
                      <option value="">Score</option>
                      <option value="2">2 - Exact Repetition (No error)</option>
                      <option value="1">1 - 1-2 Word Omissions/Substitutions</option>
                      <option value="0">0 - 3+ Errors / Incomplete</option>
                    </select>
                  </div>
                  <p className="text-sm font-semibold font-serif text-[#1f2a24]">"{s.text}"</p>
                </div>
              ))}
            </div>
          </details>

          {/* Paired Associates Memory */}
          <details className="bg-white border border-[#d9e0da] rounded-[10px] overflow-hidden shadow-2xs" open>
            <summary className="cursor-pointer p-4 bg-[#e7f1ec] font-bold text-sm text-[#1f2a24] flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#2f6f5e]" />
                3. Verbal Paired Associate Learning
              </span>
              <span className="text-xs text-[#2f6f5e] font-semibold">Verbal associative memory</span>
            </summary>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {PAIRED_ASSOCIATES.map((pa) => (
                  <div key={pa.id} className="p-2.5 bg-[#fbfaf6] border border-[#d9e0da] rounded text-center space-y-1">
                    <span className="text-[10px] text-[#4b5a52] block font-bold">Pair {pa.id}</span>
                    <p className="font-bold text-sm text-[#1f2a24]">{pa.p1} — {pa.p2}</p>
                    <span className="text-[9px] text-[#2f6f5e] italic">{pa.type}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Trial 1 Score (out of 6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    placeholder="e.g. 3"
                    value={memoryData.pairedAssociatesScores.trial1}
                    onChange={(e) =>
                      setMemoryData({
                        ...memoryData,
                        pairedAssociatesScores: { ...memoryData.pairedAssociatesScores, trial1: e.target.value }
                      })
                    }
                    className="w-full border border-[#d9e0da] rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div className="p-3 bg-white border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Trial 2 Score (out of 6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    placeholder="e.g. 5"
                    value={memoryData.pairedAssociatesScores.trial2}
                    onChange={(e) =>
                      setMemoryData({
                        ...memoryData,
                        pairedAssociatesScores: { ...memoryData.pairedAssociatesScores, trial2: e.target.value }
                      })
                    }
                    className="w-full border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                  />
                </div>
                <div className="p-3 bg-white border border-[#d9e0da] rounded">
                  <label className="block text-[10px] font-bold text-[#4b5a52]">Trial 3 Score (out of 6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    placeholder="e.g. 6"
                    value={memoryData.pairedAssociatesScores.trial3}
                    onChange={(e) =>
                      setMemoryData({
                        ...memoryData,
                        pairedAssociatesScores: { ...memoryData.pairedAssociatesScores, trial3: e.target.value }
                      })
                    }
                    className="w-full border border-[#d9e0da] rounded p-1.5 text-xs font-semibold text-emerald-700"
                  />
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. DIAGNOSTIC SUMMARY & SLD CLASSIFICATION PROFILE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(activeTab === "summary" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
        <div className="space-y-6">
          {/* Notification when assessment is not yet administered */}
          {!computedScores.hasAnyAdministered && (
            <div className="bg-amber-50 border border-amber-300 rounded-[12px] p-4 flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">Assessment Form Not Yet Filled</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  No LDST sub-tests have been administered yet for this child. Clinical risk indices below are marked as &ldquo;Pending Assessment&rdquo;. Administer sub-tests in Level I, Level II, or the Memory Battery to calculate objective diagnostic risk indices.
                </p>
              </div>
            </div>
          )}

          {/* Risk Classification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dyslexia */}
            <div className="p-4 bg-white border-2 border-[#185FA5]/30 rounded-[12px] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#185FA5] bg-[#185FA5]/10 px-2 py-0.5 rounded-full">
                  Reading Sub-test
                </span>
                <BookOpen className="h-4 w-4 text-[#185FA5]" />
              </div>
              <h4 className="text-sm font-black text-[#1f2a24]">Dyslexia Risk Index</h4>
              <p className="text-xs font-bold text-[#185FA5]">{computedScores.dyslexiaRiskLabel}</p>
              <p className="text-[11px] text-[#4b5a52] leading-relaxed">
                Visual discrim errors: {computedScores.l1DiscrimErrors} · Auditory errors: {computedScores.l1AuditoryErrors} · Spelling errors: {computedScores.spellingErrors}.
              </p>
            </div>

            {/* Dysgraphia */}
            <div className="p-4 bg-white border-2 border-[#2f6f5e]/30 rounded-[12px] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2f6f5e] bg-[#2f6f5e]/10 px-2 py-0.5 rounded-full">
                  Writing Sub-test
                </span>
                <PenTool className="h-4 w-4 text-[#2f6f5e]" />
              </div>
              <h4 className="text-sm font-black text-[#1f2a24]">Dysgraphia Risk Index</h4>
              <p className="text-xs font-bold text-[#2f6f5e]">{computedScores.dysgraphiaRiskLabel}</p>
              <p className="text-[11px] text-[#4b5a52] leading-relaxed">
                Grip: {level1Data.fineMotorGrip} · Legibility: {level2Data.handwritingLegibility} · Reversals: {level2Data.letterReversals}.
              </p>
            </div>

            {/* Dyscalculia */}
            <div className="p-4 bg-white border-2 border-[#854F0B]/30 rounded-[12px] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#854F0B] bg-[#854F0B]/10 px-2 py-0.5 rounded-full">
                  Math Sub-test
                </span>
                <Calculator className="h-4 w-4 text-[#854F0B]" />
              </div>
              <h4 className="text-sm font-black text-[#1f2a24]">Dyscalculia Risk Index</h4>
              <p className="text-xs font-bold text-[#854F0B]">{computedScores.dyscalculiaRiskLabel}</p>
              <p className="text-[11px] text-[#4b5a52] leading-relaxed">
                Arithmetic Accuracy: {computedScores.arithCorrect}/10 correct · Level I Math: {level1Data.preMathScore || "Normal"}.
              </p>
            </div>

            {/* Working Memory */}
            <div className="p-4 bg-white border-2 border-purple-500/30 rounded-[12px] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Memory Sub-test
                </span>
                <Brain className="h-4 w-4 text-purple-700" />
              </div>
              <h4 className="text-sm font-black text-[#1f2a24]">Working Memory Span</h4>
              <p className="text-xs font-bold text-purple-800">
                Forward: {computedScores.maxFwd} Digits | Backward: {computedScores.maxBwd} Digits ({computedScores.memoryRiskLabel})
              </p>
              <p className="text-[11px] text-[#4b5a52] leading-relaxed">
                Total Digit Capacity: {computedScores.totalDigitSpan} · {computedScores.sentenceRepStatus}
              </p>
            </div>
          </div>

          {/* Clinical Interpretation & Remedial Plan */}
          <Card padding="p-5" className="bg-white border-[#d9e0da] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#2f6f5e] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Comprehensive Clinical Impression &amp; Educational Accommodations
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                  Clinical Impression / Diagnostic Formulation:
                </label>
                <textarea
                  rows={3}
                  value={diagnosticSummary.clinicalImpression}
                  onChange={(e) => setDiagnosticSummary({ ...diagnosticSummary, clinicalImpression: e.target.value })}
                  placeholder="Summarize the child's learning profile, specific areas of strength (e.g. oral comprehension, spatial reasoning) and primary academic deficits (e.g. phonological decoding, math fact retrieval)..."
                  className="w-full bg-[#fbfaf6] border border-[#d9e0da] rounded p-2.5 text-xs text-[#1f2a24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                  Recommended School &amp; Examination Accommodations:
                </label>
                <textarea
                  rows={2}
                  value={diagnosticSummary.recommendedAccommodations}
                  onChange={(e) => setDiagnosticSummary({ ...diagnosticSummary, recommendedAccommodations: e.target.value })}
                  className="w-full bg-[#fbfaf6] border border-[#d9e0da] rounded p-2.5 text-xs text-[#1f2a24]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4b5a52] mb-1">
                  Remedial Education &amp; Targeted Therapy Goals:
                </label>
                <textarea
                  rows={2}
                  value={diagnosticSummary.remedialGoals}
                  onChange={(e) => setDiagnosticSummary({ ...diagnosticSummary, remedialGoals: e.target.value })}
                  placeholder="e.g. Structured multisensory Orton-Gillingham reading therapy, TouchMath multisensory calculation program, fine motor pencil grip adaptation..."
                  className="w-full bg-[#fbfaf6] border border-[#d9e0da] rounded p-2.5 text-xs text-[#1f2a24]"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ BOTTOM FIXED ACTION BAR ════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#d9e0da] p-3 shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2f6f5e] animate-pulse" />
            <span className="text-xs font-bold text-[#1f2a24]">
              {caseInfo.name || "Student Assessment"} · {caseInfo.age ? `${caseInfo.age} yrs` : "Age not set"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outlined" icon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Save}
              className="bg-[#2f6f5e] hover:bg-[#23584a] text-white px-5"
              onClick={handleSaveAssessment}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Assessment Report"}
            </Button>
          </div>
        </div>
      </div>

      {/* ════════════ SUCCESS MODAL ════════════ */}
      <Modal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Learning Disability Screening Saved Successfully"
        size="md"
      >
        <div className="p-4 space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1f2a24]">
              Assessment Saved &amp; Clinical Profile Updated
            </h3>
            <p className="text-xs text-[#4b5a52]">
              The screening results and SLD risk classifications have been recorded in the child's therapy profile.
            </p>
          </div>

          <div className="bg-[#fbfaf6] p-3 rounded-lg border border-[#d9e0da] text-xs text-left space-y-1.5">
            <p><strong>Child:</strong> {caseInfo.name || "N/A"}</p>
            <p><strong>Dyslexia Risk:</strong> <span className="font-bold text-[#185FA5]">{computedScores.dyslexiaRiskLabel}</span></p>
            <p><strong>Dysgraphia Risk:</strong> <span className="font-bold text-[#2f6f5e]">{computedScores.dysgraphiaRiskLabel}</span></p>
            <p><strong>Dyscalculia Risk:</strong> <span className="font-bold text-[#854F0B]">{computedScores.dyscalculiaRiskLabel}</span></p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#185FA5] hover:bg-[#124b82] text-white flex items-center gap-1.5 font-bold shadow-xs"
              onClick={() => {
                setSaveSuccessModal(false);
                navigate(`/reports/new/${selectedChildId}?assessmentId=${savedAssessmentId || ""}`);
              }}
            >
              <FileText className="h-4 w-4" />
              Generate Clinical Report
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => {
                setSaveSuccessModal(false);
                if (selectedChildId) navigate(`/children/${selectedChildId}`);
                else navigate("/therapy");
              }}
            >
              View Child Profile
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => {
                setSaveSuccessModal(false);
                navigate("/therapy");
              }}
            >
              Return to Therapy Hub
            </Button>
          </div>
        </div>
      </Modal>

      {/* ════════════ VISUAL MEMORY PRESENTATION TIMER MODAL ════════════ */}
      <Modal
        isOpen={!!presentingRow}
        onClose={() => setPresentingRow(null)}
        title={presentingRow ? `Visual Memory Presentation: ${presentingRow.title}` : "Visual Memory Stimulus"}
        size="lg"
      >
        <div className="p-5 space-y-5 text-center">
          {/* Header instructions & countdown timer */}
          <div className="flex items-center justify-between bg-[#fbfaf6] border border-[#d9e0da] p-3 rounded-lg">
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2f6f5e] block">
                Standard Stimulus Card
              </span>
              <p className="text-xs font-semibold text-[#1f2a24]">
                Target Exposure: <strong className="text-[#2f6f5e]">{presentingRow?.exposure}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4b5a52]">Timer:</span>
              <span
                className={`font-mono text-2xl font-black px-3 py-1 rounded-md border ${
                  presentationTimer > 0
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 animate-pulse"
                    : "bg-rose-50 border-rose-300 text-rose-800"
                }`}
              >
                {presentationTimer}s
              </span>
            </div>
          </div>

          {/* Stimulus card display or covered state */}
          <div className="relative bg-white border-2 border-[#d9e0da] rounded-xl p-6 min-h-[220px] flex items-center justify-center shadow-inner overflow-hidden">
            {presentingRow && !isCovered && (
              <div className="space-y-3">
                <img
                  src={presentingRow.imgSrc}
                  alt={presentingRow.title}
                  className="max-h-36 sm:max-h-44 w-auto mx-auto object-contain transition-transform duration-300 transform scale-105"
                />
                <p className="text-sm font-bold text-[#1f2a24]">{presentingRow.items}</p>
              </div>
            )}

            {isCovered && (
              <div className="space-y-3 py-6 animate-fadeIn">
                <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Eye className="h-7 w-7" />
                </div>
                <h4 className="text-base font-black text-[#1f2a24]">Time Up — Stimulus Covered</h4>
                <p className="text-xs text-[#4b5a52] max-w-sm mx-auto">
                  Ask the child: <em>"Tell me exactly what pictures you saw in the same order."</em>
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outlined"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                if (presentingRow) {
                  setPresentationTimer(presentingRow.exposureSec);
                  setIsCovered(false);
                }
              }}
            >
              Re-present Stimulus
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="bg-[#2f6f5e] hover:bg-[#23584a] text-white"
              onClick={() => setPresentingRow(null)}
            >
              Done / Record Child Response
            </Button>
          </div>
        </div>
      </Modal>

      {/* ════════════ FULL CARD 76 STIMULUS PLATE MODAL ════════════ */}
      <Modal
        isOpen={fullPlateModal}
        onClose={() => setFullPlateModal(false)}
        title="Full Visual Memory Stimulus Plate (Card 76)"
        size="xl"
      >
        <div className="p-4 space-y-4 text-center">
          <p className="text-xs text-[#4b5a52]">
            Standard clinical stimulus plate containing all 5 visual memory presentation rows (Dog/Boy, Clock/Fish, Cow/Shoe/Tree, Rooster/Bucket/Dress/Spoon, Scissors/Cat/Glass/Comb/Bicycle).
          </p>
          <div className="bg-white border border-[#d9e0da] rounded-lg p-3 max-h-[70vh] overflow-y-auto flex items-center justify-center shadow-xs">
            <img
              src="/ldst/visual_memory_plate_full.png"
              alt="Card 76 Visual Memory Plate"
              className="max-h-[65vh] w-auto object-contain"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outlined" size="sm" onClick={() => setFullPlateModal(false)}>
              Close Plate Viewer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ════════════ SAVE SUCCESS MODAL ════════════ */}
      <Modal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Assessment Saved Successfully"
        size="md"
      >
        <div className="p-5 space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#1f2a24]">
            Learning Disability Screening Assessment Saved!
          </h3>
          <p className="text-xs text-[#4b5a52]">
            The test results, computed risk labels, and diagnostic recommendations have been saved to the child&apos;s record.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              className="bg-[#2f6f5e] hover:bg-[#23584a] text-white w-full sm:w-auto"
              onClick={() => {
                setSaveSuccessModal(false);
                navigate(`/reports/new/${selectedChildId}?assessmentId=${savedAssessmentId}`);
              }}
            >
              Generate Full Therapy Report
            </Button>
            <Button
              variant="outlined"
              size="sm"
              icon={Printer}
              className="w-full sm:w-auto"
              onClick={handlePrint}
            >
              Print Assessment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
