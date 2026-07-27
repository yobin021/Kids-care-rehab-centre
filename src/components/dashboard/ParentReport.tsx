"use client";

import React from "react";
import { FileText, Download, CheckCircle2, Award } from "lucide-react";

export default function ParentReport() {
  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C2C2A]">My Child&apos;s Clinical Report</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Latest assessment findings and progress evaluations.</p>
        </div>
        <button
          onClick={() => alert("Downloading Clinical Summary PDF...")}
          className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-6">
        
        {/* Child Header Info */}
        <div className="p-4 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7] flex flex-wrap justify-between items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F5E5A] block">Child Name</span>
            <strong className="text-base text-[#185FA5]">Arsh Mohammed</strong>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F5E5A] block">Child ID</span>
            <strong className="text-sm font-mono text-[#2C2C2A]">KCR-2024-002</strong>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F5E5A] block">Primary Therapist</span>
            <strong className="text-sm text-[#0F6E56]">Priya S (Senior OT)</strong>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5F5E5A] block">Last Evaluated</span>
            <strong className="text-sm text-[#2C2C2A]">25 Jul 2026</strong>
          </div>
        </div>

        {/* Clinical Observations */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Clinical Observations & Summary
          </h3>
          <p className="text-xs leading-relaxed text-[#5F5E5A]">
            Arsh shows positive progress in motor planning and attention span. Sitting tolerance has improved from 4 minutes to 12 minutes during structured table activities. Expressive communication is developing steadily using visual cards and 2-word phrase prompts.
          </p>
        </div>

        {/* Key Domain Strengths & Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 className="text-xs font-black text-[#3B6D11] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Key Strengths</span>
            </h4>
            <ul className="text-xs text-[#2C2C2A] space-y-1 list-disc pl-4 font-semibold">
              <li>Excellent visual matching skills</li>
              <li>Warm social response to therapist</li>
              <li>Good gross motor jumping coordination</li>
            </ul>
          </div>

          <div className="p-4 rounded-[8px] bg-blue-50 border border-blue-200 space-y-2">
            <h4 className="text-xs font-black text-[#185FA5] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              <span>3-Month Goals</span>
            </h4>
            <ul className="text-xs text-[#2C2C2A] space-y-1 list-disc pl-4 font-semibold">
              <li>Use 3-word functional phrases to request items</li>
              <li>Sustain attention for 15 minutes without breaks</li>
              <li>Improve tripod pencil grip during pre-writing</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
