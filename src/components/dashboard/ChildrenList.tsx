"use client";

import React, { useState, useMemo } from "react";
import { useDashboard, Child } from "@/context/DashboardContext";
import { PlusCircle, Search, Eye, Play } from "lucide-react";

export default function ChildrenList() {
  const { children, setActiveTab, setActiveChildId } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [profileFilter, setProfileFilter] = useState("All");
  const [therapistFilter, setTherapistFilter] = useState("All");

  const filteredChildren = useMemo(() => {
    return children.filter((child: Child) => {
      const matchesSearch =
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProfile =
        profileFilter === "All" || child.profile === profileFilter;

      const assignedT = child.assignedTherapist || child.assignedTherapistId || "";
      const matchesTherapist =
        therapistFilter === "All" || assignedT.includes(therapistFilter);

      return matchesSearch && matchesProfile && matchesTherapist;
    });
  }, [children, searchTerm, profileFilter, therapistFilter]);

  const getProfileBadgeStyle = (profile?: string) => {
    switch (profile) {
      case "Profile A":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Profile B":
        return "bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20";
      case "Profile C":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Profile D":
        return "bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/20";
      case "Profile E":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-[#2C2C2A]">Children</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#185FA5] text-white">
            42 Total
          </span>
        </div>

        <button
          onClick={() => setActiveTab("children-new")}
          className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Register New Child</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#5F5E5A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or child ID"
            className="w-full h-10 pl-9 pr-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5] bg-[#F8F8F6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-bold outline-none focus:border-[#185FA5] bg-white cursor-pointer"
          >
            <option value="All">All Profiles</option>
            <option value="Profile A">Profile A</option>
            <option value="Profile B">Profile B</option>
            <option value="Profile C">Profile C</option>
            <option value="Profile D">Profile D</option>
            <option value="Profile E">Profile E</option>
          </select>

          <select
            value={therapistFilter}
            onChange={(e) => setTherapistFilter(e.target.value)}
            className="h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-bold outline-none focus:border-[#185FA5] bg-white cursor-pointer"
          >
            <option value="All">All Therapists</option>
            <option value="Priya">Priya</option>
            <option value="Meena">Meena</option>
          </select>
        </div>
      </div>

      {/* Children Table */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                <th className="p-3.5 font-extrabold">Child ID</th>
                <th className="p-3.5 font-extrabold">Name</th>
                <th className="p-3.5 font-extrabold">Age</th>
                <th className="p-3.5 font-extrabold">Diagnosis</th>
                <th className="p-3.5 font-extrabold">Profile</th>
                <th className="p-3.5 font-extrabold">Therapist</th>
                <th className="p-3.5 font-extrabold">Last Session</th>
                <th className="p-3.5 font-extrabold">Status</th>
                <th className="p-3.5 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((c: Child) => (
                <tr key={c.id} className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/60">
                  <td className="p-3.5 font-mono font-bold text-[#185FA5]">{c.id}</td>
                  <td className="p-3.5 font-bold text-[#2C2C2A]">{c.name}</td>
                  <td className="p-3.5 font-semibold text-[#5F5E5A]">{c.age}</td>
                  <td className="p-3.5 font-semibold text-[#2C2C2A]">{c.diagnosis}</td>
                  <td className="p-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getProfileBadgeStyle(c.profile)}`}>
                      {c.profile || "Profile B"}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-[#5F5E5A]">{c.assignedTherapist || "Priya"}</td>
                  <td className="p-3.5 font-semibold text-[#5F5E5A]">{c.lastSessionDate || "25 Jul 2026"}</td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3B6D11]/10 text-[#3B6D11]">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setActiveChildId(c.id);
                        setActiveTab("child-profile");
                      }}
                      className="px-2.5 py-1 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] rounded-[6px] border border-[#D3D1C7] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3 text-[#5F5E5A]" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("daily-session")}
                      className="px-2.5 py-1 bg-[#0F6E56] hover:bg-[#0b5442] text-white rounded-[6px] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>Session</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="p-3.5 bg-[#F8F8F6] border-t border-[#D3D1C7] flex items-center justify-between text-xs font-semibold text-[#5F5E5A]">
          <span>Showing 8 of 42 children</span>
          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 rounded bg-white border border-[#D3D1C7] opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-2.5 py-1 rounded bg-[#185FA5] text-white font-bold cursor-pointer">1</button>
            <button className="px-2.5 py-1 rounded bg-white border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer">2</button>
            <button className="px-2.5 py-1 rounded bg-white border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer">3</button>
            <button className="px-2.5 py-1 rounded bg-white border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
