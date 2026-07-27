"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Menu, User, Bell } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, activeTab, userRole } = useDashboard();

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return userRole === "admin" ? "Admin Dashboard Overview" : "Staff Dashboard Overview";
      case "children":
        return "Children Database & Records";
      case "children-new":
        return "Register New Child Patient";
      case "appointments":
        return "Appointments & Scheduling";
      case "enquiries":
        return "Patient Enquiry Log";
      case "staff":
        return "Staff Management & Workload";
      case "reports":
        return "Clinical Reports & Approvals";
      case "exercise-library":
        return "Therapeutic Exercise Library";
      case "settings":
        return "System Settings & Configuration";
      case "new-assessment":
        return "Clinical Assessment Form (11 Tabs)";
      case "daily-session":
        return "Daily Therapy Session Entry";
      case "parent-home":
        return "Parent Dashboard — Home";
      case "parent-reports":
        return "Child Progress Report";
      case "parent-exercises":
        return "Today's Home Exercises";
      case "parent-progress":
        return "Weekly Exercise Progress";
      default:
        return "Kids Care Rehab Centre";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] px-6 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      
      {/* Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-[8px] border border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F8F8F6] transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base font-extrabold text-[#2C2C2A] tracking-tight truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Side: User Avatar & Initials */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[#D3D1C7]">
          <div className="h-8 w-8 rounded-full bg-[#185FA5] text-white flex items-center justify-center text-xs font-black shadow-xs">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "KC"}
          </div>
          <span className="text-xs font-bold text-[#2C2C2A] whitespace-nowrap">
            {user?.name || "User"}
          </span>
        </div>
      </div>

    </header>
  );
}
