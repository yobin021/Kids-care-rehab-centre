"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { authService } from "../services/authService";
import { childrenService } from "../services/childrenService";
import { childAssignmentService } from "../services/childAssignmentService";
import { hashPassword, isHashed } from "../services/passwordService";
import { db } from "../lib/db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allChildrenList, setAllChildrenList] = useState([]);
  const [assignments, setAssignments] = useState(() => childAssignmentService.getAllAssignments());
  const [staffList, setStaffList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to assignment updates
  useEffect(() => {
    return childAssignmentService.subscribe((updated) => {
      setAssignments({ ...updated });
    });
  }, []);

  const reloadStaff = useCallback(async () => {
    try {
      const rows = await db.select("users", { order: { column: "name", ascending: true } });
      if (Array.isArray(rows)) {
        setStaffList(
          rows
            .filter((d) => d.role !== "admin")
            .map((d) => ({
              id: d.id,
              name: d.name,
              designation: d.designation,
              username: d.username,
              password: d.password_hash || "",
              isActive: d.is_active !== false
            }))
        );
      }
    } catch (err) {
      console.warn("Staff reload notice:", err.message);
    }
  }, []);

  // Restore authenticated session on application startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kcr_user") || sessionStorage.getItem("kcr_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) {
            setUser(parsed);
          }
        }
      } catch (_) {}
    }

    // Load children from Supabase
    childrenService.getAll()
      .then((data) => {
        if (Array.isArray(data)) {
          setAllChildrenList(data);
        }
      })
      .catch((err) => {
        console.warn("Children load notice:", err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Load staff from DB so counts and list are always accurate (excluding admin)
    reloadStaff();
  }, [reloadStaff]);

  // Dynamically filter children:
  // Admin sees ALL children.
  // Staff sees ONLY children assigned to them or assessed by them.
  const childrenList = useMemo(() => {
    if (!user || user.role === "admin") return allChildrenList;
    return childAssignmentService.filterChildrenForUser(allChildrenList, user);
  }, [allChildrenList, user, assignments]);

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
        if (typeof window !== "undefined") {
          localStorage.setItem("kcr_user", JSON.stringify(res.user));
        }
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
        if (typeof window !== "undefined") {
          localStorage.setItem("kcr_user", JSON.stringify(res.user));
        }
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
        if (typeof window !== "undefined") {
          localStorage.setItem("kcr_user", JSON.stringify(res.user));
        }
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

  const addRegisteredChild = useCallback((newChild) => {
    if (newChild && newChild.id && user) {
      childAssignmentService.recordStaffRegistration(newChild.id, user);
      setAssignments(childAssignmentService.getAllAssignments());
    }
    setAllChildrenList((prev) => [newChild, ...prev]);
  }, [user]);

  const updateChildDetails = (childId, updatedFields) => {
    setAllChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updatedFields } : c))
    );
  };

  const addStaffPermission = useCallback(async (childId, staffMember, options) => {
    const res = await childAssignmentService.addStaffPermission(childId, staffMember, options);
    setAssignments(childAssignmentService.getAllAssignments());
    return res;
  }, []);

  const removeStaffPermission = useCallback(async (childId, staffId, options) => {
    const res = await childAssignmentService.removeStaffPermission(childId, staffId, options);
    setAssignments(childAssignmentService.getAllAssignments());
    return res;
  }, []);

  const getAuthorizedStaff = useCallback((childId) => {
    return childAssignmentService.getAuthorizedStaff(childId);
  }, [assignments]);

  const assignChildToStaff = useCallback(async (childId, staffMember, options) => {
    const res = await childAssignmentService.assignChild(childId, staffMember, options);
    setAssignments(childAssignmentService.getAllAssignments());
    return res;
  }, []);

  const forwardChildToStaff = useCallback(async (childId, staffMember, options) => {
    const res = await childAssignmentService.forwardChild(childId, staffMember, options);
    setAssignments(childAssignmentService.getAllAssignments());
    return res;
  }, []);

  const unassignChild = useCallback(async (childId) => {
    const res = await childAssignmentService.unassignChild(childId);
    setAssignments(childAssignmentService.getAllAssignments());
    return res;
  }, []);

  const isChildAccessible = useCallback((childId, childData = null) => {
    return childAssignmentService.canStaffAccess(childId, user, childData);
  }, [user, assignments]);

  const setupParentPortal = async (childId, phone, password) => {
    const hashedPassword = isHashed(password) ? password : await hashPassword(password);
    updateChildDetails(childId, {
      parent: {
        ...(allChildrenList.find((c) => c.id === childId)?.parent || {}),
        phone,
        portalActive: true,
        portalPassword: hashedPassword
      }
    });
    showToast("Parent portal access activated successfully!", "success");
  };

  const resetParentPassword = async (childId, newPassword) => {
    const hashedPassword = isHashed(newPassword) ? newPassword : await hashPassword(newPassword);
    updateChildDetails(childId, {
      parent: {
        ...(allChildrenList.find((c) => c.id === childId)?.parent || {}),
        portalPassword: hashedPassword
      }
    });
    showToast("Parent password reset successfully!", "success");
  };

  const addStaffMember = async (newStaff) => {
    const hashedPassword = isHashed(newStaff.password) ? newStaff.password : await hashPassword(newStaff.password);
    setStaffList((prev) => [...prev, { ...newStaff, password: hashedPassword }]);
    showToast(`Staff member ${newStaff.name} added.`, "success");
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, isActive: !s.isActive } : s))
    );
    showToast("Staff status updated.", "info");
  };

  const resetStaffPassword = async (staffId, newPassword) => {
    const hashedPassword = isHashed(newPassword) ? newPassword : await hashPassword(newPassword);
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, password: hashedPassword } : s))
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
    allChildrenList,
    assignments,
    assignChildToStaff,
    forwardChildToStaff,
    unassignChild,
    addStaffPermission,
    removeStaffPermission,
    getAuthorizedStaff,
    recordStaffRegistration: childAssignmentService.recordStaffRegistration,
    isChildAccessible,
    setChildrenList: setAllChildrenList,
    staffList,
    reloadStaff,
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
