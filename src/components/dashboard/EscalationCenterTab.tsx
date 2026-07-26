"use client";

import React, { useState } from "react";
import { useDashboard, Escalation, Exercise } from "@/context/DashboardContext";
import { Card, Badge, Dialog, Select } from "@/components/ui/ui";
import { AlertTriangle, CheckCircle, ShieldAlert, History, Edit, ArrowRight, BookOpen, User } from "lucide-react";

export default function EscalationCenterTab() {
  const { escalations, children, resolveEscalation } = useDashboard();
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);

  // Split open and resolved escalations
  const openCases = escalations.filter((e) => e.status === "Open");
  const resolvedCases = escalations.filter((e) => e.status === "Resolved");

  const getEscalationTypeVariant = (type: Escalation["type"]) => {
    switch (type) {
      case "Aggression":
        return "danger";
      case "Sensory Overload":
        return "warning";
      case "Therapy Refusal":
        return "info";
      default:
        return "primary";
    }
  };

  const handleOpenResolve = (esc: Escalation) => {
    setSelectedEscalation(esc);
    setDoctorNotes("");
    const childObj = children.find((c) => c.id === esc.childId);
    setEditedExercises(childObj?.therapyPlan?.exercises || []);
    setIsResolveOpen(true);
  };

  const handleRemoveExercise = (idx: number) => {
    setEditedExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateDuration = (idx: number, text: string) => {
    setEditedExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, duration: text } : ex))
    );
  };

  const submitResolution = () => {
    if (selectedEscalation) {
      resolveEscalation(selectedEscalation.id, doctorNotes, editedExercises);
      setIsResolveOpen(false);
      setSelectedEscalation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      {openCases.length > 0 && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 flex items-center gap-4 text-rose-950 shadow-xs">
          <div className="rounded-xl bg-rose-100 p-3 text-rose-600 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight">Active Clinical Escalations Attention Required</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              There are {openCases.length} open safety or therapy compliance escalations. Review therapist session notes below and modify clinical exercise guidelines.
            </p>
          </div>
        </div>
      )}

      {/* Open Cases */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Open Incidents</h3>
        {openCases.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-slate-200">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">All escalated cases are currently resolved.</p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {openCases.map((esc) => (
              <Card key={esc.id} className="border-rose-100/60 flex flex-col justify-between hover:border-rose-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{esc.childName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Incident Date: {esc.date}</p>
                    </div>
                    <Badge variant={getEscalationTypeVariant(esc.type)}>{esc.type}</Badge>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 pb-1.5 mb-1.5">
                      <span>Therapist report</span>
                      <span className="text-rose-600 font-extrabold">Cooperation: {esc.cooperationLevel}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-semibold italic">"{esc.description}"</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-3.5">
                  <span className="text-[10px] font-bold text-slate-400">Flagged by {esc.therapistName}</span>
                  <button
                    onClick={() => handleOpenResolve(esc)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition-colors flex items-center gap-1"
                  >
                    Resolve & Adapt Plan
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Incidents Registry */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Historical Resolutions</h3>
        <Card className="p-0 overflow-hidden shadow-xs border border-blue-50/60">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Child Name</th>
                  <th className="px-6 py-4">Incident Type</th>
                  <th className="px-6 py-4">Therapist</th>
                  <th className="px-6 py-4">Doctor Remarks</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {resolvedCases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No resolved incidents logs found.
                    </td>
                  </tr>
                ) : (
                  resolvedCases.map((esc) => (
                    <tr key={esc.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">{esc.childName}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getEscalationTypeVariant(esc.type)}>{esc.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{esc.therapistName}</td>
                      <td className="px-6 py-4 text-slate-500 italic max-w-[200px] truncate">
                        "{esc.resolutionComments}"
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Resolved</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Resolve Escalation Dialog Modal */}
      <Dialog
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        title={selectedEscalation ? `Clinical Intervention: ${selectedEscalation.childName}` : ""}
        maxWidth="3xl"
      >
        {selectedEscalation && (
          <div className="space-y-5">
            {/* Session Summary Context */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Incident Context Details</span>
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                {selectedEscalation.behaviorNotes}
              </p>
            </div>

            {/* Exercise Modification Area */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">Adapt Child's Prescribed Exercises</h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {editedExercises.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No exercises currently prescribed.</p>
                ) : (
                  editedExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-100 bg-white p-3 gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800">{ex.name}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold italic">Goal: {ex.goal}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={ex.duration}
                          onChange={(e) => handleUpdateDuration(idx, e.target.value)}
                          className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs text-slate-700 font-semibold focus:outline-none w-36"
                          placeholder="e.g. 10 mins"
                        />
                        <button
                          onClick={() => handleRemoveExercise(idx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clinical Directives Remarks */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doctor Clinical Instructions</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Instruct the therapist on behavior guidelines or session modifications (e.g. 'Reduce squat counts, offer sensory break headphones next session...')"
                className="w-full min-h-[90px] rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsResolveOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitResolution}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700"
              >
                Resolve & Update Plan
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
