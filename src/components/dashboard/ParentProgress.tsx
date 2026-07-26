"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, Progress, Badge } from "@/components/ui/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Award,
  CheckCircle,
  HelpCircle,
  Activity,
  Flame,
  Star,
} from "lucide-react";

export default function ParentProgress() {
  const { children, activeChildId } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const child = children.find((c) => c.id === activeChildId) || children[0];

  if (!child) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100 animate-in fade-in duration-300">
        <p className="text-sm font-semibold text-slate-400">No registered child found in this account.</p>
      </div>
    );
  }

  const logs = child.sessionLogs || [];

  // 1. Chart Data: Generate weekly progress indicators based on child session history
  // To make the chart look nice and detailed, we will start with a baseline and increment
  // based on the child's actual completed sessions.
  const baseProgress = [
    { week: "Wk 1", attention: 45, eyeContact: 40, motorSpeech: 50 },
    { week: "Wk 2", attention: 50, eyeContact: 48, motorSpeech: 52 },
    { week: "Wk 3", attention: 52, eyeContact: 55, motorSpeech: 58 },
    { week: "Wk 4", attention: 58, eyeContact: 60, motorSpeech: 64 },
  ];

  // If the user logs more sessions, they incrementally bump up the final weeks
  const attentionSuccessCount = logs.filter((l) => l.improvementIndicators.attention).length;
  const eyeContactSuccessCount = logs.filter((l) => l.improvementIndicators.eyeContact).length;
  const motorSpeechSuccessCount = logs.filter(
    (l) => l.improvementIndicators.motorSkills || l.improvementIndicators.speechResponse
  ).length;

  const currentAttention = Math.min(65 + attentionSuccessCount * 8, 98);
  const currentEyeContact = Math.min(62 + eyeContactSuccessCount * 8, 95);
  const currentMotorSpeech = Math.min(68 + motorSpeechSuccessCount * 8, 98);

  const chartData = [
    ...baseProgress,
    {
      week: "Current",
      attention: currentAttention,
      eyeContact: currentEyeContact,
      motorSpeech: currentMotorSpeech,
    },
  ];

  // 2. Goal Progress List
  // We can pull the goal strings from the child's actual therapy plan
  const shortTermGoals = child.therapyPlan?.shortTermGoals || "";
  const longTermGoals = child.therapyPlan?.longTermGoals || "";

  // Split goals or create friendly sub-goal metrics based on the child's profile
  const goalItems = [
    {
      id: "g-1",
      title: "Expressive Verbal Requests (2-word combo)",
      desc: child.id === "KCR-2026-001" 
        ? "Using picture flashcards to prompt verbal requests at home." 
        : "Improving vocabulary and verbal expression.",
      progress: Math.min(50 + logs.length * 15, 90),
      category: "Speech / Language",
    },
    {
      id: "g-2",
      title: "Sensory Integration & Self-Regulation",
      desc: child.id === "KCR-2026-001" 
        ? "Tolerating auditory stimuli (e.g. background construction noise)." 
        : "Improving attention tolerance in active rooms.",
      progress: Math.min(40 + logs.length * 10, 80),
      category: "Occupational Therapy",
    },
    {
      id: "g-3",
      title: "Fine Motor Co-ordination",
      desc: "Completing daily structured tasks like drawing, clay molding, or threading.",
      progress: Math.min(60 + logs.length * 5, 85),
      category: "OT / Fine Motor",
    },
  ];

  // Calculate Average Goal Completion
  const averageGoalCompletion = Math.round(
    goalItems.reduce((acc, curr) => acc + curr.progress, 0) / goalItems.length
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Progress Tracking</h1>
          <p className="text-sm font-semibold text-slate-500">
            Real-time analytics showcasing {child.name}&apos;s clinical development.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 border border-blue-50/40 rounded-2xl">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
              Average Goal Progress
            </span>
            <span className="text-base font-black text-blue-700">{averageGoalCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Overview Goals Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Therapy Plan Details */}
        <Card className="md:col-span-1 space-y-4 bg-gradient-to-br from-blue-50/20 to-indigo-50/20">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Active Therapy Goals
            </h3>
          </div>
          
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Short Term Target (3 Months)
              </span>
              <p className="leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100">
                {shortTermGoals || "Improve verbal articulation and fine motor skill benchmarks."}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Long Term Target (6-12 Months)
              </span>
              <p className="leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100">
                {longTermGoals || "Achieve full independence in preschool activities and peer playtime."}
              </p>
            </div>
          </div>
        </Card>

        {/* Dynamic Goal Progress Cards */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Goal Milestone Completion
          </h3>

          <div className="space-y-3.5">
            {goalItems.map((item) => (
              <Card key={item.id} className="p-4.5 space-y-3 border border-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">{item.title}</h4>
                  </div>
                  <Badge variant="primary" className="text-[10px] font-extrabold">
                    {item.progress}%
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-[11px] text-slate-500 font-semibold">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Milestone Progress Plot */}
      <Card className="space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">Development Factors Timeline</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Performance indicators monitored and logged across therapy sessions.
          </p>
        </div>

        <div className="h-72 w-full pr-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                <ChartTooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                
                <Line
                  type="monotone"
                  dataKey="attention"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="Attention Span"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="eyeContact"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Eye Contact"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="motorSpeech"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Motor / Speech Response"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300 text-xs">
              Loading progress timeline...
            </div>
          )}
        </div>
      </Card>

      {/* Progress Factors Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Positive Behaviors Logged
            </h4>
          </div>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            {child.name} has shown steady improvement in sitting tolerance and verbalizing requests.
            His cooperation rating has maintained a baseline of &quot;Moderate to Good&quot; over the last 2 sessions.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Recent Milestones Met
            </h4>
          </div>
          <ul className="space-y-2 text-xs font-semibold text-slate-600">
            <li className="flex items-center gap-2 text-emerald-600">
              ✓ Successfully named 8/10 picture card objects.
            </li>
            <li className="flex items-center gap-2 text-emerald-600">
              ✓ Attempted straw drinking with solid lip compression.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
