"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ArrowLeft, Save, Send, Plus, X, AlertCircle } from "lucide-react";

export default function AdminReportApproval() {
  const { setActiveTab, publishReport, reports } = useDashboard();
  const targetReport = reports[0] || { id: "rep-1" };

  const [therapistText, setTherapistText] = useState(
    targetReport.therapistText ||
      `Master Arsh Mohammed, aged 5 years 6 months, presented for a comprehensive developmental evaluation. Assessment using the Corner Parent Rating Scale and Vineland Social Maturity Scale indicated limitations in social communication, expressive and receptive language, sensory processing, and sitting tolerance.

Following approximately one year of therapy including Social Skills Training, Brain Gym, Sensory Integration, Speech Therapy with oral-motor exercises, and visual cue card training, significant progress has been observed. The child now communicates using multiple words and sentences, initiates conversations with peers, and demonstrates improved eye contact and task attendance.

Continued therapy is recommended with focus on narrative skills, social communication, and expressive language development.`
  );

  const [parentText, setParentText] = useState(
    targetReport.parentText ||
      `We are happy to share that Arsh has made wonderful progress over the past year. When he first came to us, he had difficulty with eye contact and communication. Today, he communicates using full sentences, makes friends easily, and responds well in conversation.

We will continue to work on helping him tell stories, answer questions, and communicate more confidently in different situations. We recommend continued therapy sessions twice a week for the next six months.

With your support at home and our guidance at the clinic, Arsh will continue to grow beautifully.`
  );

  const [assignedExercises, setAssignedExercises] = useState<string[]>(
    targetReport.assignedExercises || ["Brain Gym Exercises", "Communication Cards", "Sensory Integration"]
  );

  const [newExerciseInput, setNewExerciseInput] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const handleRemoveExercise = (name: string) => {
    setAssignedExercises((prev) => prev.filter((e) => e !== name));
  };

  const handleAddExercise = (name: string) => {
    if (name && !assignedExercises.includes(name)) {
      setAssignedExercises((prev) => [...prev, name]);
    }
    setShowAddDropdown(false);
    setNewExerciseInput("");
  };

  const handleConfirmPublish = () => {
    publishReport(targetReport.id, therapistText, parentText, assignedExercises);
    setShowPublishModal(false);
    setActiveTab("child-profile");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] pb-20">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("child-profile")}
            className="p-2 rounded-[8px] bg-white border border-[#D3D1C7] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">
              Report Approval & Review — <span className="text-[#185FA5]">Arsh Mohammed (KCR-2024-002)</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Review therapist clinical findings and parent summary before publishing.</p>
          </div>
        </div>
      </div>

      {/* Two Panel Layout (Side by Side Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL — Therapist Version */}
        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-2">
            <h3 className="text-sm font-extrabold text-[#185FA5]">Therapist Report (Clinical)</h3>
            <span className="text-[10px] font-bold text-[#5F5E5A] bg-[#F8F8F6] px-2 py-0.5 rounded-full">Internal Use</span>
          </div>
          <textarea
            rows={14}
            value={therapistText}
            onChange={(e) => setTherapistText(e.target.value)}
            className="w-full p-3.5 border border-[#D3D1C7] rounded-[8px] text-xs font-mono text-[#2C2C2A] outline-none focus:border-[#185FA5] leading-relaxed"
          />
        </div>

        {/* RIGHT PANEL — Parent Version */}
        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-2">
            <h3 className="text-sm font-extrabold text-[#0F6E56]">Parent Report (Simple Language)</h3>
            <span className="text-[10px] font-bold text-[#0F6E56] bg-emerald-50 px-2 py-0.5 rounded-full">Visible on Portal</span>
          </div>
          <textarea
            rows={14}
            value={parentText}
            onChange={(e) => setParentText(e.target.value)}
            className="w-full p-3.5 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold text-[#2C2C2A] outline-none focus:border-[#0F6E56] leading-relaxed bg-emerald-50/20"
          />
        </div>

      </div>

      {/* Recommended Exercises Section */}
      <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <h3 className="text-xs font-extrabold text-[#2C2C2A] uppercase tracking-wider">
          Exercises assigned to this child
        </h3>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {assignedExercises.map((ex) => (
            <span
              key={ex}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#185FA5]/10 text-[#185FA5] border border-[#185FA5]/30"
            >
              <span>{ex}</span>
              <button
                type="button"
                onClick={() => handleRemoveExercise(ex)}
                className="hover:text-red-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="px-3 py-1.5 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-full border border-[#D3D1C7] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#5F5E5A]" />
              <span>+ Add Exercise</span>
            </button>

            {showAddDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-[8px] border border-[#D3D1C7] shadow-lg p-2 z-20 space-y-1">
                {["Fine Motor Tracing", "Oral-Motor Blowing", "Gross Motor Balance"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAddExercise(opt)}
                    className="w-full text-left p-2 rounded hover:bg-[#F8F8F6] text-xs font-semibold text-[#2C2C2A]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D3D1C7] px-6 py-3.5 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setActiveTab("child-profile")}
          className="px-4 py-2 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("child-profile")}
            className="px-4 py-2 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4" />
            <span>Publish Report</span>
          </button>
        </div>
      </div>

      {/* PUBLISH CONFIRMATION MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] p-6 max-w-md w-full border border-[#D3D1C7] shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#185FA5]">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-extrabold text-[#2C2C2A]">Publish Clinical Report?</h3>
            </div>

            <p className="text-xs text-[#5F5E5A] font-semibold leading-relaxed">
              Are you sure you want to publish this report? The parent will be able to view it immediately on their parent portal.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]/60">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] text-xs font-bold rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="px-5 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px]"
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
