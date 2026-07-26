"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  FlameKindling,
  LogOut,
  LayoutDashboard,
  Users,
  Activity,
  HeartHandshake,
  FileBarChart2,
  FilePlus,
} from "lucide-react";
import { cn, Select } from "@/components/ui/ui";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const {
    userRole,
    activeTab,
    setActiveTab,
    activeTherapistId,
    setActiveTherapistId,
    activeChildId,
    setActiveChildId,
    therapists,
    children,
    setIsLoggedIn,
  } = useDashboard();

  const activeTherapistObj = therapists.find((t) => t.id === activeTherapistId);

  const handleTherapistSelectChange = (val: string) => {
    setActiveTherapistId(val);
    if (userRole === "therapist") {
      setActiveTab("therapist-home");
    }
  };

  const getNavItems = () => {
    if (userRole === "admin") {
      return [
        { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "children", label: "Child Management", icon: Users },
        { id: "staff", label: "Staff Management", icon: HeartHandshake },
        { id: "reports", label: "Reports & Audits", icon: FileBarChart2 },
      ];
    } else if (userRole === "parent") {
      return [
        { id: "parent-home", label: "Overview", icon: LayoutDashboard },
        { id: "parent-exercises", label: "Home Exercises", icon: Activity },
        { id: "parent-reports", label: "Clinical Reports", icon: FileBarChart2 },
      ];
    } else {
      return [
        { id: "therapist-home", label: "Therapist Home", icon: LayoutDashboard },
        { id: "therapist-assessment", label: "New Assessment Form", icon: FilePlus },
        { id: "therapist-stats", label: "Reports", icon: FileBarChart2 },
      ];
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed bottom-0 top-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/50 bg-white px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0 shadow-[4px_0_24px_-10px_rgba(15,23,42,0.03)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
            <FlameKindling className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-850 tracking-tight leading-none">
              Kids Care
            </h1>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none block mt-1.5">
              Rehab Centre
            </span>
          </div>
        </div>

        {/* Active Staff/Parent Profiler Card */}
        <div className="mb-6 rounded-2xl bg-slate-50/70 p-4 border border-slate-100/70">
          {userRole === "admin" ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/80 text-blue-700 font-bold text-xs shadow-inner">
                HD
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-800 leading-tight">Dr. Anand Iyer</h2>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Head Doctor / Admin</p>
              </div>
            </div>
          ) : userRole === "parent" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100/80 text-purple-700 font-bold text-xs shadow-inner">
                  VP
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-semibold text-slate-800 leading-tight truncate">
                    Vikram Patel
                  </h2>
                  <p className="text-[9px] font-semibold text-purple-650 truncate mt-0.5 uppercase tracking-wider">
                    Father of Aarav
                  </p>
                </div>
              </div>
              <Select
                value={activeChildId}
                onChange={setActiveChildId}
                options={children.map((c) => ({
                  label: `Child: ${c.name.split(" ")[0]}`,
                  value: c.id,
                }))}
                className="h-8 text-[11px] font-semibold"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-700 font-bold text-xs shadow-inner">
                  {activeTherapistObj?.name
                    ? activeTherapistObj.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "ST"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-semibold text-slate-800 leading-tight truncate">
                    {activeTherapistObj?.name || "Staff Therapist"}
                  </h2>
                  <p className="text-[9px] font-semibold text-emerald-650 truncate mt-0.5 uppercase tracking-wider">
                    {activeTherapistObj?.specialization || "Therapist"}
                  </p>
                </div>
              </div>
              <Select
                value={activeTherapistId}
                onChange={handleTherapistSelectChange}
                options={therapists.map((t) => ({
                  label: `${t.name} (${t.specialization.split(" ")[0]})`,
                  value: t.id,
                }))}
                className="h-8 text-[11px] font-semibold"
              />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
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
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 cursor-pointer relative group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-white" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", isActive ? "text-white" : "text-slate-400")} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer Support Info */}
        <div className="mt-2 text-center">
          <p className="text-[10px] font-medium text-slate-450">Clinic Management System</p>
          <p className="text-[9px] text-slate-350">Redesigned Dashboard v2.0</p>
        </div>
      </aside>
    </>
  );
}
