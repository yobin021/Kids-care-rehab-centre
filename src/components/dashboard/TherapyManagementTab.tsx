"use client";

import React, { useState } from "react";
import { useDashboard, Child, Exercise } from "@/context/DashboardContext";
import { Card, Badge, Dialog, Select } from "@/components/ui/ui";
import { Settings, Plus, Trash2, CheckCircle, Search, Edit3 } from "lucide-react";

const CLINICAL_EXERCISE_LIBRARY: Omit<Exercise, "completed" | "response">[] = [
  { id: "pe-1", name: "Sit-to-Stand Exercise", category: "PT", goal: "Strengthen lower extremities and trunk", description: "The child sits on a chair or bench with feet flat on the floor, stands up without using hands if possible, then slowly sits back down.", instructions: "Repeat 10 times, 3 sets. Ensure knee alignment over toes.", duration: "10 mins" },
  { id: "pe-2", name: "Squats for Children", category: "PT", goal: "Build quad strength and core stability", description: "Child stands with feet shoulder-width apart, bends knees keeping back straight, lowers body, and returns to stand.", instructions: "Repeat 8-12 reps, 3 sets. Use toys/games to make it engaging.", duration: "8 mins" },
  { id: "pe-3", name: "Single-Leg Standing", category: "PT", goal: "Improve static balance", description: "Child stands upright and lifts one foot off the ground, maintaining balance.", instructions: "Hold for 10-15 seconds. Repeat 3 times per leg. Provide light support if needed.", duration: "5 mins" },
  { id: "pe-4", name: "Seated Balance on Therapy Ball", category: "PT", goal: "Improve dynamic trunk stability", description: "Child sits on therapy ball with feet flat. Therapist encourages reaching for toys, clapping, or catching balls.", instructions: "Perform reaching tasks in all directions for 5-10 minutes.", duration: "10 mins" },
  { id: "pe-5", name: "Standing Balance Exercise", category: "PT", goal: "Enhance standing equilibrium", description: "Child stands with feet apart or together and maintains balance on foam padding or uneven surfaces.", instructions: "Hold balance for 30s, repeat 5 times. Incorporate ball catch.", duration: "8 mins" },
  { id: "pe-6", name: "Heel-to-Toe Walking", category: "PT", goal: "Dynamic balance and coordination", description: "Child walks slowly along a straight line, placing each heel directly in front of the opposite foot's toes.", instructions: "Walk 10 steps forward and backward. Use colorful tape on floor.", duration: "5 mins" },
  { id: "pe-7", name: "Stair Climbing Exercise", category: "PT", goal: "Functional mobility and coordination", description: "Child climbs up and down stairs using handrails or therapist support.", instructions: "Ascend and descend 1 flight of stairs, 3 times. Focus on reciprocal foot placement.", duration: "10 mins" },
  { id: "pe-8", name: "Crawling Activities", category: "PT", goal: "Bilateral integration and shoulder stability", description: "Child crawls on hands and knees across floor, through play tunnels, or over cushions.", instructions: "Crawl through 5m tunnel, retrieve toy, and crawl back. Repeat 5 times.", duration: "7 mins" },
  { id: "pe-9", name: "Bear Walk", category: "PT", goal: "Strengthen shoulders, hips, and core", description: "Child places hands and feet on floor, lifts knees, and walks forward keeping hips raised.", instructions: "Bear walk for 10 meters. Incorporate in obstacle course.", duration: "5 mins" },
  { id: "pe-10", name: "Crab Walk", category: "PT", goal: "Trunk and upper limb extensor strengthening", description: "Child sits on floor, places hands behind them, lifts hips, and walks forward/sideways.", instructions: "Walk 5 meters forward and backward. Focus on keeping hips high.", duration: "5 mins" },
  { id: "pe-11", name: "Tandem Walking", category: "PT", goal: "Advance narrow base of support balance", description: "Child walks slowly along balance beam or straight line placing one foot directly in front of the other.", instructions: "Walk 15 feet. Assist with handhold if needed.", duration: "6 mins" },
  { id: "pe-12", name: "Balance Board Activities", category: "PT", goal: "Proprioceptive training", description: "Child stands or sits on balance board, maintaining stability while reaching for items.", instructions: "Maintain balance for 1 min. Play catch with a light balloon.", duration: "8 mins" },
  { id: "pe-13", name: "Treadmill Activities", category: "PT", goal: "Gait symmetry and cardiovascular endurance", description: "Child walks on treadmill at slow, comfortable speed under strict supervision.", instructions: "Walk at 0.8 km/h for 5 minutes. Adjust speed based on gait pattern.", duration: "5 mins" },
  { id: "pe-14", name: "Ball Kicking Activities", category: "PT", goal: "Single limb support and eye-foot coordination", description: "Child stands and kicks ball towards a goal, alternating feet.", instructions: "Kick ball towards target 10 times with each foot. Distance 3 meters.", duration: "7 mins" },
  { id: "pe-15", name: "Wall Push-Ups", category: "PT", goal: "Upper body strength and joint loading", description: "Child faces wall at arms length, places hands at shoulder height, bends elbows to bring body closer, and pushes back.", instructions: "Perform 12 repetitions, 2 sets. Keep back straight and heels flat.", duration: "5 mins" },
  { id: "oe-1", name: "Pencil Grasp Training", category: "OT", goal: "Improve tripod grasp pattern", description: "Using adaptive grips, writing tasks, and coloring templates to enforce standard finger placement.", instructions: "Color inside lines of simple shape for 5 mins using tripod grip.", duration: "10 mins" },
  { id: "oe-2", name: "Bead Threading", category: "OT", goal: "Enhance fine motor precision and focus", description: "Child threads colorful wooden beads of decreasing sizes onto a lace.", instructions: "Thread 15 beads. Encourage pincer grasp for holding beads.", duration: "8 mins" },
  { id: "oe-3", name: "Sensory Brush / Joint Compression", category: "OT", goal: "Sensory regulation and joint awareness", description: "Wilbarger brushing protocol followed by gentle compression on elbows, shoulders, hips, and knees.", instructions: "Brush back and limbs, perform 10 gentle compression pulses per joint.", duration: "10 mins" },
  { id: "oe-4", name: "Clay Sculpting (Play-doh)", category: "OT", goal: "Hand intrinsic muscle strengthening", description: "Kneading, rolling, and cutting clay to retrieve small hidden toys.", instructions: "Find 6 plastic beads hidden in medium-resistance therapy putty.", duration: "10 mins" },
];

