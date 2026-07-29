"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, FileText, ClipboardList, Eye } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function StaffDashboard() {
  const { user, childrenList } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const recentChildren = childrenList.slice(-4).reverse();

  const getProfileVariant = (profile) => {
    switch (profile) {
      case "A": return "purple";
      case "B": return "blue";
      case "C": return "amber";
      case "D": return "teal";
      case "E": return "coral";
      default: return "blue";
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div>
        <h2 className="text-[20px] font-bold text-[#2C2C2A]">Good morning, {user?.name || "Staff"}</h2>
        <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">{todayStr}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Children" value="9" icon={Users} color="#185FA5" />
        <StatCard title="Reports Published" value="7" icon={FileText} color="#0F6E56" />
        <StatCard title="Assessments This Month" value="3" icon={ClipboardList} color="#3C3489" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">➕👶</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">Register New Child</h3>
            <p className="text-xs text-[#5F5E5A]">Add a new child to the system</p>
          </div>
          <div className="pt-4">
            <Button onClick={() => navigate("/children/new")} fullWidth>
              Register Child
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">📋</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">New Assessment</h3>
            <p className="text-xs text-[#5F5E5A]">Fill assessment form for a child</p>
          </div>
          <div className="pt-4">
            <Button variant="secondary" onClick={() => navigate("/children")} fullWidth>
              Start Assessment
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between hover:border-[#185FA5] transition-colors">
          <div className="space-y-2">
            <div className="text-2xl">👥</div>
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">View All Children</h3>
            <p className="text-xs text-[#5F5E5A]">See all registered children and their reports</p>
          </div>
          <div className="pt-4">
            <Button variant="outlined" onClick={() => navigate("/children")} fullWidth>
              View Children
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-[16px] font-bold text-[#2C2C2A]">Recently Registered</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentChildren.map((c) => (
            <Card key={c.id} padding="p-4" className="space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2C2C2A] truncate">{c.name}</h4>
                  <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} size="sm" />
                </div>
                <p className="text-[11px] text-[#5F5E5A] font-semibold">{c.age} • {c.diagnosis}</p>
                <p className="text-[10px] font-mono text-[#9B9A96]">{c.id}</p>
              </div>

              <Button
                variant="outlined"
                size="sm"
                fullWidth
                icon={Eye}
                onClick={() => navigate(`/children/${c.id}`)}
              >
                View
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
