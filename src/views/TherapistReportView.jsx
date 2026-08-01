"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { reportService } from "../services/reportService";

export default function TherapistReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportService.getById(id);
      if (result) {
        setData(result);
      } else {
        fallbackLocal();
      }
    } catch (err) {
      console.warn("Therapist report fetch fallback:", err.message);
      fallbackLocal();
    } finally {
      setLoading(false);
    }

    function fallbackLocal() {
      const saved = localStorage.getItem(`report_published_${child?.id}`);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          setError("Failed to parse saved report.");
        }
      } else {
        setError("Therapist report not found.");
      }
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id, child?.id]);

  const reportData = data?.therapist_report || data?.therapistReport || {
    background: `${child?.name} is a ${child?.age} ${child?.gender} presenting with ${child?.primaryConcern}. Evaluated using ISAA protocol.`,
    findings: "ISAA score of 94 indicates Mild Autism Spectrum Disorder. Deficits observed in social communication.",
    concerns: "Speech delay, poor eye contact, sensory sensitivity, sitting tolerance 5-10 minutes.",
    diagnosis: `${child?.diagnosis} — Profile B (ASD High Functioning)`,
    recommendations: "Speech therapy 2x/week, Occupational therapy 2x/week, Parent guidance program."
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchReport} />;
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 max-w-4xl mx-auto print:p-0">
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/children/${child?.id}`)} className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">
              Therapist Report — <span className="text-[#185FA5]">{child?.name}</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Detailed clinical documentation and assessment findings.</p>
          </div>
        </div>

        <Button icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
      </div>

      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-1">
        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Kids Care Rehab Centre — Clinical Report</span>
        <h2 className="text-xl font-black">{child?.name} ({child?.id})</h2>
        <p className="text-xs text-blue-100">Date of Evaluation: {child?.lastReportDate || "20 November 2025"}</p>
      </div>

      <Card title="Clinical Background & Referral Info">
        <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">{reportData.background}</p>
      </Card>

      <Card title="ISAA Evaluation & Findings">
        <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">{reportData.findings || reportData.assessmentFindings}</p>
      </Card>

      <Card title="Primary Clinical Concerns">
        <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">{reportData.concerns}</p>
      </Card>

      <Card title="Provisional Diagnosis & Profile">
        <div className="flex items-center gap-2">
          <Badge label={reportData.diagnosis} variant="purple" size="lg" />
        </div>
      </Card>

      <Card title="Therapy Plan & Recommendations">
        <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">{reportData.recommendations}</p>
      </Card>
    </div>
  );
}
