"use client";

import React, { useState } from "react";
import { useDashboard, AssessmentForm, CaseHistory, ClinicalObservation } from "@/context/DashboardContext";
import { Card, Badge, Select } from "@/components/ui/ui";
import { Check, ChevronLeft, ChevronRight, FilePlus, Sparkles } from "lucide-react";

export default function NewAssessmentForm() {
  const { children, activeTherapistId, therapists, submitAssessment, setActiveTab } = useDashboard();

  // Kaseload lookup
  const therapist = therapists.find((t) => t.id === activeTherapistId);

  const [step, setStep] = useState(1);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [assessmentType, setAssessmentType] = useState<"Occupational Therapy" | "Physiotherapy" | "Autism Screening" | "ADHD Screening">("Occupational Therapy");

  // Step 1: Case History
  const [parentConcern, setParentConcern] = useState("");
  const [pregnancyHistory, setPregnancyHistory] = useState<"Normal" | "C-section" | "Premature" | "Complications">("Normal");
  const [pregnancyDetails, setPregnancyDetails] = useState("");
  const [previousTherapy, setPreviousTherapy] = useState("No");
  const [previousTherapyDetails, setPreviousTherapyDetails] = useState("");
  const [schoolHistory, setSchoolHistory] = useState("");
  
  // Milestones checkboxes
  const [headControl, setHeadControl] = useState<"Normal" | "Delayed">("Normal");
  const [sitting, setSitting] = useState<"Normal" | "Delayed">("Normal");
  const [crawling, setCrawling] = useState<"Normal" | "Delayed">("Normal");
  const [walking, setWalking] = useState<"Normal" | "Delayed">("Normal");
  const [firstWords, setFirstWords] = useState<"Normal" | "Delayed">("Normal");
  const [toiletTraining, setToiletTraining] = useState<"Normal" | "Delayed">("Normal");

  // Step 2: Clinical Observation (3=Yes, 2=Sometimes, 1=No)
  const [seatingTolerance, setSeatingTolerance] = useState(3);
  const [eyeContact, setEyeContact] = useState(3);
  const [responseToName, setResponseToName] = useState(3);
  const [jointAttention, setJointAttention] = useState(3);
  const [followsSimpleCommands, setFollowsSimpleCommands] = useState(3);
  const [followsTwoStepCommands, setFollowsTwoStepCommands] = useState(3);
  const [attentionSpan, setAttentionSpan] = useState(3);
  const [taskCompletion, setTaskCompletion] = useState(3);
  const [impulseControl, setImpulseControl] = useState(3);
  const [functionalPlay, setFunctionalPlay] = useState(3);
  const [peerInteraction, setPeerInteraction] = useState(3);
  const [sensorySeeking, setSensorySeeking] = useState(1);
  const [sensoryAvoidance, setSensoryAvoidance] = useState(1);
  const [stereotypicalMovements, setStereotypicalMovements] = useState(1);
  const [emotionalRegulation, setEmotionalRegulation] = useState(3);

  // Step 3: Clinical Impression
  const [clinicalImpressionSummary, setClinicalImpressionSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    const child = children.find((c) => c.id === childId);
    if (child) {
      setParentConcern(child.mainConcern || "");
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedChildId) {
      alert("Please select a child to proceed.");
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };


  const submitForm = () => {
    const childObj = children.find((c) => c.id === selectedChildId);
    if (!childObj || !therapist) return;

    const caseHistory: CaseHistory = {
      parentConcern,
      pregnancyHistory,
      pregnancyDetails,
      milestones: { headControl, sitting, crawling, walking, firstWords, toiletTraining },
      medicalConditions: [],
      previousTherapy,
      previousTherapyDetails,
      schoolHistory,
    };

    const clinicalObservation: ClinicalObservation = {
      seatingTolerance,
      eyeContact,
      responseToName,
      jointAttention,
      followsSimpleCommands,
      followsTwoStepCommands,
      attentionSpan,
      taskCompletion,
      impulseControl,
      functionalPlay,
      peerInteraction,
      sensorySeeking,
      sensoryAvoidance,
      stereotypicalMovements,
      emotionalRegulation,
    };

    const assessmentForm: Omit<AssessmentForm, "id" | "status"> = {
      childId: selectedChildId,
      childName: childObj.name,
      assessmentDate: new Date().toISOString().split("T")[0],
      type: assessmentType,
      therapistId: activeTherapistId,
      therapistName: therapist.name,
      caseHistory,
      clinicalObservation,
      clinicalImpressionSummary,
      recommendations,
    };

    submitAssessment(assessmentForm);
    
    // Reset wizard
    setStep(1);
    setSelectedChildId("");
    setParentConcern("");
    setClinicalImpressionSummary("");
    setRecommendations("");

    setActiveTab("therapist-home");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Wizard Step Progress */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 text-blue-700 h-8 w-8 flex items-center justify-center font-extrabold text-xs">
            Step {step} of 4
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {step === 1 && "1. Demographics & History"}
              {step === 2 && "2. Milestones & Pregnancy"}
              {step === 3 && "3. Clinical Observations"}
              {step === 4 && "4. Impressions & Recommendations"}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {step === 1 && "Select child patient and choose assessment type"}
              {step === 2 && "pregnancy conditions and milestone developmental tracking"}
              {step === 3 && "Rate clinical parameters on a scale of 3-1"}
              {step === 4 && "Provide final diagnostic summary and instructions"}
            </p>
          </div>
        </div>
        <div className="h-2 w-28 bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Demographics & History */}
      {step === 1 && (
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Child</label>
              <Select
                value={selectedChildId}
                onChange={handleChildSelect}
                options={children.map((c) => ({ label: `${c.name} (${c.id})`, value: c.id }))}
                placeholder="Select Child"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessment Type</label>
              <Select
                value={assessmentType}
                onChange={(v: any) => setAssessmentType(v)}
                options={[
                  { label: "Occupational Therapy Assessment", value: "Occupational Therapy" },
                  { label: "Physiotherapy Assessment", value: "Physiotherapy" },
                  { label: "Autism Screening Questionnaire", value: "Autism Screening" },
                  { label: "ADHD Screening Questionnaire", value: "ADHD Screening" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Main Concern</label>
            <textarea
              value={parentConcern}
              onChange={(e) => setParentConcern(e.target.value)}
              placeholder="Describe parents main developmental concerns..."
              className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">School/Nursery History</label>
            <input
              type="text"
              value={schoolHistory}
              onChange={(e) => setSchoolHistory(e.target.value)}
              placeholder="Describe adjustment in classroom, socialization..."
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </Card>
      )}

      {/* STEP 2: Milestones & Pregnancy */}
      {step === 2 && (
        <Card className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pregnancy History</label>
              <Select
                value={pregnancyHistory}
                onChange={(v: any) => setPregnancyHistory(v)}
                options={[
                  { label: "Normal Delivery", value: "Normal" },
                  { label: "C-section Delivery", value: "C-section" },
                  { label: "Premature Birth", value: "Premature" },
                  { label: "Complicated Birth", value: "Complications" },
                ]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pregnancy/Birth Details</label>
              <input
                type="text"
                value={pregnancyDetails}
                onChange={(e) => setPregnancyDetails(e.target.value)}
                placeholder="NICU stay length, breathing issues..."
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Developmental Milestones Checklist</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { state: headControl, setter: setHeadControl, label: "Head Control" },
                { state: sitting, setter: setSitting, label: "Independent Sitting" },
                { state: crawling, setter: setCrawling, label: "Crawling Development" },
                { state: walking, setter: setWalking, label: "Independent Walking" },
                { state: firstWords, setter: setFirstWords, label: "First Words (Speech)" },
                { state: toiletTraining, setter: setToiletTraining, label: "Toilet Training Complete" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/20 text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <div className="flex gap-1.5">
                    {["Normal", "Delayed"].map((val) => (
                      <button
                        key={val}
                        onClick={() => item.setter(val as any)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all border ${
                          item.state === val
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Clinical Observations */}
      {step === 3 && (
        <Card className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rate Clinical Indicators (3 = Yes/Typical, 2 = Sometimes, 1 = No/Deficit)</label>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {[
              { val: seatingTolerance, setter: setSeatingTolerance, label: "Seating Tolerance (>15 mins)" },
              { val: eyeContact, setter: setEyeContact, label: "Maintains Eye Contact" },
              { val: responseToName, setter: setResponseToName, label: "Responds to Name" },
              { val: jointAttention, setter: setJointAttention, label: "Maintains Joint Attention" },
              { val: followsSimpleCommands, setter: setFollowsSimpleCommands, label: "Follows Simple Commands" },
              { val: followsTwoStepCommands, setter: setFollowsTwoStepCommands, label: "Follows Two-Step Commands" },
              { val: attentionSpan, setter: setAttentionSpan, label: "Age-Appropriate Attention Span" },
              { val: taskCompletion, setter: setTaskCompletion, label: "Completes Standard Tasks" },
              { val: impulseControl, setter: setImpulseControl, label: "Demonstrates Impulse Control" },
              { val: functionalPlay, setter: setFunctionalPlay, label: "Engages in Functional Play" },
              { val: peerInteraction, setter: setPeerInteraction, label: "Interacts Positively with Peers" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 text-xs bg-slate-50/20">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <div className="flex gap-1">
                  {[3, 2, 1].map((n) => (
                    <button
                      key={n}
                      onClick={() => item.setter(n)}
                      className={`h-7 w-9 rounded-lg font-bold text-[10px] transition-all border ${
                        item.val === n
                          ? n === 3
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : n === 2
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* STEP 4: Impressions & Recommendations */}
      {step === 4 && (
        <Card className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Impression Summary</label>
            <textarea
              value={clinicalImpressionSummary}
              onChange={(e) => setClinicalImpressionSummary(e.target.value)}
              placeholder="Synthesize observation findings and milestone concerns into clinical summary..."
              className="w-full min-h-[100px] rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Therapeutic Recommendations</label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Recommend weekly session frequencies, home strategies, or school plans..."
              className="w-full min-h-[100px] rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </Card>
      )}

      {/* Wizard Footer controls */}
      <div className="flex justify-between items-center pt-2">
        <button
          disabled={step === 1}
          onClick={prevStep}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-blue-500/10 flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submitForm}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-emerald-500/10 flex items-center gap-1.5 animate-pulse"
          >
            <Check className="h-4 w-4" />
            Submit Assessment for Review
          </button>
        )}
      </div>
    </div>
  );
}
