"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Send } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { calculateISAAScore, calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";
import { RatingRow0to3, CheckboxGrid } from "../components/assessment/RatingComponents";
import { assessmentService } from "../services/assessmentService";

const SectionHeader = ({ number, title, className = "" }) => (
  <div className={`flex items-center gap-2.5 border-b border-[#D3D1C7] pb-2 mb-4 ${className}`}>
    <span className="h-6 px-2.5 bg-[#185FA5]/10 text-[#185FA5] rounded-full text-xs font-black font-mono flex items-center justify-center shrink-0">
      S{number}
    </span>
    <h3 className="text-sm sm:text-base font-bold text-[#2C2C2A]">{title}</h3>
  </div>
);

export default function AssessmentForm() {
  const { childId, id } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const targetChildId = childId || id;
  const child = childrenList.find((c) => c.id === targetChildId) || childrenList[0];

  const [activeTab, setActiveTab] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // TAB 1 — Child Details & S1 Reason for Assessment
    childName: child?.name || "",
    dob: child?.dob || child?.date_of_birth || "",
    age: child?.age || "",
    gender: child?.gender || "Male",
    udid_number: child?.udid_number || "",
    school: child?.school || "",
    class: child?.class || "",
    parentName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    phone: child?.parent?.phone || child?.parent_accounts?.phone || "",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessmentType: "Initial",
    assessedBy: user?.name || "",
    designation: user?.designation || "",
    diagnosis: child?.diagnosis || "",
    reasonForReferral: child?.primaryConcern || child?.primary_concern || "",
    mainDifficulties: [],
    difficultyOther: "",

    // TAB 2 — S2 & S3 History
    tab2_birthChips: [],
    tab2_birthComplications: "",
    tab2_difficultyChips: [],
    tab2_milestoneHead: "",
    tab2_milestoneSit: "",
    tab2_milestoneWalk: "",
    tab2_milestoneFirstWord: "",
    tab2_milestoneSentence: "",
    tab3_therapyChips: [],
    tab3_therapyDuration: "",
    tab3_previousCenter: "",
    tab3_therapyOutcome: "",

    // TAB 3 — S4 Parent Goals
    parentGoal1: "", parentGoal2: "", parentGoal3: "", parentGoal4: "", parentGoal5: "",

    // TAB 4 — S5 Communication (12 items)
    tab4_communication: {
      respondsName: 0, eyeContact: 0, simpleInstruct: 0,
      oneStep: 0, twoStep: 0, gestures: 0,
      pointsInterest: 0, expressesNeeds: 0, singleWords: 0,
      twoThreeWords: 0, initiatesConv: 0, maintainsConv: 0
    },
    tab4_summary: "",

    // TAB 5 — S6 Attention & S7 Behaviour
    tab5_attention: {
      sitsForActivity: 0, attendsTeacher: 0, completesSimpleTask: 0,
      waitsTurn: 0, respondsRedirection: 0, transitionsActivities: 0,
      worksPrompts: 0, worksIndependently: 0
    },
    tab5_attentionSummary: "",
    tab5_sittingTolerance: [],

    tab5_behaviourTable: {
      aggression: { present: false, remarks: "" },
      selfInjurious: { present: false, remarks: "" },
      temperTantrums: { present: false, remarks: "" },
      hyperactivity: { present: false, remarks: "" },
      wandering: { present: false, remarks: "" },
      destructive: { present: false, remarks: "" },
      resistanceChange: { present: false, remarks: "" },
      screaming: { present: false, remarks: "" },
      flapping: { present: false, remarks: "" },
      bodyRocking: { present: false, remarks: "" },
      pacingSpinning: { present: false, remarks: "" },
      inappropriateLaughing: { present: false, remarks: "" }
    },
    tab5_triggers: [],
    tab5_behaviourSummary: "",

    // TAB 6 — S8 Social & S9 Pre-Academic
    tab6_social: {
      smilesInteracts: 0, playsAlongside: 0, parallelPlay: 0,
      cooperativePlay: 0, sharesToys: 0, takesTurns: 0,
      showsEmpathy: 0, understandsRules: 0, makeBelievePlay: 0,
      handlesFrustration: 0
    },
    tab6_socialSummary: "",

    tab6_academic: {
      identifiesColours: 0, sortsColourShape: 0, identifiesShapes: 0,
      matchesPictures: 0, identifiesBodyParts: 0, identifiesFunction: 0,
      counts1to10: 0, identifiesNumbers: 0, identifiesCapitalLetters: 0,
      identifiesSmallLetters: 0, tracesLines: 0, copiesShapes: 0,
      writesName: 0, understandsBigSmall: 0, understandsSameDifferent: 0
    },
    tab6_academicSummary: "",

    // TAB 7 — S10 Fine Motor & S11 Gross Motor
    tab7_fineMotor: {
      reachesGrasps: 0, palmarGrasp: 0, pincerGrasp: 0,
      bilateralCoordination: 0, transfersObjects: 0, stacksBlocks: 0,
      threadsBeads: 0, usesScissors: 0, holdsPencil: 0,
      scribblesDraws: 0, turnsPages: 0, buttoning: 0, opensContainers: 0
    },
    tab7_fineMotorSummary: "",

    tab7_grossMotor: {
      headControl: 0, sittingBalance: 0, standingBalance: 0,
      walksIndependently: 0, runsWithoutFalling: 0, jumpsBothFeet: 0,
      climbsStairs: 0, kicksBall: 0, catchesBall: 0,
      hopsOneFoot: 0, balanceBeam: 0, spatialAwareness: 0
    },
    tab7_grossMotorSummary: "",

    // TAB 8 — S12 Sensory, S13 ADL, S14 Emotional
    tab8_sensoryTable: {
      tactile: { type: "normal", remarks: "" },
      auditory: { type: "normal", remarks: "" },
      visual: { type: "normal", remarks: "" },
      vestibular: { type: "normal", remarks: "" },
      proprioceptive: { type: "normal", remarks: "" },
      gustatory: { type: "normal", remarks: "" },
      olfactory: { type: "normal", remarks: "" },
      bodyAwareness: { type: "normal", remarks: "" }
    },
    tab8_sensoryConcerns: [],
    tab8_sensorySummary: "",

    tab8_adl: {
      eatingSpoon: 0, drinkingCup: 0, handWashing: 0, dryingHands: 0,
      brushingTeeth: 0, dressingUpper: 0, dressingLower: 0, wearingShoes: 0,
      undressing: 0, toileting: 0, grooming: 0, bathingAssistance: 0
    },
    tab8_adlSummary: "",

    tab8_emotional: {
      expressesEmotions: 0, calmsAdultSupport: 0, selfSoothes: 0,
      toleratesChanges: 0, expressesFrustration: 0, showsEmpathy: 0,
      handlesLosing: 0
    },
    tab8_emotionalSummary: "",

    // TAB 9 — S15 Learning Style, S16 Strengths, S17 Support Areas, S18 Present Performance
    tab9_learningStyles: [],
    tab9_learningRemarks: "",
    strength1: "", strength2: "", strength3: "", strength4: "", strength5: "",
    tab9_supportAreas: [],
    tab9_supportDetails: "",
    tab9_perfCommunication: "",
    tab9_perfAcademic: "",
    tab9_perfBehaviour: "",
    tab9_perfSocial: "",
    tab9_perfAdl: "",
    tab9_perfMotor: "",
    tab9_perfSensory: "",

    // TAB 10 — S19 Short Goals, S20 Long Goals, S21 Intervention, S22 Home Prog, S23 Review
    tab10_shortTermGoals: {
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

    tab10_longTermGoals: {
      communication: { goal: "", outcome: "", review: "" },
      behaviour: { goal: "", outcome: "", review: "" },
      learning: { goal: "", outcome: "", review: "" },
      socialSkills: { goal: "", outcome: "", review: "" },
      adl: { goal: "", outcome: "", review: "" },
      therapySupport: { goal: "", outcome: "", review: "" },
      schoolReadiness: { goal: "", outcome: "", review: "" }
    },

    tab10_interventionPlans: [],
    tab10_frequencyDuration: "",
    homeSuggestion1: "", homeSuggestion2: "", homeSuggestion3: "", homeSuggestion4: "", homeSuggestion5: "",
    firstReviewDate: "", secondReviewDate: "", thirdReviewDate: "",

    // TAB 11 — S24 Final Remarks & Sign Off
    tab11_finalRemarks: "",
    tab11_assessorName: user?.name || "",
    tab11_assessorDesignation: user?.designation || "",
    tab11_assessorSignature: "",
    tab11_assessorDate: new Date().toISOString().split("T")[0],
    tab11_parentName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    tab11_parentRelation: child?.parent?.relationship || child?.parent_accounts?.relationship || "Parent",
    tab11_parentSignature: "",
    tab11_parentDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const draftKey = `assessment_draft_${targetChildId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) setShowRestoreBanner(true);
  }, [targetChildId]);

  const handleRestoreDraft = () => {
    const draftKey = `assessment_draft_${targetChildId}`;
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
    localStorage.removeItem(`assessment_draft_${targetChildId}`);
    setShowRestoreBanner(false);
    showToast("Started fresh assessment.", "info");
  };

  const updateField = (key, val) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem(`assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const updateNested = (parentKey, childKey, val) => {
    setFormData((prev) => {
      const next = { ...prev, [parentKey]: { ...prev[parentKey], [childKey]: val } };
      localStorage.setItem(`assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const updateDeepGoal = (sectionKey, rowKey, fieldKey, val) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [rowKey]: {
            ...prev[sectionKey][rowKey],
            [fieldKey]: val
          }
        }
      };
      localStorage.setItem(`assessment_draft_${targetChildId}`, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      return next;
    });
  };

  const isaaResults = useMemo(() => calculateISAAScore(formData.isaaRatings || formData.tab4_isaa || {}), [formData]);
  const domainScores = useMemo(() => calculateDomainScores(formData), [formData]);
  const profileInfo = useMemo(() => classifyProfile(domainScores, isaaResults.severityLevel), [domainScores, isaaResults]);
  const exercises = useMemo(() => selectExercises(profileInfo.profile, domainScores), [profileInfo, domainScores]);

  const handleSubmitAssessment = async () => {
    const activeChildId = child?.id || targetChildId;
    if (!activeChildId) {
      showToast("Please select a valid child before submitting the assessment.", "danger");
      return;
    }

    setIsSubmitting(true);
    const assessmentPayload = {
      child_id: activeChildId,
      assessment_date: formData.assessmentDate || new Date().toISOString().split("T")[0],
      assessed_by: user?.id || formData.assessedBy || "Therapist",
      isaa_score: isaaResults.totalScore,
      isaa_severity: isaaResults.severity,
      isaa_level: isaaResults.severityLevel,
      isaa_section_scores: isaaResults.sectionScores,
      domain_scores: domainScores,
      profile: profileInfo.profile,
      clinic_exercises: exercises.clinicExercises,
      home_exercises: exercises.homeExercises,
      form_data: formData,
      status: "completed"
    };

    try {
      const res = await assessmentService.save(assessmentPayload);
      localStorage.removeItem(`assessment_draft_${activeChildId}`);
      localStorage.setItem(`assessment_result_${res?.id || activeChildId}`, JSON.stringify(res));
      showToast("IEP Assessment submitted and saved to database!", "success");
      navigate(`/assessment/${res?.id || activeChildId}/results`);
    } catch (err) {
      console.warn("Local submission fallback:", err.message);
      const fallbackResult = {
        id: activeChildId,
        childId: activeChildId,
        childName: child?.name || formData.childName,
        assessmentDate: formData.assessmentDate,
        assessedBy: formData.assessedBy,
        isaaScore: isaaResults.totalScore,
        isaaSeverity: isaaResults.severity,
        domainScores,
        profile: profileInfo.profile,
        formData
      };
      localStorage.removeItem(`assessment_draft_${activeChildId}`);
      localStorage.setItem(`assessment_result_${activeChildId}`, JSON.stringify(fallbackResult));
      showToast("IEP Assessment submitted successfully!", "success");
      navigate(`/assessment/${activeChildId}/results`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabsList = [
    { num: 1, name: "Child Details", sec: "1" },
    { num: 2, name: "History", sec: "2–3" },
    { num: 3, name: "Parent Goals", sec: "4" },
    { num: 4, name: "Communication", sec: "5" },
    { num: 5, name: "Attention & Behaviour", sec: "6–7" },
    { num: 6, name: "Social & Academic", sec: "8–9" },
    { num: 7, name: "Motor Skills", sec: "10–11" },
    { num: 8, name: "Sensory & ADL", sec: "12–14" },
    { num: 9, name: "Strengths & Levels", sec: "15–18" },
    { num: 10, name: "Intervention Plan", sec: "19–23" },
    { num: 11, name: "Sign Off", sec: "24" }
  ];

  const goNext = () => setActiveTab((t) => Math.min(t + 1, 11));
  const goPrev = () => setActiveTab((t) => Math.max(t - 1, 1));

  return (
    <div className="space-y-4 text-[#2C2C2A] pb-24">
      {showRestoreBanner && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-[12px] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#854F0B] shrink-0" />
            <span>Unsaved draft found for {child?.name}. Restore it?</span>
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
              <h2 className="text-base font-bold text-[#2C2C2A]">{child?.name || "New Assessment"}</h2>
              <span className="font-mono text-xs text-[#9B9A96]">{child?.id}</span>
            </div>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">Individualized Education Program (IEP) Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-[11px] font-bold text-[#3B6D11] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}</span>}
          <Button variant="outlined" size="sm" icon={Save} onClick={() => showToast("Draft saved.", "success")}>Save Draft</Button>
          <Button size="sm" icon={Send} onClick={() => setShowSubmitModal(true)}>Submit</Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-[73px] z-20 bg-white border-b border-[#D3D1C7] p-2 shadow-xs overflow-x-auto flex items-center gap-1.5">
        {tabsList.map((t) => (
          <button
            key={t.num}
            type="button"
            onClick={() => setActiveTab(t.num)}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === t.num
                ? "bg-[#185FA5] text-white shadow-xs"
                : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
              }`}
          >
            <span>{t.num}. {t.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${activeTab === t.num ? "bg-white/20 text-white" : "bg-[#EBEAE4] text-[#5F5E5A]"
              }`}>
              S{t.sec}
            </span>
          </button>
        ))}
      </div>

      {/* Rating Legend Banner */}
      <div className="bg-[#EEF4FB] border border-[#185FA5]/30 p-3 rounded-[8px] text-xs font-semibold text-[#185FA5] flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold">Rating Legend:</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span><strong>0</strong> = Not Developed</span>
          <span><strong>1</strong> = Emerging / With Full Support</span>
          <span><strong>2</strong> = With Partial Support</span>
          <span><strong>3</strong> = Independent / Age Appropriate</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-6">

        {/* ═══ TAB 1: Child Details (S1) ═══ */}
        {activeTab === 1 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">Child Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Child Name *" value={formData.childName} onChange={(e) => updateField("childName", e.target.value)} />
            <Input label="Date of Birth *" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
            <Input label="Age" value={formData.age} onChange={(e) => updateField("age", e.target.value)} />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2C2C2A]">Gender</label>
              <select value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]">
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>

            {/* CHANGE 3: UDID / Disability ID Field */}
            <Input
              label="UDID / Disability ID (if any)"
              placeholder="Enter UDID card number if available"
              value={formData.udid_number}
              onChange={(e) => updateField("udid_number", e.target.value)}
            />

            <Input label="School Name" value={formData.school} onChange={(e) => updateField("school", e.target.value)} />
            <Input label="Class / Grade" value={formData.class} onChange={(e) => updateField("class", e.target.value)} />
            <Input label="Parent Name" value={formData.parentName} onChange={(e) => updateField("parentName", e.target.value)} />
            <Input label="Parent Phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <Input label="Assessment Date" type="date" value={formData.assessmentDate} onChange={(e) => updateField("assessmentDate", e.target.value)} />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2C2C2A]">Assessment Type</label>
              <select value={formData.assessmentType} onChange={(e) => updateField("assessmentType", e.target.value)} className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]">
                <option value="Initial">Initial</option><option value="Review">Review</option><option value="Discharge">Discharge</option>
              </select>
            </div>

            <Input label="Assessed By" value={formData.assessedBy} onChange={(e) => updateField("assessedBy", e.target.value)} />
            <Input label="Designation" value={formData.designation} onChange={(e) => updateField("designation", e.target.value)} />
            <Input label="Diagnosis" value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
          </div>

          <SectionHeader number="1" title="Reason for Assessment" className="pt-4" />
          <Input
            label="Reason for referral / parent concern *"
            type="textarea"
            rows={3}
            value={formData.reasonForReferral}
            onChange={(e) => updateField("reasonForReferral", e.target.value)}
          />

          <CheckboxGrid
            label="Main areas of difficulty (check all that apply):"
            options={[
              "Speech delay", "Poor attention", "Hyperactivity", "Behaviour issues",
              "Poor social interaction", "Learning difficulty", "Sensory issues",
              "Motor difficulty", "Poor ADL skills", "School readiness concern"
            ]}
            value={formData.mainDifficulties}
            onChange={(v) => updateField("mainDifficulties", v)}
          />

          <Input
            label="Other area of difficulty"
            placeholder="Specify any other concerns..."
            value={formData.difficultyOther}
            onChange={(e) => updateField("difficultyOther", e.target.value)}
          />

          <div className="flex justify-end pt-2"><Button onClick={goNext}>Next: History (S2–3) →</Button></div>
        </>)}

        {/* ═══ TAB 2: History (S2–3) ═══ */}
        {activeTab === 2 && (<>
          <SectionHeader number="2" title="Developmental and Medical History" />
          <CheckboxGrid
            label="Birth History (check all that apply)"
            options={["Full term", "Pre-term", "Normal delivery", "C-Section", "NICU stay", "Low birth weight", "Delayed cry"]}
            value={formData.tab2_birthChips}
            onChange={(v) => updateField("tab2_birthChips", v)}
          />
          <Input label="Birth Complications (if any)" type="textarea" rows={2} value={formData.tab2_birthComplications} onChange={(e) => updateField("tab2_birthComplications", e.target.value)} />

          <CheckboxGrid
            label="Developmental Difficulties Observed"
            options={["Speech delay", "Motor delay", "Poor attention", "Sensory issues", "Social withdrawal", "Feeding issues", "Sleep problems", "Toilet training delayed"]}
            value={formData.tab2_difficultyChips}
            onChange={(v) => updateField("tab2_difficultyChips", v)}
          />

          <h4 className="text-xs font-bold text-[#2C2C2A] uppercase pt-2 border-t border-[#D3D1C7]/60">Developmental Milestones (age achieved)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Head Holding" placeholder="e.g. 3 months" value={formData.tab2_milestoneHead} onChange={(e) => updateField("tab2_milestoneHead", e.target.value)} />
            <Input label="Sitting" placeholder="e.g. 6 months" value={formData.tab2_milestoneSit} onChange={(e) => updateField("tab2_milestoneSit", e.target.value)} />
            <Input label="Walking" placeholder="e.g. 14 months" value={formData.tab2_milestoneWalk} onChange={(e) => updateField("tab2_milestoneWalk", e.target.value)} />
            <Input label="First Word" placeholder="e.g. 18 months" value={formData.tab2_milestoneFirstWord} onChange={(e) => updateField("tab2_milestoneFirstWord", e.target.value)} />
            <Input label="Sentence Formation" placeholder="e.g. 30 months" value={formData.tab2_milestoneSentence} onChange={(e) => updateField("tab2_milestoneSentence", e.target.value)} />
          </div>

          <SectionHeader number="3" title="Previous Therapy History" className="pt-4" />
          <CheckboxGrid
            label="Previous Therapies Taken"
            options={["Speech therapy", "Occupational therapy", "ABA therapy", "Sensory integration", "Behavioural therapy", "Play therapy", "Special education", "None"]}
            value={formData.tab3_therapyChips}
            onChange={(v) => updateField("tab3_therapyChips", v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Duration of Previous Therapy" placeholder="e.g. 6 months" value={formData.tab3_therapyDuration} onChange={(e) => updateField("tab3_therapyDuration", e.target.value)} />
            <Input label="Previous Centre / Hospital" value={formData.tab3_previousCenter} onChange={(e) => updateField("tab3_previousCenter", e.target.value)} />
          </div>
          <Input label="Outcome / Progress from Previous Therapy" type="textarea" rows={3} value={formData.tab3_therapyOutcome} onChange={(e) => updateField("tab3_therapyOutcome", e.target.value)} />

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Goals (S4) →</Button></div>
        </>)}

        {/* ═══ TAB 3: Goals (S4) ═══ */}
        {activeTab === 3 && (<>
          <SectionHeader number="4" title="Parent Concerns & Priority Goals" />
          <p className="text-xs text-[#5F5E5A] font-medium">Enter up to 5 priority goals identified by parents or guardians:</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <Input
                key={num}
                label={`Parent Goal ${num}`}
                placeholder={`Goal ${num} (e.g. Wants child to express basic needs verbally)`}
                value={formData[`parentGoal${num}`]}
                onChange={(e) => updateField(`parentGoal${num}`, e.target.value)}
              />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Communication (S5) →</Button></div>
        </>)}

        {/* ═══ TAB 4: Communication (S5) ═══ */}
        {activeTab === 4 && (<>
          <SectionHeader number="5" title="Communication & Language Skills" />
          <div className="space-y-2">
            {[
              { k: "respondsName", l: "Responds to name when called" },
              { k: "eyeContact", l: "Maintains eye contact during interaction" },
              { k: "simpleInstruct", l: "Responds to simple verbal instructions" },
              { k: "oneStep", l: "Follows 1-step commands" },
              { k: "twoStep", l: "Follows 2-step commands" },
              { k: "gestures", l: "Uses gestures to communicate (pointing, waving)" },
              { k: "pointsInterest", l: "Points to show interest / objects" },
              { k: "expressesNeeds", l: "Expresses needs verbally" },
              { k: "singleWords", l: "Uses single meaningful words" },
              { k: "twoThreeWords", l: "Uses 2-3 word phrases" },
              { k: "initiatesConv", l: "Initiates conversation with peers/adults" },
              { k: "maintainsConv", l: "Maintains conversation appropriately" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab4_communication[k]} onChange={(v) => updateNested("tab4_communication", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input
            label="Communication Summary & Observations"
            type="textarea"
            rows={3}
            value={formData.tab4_summary}
            onChange={(e) => updateField("tab4_summary", e.target.value)}
          />
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Attention & Behaviour (S6–7) →</Button></div>
        </>)}

        {/* ═══ TAB 5: Attention & Behaviour (S6–7) ═══ */}
        {activeTab === 5 && (<>
          {/* SECTION 6 MUST COME FIRST */}
          <SectionHeader number="6" title="Attention, Sitting Tolerance and Task Behaviour" />
          <div className="space-y-2">
            {[
              { k: "sitsForActivity", l: "Sits for activity" },
              { k: "attendsTeacher", l: "Attends to teacher / therapist" },
              { k: "completesSimpleTask", l: "Completes simple task" },
              { k: "waitsTurn", l: "Waits for turn in activity" },
              { k: "respondsRedirection", l: "Responds to redirection" },
              { k: "transitionsActivities", l: "Transitions between activities smoothly" },
              { k: "worksPrompts", l: "Works with prompts (verbal/physical)" },
              { k: "worksIndependently", l: "Works independently" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab5_attention[k]} onChange={(v) => updateNested("tab5_attention", k, v)} showRemarks={false} />
            ))}
          </div>

          <Input
            label="Attention & Task Behaviour Summary"
            type="textarea"
            rows={2}
            value={formData.tab5_attentionSummary}
            onChange={(e) => updateField("tab5_attentionSummary", e.target.value)}
          />

          <CheckboxGrid
            label="Sitting Tolerance (check all that apply):"
            options={["Less than 2 minutes", "2–5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"]}
            value={formData.tab5_sittingTolerance}
            onChange={(v) => updateField("tab5_sittingTolerance", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />

          {/* SECTION 7 COMES AFTER */}
          <SectionHeader number="7" title="Behaviour Assessment" className="pt-6" />
          <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] font-bold text-[#5F5E5A] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Behaviour Item</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Frequency / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {[
                  { k: "aggression", l: "Aggression towards others" },
                  { k: "selfInjurious", l: "Self-injurious behaviour" },
                  { k: "temperTantrums", l: "Temper tantrums" },
                  { k: "hyperactivity", l: "Hyperactivity / restlessness" },
                  { k: "wandering", l: "Wandering / running away" },
                  { k: "destructive", l: "Destructive to objects" },
                  { k: "resistanceChange", l: "Resistance to change" },
                  { k: "screaming", l: "Screaming / loud crying" },
                  { k: "flapping", l: "Repetitive hand movements / flapping" },
                  { k: "bodyRocking", l: "Body rocking" },
                  { k: "pacingSpinning", l: "Pacing / spinning" },
                  { k: "inappropriateLaughing", l: "Inappropriate laughing / giggling" }
                ].map(({ k, l }) => {
                  const item = formData.tab5_behaviourTable[k] || { present: false, remarks: "" };
                  return (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="p-3 text-[#2C2C2A]">{l}</td>
                      <td className="p-3 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.present}
                            onChange={(e) => updateDeepGoal("tab5_behaviourTable", k, "present", e.target.checked)}
                            className="h-4 w-4 rounded border-[#D3D1C7] text-[#185FA5]"
                          />
                          <span className={item.present ? "text-[#993C1D] font-bold" : "text-[#5F5E5A]"}>
                            {item.present ? "Present" : "Not Present"}
                          </span>
                        </label>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateDeepGoal("tab5_behaviourTable", k, "remarks", e.target.value)}
                          placeholder="Remarks / frequency..."
                          className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <CheckboxGrid
            label="Possible Triggers (check all that apply):"
            options={["Denied object", "Waiting", "Noise", "New place", "Task demand", "Hunger", "Fatigue", "Transition", "Unknown"]}
            value={formData.tab5_triggers}
            onChange={(v) => updateField("tab5_triggers", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />

          <Input
            label="Behaviour Summary & Intervention Notes"
            type="textarea"
            rows={3}
            value={formData.tab5_behaviourSummary}
            onChange={(e) => updateField("tab5_behaviourSummary", e.target.value)}
          />

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Social & Pre-Academic (S8–9) →</Button></div>
        </>)}

        {/* ═══ TAB 6: Social & Pre-Academic (S8–9) ═══ */}
        {activeTab === 6 && (<>
          <SectionHeader number="8" title="Social Skills and Play" />
          <div className="space-y-2">
            {[
              { k: "smilesInteracts", l: "Smiles and interacts socially" },
              { k: "playsAlongside", l: "Plays alongside peers" },
              { k: "parallelPlay", l: "Engages in parallel play" },
              { k: "cooperativePlay", l: "Engages in cooperative play" },
              { k: "sharesToys", l: "Shares toys / materials" },
              { k: "takesTurns", l: "Takes turns in play" },
              { k: "showsEmpathy", l: "Shows empathy to peers" },
              { k: "understandsRules", l: "Understands simple social rules" },
              { k: "makeBelievePlay", l: "Plays make-believe / pretend play" },
              { k: "handlesFrustration", l: "Handles frustration during play" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab6_social[k]} onChange={(v) => updateNested("tab6_social", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="Social Skills & Play Summary" type="textarea" rows={2} value={formData.tab6_socialSummary} onChange={(e) => updateField("tab6_socialSummary", e.target.value)} />

          <SectionHeader number="9" title="Pre-Academic and Academic Skills" className="pt-6" />
          <div className="space-y-2">
            {[
              { k: "identifiesColours", l: "Identifies primary colours" },
              { k: "sortsColourShape", l: "Sorts objects by colour/shape" },
              { k: "identifiesShapes", l: "Identifies basic shapes" },
              { k: "matchesPictures", l: "Matches identical pictures" },
              { k: "identifiesBodyParts", l: "Identifies body parts" },
              { k: "identifiesFunction", l: "Identifies objects by function" },
              { k: "counts1to10", l: "Counts 1 to 10" },
              { k: "identifiesNumbers", l: "Identifies numbers 1 to 10" },
              { k: "identifiesCapitalLetters", l: "Identifies capital letters" },
              { k: "identifiesSmallLetters", l: "Identifies small letters" },
              { k: "tracesLines", l: "Traces lines / patterns" },
              { k: "copiesShapes", l: "Copies basic shapes" },
              { k: "writesName", l: "Writes own name" },
              { k: "understandsBigSmall", l: "Understands big / small concepts" },
              { k: "understandsSameDifferent", l: "Understands same / different concepts" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab6_academic[k]} onChange={(v) => updateNested("tab6_academic", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="Pre-Academic & Academic Summary" type="textarea" rows={2} value={formData.tab6_academicSummary} onChange={(e) => updateField("tab6_academicSummary", e.target.value)} />

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Motor Skills (S10–11) →</Button></div>
        </>)}

        {/* ═══ TAB 7: Motor Skills (S10–11) ═══ */}
        {activeTab === 7 && (<>
          <SectionHeader number="10" title="Fine Motor Skills" />
          <div className="space-y-2">
            {[
              { k: "reachesGrasps", l: "Reaches and grasps objects" },
              { k: "palmarGrasp", l: "Palmar grasp" },
              { k: "pincerGrasp", l: "Pincer grasp" },
              { k: "bilateralCoordination", l: "Bilateral coordination" },
              { k: "transfersObjects", l: "Transfers objects hand to hand" },
              { k: "stacksBlocks", l: "Stacks 4-6 blocks" },
              { k: "threadsBeads", l: "Threads beads" },
              { k: "usesScissors", l: "Uses scissors for cutting" },
              { k: "holdsPencil", l: "Holds pencil correctly" },
              { k: "scribblesDraws", l: "Scribbles / draws lines" },
              { k: "turnsPages", l: "Turns pages of book" },
              { k: "buttoning", l: "Buttoning / unbuttoning" },
              { k: "opensContainers", l: "Opens / closes containers" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab7_fineMotor[k]} onChange={(v) => updateNested("tab7_fineMotor", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="Fine Motor Summary" type="textarea" rows={2} value={formData.tab7_fineMotorSummary} onChange={(e) => updateField("tab7_fineMotorSummary", e.target.value)} />

          <SectionHeader number="11" title="Gross Motor Skills" className="pt-6" />
          <div className="space-y-2">
            {[
              { k: "headControl", l: "Head control" },
              { k: "sittingBalance", l: "Sitting balance" },
              { k: "standingBalance", l: "Standing balance" },
              { k: "walksIndependently", l: "Walks independently" },
              { k: "runsWithoutFalling", l: "Runs without falling" },
              { k: "jumpsBothFeet", l: "Jumps with both feet" },
              { k: "climbsStairs", l: "Climbs stairs alternating feet" },
              { k: "kicksBall", l: "Kicks ball forward" },
              { k: "catchesBall", l: "Catches large ball" },
              { k: "hopsOneFoot", l: "Hops on one foot" },
              { k: "balanceBeam", l: "Balance beam walking" },
              { k: "spatialAwareness", l: "Spatial awareness" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab7_grossMotor[k]} onChange={(v) => updateNested("tab7_grossMotor", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="Gross Motor Summary" type="textarea" rows={2} value={formData.tab7_grossMotorSummary} onChange={(e) => updateField("tab7_grossMotorSummary", e.target.value)} />

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sensory & ADL (S12–14) →</Button></div>
        </>)}

        {/* ═══ TAB 8: Sensory & ADL (S12–14) ═══ */}
        {activeTab === 8 && (<>
          <SectionHeader number="12" title="Sensory Processing" />
          <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] font-bold text-[#5F5E5A] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Sensory Area</th>
                  <th className="p-3 text-center">Response Profile</th>
                  <th className="p-3">Remarks / Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {[
                  { k: "tactile", l: "Tactile (Touch)" },
                  { k: "auditory", l: "Auditory (Sound)" },
                  { k: "visual", l: "Visual (Sight)" },
                  { k: "vestibular", l: "Vestibular (Movement/Balance)" },
                  { k: "proprioceptive", l: "Proprioceptive (Body Position)" },
                  { k: "gustatory", l: "Gustatory / Oral (Taste)" },
                  { k: "olfactory", l: "Olfactory (Smell)" },
                  { k: "bodyAwareness", l: "Body Awareness" }
                ].map(({ k, l }) => {
                  const row = formData.tab8_sensoryTable[k] || { type: "normal", remarks: "" };
                  return (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="p-3 text-[#2C2C2A]">{l}</td>
                      <td className="p-3 text-center">
                        <select
                          value={row.type}
                          onChange={(e) => updateDeepGoal("tab8_sensoryTable", k, "type", e.target.value)}
                          className="h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium"
                        >
                          <option value="normal">Normal</option>
                          <option value="over">Over Responsive</option>
                          <option value="under">Under Responsive</option>
                          <option value="seeking">Sensory Seeking</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => updateDeepGoal("tab8_sensoryTable", k, "remarks", e.target.value)}
                          placeholder="Specific observations..."
                          className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <CheckboxGrid
            label="Sensory Concerns Noted (check all that apply):"
            options={[
              "Covers ears", "Avoids touch", "Toe walking", "Spins objects",
              "Hand flapping", "Chews objects", "Seeks pressure",
              "Avoids food textures", "Fear of movement", "Constant movement seeking"
            ]}
            value={formData.tab8_sensoryConcerns}
            onChange={(v) => updateField("tab8_sensoryConcerns", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />

          <Input label="Sensory Processing Summary" type="textarea" rows={2} value={formData.tab8_sensorySummary} onChange={(e) => updateField("tab8_sensorySummary", e.target.value)} />

          <SectionHeader number="13" title="ADL (Activities of Daily Living) Assessment" className="pt-6" />
          <div className="space-y-2">
            {[
              { k: "eatingSpoon", l: "Eating with spoon / hand independently" },
              { k: "drinkingCup", l: "Drinking from cup / bottle independently" },
              { k: "handWashing", l: "Washing hands independently" },
              { k: "dryingHands", l: "Drying hands" },
              { k: "brushingTeeth", l: "Brushing teeth" },
              { k: "dressingUpper", l: "Dressing upper body" },
              { k: "dressingLower", l: "Dressing lower body" },
              { k: "wearingShoes", l: "Wearing shoes / socks" },
              { k: "undressing", l: "Undressing" },
              { k: "toileting", l: "Toileting independence" },
              { k: "grooming", l: "Grooming / combing hair" },
              { k: "bathingAssistance", l: "Bathing assistance needed" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab8_adl[k]} onChange={(v) => updateNested("tab8_adl", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="ADL Summary" type="textarea" rows={2} value={formData.tab8_adlSummary} onChange={(e) => updateField("tab8_adlSummary", e.target.value)} />

          <SectionHeader number="14" title="Emotional Regulation" className="pt-6" />
          <div className="space-y-2">
            {[
              { k: "expressesEmotions", l: "Expresses basic emotions appropriately" },
              { k: "calmsAdultSupport", l: "Calms down with adult support" },
              { k: "selfSoothes", l: "Self-soothes when upset" },
              { k: "toleratesChanges", l: "Tolerates minor changes in routine" },
              { k: "expressesFrustration", l: "Expresses frustration appropriately" },
              { k: "showsEmpathy", l: "Shows empathy to others" },
              { k: "handlesLosing", l: "Handles losing / failure in games" }
            ].map(({ k, l }) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab8_emotional[k]} onChange={(v) => updateNested("tab8_emotional", k, v)} showRemarks={false} />
            ))}
          </div>
          <Input label="Emotional Regulation Summary" type="textarea" rows={2} value={formData.tab8_emotionalSummary} onChange={(e) => updateField("tab8_emotionalSummary", e.target.value)} />

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Strengths (S15–18) →</Button></div>
        </>)}

        {/* ═══ TAB 9: Strengths (S15–18) ═══ */}
        {activeTab === 9 && (<>
          <SectionHeader number="15" title="Learning Style Preferences" />
          <CheckboxGrid
            options={[
              "Visual method", "Verbal instruction", "Picture cards", "Objects / real materials",
              "Music / rhymes", "Movement-based learning", "Repetition", "Imitation",
              "Play-based learning", "Smart TV / digital learning", "One-to-one teaching", "Group activity"
            ]}
            value={formData.tab9_learningStyles}
            onChange={(v) => updateField("tab9_learningStyles", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />
          <Input label="Learning Style Remarks" type="textarea" rows={2} value={formData.tab9_learningRemarks} onChange={(e) => updateField("tab9_learningRemarks", e.target.value)} />

          <SectionHeader number="16" title="Child Strengths" className="pt-4" />
          <p className="text-xs text-[#5F5E5A] font-medium">Enter up to 5 key strengths observed:</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <Input
                key={num}
                label={`Strength ${num}`}
                placeholder={`Strength ${num} (e.g. Good visual memory, affectionate, loves music)`}
                value={formData[`strength${num}`]}
                onChange={(e) => updateField(`strength${num}`, e.target.value)}
              />
            ))}
          </div>

          <SectionHeader number="17" title="Primary Areas Requiring Support" className="pt-4" />
          <CheckboxGrid
            options={[
              "Communication", "Attention", "Behaviour", "Social skills", "Play skills",
              "Pre-academics", "Academics", "Fine motor", "Gross motor",
              "Sensory processing", "ADL skills", "Emotional regulation",
              "School readiness", "Parent guidance"
            ]}
            value={formData.tab9_supportAreas}
            onChange={(v) => updateField("tab9_supportAreas", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />
          <Input label="Support Area Details" type="textarea" rows={2} value={formData.tab9_supportDetails} onChange={(e) => updateField("tab9_supportDetails", e.target.value)} />

          <SectionHeader number="18" title="Present Level of Performance" className="pt-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Communication Level" placeholder="e.g. Uses single words to express needs" value={formData.tab9_perfCommunication} onChange={(e) => updateField("tab9_perfCommunication", e.target.value)} />
            <Input label="Academic / Pre-Academic Level" placeholder="e.g. Identifies 3 primary colours, counts to 5" value={formData.tab9_perfAcademic} onChange={(e) => updateField("tab9_perfAcademic", e.target.value)} />
            <Input label="Behaviour Level" placeholder="e.g. Tantrums when denied objects, responds to redirection" value={formData.tab9_perfBehaviour} onChange={(e) => updateField("tab9_perfBehaviour", e.target.value)} />
            <Input label="Social Skill Level" placeholder="e.g. Parallel play, needs adult encouragement" value={formData.tab9_perfSocial} onChange={(e) => updateField("tab9_perfSocial", e.target.value)} />
            <Input label="ADL Level" placeholder="e.g. Eats independently, needs assistance in dressing" value={formData.tab9_perfAdl} onChange={(e) => updateField("tab9_perfAdl", e.target.value)} />
            <Input label="Motor Skill Level" placeholder="e.g. Good gross motor, fine motor pincer grasp emerging" value={formData.tab9_perfMotor} onChange={(e) => updateField("tab9_perfMotor", e.target.value)} />
            <Input label="Sensory Level" placeholder="e.g. Auditory over-responsive, seeks vestibular input" value={formData.tab9_perfSensory} onChange={(e) => updateField("tab9_perfSensory", e.target.value)} />
          </div>

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Plan (S19–23) →</Button></div>
        </>)}

        {/* ═══ TAB 10: Plan (S19–23) ═══ */}
        {activeTab === 10 && (<>
          <SectionHeader number="19" title="Short-Term Goals (3 Months)" />
          <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] font-bold text-[#5F5E5A] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Area</th>
                  <th className="p-3">Short-Term Goal</th>
                  <th className="p-3">Strategy / Activity</th>
                  <th className="p-3">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
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
                ].map(({ k, l }) => {
                  const row = formData.tab10_shortTermGoals[k] || { goal: "", strategy: "", review: "" };
                  return (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#185FA5]">{l}</td>
                      <td className="p-2"><input type="text" value={row.goal} onChange={(e) => updateDeepGoal("tab10_shortTermGoals", k, "goal", e.target.value)} placeholder="3-month goal..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                      <td className="p-2"><input type="text" value={row.strategy} onChange={(e) => updateDeepGoal("tab10_shortTermGoals", k, "strategy", e.target.value)} placeholder="Strategy / Activity..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                      <td className="p-2"><input type="text" value={row.review} onChange={(e) => updateDeepGoal("tab10_shortTermGoals", k, "review", e.target.value)} placeholder="Review criteria..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SectionHeader number="20" title="Long-Term Goals (6 to 12 Months)" className="pt-6" />
          <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] font-bold text-[#5F5E5A] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Area</th>
                  <th className="p-3">Long-Term Goal</th>
                  <th className="p-3">Expected Outcome</th>
                  <th className="p-3">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {[
                  { k: "communication", l: "Communication" },
                  { k: "behaviour", l: "Behaviour" },
                  { k: "learning", l: "Learning / Academics" },
                  { k: "socialSkills", l: "Social Skills" },
                  { k: "adl", l: "ADL Independence" },
                  { k: "therapySupport", l: "Therapy Support" },
                  { k: "schoolReadiness", l: "School Readiness" }
                ].map(({ k, l }) => {
                  const row = formData.tab10_longTermGoals[k] || { goal: "", outcome: "", review: "" };
                  return (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#185FA5]">{l}</td>
                      <td className="p-2"><input type="text" value={row.goal} onChange={(e) => updateDeepGoal("tab10_longTermGoals", k, "goal", e.target.value)} placeholder="Long-term goal..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                      <td className="p-2"><input type="text" value={row.outcome} onChange={(e) => updateDeepGoal("tab10_longTermGoals", k, "outcome", e.target.value)} placeholder="Expected outcome..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                      <td className="p-2"><input type="text" value={row.review} onChange={(e) => updateDeepGoal("tab10_longTermGoals", k, "review", e.target.value)} placeholder="Review criteria..." className="w-full h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-xs font-medium" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <SectionHeader number="21" title="Recommended Intervention Plan" className="pt-6" />
          <CheckboxGrid
            options={[
              "Special education", "Behaviour support", "Speech and communication support",
              "Physiotherapy", "Occupational therapy", "Sensory integration activities",
              "Developmental therapy", "ADL training", "Social skill training",
              "Parent counselling", "Home programme", "Group activity", "School readiness programme"
            ]}
            value={formData.tab10_interventionPlans}
            onChange={(v) => updateField("tab10_interventionPlans", v)}
            cols="grid-cols-2 sm:grid-cols-3"
          />
          <Input label="Frequency / Duration & Schedule" type="textarea" rows={2} placeholder="e.g. 3 sessions/week, 45 mins per session" value={formData.tab10_frequencyDuration} onChange={(e) => updateField("tab10_frequencyDuration", e.target.value)} />

          <SectionHeader number="22" title="Home Programme Suggestions" className="pt-6" />
          <p className="text-xs text-[#5F5E5A] font-medium">Enter up to 5 home activity suggestions for parents:</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <Input
                key={num}
                label={`Home Suggestion ${num}`}
                placeholder={`Home Suggestion ${num} (e.g. 10 minutes of daily joint attention play using favourite toys)`}
                value={formData[`homeSuggestion${num}`]}
                onChange={(e) => updateField(`homeSuggestion${num}`, e.target.value)}
              />
            ))}
          </div>

          <SectionHeader number="23" title="Review Plan" className="pt-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="First Review Date" type="date" value={formData.firstReviewDate} onChange={(e) => updateField("firstReviewDate", e.target.value)} />
            <Input label="Second Review Date" type="date" value={formData.secondReviewDate} onChange={(e) => updateField("secondReviewDate", e.target.value)} />
            <Input label="Third Review Date" type="date" value={formData.thirdReviewDate} onChange={(e) => updateField("thirdReviewDate", e.target.value)} />
          </div>
          <div className="bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]/60 text-xs font-semibold text-[#5F5E5A] italic">
            &quot;Progress will be reviewed regularly and goals will be modified according to the child&apos;s improvement, readiness and individual needs.&quot;
          </div>

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sign Off (S24) →</Button></div>
        </>)}

        {/* ═══ TAB 11: Sign Off (S24) ═══ */}
        {activeTab === 11 && (<>
          <SectionHeader number="24" title="Final Remarks & Clinical Summary" />
          <Input
            label="Final Remarks & Clinical Summary *"
            type="textarea"
            rows={4}
            placeholder="Enter overall clinical summary, recommendations, and diagnostic observations..."
            value={formData.tab11_finalRemarks}
            onChange={(e) => updateField("tab11_finalRemarks", e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#D3D1C7]/60">
            {/* Assessor Sign Off */}
            <div className="p-4 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-3">
              <h4 className="text-xs font-extrabold text-[#185FA5] uppercase border-b border-[#D3D1C7] pb-1">Assessor / Therapist Sign-Off</h4>
              <Input label="Assessor Name *" value={formData.tab11_assessorName} onChange={(e) => updateField("tab11_assessorName", e.target.value)} />
              <Input label="Designation *" value={formData.tab11_assessorDesignation} onChange={(e) => updateField("tab11_assessorDesignation", e.target.value)} />
              <Input label="Signature (type full name)" placeholder="Digital Signature / Full Name" value={formData.tab11_assessorSignature} onChange={(e) => updateField("tab11_assessorSignature", e.target.value)} />
              <Input label="Date *" type="date" value={formData.tab11_assessorDate} onChange={(e) => updateField("tab11_assessorDate", e.target.value)} />
            </div>

            {/* Parent Sign Off */}
            <div className="p-4 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-3">
              <h4 className="text-xs font-extrabold text-[#185FA5] uppercase border-b border-[#D3D1C7] pb-1">Parent / Guardian Acknowledgement</h4>
              <Input label="Parent/Guardian Name *" value={formData.tab11_parentName} onChange={(e) => updateField("tab11_parentName", e.target.value)} />
              <Input label="Relationship *" value={formData.tab11_parentRelation} onChange={(e) => updateField("tab11_parentRelation", e.target.value)} />
              <Input label="Signature (type full name)" placeholder="Digital Signature / Full Name" value={formData.tab11_parentSignature} onChange={(e) => updateField("tab11_parentSignature", e.target.value)} />
              <Input label="Date *" type="date" value={formData.tab11_parentDate} onChange={(e) => updateField("tab11_parentDate", e.target.value)} />
            </div>
          </div>

          <div className="pt-4">
            <Button
              fullWidth
              size="lg"
              className="h-12 text-sm font-extrabold shadow-sm"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit IEP Assessment
            </Button>
          </div>
        </>)}

      </div>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit IEP Assessment">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">Submit IEP Assessment for <strong>{child?.name || formData.childName}</strong>?</p>
          <p className="text-[#5F5E5A]">This will finalize the 24-section IEP assessment document, calculate domain performance metrics, and save all data to Supabase.</p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitAssessment} loading={isSubmitting}>Yes, Submit IEP Assessment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );


}
