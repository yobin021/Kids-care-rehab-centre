"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit3,
  PlusCircle,
  FileText,
  Copy,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList, setupParentPortal, resetParentPassword, isAdmin, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [portalPhone, setPortalPhone] = useState(child?.parent?.phone || "9841000001");
  const [portalPass, setPortalPass] = useState("12082021");
  const [confirmPass, setConfirmPass] = useState("12082021");
  const [showPass, setShowPass] = useState(false);

  const getProfileVariant = (profile) => {
    switch (profile) {
      case "A": return "purple";
      case "B": return "blue";
      case "C": return "amber";
      case "D": return "teal";
      case "E": return "coral";
      default: return "blue";
    }
  };

  const initials = child?.name ? child.name.split(" ").map((n) => n[0]).join("") : "CP";

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (portalPass !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }
    setupParentPortal(child.id, portalPhone, portalPass);
    setShowSetupModal(false);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (portalPass !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }
    resetParentPassword(child.id, portalPass);
    setShowResetModal(false);
  };

  const waMessage = `Hello ${child?.parent?.name},
Your child ${child?.name}'s therapy portal is ready.
Login: parents.kidscarerehabcenter.in
Phone: ${child?.parent?.phone}
Password: ${child?.parent?.portalPassword || portalPass}
You can view ${child?.name}'s report and daily exercises here.`;

  const copyWaMessage = () => {
    navigator.clipboard.writeText(waMessage);
    showToast("Message copied! Paste it into WhatsApp.", "success");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[20px] font-bold text-[#2C2C2A]">{child?.name}</h2>
              <span className="font-mono text-xs font-bold text-[#9B9A96] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#D3D1C7]">
                {child?.id}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge label={`Profile ${child?.profile}`} variant={getProfileVariant(child?.profile)} />
              <Badge label={child?.diagnosis} variant="gray" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outlined" size="sm" icon={Edit3} onClick={() => navigate(`/children/${child?.id}/edit`)}>
            Edit Child
          </Button>
          <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => navigate(`/assessment/new/${child?.id}`)}>
            + New Assessment
          </Button>
          {child?.reportsCount > 0 && (
            <Button variant="primary" size="sm" icon={FileText} onClick={() => navigate("/parent/report")}>
              View Latest Report
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "assessments", label: "Assessments" },
          { id: "reports", label: "Reports" },
          { id: "parent-access", label: "Parent Access" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id
                ? "bg-[#185FA5] text-white shadow-xs"
                : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6] hover:text-[#2C2C2A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              title="Child Information"
              action={
                <Button variant="ghost" size="sm" icon={Edit3} onClick={() => navigate(`/children/${child?.id}/edit`)}>
                  Edit
                </Button>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Full Name</span> <strong>{child?.name}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Child ID</span> <strong className="font-mono">{child?.id}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Date of Birth</span> <strong>{child?.dob}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Age</span> <strong>{child?.age}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Gender</span> <strong>{child?.gender}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Diagnosis</span> <strong>{child?.diagnosis}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">School</span> <strong>{child?.school}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Class</span> <strong>{child?.class || "N/A"}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Clinical Profile</span> <strong>Profile {child?.profile}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Registered Date</span> <strong>{child?.registeredDate}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Languages</span> <strong>{child?.languages}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Referred By</span> <strong>{child?.referredBy}</strong></div>
              </div>
            </Card>

            <Card
              title="Parent / Guardian Information"
              action={
                <Button variant="ghost" size="sm" icon={Edit3} onClick={() => navigate(`/children/${child?.id}/edit`)}>
                  Edit
                </Button>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Parent Name</span> <strong className="text-sm">{child?.parent?.name}</strong></div>
                  <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Relationship</span> <strong>{child?.parent?.relationship}</strong></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Phone Number</span> <strong className="font-mono text-[#185FA5]">{child?.parent?.phone}</strong></div>
                  <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Email Address</span> <strong>{child?.parent?.email || "N/A"}</strong></div>
                </div>

                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Address</span> <p className="text-[#5F5E5A] font-medium">{child?.parent?.address}</p></div>
              </div>
            </Card>
          </div>

          <Card title="Primary Concern">
            <p className="text-xs font-semibold text-[#2C2C2A] bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]/60 leading-relaxed">
              {child?.primaryConcern}
            </p>
          </Card>

          <Card title="School Feedback">
            <p className="text-xs font-medium text-[#5F5E5A] italic">
              &quot;{child?.schoolFeedback}&quot;
            </p>
          </Card>

          <Card title="Previous Therapy">
            <div className="flex items-center gap-2">
              <Badge label={child?.previousTherapy ? "Yes" : "No"} variant={child?.previousTherapy ? "blue" : "gray"} />
              {child?.previousTherapy && (
                <span className="text-xs text-[#5F5E5A] font-medium">{child?.previousTherapyDetails}</span>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-bold text-[#2C2C2A]">Clinical Assessments</h3>
            <Button icon={PlusCircle} size="sm" onClick={() => navigate(`/assessment/new/${child?.id}`)}>
              + New Assessment
            </Button>
          </div>

          <Card padding="p-5" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#185FA5]">Autism & Developmental Screening</span>
                <Badge label="Completed" variant="green" size="sm" />
              </div>
              <p className="text-xs text-[#5F5E5A]">Assessment Date: <strong>15 Nov 2025</strong> | Assessed By: <strong>Priya S</strong></p>
              <div className="flex items-center gap-2 pt-1">
                <Badge label="ISAA Score: 94 (Mild Autism)" variant="blue" size="sm" />
                <Badge label={`Profile ${child?.profile}`} variant={getProfileVariant(child?.profile)} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outlined" size="sm" onClick={() => navigate(`/assessment/${child?.id}/results`)}>
                View Results
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/assessment/${child?.id}/edit`)}>
                Edit Assessment
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3">
            <h3 className="text-sm font-bold text-[#2C2C2A]">Clinical & Parent Reports</h3>
          </div>

          {child?.reportsCount > 0 ? (
            <Card padding="p-5" className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/40 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#2C2C2A]">Comprehensive Developmental Report</h4>
                    <Badge label="Published" variant="green" size="sm" />
                  </div>
                  <p className="text-xs text-[#5F5E5A] mt-0.5">
                    Report Date: <strong>{child?.lastReportDate}</strong> | Generated By: <strong>Priya S</strong> | Published By: <strong>Dr. Radha Balachandar</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outlined" size="sm" onClick={() => navigate(`/assessment/${child?.id}/results`)}>
                  Therapist Report
                </Button>
                <Button variant="outlined" size="sm" onClick={() => navigate("/parent/report")}>
                  Parent Report Preview
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports generated yet"
              description="Fill out a clinical assessment first to generate reports."
            />
          )}
        </div>
      )}

      {activeTab === "parent-access" && (
        <div className="space-y-6">
          {child?.parent?.portalActive ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#3B6D11]/10 text-[#3B6D11] flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge label="Portal Active" variant="green" size="lg" />
                    <p className="text-xs text-[#5F5E5A] font-semibold mt-1">
                      {child?.parent?.name} has active access to {child?.name}&apos;s portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="sm" onClick={() => setShowResetModal(true)}>
                    Reset Password
                  </Button>
                  {isAdmin && (
                    <Button variant="danger" size="sm" onClick={() => showToast("Parent portal deactivated.", "info")}>
                      Deactivate Portal
                    </Button>
                  )}
                </div>
              </div>

              <Card title="Parent Credentials">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Login Phone</span>
                    <strong className="font-mono text-sm text-[#185FA5]">{child?.parent?.phone}</strong>
                  </div>

                  <div>
                    <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Password</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="font-mono text-sm text-[#2C2C2A]">
                        {showPass ? child?.parent?.portalPassword || "parent123" : "••••••••"}
                      </strong>
                      <button onClick={() => setShowPass(!showPass)} className="text-[#5F5E5A] hover:text-[#2C2C2A] cursor-pointer">
                        {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Portal URL</span>
                    <strong className="text-[#0F6E56]">parents.kidscarerehabcenter.in</strong>
                  </div>
                </div>
              </Card>

              <Card title="Share Details via WhatsApp">
                <div className="space-y-3">
                  <p className="text-xs text-[#5F5E5A] font-semibold">Share these login details with parent:</p>
                  <textarea
                    rows={6}
                    readOnly
                    value={waMessage}
                    className="w-full p-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[8px] text-xs font-mono text-[#2C2C2A] outline-none"
                  />
                  <Button icon={Copy} onClick={copyWaMessage}>
                    Copy Message
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#854F0B]/10 text-[#854F0B] flex items-center justify-center font-bold">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge label="Portal Not Set Up" variant="amber" size="lg" />
                    <p className="text-xs text-[#5F5E5A] font-semibold mt-1">
                      Parent portal login has not been created for {child?.parent?.name} yet.
                    </p>
                  </div>
                </div>

                <Button onClick={() => setShowSetupModal(true)}>
                  Set Up Parent Portal Access
                </Button>
              </div>

              <Card title="About Parent Portal Access">
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  The parent portal allows <strong>{child?.parent?.name}</strong> to view <strong>{child?.name}</strong>&apos;s report and daily exercises directly from their mobile phone.
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} title="Set Up Parent Portal Access">
        <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs font-semibold">
          <p className="text-xs text-[#5F5E5A]">Create login details for <strong>{child?.parent?.name}</strong>.</p>

          <Input
            label="Phone Number (Login ID)"
            type="tel"
            required
            value={portalPhone}
            onChange={(e) => setPortalPhone(e.target.value)}
          />

          <Input
            label="Set Password"
            type="text"
            required
            value={portalPass}
            onChange={(e) => setPortalPass(e.target.value)}
            helper="Use something simple that the parent can remember. Example: 12082021 (child's date of birth)"
          />

          <Input
            label="Confirm Password"
            type="text"
            required
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[8px] text-amber-900 space-y-1">
            <strong className="block text-xs text-amber-950 font-bold">After creating, share these details with parent:</strong>
            <p>Phone: <strong>{portalPhone}</strong></p>
            <p>Password: <strong>{portalPass}</strong></p>
            <p>URL: <strong>parents.kidscarerehabcenter.in</strong></p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowSetupModal(false)}>Cancel</Button>
            <Button type="submit">Create Login</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Parent Password">
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
          <Input
            label="New Password"
            type="text"
            required
            value={portalPass}
            onChange={(e) => setPortalPass(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="text"
            required
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit">Reset Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
