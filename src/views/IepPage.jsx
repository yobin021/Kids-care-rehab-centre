"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, ClipboardList, Clock, CheckCircle2, AlertTriangle, Search, ChevronRight, PlusCircle, Beaker } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import { iepService } from "../services/iepService";
import { assessmentService } from "../services/assessmentService";

function getReviewStatusBadge(reviewStatus, reportStatus) {
  if (reportStatus === "published" || reviewStatus === "published") return { label: "Published", variant: "green" };
  if (reviewStatus === "pending_review") return { label: "Pending Review", variant: "amber" };
  if (reviewStatus === "draft" || reviewStatus === "approved") return { label: "Draft", variant: "amber" };
  return { label: "No Report", variant: "default" };
}

export default function IepPage() {
  const navigate = useNavigate();
  const { childrenList, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [latestAssessments, setLatestAssessments] = useState({});
  const [latestReports, setLatestReports] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const count = await iepService.getPendingReviewCount();
        setPendingCount(count);

        // Fetch latest assessment + report for each child
        const aMap = {};
        const rMap = {};
        await Promise.all(
          (childrenList || []).map(async (c) => {
            try {
              const [apts, rpts] = await Promise.all([
                assessmentService.getByChildId(c.id),
                iepService.getReportsByChildId(c.id)
              ]);
              aMap[c.id] = Array.isArray(apts) && apts.length > 0 ? apts[0] : null;
              rMap[c.id] = Array.isArray(rpts) && rpts.length > 0 ? rpts[0] : null;
            } catch {
              aMap[c.id] = null;
              rMap[c.id] = null;
            }
          })
        );
        setLatestAssessments(aMap);
        setLatestReports(rMap);
      } catch (err) {
        console.warn("IepPage fetch:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [childrenList]);

  const iepChildren = useMemo(() => {
    return (childrenList || []).filter(c => c.program_type === "iep");
  }, [childrenList]);

  const filtered = iepChildren.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toLowerCase().includes(search.toLowerCase()) ||
    c.school?.toLowerCase().includes(search.toLowerCase())
  );

  const profileColors = { 1: "#185FA5", 2: "#0F6E56", 3: "#3C3489", 4: "#993C1D" };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#2C2C2A] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#185FA5]" />
            IEP — Special School
          </h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
            Individualized Education Program · 24-Section Assessment Sheets &amp; 3-Month Progress Review Cycles
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && pendingCount > 0 && (
            <div
              onClick={() => navigate("/iep?filter=pending")}
              className="bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[8px] px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-[#B45309]" />
              <span className="text-xs font-bold text-[#92400E]">
                {pendingCount} report{pendingCount > 1 ? "s" : ""} pending review
              </span>
            </div>
          )}
          <Button
            icon={PlusCircle}
            onClick={() => navigate("/children/new?program=iep")}
          >
            Register Student for IEP
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search students by name, ID, diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="h-3.5 w-3.5 text-[#9B9A96]" />}
        />
      </div>

      {/* Student Grid */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-xs font-semibold text-[#5F5E5A]">No students found. Register a student first.</p>
          <Button icon={PlusCircle} className="mx-auto mt-4" size="sm" onClick={() => navigate("/children/new")}>
            Register Student
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(child => {
            const latestApt = latestAssessments[child.id];
            const latestReport = latestReports[child.id];
            const badge = getReviewStatusBadge(latestReport?.review_status, latestReport?.status);
            const cycle = latestReport?.iep_cycle || (latestApt ? 1 : 0);
            const profileColor = profileColors[child.profile] || "#185FA5";

            return (
              <Card key={child.id} padding="p-4" className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors group">
                <div className="space-y-2">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#2C2C2A] truncate">{child.name}</h3>
                      <p className="text-[10px] font-mono text-[#9B9A96]">{child.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge label="IEP Special School" variant="blue" size="sm" />
                      <Badge label={badge.label} variant={badge.variant} size="sm" />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5F5E5A] font-semibold">{child.age} · {child.diagnosis}</p>

                  {/* IEP Status */}
                  <div className="bg-[#F8F8F6] rounded-[8px] p-3 space-y-1.5 border border-[#E8E6DF]">
                    {latestApt ? (
                      <>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5F5E5A]">
                          <ClipboardList className="h-3 w-3 text-[#185FA5]" />
                          <span>Last Assessment: <strong className="text-[#2C2C2A]">{latestApt.assessment_date || "—"}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5F5E5A]">
                          <Clock className="h-3 w-3 text-[#3C3489]" />
                          <span>Cycle: <strong className="text-[#2C2C2A]">{cycle > 0 ? `${cycle} (Month ${(cycle - 1) * 3}–${cycle * 3})` : "—"}</strong></span>
                        </div>
                        {latestReport?.next_review_date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5F5E5A]">
                            <CheckCircle2 className="h-3 w-3 text-[#0F6E56]" />
                            <span>Next Review: <strong className="text-[#2C2C2A]">{latestReport.next_review_date}</strong></span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] font-semibold text-[#9B9A96] italic">No IEP assessment yet</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => navigate(`/iep/${child.id}`)}
                    icon={ChevronRight}
                  >
                    IEP History
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => navigate(`/assessment/new/${child.id}`)}
                    icon={PlusCircle}
                  >
                    {latestApt ? "New Cycle" : "Start IEP"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
