"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import { calculateISAAScore } from "../utils/scoringEngine";
import {
  RatingRow0to3,
  RatingRow1to5,
  YesNoToggleRow,
  ChipSelect
} from "../components/assessment/RatingComponents";

export default function AssessmentForm() {
  const { childId, id } = useParams();
  const navigate = useNavigate();
  const { user, childrenList, showToast } = useAuth();

  const targetChildId = childId || id || "KCR-2024-002";
  const child = childrenList.find((c) => c.id === targetChildId) || childrenList[1] || childrenList[0];

  const [activeTab, setActiveTab] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State Object
  const [formData, setFormData] = useState({
    // Tab 1
    childName: child?.name || "",
    dob: child?.dob || "",
    age: child?.age || "",
    gender: child?.gender || "Male",
    school: child?.school || "",
    parentName: child?.parent?.name || "",
    phone: child?.parent?.phone || "",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessmentType: "Initial",
    assessedBy: user?.name || "Priya S",
    designation: user?.designation || "Senior Therapist",
    diagnosis: child?.diagnosis || "ASD",
    referredBy: child?.referredBy || "Self",
    languages: child?.languages || "Tamil, English",
    primaryComplaint: child?.primaryConcern || "",
    whenNoticed: "18 months of age",
    previousTherapy: child?.previousTherapy || false,
    previousTherapyDetails: child?.previousTherapyDetails || "",
    hearingDone: "Not Done",
    hearingResult: "",
    familyHistory: false,
    bothParentsWorking: false,
    primaryCaregiver: child?.parent?.name || "Mother",
    schoolFeedback: child?.schoolFeedback || "",
    peerNotes: "Needs support in group settings",

    // Tab 2 History
    tab2_birthChips: ["Full term", "Normal delivery"],
    tab2_birthDetails: "No birth complications reported.",
    tab2_milestones: {},
    tab2_medicalChips: ["None"],
    tab2_medicalDetails: "",
    tab2_difficultyChips: ["Speech delay", "Poor attention", "Sensory issues"],

    // Tab 3 Therapy History
    tab3_therapyChips: ["Speech therapy"],
    tab3_therapyDetails: "6 months prior to joining clinic.",
    tab3_schoolChips: "Mainstream school",
    tab3_schoolDetails: "Class teacher noted speech delay.",
    tab3_goals: ["Improve speech clarity", "Enhance eye contact", "Increase sitting tolerance", "Reduce stimming", "Improve social play"],

    // Tab 4 Communication
    tab4_attentionYesNo: { eyeContact: true, respondsName: true, oneStep: true, twoStep: false, sustainsAttention: false, easilyDistracted: true },
    tab4_sittingTolerance: "5–10 min",
    tab4_communication: { respondsName: 2, eyeContact: 2, simpleInstruct: 2, oneStep: 2, twoStep: 1, gestures: 2, requestsNeeds: 1, usesWords: 1, usesPhrases: 1, namesObjects: 1, answersQuestions: 1, communicatesPain: 2 },
    tab4_commSummary: "Uses single words and gestures for requesting. Responds to name when called loudly.",
    tab4_receptiveYesNo: { instructions: true, pictures: true, questions: false, prepositions: false, shortStories: false },
    tab4_expressiveYesNo: { wordsPhrases: true, fullSentences: false, namesObjects: true, narrateEvents: false, asksAnswers: false, correctGrammar: false },
    tab4_social: { respondsAdults: 2, respondsPeers: 1, greetsOthers: 1, sharesToys: 1, takesTurns: 1, imitates: 2, functionalPlay: 1, pretendPlay: 1, groupActivity: 1, classroomRules: 1 },
    tab4_socialSummary: "Plays alongside peers. Needs encouragement for turn-taking.",

    // Tab 5 Behaviour
    tab5_task: { sitsForActivity: 2, attendsTeacher: 1, completesTask: 1, waitsTurn: 1, redirection: 2, transitions: 1, worksPrompts: 2, worksIndep: 1 },
    tab5_taskSummary: "Completes task with hand-over-hand prompting.",
    tab5_behaviourTable: {},
    tab5_triggers: ["Denied object", "Noise", "Transition"],
    tab5_triggersSummary: "Tantrums occur mostly when denied preferred toys.",
    tab5_emotional: { expressesNeeds: 1, waitsDistress: 1, acceptsNo: 1, handlesCorrection: 1, calmsUpset: 2, acceptsChange: 1, emotionalResponse: 2 },
    tab5_emotionalSummary: "Calms down with gentle sensory deep pressure.",

    // Tab 6 Motor Skills
    tab6_fine: { reachesGrasps: 3, transfersHand: 3, stacksBlocks: 2, pegboard: 2, beading: 1, tearsPaper: 2, pastesPaper: 2, usesCrayons: 2, pencilGrip: 1, scribbling: 2, tracing: 1, scissors: 1, buttoning: 1 },
    tab6_fineSummary: "Palmer grip present. Needs support for pincer grasp tasks.",
    tab6_gross: { sittingBalance: 3, standingBalance: 3, walking: 3, running: 2, jumping: 2, stairs: 2, kickingBall: 2, throwingBall: 2, catchingBall: 1, bodyCoord: 2, postureControl: 2 },
    tab6_grossSummary: "Good gross motor endurance. Catching ball requires practice.",

    // Tab 7 Sensory + ADL
    tab7_sensoryTable: {},
    tab7_sensoryConcerns: ["Covers ears", "Toe walking", "Hand flapping"],
    tab7_sensorySummary: "Hypersensitive to loud auditory stimuli.",
    tab7_adl: { eating: 2, drinking: 2, handWashing: 2, brushing: 1, dressing: 1, undressing: 1, toileting: 2, indicatesToilet: 2, footwear: 2, schoolBag: 1, cleansUp: 1, dailyRoutine: 2 },
    tab7_adlSummary: "Independent in eating finger foods. Needs help with dressing buttons.",
    tab7_preAcademic: { matchesObjects: 2, matchesPictures: 2, sortsObjects: 2, colours: 2, shapes: 1, bodyParts: 2, animals: 2, alphabets: 1, numbers: 1, counts: 1, rhymes: 1, ownName: 2, copiesLines: 1, preWriting: 1 },
    tab7_preAcademicSummary: "Identifies primary colours and body parts.",
    tab7_learningStyle: ["Visual method", "Objects and real materials", "One-to-one teaching"],
    tab7_learningRemarks: "Responds best to picture card prompts.",

    // Tab 8 Oral Motor
    tab8_oralExam: {},
    tab8_soundInventory: {},
    tab8_positionWord: {},

    // Tab 9 ISAA Ratings (1 to 5)
    tab9_isaa: {
      item1: 3, item2: 2, item3: 3, item4: 2, item5: 2, item6: 3, item7: 3, item8: 3, item9: 2,
      item10: 2, item11: 2, item12: 2, item13: 1, item14: 2,
      item15: 1, item16: 3, item17: 2, item18: 2, item19: 2, item20: 3,
      item21: 2, item22: 2, item23: 1, item24: 2, item25: 2, item26: 1, item27: 1, item28: 1,
      item29: 2, item30: 2, item31: 2, item32: 2, item33: 2, item34: 2,
      item35: 3, item36: 1, item37: 2, item38: 2, item39: 1, item40: 1
    },
    tab9_remarks: "Mild autism indicated on ISAA scoring engine.",

    // Tab 10 Goals
    tab10_strengths: ["Warm and affectionate", "Good visual memory", "Enjoys music and rhymes", "Responds to physical praise", "Independent eater"],
    tab10_supportAreas: ["Communication", "Attention", "Social skills", "Sensory processing"],
    tab10_perfLevel: { comm: "Single words level", academic: "Pre-K readiness", behaviour: "Mild restlessness", social: "Parallel play", adl: "Partially independent", motor: "Age appropriate gross motor", sensory: "Auditory seeking" },
    tab10_interventions: ["Speech and communication", "Occupational therapy", "Sensory integration", "Parent guidance"],
    tab10_interventionDetails: "2 Sessions per week for 6 months.",
    tab10_homeSuggestions: ["Practise naming objects during meal time", "Use picture cards for choices", "Provide 10 min daily sensory swing time", "Encourage 2-word phrase requests", "Read bedtime picture book daily"],
    tab10_reviewDates: { d1: "2026-04-15", d2: "2026-07-15", d3: "2026-10-15" },

    // Tab 11 Sign Off
    tab11_summary: {
      attention: "Sitting tolerance 5-10 minutes.",
      receptive: "Understands 1-step familiar commands.",
      expressive: "Uses single words and gestures.",
      articulation: "Mild sound substitutions.",
      oralMotor: "Normal lip and tongue strength.",
      intelligibility: "Understandable to family.",
      behaviour: "Responds well to positive redirection.",
      social: "Enjoys parallel play with peers.",
      sensory: "Auditory hypersensitivity present.",
      motor: "Fine motor grip emerging.",
      adl: "Needs assistance for dressing fasteners."
    },
    tab11_recommendations: ["Speech Therapy", "Oral Motor Exercises", "Home Practice Program", "Parent Guidance"],
    tab11_reEvalWeeks: "12",
    tab11_finalRemarks: "Recommended for 6-month therapy program focusing on speech clarity, sensory regulation, and social communication.",
    tab11_assessorName: user?.name || "Priya S",
    tab11_assessorDesignation: user?.designation || "Senior Therapist",
    tab11_assessorDate: new Date().toISOString().split("T")[0],
    tab11_parentName: child?.parent?.name || "Sirajudeen",
    tab11_parentRelation: child?.parent?.relationship || "Father",
    tab11_parentDate: new Date().toISOString().split("T")[0]
  });

  // Check LocalStorage Draft on Load
  useEffect(() => {
    const draftKey = `assessment_draft_${targetChildId}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setShowRestoreBanner(true);
    }
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
    const draftKey = `assessment_draft_${targetChildId}`;
    localStorage.removeItem(draftKey);
    setShowRestoreBanner(false);
    showToast("Started fresh assessment.", "info");
  };

  // Auto-save on form change
  const updateField = (key, val) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      const draftKey = `assessment_draft_${targetChildId}`;
      localStorage.setItem(draftKey, JSON.stringify(next));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return next;
    });
  };

  // ISAA Live Calculation
  const isaaResults = useMemo(() => {
    return calculateISAAScore(formData.tab9_isaa);
  }, [formData.tab9_isaa]);

  // Tab Completion Progress Percentage
  const progressPercent = useMemo(() => {
    let completedTabs = 1; // Tab 1 prefilled
    if (formData.tab2_birthChips?.length) completedTabs++;
    if (formData.tab3_therapyChips?.length) completedTabs++;
    if (Object.keys(formData.tab4_communication || {}).length) completedTabs++;
    if (Object.keys(formData.tab5_task || {}).length) completedTabs++;
    if (Object.keys(formData.tab6_fine || {}).length) completedTabs++;
    if (Object.keys(formData.tab7_adl || {}).length) completedTabs++;
    if (Object.keys(formData.tab8_oralExam || {}).length || true) completedTabs++;
    if (isaaResults.ratedCount > 0) completedTabs++;
    if (formData.tab10_strengths?.length) completedTabs++;
    if (formData.tab11_finalRemarks) completedTabs++;

    return Math.round((completedTabs / 11) * 100);
  }, [formData, isaaResults]);

  const handleSubmitAssessment = () => {
    const resultPayload = {
      childId: child?.id,
      childName: child?.name,
      assessmentDate: formData.assessmentDate,
      assessedBy: formData.assessedBy,
      isaa: isaaResults,
      formData
    };
    localStorage.setItem(`assessment_result_${child?.id}`, JSON.stringify(resultPayload));
    showToast("Assessment submitted successfully!", "success");
    navigate(`/assessment/${child?.id}/results`);
  };

  const tabsList = [
    { num: 1, name: "Child Details" },
    { num: 2, name: "History" },
    { num: 3, name: "Therapy History" },
    { num: 4, name: "Communication" },
    { num: 5, name: "Behaviour" },
    { num: 6, name: "Motor Skills" },
    { num: 7, name: "Sensory + ADL" },
    { num: 8, name: "Oral Motor" },
    { num: 9, name: "ISAA Scale" },
    { num: 10, name: "Goals" },
    { num: 11, name: "Sign Off" }
  ];

  return (
    <div className="space-y-4 text-[#2C2C2A] pb-24">
      
      {/* Draft Restore Yellow Banner */}
      {showRestoreBanner && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-[12px] text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#854F0B] shrink-0" />
            <span>Unsaved draft found for {child?.name}. Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleRestoreDraft}>
              Restore Draft
            </Button>
            <Button size="sm" variant="outlined" onClick={handleStartFresh}>
              Start Fresh
            </Button>
          </div>
        </div>
      )}

      {/* STICKY HEADER BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <span className="font-mono text-xs text-[#9B9A96]">{child?.id}</span>
            </div>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">Clinical Assessment Form</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-[11px] font-bold text-[#3B6D11] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Draft saved at {lastSaved}
            </span>
          )}
          <Button variant="outlined" size="sm" icon={Save} onClick={() => showToast("Draft saved manually.", "success")}>
            Save Draft
          </Button>
          <Button size="sm" icon={Send} onClick={() => setShowSubmitModal(true)}>
            Submit Assessment
          </Button>
        </div>
      </div>

      {/* Progress Bar Below Header */}
      <div className="bg-white p-3 rounded-[12px] border border-[#D3D1C7] shadow-xs space-y-1">
        <ProgressBar value={progressPercent} color="#185FA5" label="Assessment Completion" />
      </div>

      {/* STICKY TAB NAVIGATION BAR */}
      <div className="sticky top-[73px] z-20 bg-white border-b border-[#D3D1C7] p-1.5 shadow-xs overflow-x-auto flex items-center gap-1">
        {tabsList.map((t) => {
          const isActive = activeTab === t.num;
          return (
            <button
              key={t.num}
              type="button"
              onClick={() => setActiveTab(t.num)}
              className={`px-3.5 py-2 rounded-[8px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#185FA5] text-white shadow-xs"
                  : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
              }`}
            >
              <span>{t.num}.</span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TAB CONTENT CONTAINER */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        
        {/* TAB 1: CHILD DETAILS */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">1. Child & Case Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Child Name" value={formData.childName} onChange={(e) => updateField("childName", e.target.value)} />
              <Input label="Date of Birth" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
              <Input label="Calculated Age" value={formData.age} readOnly />
              <Input label="Gender" value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} />
              <Input label="School / Class" value={formData.school} onChange={(e) => updateField("school", e.target.value)} />
              <Input label="Parent Name" value={formData.parentName} onChange={(e) => updateField("parentName", e.target.value)} />
              <Input label="Contact Number" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input label="Date of Assessment *" type="date" value={formData.assessmentDate} onChange={(e) => updateField("assessmentDate", e.target.value)} />
              <Input label="Assessed By *" value={formData.assessedBy} onChange={(e) => updateField("assessedBy", e.target.value)} />
              <Input label="Designation" value={formData.designation} onChange={(e) => updateField("designation", e.target.value)} />
            </div>

            <Input label="Primary Complaint *" type="textarea" rows={3} value={formData.primaryComplaint} onChange={(e) => updateField("primaryComplaint", e.target.value)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle label="Previous Therapy Taken?" value={formData.previousTherapy} onChange={(val) => updateField("previousTherapy", val)} />
              {formData.previousTherapy && (
                <Input label="Specify Type & Duration" type="textarea" rows={2} value={formData.previousTherapyDetails} onChange={(e) => updateField("previousTherapyDetails", e.target.value)} />
              )}
            </div>

            <Input label="School Feedback / Teacher Report" type="textarea" rows={2} value={formData.schoolFeedback} onChange={(e) => updateField("schoolFeedback", e.target.value)} />
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">2. Birth & Medical History</h3>
            
            <ChipSelect
              label="Birth History Complications"
              options={["Normal delivery", "C-section", "Preterm", "Low birth weight", "NICU admission", "Birth complications", "Full term"]}
              value={formData.tab2_birthChips}
              onChange={(val) => updateField("tab2_birthChips", val)}
            />

            <ChipSelect
              label="Medical History"
              options={["Seizure history", "Hearing difficulty", "Vision difficulty", "Sleep issues", "Feeding difficulty", "Frequent illness", "On medication", "None"]}
              value={formData.tab2_medicalChips}
              onChange={(val) => updateField("tab2_medicalChips", val)}
            />

            <ChipSelect
              label="Main Areas of Difficulty (Reported by Parent)"
              options={["Speech delay", "Poor attention", "Hyperactivity", "Behaviour issues", "Poor social interaction", "Learning difficulty", "Sensory issues", "Motor difficulty", "Poor ADL skills"]}
              value={formData.tab2_difficultyChips}
              onChange={(val) => updateField("tab2_difficultyChips", val)}
            />
          </div>
        )}

        {/* TAB 3: THERAPY HISTORY */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">3. Previous Therapy & School History</h3>
            
            <ChipSelect
              label="Previous Therapies Taken"
              options={["Physiotherapy", "Occupational therapy", "Speech therapy", "Special education", "Behaviour therapy", "Sensory integration", "None"]}
              value={formData.tab3_therapyChips}
              onChange={(val) => updateField("tab3_therapyChips", val)}
            />

            <ChipSelect
              label="School Placement"
              multi={false}
              options={["Not yet admitted", "Playschool", "Mainstream school", "Special school", "Home-based learning"]}
              value={formData.tab3_schoolChips}
              onChange={(val) => updateField("tab3_schoolChips", val)}
            />

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2C2C2A]">Top 5 Parent Priority Goals</label>
              {formData.tab3_goals.map((g, idx) => (
                <Input
                  key={idx}
                  placeholder={`Goal ${idx + 1}`}
                  value={g}
                  onChange={(e) => {
                    const nextG = [...formData.tab3_goals];
                    nextG[idx] = e.target.value;
                    updateField("tab3_goals", nextG);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMMUNICATION */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">4. Communication & Language</h3>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Communication Ratings (0-3)</h4>
              {Object.entries({
                respondsName: "Responds to name call",
                eyeContact: "Maintains eye contact",
                simpleInstruct: "Understands simple instructions",
                oneStep: "Follows one-step commands",
                twoStep: "Follows two-step commands",
                gestures: "Uses gestures / pointing",
                requestsNeeds: "Requests needs appropriately",
                usesWords: "Uses single words",
                usesPhrases: "Uses 2-word phrases",
                namesObjects: "Names familiar objects",
                answersQuestions: "Answers simple questions",
                communicatesPain: "Communicates pain or discomfort"
              }).map(([key, label]) => (
                <RatingRow0to3
                  key={key}
                  label={label}
                  value={formData.tab4_communication[key]}
                  onChange={(num) => {
                    const next = { ...formData.tab4_communication, [key]: num };
                    updateField("tab4_communication", next);
                  }}
                  showRemarks={false}
                />
              ))}
            </div>

            <Input label="Communication Summary" type="textarea" rows={2} value={formData.tab4_commSummary} onChange={(e) => updateField("tab4_commSummary", e.target.value)} />
          </div>
        )}

        {/* TAB 5: BEHAVIOUR */}
        {activeTab === 5 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">5. Behaviour & Emotional Regulation</h3>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Task Behaviour Ratings (0-3)</h4>
              {Object.entries({
                sitsForActivity: "Sits for activity",
                attendsTeacher: "Attends to therapist",
                completesTask: "Completes simple task",
                waitsTurn: "Waits for turn",
                redirection: "Responds to redirection",
                transitions: "Transitions smoothly",
                worksPrompts: "Works with prompts",
                worksIndep: "Works independently"
              }).map(([key, label]) => (
                <RatingRow0to3
                  key={key}
                  label={label}
                  value={formData.tab5_task[key]}
                  onChange={(num) => {
                    const next = { ...formData.tab5_task, [key]: num };
                    updateField("tab5_task", next);
                  }}
                  showRemarks={false}
                />
              ))}
            </div>

            <ChipSelect
              label="Behaviour Triggers"
              options={["Denied object", "Waiting", "Noise", "New place", "Task demand", "Hunger", "Fatigue", "Transition"]}
              value={formData.tab5_triggers}
              onChange={(val) => updateField("tab5_triggers", val)}
            />
          </div>
        )}

        {/* TAB 6: MOTOR SKILLS */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">6. Motor Skills</h3>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Fine Motor Skills (0-3)</h4>
              {Object.entries({
                reachesGrasps: "Reaches and grasps objects",
                transfersHand: "Transfers objects hand to hand",
                stacksBlocks: "Stacks blocks",
                pegboard: "Pegboard placement",
                beading: "Beading and threading",
                tearsPaper: "Tears paper",
                pastesPaper: "Pastes paper",
                usesCrayons: "Uses crayons",
                pencilGrip: "Pencil grip quality",
                scribbling: "Scribbling control",
                tracing: "Tracing lines",
                scissors: "Uses scissors safely",
                buttoning: "Buttoning/unbuttoning"
              }).map(([key, label]) => (
                <RatingRow0to3
                  key={key}
                  label={label}
                  value={formData.tab6_fine[key]}
                  onChange={(num) => {
                    const next = { ...formData.tab6_fine, [key]: num };
                    updateField("tab6_fine", next);
                  }}
                  showRemarks={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SENSORY + ADL */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">7. Sensory & Activities of Daily Living</h3>
            
            <ChipSelect
              label="Sensory Concerns"
              options={["Covers ears", "Avoids touch", "Toe walking", "Spins objects", "Hand flapping", "Chews objects", "Seeks pressure", "Avoids food textures"]}
              value={formData.tab7_sensoryConcerns}
              onChange={(val) => updateField("tab7_sensoryConcerns", val)}
            />

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Activities of Daily Living (ADL 0-3)</h4>
              {Object.entries({
                eating: "Eating independently",
                drinking: "Drinking from cup",
                handWashing: "Hand washing",
                brushing: "Brushing teeth",
                dressing: "Dressing",
                undressing: "Undressing",
                toileting: "Toileting",
                indicatesToilet: "Indicates toilet need",
                footwear: "Wears footwear",
                schoolBag: "Arranges school bag"
              }).map(([key, label]) => (
                <RatingRow0to3
                  key={key}
                  label={label}
                  value={formData.tab7_adl[key]}
                  onChange={(num) => {
                    const next = { ...formData.tab7_adl, [key]: num };
                    updateField("tab7_adl", next);
                  }}
                  showRemarks={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ORAL MOTOR */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">8. Oral Motor & Articulation</h3>
            <p className="text-xs text-[#5F5E5A]">Oral motor structural exam & sound inventory screening.</p>
          </div>
        )}

        {/* TAB 9: ISAA SCALE (LIVE SCORE CALCULATOR) */}
        {activeTab === 9 && (
          <div className="space-y-6">
            
            {/* STICKY ISAA LIVE SCORE CARD */}
            <div className="sticky top-[115px] z-10 bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#9B9A96] uppercase block">ISAA Total Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#185FA5]">{isaaResults.totalScore}</span>
                    <span className="text-xs text-[#9B9A96] font-bold">/ 200</span>
                  </div>
                </div>

                <div>
                  <Badge
                    label={isaaResults.severity}
                    variant={
                      isaaResults.severityLevel === 3 ? "coral" : isaaResults.severityLevel === 2 ? "amber" : isaaResults.severityLevel === 1 ? "blue" : "green"
                    }
                    size="lg"
                  />
                  <span className="text-[10px] text-[#5F5E5A] block mt-1 text-right">{isaaResults.ratedCount} of 40 rated</span>
                </div>
              </div>

              <ProgressBar value={Math.round((isaaResults.totalScore / 200) * 100)} color="#185FA5" />

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-[8px] text-[11px] font-bold text-amber-900">
                Rating Scale: 1 = Rarely (0-20%) | 2 = Sometimes (21-40%) | 3 = Frequently (41-60%) | 4 = Mostly (61-80%) | 5 = Always (81-100%)
              </div>
            </div>

            {/* SECTION 1 */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px]">
                SECTION I — Social Relationship and Reciprocity (Items 1–9)
              </h4>
              {[
                { num: 1, text: "Has poor eye contact" },
                { num: 2, text: "Lacks social smile" },
                { num: 3, text: "Remains aloof" },
                { num: 4, text: "Does not reach out to others" },
                { num: 5, text: "Unable to relate to people" },
                { num: 6, text: "Unable to respond to social/environmental cues" },
                { num: 7, text: "Engages in solitary and repetitive play activities" },
                { num: 8, text: "Unable to take turns in social interaction" },
                { num: 9, text: "Does not maintain peer relationships" }
              ].map((item) => (
                <RatingRow1to5
                  key={item.num}
                  itemNum={item.num}
                  label={item.text}
                  value={formData.tab9_isaa[`item${item.num}`]}
                  onChange={(num) => {
                    const next = { ...formData.tab9_isaa, [`item${item.num}`]: num };
                    updateField("tab9_isaa", next);
                  }}
                />
              ))}
            </div>

            {/* SECTION II */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px]">
                SECTION II — Emotional Responsiveness (Items 10–14)
              </h4>
              {[
                { num: 10, text: "Shows inappropriate emotional response" },
                { num: 11, text: "Shows exaggerated emotions" },
                { num: 12, text: "Engages in self-stimulating emotions" },
                { num: 13, text: "Lacks fear of danger" },
                { num: 14, text: "Excited or agitated for no apparent reason" }
              ].map((item) => (
                <RatingRow1to5
                  key={item.num}
                  itemNum={item.num}
                  label={item.text}
                  value={formData.tab9_isaa[`item${item.num}`]}
                  onChange={(num) => {
                    const next = { ...formData.tab9_isaa, [`item${item.num}`]: num };
                    updateField("tab9_isaa", next);
                  }}
                />
              ))}
            </div>

            <Input label="ISAA Clinical Remarks" type="textarea" rows={2} value={formData.tab9_remarks} onChange={(e) => updateField("tab9_remarks", e.target.value)} />
          </div>
        )}

        {/* TAB 10: GOALS */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">10. Strengths & Intervention Goals</h3>
            
            <ChipSelect
              label="Recommended Interventions"
              options={["Speech and communication", "Occupational therapy", "Sensory integration", "Special education", "Behaviour support", "Physiotherapy", "Parent counselling"]}
              value={formData.tab10_interventions}
              onChange={(val) => updateField("tab10_interventions", val)}
            />
          </div>
        )}

        {/* TAB 11: SIGN OFF */}
        {activeTab === 11 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">11. Summary & Sign Off</h3>
            
            <Input label="Final Remarks by Therapist / Therapy Team" type="textarea" rows={4} value={formData.tab11_finalRemarks} onChange={(e) => updateField("tab11_finalRemarks", e.target.value)} />

            <div className="p-6 bg-[#F8F8F6] rounded-[12px] border border-[#D3D1C7] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
              <div className="space-y-2">
                <h4 className="font-bold text-[#185FA5]">Assessor Signature</h4>
                <p>Name: <strong>{formData.tab11_assessorName}</strong></p>
                <p>Designation: <strong>{formData.tab11_assessorDesignation}</strong></p>
                <p>Date: <strong>{formData.tab11_assessorDate}</strong></p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#185FA5]">Parent / Guardian Signature</h4>
                <p>Name: <strong>{formData.tab11_parentName}</strong> ({formData.tab11_parentRelation})</p>
                <p>Date: <strong>{formData.tab11_parentDate}</strong></p>
              </div>
            </div>

            <Button fullWidth className="h-12 text-sm" onClick={() => setShowSubmitModal(true)}>
              Submit Assessment
            </Button>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D3D1C7] p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex items-center justify-between max-w-7xl mx-auto px-6">
        <Button variant="outlined" size="sm" disabled={activeTab === 1} onClick={() => setActiveTab((prev) => Math.max(1, prev - 1))}>
          ← Previous Tab
        </Button>

        <span className="text-xs font-bold text-[#2C2C2A] hidden sm:inline">
          {tabsList[activeTab - 1]?.name} ({activeTab} of 11)
        </span>

        {activeTab < 11 ? (
          <Button size="sm" onClick={() => setActiveTab((prev) => Math.min(11, prev + 1))}>
            Next Tab →
          </Button>
        ) : (
          <Button size="sm" onClick={() => setShowSubmitModal(true)}>
            Submit Assessment
          </Button>
        )}
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assessment">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Submit this assessment for <strong>{child?.name}</strong>? This will calculate the autism level and generate exercise recommendations.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitAssessment}>Yes, Submit</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
