"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Key } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { supabase } from "../lib/supabase";

export default function StaffManagement() {
  const { staffList: contextStaff, addStaffMember, toggleStaffStatus, resetStaffPassword, showToast } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

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
      const { data: resData, error: dbError } = await supabase
        .from("users")
        .select("*")
        .order("id");

      if (dbError) throw dbError;

      if (resData && resData.length > 0) {
        const mapped = resData.map((d) => ({
          id: d.id,
          name: d.name,
          designation: d.designation,
          username: d.username,
          password: d.password_hash || "staff123",
          isActive: d.is_active !== false,
          childrenHandled: 12,
          sessionsThisMonth: 18
        }));
        setData(mapped);
      } else {
        setData(contextStaff);
      }
    } catch (err) {
      console.warn("Staff fetch error fallback:", err.message);
      if (contextStaff && contextStaff.length > 0) {
        setData(contextStaff);
      } else {
        setError(err.message || "Failed to load staff list.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [contextStaff]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from("users")
        .insert({
          name: newStaff.name,
          designation: newStaff.designation,
          username: newStaff.username,
          password_hash: newStaff.password,
          role: "staff",
          is_active: true
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
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

  const handleToggle = async (staffMember) => {
    try {
      const nextStatus = !staffMember.isActive;
      const { error: toggleErr } = await supabase
        .from("users")
        .update({ is_active: nextStatus })
        .eq("id", staffMember.id);

      if (toggleErr) throw toggleErr;
      showToast("Staff status updated.", "info");
      fetchStaff();
    } catch (err) {
      console.warn("Local toggle staff fallback:", err.message);
      toggleStaffStatus(staffMember.id);
      fetchStaff();
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff || !newPassword) return;

    try {
      const { error: resetErr } = await supabase
        .from("users")
        .update({ password_hash: newPassword })
        .eq("id", selectedStaff.id);

      if (resetErr) throw resetErr;
      showToast("Password reset successfully!", "success");
      fetchStaff();
    } catch (err) {
      console.warn("Local reset password fallback:", err.message);
      resetStaffPassword(selectedStaff.id, newPassword);
      fetchStaff();
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
          {(data || []).map((s) => (
            <Card key={s.id} padding="p-6" className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#2C2C2A]">{s.name}</h3>
                    <Badge label={s.designation} variant="blue" size="sm" />
                  </div>
                  <Badge label={s.isActive ? "Active" : "Inactive"} variant={s.isActive ? "green" : "coral"} />
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
                  variant={s.isActive ? "danger" : "secondary"}
                  size="sm"
                  onClick={() => handleToggle(s)}
                >
                  {s.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}
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
    </div>
  );
}
