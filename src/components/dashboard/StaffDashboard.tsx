"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Users, Calendar, FileText, PlusCircle, Search, Play } from "lucide-react";

export default function StaffDashboard() {
  const { setActiveTab } = useDashboard();

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Stat Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">My Active Children</span>
            <span className="text-2xl font-black text-[#185FA5] mt-1 block">12</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Sessions Today</span>
            <span className="text-2xl font-black text-[#0F6E56] mt-1 block">4</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center font-bold">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">Assessments Pending</span>
            <span className="text-2xl font-black text-[#854F0B] mt-1 block">2</span>
          </div>
          <div className="h-10 w-10 rounded-[8px] bg-[#854F0B]/10 text-[#854F0B] flex items-center justify-center font-bold">
            <FileText className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* My Children Today Table */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-4">
        <div className="border-b border-[#D3D1C7]/60 pb-3">
          <h3 className="text-sm font-extrabold text-[#2C2C2A]">My Children Today</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                <th className="p-3 font-extrabold">Time</th>
                <th className="p-3 font-extrabold">Child Name</th>
                <th className="p-3 font-extrabold">Child ID</th>
                <th className="p-3 font-extrabold">Session Type</th>
                <th className="p-3 font-extrabold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                <td className="p-3 font-bold text-[#2C2C2A]">09:00</td>
                <td className="p-3 font-bold text-[#185FA5]">Arsh Mohammed</td>
                <td className="p-3 font-mono text-[#5F5E5A]">KCR-2024-001</td>
                <td className="p-3 font-semibold text-[#2C2C2A]">Therapy</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setActiveTab("daily-session")}
                    className="px-3 py-1.5 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Session</span>
                  </button>
                </td>
              </tr>

              <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                <td className="p-3 font-bold text-[#2C2C2A]">10:00</td>
                <td className="p-3 font-bold text-[#185FA5]">Yeshmith S.J</td>
                <td className="p-3 font-mono text-[#5F5E5A]">KCR-2025-002</td>
                <td className="p-3 font-semibold text-[#2C2C2A]">Review</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setActiveTab("daily-session")}
                    className="px-3 py-1.5 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Session</span>
                  </button>
                </td>
              </tr>

              <tr className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/50">
                <td className="p-3 font-bold text-[#2C2C2A]">11:00</td>
                <td className="p-3 font-bold text-[#185FA5]">Lakshmanan A.R</td>
                <td className="p-3 font-mono text-[#5F5E5A]">KCR-2023-003</td>
                <td className="p-3 font-semibold text-[#2C2C2A]">Assessment</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setActiveTab("new-assessment")}
                    className="px-3 py-1.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Fill Form</span>
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-[#F8F8F6]/50">
                <td className="p-3 font-bold text-[#2C2C2A]">14:00</td>
                <td className="p-3 font-bold text-[#185FA5]">Krishnan K.K</td>
                <td className="p-3 font-mono text-[#5F5E5A]">KCR-2025-004</td>
                <td className="p-3 font-semibold text-[#2C2C2A]">Therapy</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setActiveTab("daily-session")}
                    className="px-3 py-1.5 bg-[#0F6E56] hover:bg-[#0b5442] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Session</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-[#2C2C2A] border-b border-[#D3D1C7]/60 pb-3">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <button
            onClick={() => setActiveTab("new-assessment")}
            className="p-4 rounded-[8px] border border-[#185FA5] bg-[#185FA5]/5 hover:bg-[#185FA5]/10 text-[#185FA5] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>+ New Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab("daily-session")}
            className="p-4 rounded-[8px] border border-[#0F6E56] bg-[#0F6E56]/5 hover:bg-[#0F6E56]/10 text-[#0F6E56] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>+ Daily Session Entry</span>
          </button>

          <button
            onClick={() => setActiveTab("children")}
            className="p-4 rounded-[8px] border border-[#5F5E5A] bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="h-5 w-5 text-[#5F5E5A]" />
            <span>Search Child by ID</span>
          </button>
        </div>
      </div>

    </div>
  );
}
