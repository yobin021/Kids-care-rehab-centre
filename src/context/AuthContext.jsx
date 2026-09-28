"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authService } from "../services/authService";
import { childrenService } from "../services/childrenService";
import { db } from "../services/../lib/db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session + load live data from DB on startup
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }

    // Load children from Supabase or fallback
    childrenService.getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setChildrenList(data);
        }
      })
      .catch((err) => {
        console.warn("Using local children fallback:", err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Load staff from DB so counts and list are always accurate
    db.select("users", { order: { column: "name", ascending: true } })
      .then((rows) => {
        if (rows && rows.length > 0) {
          setStaffList(
            rows.map((d) => ({
              id: d.id,
              name: d.name,
              designation: d.designation,
              username: d.username,
              password: d.password_hash || "",
              isActive: d.is_active !== false
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Staff DB load fallback:", err.message);
      });
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = toasts.length > 0 ? toasts[toasts.length - 1] : null;
  const closeToast = () => {
    if (toast) removeToast(toast.id);
  };

  // Staff Login (Database authentication only)
  const loginStaff = async (username, password) => {
    try {
      const res = await authService.loginStaff(username, password);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, "success");
        return { success: true };
      }
      return { success: false, error: res.error || "Invalid username or password" };
    } catch (err) {
      console.error("Staff authentication error:", err.message);
      return { success: false, error: "Login failed. Please check your network connection." };
    }
  };

  // Staff Registration
  const registerStaff = async (name, username, password, designation) => {
    try {
      const res = await authService.registerStaff(name, username, password, designation);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome, ${res.user.name}! Your account has been created.`, "success");
        return { success: true };
      }
      return { success: false, error: res.error || "Registration failed" };
    } catch (err) {
      console.error("Staff registration error:", err.message);
      return { success: false, error: "Registration failed. Please check your network connection." };
    }
  };

  // Parent Login (Database authentication only)
  const loginParent = async (phone, password) => {
    try {
      const res = await authService.loginParent(phone, password);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome to ${res.user.childName || "your child"}'s therapy portal!`, "success");
        return { success: true };
      }
      return { success: false, error: res.error || "Invalid phone number or password" };
    } catch (err) {
      console.error("Parent authentication error:", err.message);
      return { success: false, error: "Login failed. Please check your network connection." };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    showToast("Logged out successfully.", "info");
  };

  const addRegisteredChild = (newChild) => {
    setChildrenList((prev) => [newChild, ...prev]);
  };

  const updateChildDetails = (childId, updatedFields) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updatedFields } : c))
    );
  };

  const setupParentPortal = (childId, phone, password) => {
    updateChildDetails(childId, {
      parent: {
        ...(childrenList.find((c) => c.id === childId)?.parent || {}),
        phone,
        portalActive: true,
        portalPassword: password
      }
    });
    showToast("Parent portal access activated successfully!", "success");
  };

  const resetParentPassword = (childId, newPassword) => {
    updateChildDetails(childId, {
      parent: {
        ...(childrenList.find((c) => c.id === childId)?.parent || {}),
        portalPassword: newPassword
      }
    });
    showToast("Parent password reset successfully!", "success");
  };

  const addStaffMember = (newStaff) => {
    setStaffList((prev) => [...prev, newStaff]);
    showToast(`Staff member ${newStaff.name} added.`, "success");
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isActive: !s.isActive } : s))
    );
    showToast("Staff status updated.", "info");
  };

  const resetStaffPassword = (staffId, newPassword) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, password: newPassword } : s))
    );
    showToast("Password reset successfully.", "success");
  };

  const value = {
    user,
    role: user?.role || null,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff" || user?.role === "admin",
    isParent: user?.role === "parent",
    loginStaff,
    registerStaff,
    loginParent,
    logout,
    childrenList,
    setChildrenList,
    staffList,
    addRegisteredChild,
    updateChildDetails,
    setupParentPortal,
    resetParentPassword,
    addStaffMember,
    toggleStaffStatus,
    resetStaffPassword,
    toast,
    toasts,
    showToast,
    closeToast,
    removeToast
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
