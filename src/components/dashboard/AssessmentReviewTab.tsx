"use client";

import React, { useState } from "react";
import { useDashboard, AssessmentForm } from "@/context/DashboardContext";
import { ClipboardCheck, Calendar, Activity, ClipboardList, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { Card, Badge, Dialog } from "@/components/ui/ui";

export default function AssessmentReviewTab() {
  const { assessments, reviewAssessment } = useDashboard();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentForm | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [doctorRemarks, setDoctorRemarks] = useState("");
  const [activeFormTab, setActiveFormTab] = useState("case-history");

  const pendingAssessments = assessments.filter((a) => a.status === "Pending Review");
  const approvedAssessments = assessments.filter((a) => a.status === "Approved");

  const handleOpenReview = (appt: AssessmentForm) => {
    setSelectedAssessment(appt);
    setDoctorRemarks("");
    setActiveFormTab("case-history");
    setIsReviewOpen(true);
  };

  const submitReview = (decision: "Approved" | "Reject") => {
    if (selectedAssessment) {
      reviewAssessment(selectedAssessment.id, decision, doctorRemarks);
      setIsReviewOpen(false);
      setSelectedAssessment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Assessments Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Awaiting Head Doctor Approval</h3>
          {pendingAssessments.length > 0 && (
            <span className="rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] px-2 py-0.5 animate-pulse">
              {pendingAssessments.length} Pending
            </span>
          )}
        </div>

        {pendingAssessments.length === 0 ? (
          <Card className="text-center py-10 text-slate-400">
            <ClipboardCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-semibold">No assessments pending your clinical signature at this time.</p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {pendingAssessments.map((as) => (
              <Card
                key={as.id}
                onClick={() => handleOpenReview(as)}
                className="cursor-pointer hover:border-blue-300 border-blue-50/80 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{as.childName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Assessment Date: {as.assessmentDate}</p>
                    </div>
                    <Badge variant="info">{as.type}</Badge>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400">Therapist Clinical Summary</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      "{as.clinicalImpressionSummary}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-[10px] font-bold text-slate-500">
                  <span>Therapist: {as.therapistName}</span>
                  <span className="text-blue-600 group-hover:underline flex items-center gap-1">
                    Review Form & Sign
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historically Approved Assessments */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Approved Assessments</h3>
        <Card className="p-0 overflow-hidden shadow-xs border border-blue-50/60">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Child Name</th>
                  <th className="px-6 py-4">Assessment Type</th>
                  <th className="px-6 py-4">Assigned Therapist</th>
                  <th className="px-6 py-4">Completion Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {approvedAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No approved assessments found.
                    </td>
                  </tr>
                ) : (
                  approvedAssessments.map((as) => (
                    <tr
                      key={as.id}
                      onClick={() => handleOpenReview(as)}
                      className="cursor-pointer hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{as.childName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-600">{as.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span>{as.therapistName}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <span>{as.assessmentDate}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Approved</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Review Dialog Modal */}
      <Dialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={selectedAssessment ? `${selectedAssessment.childName} - ${selectedAssessment.type} Assessment Form` : ""}
        maxWidth="4xl"
      >
        {selectedAssessment && (
          <div className="space-y-6">
            {/* Tab selection menu */}
            <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
              {[
                { id: "case-history", label: "1. Case History" },
                { id: "clinical-obs", label: "2. Clinical Observation" },
                selectedAssessment.type === "Occupational Therapy" && { id: "ot-details", label: "3. Sensory & Fine Motor" },
                selectedAssessment.type === "Physiotherapy" && { id: "pt-details", label: "3. Posture, Tone & Gait" },
                { id: "findings", label: "4. Impression & Recommendations" },
              ]
                .filter(Boolean)
                .map((tab: any) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeFormTab === tab.id
                        ? "bg-blue-50 text-blue-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>

            {/* TAB CONTENT: Case History */}
            {activeFormTab === "case-history" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Primary concerns</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {selectedAssessment.caseHistory.parentConcern}
                    </p>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pregnancy/Birth History</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Type: {selectedAssessment.caseHistory.pregnancyHistory}
                      {selectedAssessment.caseHistory.pregnancyDetails && ` (${selectedAssessment.caseHistory.pregnancyDetails})`}
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Developmental Milestones Checklist</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Object.entries(selectedAssessment.caseHistory.milestones).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            val === "Normal" ? "bg-emerald-50 border-emerald-300 text-emerald-600" : "bg-amber-50 border-amber-300 text-amber-600"
                          }`}
                        >
                          {val === "Normal" ? "✓" : "!"}
                        </div>
                        <span className="font-semibold text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}: <span className="font-bold">{val}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Clinical Observation */}
            {activeFormTab === "clinical-obs" && (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Clinical Observation Rating Scale (3 = Yes, 2 = Sometimes, 1 = No)</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(selectedAssessment.clinicalObservation).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
                    >
                      <span className="font-semibold text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                          value === 3
                            ? "bg-emerald-100 text-emerald-700"
                            : value === 2
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {value === 3 ? "Yes (3)" : value === 2 ? "Sometimes (2)" : "No (1)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: OT Details */}
            {activeFormTab === "ot-details" && selectedAssessment.otDetails && (
              <div className="space-y-4">
                {/* Sensory Profile */}
                <div className="border border-slate-100 rounded-xl p-4.5 bg-slate-50/30">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Sensory Profile (Parent Report)</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(selectedAssessment.otDetails.sensoryProfile).map(([domain, details]) => (
                      <div key={domain} className="bg-white p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
                        <span className="font-bold text-blue-600 capitalize">{domain} System</span>
                        {Object.entries(details).map(([item, score]) => (
                          <div key={item} className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
                            <span className="capitalize">{item.replace(/([A-Z])/g, " $1")}</span>
                            <Badge variant={score === "Typical" ? "success" : "warning"}>{score}</Badge>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motor Skills */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 text-xs space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider">Fine Motor Skills</h4>
                    {Object.entries(selectedAssessment.otDetails.fineMotor).map(([skill, val]) => (
                      <div key={skill} className="flex justify-between items-center text-[11px]">
                        <span className="capitalize">{skill.replace(/([A-Z])/g, " $1")}</span>
                        <Badge variant={val === "Good" ? "success" : val === "Fair" ? "warning" : "danger"}>
                          {val}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 text-xs space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider">Gross Motor Skills</h4>
                    {Object.entries(selectedAssessment.otDetails.grossMotor).map(([skill, val]) => (
                      <div key={skill} className="flex justify-between items-center text-[11px]">
                        <span className="capitalize">{skill.replace(/([A-Z])/g, " $1")}</span>
                        <Badge variant={val === "Good" ? "success" : val === "Fair" ? "warning" : "danger"}>
                          {val}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PT Details */}
            {activeFormTab === "pt-details" && selectedAssessment.ptDetails && (
              <div className="space-y-4">
                {/* Posture & Muscle Tone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 text-xs space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider">Posture Assessment</h4>
                    {Object.entries(selectedAssessment.ptDetails.posture).map(([area, deviation]) => (
                      <div key={area} className="flex justify-between items-center text-[11px]">
                        <span className="capitalize">{area} alignment</span>
                        <Badge variant={deviation === "Normal" ? "success" : "warning"}>{deviation}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 text-xs space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider">Muscle Tone Assessment</h4>
                    {Object.entries(selectedAssessment.ptDetails.muscleTone).map(([area, tone]) => (
                      <div key={area} className="flex justify-between items-center text-[11px]">
                        <span className="capitalize">{area}</span>
                        <Badge variant={tone === "Normal" ? "success" : "warning"}>{tone}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gait & Outcome Measures */}
                <div className="border border-slate-100 rounded-xl p-4.5 bg-slate-50/30 text-xs space-y-2">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider">Gait Analysis</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(selectedAssessment.ptDetails.gaitAnalysis).map(([item, result]) => (
                      <div key={item} className="bg-white p-2 rounded border border-slate-100 text-center">
                        <span className="block text-[10px] text-slate-400 font-bold capitalize">{item.replace(/([A-Z])/g, " $1")}</span>
                        <span className={`block font-bold text-xs mt-1 ${result === "Normal" ? "text-emerald-600" : "text-rose-600"}`}>
                          {result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Findings, Recommendations & Approvals */}
            {activeFormTab === "findings" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Clinical Impression Summary</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {selectedAssessment.clinicalImpressionSummary}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Therapist Recommendations</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {selectedAssessment.recommendations}
                  </p>
                </div>

                {/* Head Doctor Remarks & Signatures */}
                {selectedAssessment.status === "Pending Review" ? (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Head Doctor Clinical Remarks</label>
                      <textarea
                        value={doctorRemarks}
                        onChange={(e) => setDoctorRemarks(e.target.value)}
                        placeholder="Write clinical remarks, dosage changes, or instructions for the therapist..."
                        className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => submitReview("Reject")}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject / Request Changes
                      </button>
                      <button
                        onClick={() => submitReview("Approved")}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 flex items-center gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Sign & Approve Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-4 text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Approved by Head Doctor Anand Iyer</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
