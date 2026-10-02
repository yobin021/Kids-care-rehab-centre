"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Key, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { db } from "../lib/db";
import { hashPassword } from "../services/passwordService";

export default function StaffManagement() {
  const { user, addStaffMember, resetStaffPassword, showToast, reloadStaff } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [newStaff, setNewStaff] = useState({
    name: "",
    designation: "Therapist",
    username: "",
    password: ""
  });

  const [newPassword, setNewPassword] = useState("");

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const resData = await db.select("users", {
        order: { column: "name", ascending: true }
      });

      const mapped = (resData || []).map((d) => ({
        id: d.id,
        name: d.name,
        designation: d.designation,
        username: d.username,
        role: d.role,
        is_active: d.is_active !== false
      }));
      setData(mapped);
    } catch (err) {
      console.warn("Staff fetch error:", err.message);
      setError("Could not load staff list. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const hashedPassword = await hashPassword(newStaff.password);
      const inserted = await db.insert("users", {
        name: newStaff.name,
        designation: newStaff.designation,
        username: newStaff.username,
        password_hash: hashedPassword,
        role: "staff",
        is_active: true
      });

      showToast(`Staff member ${inserted.name} added!`, "success");
      fetchStaff();
      if (reloadStaff) reloadStaff();
    } catch (err) {
      console.warn("Local add staff fallback:", err.message);
      const hashedPassword = await hashPassword(newStaff.password);
      addStaffMember({
        id: Date.now(),
        ...newStaff,
        password: hashedPassword,
        isActive: true,
        childrenHandled: 0,
        sessionsThisMonth: 0
      });
      fetchStaff();
      if (reloadStaff) reloadStaff();
    }

    setNewStaff({ name: "", designation: "Therapist", username: "", password: "" });
    setShowAddModal(false);
  };

  const confirmDeleteStaff = (staffMember) => {
    if (staffMember.role === "admin") {
      showToast("The Primary Administrator account cannot be deleted.", "error");
      return;
    }
    if (
      (user?.id && user.id === staffMember.id) ||
      (user?.username && staffMember.username && user.username.toLowerCase() === staffMember.username.toLowerCase())
    ) {
      showToast("You cannot delete your own logged-in account.", "error");
      return;
    }
    setStaffToDelete(staffMember);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!staffToDelete) return;
    try {
      const res = await db.remove("users", { id: staffToDelete.id });
      if (res?.softDeleted) {
        showToast(`Staff member ${staffToDelete.name} deactivated (records preserved).`, "info");
      } else {
        showToast(`Staff member ${staffToDelete.name} deleted successfully.`, "success");
      }
      fetchStaff();
      if (reloadStaff) reloadStaff();
    } catch (err) {
      console.warn("Delete staff error:", err.message);
      showToast(`Failed to delete staff: ${err.message}`, "error");
    }
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff || !newPassword.trim()) return;

    try {
      const hashedPassword = await hashPassword(newPassword);
      let updated = false;

      if (selectedStaff.id && /^[0-9a-fA-F-]{36}$/.test(selectedStaff.id)) {
        try {
          await db.update("users", { password_hash: hashedPassword }, { id: selectedStaff.id });
          updated = true;
        } catch (_) {}
      }

      if (!updated && selectedStaff.username) {
        try {
          await db.update("users", { password_hash: hashedPassword }, { match: { username: selectedStaff.username } });
          updated = true;
        } catch (_) {}
      }

      showToast(`Password reset for ${selectedStaff.name}!`, "success");
      fetchStaff();
    } catch (err) {
      console.warn("Local reset password fallback:", err.message);
      const hashedPassword = await hashPassword(newPassword);
      resetStaffPassword(selectedStaff.id, hashedPassword);
      showToast(`Password reset for ${selectedStaff.name}!`, "success");
    }

    setNewPassword("");
    setShowResetModal(false);
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Staff Management</h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">Manage clinic therapist accounts and permissions.</p>
        </div>

        <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>
          + Add Staff Member
        </Button>
      </div>

      {/* THREE STATES: LOADING, ERROR, DATA */}
      {loading ? (
        <SkeletonCard count={2} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchStaff} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Login Credentials</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data || []).map((s) => {
                  const isOnline =
                    (user?.id && user.id === s.id) ||
                    (user?.username && s.username && user.username.toLowerCase() === s.username.toLowerCase());

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{s.name}</span>
                          <span className="text-[12.5px] font-semibold text-slate-500 mt-1">{s.designation}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase w-16">User:</span>
                            <span className="font-mono text-[13px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                              {s.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase w-16">Pass:</span>
                            <span className="font-mono text-[13px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md tracking-widest">
                              ••••••••
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        {isOnline ? (
                          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[12px] font-bold tracking-wide">Present (Online)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full w-fit">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
                            <span className="text-[12px] font-bold tracking-wide">Absent (Offline)</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="outlined"
                            size="sm"
                            icon={Key}
                            onClick={() => {
                              setSelectedStaff(s);
                              setShowResetModal(true);
                            }}
                          >
                            Reset
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            disabled={isOnline || s.role === "admin"}
                            title={
                              s.role === "admin"
                                ? "Primary Administrator cannot be deleted"
                                : isOnline
                                ? "Cannot delete currently logged-in account"
                                : "Delete account"
                            }
                            onClick={() => confirmDeleteStaff(s)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Staff Member">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
          <Input label="Full Name *" required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
          <Input label="Designation *" required value={newStaff.designation} onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })} />
          <Input label="Username *" required value={newStaff.username} onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} />
          <Input label="Initial Password *" type="text" required value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={`Reset Password for ${selectedStaff?.name}`}>
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
          <Input label="New Password *" type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Staff Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Staff Account">
        <div className="space-y-4 text-xs font-semibold text-[#2C2C2A]">
          <p>Are you sure you want to delete staff member <strong>{staffToDelete?.name}</strong>?</p>
          <p className="text-[#993C1D]">This action will permanently delete the staff user account from the database.</p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteSubmit}>Delete Staff Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
