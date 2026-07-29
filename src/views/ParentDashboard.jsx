"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function ParentDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  const child = childrenList.find((c) => c.id === user?.childId) || childrenList[1] || childrenList[0];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="bg-[#185FA5] text-white p-6 rounded-[12px] shadow-sm space-y-2">
        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">
          Hello, {user?.name || "Parent"}! 👋
        </span>
        <h2 className="text-2xl font-black tracking-tight">
          Here is <span className="underline decoration-teal-400">{child?.name}</span>&apos;s update today.
        </h2>
        <p className="text-xs text-blue-100 font-medium">{todayStr}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-3xl">📄</div>
            <h3 className="text-base font-bold text-[#2C2C2A]">Latest Report</h3>

            {child?.reportsCount > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#5F5E5A]">Date: {child?.lastReportDate || "20 Nov 2025"}</p>
                <Badge label="Published" variant="green" size="sm" />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#993C1D]">Report not ready yet.</p>
                <p className="text-[11px] text-[#9B9A96]">Your therapist will notify you when it is ready.</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant={child?.reportsCount > 0 ? "primary" : "outlined"}
              fullWidth
              disabled={child?.reportsCount === 0}
              onClick={() => navigate("/parent/report")}
            >
              View Report →
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-3xl">🏃</div>
            <h3 className="text-base font-bold text-[#2C2C2A]">Today&apos;s Exercises</h3>
            <p className="text-xs font-bold text-[#185FA5]">3 exercises assigned</p>
            <p className="text-xs text-[#5F5E5A] font-semibold">Progress: 0 of 3 completed today</p>
          </div>

          <div className="pt-2">
            <Button variant="secondary" fullWidth onClick={() => navigate("/parent/exercises")}>
              Start Exercises →
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between space-y-4 hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-3xl">📅</div>
            <h3 className="text-base font-bold text-[#2C2C2A]">Next Appointment</h3>
            <p className="text-xs font-bold text-[#2C2C2A]">Monday, 4 August 2026</p>
            <p className="text-xs text-[#5F5E5A]">Time: <strong>10:00 AM</strong></p>
            <p className="text-[11px] text-[#9B9A96]">Location: Kids Care Rehab Centre</p>
          </div>

          <div className="pt-2">
            <Button variant="outlined" fullWidth onClick={() => alert("Appointment details: Mon, 4 Aug 2026 at 10:00 AM")}>
              View Details
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Need to reach us?">
        <div className="space-y-2 text-xs font-semibold text-[#5F5E5A]">
          <p className="flex items-center gap-2 text-[#2C2C2A]">
            <Phone className="h-4 w-4 text-[#185FA5]" />
            <span>Phone: <strong>044-28353136</strong></span>
          </p>
          <p className="flex items-center gap-2 text-[#2C2C2A]">
            <Mail className="h-4 w-4 text-[#0F6E56]" />
            <span>Email: <strong>kidscarerehabcenter@gmail.com</strong></span>
          </p>
          <p className="flex items-start gap-2 text-[#2C2C2A]">
            <MapPin className="h-4 w-4 text-[#993C1D] shrink-0 mt-0.5" />
            <span>Address: <strong>New no 52/2 old no 97 Gowdia mutt road, Royapettah, Chennai-600014</strong></span>
          </p>
        </div>
      </Card>
    </div>
  );
}
