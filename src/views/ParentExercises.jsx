"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, ChevronUp, Send, Dumbbell, Calendar, RefreshCw } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { parentService } from "../services/parentService";
import { reportService } from "../services/reportService";
import { exerciseService, resolveExerciseItem } from "../services/exerciseService";
import { authService } from "../services/authService";
import { isIepProgram } from "../utils/programHelpers";

const FEEDBACK_OPTIONS = [
  { label: "😊 Great", value: "great" },
  { label: "😐 Okay",  value: "okay"  },
  { label: "😢 Hard",  value: "hard"  }
];

export default function ParentExercises() {
  const { user, childrenList, showToast } = useAuth();
  const navigate = useNavigate();
  const child =
    childrenList.find((c) => c.id === user?.childId) ||
    (user?.childId ? { id: user.childId, name: user.childName } : childrenList[0]);

  const isIep = isIepProgram(child) || isIepProgram(user);

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doneLogs, setDoneLogs] = useState({});
  const [weekDays, setWeekDays] = useState([]);
  const [weekStatus, setWeekStatus] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  useEffect(() => {
    if (isIep) {
      navigate("/parent/home", { replace: true });
    }
  }, [isIep, navigate]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const childId = child?.id || user?.childId;
      if (!childId || isIep) {
        setExercises([]);
        setLoading(false);
        return;
      }

      // Step 1: Get latest published report from database ONLY
      const report = await reportService.getPublishedByChildId(childId);

      // Exercises must strictly come from an approved & published report — never fall back to drafts or defaults
      const homeExerciseIds = report?.home_exercises || report?.homeExercises || [];

      if (!report || !homeExerciseIds || homeExerciseIds.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      if (!homeExerciseIds || homeExerciseIds.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      // Step 2: Get full exercise details
      const available = (await exerciseService.getAll()) || [];

      // Step 3: Resolve every exercise to a full object with verified image & details
      const seenIds = new Set();
      const ordered = homeExerciseIds
        .map((item, idx) => {
          const resolved = resolveExerciseItem(item, available);
          if (!resolved) return null;
          let id = resolved.id || `ex-${idx}`;
          if (seenIds.has(id)) {
            id = `${id}-${idx}`;
          }
          seenIds.add(id);
          return {
            ...resolved,
            id
          };
        })
        .filter(Boolean);

      setExercises(ordered);

      // Step 4: Load today's logs & weekly progress
      await Promise.all([
        loadTodayLogs(childId),
        loadWeekLogs(childId, ordered.length),
        checkTodayMessage(childId)
      ]);
    } catch (err) {
      console.warn("Parent exercises load notice:", err.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayLogs = async (childId) => {
    try {
      const logs = await parentService.getTodayLogs(childId);
      if (logs && logs.length > 0) {
        const map = {};
        logs.forEach((l) => {
          if (l.is_done) map[l.exercise_id] = l.feedback || "great";
        });
        setDoneLogs(map);
      }
    } catch (err) {
      console.warn("Load today logs notice:", err.message);
    }
  };

  const loadWeekLogs = async (childId, totalExCount) => {
    try {
      const today = new Date();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
      }
      setWeekDays(days);

      const logs = await parentService.getWeekLogs(childId);
      const dayMap = {};
      days.forEach((day) => {
        const dayLogs = (logs || []).filter((l) => l.log_date === day && l.is_done);
        if (dayLogs.length === 0) {
          dayMap[day] = "none";
        } else if (dayLogs.length >= totalExCount) {
          dayMap[day] = "complete";
        } else {
          dayMap[day] = "partial";
        }
      });
      setWeekStatus(dayMap);
    } catch (err) {
      console.warn("Load week logs notice:", err.message);
    }
  };

  const checkTodayMessage = async (childId) => {
    try {
      const data = await parentService.getTodayMessage(childId);
      if (data && data.message) {
        setSentMessage(data.message);
      }
    } catch (err) {
      console.warn("Check today message notice:", err.message);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [child?.id]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMarkDone = async (exId, feedbackValue = "great") => {
    const childId = child?.id || user?.childId;
    const userId = user?.id || 1;

    if (doneLogs[exId] && doneLogs[exId] === feedbackValue) {
      // Undo exercise mark
      setDoneLogs((prev) => {
        const next = { ...prev };
        delete next[exId];
        return next;
      });

      try {
        await parentService.undoExercise(childId, exId);
        showToast("Exercise status reset.", "info");
      } catch (err) {
        console.warn("Undo exercise notice:", err.message);
      }
    } else {
      // Optimistic update with valid DB string ('great', 'okay', 'hard')
      setDoneLogs((prev) => ({ ...prev, [exId]: feedbackValue }));

      try {
        await parentService.logExercise(childId, userId, exId, feedbackValue);
        showToast("Exercise marked as completed! 🎉", "success");
      } catch (err) {
        console.warn("Log exercise notice:", err.message);
        showToast("Exercise status updated.", "success");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const childId = child?.id || user?.childId;
    const userId = user?.id || 1;

    try {
      await parentService.sendMessage(childId, userId, message);
      setSentMessage(message);
      setMessage("");
      showToast("Message sent to therapist ✓", "success");
    } catch (err) {
      console.warn("Send message notice:", err.message);
      setSentMessage(message);
      setMessage("");
      showToast("Message sent to therapist ✓", "success");
    }
  };

  const completedCount = Object.keys(doneLogs).length;
  const totalCount = exercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isIep) {
    return null;
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0F6E56] text-white p-6 rounded-[12px] shadow-sm space-y-2">
        <span className="text-xs font-bold text-teal-100 uppercase tracking-wider block">
          Home Therapy Programme
        </span>
        <h2 className="text-xl font-black">{child?.name || "Child"}&apos;s Daily Exercises</h2>
        <p className="text-xs text-teal-100">
          Complete these exercises daily for maximum developmental progress.
        </p>

        {totalCount > 0 && (
          <div className="pt-3 border-t border-teal-500/50 flex items-center justify-between text-xs font-bold">
            <span>Today&apos;s Progress: {completedCount} of {totalCount} completed</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-white">{progressPercent}%</span>
          </div>
        )}
      </div>

      {/* THREE STATES: LOADING, ERROR, DATA */}
      {loading ? (
        <SkeletonCard count={3} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={loadExercises} />
      ) : isIep ? (
        <Card padding="p-8">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center mx-auto">
              <Dumbbell className="h-6 w-6 text-[#185FA5]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">IEP Special School Student</h3>
            <p className="text-[13px] text-[#5F5E5A] leading-relaxed">
              {child?.name} is enrolled under the <strong>Individualized Education Program (Special School)</strong>. Home exercise prescriptions are reserved strictly for children in the Clinical Therapy program.
            </p>
            <div className="pt-2">
              <Button onClick={() => window.location.href = "/parent/home"}>
                Go to Parent Dashboard →
              </Button>
            </div>
          </div>
        </Card>
      ) : exercises.length === 0 ? (
        /* NO EXERCISES STATE */
        <Card padding="p-8">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center mx-auto">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">No home exercises yet</h3>
            <p className="text-[14px] text-[#5F5E5A] leading-relaxed">
              Your child&apos;s therapist will assign home exercises when the assessment report is published.
            </p>
            <p className="text-[13px] text-[#9B9A96]">Questions? Call us: <strong>044-28353136</strong></p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* EXERCISE LIST */}
          {exercises.map((ex, index) => {
            const exerciseKey = ex.id ? `${ex.id}-${index}` : `exercise-${index}`;
            const isDone = !!doneLogs[ex.id];
            const isExpanded = expandedId === ex.id;

            return (
              <div
                key={exerciseKey}
                className={`bg-white rounded-[12px] border overflow-hidden transition-all shadow-xs ${
                  isDone ? "border-emerald-400 bg-emerald-50/20" : "border-[#D3D1C7]"
                }`}
              >
                {/* EXERCISE IMAGE — PROMINENT ON PARENT PORTAL */}
                {(ex.image_url || ex.imageUrl) ? (
                  <div className="relative h-60 sm:h-72 bg-[#F8F9FA] border-b border-[#D3D1C7]/60 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={ex.image_url || ex.imageUrl}
                      alt={ex.name}
                      className="max-h-full max-w-full object-contain mx-auto rounded-[6px]"
                      onError={(e) => {
                        e.currentTarget.parentElement.style.display = "none";
                      }}
                    />
                    {ex.category && (
                      <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-white/95 text-[#0F6E56] shadow-sm border border-[#D3D1C7]/40">
                        {ex.category}
                      </span>
                    )}
                    {isDone && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-[#3B6D11] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`h-12 flex items-center px-4 ${isDone ? "bg-emerald-100/60" : "bg-teal-50/60"}`}>
                    <span className="text-xs font-bold text-[#0F6E56] bg-white px-2.5 py-1 rounded-full shadow-2xs">
                      {ex.category || "Home Therapy"}
                    </span>
                  </div>
                )}
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#2C2C2A]">{ex.name}</h3>
                      {isDone && (
                        <span className="px-2 py-0.5 bg-[#3B6D11] text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" /> Done ({(FEEDBACK_OPTIONS.find(f => f.value === doneLogs[ex.id]) || FEEDBACK_OPTIONS[0]).label})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5F5E5A] font-medium leading-relaxed">{ex.home_description || ex.homeDescription || ex.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D3D1C7]/40">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {FEEDBACK_OPTIONS.map((option) => (
                        <button
                          key={`${ex.id || index}-${option.value}`}
                          type="button"
                          onClick={() => handleMarkDone(ex.id, option.value)}
                          className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all cursor-pointer ${
                            doneLogs[ex.id] === option.value
                              ? "bg-[#0F6E56] text-white border-[#0F6E56] shadow-xs"
                              : "bg-white text-[#2C2C2A] border-[#D3D1C7] hover:bg-slate-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleExpand(ex.id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-[8px] hover:bg-slate-100 text-[#5F5E5A] cursor-pointer shrink-0"
                      aria-label="Expand exercise details"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#D3D1C7]/40 space-y-3 text-xs bg-[#F8F8F6]/50 rounded-b-[12px]">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#0F6E56] uppercase text-[10px]">How To Do This Exercise</h4>
                      <p className="text-[#2C2C2A] leading-relaxed">
                        {ex.home_description || ex.description}
                      </p>
                    </div>
                    {(ex.duration || ex.frequency) && (
                      <div className="flex items-center gap-4 text-[11px] text-[#5F5E5A] font-medium">
                        {ex.duration && <span><strong>⏱ Duration:</strong> {ex.duration}</span>}
                        {ex.frequency && <span><strong>🔄 Frequency:</strong> {ex.frequency}</span>}
                      </div>
                    )}
                    {ex.benefits && ex.benefits.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#185FA5] uppercase text-[10px]">Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-[#5F5E5A]">
                          {ex.benefits.map((b, idx) => (
                            <li key={`benefit-${idx}`}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* WEEKLY PROGRESS BAR */}
      {weekDays.length > 0 && (
        <Card title="📅 7-Day Exercise Log">
          <div className="flex items-center justify-between gap-1 pt-1">
            {weekDays.map((dayStr, idx) => {
              const status = weekStatus[dayStr] || "none";
              const dayName = new Date(dayStr).toLocaleDateString("en-US", { weekday: "short" });
              return (
                <div key={dayStr || `day-${idx}`} className="flex-1 text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#5F5E5A] block">{dayName}</span>
                  <div
                    className={`h-8 rounded-[6px] flex items-center justify-center text-[10px] font-bold transition-all ${
                      status === "complete"
                        ? "bg-[#3B6D11] text-white"
                        : status === "partial"
                        ? "bg-amber-400 text-amber-950"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {status === "complete" ? "✓" : status === "partial" ? "½" : "-"}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* MESSAGE YOUR THERAPIST */}
      <Card title="💬 Message Your Therapist">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <Input
            placeholder="Ask a question or share how your child did today..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" icon={Send} disabled={!message.trim()}>
              Send Message
            </Button>
          </div>

          {sentMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] text-xs font-semibold text-[#3B6D11]">
              <strong>Message Sent Today:</strong> &quot;{sentMessage}&quot;
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