export default function TherapyManagementTab() {
  const { children, approveTherapyPlan, modifyExercises } = useDashboard();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [searchExercise, setSearchExercise] = useState("");

  const handleOpenModifier = (child: Child) => {
    setSelectedChild(child);
    setCurrentExercises(child.therapyPlan?.exercises || []);
    setSearchExercise("");
    setIsModifierOpen(true);
  };

  const handleAddExercise = (tpl: any) => {
    const isAlreadyAdded = currentExercises.some((ex) => ex.name === tpl.name);
    if (isAlreadyAdded) return;

    setCurrentExercises((prev) => [
      ...prev,
      {
        ...tpl,
        completed: false,
        response: "",
      },
    ]);
  };

  const handleRemoveExercise = (idx: number) => {
    setCurrentExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateDuration = (idx: number, duration: string) => {
    setCurrentExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, duration } : ex))
    );
  };

  const savePlanModifications = () => {
    if (selectedChild) {
      modifyExercises(selectedChild.id, currentExercises);
      setIsModifierOpen(false);
      setSelectedChild(null);
    }
  };

  const getPlanStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending Review":
        return "info";
      case "Needs Modification":
        return "danger";
      default:
        return "secondary";
    }
  };

  const filteredLibrary = CLINICAL_EXERCISE_LIBRARY.filter((ex) =>
    ex.name.toLowerCase().includes(searchExercise.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Therapy Plans Board */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {children
          .filter((c) => c.therapyPlan !== undefined)
          .map((child) => (
            <Card key={child.id} className="flex flex-col justify-between border-blue-50/75">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase">{child.id}</h4>
                    <h3 className="text-sm font-extrabold text-slate-800 mt-0.5">{child.name}</h3>
                  </div>
                  <Badge variant={getPlanStatusVariant(child.therapyPlan!.status)}>
                    {child.therapyPlan!.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[9px] uppercase">Therapy Type</span>
                    <span className="font-semibold text-slate-700">{child.therapyPlan!.type}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block text-[9px] uppercase">Active Exercises ({child.therapyPlan!.exercises.length})</span>
                    <p className="text-slate-600 line-clamp-1 truncate font-semibold">
                      {child.therapyPlan!.exercises.map((e) => e.name).join(", ") || "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-3.5 gap-2">
                {child.therapyPlan!.status !== "Approved" && (
                  <button
                    onClick={() => approveTherapyPlan(child.id)}
                    className="flex-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 py-2 text-[10px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve Plan
                  </button>
                )}
                <button
                  onClick={() => handleOpenModifier(child)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2 text-[10px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Modify Plan
                </button>
              </div>
            </Card>
          ))}
      </div>

      {/* Plan Modifier Dialog Modal */}
      <Dialog
        isOpen={isModifierOpen}
        onClose={() => setIsModifierOpen(false)}
        title={selectedChild ? `Modify Therapy Plan: ${selectedChild.name}` : ""}
        maxWidth="5xl"
      >
        {selectedChild && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Active Exercises Grid */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Active Exercise list</h4>
                <p className="text-[10px] text-slate-400 font-semibold">These exercises appear on the therapist's terminal for daily entry.</p>
              </div>
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {currentExercises.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No exercises assigned. Select from library on right.</p>
                ) : (
                  currentExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 space-y-2 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{ex.name}</span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-600 uppercase border border-blue-100">
                            {ex.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveExercise(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug italic">"{ex.goal}"</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400">Dose/Duration:</label>
                        <input
                          type="text"
                          value={ex.duration}
                          onChange={(e) => handleUpdateDuration(idx, e.target.value)}
                          className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                          placeholder="e.g. 10 mins or 3 sets of 12 reps"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModifierOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePlanModifications}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700"
                >
                  Save & Apply Plan
                </button>
              </div>
            </div>

            {/* Right: Pediatric Exercise Library Search */}
            <div className="border-l border-slate-100 pl-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Pediatric Exercise Library</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Select physical or occupational therapy exercises to add to the prescription plan.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exercise catalog..."
                  value={searchExercise}
                  onChange={(e) => setSearchExercise(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 pl-9.5 pr-4 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filteredLibrary.map((item) => {
                  const isAssigned = currentExercises.some((ex) => ex.name === item.name);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 flex items-start justify-between gap-3 text-xs transition-all ${
                        isAssigned
                          ? "bg-slate-50/60 border-slate-100 opacity-60"
                          : "border-slate-100 hover:border-blue-200 hover:shadow-xs"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="rounded-full bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-400 border uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{item.description}</p>
                      </div>
                      <button
                        disabled={isAssigned}
                        onClick={() => handleAddExercise(item)}
                        className={`rounded-lg p-1.5 shrink-0 ${
                          isAssigned
                            ? "text-slate-300"
                            : "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                        }`}
                      >
                        <Plus className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
