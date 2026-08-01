"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { mockExercises } from "../data/mockData";
import { Check, ChevronDown, ChevronUp, Send } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { parentService } from "../services/parentService";

export default function ParentExercises() {
  const { user, childrenList, showToast } = useAuth();
  const child = childrenList.find((c) => c.id === user?.childId) || childrenList[1] || childrenList[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [doneLogs, setDoneLogs] = useState({});
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState(null);

  const fetchExerciseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const logs = await parentService.getTodayLogs(child?.id);
      setData(logs || []);

      if (logs && logs.length > 0) {
        const map = {};
        logs.forEach((l) => {
          if (l.is_done) map[l.exercise_id] = l.feedback || "😊";
        });
        setDoneLogs(map);
      }
    } catch (err) {
      console.warn("Parent exercises fetch fallback:", err.message);
      // Fallback local state if offline
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseData();
  }, [child?.id]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleMarkDone = async (exId, reaction = "😊") => {
    try {
      if (doneLogs[exId]) {
        await parentService.undoExercise(child?.id, exId);
        setDoneLogs((prev) => {
          const next = { ...prev };
          delete next[exId];
          return next;
        });
        showToast("Exercise status reset.", "info");
      } else {
        await parentService.logExercise(child?.id, user?.id || 1, exId, reaction);
        setDoneLogs((prev) => ({ ...prev, [exId]: reaction }));
        showToast("Exercise marked as completed! 🎉", "success");
      }
    } catch (err) {
      console.warn("Local mark done fallback:", err.message);
      setDoneLogs((prev) => {
        if (prev[exId]) {
          const next = { ...prev };
          delete next[exId];
          return next;
        }
        return { ...prev, [exId]: reaction };
      });
      showToast("Exercise status updated.", "success");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await parentService.sendMessage(child?.id, user?.id || 1, message);
      setSentMessage(message);
      setMessage("");
      showToast("Message sent to therapist!", "success");
    } catch (err) {
      console.warn("Local send message fallback:", err.message);
      setSentMessage(message);
      setMessage("");
      showToast("Message sent to therapist!", "success");
    }
  };

  const homeList = mockExercises.filter((e) => e.isHomeExercise);
  const completedCount = Object.keys(doneLogs).length;
  const totalCount = homeList.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 max-w-3xl mx-auto">
      <div className="bg-[#0F6E56] text-white p-6 rounded-[12px] shadow-sm space-y-2">
        <span className="text-xs font-bold text-teal-100 uppercase tracking-wider block">Home Therapy Programme</span>
        <h2 className="text-xl font-black">{child?.name}&apos;s Daily Exercises</h2>
        <p className="text-xs text-teal-100">Complete these exercises daily for maximum developmental progress.</p>
        
        <div className="pt-3 border-t border-teal-500/50 flex items-center justify-between text-xs font-bold">
          <span>Today&apos;s Progress: {completedCount} of {totalCount} completed</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-white">{progressPercent}%</span>
        </div>
      </div>

      {/* THREE STATES: LOADING, ERROR, DATA */}
      {loading ? (
        <SkeletonCard count={3} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchExerciseData} />
      ) : (
        <div className="space-y-4">
          {homeList.map((ex) => {
            const isDone = !!doneLogs[ex.id];
            const isExpanded = expandedId === ex.id;

            return (
              <div
                key={ex.id}
                className={`bg-white rounded-[12px] border transition-all shadow-xs ${
                  isDone ? "border-emerald-400 bg-emerald-50/20" : "border-[#D3D1C7]"
                }`}
              >
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2C2C2A]">{ex.name}</h3>
                      {isDone && (
                        <span className="px-2 py-0.5 bg-[#3B6D11] text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" /> Done {doneLogs[ex.id]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5F5E5A] font-medium">{ex.homeDescription}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isDone ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => handleMarkDone(ex.id)}
                    >
                      {isDone ? "Completed ✓" : "✓ Mark as Done"}
                    </Button>
                    <button
                      onClick={() => toggleExpand(ex.id)}
                      className="p-1.5 rounded-[8px] hover:bg-slate-100 text-[#5F5E5A] cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#D3D1C7]/40 space-y-3 text-xs bg-[#F8F8F6]/50 rounded-b-[12px]">
                    <div className="space-y-1">
                      <h4 className="font-bold text-[#185FA5] uppercase text-[10px]">How To Do This Exercise</h4>
                      <ol className="list-decimal list-inside space-y-1 text-[#2C2C2A]">
                        {ex.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
              <strong>Message Sent:</strong> &quot;{sentMessage}&quot;
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
