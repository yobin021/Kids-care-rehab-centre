"use client";

import React, { useState } from "react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import OverviewTab from "@/components/dashboard/OverviewTab";
import ChildManagementTab from "@/components/dashboard/ChildManagementTab";
import AssessmentReviewTab from "@/components/dashboard/AssessmentReviewTab";
import TherapyManagementTab from "@/components/dashboard/TherapyManagementTab";
import StaffManagementTab from "@/components/dashboard/StaffManagementTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import EscalationCenterTab from "@/components/dashboard/EscalationCenterTab";

// Therapist views
import TherapistOverview from "@/components/dashboard/TherapistOverview";
import TherapistPatients from "@/components/dashboard/TherapistPatients";
import SessionEntryForm from "@/components/dashboard/SessionEntryForm";
import NewAssessmentForm from "@/components/dashboard/NewAssessmentForm";
import TherapistStats from "@/components/dashboard/TherapistStats";

// Parent views
import ParentOverview from "@/components/dashboard/ParentOverview";
import ParentExercises from "@/components/dashboard/ParentExercises";
import ParentProgress from "@/components/dashboard/ParentProgress";
import ParentAppointments from "@/components/dashboard/ParentAppointments";
import ParentReports from "@/components/dashboard/ParentReports";
import Login from "@/components/dashboard/Login";

function DashboardContent() {
  const { activeTab, isLoggedIn } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      // Admin Views
      case "dashboard":
        return <OverviewTab />;
      case "children":
        return <ChildManagementTab />;
      case "assessments":
        return <AssessmentReviewTab />;
      case "therapy":
        return <TherapyManagementTab />;
      case "staff":
        return <StaffManagementTab />;
      case "reports":
        return <ReportsTab />;
      case "escalations":
        return <EscalationCenterTab />;
      
      // Therapist Views
      case "therapist-home":
        return <TherapistOverview />;
      case "therapist-patients":
        return <TherapistPatients />;
      case "therapist-session":
        return <SessionEntryForm />;
      case "therapist-assessment":
        return <NewAssessmentForm />;
      case "therapist-stats":
        return <TherapistStats />;

      // Parent Views
      case "parent-home":
        return <ParentOverview />;
      case "parent-exercises":
        return <ParentExercises />;
      case "parent-progress":
        return <ParentProgress />;
      case "parent-appointments":
        return <ParentAppointments />;
      case "parent-reports":
        return <ParentReports />;
      
      default:
        return <OverviewTab />;
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-slate-50/50 bg-[url('/bg.png')] bg-cover bg-center bg-fixed">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 max-w-7xl w-full mx-auto">
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
