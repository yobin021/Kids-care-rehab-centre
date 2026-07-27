"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  HelpCircle,
  Shield,
  FileBarChart2,
  BookOpen,
  Settings,
  FilePlus,
  Activity,
  LogOut,
  X,
  UserCheck,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, userRole, activeTab, setActiveTab, logout } = useDashboard();

  const getNavItems = () => {
    if (userRole === "admin") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "children", label: "Children", icon: Users },
        { id: "appointments", label: "Appointments", icon: Calendar },
        { id: "enquiries", label: "Enquiries", icon: HelpCircle },
        { id: "staff", label: "Staff Management", icon: Shield },
        { id: "reports", label: "Reports", icon: FileBarChart2 },
        { id: "exercise-library", label: "Exercise Library", icon: BookOpen },
        { id: "settings", label: "Settings", icon: Settings }
      ];
    } else if (userRole === "staff") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "children", label: "My Children", icon: Users },
        { id: "appointments", label: "Appointments", icon: Calendar },
        { id: "new-assessment", label: "New Assessment", icon: FilePlus },
        { id: "daily-session", label: "Daily Session", icon: Activity },
        { id: "reports", label: "Reports", icon: FileBarChart2 }
      ];
    } else {
      // Parent Role
      return [
        { id: "parent-home", label: "Home", icon: LayoutDashboard },
        { id: "parent-reports", label: "My Child's Report", icon: FileBarChart2 },
        { id: "parent-exercises", label: "Today's Exercises", icon: Activity },
        { id: "parent-progress", label: "Progress", icon: TrendingUp }
      ];
    }
  };

  const getRoleBadgeStyle = () => {
    if (userRole === "admin") return "bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/30";
    if (userRole === "staff") return "bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/30";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (desktop 240px wide) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-[240px] flex-col border-r border-[#D3D1C7] bg-white px-4 py-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Clinic Logo + Name at Top */}
        <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4 mb-4">
          <div>
            <h1 className="text-[18px] font-extrabold text-[#185FA5] tracking-tight leading-tight">
              Kids Care
            </h1>
            <span className="text-[10px] font-extrabold text-[#5F5E5A] uppercase tracking-wider block">
              Rehab Centre
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role-Specific Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#185FA5] text-white"
                    : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#5F5E5A]"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logged-In User Footer Card */}
        <div className="mt-auto pt-4 border-t border-[#D3D1C7]/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#185FA5]/10 text-[#185FA5] font-black text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "KC"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#2C2C2A] truncate">{user?.name || "User"}</h4>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${getRoleBadgeStyle()}`}>
                {userRole}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-xs font-bold text-[#993C1D] bg-[#993C1D]/5 hover:bg-[#993C1D]/15 border border-[#993C1D]/30 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
