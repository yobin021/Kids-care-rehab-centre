"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockUsers, mockParentUsers, mockChildren, mockStaff } from "../data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [childrenList, setChildrenList] = useState(mockChildren);
  const [staffList, setStaffList] = useState(mockStaff);
  const [toasts, setToasts] = useState([]);

  // Restore auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("kcr_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user", err);
      }
    }
  }, []);

  const role = user ? user.role : null;
  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isParent = role === "parent";
  const canManageStaff = isAdmin;

  const showToast = (message, type = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (inputIdentifier, password, portalType = "staff") => {
    if (portalType === "staff") {
      const match = mockUsers.find(
        (u) => u.username.toLowerCase() === inputIdentifier.trim().toLowerCase() && u.password === password.trim()
      );
      if (match) {
        const userObj = { ...match };
        setUser(userObj);
        localStorage.setItem("kcr_user", JSON.stringify(userObj));
        return { success: true };
      }
    } else {
      // Parent portal login (match on phone and password)
      const cleanPhone = inputIdentifier.trim().replace(/\D/g, "");
      const match = mockParentUsers.find(
        (pu) => pu.phone.replace(/\D/g, "") === cleanPhone && pu.password === password.trim()
      );
      
      // Also check dynamically created parent logins on mockChildren
      const childMatch = childrenList.find(
        (c) => c.parent?.phone?.replace(/\D/g, "") === cleanPhone && c.parent?.portalPassword === password.trim() && c.parent?.portalActive
      );

      if (match || childMatch) {
        const parentUserObj = match || {
          id: Date.now(),
          phone: cleanPhone,
          password: password.trim(),
          role: "parent",
          name: childMatch.parent.name,
          childId: childMatch.id
        };
        setUser(parentUserObj);
        localStorage.setItem("kcr_user", JSON.stringify(parentUserObj));
        return { success: true };
      }
    }

    return {
      success: false,
      error: portalType === "staff"
        ? "Invalid username or password. Please try again."
        : "Incorrect phone number or password. Please check with your therapist."
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kcr_user");
  };

  // State Mutators
  const addChild = (childData) => {
    const nextNum = childrenList.length + 1;
    const newId = `KCR-2026-0${nextNum < 10 ? "0" + nextNum : nextNum}`;
    const newChild = {
      ...childData,
      id: newId,
      reportsCount: 0,
      lastReportDate: null
    };
    setChildrenList((prev) => [newChild, ...prev]);
    return newChild;
  };

  const updateChildDetails = (id, updatedFields) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const setupParentPortal = (childId, phone, password) => {
    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === childId
          ? {
              ...c,
              parent: {
                ...c.parent,
                phone: phone,
                portalActive: true,
                portalPassword: password
              }
            }
          : c
      )
    );
    showToast(`Parent portal access created. Share the login details with parent.`);
  };

  const resetParentPassword = (childId, newPassword) => {
    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === childId
          ? { ...c, parent: { ...c.parent, portalPassword: newPassword } }
          : c
      )
    );
    showToast("Password updated. Share new password with parent.");
  };

  const addStaff = (staffData) => {
    const newStaff = {
      ...staffData,
      id: staffList.length + 1,
      isActive: true,
      childrenHandled: 0,
      sessionsThisMonth: 0,
      joinedDate: new Date().toISOString().split("T")[0]
    };
    setStaffList((prev) => [...prev, newStaff]);
    showToast(`${staffData.name} has been added.`);
  };

  const toggleStaffActive = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isActive: !s.isActive } : s))
    );
    showToast("Staff status updated.");
  };

  const resetStaffPassword = (staffId, newPassword) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, password: newPassword } : s))
    );
    showToast("Password reset successfully.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isStaff,
        isParent,
        canManageStaff,
        login,
        logout,
        childrenList,
        staffList,
        toasts,
        showToast,
        removeToast,
        addChild,
        updateChildDetails,
        setupParentPortal,
        resetParentPassword,
        addStaff,
        toggleStaffActive,
        resetStaffPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
