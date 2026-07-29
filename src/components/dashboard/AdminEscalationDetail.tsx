"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ArrowLeft, AlertTriangle, CheckCircle2, Send, Shield } from "lucide-react";

export default function AdminEscalationDetail() {
  const { setActiveTab, escalationItems, reviewEscalationDetail } = useDashboard();
  const item = escalationItems[0] || {
    id: "esc-101",
    childId: "KCR-2025-007",
    childName: "Yeshvi",
    date: "27 Jul 2026",
    therapistName: "Meena",
    status: "Open",
    sessionNotes: "Child became aggressive when asked to complete writing task. Threw objects. Screamed for 10 minutes. Could not complete planned exercises. Parent was not present during session.",
    plannedCount: 3,
    completedCount: 0,
    cooperationLevel: "Poor",
    behavioursNoted: ["Aggression", "Throwing objects", "Non-cooperation"]
  };

  const [adminRemarks, setAdminRemarks] = useState(item.adminRemarks || "");
  const [selectedActions, setSelectedActions] = useState<string[]>([
    "Replace writing task with sensory play",
    "Start with Brain Gym warm-up",
    "Reduce session duration to 30 minutes"
  ]);

  const toggleAction = (actionStr: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionStr) ? prev.filter((a) => a !== actionStr) : [...prev, actionStr]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    reviewEscalationDetail(item.id, adminRemarks, selectedActions);
    setActiveTab("dashboard");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="p-2 rounded-[8px] bg-white border border-[#D3D1C7] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">Escalation Review & Action</h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Review session escalation alert and issue instructions to therapist.</p>
          </div>
        </div>
      </div>

      {/* Top Card — Escalation Info */}
      <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[8px] bg-[#993C1D]/10 text-[#993C1D] flex items-center justify-center font-bold">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#2C2C2A]">Child: <span className="text-[#185FA5]">{item.childName}</span></h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                item.status === "Open" ? "bg-[#993C1D]/10 text-[#993C1D] border-[#993C1D]/30" : "bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/30"
              }`}>
                {item.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
              Escalation Date: <strong>{item.date}</strong> | Therapist: <strong>{item.therapistName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Session Notes Card */}
      <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-2">
        <h4 className="text-xs font-extrabold text-[#993C1D] uppercase tracking-wider">Session Notes Logged by Therapist</h4>
        <p className="text-xs font-semibold text-[#2C2C2A] bg-[#993C1D]/5 p-3.5 rounded-[8px] border border-[#993C1D]/20 leading-relaxed">
          &quot;{item.sessionNotes}&quot;
        </p>
      </div>

      {/* Child Response Card */}
      <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <h4 className="text-xs font-extrabold text-[#2C2C2A] uppercase tracking-wider">Child Response Metrics</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Planned vs Completed</span>
            <strong className="text-sm font-black text-[#2C2C2A]">{item.plannedCount} Planned / {item.completedCount} Completed</strong>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Cooperation Level</span>
            <strong className="text-sm font-black text-[#993C1D]">{item.cooperationLevel}</strong>
          </div>

          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Behaviours Noted</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.behavioursNoted.map((b) => (
                <span key={b} className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions Card */}
      <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
        <h4 className="text-xs font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
          Admin Review & Next Session Instructions
        </h4>

        <div>
          <label className="block text-xs font-bold text-[#2C2C2A] mb-1">Admin Remarks / Modified Therapy Plan</label>
          <textarea
            rows={4}
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            placeholder="Enter your observations and instructions for the next session..."
            className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#2C2C2A]">Recommended Next Session Actions:</label>
          {[
            "Replace writing task with sensory play",
            "Start with Brain Gym warm-up",
            "Reduce session duration to 30 minutes"
          ].map((act) => (
            <label key={act} className="flex items-center gap-2 text-xs font-bold text-[#2C2C2A] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedActions.includes(act)}
                onChange={() => toggleAction(act)}
                className="accent-[#185FA5] h-4 w-4"
              />
              <span>{act}</span>
            </label>
          ))}
        </div>

        <div className="pt-2 border-t border-[#D3D1C7]/60 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Mark as Reviewed + Send to Therapist</span>
          </button>
        </div>
      </form>

    </div>
  );
}
