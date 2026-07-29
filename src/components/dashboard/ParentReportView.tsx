"use client";

import React from "react";
import { CheckCircle2, Target, Calendar, Download, Sparkles, Heart } from "lucide-react";

export default function ParentReportView() {
  return (
    <div className="max-w-[700px] mx-auto space-y-6 text-[#2C2C2A] py-2">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-[16px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#185FA5] uppercase tracking-wider block">
            Kids Care Rehab Centre — Parent Summary
          </span>
          <h2 className="text-2xl font-black text-[#2C2C2A] mt-0.5">
            Arsh Mohammed
          </h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-1">
            Report Date: <strong>20 July 2026</strong> | Child ID: <strong>KCR-2024-002</strong>
          </p>
        </div>

        <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black">
          <Heart className="h-6 w-6 fill-[#185FA5]/20" />
        </div>
      </div>

      {/* Section 1 — About Your Child */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <h3 className="text-base font-extrabold text-[#185FA5] flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span>About Arsh&apos;s Progress</span>
        </h3>
        <p className="text-xs leading-relaxed text-[#2C2C2A] font-medium">
          We are happy to share that Arsh has made wonderful progress over the past year. When he first came to us, he had difficulty with eye contact and communication. Today, he communicates using full sentences, makes friends easily, and responds well in conversation during daily therapy activities.
        </p>
      </div>

      {/* Section 2 — What We Found (Green Card) */}
      <div className="bg-emerald-50/60 p-6 rounded-[12px] border border-emerald-200 space-y-3">
        <h3 className="text-sm font-extrabold text-[#3B6D11] uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>What We Found (Strengths Observed)</span>
        </h3>
        <div className="space-y-2 text-xs font-bold text-[#2C2C2A]">
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
            <span className="text-emerald-600 font-extrabold">✅</span>
            <span>Improved eye contact during one-on-one interactions</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
            <span className="text-emerald-600 font-extrabold">✅</span>
            <span>Responds consistently to name call</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
            <span className="text-emerald-600 font-extrabold">✅</span>
            <span>Beginning to use two-word phrases to express needs</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-emerald-200/60">
            <span className="text-emerald-600 font-extrabold">✅</span>
            <span>Warm and friendly with therapists and other children</span>
          </div>
        </div>
      </div>

      {/* Section 3 — Areas We Are Working On (Blue Card) */}
      <div className="bg-blue-50/60 p-6 rounded-[12px] border border-blue-200 space-y-3">
        <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider flex items-center gap-2">
          <Target className="h-5 w-5" />
          <span>Areas We Are Working On</span>
        </h3>
        <div className="space-y-2 text-xs font-bold text-[#2C2C2A]">
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
            <span className="text-[#185FA5] font-extrabold">📌</span>
            <span>Expanding vocabulary and sentence length</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
            <span className="text-[#185FA5] font-extrabold">📌</span>
            <span>Social communication in group classroom settings</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
            <span className="text-[#185FA5] font-extrabold">📌</span>
            <span>Reducing stimming behaviours during quiet table tasks</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-[8px] border border-blue-200/60">
            <span className="text-[#185FA5] font-extrabold">📌</span>
            <span>Strengthening narrative skills and event retelling</span>
          </div>
        </div>
      </div>

      {/* Section 4 — Therapy Plan */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
        <h3 className="text-sm font-extrabold text-[#2C2C2A] uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#185FA5]" />
          <span>Recommended Therapy Plan</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Therapy Type</span>
            <strong className="text-[#185FA5]">Speech + Social Skills + OT</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Weekly Frequency</span>
            <strong className="text-[#2C2C2A]">2 Sessions / week</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Recommended Duration</span>
            <strong className="text-[#2C2C2A]">6 Months</strong>
          </div>
          <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60">
            <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Next Review Date</span>
            <strong className="text-[#0F6E56]">October 2026</strong>
          </div>
        </div>
      </div>

      {/* Section 5 — What You Can Do At Home */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
        <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider">
          What You Can Do At Home
        </h3>
        <div className="space-y-3 text-xs font-semibold text-[#2C2C2A]">
          <div className="p-3.5 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7]/60 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
            <p className="mt-0.5">Practise naming objects during daily activities (e.g. while bathing, eating, or dressing).</p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7]/60 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
            <p className="mt-0.5">Use picture communication cards during meals and playtime to encourage clear requests.</p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7]/60 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
            <p className="mt-0.5">Encourage 2-word requests (&quot;Give water&quot;, &quot;Want toy&quot;) before handing desired items.</p>
          </div>
        </div>
      </div>

      {/* Bottom Sign-off */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-[#2C2C2A]">Report prepared by <strong>Priya S</strong>, Senior Therapist</p>
          <p className="text-[#5F5E5A]">Reviewed by <strong>Dr. R. Radha Balachandar</strong></p>
          <p className="text-[11px] text-[#5F5E5A]">Kids Care Rehab Centre, Chennai</p>
        </div>

        <button
          onClick={() => alert("Downloading Parent Summary PDF Report...")}
          className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

    </div>
  );
}
