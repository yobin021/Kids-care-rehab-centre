"use client";

import React from "react";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

const DOMAINS = [
  { key: "communication", label: "Communication", max: 100 },
  { key: "socialSkills", label: "Social Skills", max: 100 },
  { key: "behaviour", label: "Behaviour", max: 100 },
  { key: "attention", label: "Attention", max: 100 },
  { key: "fineMotor", label: "Fine Motor", max: 100 },
  { key: "grossMotor", label: "Gross Motor", max: 100 },
  { key: "adl", label: "ADL", max: 100 },
  { key: "sensory", label: "Sensory", max: 100 }
];

export default function IepDomainRadarGraph({ domainScores = {}, title = "Functional Domain Profile" }) {
  const scores = {
    communication: domainScores?.communication ?? 50,
    socialSkills: domainScores?.socialSkills ?? domainScores?.social ?? 50,
    behaviour: domainScores?.behaviour ?? 50,
    attention: domainScores?.attention ?? 50,
    fineMotor: domainScores?.fineMotor ?? 50,
    grossMotor: domainScores?.grossMotor ?? 50,
    adl: domainScores?.adl ?? 50,
    sensory: domainScores?.sensory ?? 50
  };

  // SVG Radar setup (center at 110, 110 with radius 85)
  const cx = 110;
  const cy = 110;
  const r = 80;
  const total = DOMAINS.length;

  // Compute radar vertices for concentric rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Compute data polygon vertices
  const dataPoints = DOMAINS.map((d, i) => {
    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
    const value = Math.max(0, Math.min(100, scores[d.key] || 0));
    const distance = (value / 100) * r;
    return {
      x: cx + distance * Math.cos(angle),
      y: cy + distance * Math.sin(angle),
      labelX: cx + (r + 18) * Math.cos(angle),
      labelY: cy + (r + 18) * Math.sin(angle),
      label: d.label,
      score: value
    };
  });

  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card padding="p-5" className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-2">
        <h4 className="text-sm font-bold text-[#2C2C2A] flex items-center gap-2">
          <span>📊</span>
          {title}
        </h4>
        <span className="text-[11px] font-semibold text-[#5F5E5A]">Score out of 100 per domain</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Visual */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 bg-[#F8F8F6] rounded-[10px] border border-[#D3D1C7]/60">
          <svg viewBox="0 0 220 220" className="w-full max-w-[210px] h-auto overflow-visible">
            {/* Concentric Guide Circles */}
            {rings.map((factor, idx) => (
              <polygon
                key={idx}
                points={DOMAINS.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
                  const dist = r * factor;
                  return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
                }).join(" ")}
                fill="none"
                stroke="#D3D1C7"
                strokeDasharray={idx < 3 ? "2,2" : "none"}
                strokeWidth="1"
              />
            ))}

            {/* Axis Lines from Center */}
            {DOMAINS.map((_, i) => {
              const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={cx + r * Math.cos(angle)}
                  y2={cy + r * Math.sin(angle)}
                  stroke="#E2E0D8"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Data Polygon */}
            <polygon
              points={polygonPath}
              fill="#185FA5"
              fillOpacity="0.25"
              stroke="#185FA5"
              strokeWidth="2"
            />

            {/* Data Point Dots */}
            {dataPoints.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#185FA5"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <p className="text-[10px] text-[#5F5E5A] font-bold mt-2 uppercase tracking-wider">
            Domain Competency Radar
          </p>
        </div>

        {/* 8 Domain Progress Bars */}
        <div className="md:col-span-7 space-y-2.5">
          {DOMAINS.map((d) => {
            const score = scores[d.key] || 0;
            const barColor =
              score >= 75 ? "bg-[#0F6E56]" : score >= 45 ? "bg-[#185FA5]" : "bg-[#BA7517]";
            return (
              <div key={d.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2C2C2A]">
                  <span>{d.label}</span>
                  <span className="font-mono font-bold text-[#185FA5]">{score} / 100</span>
                </div>
                <div className="w-full h-2 bg-[#EBEAE4] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}





