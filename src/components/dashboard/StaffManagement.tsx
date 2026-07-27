"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { UserPlus, Shield, Users, Calendar, Key, Edit, X } from "lucide-react";

export default function StaffManagement() {
  const { staffMembers, toggleStaffStatus, addStaffMember, showToast } = useDashboard();
  const [showModal, setShowModal] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [designation, setDesignation] = useState("Occupational Therapist");
  const [tempPassword, setTempPassword] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !tempPassword) return;

    addStaffMember({
      name: fullName,
      username,
      designation,
      active: true
    });

    setFullName("");
    setUsername("");
    setTempPassword("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C2C2A]">Staff Management</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Manage clinical team members, login access, and patient allocations.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Add New Staff</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-black text-sm">
                  {staff.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#2C2C2A]">{staff.name}</h3>
                  <p className="text-xs font-semibold text-[#185FA5]">{staff.designation}</p>
                  <span className="text-[11px] font-mono text-[#5F5E5A]">Username: {staff.username}</span>
                </div>
              </div>

              {/* Status Toggle */}
              <button
                type="button"
                onClick={() => toggleStaffStatus(staff.id)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-colors cursor-pointer border ${
                  staff.active
                    ? "bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/30"
                    : "bg-slate-100 text-[#5F5E5A] border-slate-300"
                }`}
              >
                {staff.active ? "Active" : "Inactive"}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D3D1C7]/40 text-xs">
              <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/50 flex items-center gap-3">
                <Users className="h-5 w-5 text-[#185FA5]" />
                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Assigned Children</span>
                  <span className="text-base font-black text-[#2C2C2A]">{staff.assignedChildrenCount}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/50 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#0F6E56]" />
                <div>
                  <span className="text-[10px] font-bold text-[#5F5E5A] block uppercase">Sessions This Month</span>
                  <span className="text-base font-black text-[#2C2C2A]">{staff.sessionsThisMonth}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => showToast(`Editing staff: ${staff.name}`, "info")}
                className="flex-1 py-2 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-[#5F5E5A]" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => showToast(`Password reset link sent for ${staff.username}`, "success")}
                className="flex-1 py-2 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] text-xs font-bold rounded-[8px] border border-[#D3D1C7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5 text-[#5F5E5A]" />
                <span>Reset Password</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NEW STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] p-6 max-w-md w-full border border-[#D3D1C7] shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
              <h3 className="text-base font-extrabold text-[#185FA5]">Add New Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Preethi Sen"
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-semibold text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. preethi"
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-semibold text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-bold text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5]"
                >
                  <option value="Senior Therapist & Special Educator">Senior Therapist & Special Educator</option>
                  <option value="Occupational Therapist">Occupational Therapist</option>
                  <option value="Speech Therapist">Speech Therapist</option>
                  <option value="Behavioral Therapist">Behavioral Therapist</option>
                  <option value="Physiotherapist">Physiotherapist</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2C2C2A] mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Enter temp password"
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] font-semibold text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] font-bold rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white font-bold rounded-[8px]"
                >
                  Create Account
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
