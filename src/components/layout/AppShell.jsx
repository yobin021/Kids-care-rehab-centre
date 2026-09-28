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
  Activity,
  CalendarDays,
  BookOpen,
  ChevronRight
} from "lucide-react";
import Toast from "../ui/Toast";

export default function AppShell({ children }) {
  const { user, isAdmin, isParent, logout, toasts, removeToast, childrenList } = useAuth();
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
      <div className="min-h-screen bg-[#F0F4FF] text-slate-800 font-sans relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none fixed" />

        {/* Toast Overlay */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </div>

        {/* Parent Top Navigation Bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/50 px-4 py-3 shadow-sm">
          <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4">
            
            {/* Left Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => navigate("/parent/home")}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition-opacity" />
                <img
                  src="/kids_care_rehab_center_logo.jpg"
                  alt="Logo"
                  className="relative h-10 w-10 rounded-xl object-cover border-2 border-white shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-black tracking-tight gradient-text-teal block leading-tight">KIDS CARE 360</span>
                <span className="text-[10px] font-semibold text-slate-500 block leading-tight">Parent Portal</span>
              </div>
            </div>

            {/* Center Links */}
            <nav className="flex items-center gap-1 bg-white/50 p-1 rounded-full border border-white shadow-xs">
              <Link
                to="/parent/home"
                className={`transition-all px-4 py-1.5 rounded-full text-[13px] font-semibold ${
                  location.pathname === "/parent/home" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Home
              </Link>
              <Link
                to="/parent/report"
                className={`transition-all px-4 py-1.5 rounded-full text-[13px] font-semibold ${
                  location.pathname.startsWith("/parent/report") || location.pathname.startsWith("/iep/report") ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Reports
              </Link>
              {!isIep && (
                <Link
                  to="/parent/exercises"
                  className={`transition-all px-4 py-1.5 rounded-full text-[13px] font-semibold ${
                    location.pathname === "/parent/exercises" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Exercises
                </Link>
              )}
            </nav>

            {/* Right Child Name + Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-white/50 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-gradient-emerald text-white flex items-center justify-center text-[10px] font-bold">
                  {activeChild?.name?.[0] || "C"}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  {activeChild?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/parent/login");
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Parent Main Content Area */}
        <main className="max-w-[800px] mx-auto p-4 sm:p-6 min-h-[calc(100vh-70px)] relative z-10 animate-fade-in">
          {children}
        </main>
      </div>
    );
  }

  // Staff + Admin Shell
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "KC";

  return (
    <div className="flex min-h-screen w-full bg-[#F0F4FF] text-slate-800 font-sans relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none fixed" />

      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Dark Theme - 260px) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-[260px] flex-col bg-[#0F172A] border-r border-slate-800 transition-transform duration-300 md:static md:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.1)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Logo */}
        <div className="px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur opacity-40 rounded-xl" />
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="Logo"
                className="relative h-11 w-11 rounded-xl object-cover border border-white/10 shrink-0 shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-black text-white tracking-tight leading-tight truncate">
                KIDS CARE 360
              </h1>
              <span className="text-[10px] font-semibold text-blue-300 block leading-tight truncate">
                Clinical System
              </span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Main Menu */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/children"
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item ${location.pathname.startsWith("/children") ? "active" : ""}`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Children & Reports</span>
            </Link>

            <Link
              to="/appointments"
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item ${location.pathname === "/appointments" ? "active" : ""}`}
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>Appointments</span>
            </Link>
          </div>

          {/* Clinical Programs */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Programs</p>
            
            <Link
              to="/iep"
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item ${location.pathname.startsWith("/iep") ? "active-violet" : ""}`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="flex-1">IEP Special School</span>
              {isAdmin && iepPendingCount > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {iepPendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/therapy"
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item ${location.pathname.startsWith("/therapy") ? "active-emerald" : ""}`}
            >
              <Activity className="h-4 w-4 shrink-0" />
              <span>Therapy Pathways</span>
            </Link>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin</p>
              <Link
                to="/admin/staff"
                onClick={() => setMobileOpen(false)}
                className={`sidebar-nav-item ${location.pathname === "/admin/staff" ? "active" : ""}`}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>Staff Management</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-blue text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-white truncate">{user?.name || "User"}</h4>
                <span className="text-[11px] font-medium text-slate-400 block truncate">
                  {isAdmin ? "Administrator" : "Clinical Staff"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 relative z-10">
        
        {/* Top Header Bar (Glass) */}
        <header className="sticky top-0 z-30 glass border-b border-white/50 px-6 py-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Animated Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-black tracking-tight text-slate-800 flex items-center gap-2">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[13px] font-bold text-slate-800 leading-tight">{user?.name}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{isAdmin ? 'Admin' : 'Staff'} Role</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-white border-2 border-slate-100 shadow-sm text-blue-600 font-bold text-xs flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in custom-scrollbar">
          <div className="animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
