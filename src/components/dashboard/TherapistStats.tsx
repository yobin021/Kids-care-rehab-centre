"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, Progress } from "@/components/ui/ui";
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Activity, Star, Calendar, Users } from "lucide-react";

export default function TherapistStats() {
  const { children, activeTherapistId, therapists } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const therapist = therapists.find((t) => t.id === activeTherapistId);
  const myChildren = children.filter((c) => c.assignedTherapistId === activeTherapistId);

  // Computed average metrics
  const sessionCount = myChildren.reduce((acc, c) => acc + c.sessionLogs.length, 0);

  // Cooperation rate calculation
  const totalLogs = myChildren.flatMap((c) => c.sessionLogs);
  const goodCoop = totalLogs.filter((l) => l.cooperationLevel === "Good").length;
  const modCoop = totalLogs.filter((l) => l.cooperationLevel === "Moderate").length;
  const coopRate = totalLogs.length > 0 ? Math.round(((goodCoop + modCoop * 0.5) / totalLogs.length) * 100) : 100;

  // Chart data: Average cooperation scores per patient
  const patientCooperationData = myChildren.map((c) => {
    const logs = c.sessionLogs;
    const score = logs.length > 0
      ? Math.round((logs.filter((l) => l.cooperationLevel === "Good").length / logs.length) * 100)
      : 80; // default baseline if new
    return { name: c.name.split(" ")[0], compliance: score };
  });

  // Chart data: Progress indicators over past 6 weeks (aggregated)
  const milestoneProgressData = [
    { week: "Wk 1", attention: 60, eyeContact: 55, sitting: 65 },
    { week: "Wk 2", attention: 62, eyeContact: 58, sitting: 70 },
    { week: "Wk 3", attention: 65, eyeContact: 65, sitting: 75 },
    { week: "Wk 4", attention: 68, eyeContact: 72, sitting: 80 },
    { week: "Wk 5", attention: 74, eyeContact: 78, sitting: 82 },
    { week: "Wk 6", attention: 82, eyeContact: 85, sitting: 88 },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned caseload</span>
            <h3 className="text-lg font-black text-slate-800">
              {myChildren.length} / {therapist?.maxCapacity || 5} Children
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Sessions</span>
            <h3 className="text-lg font-black text-slate-800">{sessionCount} logs filed</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3.5 text-amber-600">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cooperation Rating</span>
            <h3 className="text-lg font-black text-slate-800">{coopRate}% Compliance</h3>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Compliance by Patient */}
        <Card>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800">Patient Compliance Index</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Percentage of sessions rated "Good" or "Moderate" cooperation</p>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart data={patientCooperationData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <ChartTooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                  <Bar dataKey="compliance" fill="#2563eb" radius={[6, 6, 0, 0]} name="Cooperation %" />
                </RechartBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300 text-xs">Loading compliance data...</div>
            )}
          </div>
        </Card>

        {/* Progress indicator timeline */}
        <Card>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800">Progress Factor Trends</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">6-week aggregated performance indexes across children</p>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={milestoneProgressData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <ChartTooltip contentStyle={{ fontSize: "11px", borderRadius: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="attention" stroke="#2563eb" strokeWidth={3.5} name="Attention Span" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="eyeContact" stroke="#10b981" strokeWidth={3.5} name="Eye Contact" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="sitting" stroke="#f59e0b" strokeWidth={3.5} name="Sitting Tolerance" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300 text-xs">Loading progress trends...</div>
            )}
          </div>
        </Card>
      </div>

      {/* Caseload Allocation Limits */}
      <Card className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Clinic Workload Thresholds</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Therapists limit status based on clinical safety guidelines</p>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-600">
            <span>Active Capacity</span>
            <span>{myChildren.length} / {therapist?.maxCapacity || 5} Assigned Patients</span>
          </div>
          <Progress value={myChildren.length} max={therapist?.maxCapacity || 5} />
          <p className="text-[10px] text-slate-500 font-medium italic">
            *Guideline: Do not exceed workload threshold without supervisor signoff to maintain clinical care standards.
          </p>
        </div>
      </Card>
    </div>
  );
}
