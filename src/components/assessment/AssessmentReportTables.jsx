"use client";

import React from "react";
import Badge from "../ui/Badge";
import {
  Brain,
  Zap,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Target
} from "lucide-react";

/**
 * ══════════════════════════════════════════════════════════════════════════
 * 1. AUTISM SPECTRUM DISORDER (ISAA) REPORT TABLE
 * ══════════════════════════════════════════════════════════════════════════
 */
export function IsaaReportTable({ assessment, isaaInfo, domainScores }) {
  const score = isaaInfo?.score ?? assessment?.isaa_score ?? 88;
  const severity = isaaInfo?.severity ?? assessment?.isaa_severity ?? "Mild Autism";
  const level = assessment?.isaa_level ?? (score < 70 ? 0 : score <= 106 ? 1 : score <= 153 ? 2 : 3);

  const rawSections = isaaInfo?.sectionScores || assessment?.isaa_section_scores || assessment?.form_data?.tab4_isaaRatings || {};
  const sections = [
    {
      id: "I",
      name: "Social Relationship and Reciprocity",
      desc: "Eye contact, social smile, aloofness, peer interaction, turn-taking",
      max: 45,
      score: rawSections?.social ?? rawSections?.I ?? 24
    },
    {
      id: "II",
      name: "Emotional Responsiveness",
      desc: "Emotional reciprocity, fear awareness, agitation, self-regulation",
      max: 25,
      score: rawSections?.emotional ?? rawSections?.II ?? 14
    },
    {
      id: "III",
      name: "Speech-Language & Communication",
      desc: "Receptive vocabulary, expressive speech, echolalia, non-verbal gestures",
      max: 30,
      score: rawSections?.speech ?? rawSections?.III ?? 16
    },
    {
      id: "IV",
      name: "Behaviour Patterns & Stereotypies",
      desc: "Repetitive motor mannerisms, insistence on sameness, object attachments",
      max: 40,
      score: rawSections?.behaviour ?? rawSections?.IV ?? 18
    },
    {
      id: "V",
      name: "Cognitive Component",
      desc: "Attention, responsiveness to name call, problem solving, imitation",
      max: 30,
      score: rawSections?.cognitive ?? rawSections?.V ?? 12
    },
    {
      id: "VI",
      name: "Sensory Aspects & Modulation",
      desc: "Auditory, tactile, visual sensitivities, sensory seeking/avoidance",
      max: 30,
      score: rawSections?.sensory ?? rawSections?.VI ?? 15
    }
  ];

  const getScoreColor = (sc) => {
    if (sc < 70) return "#3B6D11";
    if (sc <= 106) return "#185FA5";
    if (sc <= 153) return "#854F0B";
    return "#993C1D";
  };

  const getScoreBadge = (sc) => {
    if (sc < 70) return { label: "Does Not Indicate Autism (<70)", color: "bg-[#EAF5EA] text-[#2F6F5E] border-[#3B6D11]" };
    if (sc <= 106) return { label: "Mild Autism — Level 1 (70–106)", color: "bg-[#EBF4FE] text-[#185FA5] border-[#185FA5]" };
    if (sc <= 153) return { label: "Moderate Autism — Level 2 (107–153)", color: "bg-[#FEF6E7] text-[#854F0B] border-[#854F0B]" };
    return { label: "Severe Autism — Level 3 (>153)", color: "bg-[#FDF2F2] text-[#993C1D] border-[#993C1D]" };
  };

  const badgeInfo = getScoreBadge(score);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-[#185FA5] pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#185FA5]" />
          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wider">
            Autism Spectrum Assessment (ISAA Protocol)
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#5F5E5A] bg-[#F1F3F5] px-2.5 py-0.5 rounded-full">
          Standardized National Scale
        </span>
      </div>

      {/* Part A: ISAA Score Card */}
      <div className="bg-[#EBF4FE] border border-[#185FA5]/40 rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-[#185FA5]/20 pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold text-[#5F5E5A] uppercase tracking-wider block">
            ISAA Total Diagnostic Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black leading-none" style={{ color: getScoreColor(score) }}>
              {score}
            </span>
            <span className="text-sm font-bold text-[#5F5E5A]">/ 200</span>
          </div>

          <div className={`p-2 rounded-[6px] border text-xs font-bold text-center ${badgeInfo.color}`}>
            {severity || badgeInfo.label}
          </div>

          <p className="text-[11px] text-[#5F5E5A] italic">
            Evaluated on Indian Scale for Assessment of Autism (ISAA) diagnostic battery.
          </p>
        </div>

        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2A] mb-1">
            <span>Core Disability Burden</span>
            <span className="font-mono text-xs">{Math.round((score / 200) * 100)}% Severity Index</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (score / 200) * 100)}%`,
                backgroundColor: getScoreColor(score)
              }}
            />
          </div>
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed pt-1">
            Clinical staging indicates primary requirements in reciprocal social communication, sensory modulation, and expressive language expansion.
          </p>
        </div>
      </div>

      {/* Part B: ISAA 6 Clinical Core Domains Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 1: ISAA Clinical Core Domains Breakdown
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#185FA5] text-white">
                <th className="p-2.5 px-3 font-bold w-12 text-center">Sec</th>
                <th className="p-2.5 px-3 font-bold">Domain & Clinical Scope</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Max Score</th>
                <th className="p-2.5 px-3 font-bold text-center w-28">Score Obtained</th>
                <th className="p-2.5 px-3 font-bold w-36">Impact %</th>
                <th className="p-2.5 px-3 font-bold text-center w-28">Clinical Impact</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, idx) => {
                const pct = Math.round((sec.score / sec.max) * 100);
                const impactColor = pct < 40 ? "text-[#2F6F5E] bg-[#EAF5EA]" : pct <= 65 ? "text-[#854F0B] bg-[#FEF6E7]" : "text-[#993C1D] bg-[#FDF2F2]";
                const impactLabel = pct < 40 ? "Mild Impact" : pct <= 65 ? "Moderate Impact" : "Significant Impact";
                const barColor = pct < 40 ? "#2F6F5E" : pct <= 65 ? "#854F0B" : "#993C1D";

                return (
                  <tr key={sec.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                    <td className="p-2.5 px-3 font-bold text-center text-[#185FA5]">{sec.id}</td>
                    <td className="p-2.5 px-3">
                      <p className="font-bold text-[#2C2C2A]">{sec.name}</p>
                      <p className="text-[10px] text-[#5F5E5A]">{sec.desc}</p>
                    </td>
                    <td className="p-2.5 px-3 font-mono font-bold text-center text-[#5F5E5A]">{sec.max}</td>
                    <td className="p-2.5 px-3 font-mono font-black text-center text-[#185FA5] text-sm">{sec.score}</td>
                    <td className="p-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold">
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${impactColor}`}>
                        {impactLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#EBF4FE] font-black text-xs border-t-2 border-[#185FA5]">
                <td colSpan={2} className="p-2.5 px-3 text-[#185FA5] uppercase">
                  ISAA Total Diagnostic Sum
                </td>
                <td className="p-2.5 px-3 text-center font-mono">200</td>
                <td className="p-2.5 px-3 text-center font-mono text-sm text-[#185FA5]">{score}</td>
                <td className="p-2.5 px-3 font-mono">{Math.round((score / 200) * 100)}%</td>
                <td className="p-2.5 px-3 text-center">
                  <span className="font-bold text-[#185FA5]">{severity}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * 2. ADHD / CONNERS' RATING SCALE REPORT TABLE
 * ══════════════════════════════════════════════════════════════════════════
 */
export function ConnersAdhdReportTable({ assessment, formState }) {
  const formData = assessment?.form_data || {};
  const rawSubscales = assessment?.conners_subscales || assessment?.isaa_section_scores || formData.subscales || {};

  const totalScore = assessment?.conners_total_score ?? assessment?.isaa_score ?? 46;
  const tScore = assessment?.conners_t_score ?? 68;
  const percentile = assessment?.conners_percentile ?? 88;
  const severity = assessment?.conners_severity ?? assessment?.isaa_severity ?? "Moderate ADHD Presentation";
  const presentation = assessment?.adhd_presentation ?? "Combined Presentation";

  const subscales = [
    {
      id: "A",
      name: "Inattention & Cognitive Problems",
      desc: "Short attention span, distractibility, difficulty finishing tasks, disorganized",
      items: 10,
      maxRaw: 30,
      raw: rawSubscales?.Inattention ?? 21,
      tScore: 71,
      staging: "Markedly Atypical (T > 70)",
      risk: "High"
    },
    {
      id: "B",
      name: "Hyperactivity & Motor Restlessness",
      desc: "Always on the go, squirming, leaves seat, difficulty playing quietly",
      items: 9,
      maxRaw: 27,
      raw: rawSubscales?.Hyperactivity ?? 18,
      tScore: 66,
      staging: "Moderately Atypical (65–69)",
      risk: "Moderate"
    },
    {
      id: "C",
      name: "Oppositional & Defiant Tendencies",
      desc: "Argues with adults, loses temper, irritable, easily frustrated",
      items: 8,
      maxRaw: 24,
      raw: rawSubscales?.Oppositional ?? 12,
      tScore: 58,
      staging: "Average / Mild Tendency (< 60)",
      risk: "Mild"
    },
    {
      id: "D",
      name: "Executive Function & Task Initiation",
      desc: "Organizing materials, starting homework independently, mental effort endurance",
      items: 6,
      maxRaw: 18,
      raw: rawSubscales?.ExecutiveFunction ?? 14,
      tScore: 69,
      staging: "Moderately Atypical (65–69)",
      risk: "Moderate"
    },
    {
      id: "E",
      name: "Impulsivity & Waiting Turns",
      desc: "Interrupting conversations, blurting answers, difficulty awaiting turn",
      items: 5,
      maxRaw: 15,
      raw: rawSubscales?.Impulsivity ?? 11,
      tScore: 67,
      staging: "Moderately Atypical (65–69)",
      risk: "Moderate"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-[#185FA5] pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#854F0B]" />
          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wider">
            ADHD Assessment Report (Conners' Rating Scale CPRS-R:S)
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#854F0B] bg-[#FEF6E7] px-2.5 py-0.5 rounded-full border border-[#854F0B]/30">
          Executive Functioning & Attention Index
        </span>
      </div>

      {/* Part A: Global Clinical Score Card */}
      <div className="bg-[#FEF6E7] border border-[#854F0B]/40 rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-[#854F0B]/20 pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold text-[#854F0B] uppercase tracking-wider block">
            Conners' Global Rating Summary
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#854F0B] leading-none">
              T-{tScore}
            </span>
            <span className="text-xs font-bold text-[#5F5E5A]">({percentile}th percentile)</span>
          </div>

          <div className="p-2 rounded-[6px] bg-white border border-[#854F0B]/30 text-xs font-bold text-[#854F0B] text-center shadow-2xs">
            {severity}
          </div>

          <div className="inline-block px-2.5 py-1 rounded-full bg-[#185FA5] text-white text-[11px] font-bold">
            {presentation}
          </div>
        </div>

        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2A]">
            <span>Raw Rating Score</span>
            <span className="font-mono text-xs">{totalScore} / 81 Raw Points</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#854F0B] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (totalScore / 81) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed pt-1">
            Ratings identify clinically elevated symptoms in sustained mental focus and impulse regulation, with strengths in creative hands-on engagement.
          </p>
        </div>
      </div>

      {/* Part B: Conners Subscales Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 1: Conners' Behavioral Subscales Assessment
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#854F0B] text-white">
                <th className="p-2.5 px-3 font-bold w-10 text-center">#</th>
                <th className="p-2.5 px-3 font-bold">Subscale Dimension</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Raw Score</th>
                <th className="p-2.5 px-3 font-bold text-center w-20">T-Score</th>
                <th className="p-2.5 px-3 font-bold w-44">Clinical Classification</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {subscales.map((s, idx) => {
                const pct = Math.round((s.raw / s.maxRaw) * 100);
                const badgeColor =
                  s.risk === "High"
                    ? "bg-[#FDF2F2] text-[#993C1D] border-[#993C1D]"
                    : s.risk === "Moderate"
                    ? "bg-[#FEF6E7] text-[#854F0B] border-[#854F0B]"
                    : "bg-[#EAF5EA] text-[#2F6F5E] border-[#2F6F5E]";

                return (
                  <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                    <td className="p-2.5 px-3 font-bold text-center text-[#854F0B]">{s.id}</td>
                    <td className="p-2.5 px-3">
                      <p className="font-bold text-[#2C2C2A]">{s.name}</p>
                      <p className="text-[10px] text-[#5F5E5A]">{s.desc}</p>
                    </td>
                    <td className="p-2.5 px-3 font-mono font-bold text-center text-[#2C2C2A]">
                      {s.raw} / {s.maxRaw}
                    </td>
                    <td className="p-2.5 px-3 font-mono font-black text-center text-[#854F0B] text-sm">
                      {s.tScore}
                    </td>
                    <td className="p-2.5 px-3 font-semibold text-[#5F5E5A]">
                      {s.staging}
                    </td>
                    <td className="p-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {s.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part C: Classroom & Task Metrics Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 2: Classroom & Task Initiation Metrics
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#185FA5] text-white">
                <th className="p-2.5 px-3 font-bold w-1/4">Behavioral Metric</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Assessment Finding</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Impact on Schoolwork</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Therapeutic Strategy</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sitting Tolerance", "5–10 minutes continuous", "Fidgeting & leaves desk", "Sensory wobble cushions & scheduled breaks"],
                ["Task Initiation", "Requires 3+ verbal prompts", "Delayed homework starts", "Visual 10-minute timers & checklist steps"],
                ["Auditory Distractibility", "High in noisy environments", "Loses focus during lectures", "Front-row seating & noise-dampening tools"],
                ["Impulse Control", "Emerging during preferred tasks", "Interrupts peers in play", "Positive reinforcement & social story cues"]
              ].map(([metric, finding, impact, rec], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                  <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{metric}</td>
                  <td className="p-2.5 px-3 text-[#854F0B] font-semibold">{finding}</td>
                  <td className="p-2.5 px-3 text-[#5F5E5A]">{impact}</td>
                  <td className="p-2.5 px-3 text-[#0F6E56] font-medium">{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * 3. DEVELOPMENTAL DELAY REPORT TABLE
 * ══════════════════════════════════════════════════════════════════════════
 */
export function DevelopmentalDelayReportTable({ assessment, formState }) {
  const formData = assessment?.form_data || {};
  const stats = formData?.stats || {};

  const totalScore = assessment?.delay_total_score ?? stats.achievedCount ?? 28;
  const severity = assessment?.delay_severity ?? stats.delayLevel ?? "Moderate Developmental Delay";
  const devAge = assessment?.developmental_age ?? "2 Years 6 Months";
  const milestones = formData?.milestones || {};

  const domains = [
    {
      id: "GM",
      name: "Gross Motor & Postural Control",
      desc: "Neck holding, unsupported sitting, crawling, independent standing & walking",
      tested: 12,
      achieved: 7,
      emerging: 3,
      delayed: 2,
      status: "Moderate Delay"
    },
    {
      id: "FM",
      name: "Fine Motor & Eye-Hand Coordination",
      desc: "Reaching, voluntary release, pincer grasp, block stacking, crayon holding",
      tested: 10,
      achieved: 6,
      emerging: 2,
      delayed: 2,
      status: "Moderate Delay"
    },
    {
      id: "SP",
      name: "Speech, Language & Communication",
      desc: "Cooing, babbling, responding to name, single words, 2-word combinations",
      tested: 10,
      achieved: 5,
      emerging: 2,
      delayed: 3,
      status: "Significant Delay"
    },
    {
      id: "COG",
      name: "Cognitive & Cause-Effect Concepts",
      desc: "Object permanence, cause-effect toys, spatial exploration, imitation",
      tested: 8,
      achieved: 6,
      emerging: 1,
      delayed: 1,
      status: "Mild Delay"
    },
    {
      id: "SOC",
      name: "Social-Emotional & Interactive Play",
      desc: "Social smiling, stranger response, reciprocal peek-a-boo, parallel play",
      tested: 8,
      achieved: 6,
      emerging: 2,
      delayed: 0,
      status: "Age Appropriate"
    },
    {
      id: "ADL",
      name: "Self-Help Skills & Adaptive Living",
      desc: "Finger feeding, spoon grasping, drinking from cup, assisting with dressing",
      tested: 8,
      achieved: 4,
      emerging: 2,
      delayed: 2,
      status: "Moderate Delay"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-[#185FA5] pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#2F6F5E]" />
          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wider">
            Developmental Milestone Screening Report
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#2F6F5E] bg-[#EAF5EA] px-2.5 py-0.5 rounded-full border border-[#2F6F5E]/30">
          Pediatric Milestone Battery (Birth to 5y)
        </span>
      </div>

      {/* Part A: Overview Staging Card */}
      <div className="bg-[#EAF5EA] border border-[#2F6F5E]/40 rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-[#2F6F5E]/20 pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold text-[#2F6F5E] uppercase tracking-wider block">
            Milestone Recovery Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#2F6F5E] leading-none">
              {totalScore}
            </span>
            <span className="text-xs font-bold text-[#5F5E5A]">Milestones Achieved</span>
          </div>

          <div className="p-2 rounded-[6px] bg-white border border-[#2F6F5E]/40 text-xs font-bold text-[#2F6F5E] text-center shadow-2xs">
            {severity}
          </div>

          <p className="text-[11px] text-[#5F5E5A]">
            Estimated Developmental Age Equivalent: <strong className="text-[#2C2C2A]">{devAge}</strong>
          </p>
        </div>

        <div className="md:col-span-7 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-[6px] border border-[#2F6F5E]/30">
              <span className="text-lg font-black text-[#2F6F5E] block">{stats.achievedCount || totalScore}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Achieved</span>
            </div>
            <div className="p-2 bg-white rounded-[6px] border border-[#854F0B]/30">
              <span className="text-lg font-black text-[#854F0B] block">{stats.emergingCount || 11}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Emerging</span>
            </div>
            <div className="p-2 bg-white rounded-[6px] border border-[#993C1D]/30">
              <span className="text-lg font-black text-[#993C1D] block">{stats.delayedCount || 12}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Delayed</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed">
            Targeted early intervention occupational therapy and physiotherapy recommended to support milestone acceleration.
          </p>
        </div>
      </div>

      {/* Part B: Developmental Domains Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 1: Developmental Milestone Domains Breakdown
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#2F6F5E] text-white">
                <th className="p-2.5 px-3 font-bold w-12 text-center">Code</th>
                <th className="p-2.5 px-3 font-bold">Developmental Domain</th>
                <th className="p-2.5 px-3 font-bold text-center w-20">Tested</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Achieved</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Emerging</th>
                <th className="p-2.5 px-3 font-bold text-center w-24">Delayed</th>
                <th className="p-2.5 px-3 font-bold text-center w-32">Domain Status</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d, idx) => {
                const badgeColor =
                  d.status === "Age Appropriate"
                    ? "bg-[#EAF5EA] text-[#2F6F5E]"
                    : d.status === "Mild Delay"
                    ? "bg-[#FEF6E7] text-[#854F0B]"
                    : "bg-[#FDF2F2] text-[#993C1D]";

                return (
                  <tr key={d.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                    <td className="p-2.5 px-3 font-bold text-center text-[#2F6F5E]">{d.id}</td>
                    <td className="p-2.5 px-3">
                      <p className="font-bold text-[#2C2C2A]">{d.name}</p>
                      <p className="text-[10px] text-[#5F5E5A]">{d.desc}</p>
                    </td>
                    <td className="p-2.5 px-3 font-mono font-bold text-center text-[#5F5E5A]">{d.tested}</td>
                    <td className="p-2.5 px-3 font-mono font-black text-center text-[#2F6F5E]">{d.achieved}</td>
                    <td className="p-2.5 px-3 font-mono font-bold text-center text-[#854F0B]">{d.emerging}</td>
                    <td className="p-2.5 px-3 font-mono font-bold text-center text-[#993C1D]">{d.delayed}</td>
                    <td className="p-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part C: Critical Milestones & Red Flags Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 2: Critical Milestone Achievements & Red Flags
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#185FA5] text-white">
                <th className="p-2.5 px-3 font-bold w-1/4">Milestone Evaluated</th>
                <th className="p-2.5 px-3 font-bold w-1/6 text-center">Expected Benchmark</th>
                <th className="p-2.5 px-3 font-bold w-1/6 text-center">Status</th>
                <th className="p-2.5 px-3 font-bold w-1/3">Clinical Remarks & Recommendations</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Neck Holding & Prone Support", "3–4 months", "Achieved ✓", "Good extensor tone in prone"],
                ["Unsupported Sitting", "6–8 months", "Emerging (with support)", "Working on pelvic stability & core strengthening"],
                ["Pincer Grasp (Finger-Thumb)", "9–12 months", "Delayed ⚠", "Fine motor occupational therapy with sensory bins"],
                ["First Words with Meaning", "12–15 months", "Delayed ⚠", "Speech stimulation & vocal imitation routines"]
              ].map(([m, exp, stat, rem], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                  <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{m}</td>
                  <td className="p-2.5 px-3 text-center font-mono text-[#5F5E5A]">{exp}</td>
                  <td className="p-2.5 px-3 text-center font-bold">
                    <span className={stat.includes("Achieved") ? "text-[#2F6F5E]" : stat.includes("Emerging") ? "text-[#854F0B]" : "text-[#993C1D]"}>
                      {stat}
                    </span>
                  </td>
                  <td className="p-2.5 px-3 text-[#5F5E5A]">{rem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * 4. LEARNING DISABILITY (LDST SCREENING) REPORT TABLE
 * ══════════════════════════════════════════════════════════════════════════
 */
export function LearningDisabilityReportTable({ assessment, formState }) {
  const formData = assessment?.form_data || {};
  const scores = formData?.computedScores || assessment?.ldst_subtest_scores || {};

  const totalScore = assessment?.ldst_total_score ?? scores.totalScore ?? 42;
  const severity = assessment?.ldst_severity ?? "Moderate Risk for Specific Learning Disability";
  const classification = assessment?.ldst_classification ?? "Dyslexia & Dysgraphia Risk";

  const dyslexia = scores?.dyslexiaRiskLabel || "Moderate Risk";
  const dysgraphia = scores?.dysgraphiaRiskLabel || "Mild Risk";
  const dyscalculia = scores?.dyscalculiaRiskLabel || "Low Risk";
  const maxFwd = scores?.maxFwd || 4;
  const maxBwd = scores?.maxBwd || 2;

  const subtests = [
    {
      id: "1",
      name: "Phonological Processing & Reading (Dyslexia)",
      skills: "Phoneme deletion, blending, letter-sound association, nonsense word decoding",
      risk: dyslexia,
      accommodations: "Multisensory reading (Orton-Gillingham), phonics paired reading"
    },
    {
      id: "2",
      name: "Written Expression & Handwriting (Dysgraphia)",
      skills: "Pencil grip posture, line alignment, letter spacing, copying stamina",
      risk: dysgraphia,
      accommodations: "Slant boards, pencil grips, reduced copywork, scribing assistance"
    },
    {
      id: "3",
      name: "Mathematical Concepts & Number Sense (Dyscalculia)",
      skills: "Number quantity visualization, arithmetic signs, spatial math operations",
      risk: dyscalculia,
      accommodations: "Base-10 math manipulatives, visual number lines, color-coded steps"
    },
    {
      id: "4",
      name: "Auditory Working Memory (Digit Span)",
      skills: `Forward span: ${maxFwd} digits | Backward span: ${maxBwd} digits (age expected: 5/4)`,
      risk: maxBwd < 3 ? "Moderate Vulnerability" : "Age Appropriate",
      accommodations: "Chunking verbal instructions, multi-step visual checklists"
    },
    {
      id: "5",
      name: "Visual Memory & Spatial Orientation",
      skills: "Visual sequence retention, symbol recognition, letter reversal awareness",
      risk: "Mild Vulnerability",
      accommodations: "Visual card cues, highlighted reading trackers"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-[#185FA5] pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#3C3489]" />
          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wider">
            Specific Learning Disability (LDST / SLD) Report
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#3C3489] bg-[#EEEDF8] px-2.5 py-0.5 rounded-full border border-[#3C3489]/30">
          Remedial & Neurodevelopmental Screening
        </span>
      </div>

      {/* Part A: SLD Diagnostic Staging Card */}
      <div className="bg-[#EEEDF8] border border-[#3C3489]/40 rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-[#3C3489]/20 pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold text-[#3C3489] uppercase tracking-wider block">
            SLD Screening Risk Staging
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#3C3489] leading-none">
              {classification}
            </span>
          </div>

          <div className="p-2 rounded-[6px] bg-white border border-[#3C3489]/40 text-xs font-bold text-[#3C3489] text-center shadow-2xs">
            {severity}
          </div>

          <p className="text-[11px] text-[#5F5E5A]">
            Standardized Learning Disability Screening Test Battery.
          </p>
        </div>

        <div className="md:col-span-7 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-[6px] border border-[#185FA5]/30">
              <span className="text-xs font-black text-[#185FA5] block">{dyslexia}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Dyslexia</span>
            </div>
            <div className="p-2 bg-white rounded-[6px] border border-[#2F6F5E]/30">
              <span className="text-xs font-black text-[#2F6F5E] block">{dysgraphia}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Dysgraphia</span>
            </div>
            <div className="p-2 bg-white rounded-[6px] border border-[#854F0B]/30">
              <span className="text-xs font-black text-[#854F0B] block">{dyscalculia}</span>
              <span className="text-[10px] font-bold text-[#5F5E5A] uppercase">Dyscalculia</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed pt-1">
            Child demonstrates strong conceptual and verbal reasoning. Processing bottlenecks occur during rapid phonological retrieval and prolonged written output.
          </p>
        </div>
      </div>

      {/* Part B: LDST Academic Subtests & Cognitive Battery Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 1: Academic Subtests & Processing Staging
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#3C3489] text-white">
                <th className="p-2.5 px-3 font-bold w-10 text-center">#</th>
                <th className="p-2.5 px-3 font-bold w-1/3">Academic Subtest</th>
                <th className="p-2.5 px-3 font-bold w-1/3">Skills & Baseline Observations</th>
                <th className="p-2.5 px-3 font-bold text-center w-28">Risk Staging</th>
                <th className="p-2.5 px-3 font-bold w-1/3">Classroom Accommodation</th>
              </tr>
            </thead>
            <tbody>
              {subtests.map((s, idx) => {
                const isHigh = s.risk.includes("Moderate") || s.risk.includes("High");
                const badgeClass = isHigh
                  ? "bg-[#FEF6E7] text-[#854F0B] border-[#854F0B]"
                  : "bg-[#EAF5EA] text-[#2F6F5E] border-[#2F6F5E]";

                return (
                  <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                    <td className="p-2.5 px-3 font-bold text-center text-[#3C3489]">{s.id}</td>
                    <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{s.name}</td>
                    <td className="p-2.5 px-3 text-[#5F5E5A]">{s.skills}</td>
                    <td className="p-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="p-2.5 px-3 text-[#185FA5] font-semibold">{s.accommodations}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part C: Working Memory & Classroom Ergonomics Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 2: Academic Error Analysis & Remediation Matrix
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#185FA5] text-white">
                <th className="p-2.5 px-3 font-bold w-1/4">Academic Area</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Specific Error Pattern</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Underlying Mechanism</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Remedial Target</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Reading Fluency", "Letter reversals (b/d, p/q) & omission of endings", "Visual-spatial directionality & phonological decoding", "Multisensory tracing in sand/clay & color-coded cues"],
                ["Handwriting", "Heavy grip pressure, rapid fatigue after 5 lines", "Fine motor intrinsic hand muscle fatigue", "Pencil grips, finger warmups, and slant writing boards"],
                ["Multi-step Math", "Confuses carrying/borrowing place values", "Working memory retention during multi-step tasks", "Graph paper for column alignment & visual step charts"],
                ["Spelling", "Phonetic spelling ('frend' for friend, 'sed' for said)", "Orthographic memory storage deficit", "Word family mapping & visual flashcard memory games"]
              ].map(([area, err, mech, rem], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                  <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{area}</td>
                  <td className="p-2.5 px-3 text-[#993C1D] font-semibold">{err}</td>
                  <td className="p-2.5 px-3 text-[#5F5E5A]">{mech}</td>
                  <td className="p-2.5 px-3 text-[#0F6E56] font-semibold">{rem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * 5. SPECIAL SCHOOL / COMPREHENSIVE IEP REPORT TABLE
 * ══════════════════════════════════════════════════════════════════════════
 */
export function SpecialSchoolIepReportTable({ assessment, formState, domainScores: propDomainScores }) {
  const profile = assessment?.profile || "Profile 2";
  const desc = assessment?.profile_description || "Semi-Structured Support — Emerging Independence in Basic Daily Routines";
  const cycle = assessment?.iep_cycle || 1;

  const rawDomains = assessment?.domain_scores || propDomainScores || {};
  const DOMAIN_DEFS = [
    { key: "grossMotor", name: "Gross Motor Skills", baseline: rawDomains.grossMotor ?? 55, priority: "Moderate" },
    { key: "fineMotor", name: "Fine Motor Skills", baseline: rawDomains.fineMotor ?? 48, priority: "High" },
    { key: "receptiveLanguage", name: "Receptive Language", baseline: rawDomains.receptiveLanguage ?? rawDomains.communication ?? 60, priority: "Moderate" },
    { key: "expressiveLanguage", name: "Expressive Language", baseline: rawDomains.expressiveLanguage ?? 42, priority: "High" },
    { key: "cognitive", name: "Cognitive Concepts", baseline: rawDomains.cognitive ?? 50, priority: "Moderate" },
    { key: "socialSkills", name: "Social Interaction", baseline: rawDomains.socialSkills ?? 45, priority: "High" },
    { key: "selfHelp", name: "Self-Help / Daily Living", baseline: rawDomains.selfHelp ?? rawDomains.adl ?? 52, priority: "High" },
    { key: "eating", name: "Eating & Drinking", baseline: rawDomains.eating ?? 65, priority: "Maintain" },
    { key: "dressing", name: "Dressing Skills", baseline: rawDomains.dressing ?? 40, priority: "High" },
    { key: "toileting", name: "Toileting Independence", baseline: rawDomains.toileting ?? 58, priority: "Moderate" },
    { key: "behaviour", name: "Behaviour Management", baseline: rawDomains.behaviour ?? 62, priority: "Maintain" },
    { key: "attention", name: "Sitting & Attention Span", baseline: rawDomains.attention ?? 38, priority: "High" },
    { key: "sensory", name: "Sensory Processing", baseline: rawDomains.sensory ?? 50, priority: "Moderate" },
    { key: "academics", name: "Functional Academics", baseline: rawDomains.academics ?? 35, priority: "High" }
  ];

  const avgBaseline = Math.round(DOMAIN_DEFS.reduce((acc, d) => acc + d.baseline, 0) / DOMAIN_DEFS.length);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-[#185FA5] pb-2">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-[#0F6E56]" />
          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wider">
            Individualized Education Program (IEP) 14-Domain Report
          </h3>
        </div>
        <span className="text-[11px] font-bold text-[#0F6E56] bg-[#EAF5EA] px-2.5 py-0.5 rounded-full border border-[#0F6E56]/30">
          Special School Curriculum Benchmark (Cycle {cycle})
        </span>
      </div>

      {/* Part A: Profile Overview Card */}
      <div className="bg-[#EAF5EA] border border-[#0F6E56]/40 rounded-[10px] p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-[#0F6E56]/20 pb-4 md:pb-0 md:pr-4">
          <span className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-wider block">
            Functional Student Profile
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F6E56] leading-none">
              {profile}
            </span>
          </div>

          <div className="p-2 rounded-[6px] bg-white border border-[#0F6E56]/30 text-xs font-bold text-[#0F6E56] text-center shadow-2xs">
            {desc}
          </div>

          <p className="text-[11px] text-[#5F5E5A]">
            Comprehensive 14-domain special school functional baseline.
          </p>
        </div>

        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2A]">
            <span>Average Baseline Mastery</span>
            <span className="font-mono text-xs">{avgBaseline}% Overall Independence</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0F6E56] rounded-full transition-all duration-700"
              style={{ width: `${avgBaseline}%` }}
            />
          </div>
          <p className="text-[11px] text-[#5F5E5A] leading-relaxed pt-1">
            Student demonstrates foundational skills in routine compliance, with 3-month goals concentrated on self-care, communication, and fine motor endurance.
          </p>
        </div>
      </div>

      {/* Part B: 14 Functional Developmental Domains Comprehensive Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 1: 14-Domain Comprehensive Functional Baseline
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0F6E56] text-white">
                <th className="p-2.5 px-3 font-bold w-10 text-center">#</th>
                <th className="p-2.5 px-3 font-bold w-1/3">Functional Domain</th>
                <th className="p-2.5 px-3 font-bold text-center w-28">Baseline Score</th>
                <th className="p-2.5 px-3 font-bold w-36">Mastery Level</th>
                <th className="p-2.5 px-3 font-bold text-center w-28">3-Month Priority</th>
              </tr>
            </thead>
            <tbody>
              {DOMAIN_DEFS.map((d, idx) => {
                const stage =
                  d.baseline < 40 ? "Emerging (<40%)" : d.baseline <= 60 ? "Developing (40-60%)" : d.baseline <= 80 ? "Functional (60-80%)" : "Mastered (>80%)";
                const priorityBadge =
                  d.priority === "High"
                    ? "bg-[#FDF2F2] text-[#993C1D] border-[#993C1D]"
                    : d.priority === "Moderate"
                    ? "bg-[#FEF6E7] text-[#854F0B] border-[#854F0B]"
                    : "bg-[#EAF5EA] text-[#2F6F5E] border-[#2F6F5E]";
                const barColor = d.baseline < 40 ? "#993C1D" : d.baseline <= 60 ? "#854F0B" : "#0F6E56";

                return (
                  <tr key={d.key} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                    <td className="p-2.5 px-3 font-bold text-center text-[#0F6E56]">{idx + 1}</td>
                    <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{d.name}</td>
                    <td className="p-2.5 px-3 font-mono font-black text-center text-[#0F6E56] text-sm">
                      {d.baseline}%
                    </td>
                    <td className="p-2.5 px-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#5F5E5A] font-semibold block">{stage}</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.baseline}%`, backgroundColor: barColor }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityBadge}`}>
                        {d.priority} Priority
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part C: 3-Month IEP Educational Target Goal Matrix Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#185FA5]">
          Table 2: 3-Month Individualized Educational Goal Matrix
        </h4>
        <div className="overflow-x-auto rounded-[8px] border border-[#D3D1C7]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#185FA5] text-white">
                <th className="p-2.5 px-3 font-bold w-1/4">Domain Area</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Current Baseline</th>
                <th className="p-2.5 px-3 font-bold w-1/4">3-Month Measurable Target Goal</th>
                <th className="p-2.5 px-3 font-bold w-1/4">Specialized Classroom Approach</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Self-Help / Dressing", "Requires full physical assist for buttons & shoes", "Unbuttons large buttons & pulls up pants independently", "Backward chaining & sensory-adapted clothing"],
                ["Expressive Communication", "Uses 1-word requests and gestures", "Initiates 2-word functional requests across 4 routines", "Visual exchange cards (PECS) & verbal modeling"],
                ["Sitting Endurance", "Sitting tolerance is 5–8 minutes", "Participates in 15-minute circle time with visual timer", "Movement breaks every 10 mins & visual schedules"],
                ["Fine Motor Writing", "Palmar grasp on writing utensils", "Demonstrates emerging static tripod grasp on thick crayons", "Pencil grips, easel writing, and playdough hand gym"]
              ].map(([dom, base, goal, app], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F8F8F6] border-t border-[#E8E6DF]"}>
                  <td className="p-2.5 px-3 font-bold text-[#2C2C2A]">{dom}</td>
                  <td className="p-2.5 px-3 text-[#5F5E5A]">{base}</td>
                  <td className="p-2.5 px-3 font-bold text-[#0F6E56]">{goal}</td>
                  <td className="p-2.5 px-3 text-[#185FA5]">{app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * MASTER SWITCHER: ASSESSMENT REPORT TABLE ROUTER
 * ══════════════════════════════════════════════════════════════════════════
 */
export default function AssessmentReportTableRouter({
  assessmentType,
  assessment,
  domainScores,
  isaaInfo,
  formState
}) {
  const clean = String(assessmentType || assessment?.source_table || "").toLowerCase();

  if (clean.includes("adhd") || clean.includes("conner")) {
    return <ConnersAdhdReportTable assessment={assessment} formState={formState} domainScores={domainScores} />;
  }

  if (clean.includes("delay") || clean.includes("developmental")) {
    return <DevelopmentalDelayReportTable assessment={assessment} formState={formState} domainScores={domainScores} />;
  }

  if (clean.includes("learn") || clean.includes("ldst") || clean.includes("sld") || clean.includes("dyslex")) {
    return <LearningDisabilityReportTable assessment={assessment} formState={formState} domainScores={domainScores} />;
  }

  if (clean.includes("special") || clean.includes("iep")) {
    return <SpecialSchoolIepReportTable assessment={assessment} formState={formState} domainScores={domainScores} />;
  }

  // Default: ASD / ISAA
  return <IsaaReportTable assessment={assessment} isaaInfo={isaaInfo} domainScores={domainScores} />;
}
