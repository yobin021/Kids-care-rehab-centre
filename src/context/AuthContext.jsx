"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { mockUsers, mockParentUsers, mockStaff } from "../data/mockData";
import { authService } from "../services/authService";
import { childrenService } from "../services/childrenService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [staffList, setStaffList] = useState(mockStaff);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);

  // Method 2: Always start with user = null so app opens on Login page
  useEffect(() => {
    authService.logout(); // Clear any saved localStorage session
    setUser(null);

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

  // Staff Login
  const loginStaff = async (username, password) => {
    try {
      const res = await authService.loginStaff(username, password);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, "success");
        return { success: true };
      }
    } catch (err) {
      console.warn("Supabase staff auth fallback:", err.message);
    }

    // Fallback to local mock users
    const foundUser = mockUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const sessionUser = {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        role: foundUser.role,
        designation: foundUser.designation
      };
      setUser(sessionUser);
      showToast(`Welcome back, ${foundUser.name}!`, "success");
      return { success: true };
    }

    return { success: false, error: "Invalid username or password" };
  };

  // Parent Login
  const loginParent = async (phone, password) => {
    try {
      const res = await authService.loginParent(phone, password);
      if (res.success && res.user) {
        setUser(res.user);
        showToast(`Welcome to ${res.user.childName || "your child"}'s therapy portal!`, "success");
        return { success: true };
      }
    } catch (err) {
      console.warn("Supabase parent auth fallback:", err.message);
    }

    // Fallback to local mock parent users
    const foundParent = mockParentUsers.find(
      (p) => p.phone === phone && p.password === password
    );

    if (foundParent) {
      const sessionUser = {
        id: foundParent.id,
        name: foundParent.name,
        phone: foundParent.phone,
        role: "parent",
        childId: foundParent.childId
      };
      setUser(sessionUser);
      showToast(`Welcome, ${foundParent.name}!`, "success");
      return { success: true };
    }

    return { success: false, error: "Invalid phone number or password" };
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
