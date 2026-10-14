"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Save, CheckCircle2, Send, Edit3,
  AlertTriangle, User, Calendar, Trash2
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import IepDomainRadarGraph from "../components/assessment/IepDomainRadarGraph";
import { iepService } from "../services/iepService";

export default function IepReportEditor() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, showToast } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [iepReport, setIepReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleDeleteReport = async () => {
    if (window.confirm("Are you sure you want to delete this IEP report? This action cannot be undone.")) {
      setDeleting(true);
      try {
        await iepService.deleteReport(reportId);
        showToast("IEP report deleted successfully", "success");
        navigate(reportData?.child_id ? `/iep/${reportData.child_id}` : "/iep");
      } catch (err) {
        console.error("Failed to delete IEP report:", err);
        showToast("Failed to delete report.", "danger");
      } finally {
        setDeleting(false);
      }
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/iep");
      return;
    }
    loadReport();
  }, [reportId, isAdmin]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await iepService.getReportById(reportId);
      if (!data && typeof window !== "undefined") {
        const saved = localStorage.getItem(`iep_report_${reportId}`) || localStorage.getItem(`report_draft_${reportId}`);
        if (saved) {
          try { data = JSON.parse(saved); } catch (_) {}
        }
      }
      if (!data) throw new Error("Report not found");
      setReportData(data);
      setIepReport(data.iep_report || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deep update helper for nested fields
  const updateField = (path, value) => {
    setIsDirty(true);
    setIepReport(prev => {
      const keys = path.split(".");
      const updated = { ...prev };
      let cursor = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...(cursor[keys[i]] || {}) };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const updateArrayField = (path, index, value) => {
    setIsDirty(true);
    setIepReport(prev => {
      const keys = path.split(".");
      const updated = { ...prev };
      let cursor = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = Array.isArray(cursor[keys[i]]) ? [...cursor[keys[i]]] : { ...(cursor[keys[i]] || {}) };
        cursor = cursor[keys[i]];
      }
      const arr = [...(cursor[keys[keys.length - 1]] || [])];
      arr[index] = value;
      cursor[keys[keys.length - 1]] = arr;
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await iepService.updateIepReport(reportId, iepReport);
      setIsDirty(false);
      showToast("Report changes saved.", "success");
    } catch (err) {
      showToast("Failed to save changes.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Save latest edits first
      await iepService.updateIepReport(reportId, {
        ...iepReport,
        approvalInfo: {
          ...(iepReport?.approvalInfo || {}),
          reviewedBy: user?.name || "Admin",
          reviewedDate: new Date().toISOString().split("T")[0],
          publishedBy: user?.name || "Admin",
          publishedDate: new Date().toISOString().split("T")[0],
          status: "published"
        }
      });
      await iepService.publishIepReport(reportId, user?.name || "Admin", user?.id);
      showToast("IEP Report published successfully!", "success");
      const childId = reportData?.child_id;
      navigate(childId ? `/iep/${childId}` : "/iep");
    } catch (err) {
      showToast("Failed to publish report. Please try again.", "danger");
      console.error("Publish error:", err.message);
    } finally {
      setPublishing(false);
      setShowPublishModal(false);
    }
  };

  const child = reportData?.children;
  const isPublished = reportData?.status === "published" || reportData?.review_status === "published";

  if (loading) return <div className="space-y-4"><SkeletonCard count={4} /></div>;
  if (error) return <ErrorMessage error={error} onRetry={loadReport} />;

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(reportData?.child_id ? `/iep/${reportData.child_id}` : "/iep")}
            className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A] flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-[#185FA5]" />
              Admin Review — IEP Report
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">
              {child?.name || "Student"} · Cycle {iepReport?.cycle || reportData?.iep_cycle || 1} · {iepReport?.period || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="outlined" size="sm" icon={Save} onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          )}
          {!isPublished && (
            <Button icon={Send} size="sm" onClick={() => setShowPublishModal(true)}>
              Approve & Publish
            </Button>
          )}
          {isPublished && <Badge label="Published" variant="green" />}
          <Button
            variant="outlined"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteReport}
            loading={deleting}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            title="Delete this IEP report"
          >
            Delete Report
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      {!isPublished ? (
        <div className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[10px] px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" />
          <p className="text-xs font-semibold text-[#92400E]">
            Admin Review Mode — Edit any section below, then click <strong>Approve &amp; Publish</strong> to make the report visible to staff and parents.
          </p>
        </div>
      ) : (
        <div className="bg-[#ECFDF5] border border-[#86EFAC] rounded-[10px] px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-[#3B6D11] shrink-0" />
          <p className="text-xs font-semibold text-[#3B6D11]">
            This report is published and visible to staff and parents.
          </p>
        </div>
      )}

      {/* Student Info (read-only) */}
      <Card padding="p-5" className="bg-gradient-to-r from-[#185FA5]/5 to-transparent border-[#185FA5]/20">
        <h3 className="text-xs font-bold text-[#185FA5] uppercase tracking-wide mb-3">Student Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div><p className="font-semibold text-[#5F5E5A]">Name</p><p className="font-bold text-[#2C2C2A]">{iepReport?.studentInfo?.name || child?.name || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">ID</p><p className="font-bold text-[#2C2C2A] font-mono">{iepReport?.studentInfo?.id || child?.id || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">Diagnosis</p><p className="font-bold text-[#2C2C2A]">{iepReport?.studentInfo?.diagnosis || child?.diagnosis || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">Assessment Date</p><p className="font-bold text-[#2C2C2A]">{iepReport?.studentInfo?.assessmentDate || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">IEP Cycle</p><p className="font-bold text-[#2C2C2A]">{iepReport?.cycle || 1} · {iepReport?.period || ""}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">Next Review</p><p className="font-bold text-[#2C2C2A]">{iepReport?.studentInfo?.nextReviewDate || iepReport?.nextReview?.date || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">Prepared By</p><p className="font-bold text-[#2C2C2A]">{iepReport?.approvalInfo?.preparedBy || reportData?.prepared_by || "—"}</p></div>
          <div><p className="font-semibold text-[#5F5E5A]">Prepared Date</p><p className="font-bold text-[#2C2C2A]">{iepReport?.approvalInfo?.preparedDate || "—"}</p></div>
        </div>
      </Card>

      {/* Domain Competency Graph */}
      <IepDomainRadarGraph
        domainScores={iepReport?.domainScores || reportData?.assessments?.domain_scores || {}}
        title="Functional Domain Profile & Progress Graph"
      />

      {/* EDITABLE SECTIONS */}

      {/* Assessment Summary */}
      <EditableSection title="Assessment Summary" icon="📋">
        <div className="space-y-3">
          <Input
            label="Overall Summary"
            type="textarea"
            rows={3}
            value={iepReport?.assessmentSummary?.overallSummary || ""}
            onChange={e => updateField("assessmentSummary.overallSummary", e.target.value)}
          />
          <Input
            label="Domain Highlights"
            type="textarea"
            rows={2}
            value={iepReport?.assessmentSummary?.domainHighlights || ""}
            onChange={e => updateField("assessmentSummary.domainHighlights", e.target.value)}
          />
          <Input
            label="Clinical Observations"
            type="textarea"
            rows={2}
            value={iepReport?.assessmentSummary?.clinicalObservations || ""}
            onChange={e => updateField("assessmentSummary.clinicalObservations", e.target.value)}
          />
        </div>
      </EditableSection>

      {/* Progress Comparison */}
      <EditableSection title={iepReport?.progressComparison?.isFirstCycle ? "Baseline Status" : "Progress Since Last Assessment"} icon={iepReport?.progressComparison?.isFirstCycle ? "📊" : "📈"}>
        <div className="space-y-3">
          {iepReport?.progressComparison?.isFirstCycle ? (
            <Input
              label="Baseline Narrative"
              type="textarea"
              rows={3}
              value={iepReport?.progressComparison?.baseline || ""}
              onChange={e => updateField("progressComparison.baseline", e.target.value)}
            />
          ) : (
            <>
              <Input
                label="Progress Narrative"
                type="textarea"
                rows={3}
                value={iepReport?.progressComparison?.narrative || ""}
                onChange={e => updateField("progressComparison.narrative", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Improved Areas (comma-separated)"
                  value={(iepReport?.progressComparison?.improved || []).join(", ")}
                  onChange={e => updateField("progressComparison.improved", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                />
                <Input
                  label="Unchanged Areas (comma-separated)"
                  value={(iepReport?.progressComparison?.unchanged || []).join(", ")}
                  onChange={e => updateField("progressComparison.unchanged", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                />
                <Input
                  label="Still Needs Improvement (comma-separated)"
                  value={(iepReport?.progressComparison?.needsImprovement || []).join(", ")}
                  onChange={e => updateField("progressComparison.needsImprovement", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                />
              </div>
            </>
          )}
        </div>
      </EditableSection>

      {/* Areas for Improvement */}
      <EditableSection title="Priority Areas for Improvement" icon="🎯">
        <div className="space-y-2">
          {(iepReport?.areasForImprovement || ["", "", ""]).map((area, i) => (
            <Input
              key={i}
              label={`Area ${i + 1}`}
              value={area}
              onChange={e => updateArrayField("areasForImprovement", i, e.target.value)}
              placeholder="e.g. Expressive communication — expanding vocabulary and sentence use"
            />
          ))}
        </div>
      </EditableSection>

      {/* 3-Month Plan */}
      <EditableSection title="3-Month Improvement Plan" icon="📅">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#5F5E5A]">Goals</p>
            {(iepReport?.threeMonthPlan?.goals || ["", "", ""]).map((goal, i) => (
              <Input
                key={i}
                label={`Goal ${i + 1}`}
                value={goal}
                onChange={e => updateArrayField("threeMonthPlan.goals", i, e.target.value)}
                placeholder="Measurable, specific goal for next 3 months"
              />
            ))}
          </div>
          <Input
            label="Approach"
            type="textarea"
            rows={2}
            value={iepReport?.threeMonthPlan?.approach || ""}
            onChange={e => updateField("threeMonthPlan.approach", e.target.value)}
          />
          <Input
            label="Expected Outcomes"
            type="textarea"
            rows={2}
            value={iepReport?.threeMonthPlan?.expectedOutcomes || ""}
            onChange={e => updateField("threeMonthPlan.expectedOutcomes", e.target.value)}
          />
        </div>
      </EditableSection>

      {/* Recommended Outcomes */}
      <EditableSection title="Recommended Outcomes" icon="✅">
        <Input
          type="textarea"
          rows={2}
          value={iepReport?.recommendedOutcomes || ""}
          onChange={e => updateField("recommendedOutcomes", e.target.value)}
          placeholder="Overall outcome statement for the 3-month period"
        />
      </EditableSection>

      {/* Next Review */}
      <EditableSection title="Next Review" icon="🗓️">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Next Review Date"
            type="date"
            value={iepReport?.nextReview?.date || iepReport?.studentInfo?.nextReviewDate || ""}
            onChange={e => updateField("nextReview.date", e.target.value)}
          />
          <Input
            label="Next Period"
            value={iepReport?.nextReview?.period || ""}
            onChange={e => updateField("nextReview.period", e.target.value)}
            placeholder="e.g. Month 3–6"
          />
          <Input
            label="Review Notes"
            value={iepReport?.nextReview?.notes || ""}
            onChange={e => updateField("nextReview.notes", e.target.value)}
          />
        </div>
      </EditableSection>

      {/* Approval Info (read-only after publish) */}
      {isPublished && (
        <Card padding="p-4" className="bg-[#ECFDF5] border-[#86EFAC]">
          <h4 className="text-xs font-bold text-[#3B6D11] mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Publication Information
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div><p className="font-semibold text-[#5F5E5A]">Prepared By</p><p className="font-bold text-[#2C2C2A]">{reportData?.prepared_by || "—"}</p></div>
            <div><p className="font-semibold text-[#5F5E5A]">Reviewed By</p><p className="font-bold text-[#2C2C2A]">{reportData?.reviewed_by || user?.name || "—"}</p></div>
            <div><p className="font-semibold text-[#5F5E5A]">Published By</p><p className="font-bold text-[#2C2C2A]">{reportData?.published_by || "—"}</p></div>
            <div><p className="font-semibold text-[#5F5E5A]">Published</p><p className="font-bold text-[#2C2C2A]">{reportData?.published_at?.split("T")[0] || "—"}</p></div>
          </div>
        </Card>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outlined" onClick={() => navigate(reportData?.child_id ? `/iep/${reportData.child_id}` : "/iep")}>
          ← Back to IEP History
        </Button>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="outlined" icon={Save} onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          )}
          {!isPublished && (
            <Button icon={Send} onClick={() => setShowPublishModal(true)}>
              Approve & Publish
            </Button>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Approve & Publish IEP Report">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Publish this IEP Report for <strong>{child?.name || "student"}</strong>?
          </p>
          <div className="bg-[#ECFDF5] border border-[#86EFAC] rounded-[8px] px-3 py-2 text-[#3B6D11] space-y-1">
            <p>✓ Report will be marked as <strong>Published</strong></p>
            <p>✓ Staff will be able to view the report</p>
            <p>✓ Parent portal will show the IEP report</p>
            <p>✓ Publication audit trail will be recorded</p>
          </div>
          <div className="flex items-center gap-1.5 text-[#5F5E5A]">
            <User className="h-3 w-3" />
            <span>Publishing as: <strong className="text-[#2C2C2A]">{user?.name || "Admin"}</strong></span>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowPublishModal(false)}>Cancel</Button>
            <Button onClick={handlePublish} loading={publishing}>Approve & Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EditableSection({ title, icon, children }) {
  return (
    <Card padding="p-5" className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E8E6DF] pb-2">
        <span className="text-base">{icon}</span>
        <h4 className="text-sm font-bold text-[#2C2C2A]">{title}</h4>
        <span className="ml-auto text-[10px] font-bold text-[#185FA5] bg-[#185FA5]/10 px-2 py-0.5 rounded-full">Editable</span>
      </div>
      {children}
    </Card>
  );
}
