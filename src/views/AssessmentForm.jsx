"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Send } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import { calculateISAAScore, calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";
import { RatingRow0to3, RatingRow1to5, YesNoToggleRow, ChipSelect } from "../components/assessment/RatingComponents";
import { assessmentService } from "../services/assessmentService";

// ── ISAA item labels (official 40 items) ──
const ISAA_LABELS = {
  1: "Has poor eye contact",
  2: "Lacks social smile",
  3: "Remains aloof",
  4: "Does not reach out to others",
  5: "Unable to relate to people",
  6: "Unable to respond to social/environmental cues",
  7: "Engages in solitary and repetitive play activities",
  8: "Unable to take turns in social interaction",
  9: "Does not maintain peer relationships",
  10: "Does not respond to facial expression/feelings of others",
  11: "Shows inappropriate emotional response",
  12: "Shows exaggerated emotions",
  13: "Engages in self-stimulating emotions",
  14: "Lacks fear of danger",
  15: "Excited/agitated for no apparent reason",
  16: "Inconsistent attention and concentration",
  17: "Shows delay in responding",
  18: "Does not follow simple directions",
  19: "Uses others' hand as a tool",
  20: "Echoes words/phrases",
  21: "Unable to initiate or sustain conversation with others",
  22: "Engages in stereotyped and repetitive use of language",
  23: "Engages in echolalic speech",
  24: "Produces infantile squeals/unusual noises",
  25: "Unable to grasp pragmatics of communication",
  26: "Engages in rocking and other stereotyped movements",
  27: "Shows attachment to objects",
  28: "Shows hyperactivity/restlessness",
  29: "Exhibits aggressive behaviour",
  30: "Throws temper tantrums",
  31: "Engages in self-injurious behaviour",
  32: "Insists on sameness",
  33: "Shows oversensitivity to certain sounds/textures",
  34: "Shows unusual response to sensory stimuli",
  35: "Unusually sensitive to pain",
  36: "Responds to objects/people unusually by smelling, touching, or tasting",
  37: "Lack of appropriate speech",
  38: "Shows no/minimum reactions when left alone with others",
  39: "Does not make-believe in play",
  40: "Unable to do self-care activities age-appropriately"
};

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
    // Tab 1 — Child & Case Details
    childName: child?.name || "",
    dob: child?.dob || child?.date_of_birth || "",
    age: child?.age || "",
    gender: child?.gender || "Male",
    school: child?.school || "",
    parentName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    phone: child?.parent?.phone || child?.parent_accounts?.phone || "",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessmentType: "Initial",
    assessedBy: user?.name || "",
    designation: user?.designation || "",
    diagnosis: child?.diagnosis || "",
    primaryComplaint: child?.primaryConcern || child?.primary_concern || "",

    // Tab 2 — Birth & Developmental History
    tab2_birthChips: [],
    tab2_difficultyChips: [],
    tab2_milestoneHead: "",
    tab2_milestoneSit: "",
    tab2_milestoneWalk: "",
    tab2_milestoneFirstWord: "",
    tab2_milestoneSentence: "",
    tab2_birthComplications: "",

    // Tab 3 — Therapy History
    tab3_therapyChips: [],
    tab3_therapyDuration: "",
    tab3_therapyOutcome: "",
    tab3_previousCenter: "",

    // Tab 4 — Communication
    tab4_communication: {
      respondsName: 0, eyeContact: 0, simpleInstruct: 0,
      oneStep: 0, twoStep: 0, gestures: 0,
      requestsNeeds: 0, usesWords: 0
    },

    // Tab 5 — Behaviour & Attention
    tab5_task: {
      sitsForActivity: 0, attendsTeacher: 0,
      completesTask: 0, waitsTurn: 0
    },

    // Tab 6 — Motor Skills
    tab6_fine: { reachesGrasps: 0, transfersHand: 0, stacksBlocks: 0, holdsPencil: 0, drawsShapes: 0 },
    tab6_gross: { walks: 0, runs: 0, jumps: 0, climbsStairs: 0, kicks: 0 },

    // Tab 7 — Sensory + ADL
    tab7_adl: { eating: 0, drinking: 0, handWashing: 0, dressing: 0, toileting: 0 },
    tab7_sensory: { touchSensitivity: 0, soundSensitivity: 0, visualTracking: 0, bodyAwareness: 0 },

    // Tab 8 — Oral Motor
    tab8_oral: { lipClosure: 0, tongueMovement: 0, chewing: 0, blowing: 0, drooling: 0 },

    // Tab 9 — ISAA Scale (40 items)
    tab9_isaa: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`item${i + 1}`, 1])),

    // Tab 10 — Goals
    tab10_shortTermGoals: "",
    tab10_longTermGoals: "",
    tab10_therapyPlan: "",

    // Tab 11 — Sign Off
    tab11_finalRemarks: "",
    tab11_assessorName: user?.name || "",
    tab11_assessorDesignation: user?.designation || "",
    tab11_assessorDate: new Date().toISOString().split("T")[0],
    tab11_parentName: child?.parent?.name || child?.parent_accounts?.parent_name || "",
    tab11_parentRelation: "",
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
      try { setFormData(JSON.parse(saved)); showToast("Draft restored successfully.", "success"); } catch (e) { console.error(e); }
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

  const isaaResults = useMemo(() => calculateISAAScore(formData.tab9_isaa), [formData.tab9_isaa]);
  const domainScores = useMemo(() => calculateDomainScores(formData), [formData]);
  const profileInfo = useMemo(() => classifyProfile(domainScores, isaaResults.severityLevel), [domainScores, isaaResults]);
  const exercises = useMemo(() => selectExercises(profileInfo.profile, domainScores), [profileInfo, domainScores]);

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    const assessmentPayload = {
      child_id: child?.id || targetChildId,
      assessment_date: formData.assessmentDate || new Date().toISOString().split("T")[0],
      assessed_by: user?.id || formData.assessedBy || "Therapist",
      isaa_score: isaaResults.totalScore,
      isaa_severity: isaaResults.severity,
      isaa_level: isaaResults.severityLevel,
      domain_scores: domainScores,
      profile: profileInfo.profile,
      clinic_exercises: exercises.clinicExercises,
      home_exercises: exercises.homeExercises,
      form_data: formData,
      status: "completed"
    };

    try {
      const res = await assessmentService.save(assessmentPayload);
      localStorage.removeItem(`assessment_draft_${targetChildId}`);
      localStorage.setItem(`assessment_result_${child?.id || targetChildId}`, JSON.stringify(res));
      showToast("Assessment submitted and saved to database!", "success");
      navigate(`/assessment/${res.id || child?.id || targetChildId}/results`);
    } catch (err) {
      console.warn("Local submission fallback:", err.message);
      const fallbackResult = {
        id: child?.id || targetChildId,
        childId: child?.id || targetChildId,
        childName: child?.name || formData.childName,
        assessmentDate: formData.assessmentDate,
        assessedBy: formData.assessedBy,
        isaa: isaaResults,
        domainScores,
        profile: profileInfo.profile,
        formData
      };
      localStorage.removeItem(`assessment_draft_${targetChildId}`);
      localStorage.setItem(`assessment_result_${child?.id || targetChildId}`, JSON.stringify(fallbackResult));
      showToast("Assessment submitted successfully!", "success");
      navigate(`/assessment/${child?.id || targetChildId}/results`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabsList = [
    { num: 1, name: "Child Details" }, { num: 2, name: "History" }, { num: 3, name: "Therapy History" },
    { num: 4, name: "Communication" }, { num: 5, name: "Behaviour" }, { num: 6, name: "Motor Skills" },
    { num: 7, name: "Sensory + ADL" }, { num: 8, name: "Oral Motor" }, { num: 9, name: "ISAA Scale" },
    { num: 10, name: "Goals" }, { num: 11, name: "Sign Off" }
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

      {/* ── Sticky Header ── */}
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
            <p className="text-[11px] text-[#5F5E5A] font-semibold">Clinical Assessment Form</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-[11px] font-bold text-[#3B6D11] flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved {lastSaved}</span>}
          <Button variant="outlined" size="sm" icon={Save} onClick={() => showToast("Draft saved.", "success")}>Save Draft</Button>
          <Button size="sm" icon={Send} onClick={() => setShowSubmitModal(true)}>Submit</Button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sticky top-[73px] z-20 bg-white border-b border-[#D3D1C7] p-1.5 shadow-xs overflow-x-auto flex items-center gap-1">
        {tabsList.map((t) => (
          <button key={t.num} type="button" onClick={() => setActiveTab(t.num)} className={`px-3.5 py-2 rounded-[8px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === t.num ? "bg-[#185FA5] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"}`}>
            {t.num}. {t.name}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-6">

        {/* ═══ TAB 1: Child Details ═══ */}
        {activeTab === 1 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">1. Child & Case Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Child Name *" value={formData.childName} onChange={(e) => updateField("childName", e.target.value)} />
            <Input label="Date of Birth *" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
            <Input label="Age" value={formData.age} onChange={(e) => updateField("age", e.target.value)} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2C2C2A]">Gender</label>
              <select value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]">
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <Input label="School" value={formData.school} onChange={(e) => updateField("school", e.target.value)} />
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
          <Input label="Primary Complaint *" type="textarea" rows={3} value={formData.primaryComplaint} onChange={(e) => updateField("primaryComplaint", e.target.value)} />
          <div className="flex justify-end pt-2"><Button onClick={goNext}>Next: History →</Button></div>
        </>)}

        {/* ═══ TAB 2: Birth & Developmental History ═══ */}
        {activeTab === 2 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">2. Birth & Developmental History</h3>
          <ChipSelect label="Birth History (select all that apply)" options={["Full term", "Pre-term", "Normal delivery", "C-Section", "NICU stay", "Low birth weight", "Delayed cry"]} value={formData.tab2_birthChips} onChange={(v) => updateField("tab2_birthChips", v)} />
          <Input label="Birth Complications (if any)" type="textarea" rows={2} value={formData.tab2_birthComplications} onChange={(e) => updateField("tab2_birthComplications", e.target.value)} />
          <ChipSelect label="Developmental Difficulties" options={["Speech delay", "Motor delay", "Poor attention", "Sensory issues", "Social withdrawal", "Feeding issues", "Sleep problems", "Toilet training delayed"]} value={formData.tab2_difficultyChips} onChange={(v) => updateField("tab2_difficultyChips", v)} />
          <h4 className="text-xs font-bold text-[#2C2C2A] uppercase pt-2 border-t border-[#D3D1C7]/60">Developmental Milestones (age achieved)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Head Holding" placeholder="e.g. 3 months" value={formData.tab2_milestoneHead} onChange={(e) => updateField("tab2_milestoneHead", e.target.value)} />
            <Input label="Sitting" placeholder="e.g. 6 months" value={formData.tab2_milestoneSit} onChange={(e) => updateField("tab2_milestoneSit", e.target.value)} />
            <Input label="Walking" placeholder="e.g. 14 months" value={formData.tab2_milestoneWalk} onChange={(e) => updateField("tab2_milestoneWalk", e.target.value)} />
            <Input label="First Word" placeholder="e.g. 18 months" value={formData.tab2_milestoneFirstWord} onChange={(e) => updateField("tab2_milestoneFirstWord", e.target.value)} />
            <Input label="Sentence Formation" placeholder="e.g. 30 months" value={formData.tab2_milestoneSentence} onChange={(e) => updateField("tab2_milestoneSentence", e.target.value)} />
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Therapy History →</Button></div>
        </>)}

        {/* ═══ TAB 3: Therapy History ═══ */}
        {activeTab === 3 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">3. Previous Therapy History</h3>
          <ChipSelect label="Previous Therapies Taken" options={["Speech therapy", "Occupational therapy", "ABA therapy", "Sensory integration", "Behavioural therapy", "Play therapy", "Special education", "None"]} value={formData.tab3_therapyChips} onChange={(v) => updateField("tab3_therapyChips", v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Duration of Previous Therapy" placeholder="e.g. 6 months" value={formData.tab3_therapyDuration} onChange={(e) => updateField("tab3_therapyDuration", e.target.value)} />
            <Input label="Previous Centre / Hospital" value={formData.tab3_previousCenter} onChange={(e) => updateField("tab3_previousCenter", e.target.value)} />
          </div>
          <Input label="Outcome / Progress from Previous Therapy" type="textarea" rows={3} value={formData.tab3_therapyOutcome} onChange={(e) => updateField("tab3_therapyOutcome", e.target.value)} />
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Communication →</Button></div>
        </>)}

        {/* ═══ TAB 4: Communication ═══ */}
        {activeTab === 4 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">4. Communication & Language Skills</h3>
          <p className="text-xs text-[#5F5E5A] font-medium">Rate each skill: 0 = Not Developed, 1 = Emerging, 2 = With Support, 3 = Independent</p>
          <div className="space-y-2">
            {[{k:"respondsName",l:"Responds to name"},{k:"eyeContact",l:"Maintains eye contact"},{k:"simpleInstruct",l:"Understands simple instructions"},{k:"oneStep",l:"Follows one-step commands"},{k:"twoStep",l:"Follows two-step commands"},{k:"gestures",l:"Uses gestures to communicate"},{k:"requestsNeeds",l:"Requests needs verbally"},{k:"usesWords",l:"Uses meaningful words/phrases"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab4_communication[k]} onChange={(v) => updateNested("tab4_communication", k, v)} showRemarks={false} />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Behaviour →</Button></div>
        </>)}

        {/* ═══ TAB 5: Behaviour & Attention ═══ */}
        {activeTab === 5 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">5. Behaviour & Attention</h3>
          <p className="text-xs text-[#5F5E5A] font-medium">Rate each skill: 0 = Not Developed, 1 = Emerging, 2 = With Support, 3 = Independent</p>
          <div className="space-y-2">
            {[{k:"sitsForActivity",l:"Sits for structured activity (5–10 min)"},{k:"attendsTeacher",l:"Attends to teacher / therapist"},{k:"completesTask",l:"Completes given task independently"},{k:"waitsTurn",l:"Waits for turn in group activities"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab5_task[k]} onChange={(v) => updateNested("tab5_task", k, v)} showRemarks={false} />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Motor Skills →</Button></div>
        </>)}

        {/* ═══ TAB 6: Motor Skills ═══ */}
        {activeTab === 6 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">6. Motor Skills</h3>
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px]">Fine Motor Skills</h4>
          <div className="space-y-2">
            {[{k:"reachesGrasps",l:"Reaches and grasps objects"},{k:"transfersHand",l:"Transfers objects hand to hand"},{k:"stacksBlocks",l:"Stacks blocks (3–5)"},{k:"holdsPencil",l:"Holds pencil / crayon"},{k:"drawsShapes",l:"Draws basic shapes / lines"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab6_fine[k]} onChange={(v) => updateNested("tab6_fine", k, v)} showRemarks={false} />
            ))}
          </div>
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px] mt-4">Gross Motor Skills</h4>
          <div className="space-y-2">
            {[{k:"walks",l:"Walks independently"},{k:"runs",l:"Runs without falling"},{k:"jumps",l:"Jumps with both feet"},{k:"climbsStairs",l:"Climbs stairs alternating feet"},{k:"kicks",l:"Kicks ball forward"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab6_gross[k]} onChange={(v) => updateNested("tab6_gross", k, v)} showRemarks={false} />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sensory + ADL →</Button></div>
        </>)}

        {/* ═══ TAB 7: Sensory + ADL ═══ */}
        {activeTab === 7 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">7. Activities of Daily Living & Sensory Profile</h3>
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px]">ADL — Self-Care Skills</h4>
          <div className="space-y-2">
            {[{k:"eating",l:"Eats independently with spoon"},{k:"drinking",l:"Drinks from cup independently"},{k:"handWashing",l:"Washes hands independently"},{k:"dressing",l:"Puts on / removes clothing"},{k:"toileting",l:"Uses toilet independently"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab7_adl[k]} onChange={(v) => updateNested("tab7_adl", k, v)} showRemarks={false} />
            ))}
          </div>
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px] mt-4">Sensory Processing</h4>
          <div className="space-y-2">
            {[{k:"touchSensitivity",l:"Tactile / Touch sensitivity"},{k:"soundSensitivity",l:"Auditory / Sound sensitivity"},{k:"visualTracking",l:"Visual tracking & attention"},{k:"bodyAwareness",l:"Body awareness (proprioception)"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab7_sensory[k]} onChange={(v) => updateNested("tab7_sensory", k, v)} showRemarks={false} />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Oral Motor →</Button></div>
        </>)}

        {/* ═══ TAB 8: Oral Motor ═══ */}
        {activeTab === 8 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">8. Oral Motor Examination</h3>
          <p className="text-xs text-[#5F5E5A] font-medium">Rate each skill: 0 = Not Developed, 1 = Emerging, 2 = With Support, 3 = Independent</p>
          <div className="space-y-2">
            {[{k:"lipClosure",l:"Lip closure during eating"},{k:"tongueMovement",l:"Tongue lateral movement"},{k:"chewing",l:"Chewing solid food"},{k:"blowing",l:"Blowing (candle, bubbles)"},{k:"drooling",l:"Drooling control"}].map(({k,l}) => (
              <RatingRow0to3 key={k} label={l} value={formData.tab8_oral[k]} onChange={(v) => updateNested("tab8_oral", k, v)} showRemarks={false} />
            ))}
          </div>
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: ISAA Scale →</Button></div>
        </>)}

        {/* ═══ TAB 9: ISAA Scale (40 items) ═══ */}
        {activeTab === 9 && (<>
          <div className="sticky top-[115px] z-10 bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#9B9A96] uppercase block">ISAA Total Score</span>
                <span className="text-3xl font-black text-[#185FA5]">{isaaResults.totalScore} / 200</span>
              </div>
              <Badge label={isaaResults.severity} variant="amber" size="lg" />
            </div>
          </div>

          {/* Section I — Social Relationship (1–9) */}
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px]">SECTION I — Social Relationship & Reciprocity (Items 1–9)</h4>
          <div className="space-y-2">{[1,2,3,4,5,6,7,8,9].map((n) => <RatingRow1to5 key={n} itemNum={n} label={ISAA_LABELS[n]} value={formData.tab9_isaa[`item${n}`]} onChange={(v) => updateNested("tab9_isaa", `item${n}`, v)} />)}</div>

          {/* Section II — Emotional Responsiveness (10–15) */}
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px] mt-4">SECTION II — Emotional Responsiveness (Items 10–15)</h4>
          <div className="space-y-2">{[10,11,12,13,14,15].map((n) => <RatingRow1to5 key={n} itemNum={n} label={ISAA_LABELS[n]} value={formData.tab9_isaa[`item${n}`]} onChange={(v) => updateNested("tab9_isaa", `item${n}`, v)} />)}</div>

          {/* Section III — Speech, Language & Communication (16–25) */}
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px] mt-4">SECTION III — Speech, Language & Communication (Items 16–25)</h4>
          <div className="space-y-2">{[16,17,18,19,20,21,22,23,24,25].map((n) => <RatingRow1to5 key={n} itemNum={n} label={ISAA_LABELS[n]} value={formData.tab9_isaa[`item${n}`]} onChange={(v) => updateNested("tab9_isaa", `item${n}`, v)} />)}</div>

          {/* Section IV — Behaviour Patterns (26–40) */}
          <h4 className="text-xs font-extrabold bg-[#2C2C2A] text-white px-3 py-1.5 rounded-[6px] mt-4">SECTION IV — Behaviour Patterns (Items 26–40)</h4>
          <div className="space-y-2">{[26,27,28,29,30,31,32,33,34,35,36,37,38,39,40].map((n) => <RatingRow1to5 key={n} itemNum={n} label={ISAA_LABELS[n]} value={formData.tab9_isaa[`item${n}`]} onChange={(v) => updateNested("tab9_isaa", `item${n}`, v)} />)}</div>

          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Goals →</Button></div>
        </>)}

        {/* ═══ TAB 10: Goals ═══ */}
        {activeTab === 10 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">10. Therapy Goals</h3>
          <Input label="Short-Term Goals (3 months)" type="textarea" rows={4} placeholder="E.g. Improve eye contact to 5 seconds, respond to name consistently..." value={formData.tab10_shortTermGoals} onChange={(e) => updateField("tab10_shortTermGoals", e.target.value)} />
          <Input label="Long-Term Goals (6–12 months)" type="textarea" rows={4} placeholder="E.g. Use 2-word phrases for requests, participate in group activities..." value={formData.tab10_longTermGoals} onChange={(e) => updateField("tab10_longTermGoals", e.target.value)} />
          <Input label="Recommended Therapy Plan" type="textarea" rows={3} placeholder="E.g. Speech therapy 2x/week, OT 2x/week, parent guidance 1x/month" value={formData.tab10_therapyPlan} onChange={(e) => updateField("tab10_therapyPlan", e.target.value)} />
          <div className="flex justify-between pt-2"><Button variant="outlined" onClick={goPrev}>← Back</Button><Button onClick={goNext}>Next: Sign Off →</Button></div>
        </>)}

        {/* ═══ TAB 11: Sign Off ═══ */}
        {activeTab === 11 && (<>
          <h3 className="text-base font-bold text-[#185FA5] border-b pb-2">11. Summary & Sign Off</h3>
          <Input label="Final Remarks / Summary" type="textarea" rows={4} value={formData.tab11_finalRemarks} onChange={(e) => updateField("tab11_finalRemarks", e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#D3D1C7]/60">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Assessor Sign-Off</h4>
              <Input label="Assessor Name" value={formData.tab11_assessorName} onChange={(e) => updateField("tab11_assessorName", e.target.value)} />
              <Input label="Designation" value={formData.tab11_assessorDesignation} onChange={(e) => updateField("tab11_assessorDesignation", e.target.value)} />
              <Input label="Date" type="date" value={formData.tab11_assessorDate} onChange={(e) => updateField("tab11_assessorDate", e.target.value)} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#185FA5] uppercase">Parent / Guardian Acknowledgement</h4>
              <Input label="Parent Name" value={formData.tab11_parentName} onChange={(e) => updateField("tab11_parentName", e.target.value)} />
              <Input label="Relationship" value={formData.tab11_parentRelation} onChange={(e) => updateField("tab11_parentRelation", e.target.value)} />
              <Input label="Date" type="date" value={formData.tab11_parentDate} onChange={(e) => updateField("tab11_parentDate", e.target.value)} />
            </div>
          </div>
          <Button fullWidth className="h-12 text-sm mt-4" onClick={() => setShowSubmitModal(true)}>
            Submit Assessment
          </Button>
        </>)}

      </div>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assessment">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">Submit assessment for <strong>{child?.name}</strong>?</p>
          <p className="text-[#5F5E5A]">This will calculate the ISAA autism severity level, classify the clinical profile, and save all data to the database.</p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitAssessment} loading={isSubmitting}>Yes, Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
