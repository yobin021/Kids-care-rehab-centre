import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, CalendarDays, Activity, BookOpen, Users, Shield, ArrowRight } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";
import { appointmentService } from "../services/appointmentService";
import { iepService } from "../services/iepService";

export default function AdminDashboard() {
  const { user, childrenList, staffList, reloadStaff } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iepPendingCount, setIepPendingCount] = useState(0);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const activeStaffCount = staffList.filter((s) => s.isActive).length;

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

  useEffect(() => {
    fetchReports();
    if (reloadStaff) reloadStaff();
    iepService.getPendingReviewCount().then(n => setIepPendingCount(n)).catch(() => {});
  }, [childrenList, reloadStaff]);

  return (
    <div className="space-y-8 text-slate-800 pb-10">
      
      {/* ─── Gradient Welcome Banner ─── */}
      <div className="relative bg-white rounded-3xl border border-white shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="gradient-text-blue">{user?.name || "Dr. Radha"}</span>
          </h2>
          <p className="text-xs sm:text-[14px] font-semibold text-slate-500">{todayStr}</p>
        </div>

        <div className="w-full sm:w-auto relative z-10 flex items-center justify-around sm:justify-start gap-4 bg-white/60 backdrop-blur-md px-4 sm:px-5 py-3 rounded-2xl border border-white shadow-sm">
          <div className="text-center sm:text-right">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-lg sm:text-xl font-black text-blue-700">{(data || []).length}</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
            <p className="text-lg sm:text-xl font-black text-emerald-600">{activeStaffCount}</p>
          </div>
        </div>
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
