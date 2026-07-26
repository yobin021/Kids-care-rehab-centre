"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  Bell,
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Activity,
  HeartHandshake,
  FileBarChart2,
  AlertTriangle,
  NotebookPen,
  FilePlus,
  BarChart,
} from "lucide-react";
import { cn } from "@/components/ui/ui";

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    userRole,
    activeTherapistId,
    children,
    assessments,
    escalations,
  } = useDashboard();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingReviewsCount = assessments.filter((a) => a.status === "Pending Review").length;
  const activeEscalationsCount = escalations.filter((e) => e.status === "Open").length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);
    setDropdownOpen(false);
    if (notif.type === "escalation") {
      setActiveTab("escalations");
    } else if (notif.type === "review") {
      setActiveTab("assessments");
    }
  };

  const getNavItems = () => {
    if (userRole === "admin") {
      return [
        { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "children", label: "Child Management", icon: Users },
        {
          id: "assessments",
          label: "Assessment Review",
          icon: ClipboardCheck,
          badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
          badgeVariant: "info" as const,
        },
        { id: "therapy", label: "Therapy Management", icon: Activity },
        { id: "staff", label: "Staff Management", icon: HeartHandshake },
        { id: "reports", label: "Reports & Audits", icon: FileBarChart2 },
        {
          id: "escalations",
          label: "Escalation Center",
          icon: AlertTriangle,
          badge: activeEscalationsCount > 0 ? activeEscalationsCount : undefined,
          badgeVariant: "danger" as const,
        },
      ];
    } else if (userRole === "parent") {
      return [
        { id: "parent-home", label: "Overview", icon: LayoutDashboard },
        { id: "parent-progress", label: "Track Progress", icon: BarChart },
        { id: "parent-exercises", label: "Home Exercises", icon: Activity },
        { id: "parent-appointments", label: "Schedule & Appointments", icon: ClipboardCheck },
        { id: "parent-reports", label: "Clinical Reports", icon: FileBarChart2 },
      ];
    } else {
      const myPatientsCount = children.filter((c) => c.assignedTherapistId === activeTherapistId).length;
      return [
        { id: "therapist-home", label: "Therapist Home", icon: LayoutDashboard },
        {
          id: "therapist-patients",
          label: "Patient Roster",
          icon: Users,
          badge: myPatientsCount > 0 ? myPatientsCount : undefined,
          badgeVariant: "info" as const,
        },
        { id: "therapist-session", label: "Daily Session Log", icon: NotebookPen },
        { id: "therapist-assessment", label: "New Assessment Form", icon: FilePlus },
        { id: "therapist-stats", label: "Workload & Stats", icon: BarChart },
      ];
    }
  };

  return (
    <header className="border-b border-blue-50/60 bg-white sticky top-0 z-30 shadow-xs w-full">
      {/* Horizontal Navigation Tabs + Notifications */}
      <div className="flex h-14 items-center justify-between px-6 overflow-x-auto bg-slate-50/50 scrollbar-none">
        <nav className="flex items-center gap-1.5 py-2">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-155 whitespace-nowrap border border-transparent cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-150/70 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "inline-flex h-4 items-center justify-center rounded-full px-1.5 text-[9px] font-extrabold border min-w-4",
                      isActive
                        ? "bg-white text-blue-600 border-white"
                        : item.badgeVariant === "danger"
                        ? "bg-rose-50 border-rose-100 text-rose-700 animate-pulse"
                        : "bg-blue-50 border-blue-100 text-blue-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Notifications Bell */}
        <div className="relative shrink-0 ml-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white py-2.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2 mb-1.5">
                <span className="text-xs font-bold text-slate-800">System Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs font-medium text-slate-400">
                    No new alerts
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-2.5 text-left text-xs transition-colors hover:bg-slate-50/80",
                        !notif.read && "bg-blue-50/20 font-semibold"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-bold truncate pr-2",
                            notif.type === "escalation" ? "text-rose-700" : "text-slate-800"
                          )}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-snug truncate">
                        {notif.description}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
