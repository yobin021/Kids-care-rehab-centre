"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { mockExercises } from "../data/mockData";
import { Check, RotateCcw, Send, CheckCircle2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";

export default function ParentExercises() {
  const { user, childrenList, showToast } = useAuth();
  const child = childrenList.find((c) => c.id === user?.childId) || childrenList[1] || childrenList[0];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const initialList = [
    { ...mockExercises[0], done: true, rating: "Great", openSteps: false },
    { ...mockExercises[2], done: true, rating: "Okay", openSteps: false },
    { ...mockExercises[1], done: false, rating: null, openSteps: false }
  ];

  const [exerciseList, setExerciseList] = useState(initialList);
  const [feedbackText, setFeedbackText] = useState("");

  const toggleDone = (id) => {
    setExerciseList((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, done: !ex.done, rating: !ex.done ? "Great" : null } : ex))
    );
  };

  const setRating = (id, rating) => {
    setExerciseList((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, rating } : ex))
    );
  };

  const toggleInstructions = (id) => {
    setExerciseList((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, openSteps: !ex.openSteps } : ex))
    );
  };

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    const key = `parent_feedback_${child?.id}_${new Date().toISOString().split("T")[0]}`;
    localStorage.setItem(key, feedbackText);
    showToast("Message sent! Your therapist will see this at the next session.", "success");
    setFeedbackText("");
  };

  const completedCount = exerciseList.filter((ex) => ex.done).length;
  const progressPercent = Math.round((completedCount / exerciseList.length) * 100);

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2">
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C2A]">{child?.name}&apos;s Exercises</h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">Today — {todayStr}</p>
        </div>

        <ProgressBar
          value={progressPercent}
          color="#3B6D11"
          label={`${completedCount} of ${exerciseList.length} completed today`}
        />
      </div>

      <div className="space-y-4">
        {exerciseList.map((ex) => (
          <div
            key={ex.id}
            className={`p-6 rounded-[12px] border transition-all space-y-4 ${
              ex.done
                ? "bg-[#3B6D11]/5 border-[#3B6D11]/40 shadow-xs"
                : "bg-white border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-[#2C2C2A]">{ex.name}</h3>
                  {ex.done && (
                    <span className="text-xs font-bold text-[#3B6D11] flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed today!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={ex.category} variant="blue" size="sm" />
                  <Badge label={ex.duration} variant="gray" size="sm" />
                </div>
              </div>
            </div>

            <p className="text-[14px] text-[#5F5E5A] leading-relaxed">
              {ex.homeDescription || ex.description}
            </p>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-[#9B9A96]">Benefits:</span>
              <ul className="text-xs text-[#5F5E5A] space-y-1 list-disc pl-4 font-semibold">
                {ex.benefits.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>

            <div>
              <button
                type="button"
                onClick={() => toggleInstructions(ex.id)}
                className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{ex.openSteps ? "Hide ▲" : "See Instructions ▼"}</span>
              </button>

              {ex.openSteps && (
                <ol className="mt-3 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs space-y-1.5 list-decimal pl-5 font-semibold text-[#2C2C2A]">
                  {ex.instructions.map((stepStr, idx) => (
                    <li key={idx}>{stepStr}</li>
                  ))}
                </ol>
              )}
            </div>

            <div className="pt-3 border-t border-[#D3D1C7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {ex.done ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5F5E5A]">How did it go?</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRating(ex.id, "Great")}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                          ex.rating === "Great"
                            ? "bg-[#3B6D11] text-white border-[#3B6D11] scale-105"
                            : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                        }`}
                      >
                        😊 Great
                      </button>
                      <button
                        type="button"
                        onClick={() => setRating(ex.id, "Okay")}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                          ex.rating === "Okay"
                            ? "bg-[#854F0B] text-white border-[#854F0B] scale-105"
                            : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                        }`}
                      >
                        😐 Okay
                      </button>
                      <button
                        type="button"
                        onClick={() => setRating(ex.id, "Hard")}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all border cursor-pointer ${
                          ex.rating === "Hard"
                            ? "bg-[#993C1D] text-white border-[#993C1D] scale-105"
                            : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-100"
                        }`}
                      >
                        😢 Hard
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDone(ex.id)}
                    className="text-xs text-[#9B9A96] hover:text-[#2C2C2A] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Undo</span>
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  fullWidth
                  icon={Check}
                  onClick={() => toggleDone(ex.id)}
                  className="bg-[#3B6D11] hover:bg-[#2e550d]"
                >
                  ✓ Mark as Done
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card title="This Week">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold pt-1">
          {[
            { day: "Mon", status: "completed" },
            { day: "Tue", status: "completed" },
            { day: "Wed", status: "pending" },
            { day: "Thu", status: "future" },
            { day: "Fri", status: "future" },
            { day: "Sat", status: "future" },
            { day: "Sun", status: "future" }
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <span className="text-[10px] text-[#5F5E5A] block">{item.day}</span>
              <div
                className={`h-9 w-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs border ${
                  item.status === "completed"
                    ? "bg-[#3B6D11] text-white border-[#3B6D11]"
                    : item.status === "pending"
                    ? "bg-[#854F0B]/20 text-[#854F0B] border-[#854F0B]"
                    : "bg-[#F8F8F6] text-[#9B9A96] border-[#D3D1C7]"
                }`}
              >
                {item.status === "completed" ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Message Your Therapist" subtitle="Share how your child is doing at home.">
        <form onSubmit={handleSendFeedback} className="space-y-3">
          <textarea
            rows={3}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="e.g. Arsh enjoyed the sensory activity today but found the communication cards difficult."
            className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold text-[#2C2C2A] outline-none focus:border-[#0F6E56]"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" icon={Send}>
              Send Message
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
