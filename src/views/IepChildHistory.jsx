"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, PlusCircle, ClipboardList, FileText,
  CheckCircle2, Clock, AlertTriangle, Eye, Edit3, Trash2
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { iepService } from "../services/iepService";
import { assessmentService } from "../services/assessmentService";

const STATUS_CONFIG = {
  published: { label: "Published", variant: "green", icon: CheckCircle2 },
  pending_review: { label: "Pending Review", variant: "amber", icon: AlertTriangle },
  draft: { label: "Draft", variant: "amber", icon: Clock },
  approved: { label: "Approved", variant: "green", icon: CheckCircle2 },
};

export default function IepChildHistory() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { childrenList, isAdmin, showToast } = useAuth();

  const child = childrenList.find(c => c.id === childId) || null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this IEP report? This action cannot be undone.")) {
      try {
        await iepService.deleteReport(reportId);
        if (showToast) showToast("IEP report deleted successfully", "success");
        fetchHistory();
      } catch (err) {
        console.error("Failed to delete IEP report:", err);
        if (showToast) showToast("Failed to delete report.", "danger");
      }
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (window.confirm("Are you sure you want to delete this IEP assessment? This will permanently delete the assessment record.")) {
      try {
        await assessmentService.delete(assessmentId, childId);
        if (showToast) showToast("IEP assessment deleted successfully", "success");
        fetchHistory();
      } catch (err) {
        console.error("Failed to delete IEP assessment:", err);
        if (showToast) showToast("Failed to delete assessment.", "danger");
      }
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await iepService.getIepHistory(childId);
      setHistory(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [childId]);

  const canStartNew = () => {
    if (history.length === 0) return true;
    const latest = history[0]; // newest first
    if (!latest.report) return true;
    // Allow new cycle if latest report is published
    if (latest.report.status === "published" || latest.report.review_status === "published") return true;
    return false;
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/iep")} className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">IEP History — {child?.name || childId}</h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">{child?.diagnosis || ""} · {child?.age || ""}</p>
          </div>
        </div>
        {canStartNew() && (
          <Button icon={PlusCircle} onClick={() => navigate(`/assessment/new/${childId}`)}>
            {history.length === 0 ? "Start First IEP" : "New IEP Assessment"}
          </Button>
        )}
      </div>

      {/* Child Summary Card */}
      {child && (
        <Card padding="p-4" className="flex items-center gap-4 bg-[#F0F7FF] border-[#C3DAFB]">
          <div className="h-10 w-10 rounded-full bg-[#185FA5]/10 flex items-center justify-center shrink-0">
            <ClipboardList className="h-5 w-5 text-[#185FA5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#2C2C2A]">{child.name} · Profile {child.profile}</p>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">{child.diagnosis} · {child.id}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-bold text-[#185FA5]">{history.length} IEP Cycle{history.length !== 1 ? "s" : ""}</p>
            <p className="text-[10px] text-[#5F5E5A] font-semibold">Assessment History</p>
          </div>
        </Card>
      )}

      {/* History Table */}
      {loading ? (
        <SkeletonCard count={3} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchHistory} />
      ) : history.length === 0 ? (
        <Card className="p-10 text-center space-y-4">
          <ClipboardList className="h-10 w-10 text-[#D3D1C7] mx-auto" />
          <div>
            <p className="text-sm font-bold text-[#2C2C2A]">No IEP assessments yet</p>
            <p className="text-xs text-[#5F5E5A] font-semibold mt-1">Start the first IEP assessment for {child?.name || "this student"}.</p>
          </div>
          <Button icon={PlusCircle} className="mx-auto" onClick={() => navigate(`/assessment/new/${childId}`)}>
            Start First IEP Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-[10px] font-bold text-[#9B9A96] uppercase tracking-wide">
            <span>Cycle</span>
            <span>Period</span>
            <span>Assessment Date</span>
            <span>Report Status</span>
            <span className="text-right">Actions</span>
          </div>

          {history.map((item, idx) => {
            const statusConf = STATUS_CONFIG[item.report?.review_status || item.report?.status] || STATUS_CONFIG.draft;
            const Icon = statusConf.icon;
            const isLatest = idx === 0;
            const isPending = item.report?.review_status === "pending_review";
            const isPublished = item.report?.status === "published" || item.report?.review_status === "published";
            const hasReport = !!item.report;

            return (
              <Card
                key={item.cycle}
                padding="p-4"
                className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_1fr_auto] gap-3 sm:gap-4 items-center ${isLatest ? "border-[#185FA5]/30 bg-[#F0F7FF]/50" : ""}`}
              >
                {/* Cycle */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#185FA5]/10 text-[#185FA5] text-xs font-black flex items-center justify-center">
                    {item.cycle}
                  </div>
                  {isLatest && <span className="text-[9px] font-bold text-[#185FA5] bg-[#185FA5]/10 px-1.5 py-0.5 rounded-full">Latest</span>}
                </div>

                {/* Period */}
                <div>
                  <p className="text-xs font-bold text-[#2C2C2A]">{item.period}</p>
                  {item.report?.next_review_date && (
                    <p className="text-[10px] text-[#5F5E5A] font-semibold">Next Review: {item.report.next_review_date}</p>
                  )}
                </div>

                {/* Assessment Date */}
                <div>
                  {item.assessment ? (
                    <>
                      <p className="text-xs font-bold text-[#2C2C2A]">{item.assessment.assessment_date}</p>
                      <p className="text-[10px] text-[#5F5E5A] font-semibold">ISAA: {item.assessment.isaa_score ?? "—"}</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-[#9B9A96] italic">Not assessed yet</p>
                  )}
                </div>

                {/* Report Status */}
                <div>
                  {hasReport ? (
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${isPublished ? "text-[#3B6D11]" : isPending ? "text-[#B45309]" : "text-[#5F5E5A]"}`} />
                      <Badge label={statusConf.label} variant={statusConf.variant} size="sm" />
                    </div>
                  ) : item.assessment ? (
                    <Badge label="Report Needed" variant="default" size="sm" />
                  ) : (
                    <span className="text-[11px] text-[#9B9A96] italic">Upcoming</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  {item.assessment && !hasReport && (
                    <Button
                      size="sm"
                      icon={FileText}
                      onClick={() => navigate(`/iep/${childId}/generate/${item.assessment.id}`)}
                    >
                      Generate Report
                    </Button>
                  )}
                  {hasReport && isPublished && (
                    <Button
                      variant="outlined"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/iep/report/${item.report.id}`)}
                    >
                      View
                    </Button>
                  )}
                  {hasReport && isPending && isAdmin && (
                    <Button
                      size="sm"
                      icon={Edit3}
                      onClick={() => navigate(`/iep/report/${item.report.id}/review`)}
                    >
                      Review
                    </Button>
                  )}
                  {hasReport && isPending && !isAdmin && (
                    <span className="text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-1 rounded-full">
                      Awaiting Admin Review
                    </span>
                  )}
                  {hasReport && (
                    <Button
                      variant="outlined"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteReport(item.report.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      title="Delete IEP Report"
                    >
                      Delete
                    </Button>
                  )}
                  {!hasReport && item.assessment && (
                    <Button
                      variant="outlined"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteAssessment(item.assessment.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      title="Delete IEP Assessment"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Next Cycle Prompt */}
      {!loading && !error && history.length > 0 && canStartNew() && (
        <Card padding="p-4" className="border-dashed border-[#D3D1C7] bg-[#F8F8F6] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#2C2C2A]">Ready for Next IEP Cycle</p>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">
              Start a new 3-month assessment to continue the IEP cycle for {child?.name}.
            </p>
          </div>
          <Button icon={PlusCircle} size="sm" onClick={() => navigate(`/assessment/new/${childId}`)}>
            New Assessment
          </Button>
        </Card>
      )}
    </div>
  );
}
