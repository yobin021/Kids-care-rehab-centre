"use client";

import React, { useState } from "react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Login from "@/components/dashboard/Login";

// Dashboards
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import ParentHome from "@/components/dashboard/ParentHome";

// Shared Pages
import ChildrenList from "@/components/dashboard/ChildrenList";
import ChildRegistration from "@/components/dashboard/ChildRegistration";
import AppointmentBooking from "@/components/dashboard/AppointmentBooking";
import EnquiryLog from "@/components/dashboard/EnquiryLog";
import StaffManagement from "@/components/dashboard/StaffManagement";
import ReportsTab from "@/components/dashboard/ReportsTab";

// Phase 2/3 Forms
import ClinicalAssessmentForm from "@/components/dashboard/ClinicalAssessmentForm";
import SessionEntryForm from "@/components/dashboard/SessionEntryForm";
import ParentReport from "@/components/dashboard/ParentReport";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

function DashboardContent() {
  const { activeTab, isLoggedIn, userRole, toasts, removeToast } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, render Login page (Route: /login)
  if (!isLoggedIn) {
    return <Login />;
  }

  // Active view router per role and tab
  const renderActiveTab = () => {
    // Role-based protection: if staff tries to open staff management, redirect to dashboard
    if (userRole === "staff" && activeTab === "staff") {
      return <StaffDashboard />;
    }
    // Role-based protection: if parent tries to open children list, redirect to parent home
    if (userRole === "parent" && (activeTab === "children" || activeTab === "children-new" || activeTab === "staff")) {
      return <ParentHome />;
    }

    switch (activeTab) {
      // Role Dashboards
      case "dashboard":
        if (userRole === "admin") return <AdminDashboard />;
        if (userRole === "staff") return <StaffDashboard />;
        return <ParentHome />;

      // Shared Navigation Pages
      case "children":
        return <ChildrenList />;

      case "children-new":
        return <ChildRegistration />;

      case "appointments":
        return <AppointmentBooking />;

      case "enquiries":
        return <EnquiryLog />;

      case "staff":
        return <StaffManagement />;

      case "reports":
        return <ReportsTab />;

      case "new-assessment":
        return <ClinicalAssessmentForm />;

      case "daily-session":
        return <SessionEntryForm />;

      // Parent Specific Pages
      case "parent-home":
        return <ParentHome />;

      case "parent-reports":
        return <ParentReport />;

      case "parent-exercises":
        return <ParentHome />;

      case "parent-progress":
        return <ParentHome />;

      default:
        if (userRole === "admin") return <AdminDashboard />;
        if (userRole === "staff") return <StaffDashboard />;
        return <ParentHome />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F8F6] text-[#2C2C2A] font-sans">
      {/* Toast Notifications Overlay */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-[8px] border shadow-lg text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
              t.type === "success"
                ? "bg-[#3B6D11] text-white border-[#3B6D11]"
                : t.type === "error"
                ? "bg-[#993C1D] text-white border-[#993C1D]"
                : "bg-[#185FA5] text-white border-[#185FA5]"
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
              {t.type === "info" && <Info className="h-4 w-4 shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button onClick={() => removeToast(t.id)} className="hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Shared Layout: Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Shared Layout: Top Bar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Active Page Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
