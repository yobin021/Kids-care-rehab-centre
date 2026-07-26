"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/components/ui/ui";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const {
    activeTab,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDashboard();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
  };

  const getHeaderMeta = () => {
    switch (activeTab) {
      // Admin Tabs
      case "dashboard":
        return { title: "Dashboard Overview", subtitle: "Clinical health status, daily traffic logs, and active case indicators." };
      case "children":
        return { title: "Child Management", subtitle: "Register patients, assign therapists, and manage case profiles." };
      case "staff":
        return { title: "Staff Management", subtitle: "Monitor therapist capacities, specializations, workloads, and leave schedules." };
      case "reports":
        return { title: "Reports & Audits", subtitle: "Analyze attendance stats, treatment success trends, and operational efficiency." };
        
      // Therapist Tabs
      case "therapist-home":
        return { title: "Therapist Overview", subtitle: "Today's calendar slots, patient workloads, and quick action shortcuts." };
      case "therapist-assessment":
        return { title: "New Assessment Form", subtitle: "Perform new developmental, OT, or PT evaluations and screening checklists." };
      case "therapist-stats":
        return { title: "Reports", subtitle: "Analyze therapist activity, patient compliance metrics, and progress trends." };

      // Parent Tabs
      case "parent-home":
        return { title: "Overview", subtitle: "Aarav's clinical status summary, home schedule, and therapist assignments." };
      case "parent-exercises":
        return { title: "Home Exercises", subtitle: "Assigned home programs. Keep practicing and mark completed when done!" };
      case "parent-reports":
        return { title: "Clinical Reports", subtitle: "Download therapist-signed assessments, plans, and case histories." };
        
      default:
        return { title: "Console Dashboard", subtitle: "Kids Care Rehab Centre Management Console." };
    }
  };

  const meta = getHeaderMeta();

  return (
    <header className="border-b border-slate-200/50 bg-white/75 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_10px_-8px_rgba(0,0,0,0.05)] w-full">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        
        {/* Left Side: Menu Trigger + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
              {meta.title}
            </h2>
            <p className="text-[10px] font-medium text-slate-400 mt-1 truncate max-w-[280px] sm:max-w-md md:max-w-lg hidden xs:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Notifications Bell */}
        <div className="relative shrink-0 ml-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all duration-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md py-2.5 shadow-xl ring-1 ring-black/5 z-50 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2 mb-1.5">
                <span className="text-xs font-bold text-slate-800">System Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
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
                        "flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-2.5 text-left text-xs transition-colors hover:bg-slate-50/80 cursor-pointer",
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
