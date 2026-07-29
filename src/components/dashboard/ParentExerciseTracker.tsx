"use client";

import React, { useState } from "react";
import { Check, Clock, Sparkles, Smile, Meh, Frown, CheckCircle2, RotateCcw } from "lucide-react";

interface ExerciseItem {
  id: number;
  name: string;
  category: string;
  categoryColor: string;
  duration: string;
  description: string;
  benefits: string[];
  done: boolean;
  rating?: "Great" | "Okay" | "Difficult";
}

export default function ParentExerciseTracker() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    {
      id: 1,
      name: "Brain Gym Exercises",
      category: "Cognitive",
      categoryColor: "bg-blue-100 text-blue-800 border-blue-200",
      duration: "10 minutes",
      description: "Simple body movements that help your child's brain and body work together. Great to do first thing in the morning.",
      benefits: [
        "Improves focus and attention",
        "Helps the child feel calm and ready to learn",
        "Strengthens coordination"
      ],
      done: true,
      rating: "Great"
    },
    {
      id: 2,
      name: "Communication Cards",
      category: "Communication",
      categoryColor: "bg-teal-100 text-teal-800 border-teal-200",
      duration: "15 minutes",
      description: "Show your child picture cards and encourage them to name or point to each one. Use cards for daily items like food, toys, and clothes.",
      benefits: [
        "Builds vocabulary",
        "Encourages pointing and requesting",
        "Reduces frustration from not being understood"
      ],
      done: true,
      rating: "Okay"
    },
    {
      id: 3,
      name: "Sensory Integration Activity",
      category: "Sensory",
      categoryColor: "bg-purple-100 text-purple-800 border-purple-200",
      duration: "20 minutes",
      description: "Allow your child to play with different textures — sand, clay, water — for 20 minutes. Let them explore freely without pressure.",
      benefits: [
        "Reduces sensory over-sensitivity",
        "Improves body awareness",
        "Promotes calm behaviour"
      ],
      done: false
    }
  ]);

  const toggleDone = (id: number) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, done: !ex.done, rating: !ex.done ? "Great" : undefined } : ex))
    );
  };

  const setRating = (id: number, rating: "Great" | "Okay" | "Difficult") => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, rating } : ex))
    );
  };

  const completedCount = exercises.filter((ex) => ex.done).length;
  const progressPercent = Math.round((completedCount / exercises.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[#2C2C2A]">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">
              Arsh&apos;s Exercises for Today — <span className="text-[#185FA5]">Monday, 28 July 2026</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
              Complete all exercises and mark each one done to support your child&apos;s routine.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 bg-[#3B6D11]/10 text-[#3B6D11] rounded-full self-start sm:self-center border border-[#3B6D11]/30">
            {completedCount} of {exercises.length} completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F8F8F6] rounded-full h-3 overflow-hidden border border-[#D3D1C7]">
          <div
            className="bg-[#3B6D11] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stacked Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className={`p-6 rounded-[12px] border transition-all space-y-4 ${
              ex.done
                ? "bg-[#3B6D11]/5 border-[#3B6D11]/40 shadow-xs"
                : "bg-white border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            }`}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#2C2C2A]">{ex.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${ex.categoryColor}`}>
                  {ex.category}
                </span>
                <span className="text-xs font-bold text-[#5F5E5A] bg-[#F8F8F6] px-2.5 py-0.5 rounded-full border border-[#D3D1C7] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {ex.duration}
                </span>
              </div>
            </div>

            {/* Middle Section */}
            <div className="space-y-2">
              <p className="text-xs text-[#5F5E5A] leading-relaxed font-medium">
                {ex.description}
              </p>

              <div className="pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#185FA5] block mb-1">
                  Key Benefits:
                </span>
                <ul className="text-xs text-[#2C2C2A] font-semibold space-y-1">
                  {ex.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#185FA5]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-[#D3D1C7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {ex.done ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3B6D11] flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed today
                  </span>
                  <button
                    onClick={() => toggleDone(ex.id)}
                    className="text-[11px] font-bold text-[#5F5E5A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Undo</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleDone(ex.id)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#3B6D11] border border-[#3B6D11] text-xs font-extrabold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Mark as Done ✓</span>
                </button>
              )}

              {/* How did it go? Emoji selector */}
              {ex.done && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#5F5E5A]">How did it go?</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRating(ex.id, "Great")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                        ex.rating === "Great"
                          ? "bg-emerald-600 text-white border-emerald-600 scale-105"
                          : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                      }`}
                    >
                      😊 Great
                    </button>
                    <button
                      onClick={() => setRating(ex.id, "Okay")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                        ex.rating === "Okay"
                          ? "bg-amber-600 text-white border-amber-600 scale-105"
                          : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                      }`}
                    >
                      😐 Okay
                    </button>
                    <button
                      onClick={() => setRating(ex.id, "Difficult")}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                        ex.rating === "Difficult"
                          ? "bg-rose-600 text-white border-rose-600 scale-105"
                          : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                      }`}
                    >
                      😢 Difficult
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* This Week Summary Card */}
      <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <h3 className="text-xs font-extrabold text-[#2C2C2A] uppercase tracking-wider">This Week&apos;s Summary</h3>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold">
          {[
            { day: "Mon", status: "completed" },
            { day: "Tue", status: "completed" },
            { day: "Wed", status: "completed" },
            { day: "Thu", status: "completed" },
            { day: "Fri", status: "pending" },
            { day: "Sat", status: "pending" },
            { day: "Sun", status: "pending" }
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <span className="text-[10px] text-[#5F5E5A] block">{item.day}</span>
              <div
                className={`h-9 w-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs border ${
                  item.status === "completed"
                    ? "bg-[#3B6D11] text-white border-[#3B6D11]"
                    : "bg-[#F8F8F6] text-slate-400 border-[#D3D1C7]"
                }`}
              >
                {item.status === "completed" ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
