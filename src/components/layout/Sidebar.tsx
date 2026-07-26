"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  FlameKindling,
  LogOut,
} from "lucide-react";
import { cn, Select } from "@/components/ui/ui";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const {
    userRole,
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed bottom-0 top-0 left-0 z-40 flex w-72 flex-col border-r border-blue-50/60 bg-white px-5 py-6 transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <FlameKindling className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight leading-none">
              Kids Care
            </h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">
              Rehab Centre
            </span>
          </div>
        </div>


        {/* Active Staff Profiler Card */}
        <div className="mb-6 rounded-2xl bg-blue-50/40 p-4 border border-blue-50/30">
          {userRole === "admin" ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
                HD
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 leading-tight">Dr. Anand Iyer</h2>
                <p className="text-[11px] font-medium text-slate-500">Head Doctor / Admin</p>
              </div>
            </div>
          ) : userRole === "parent" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
                  VP
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-slate-800 leading-tight truncate">
                    Vikram Patel
                  </h2>
                  <p className="text-[9px] font-bold text-blue-600 truncate mt-0.5 uppercase tracking-wider">
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
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
                  {activeTherapistObj?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("") || "ST"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {activeTherapistObj?.name || "Staff Therapist"}
                  </h2>
                  <p className="text-[9px] font-bold text-blue-600 truncate mt-0.5 uppercase tracking-wider">
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



        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer Support Info */}
        <div className="mt-2 text-center">
          <p className="text-[10px] font-medium text-slate-400">Clinic Management System</p>
          <p className="text-[9px] text-slate-300">Phase 1 MVP v1.2</p>
        </div>
      </aside>
    </>
  );
}
