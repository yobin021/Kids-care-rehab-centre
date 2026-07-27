"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Users, Calendar, FileText, AlertTriangle, ChevronRight, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { setActiveTab } = useDashboard();

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Stat Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Active Children</span>
            <span className="text-2xl font-black text-[#185FA5] mt-1 block">42</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Sessions Today</span>
            <span className="text-2xl font-black text-[#0F6E56] mt-1 block">8</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center font-bold">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Pending Approvals</span>
            <span className="text-2xl font-black text-[#854F0B] mt-1 block">3</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#854F0B]/10 text-[#854F0B] flex items-center justify-center font-bold">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Escalation Alerts</span>
            <span className="text-2xl font-black text-[#993C1D] mt-1 block">1</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#993C1D]/10 text-[#993C1D] flex items-center justify-center font-bold">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Today's Sessions (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Today&apos;s Sessions</h3>
            <button
              onClick={() => setActiveTab("appointments")}
              className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Schedule</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                  <th className="p-3 font-extrabold">Time</th>
                  <th className="p-3 font-extrabold">Child</th>
                  <th className="p-3 font-extrabold">Therapist</th>
                  <th className="p-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                  <td className="p-3 font-bold text-[#2C2C2A]">09:00</td>
                  <td className="p-3 font-bold text-[#185FA5]">Arsh Mohammed</td>
                  <td className="p-3 font-semibold text-[#5F5E5A]">Priya</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#3B6D11]/10 text-[#3B6D11]">
                      Completed
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                  <td className="p-3 font-bold text-[#2C2C2A]">10:00</td>
                  <td className="p-3 font-bold text-[#185FA5]">Yeshmith S.J</td>
                  <td className="p-3 font-semibold text-[#5F5E5A]">Meena</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#854F0B]/10 text-[#854F0B]">
                      In Progress
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                  <td className="p-3 font-bold text-[#2C2C2A]">11:00</td>
                  <td className="p-3 font-bold text-[#185FA5]">Lakshmanan A.R</td>
                  <td className="p-3 font-semibold text-[#5F5E5A]">Priya</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#185FA5]/10 text-[#185FA5]">
                      Upcoming
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#F8F8F6]/50">
                  <td className="p-3 font-bold text-[#2C2C2A]">14:00</td>
                  <td className="p-3 font-bold text-[#185FA5]">Krishnan K.K</td>
                  <td className="p-3 font-semibold text-[#5F5E5A]">Meena</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#185FA5]/10 text-[#185FA5]">
                      Upcoming
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Pending Report Approvals */}
        <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-4">
          <div className="border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-extrabold text-[#2C2C2A]">Pending Report Approvals</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#2C2C2A]">Krishnan K.K</h4>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  Profile C — ASD+ADHD
                </div>
              </div>
              <button
                onClick={() => setActiveTab("reports")}
                className="px-3 py-1.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#2C2C2A]">Yeshvi</h4>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  Profile C — ADHD
                </div>
              </div>
              <button
                onClick={() => setActiveTab("reports")}
                className="px-3 py-1.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F8F6] border border-[#D3D1C7] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#2C2C2A]">Sashanth</h4>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                  Profile A — ASD
                </div>
              </div>
              <button
                onClick={() => setActiveTab("reports")}
                className="px-3 py-1.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Escalation Alerts Section */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-3">
        <div className="flex items-center gap-2 text-[#993C1D] border-b border-[#D3D1C7]/60 pb-3">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-sm font-extrabold text-[#2C2C2A]">Escalation Alerts</h3>
        </div>

        <div className="p-4 rounded-[8px] bg-[#993C1D]/5 border border-[#993C1D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#2C2C2A]">
              <span>Child: <strong className="text-[#185FA5]">Yeshvi</strong></span>
              <span>•</span>
              <span>Therapist: <strong className="text-[#5F5E5A]">Meena</strong></span>
            </div>
            <p className="text-xs font-semibold text-[#993C1D] mt-1">
              Issue: Aggression during session
            </p>
          </div>

          <button
            onClick={() => setActiveTab("reports")}
            className="px-4 py-2 bg-[#993C1D] hover:bg-[#803117] text-white text-xs font-bold rounded-[8px] transition-colors self-start sm:self-center cursor-pointer"
          >
            View Session
          </button>
        </div>
      </div>

    </div>
  );
}
