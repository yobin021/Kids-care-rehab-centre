"use client";

import React, { useState } from "react";
import { Check, Calendar, Clock, Award, Sparkles } from "lucide-react";

export default function ParentHome() {
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false
  });

  const toggleExercise = (id: number) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Warm Welcome Card */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">
              Welcome back! Here is <span className="text-[#185FA5]">Arsh&apos;s</span> update for today.
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
              Keep up the great work with home exercises to support his progress!
            </p>
          </div>
        </div>
      </div>

      {/* Today's Home Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#2C2C2A]">Today&apos;s Home Exercises</h3>
          <span className="text-xs font-bold text-[#5F5E5A] bg-slate-200/60 px-2.5 py-1 rounded-full">
            {completedCount} of 3 completed today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <div className={`rounded-[12px] border p-5 transition-all flex flex-col justify-between ${
            completedExercises[1]
              ? "bg-[#3B6D11]/5 border-[#3B6D11]/40 shadow-xs"
              : "bg-white border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Cognitive
                </span>
                <span className="text-xs font-semibold text-[#5F5E5A] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  10 minutes
                </span>
              </div>
              <h4 className="text-[16px] font-bold text-[#2C2C2A]">Brain Gym Exercises</h4>
              <p className="text-xs text-[#5F5E5A] line-clamp-2 leading-relaxed">
                Simple body movements to improve coordination and attention readiness.
              </p>
            </div>

            <button
              onClick={() => toggleExercise(1)}
              className={`mt-5 w-full py-2.5 rounded-[8px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                completedExercises[1]
                  ? "bg-[#3B6D11] text-white"
                  : "bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] border border-[#D3D1C7]"
              }`}
            >
              {completedExercises[1] ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Done</span>
                </>
              ) : (
                <span>Mark as Done</span>
              )}
            </button>
          </div>

          {/* Card 2 */}
          <div className={`rounded-[12px] border p-5 transition-all flex flex-col justify-between ${
            completedExercises[2]
              ? "bg-[#3B6D11]/5 border-[#3B6D11]/40 shadow-xs"
              : "bg-white border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Communication
                </span>
                <span className="text-xs font-semibold text-[#5F5E5A] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  15 minutes
                </span>
              </div>
              <h4 className="text-[16px] font-bold text-[#2C2C2A]">Communication Cards</h4>
              <p className="text-xs text-[#5F5E5A] line-clamp-2 leading-relaxed">
                Use picture cards to practise requesting and expressing needs.
              </p>
            </div>

            <button
              onClick={() => toggleExercise(2)}
              className={`mt-5 w-full py-2.5 rounded-[8px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                completedExercises[2]
                  ? "bg-[#3B6D11] text-white"
                  : "bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] border border-[#D3D1C7]"
              }`}
            >
              {completedExercises[2] ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Done</span>
                </>
              ) : (
                <span>Mark as Done</span>
              )}
            </button>
          </div>

          {/* Card 3 */}
          <div className={`rounded-[12px] border p-5 transition-all flex flex-col justify-between ${
            completedExercises[3]
              ? "bg-[#3B6D11]/5 border-[#3B6D11]/40 shadow-xs"
              : "bg-white border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Sensory
                </span>
                <span className="text-xs font-semibold text-[#5F5E5A] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  20 minutes
                </span>
              </div>
              <h4 className="text-[16px] font-bold text-[#2C2C2A]">Sensory Integration</h4>
              <p className="text-xs text-[#5F5E5A] line-clamp-2 leading-relaxed">
                Controlled sensory activities to improve processing and calm behaviour.
              </p>
            </div>

            <button
              onClick={() => toggleExercise(3)}
              className={`mt-5 w-full py-2.5 rounded-[8px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                completedExercises[3]
                  ? "bg-[#3B6D11] text-white"
                  : "bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] border border-[#D3D1C7]"
              }`}
            >
              {completedExercises[3] ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Done</span>
                </>
              ) : (
                <span>Mark as Done</span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Next Clinic Appointment Card */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#185FA5] block">Next Clinic Appointment</span>
          <div className="flex items-center gap-4 text-xs font-bold text-[#2C2C2A] flex-wrap">
            <span>Date: <strong>Monday, 4 August 2026</strong></span>
            <span>•</span>
            <span>Time: <strong>10:00 AM</strong></span>
            <span>•</span>
            <span>Therapist: <strong className="text-[#185FA5]">Priya</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert("Added to calendar (demo action)")}
          className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors self-start sm:self-center cursor-pointer"
        >
          Add to Calendar
        </button>
      </div>

      {/* This Week's Progress Section */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#2C2C2A] uppercase tracking-wider">This Week&apos;s Progress</h3>
          <span className="text-xs font-bold text-[#3B6D11]">4 out of 5 days exercises completed</span>
        </div>

        <div className="w-full bg-[#F8F8F6] rounded-full h-3 overflow-hidden border border-[#D3D1C7]">
          <div className="bg-[#3B6D11] h-full rounded-full transition-all duration-500" style={{ width: "80%" }} />
        </div>
      </div>

    </div>
  );
}
