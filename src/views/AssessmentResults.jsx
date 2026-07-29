"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { mockExercises, mockChildren } from "../data/mockData";
import {
  calculateISAAScore,
  calculateDomainScores,
  classifyProfile,
  selectExercises
} from "../utils/scoringEngine";
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Plus, FileText, Activity } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";

export default function AssessmentResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [activeTab, setActiveTab] = useState("clinic");
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`assessment_result_${child?.id}`);
    if (saved) {
      try {
        setResultData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [child?.id]);

  // Use saved data or fallback to calculated defaults
  const isaa = resultData?.isaa || {
    totalScore: 94,
    severity: "Mild Autism",
    severityLevel: 1,
    clinicalBadge: "Needs support"
  };

  const domainScores = resultData?.formData
    ? calculateDomainScores(resultData.formData)
    : {
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

  // Pure SVG Radar Chart Helper Math
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

  // Color logic for polygon fill
  const allAbove66 = Object.values(domainScores).every((v) => v > 66);
  const anyBelow33 = Object.values(domainScores).some((v) => v < 33);
  const polygonFillColor = allAbove66 ? "#3B6D11" : anyBelow33 ? "#993C1D" : "#185FA5";

  const getZoneColor = (score) => {
    if (score < 34) return "#993C1D";
    if (score < 67) return "#854F0B";
    return "#3B6D11";
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] py-2 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/children/${child?.id}`)}
            className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">
              Assessment Results — <span className="text-[#185FA5]">{child?.name}</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Clinical profile classification, domain radar analysis, and therapeutic prescriptions.</p>
          </div>
        </div>

        <Button icon={FileText} onClick={() => navigate(`/reports/new/${child?.id}`)}>
          Generate Report →
        </Button>
      </div>

      {/* SECTION 1: AUTISM LEVEL INDICATOR */}
      <div
        className={`p-6 rounded-[12px] text-white shadow-sm space-y-3 ${
          isaa.severityLevel === 3
            ? "bg-[#993C1D]"
            : isaa.severityLevel === 2
            ? "bg-[#854F0B]"
            : isaa.severityLevel === 1
            ? "bg-[#185FA5]"
            : "bg-[#3B6D11]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block opacity-90">ISAA Assessment Outcome</span>
            <h3 className="text-2xl font-black">{isaa.severity}</h3>
            <p className="text-xs opacity-90 mt-0.5">ISAA Score: <strong>{isaa.totalScore} / 200</strong></p>
          </div>

          <Badge label={isaa.clinicalBadge} variant="gray" size="lg" className="self-start sm:self-auto bg-white/20 text-white border-white/40" />
        </div>
      </div>

      {/* Clinical Profile Card */}
      <Card title="Clinical Profile Classification">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Badge label={`Profile ${profileInfo.profile}`} variant="purple" size="lg" className="px-4 py-2 text-sm font-black" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#2C2C2A]">{profileInfo.profileName}</h4>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">{profileInfo.profileDescription}</p>
          </div>
        </div>
      </Card>

      {/* SECTION 2: FUNCTIONAL PROFILE RADAR */}
      <Card title="Functional Domain Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Pure SVG Radar Chart */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#F8F8F6] rounded-[12px] border border-[#D3D1C7]/60">
            <svg width="300" height="300" className="overflow-visible">
              {/* Concentric Grid Circles (33%, 66%, 100%) */}
              {[33, 66, 100].map((level) => (
                <circle
                  key={level}
                  cx={center}
                  cy={center}
                  r={(level / 100) * radius}
                  fill="none"
                  stroke="#D3D1C7"
                  strokeDasharray={level === 100 ? "0" : "3,3"}
                  strokeWidth="1"
                />
              ))}

              {/* Axes Lines */}
              {domainKeys.map((item, idx) => {
                const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
                const endX = center + radius * Math.cos(angle);
                const endY = center + radius * Math.sin(angle);
                const labelX = center + (radius + 20) * Math.cos(angle);
                const labelY = center + (radius + 20) * Math.sin(angle);

                return (
                  <g key={item.key}>
                    <line x1={center} y1={center} x2={endX} y2={endY} stroke="#D3D1C7" strokeWidth="1" />
                    <text
                      x={labelX}
                      y={labelY}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#5F5E5A"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* Polygon Fill */}
              <polygon
                points={polygonPointsStr}
                fill={polygonFillColor}
                fillOpacity="0.25"
                stroke={polygonFillColor}
                strokeWidth="2.5"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={getZoneColor(p.val)} stroke="#fff" strokeWidth="1.5" />
              ))}
            </svg>
            <span className="text-[11px] font-bold text-[#9B9A96] mt-2">8-Axis Functional Competency Spider Plot</span>
          </div>

          {/* Domain Score Bars */}
          <div className="space-y-3">
            {domainKeys.map((item) => {
              const score = domainScores[item.key] || 0;
              const isPriority = score < 50;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#2C2C2A]">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {isPriority && (
                        <span className="text-[10px] font-extrabold text-[#993C1D] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          ⚠ Priority Area
                        </span>
                      )}
                      <span className="font-mono" style={{ color: getZoneColor(score) }}>{score} / 100</span>
                    </div>
                  </div>
                  <ProgressBar value={score} color={getZoneColor(score)} animated={false} />
                </div>
              );
            })}
          </div>

        </div>
      </Card>

      {/* SECTION 3: RECOMMENDED EXERCISES + TOOLS */}
      <Card title="Recommended Exercises + Tools">
        <div className="space-y-4">
          
          {/* Tabs Inside Card */}
          <div className="flex items-center gap-2 border-b border-[#D3D1C7]/60 pb-2">
            <button
              onClick={() => setActiveTab("clinic")}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === "clinic"
                  ? "bg-[#185FA5] text-white shadow-xs"
                  : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
              }`}
            >
              Clinic Exercises ({exerciseSelection.clinicExercises.length})
            </button>
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-[#0F6E56] text-white shadow-xs"
                  : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
              }`}
            >
              Home Exercises ({exerciseSelection.homeExercises.length})
            </button>
          </div>

          {/* Exercise Cards 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(activeTab === "clinic" ? exerciseSelection.clinicExercises : exerciseSelection.homeExercises).map((exName, idx) => {
              const matchedEx = mockExercises.find((m) => m.name.toLowerCase().includes(exName.toLowerCase())) || {
                name: exName,
                category: "Therapeutic",
                description: "Prescribed targeted clinical exercise for skill acquisition.",
                duration: "15 minutes",
                benefits: ["Enhances core developmental skills", "Promotes active engagement"]
              };

              return (
                <div key={idx} className="p-4 rounded-[10px] border border-[#D3D1C7] bg-[#F8F8F6] space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#2C2C2A]">{matchedEx.name}</h5>
                      <Badge label={matchedEx.category} variant="blue" size="sm" />
                    </div>
                    <p className="text-[11px] text-[#5F5E5A] line-clamp-2 leading-relaxed">{matchedEx.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#D3D1C7]/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#9B9A96]">Duration: {matchedEx.duration}</span>
                    <Button
                      variant={activeTab === "clinic" ? "secondary" : "outlined"}
                      size="sm"
                      icon={Plus}
                      onClick={() => showToast(`Added ${matchedEx.name} to therapy plan.`, "success")}
                    >
                      {activeTab === "clinic" ? "Add to Plan" : "Assign Home"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended Tools & Toys Section */}
          <div className="pt-4 border-t border-[#D3D1C7]/60 space-y-2">
            <h4 className="text-xs font-bold text-[#2C2C2A] uppercase tracking-wider">Recommended Therapeutic Tools & Toys</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                "🧩 Pegboard Set",
                "⚽ Sensory Balance Ball",
                "🎴 Communication Picture Flashcards",
                "🧱 Stacking Blocks",
                "🌀 Sensory Swing",
                "🖍️ Triangular Crayons"
              ].map((tool, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-[#D3D1C7] rounded-full text-xs font-bold text-[#5F5E5A] whitespace-nowrap">
                  {tool}
                </span>
              ))}
            </div>
          </div>

        </div>
      </Card>

      {/* Action Buttons at Bottom */}
      <div className="flex items-center justify-between pt-4 border-t border-[#D3D1C7]">
        <Button variant="outlined" onClick={() => navigate(`/assessment/new/${child?.id}`)}>
          ← Back to Assessment
        </Button>

        <Button icon={FileText} onClick={() => navigate(`/reports/new/${child?.id}`)} className="h-11 px-6">
          Generate Report →
        </Button>
      </div>

    </div>
  );
}
