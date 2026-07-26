"use client";

import React, { useState } from "react";
import { useDashboard, Child } from "@/context/DashboardContext";
import { Search, UserCheck, Calendar, Phone, Activity, Smile, ChevronRight } from "lucide-react";
import { Card, Badge, Dialog } from "@/components/ui/ui";

export default function TherapistPatients() {
  const { children, activeTherapistId } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter children assigned to this therapist
  const myChildren = children.filter((c) => c.assignedTherapistId === activeTherapistId);

  const filteredChildren = myChildren.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || child.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: Child["status"]) => {
    switch (status) {
      case "Active":
        return "success";
      case "Pending Review":
        return "info";
      case "On Hold":
        return "warning";
      case "Discharged":
        return "secondary";
      default:
        return "primary";
    }
  };

  const handleOpenDetail = (child: Child) => {
    setSelectedChild(child);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search my children roster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 pl-10.5 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {["all", "Active", "Pending Review"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                statusFilter === st
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {st === "all" ? "All Statuses" : st}
            </button>
          ))}
        </div>
      </Card>

      {/* Children roster cards */}
      {filteredChildren.length === 0 ? (
        <Card className="text-center py-12 text-slate-400">
          <p className="text-xs font-semibold">No assigned children matching the query found.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredChildren.map((child) => (
            <Card
              key={child.id}
              onClick={() => handleOpenDetail(child)}
              className="cursor-pointer hover:border-blue-300 border-blue-50/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-2">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase">{child.id}</h4>
                    <h3 className="text-sm font-extrabold text-slate-800 mt-1">{child.name}</h3>
                  </div>
                  <Badge variant={getStatusVariant(child.status)}>{child.status}</Badge>
                </div>
                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <p className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Diagnosis:</span>
                    <span className="font-bold text-slate-800">{child.diagnosis}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Main Concern:</span>
                    <span>{child.mainConcern}</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 text-[10px] font-bold text-blue-600">
                <span>{child.sessionLogs.length} logs recorded</span>
                <span className="flex items-center gap-0.5">
                  View Profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Roster Child Detail Dialog Modal */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedChild ? `${selectedChild.name} - Detailed Clinical Profile` : ""}
        maxWidth="3xl"
      >
        {selectedChild && (
          <div className="space-y-6">
            {/* Demographic Info */}
            <div className="grid gap-4 sm:grid-cols-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Child Details</p>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{selectedChild.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedChild.id} | {selectedChild.gender}, {selectedChild.age} yrs</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Parent Info</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  <span>{selectedChild.parentName} ({selectedChild.whatsapp})</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{selectedChild.address}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(selectedChild.status)}>{selectedChild.status}</Badge>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Reg: {selectedChild.dateOfRegistration}</p>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100 space-y-1">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Diagnosis</h5>
              <p className="text-xs font-bold text-slate-800 leading-snug">{selectedChild.diagnosis}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Primary Clinical Concern: {selectedChild.mainConcern}</p>
            </div>

            {/* Active Therapy Exercise Plan */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600" />
                Prescribed Exercise Plan
              </h4>
              {selectedChild.therapyPlan ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/10 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Short-Term Goals</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-0.5">
                        {selectedChild.therapyPlan.shortTermGoals}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Long-Term Goals</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-0.5">
                        {selectedChild.therapyPlan.longTermGoals}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-2">Exercise Routines</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedChild.therapyPlan.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                              {ex.name}
                            </span>
                            <span className="rounded-full bg-slate-50 border px-1.5 py-0.5 text-[8px] font-bold text-slate-500 uppercase">
                              {ex.duration}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 leading-normal">
                            {ex.goal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No exercise routines defined.</p>
              )}
            </div>

            {/* Log History */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-emerald-600" />
                Session History Log
              </h4>
              <div className="space-y-3">
                {selectedChild.sessionLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No daily session log entries recorded yet.</p>
                ) : (
                  selectedChild.sessionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800">{log.date}</span>
                          <span className="text-[10px] text-slate-400 font-bold">|</span>
                          <span className="text-[10px] text-slate-500 font-bold">{log.therapistName} ({log.therapyType})</span>
                        </div>
                        <Badge variant={log.cooperationLevel === "Good" ? "success" : log.cooperationLevel === "Moderate" ? "warning" : "danger"}>
                          Cooperation: {log.cooperationLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        Behavior: <span className="font-medium text-slate-500">{log.behaviorNotes}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                        Notes: "{log.sessionNotes}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
