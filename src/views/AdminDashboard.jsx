"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function AdminDashboard() {
  const { user, childrenList, staffList } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const activeStaffCount = staffList.filter((s) => s.isActive).length;

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
              <span className="text-[#0F6E56]">7 reports published</span>
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
    </div>
  );
}
