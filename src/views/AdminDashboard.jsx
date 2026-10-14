import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CalendarDays,
  Activity,
  BookOpen,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Edit3,
  AlertTriangle,
  Send,
  Sparkles
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";
import { appointmentService } from "../services/appointmentService";
import { iepService } from "../services/iepService";

export default function AdminDashboard() {
  const { user, childrenList, showToast } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iepPendingCount, setIepPendingCount] = useState(0);

  // Pending Staff Reports awaiting Admin Review
  const [pendingReports, setPendingReports] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [publishingId, setPublishingId] = useState(null);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportService.getAllPublished();
      if (result && result.length > 0) {
        setData(result);
      } else {
        fallbackLocal();
      }
    } catch (err) {
      console.warn("Published reports error fallback:", err.message);
      fallbackLocal();
    } finally {
      setLoading(false);
    }

    function fallbackLocal() {
      const pubChildren = childrenList.filter((c) => c.reportsCount > 0);
      setData(pubChildren);
    }
  };

  const fetchPendingReports = async () => {
    try {
      setLoadingPending(true);
      const [therapyPending, iepPending] = await Promise.all([
        reportService.getAllPending().catch(() => []),
        iepService.getPendingReview().catch(() => [])
      ]);

      const combined = [];
      const seenChildOrRep = new Set();

      // Process therapy pending
      if (Array.isArray(therapyPending)) {
        for (const r of therapyPending) {
          const idKey = r.id || r.child_id;
          if (!seenChildOrRep.has(idKey)) {
            seenChildOrRep.add(idKey);
            const matchedChild = childrenList.find((c) => c.id === r.child_id) || r.children;
            combined.push({
              ...r,
              childName: matchedChild?.name || r.children?.name || r.childName || "Child",
              childId: r.child_id || r.id,
              type: r.assessment_type || matchedChild?.therapy_category || "Therapy",
              prepared_by: r.prepared_by || "Therapy Staff",
              created_at: r.created_at || new Date().toISOString(),
              isIep: false
            });
          }
        }
      }

      // Process IEP pending
      if (Array.isArray(iepPending)) {
        for (const r of iepPending) {
          const idKey = r.id || r.child_id;
          if (!seenChildOrRep.has(idKey)) {
            seenChildOrRep.add(idKey);
            const matchedChild = childrenList.find((c) => c.id === r.child_id) || r.children;
            combined.push({
              ...r,
              childName: matchedChild?.name || r.student_name || "Student",
              childId: r.child_id || r.id,
              type: "Special School IEP",
              prepared_by: r.prepared_by || "Special Educator",
              created_at: r.created_at || new Date().toISOString(),
              isIep: true
            });
          }
        }
      }

      // Check localStorage for local/offline submitted drafts
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("report_draft_")) {
            const cId = key.replace("report_draft_", "");
            if (!localStorage.getItem(`report_published_${cId}`) && !seenChildOrRep.has(cId)) {
              try {
                const draft = JSON.parse(localStorage.getItem(key));
                if (draft) {
                  const matchedChild = childrenList.find((c) => c.id === cId);
                  seenChildOrRep.add(cId);
                  combined.push({
                    id: draft.id || cId,
                    child_id: cId,
                    childId: cId,
                    childName: matchedChild?.name || draft.childName || "Child",
                    status: draft.status || "pending_review",
                    type: draft.assessment_type || matchedChild?.therapy_category || "Clinical Therapy",
                    prepared_by: draft.prepared_by || draft.formState?.therapistReport?.preparedBy || "Therapy Staff",
                    created_at: draft.savedAt || draft.updatedDate || new Date().toISOString(),
                    isIep: false,
                    rawDraft: draft
                  });
                }
              } catch (_) {}
            }
          }
        }
      }

      setPendingReports(combined);
    } catch (err) {
      console.warn("Admin fetch pending reports notice:", err);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleQuickPublish = async (rep) => {
    try {
      setPublishingId(rep.id || rep.childId);
      if (rep.isIep) {
        await iepService.publishIepReport(rep.id, user?.name, user?.id);
      } else {
        await reportService.publish(rep.id || rep.childId, user?.name || "Admin", user?.id, rep);
        const pubKey = rep.childId || rep.id;
        const pubData = {
          id: rep.id || `rep-${Date.now()}`,
          childId: pubKey,
          child_id: pubKey,
          childName: rep.childName,
          status: "published",
          review_status: "published",
          published_at: new Date().toISOString(),
          publishedDate: new Date().toISOString().split("T")[0],
          assessment_type: rep.type
        };
        localStorage.setItem(`report_published_${pubKey}`, JSON.stringify(pubData));
        localStorage.removeItem(`report_draft_${pubKey}`);
      }
      if (showToast) showToast(`✓ Report for ${rep.childName} published to both Parent & Staff portals!`, "success");
      await Promise.all([fetchPendingReports(), fetchReports()]);
    } catch (err) {
      if (showToast) showToast(`Failed to publish: ${err.message}`, "danger");
    } finally {
      setPublishingId(null);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPendingReports();
    iepService.getPendingReviewCount().then((n) => setIepPendingCount(n)).catch(() => {});
  }, [childrenList]);

  return (
    <div className="space-y-8 text-slate-800 pb-10">
      
      {/* ─── Gradient Welcome Banner ─── */}
      <div className="relative bg-white rounded-3xl border border-white shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="gradient-text-blue">{user?.name || "Dr. Radha"}</span>
          </h2>
          <p className="text-xs sm:text-[14px] font-semibold text-slate-500">{todayStr}</p>
        </div>

        {pendingReports.length > 0 && (
          <div className="relative z-10 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              {pendingReports.length} Staff {pendingReports.length === 1 ? "Report" : "Reports"} Awaiting Review
            </span>
          </div>
        )}
      </div>

      {/* ─── REPORTS AWAITING ADMIN REVIEW (CRITICAL STAFF FLOW) ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Reports Awaiting Admin Review
              </h3>
              {pendingReports.length > 0 && (
                <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  {pendingReports.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
              Staff assessment reports waiting for Admin verification, editing, and publication to Parent and Staff portals.
            </p>
          </div>
        </div>

        {loadingPending ? (
          <SkeletonCard count={2} />
        ) : pendingReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-emerald-200 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">All Staff Reports Reviewed & Up to Date</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                When a therapist or special educator completes an assessment form and generates a report, it will appear here immediately for your review, editing, and publishing.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingReports.map((rep) => {
              const pathwayName = rep.type
                ? rep.type.includes("asd")
                  ? "ASD (ISAA Protocol)"
                  : rep.type.includes("adhd")
                  ? "ADHD (Conners' 3)"
                  : rep.type.includes("delay")
                  ? "Developmental Delay"
                  : rep.type.includes("learn") || rep.type.includes("sld")
                  ? "Learning Disability (SLD)"
                  : rep.type.includes("iep") || rep.isIep
                  ? "Special School IEP"
                  : rep.type
                : "Clinical Therapy";

              const isPublishingThis = publishingId === (rep.id || rep.childId);

              return (
                <div
                  key={rep.id || rep.childId}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 hover:border-amber-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{rep.childName}</h4>
                        <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                          ID: {rep.childId}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-300 shrink-0">
                        Pending Review
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500">Track:</span>
                        <span className="font-bold text-slate-800">{pathwayName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500">Prepared by:</span>
                        <span className="font-bold text-slate-800">{rep.prepared_by || "Therapy Staff"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500">Submitted:</span>
                        <span className="font-medium text-slate-700">
                          {rep.created_at ? rep.created_at.split("T")[0] : "Recently"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Button
                      fullWidth
                      size="sm"
                      icon={Edit3}
                      onClick={() =>
                        navigate(
                          rep.isIep
                            ? `/iep/report/${rep.id}/review`
                            : `/reports/${rep.id || rep.childId}/review`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Review & Edit Report
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleQuickPublish(rep)}
                        loading={isPublishingThis}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none"
                        title="Publish directly to Parent & Staff portals"
                      >
                        Publish to Portals
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        icon={Eye}
                        onClick={() =>
                          navigate(
                            rep.isIep
                              ? `/iep/report/${rep.id}`
                              : `/reports/${rep.id || rep.childId}/therapist`
                          )
                        }
                        className="shrink-0"
                        title="Preview report"
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── TWO MAIN CLINICAL MODULES ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* IEP Module Card */}
        <div
          onClick={() => navigate("/iep")}
          className="group relative bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-8 flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-violet" />
          <div className="absolute -bottom-8 -right-8 text-violet-500/5 group-hover:text-violet-500/10 transition-colors pointer-events-none">
            <BookOpen className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-6 flex-1">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-violet text-white flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              {iepPendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md animate-pulse">
                  {iepPendingCount} Needs Review
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">IEP Program</h3>
              <p className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mt-1">Special School Framework</p>
            </div>

            <p className="text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
              Review, edit and publish IEP reports. Manage student functional tracking across all 24 domains and approve therapist drafts.
            </p>
          </div>

          <div className="relative z-10 pt-5 sm:pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-violet-600 font-bold">
            <span className="text-sm sm:text-base">Open IEP Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Therapy Module Card */}
        <div
          onClick={() => navigate("/therapy")}
          className="group relative bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(5,150,105,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-8 flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-emerald" />
          <div className="absolute -bottom-8 -right-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none">
            <Activity className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-6 flex-1">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-emerald text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Therapy Pathways</h3>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">4 Distinct Clinical Tracks</p>
            </div>

            <p className="text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
              Manage clinical therapy pathways for ASD, ADHD, Developmental Delay, and Learning Disability. Oversee exercise programs.
            </p>
          </div>

          <div className="relative z-10 pt-5 sm:pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold">
            <span className="text-sm sm:text-base">Open Therapy Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ─── SECONDARY ACTION CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-blue-400 group cursor-pointer" padding="p-0">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">Children & Reports</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Access any child's clinical profile or past reports.</p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100">
            <Button onClick={() => navigate("/children")} fullWidth size="lg">
              View Directory
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-emerald-400 group cursor-pointer" padding="p-0">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">Staff Management</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Create accounts and manage access permissions.</p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate("/admin/staff")} fullWidth size="lg">
              Manage Staff
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-5 hover:border-amber-400 group cursor-pointer" padding="p-0">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">Appointments</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Schedule and oversee daily therapy sessions.</p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100">
            <Button variant="amber" style={{ background: 'linear-gradient(90deg, #D97706, #F59E0B)', color: 'white', border: 'none' }} onClick={() => navigate("/appointments")} fullWidth size="lg">
              View Schedule
            </Button>
          </div>
        </Card>
      </div>

      {/* ─── RECENT REPORTS SECTION ─── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Recently Published Reports</h3>
          <Badge label="All Systems Verified" variant="blue-soft" size="sm" />
        </div>

        {loading ? (
          <SkeletonCard count={3} />
        ) : error ? (
          <ErrorMessage error={error} onRetry={fetchReports} />
        ) : (data || []).length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-500 font-medium text-sm">
              No published reports yet. When clinical reports are approved and published, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(data || []).slice(0, 3).map((r) => {
              const childName = r.children?.name || r.name || "Child";
              const childId = r.child_id || r.id;
              const date = r.published_at?.split("T")[0] || r.lastReportDate || "Recently Updated";

              return (
                <Card key={r.id} accent="emerald" padding="p-5" className="flex flex-col justify-between group cursor-pointer hover:border-emerald-200">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[15px] font-bold text-slate-900 leading-tight">{childName}</h4>
                      <Badge label="Published" variant="green" size="sm" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {date}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">ID: {childId}</p>
                    </div>
                  </div>

                  <Button
                    variant="outlined"
                    fullWidth
                    icon={Eye}
                    onClick={() => navigate(`/reports/${r.id || childId}/therapist`)}
                    className="group-hover:border-emerald-300 group-hover:text-emerald-700"
                  >
                    View Report
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
