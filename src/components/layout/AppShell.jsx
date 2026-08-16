"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Home,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  FileText,
  Activity,
  User,
  Heart,
  CalendarDays,
  BookOpen
} from "lucide-react";
import Toast from "../ui/Toast";

export default function AppShell({ children }) {
  const { user, role, isAdmin, isParent, logout, toasts, removeToast, childrenList } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [iepPendingCount, setIepPendingCount] = useState(0);

  // Load pending IEP count for admin badge
  React.useEffect(() => {
    if (!isAdmin) return;
    import("../../services/iepService").then(({ iepService }) => {
      iepService.getPendingReviewCount().then(n => setIepPendingCount(n)).catch(() => {});
    }).catch(() => {});
  }, [isAdmin]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return isAdmin ? "Admin Dashboard" : "Staff Dashboard";
    if (path.startsWith("/children/new")) return "Register New Child";
    if (path.includes("/edit")) return "Edit Child Details";
    if (path.startsWith("/children/")) return "Child Profile";
    if (path === "/children") return "Children & Reports";
    if (path === "/admin/staff") return "Staff Management";
    if (path === "/appointments") return "Appointments";
    if (path === "/parent/home") return "Parent Dashboard";
    if (path === "/parent/report") return "Child Assessment Report";
    if (path === "/parent/exercises") return "Daily Exercises";
    return "KIDS CARE 360";
  };

  // If Parent Role -> Render Parent Shell
  if (isParent) {
    const activeChild = childrenList.find((c) => c.id === user?.childId) || childrenList[1] || childrenList[0];
    const isIep = activeChild?.program_type === "iep";

    return (
      <div className="min-h-screen bg-[#F8F8F6] text-[#2C2C2A] font-sans">
        {/* Toast Overlay */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </div>

        {/* Parent Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="max-w-[720px] mx-auto flex items-center justify-between gap-2">
            
            {/* Left Logo */}
            <div className="flex items-center gap-2.5">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="KIDS CARE 360 Logo"
                className="h-9 w-9 rounded-[8px] object-cover border border-[#185FA5]/20 shadow-2xs"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <span className="text-sm font-black text-[#185FA5] tracking-tight block leading-tight">KIDS CARE 360</span>
                <span className="text-[9px] font-semibold text-[#5F5E5A] block leading-tight">Neurodiversity Clinical System</span>
              </div>
            </div>

            {/* Center Links */}
            <nav className="flex items-center gap-4 text-xs font-extrabold">
              <Link
                to="/parent/home"
                className={`transition-colors py-1 ${
                  location.pathname === "/parent/home" ? "text-[#185FA5] border-b-2 border-[#185FA5]" : "text-[#5F5E5A] hover:text-[#2C2C2A]"
                }`}
              >
                Home
              </Link>
              <Link
                to="/parent/report"
                className={`transition-colors py-1 ${
                  location.pathname.startsWith("/parent/report") || location.pathname.startsWith("/iep/report") ? "text-[#185FA5] border-b-2 border-[#185FA5]" : "text-[#5F5E5A] hover:text-[#2C2C2A]"
                }`}
              >
                Report
              </Link>
              {!isIep && (
                <Link
                  to="/parent/exercises"
                  className={`transition-colors py-1 ${
                    location.pathname === "/parent/exercises" ? "text-[#185FA5] border-b-2 border-[#185FA5]" : "text-[#5F5E5A] hover:text-[#2C2C2A]"
                  }`}
                >
                  Exercises
                </Link>
              )}
            </nav>

            {/* Right Child Name + Logout */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#2C2C2A] hidden sm:inline">
                {activeChild?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-1.5 text-[#993C1D] hover:bg-rose-50 rounded-[6px] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </header>

        {/* Parent Main Content Area */}
        <main className="max-w-[720px] mx-auto p-4 min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
    );
  }

  // Staff + Admin Shell
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "KC";

  return (
    <div className="flex min-h-screen w-full bg-[#F8F8F6] text-[#2C2C2A] font-sans">
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (240px Fixed) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-[240px] flex-col border-r border-[#D3D1C7] bg-white px-4 py-5 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Logo */}
        <div className="border-b border-[#D3D1C7]/60 pb-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="KIDS CARE 360 Logo"
                className="h-10 w-10 rounded-[10px] object-cover border border-[#185FA5]/20 shadow-2xs shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="min-w-0">
                <h1 className="text-[15px] font-black text-[#185FA5] tracking-tight leading-tight truncate">
                  KIDS CARE 360
                </h1>
                <span className="text-[9px] font-bold text-[#2C2C2A] block leading-tight truncate">
                  Neurodiversity Clinical System
                </span>
              </div>
            </div>

            <button onClick={() => setMobileOpen(false)} className="md:hidden text-[#5F5E5A]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[8px] font-bold text-[#5F5E5A] tracking-wider uppercase mt-2 pt-1 border-t border-[#D3D1C7]/40 text-center">
            Assess • Plan • Intervene • Track • Progress
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
              location.pathname === "/dashboard"
                ? "bg-[#185FA5] text-white"
                : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
            }`}
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/children"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
              location.pathname.startsWith("/children")
                ? "bg-[#185FA5] text-white"
                : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Children & Reports</span>
          </Link>

          <Link
            to="/appointments"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
              location.pathname === "/appointments"
                ? "bg-[#185FA5] text-white"
                : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
            }`}
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Appointments</span>
          </Link>

          <Link
            to="/iep"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
              location.pathname.startsWith("/iep")
                ? "bg-[#185FA5] text-white"
                : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="flex-1">IEP</span>
            {isAdmin && iepPendingCount > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${location.pathname.startsWith("/iep") ? "bg-white/30 text-white" : "bg-[#F59E0B] text-white"}`}>
                {iepPendingCount}
              </span>
            )}
          </Link>

          <Link
            to="/therapy"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
              location.pathname.startsWith("/therapy")
                ? "bg-[#0F6E56] text-white"
                : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#0F6E56]"
            }`}
          >
            <Activity className="h-4 w-4 shrink-0" />
            <span>Therapy</span>
          </Link>

          {/* Admin Only Link */}
          {isAdmin && (
            <Link
              to="/admin/staff"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-bold transition-colors ${
                location.pathname === "/admin/staff"
                  ? "bg-[#185FA5] text-white"
                  : "text-[#2C2C2A] hover:bg-[#F8F8F6] hover:text-[#185FA5]"
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Staff Management</span>
            </Link>
          )}
        </nav>

        {/* Bottom User Profile */}
        <div className="mt-auto pt-4 border-t border-[#D3D1C7]/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#185FA5] text-white font-black text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#2C2C2A] truncate">{user?.name || "User"}</h4>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAdmin ? "bg-[#185FA5] text-white" : "bg-[#0F6E56] text-white"
                }`}
              >
                {isAdmin ? "Admin" : "Staff"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full text-left px-3 py-2 rounded-[8px] text-xs font-bold text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#993C1D] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#D3D1C7] px-6 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-[8px] border border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F8F8F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[20px] font-bold text-[#2C2C2A] truncate">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#185FA5] text-white font-black text-xs flex items-center justify-center">
              {initials}
            </div>
            <span className="text-xs font-bold text-[#2C2C2A] hidden sm:inline">{user?.name}</span>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
