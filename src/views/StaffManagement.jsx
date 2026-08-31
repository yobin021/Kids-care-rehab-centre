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

export default function StaffManagement() {
  const { user, addStaffMember, resetStaffPassword, showToast } = useAuth();

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
        username: d.username
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
      const inserted = await db.insert("users", {
        name: newStaff.name,
        designation: newStaff.designation,
        username: newStaff.username,
        password_hash: newStaff.password,
        role: "staff",
        is_active: true
      });

      showToast(`Staff member ${inserted.name} added!`, "success");
      fetchStaff();
    } catch (err) {
      console.warn("Local add staff fallback:", err.message);
      addStaffMember({
        id: Date.now(),
        ...newStaff,
        isActive: true,
        childrenHandled: 0,
        sessionsThisMonth: 0
      });
      fetchStaff();
    }

    setNewStaff({ name: "", designation: "Therapist", username: "", password: "" });
    setShowAddModal(false);
  };

  const confirmDeleteStaff = (staffMember) => {
    setStaffToDelete(staffMember);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!staffToDelete) return;
    try {
      await db.remove("users", { id: staffToDelete.id });
      showToast(`Staff member ${staffToDelete.name} deleted.`, "info");
      fetchStaff();
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
      await db.update("users", { password_hash: newPassword }, { id: selectedStaff.id });
      showToast(`Password reset for ${selectedStaff.name}!`, "success");
      fetchStaff();
    } catch (err) {
      console.warn("Local reset password fallback:", err.message);
      resetStaffPassword(selectedStaff.id, newPassword);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data || []).map((s) => {
            const isOnline =
              (user?.id && user.id === s.id) ||
              (user?.username && s.username && user.username.toLowerCase() === s.username.toLowerCase());

            return (
              <Card key={s.id} padding="p-6" className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#2C2C2A]">{s.name}</h3>
                      <Badge label={s.designation} variant="blue" size="sm" />
                    </div>
                    <Badge label={isOnline ? "Active" : "Inactive"} variant={isOnline ? "green" : "gray"} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]/60 font-semibold">
                    <div>
                      <span className="text-[#9B9A96] block uppercase text-[10px]">Username</span>
                      <strong className="font-mono text-[#185FA5]">{s.username}</strong>
                    </div>
                    <div>
                      <span className="text-[#9B9A96] block uppercase text-[10px]">Password</span>
                      <strong className="font-mono text-[#2C2C2A]">••••••••</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#D3D1C7]/60 gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    icon={Key}
                    onClick={() => {
                      setSelectedStaff(s);
                      setShowResetModal(true);
                    }}
                  >
                    Reset Password
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => confirmDeleteStaff(s)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
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
