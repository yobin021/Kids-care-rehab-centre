"use client";

import React, { useState } from "react";
import { useDashboard, Child, Exercise, SessionLog } from "@/context/DashboardContext";
import { Card, Badge, Select } from "@/components/ui/ui";
import { Check, ChevronRight, ChevronLeft, AlertOctagon, Sparkles, AlertTriangle } from "lucide-react";

export default function SessionEntryForm() {
  const { children, activeTherapistId, therapists, logSession, setActiveTab } = useDashboard();
  
  const myChildren = children.filter((c) => c.assignedTherapistId === activeTherapistId && c.therapyPlan);

  const [step, setStep] = useState(1);
  const [selectedChildId, setSelectedChildId] = useState("");
  
  // Exercises state
  const [exerciseLogs, setExerciseLogs] = useState<{ [key: string]: { completed: boolean; response: "Good" | "Partial" | "Refused" | "" } }>({});
  
  // Metrics state
  const [cooperationLevel, setCooperationLevel] = useState<"Good" | "Moderate" | "Poor">("Good");
  const [attention, setAttention] = useState(true);
  const [eyeContact, setEyeContact] = useState(true);
  const [sittingTolerance, setSittingTolerance] = useState(true);
  const [motorSkills, setMotorSkills] = useState(true);
  const [speechResponse, setSpeechResponse] = useState(true);

  // Notes & Escalation state
  const [sessionNotes, setSessionNotes] = useState("");
  const [parentFeedback, setParentFeedback] = useState("");
  const [behaviorNotes, setBehaviorNotes] = useState("");
  const [raiseEscalation, setRaiseEscalation] = useState(false);
  const [escalationType, setEscalationType] = useState<"Aggression" | "Sensory Overload" | "Therapy Refusal" | "Behavioral Issue">("Behavioral Issue");
  const [escalationDesc, setEscalationDesc] = useState("");

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    const childObj = children.find((c) => c.id === childId);
    const exercises = childObj?.therapyPlan?.exercises || [];
    const initLogs: typeof exerciseLogs = {};
    exercises.forEach((ex) => {
      initLogs[ex.id] = { completed: true, response: "Good" };
    });
    setExerciseLogs(initLogs);
  };

  const handleExerciseCheck = (exId: string, checked: boolean) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], completed: checked, response: checked ? "Good" : "Refused" },
    }));
  };

  const handleExerciseResponseChange = (exId: string, response: "Good" | "Partial" | "Refused") => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], response },
    }));
  };

  const validateStep = () => {
    if (step === 1 && !selectedChildId) {
      alert("Please select a child to proceed.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  const submitForm = () => {
    if (!selectedChild) return;
    
    const therapistObj = therapists.find((t) => t.id === activeTherapistId);
    
    const exercisesPlanned = selectedChild.therapyPlan?.exercises.map((e) => e.name) || [];
    const exercisesCompleted = selectedChild.therapyPlan?.exercises
      .filter((e) => exerciseLogs[e.id]?.completed)
      .map((e) => e.name) || [];

    const sessionLog: Omit<SessionLog, "id"> = {
      date: new Date().toISOString().split("T")[0],
      therapistName: therapistObj?.name || "Staff",
      therapyType: selectedChild.therapyPlan?.type || "Rehab",
      cooperationLevel,
      exercisesPlanned,
      exercisesCompleted,
      improvementIndicators: {
        attention,
        eyeContact,
        sittingTolerance,
        speechResponse,
        motorSkills,
      },
      behaviorNotes: raiseEscalation ? `${escalationType}: ${behaviorNotes}` : behaviorNotes || "Cooperative",
      parentFeedback,
      sessionNotes,
    };

    logSession(
      selectedChildId,
      sessionLog,
      raiseEscalation,
      escalationType,
      escalationDesc || behaviorNotes
    );

    // Reset form states
    setStep(1);
    setSelectedChildId("");
    setExerciseLogs({});
    setCooperationLevel("Good");
    setSessionNotes("");
    setParentFeedback("");
    setBehaviorNotes("");
    setRaiseEscalation(false);
    setEscalationDesc("");

    // Route to Home Overview
    setActiveTab("therapist-home");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 text-blue-700 h-8 w-8 flex items-center justify-center font-extrabold text-xs">
            Step {step} of 4
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {step === 1 && "1. Select Child"}
              {step === 2 && "2. Exercises Logsheet"}
              {step === 3 && "3. Cooperation & Progress"}
              {step === 4 && "4. Remarks & Clinical Flags"}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {step === 1 && "Choose child from your active caseload"}
              {step === 2 && "Check off completed exercises and child response"}
              {step === 3 && "Score clinical indicators of improvement"}
              {step === 4 && "Log notes or raise escalation reports"}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-28 bg-slate-100 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Select Child */}
      {step === 1 && (
        <Card className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Child Patient</label>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {myChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => handleChildSelect(child.id)}
                className={`flex items-center justify-between rounded-2xl border p-4.5 cursor-pointer transition-all ${
                  selectedChildId === child.id
                    ? "bg-blue-50/30 border-blue-500 shadow-sm"
                    : "border-slate-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {child.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{child.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{child.id} | {child.diagnosis}</p>
                  </div>
                </div>
                {selectedChildId === child.id && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* STEP 2: Exercises Logsheet */}
      {step === 2 && selectedChild && (
        <Card className="space-y-4">
          <div className="rounded-xl bg-blue-50/40 border border-blue-100/40 p-3.5 mb-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Child Profile</span>
            <h4 className="text-xs font-bold text-slate-800">{selectedChild.name} ({selectedChild.id})</h4>
            <p className="text-[10px] text-slate-500 font-medium">Prescribed plan: {selectedChild.therapyPlan?.type}</p>
          </div>

          <div className="space-y-3.5">
            {selectedChild.therapyPlan?.exercises.map((ex) => {
              const logVal = exerciseLogs[ex.id] || { completed: false, response: "" };
              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                    logVal.completed ? "bg-white border-blue-150 shadow-xs" : "bg-slate-50/40 border-slate-100 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={logVal.completed}
                        onChange={(e) => handleExerciseCheck(ex.id, e.target.checked)}
                        className="h-4.5 w-4.5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800">{ex.name}</span>
                    </div>
                    <Badge variant="secondary">{ex.duration}</Badge>
                  </div>

                  {logVal.completed && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50 text-[11px]">
                      <span className="font-bold text-slate-400 uppercase text-[9px]">Child Response:</span>
                      {["Good", "Partial", "Refused"].map((resp) => (
                        <button
                          key={resp}
                          onClick={() => handleExerciseResponseChange(ex.id, resp as any)}
                          className={`rounded-xl px-3 py-1.5 font-bold transition-all border ${
                            logVal.response === resp
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {resp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 3: Cooperation & Progress */}
      {step === 3 && (
        <Card className="space-y-6">
          {/* Cooperation Level */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cooperation Level</label>
            <div className="grid grid-cols-3 gap-3">
              {["Good", "Moderate", "Poor"].map((level) => (
                <button
                  key={level}
                  onClick={() => setCooperationLevel(level as any)}
                  className={`rounded-2xl py-3 text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                    cooperationLevel === level
                      ? level === "Good"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                        : level === "Moderate"
                        ? "bg-amber-50 border-amber-300 text-amber-700 shadow-xs"
                        : "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Improvement Indicators Checklist */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Session Progress Indicators</label>
            <p className="text-[10px] text-slate-400 font-semibold mb-2">Check domains where child demonstrated active progress or coordination today.</p>
            
            <div className="space-y-2">
              {[
                { state: eyeContact, setter: setEyeContact, label: "Maintained Eye Contact (Social)" },
                { state: attention, setter: setAttention, label: "Sustained Attention Span (Cognitive)" },
                { state: sittingTolerance, setter: setSittingTolerance, label: "Maintained Sitting/Physical Tolerance" },
                { state: motorSkills, setter: setMotorSkills, label: "Good Motor Balance/Coordination" },
                { state: speechResponse, setter: setSpeechResponse, label: "Responsive Speech Articulation" },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 cursor-pointer transition-colors text-xs font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Remarks & Clinical Flags */}
      {step === 4 && (
        <Card className="space-y-5">
          {/* Notes Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Therapist Session Notes</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Log activity findings, successes, or behavioral issues..."
                className="w-full min-h-[90px] rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Homework/Feedback</label>
              <textarea
                value={parentFeedback}
                onChange={(e) => setParentFeedback(e.target.value)}
                placeholder="Guidelines or exercises for parent training at home..."
                className="w-full min-h-[90px] rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Behavior Notes</label>
            <input
              type="text"
              value={behaviorNotes}
              onChange={(e) => setBehaviorNotes(e.target.value)}
              placeholder="e.g. Fidgety but cooperative; minor auditory sensitivity..."
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Incident Escalation Box */}
          <div className={`rounded-2xl border p-4.5 space-y-4 transition-all ${
            raiseEscalation ? "bg-rose-50/10 border-rose-200" : "bg-slate-50/30 border-slate-100"
          }`}>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={raiseEscalation}
                onChange={(e) => setRaiseEscalation(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertOctagon className="h-4.5 w-4.5 text-rose-600" />
                Raise Urgent Incident Escalation
              </span>
            </label>

            {raiseEscalation && (
              <div className="space-y-4 border-t border-rose-100/50 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Incident Category</label>
                  <Select
                    value={escalationType}
                    onChange={(v: any) => setEscalationType(v)}
                    options={[
                      { label: "Aggression (Hitting/Biting)", value: "Aggression" },
                      { label: "Sensory Overload Meltdown", value: "Sensory Overload" },
                      { label: "Therapy Refusal", value: "Therapy Refusal" },
                      { label: "Other Behavioral Issue", value: "Behavioral Issue" },
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Incident Details & Observations</label>
                  <textarea
                    value={escalationDesc}
                    onChange={(e) => setEscalationDesc(e.target.value)}
                    placeholder="Provide specific notes regarding safety issues, intensity, triggers, or interventions used..."
                    className="w-full min-h-[80px] rounded-xl border border-rose-200 p-3 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
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
            Complete & Submit Session
          </button>
        )}
      </div>
    </div>
  );
}
