"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, Badge } from "@/components/ui/ui";
import { Download, FileText, ClipboardList, CheckCircle, Clock } from "lucide-react";

export default function ReportsTab() {
  const { children, therapists, assessments } = useDashboard();
  const [exporting, setExporting] = useState<string | null>(null);

  const activeCasesCount = children.filter((c) => c.status === "Active").length;
  const reviewDueCount = children.filter((c) => c.status === "Pending Review").length;

  const triggerExport = (reportName: string) => {
    setExporting(reportName);
    setTimeout(() => {
      setExporting(null);
      alert(`${reportName} exported successfully to Downloads folder!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="flex items-center gap-4 border-blue-50/50">
          <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Reports</span>
            <h3 className="text-lg font-black text-slate-800">4 Core Templates</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-emerald-50/50">
          <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Treatments</span>
            <h3 className="text-lg font-black text-slate-800">{activeCasesCount} Children</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-amber-50/50">
          <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reviews Pending Signature</span>
            <h3 className="text-lg font-black text-slate-800">{reviewDueCount} Cases</h3>
          </div>
        </Card>
      </div>

      {/* Reports Directory Card */}
      <Card className="p-0 overflow-hidden border border-blue-50/60 shadow-xs">
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Reports Templates</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {/* Report 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4 hover:bg-slate-50/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Monthly Clinical Activity & Case Report</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Summary of new admissions, discharges, active therapies, and recovery trends.</p>
              </div>
            </div>
            <button
              onClick={() => triggerExport("Monthly_Clinical_Activity_Report")}
              disabled={exporting !== null}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === "Monthly_Clinical_Activity_Report" ? "Exporting..." : "Download PDF"}
            </button>
          </div>

          {/* Report 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4 hover:bg-slate-50/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Therapist Session & Workload Audit</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Workload status for each staff member including session count, patient assignments, and efficiency rating.</p>
              </div>
            </div>
            <button
              onClick={() => triggerExport("Therapist_Workload_Audit")}
              disabled={exporting !== null}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === "Therapist_Workload_Audit" ? "Exporting..." : "Download CSV"}
            </button>
          </div>

          {/* Report 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4 hover:bg-slate-50/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Review Due Tracker</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">List of children scheduled for their 3-month goals review or cognitive/motor milestone re-assessments.</p>
              </div>
            </div>
            <button
              onClick={() => triggerExport("Review_Due_Tracker")}
              disabled={exporting !== null}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === "Review_Due_Tracker" ? "Exporting..." : "Download PDF"}
            </button>
          </div>

          {/* Report 4 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4 hover:bg-slate-50/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">Urgent Behavioral Incident Log</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Cumulative reports of sensory overload and aggression incidents flagged across all child cohorts.</p>
              </div>
            </div>
            <button
              onClick={() => triggerExport("Urgent_Behavioral_Incident_Log")}
              disabled={exporting !== null}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs px-4 py-2 shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === "Urgent_Behavioral_Incident_Log" ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
