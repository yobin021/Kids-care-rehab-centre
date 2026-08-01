"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";

export default function AdminDashboard() {
  const { user, childrenList, staffList } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [childrenList]);

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div>
        <h2 className="text-[20px] font-bold text-[#2C2C2A]">Welcome, Dr. Radha</h2>
        <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">{todayStr}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onClick={() => navigate(`/reports/${childId}/therapist`)}
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
