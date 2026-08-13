"use client";

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/layout/AppShell";

// Views
import StaffLogin from "../views/StaffLogin";
import ParentLogin from "../views/ParentLogin";
import StaffDashboard from "../views/StaffDashboard";
import AdminDashboard from "../views/AdminDashboard";
import ChildrenList from "../views/ChildrenList";
import ChildRegistration from "../views/ChildRegistration";
import ChildProfile from "../views/ChildProfile";
import ChildEdit from "../views/ChildEdit";
import StaffManagement from "../views/StaffManagement";

import ParentDashboard from "../views/ParentDashboard";
import ParentReportView from "../views/ParentReportView";
import ParentExercises from "../views/ParentExercises";

// Phase 3 & 4 Views
import AssessmentForm from "../views/AssessmentForm";
import AssessmentResults from "../views/AssessmentResults";
import ReportGenerationEditor from "../views/ReportGenerationEditor";
import TherapistReportView from "../views/TherapistReportView";
import AppointmentsPage from "../views/AppointmentsPage";

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "parent") {
      return <Navigate to="/parent/home" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

export default function AppRouter() {
  const { user, isAdmin, isParent } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : isParent ? (
              <Navigate to="/parent/home" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Public Login Routes */}
        <Route path="/login" element={<StaffLogin />} />
        <Route path="/parent/login" element={<ParentLogin />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              {isAdmin ? <AdminDashboard /> : <StaffDashboard />}
            </ProtectedRoute>
          }
        />

        {/* Children Management */}
        <Route
          path="/children"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ChildrenList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/children/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ChildRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/children/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ChildProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/children/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ChildEdit />
            </ProtectedRoute>
          }
        />

        {/* Phase 3 Assessment Routes */}
        <Route
          path="/assessment/new/:childId"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id/results"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AssessmentResults />
            </ProtectedRoute>
          }
        />

        {/* Phase 4 Report Routes */}
        <Route
          path="/reports/new/:childId"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ReportGenerationEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id/review"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <TherapistReportView initialEditMode={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id/therapist"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <TherapistReportView />
            </ProtectedRoute>
          }
        />

        {/* Appointments */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Staff Management */}
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/:id/parent"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "parent"]}>
              <ParentReportView />
            </ProtectedRoute>
          }
        />

        {/* Parent Portal Routes */}
        <Route
          path="/parent/home"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/report"
          element={
            <ProtectedRoute allowedRoles={["admin", "staff", "parent"]}>
              <ParentReportView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/exercises"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentExercises />
            </ProtectedRoute>
          }
        />

        {/* Default Catch-all */}
        <Route
          path="*"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : isParent ? (
              <Navigate to="/parent/home" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
