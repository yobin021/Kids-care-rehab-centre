"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { calculateISAAScore, calculateDomainScores, classifyProfile, selectExercises } from "../utils/scoringEngine";
import { ArrowLeft, CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import { SkeletonCard, SkeletonText } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { assessmentService } from "../services/assessmentService";

export default function AssessmentResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("clinic");

  const handleDeleteAssessment = async () => {
    if (window.confirm("Are you sure you want to delete this assessment? This will permanently delete the assessment record.")) {
      try {
        await assessmentService.delete(id, child?.id);
        navigate(child?.id ? `/children/${child.id}` : "/children");
      } catch (err) {
        console.error("Failed to delete assessment:", err);
      }
    }
  };

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await assessmentService.getById(id);
      if (result) {
        setData(result);
      } else {
        fallbackLocal();
      }
    } catch (err) {
      console.warn("Assessment result fetch fallback:", err.message);
      fallbackLocal();
    } finally {
      setLoading(false);
    }

    function fallbackLocal() {
      const saved = localStorage.getItem(`assessment_result_${child?.id}`);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          setError("Failed to parse saved assessment results.");
        }
      } else {
        setError("Assessment results not found.");
      }
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id, child?.id]);

  const isaa = data?.isaa || {
    totalScore: data?.isaa_score ?? data?.isaaScore ?? 0,
    severity: data?.isaa_severity || (data?.isaa_score ? "Mild Autism" : "Not Assessed"),
    severityLevel: data?.isaa_level || 0,
    clinicalBadge: data?.isaa_severity || "Assessment pending"
  };

  const domainScores = data?.domain_scores || data?.domainScores || {
    communication: 42,
    socialSkills: 38,
    behaviour: 55,
    attention: 60,
    fineMotor: 72,
    grossMotor: 80,
    adl: 65,
    sensory: 35
  };

  const profileInfo = classifyProfile(domainScores, isaa.severityLevel);
  const exerciseSelection = selectExercises(profileInfo.profile, domainScores);

  const domainKeys = [
    { key: "communication", label: "Communication" },
    { key: "socialSkills", label: "Social Skills" },
    { key: "behaviour", label: "Behaviour" },
    { key: "attention", label: "Attention" },
    { key: "fineMotor", label: "Fine Motor" },
    { key: "grossMotor", label: "Gross Motor" },
    { key: "adl", label: "ADL" },
    { key: "sensory", label: "Sensory" }
  ];

  const center = 150;
  const radius = 100;
  const totalAxes = domainKeys.length;

  const points = domainKeys.map((item, idx) => {
    const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
    const val = domainScores[item.key] || 0;
    const dist = (val / 100) * radius;
    const x = center + dist * Math.cos(angle);
    const y = center + dist * Math.sin(angle);
    return { x, y, val, label: item.label, angle };
  });

  const polygonPointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  const getZoneColor = (score) => {
    if (score < 34) return "#993C1D";
    if (score < 67) return "#854F0B";
    return "#3B6D11";
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchAssessment} />;
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/children/${child?.id}`)} className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">
              Assessment Results — <span className="text-[#185FA5]">{child?.name}</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Clinical profile classification & domain radar analysis.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={FileText} onClick={() => navigate(`/iep/${child?.id}/generate/${id}`)}>
            Generate IEP Report →
          </Button>
          <Button
            variant="outlined"
            icon={Trash2}
            onClick={handleDeleteAssessment}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            title="Delete this assessment"
          >
            Delete Assessment
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-[12px] text-white shadow-sm bg-[#185FA5] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-90">ISAA Assessment Outcome</span>
          <h3 className="text-2xl font-black">{isaa.severity}</h3>
          <p className="text-xs opacity-90 mt-0.5">ISAA Score: <strong>{isaa.totalScore} / 200</strong></p>
        </div>
        <Badge label="Needs support" variant="gray" size="lg" className="bg-white/20 text-white" />
      </div>

      <Card title="Clinical Profile Classification">
        <div className="flex items-center gap-4">
          <Badge label={`Profile ${profileInfo.profile}`} variant="purple" size="lg" className="px-4 py-2 text-sm font-black" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#2C2C2A]">{profileInfo.profileName}</h4>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">{profileInfo.profileDescription}</p>
          </div>
        </div>
      </Card>

      <Card title="Functional Domain Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-4 bg-[#F8F8F6] rounded-[12px] border border-[#D3D1C7]/60">
            <svg width="300" height="300">
              {[33, 66, 100].map((level) => (
                <circle key={level} cx={center} cy={center} r={(level / 100) * radius} fill="none" stroke="#D3D1C7" strokeDasharray="3,3" />
              ))}
              <polygon points={polygonPointsStr} fill="#185FA5" fillOpacity="0.25" stroke="#185FA5" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="space-y-3">
            {domainKeys.map((item) => {
              const score = domainScores[item.key] || 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{item.label}</span>
                    <span style={{ color: getZoneColor(score) }}>{score} / 100</span>
                  </div>
                  <ProgressBar value={score} color={getZoneColor(score)} />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recommended Exercise Program */}
      {exerciseSelection && (exerciseSelection.clinicExercises?.length > 0 || exerciseSelection.homeExercises?.length > 0) && (
        <Card title="🏋️ Recommended Exercise Program">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[...(exerciseSelection.clinicExercises || []), ...(exerciseSelection.homeExercises || [])].slice(0, 6).map((ex, idx) => (
              <div key={ex.id || idx} className="bg-white rounded-[12px] border border-[#D3D1C7] overflow-hidden flex flex-col justify-between shadow-xs">
                {(ex.image_url || ex.imageUrl) && (
                  <div className="h-36 bg-gray-100">
                    <img
                      src={ex.image_url || ex.imageUrl}
                      alt={ex.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0F6E56] inline-block">
                      {ex.category || "Therapy Exercise"}
                    </span>
                    <h4 className="font-bold text-sm text-[#2C2C2A]">{ex.name}</h4>
                    <p className="text-xs text-[#5F5E5A] line-clamp-2 leading-relaxed">
                      {ex.description || ex.home_description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#D3D1C7]/40 text-xs font-semibold">
                    <span className="text-[#5F5E5A]">{ex.duration || "15 mins"}</span>
                    <span className="text-[#0F6E56] font-bold">Assigned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#D3D1C7]">
        <Button variant="outlined" onClick={() => navigate(`/children/${child?.id}`)}>
          ← Back to Profile
        </Button>
        <Button icon={FileText} onClick={() => navigate(`/reports/new/${child?.id}`)}>
          Generate Report →
        </Button>
      </div>
    </div>
  );
}
