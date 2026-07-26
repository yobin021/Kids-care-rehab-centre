"use client";

import React, { useState } from "react";
import { useDashboard, Exercise } from "@/context/DashboardContext";
import { Card, Badge, Dialog } from "@/components/ui/ui";
import {
  Play,
  CheckCircle,
  HelpCircle,
  Video,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
} from "lucide-react";

export default function ParentExercises() {
  const { children, activeChildId } = useDashboard();
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);
  const [completedToday, setCompletedToday] = useState<Record<string, boolean>>({});

  const child = children.find((c) => c.id === activeChildId) || children[0];

  if (!child) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100 animate-in fade-in duration-300">
        <p className="text-sm font-semibold text-slate-400">No registered child found in this account.</p>
      </div>
    );
  }

  const exercises = child.therapyPlan?.exercises || [];
  const homeProgramAdvice = child.therapyPlan?.homeProgram || "Please practice the exercises 2-3 times per week as instructed by your therapist.";

  const toggleComplete = (exerciseId: string) => {
    setCompletedToday((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Home Program & Exercises</h1>
        <p className="text-sm font-semibold text-slate-500">
          Prescribed routines and activities to practice with {child.name} at home.
        </p>
      </div>

      {/* Therapist Home Advice Callout */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex gap-4 items-start p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
          💡
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-amber-900">Therapist&apos;s Special Advice</h4>
          <p className="text-xs font-semibold text-amber-800 leading-relaxed">
            {homeProgramAdvice}
          </p>
        </div>
      </Card>

      {/* Exercises Roster */}
      <div className="space-y-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Prescribed Exercises ({exercises.length})
        </h3>

        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercises.map((ex) => {
              const isDone = completedToday[ex.id];
              return (
                <Card
                  key={ex.id}
                  className={`relative flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                    isDone
                      ? "border-emerald-200 bg-emerald-50/20 shadow-inner"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Category & Complete Checkbox */}
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 tracking-wider">
                        {ex.category} Activity
                      </span>
                      <button
                        onClick={() => toggleComplete(ex.id)}
                        className={`flex h-8 px-3 items-center gap-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle className={`h-4 w-4 ${isDone ? "fill-white text-emerald-500" : ""}`} />
                        {isDone ? "Completed Today" : "Mark Done"}
                      </button>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800">{ex.name}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">Goal: {ex.goal}</p>
                    </div>

                    {/* Step-by-Step Description */}
                    <div className="rounded-xl bg-slate-50/80 p-3.5 border border-slate-100/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Instructions
                      </span>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        {ex.description}
                      </p>
                    </div>

                    {/* Tips & Specific Advice */}
                    {ex.instructions && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Parent Guide / Tip
                        </span>
                        <p className="text-xs font-semibold text-blue-700/80 leading-relaxed">
                          📌 {ex.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer: Duration, Video Play, and Details */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{ex.duration}</span>
                    </div>

                    <button
                      onClick={() => setSelectedVideoExercise(ex)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-extrabold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Watch Video</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-300 stroke-1 mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No active home program assigned.</h4>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              When {child.name}&apos;s therapist assigns custom motor or speech activities, they will appear here.
            </p>
          </Card>
        )}
      </div>

      {/* Video Demonstration Modal */}
      <Dialog
        isOpen={selectedVideoExercise !== null}
        onClose={() => setSelectedVideoExercise(null)}
        title={selectedVideoExercise ? `Video: ${selectedVideoExercise.name}` : ""}
        maxWidth="md"
      >
        {selectedVideoExercise && (
          <div className="space-y-6">
            {/* Mock Video Container */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center shadow-lg border border-slate-800">
              <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent" />
              
              {/* Play symbol button with subtle pulsing animation */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <Play className="h-7 w-7 fill-white translate-x-0.5" />
              </div>
              
              <div className="relative z-10 mt-4 text-xs font-extrabold text-slate-300 tracking-wide uppercase">
                Demo Video Placeholder
              </div>
              <p className="relative z-10 text-[10px] text-slate-400 font-medium max-w-xs mx-auto mt-1 px-4">
                Watch a staff therapist perform {selectedVideoExercise.name} correctly.
              </p>

              {/* Progress bar in video */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full w-1/3 bg-blue-500" />
              </div>
            </div>

            {/* Exercise specifications */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">Objectives</h4>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  🎯 {selectedVideoExercise.goal}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50/40 p-4 border border-blue-50/20">
                <div className="flex gap-2 text-xs leading-relaxed text-slate-700">
                  <Flame className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-800">Clinical Tip: </span>
                    <span className="font-semibold">{selectedVideoExercise.instructions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedVideoExercise(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors"
              >
                Close Demo
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
