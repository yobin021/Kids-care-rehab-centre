import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, CalendarDays } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";
import { appointmentService } from "../services/appointmentService";
import { iepService } from "../services/iepService";

export default function AdminDashboard() {
  const { user, childrenList, staffList } = useAuth();
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
    iepService.getPendingReviewCount().then(n => setIepPendingCount(n)).catch(() => {});
  }, [childrenList]);

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div>
        <h2 className="text-[20px] font-bold text-[#2C2C2A]">Welcome, {user?.name || "Dr. Radha"}</h2>
        <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">{todayStr}</p>
      </div>

      {/* ═══ TWO MAIN BUTTONS: IEP + THERAPY ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className="flex flex-col justify-between bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#185FA5] transition-all duration-200 cursor-pointer group hover:shadow-md p-6"
          onClick={() => navigate("/iep")}
        >
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-[12px] bg-[#185FA5]/10 flex items-center justify-center group-hover:bg-[#185FA5]/20 transition-colors">
              <svg className="h-6 w-6 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-[18px] font-bold text-[#2C2C2A]">IEP</h3>
                <p className="text-[11px] font-bold text-[#185FA5] uppercase tracking-wide">Individualized Education Program</p>
              </div>
              {iepPendingCount > 0 && (
                <span className="ml-auto bg-[#F59E0B] text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  {iepPendingCount} pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Review, edit and publish IEP reports. View all student IEP cycles and assessment history.
              {iepPendingCount > 0 && <span className="font-bold text-[#B45309]"> {iepPendingCount} report{iepPendingCount > 1 ? "s" : ""} awaiting your review.</span>}
            </p>
          </div>
          <div className="pt-4 border-t border-[#D3D1C7]/60 mt-4">
            <Button onClick={(e) => { e.stopPropagation(); navigate("/iep"); }} fullWidth className="h-11">Open IEP →</Button>
          </div>
        </div>
        {/* Button 2: Therapy */}
        <div
          className="flex flex-col justify-between bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#0F6E56] transition-all duration-200 cursor-pointer group hover:shadow-md p-6"
          onClick={() => navigate("/therapy")}
        >
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-[12px] bg-[#0F6E56]/10 flex items-center justify-center group-hover:bg-[#0F6E56]/20 transition-colors">
              <svg className="h-6 w-6 text-[#0F6E56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#2C2C2A]">Therapy</h3>
              <p className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-wide">4 Therapy Pathways (ASD · ADHD · DD · LD)</p>
            </div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Manage clinical therapy pathways across ASD, ADHD, Developmental Delay, and Learning Disability. Oversee exercise programs and category statistics.
            </p>
          </div>
          <div className="pt-4 border-t border-[#D3D1C7]/60 mt-4">
            <Button onClick={(e) => { e.stopPropagation(); navigate("/therapy"); }} fullWidth className="h-11 bg-[#0F6E56] hover:bg-[#085041]">Open Therapy →</Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between p-6 space-y-4 hover:border-[#185FA5] transition-colors">
          <div className="space-y-3">
            <div className="text-4xl">👶</div>
            <h3 className="text-[18px] font-bold text-[#2C2C2A]">Children & Reports</h3>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              View all registered children and their assessment reports. Access any child&apos;s therapist or parent report.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D3D1C7]/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2A]">
              <span>{childrenList.length} children registered</span>
              <span className="text-[#0F6E56]">{(data || []).length} reports published</span>
            </div>
            <Button onClick={() => navigate("/children")} fullWidth className="h-11">
              View All Children →
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-4 hover:border-[#185FA5] transition-colors">
          <div className="space-y-3">
            <div className="text-4xl">👥</div>
            <h3 className="text-[18px] font-bold text-[#2C2C2A]">Staff Management</h3>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Manage staff accounts. Create new logins, reset passwords, and activate or deactivate accounts.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D3D1C7]/60 space-y-3">
            <div className="text-xs font-bold text-[#2C2C2A]">
              <span>{activeStaffCount} active staff members</span>
            </div>
            <Button variant="secondary" onClick={() => navigate("/admin/staff")} fullWidth className="h-11">
              Manage Staff →
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 space-y-4 hover:border-[#3C3489] transition-colors">
          <div className="space-y-3">
            <CalendarDays className="h-10 w-10 text-[#3C3489]" />
            <h3 className="text-[18px] font-bold text-[#2C2C2A]">Appointments</h3>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              Schedule and manage therapy sessions. Track upcoming, completed, and cancelled appointments.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D3D1C7]/60 space-y-3">
            <Button style={{ background: "#3C3489" }} onClick={() => navigate("/appointments")} fullWidth className="h-11">
              Manage Appointments →
            </Button>
          </div>
        </Card>
      </div>

      {/* THREE STATES FOR RECENTLY PUBLISHED REPORTS */}
      <div className="space-y-3">
        <h3 className="text-[16px] font-bold text-[#2C2C2A]">Recently Published Reports</h3>

        {loading ? (
          <SkeletonCard count={3} />
        ) : error ? (
          <ErrorMessage error={error} onRetry={fetchReports} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data || []).slice(0, 3).map((r) => {
              const childName = r.children?.name || r.name || "Child";
              const childId = r.child_id || r.id;

              return (
                <Card key={r.id} padding="p-4" className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2C2C2A]">{childName}</h4>
                      <Badge label="Published" variant="green" size="sm" />
                    </div>
                    <p className="text-[11px] text-[#5F5E5A] font-semibold">
                      Report Date: {r.published_at?.split("T")[0] || r.lastReportDate || "20 Nov 2025"}
                    </p>
                    <p className="text-[10px] font-mono text-[#9B9A96]">{childId}</p>
                  </div>

                  <Button
                    variant="outlined"
                    size="sm"
                    fullWidth
                    icon={Eye}
                    onClick={() => navigate(`/reports/${r.id || childId}/therapist`)}
                  >
                    View Therapist Report
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
