"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Key, AlertTriangle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function StaffManagement() {
  const { staffList, addStaff, toggleStaffActive, resetStaffPassword, showToast } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("Therapist");
  const [username, setUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("staff123");
  const [newPassword, setNewPassword] = useState("staff123");

  const handleNameChange = (nameVal) => {
    setFullName(nameVal);
    if (nameVal && !username) {
      const suggested = nameVal.split(" ")[0].toLowerCase();
      setUsername(suggested);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !username || !tempPassword) return;

    addStaff({
      name: fullName,
      designation,
      username: username.toLowerCase(),
      password: tempPassword
    });

    showToast(`${fullName} has been added. Share login: ${username} / ${tempPassword}`);
    setFullName("");
    setUsername("");
    setShowAddModal(false);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetTarget || !newPassword) return;
    resetStaffPassword(resetTarget.id, newPassword);
    showToast(`Password reset for ${resetTarget.name}.`);
    setShowResetModal(false);
    setResetTarget(null);
  };

  const handleConfirmDeactivate = () => {
    if (deactivateTarget) {
      toggleStaffActive(deactivateTarget.id);
      setDeactivateTarget(null);
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Staff Management</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Manage clinical team members, login credentials, and account statuses.</p>
        </div>

        <Button icon={UserPlus} onClick={() => setShowAddModal(true)}>
          + Add New Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffList.map((s) => {
          const initials = s.name.split(" ").map((n) => n[0]).join("");

          return (
            <Card key={s.id} padding="p-6" className="space-y-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#2C2C2A]">{s.name}</h3>
                    <p className="text-[14px] text-[#9B9A96] font-medium">{s.designation}</p>
                  </div>
                </div>

                <Badge
                  label={s.isActive ? "Active" : "Inactive"}
                  variant={s.isActive ? "green" : "red"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#D3D1C7]/40">
                <div>
                  <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Username</span>
                  <strong className="font-mono text-[#185FA5]">{s.username}</strong>
                </div>
                <div>
                  <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Children Handled</span>
                  <strong className="text-[#2C2C2A]">{s.childrenHandled || 0}</strong>
                </div>
                <div>
                  <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Sessions This Month</span>
                  <strong className="text-[#0F6E56]">{s.sessionsThisMonth || 0}</strong>
                </div>
                <div>
                  <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Joined Date</span>
                  <strong className="text-[#5F5E5A]">{s.joinedDate}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D3D1C7]/60">
                <Button
                  variant="outlined"
                  size="sm"
                  icon={Key}
                  onClick={() => {
                    setResetTarget(s);
                    setShowResetModal(true);
                  }}
                >
                  Reset Password
                </Button>

                <label className="flex items-center gap-2 text-xs font-bold text-[#2C2C2A] cursor-pointer">
                  <span>{s.isActive ? "Active" : "Inactive"}</span>
                  <input
                    type="checkbox"
                    checked={s.isActive}
                    onChange={() => {
                      if (s.isActive) {
                        setDeactivateTarget(s);
                      } else {
                        toggleStaffActive(s.id);
                      }
                    }}
                    className="accent-[#185FA5] h-4 w-4"
                  />
                </label>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Staff Member">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Dr. Preethi Sen"
          />

          <Input
            label="Designation"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Senior Therapist"
          />

          <Input
            label="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. preethi"
          />

          <Input
            label="Temporary Password"
            type="text"
            required
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            helper="Staff can change this after first login"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title={`Reset Password — ${resetTarget?.name}`}>
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
          <Input
            label="New Password"
            type="text"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      </Modal>

      {deactivateTarget && (
        <Modal isOpen={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} title="Deactivate Staff Account">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#993C1D]">
              <AlertTriangle className="h-5 w-5" />
              <span>Deactivate {deactivateTarget.name}? They will no longer be able to log in.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
              <Button variant="outlined" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmDeactivate}>Deactivate</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
