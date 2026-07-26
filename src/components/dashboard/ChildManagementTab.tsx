"use client";

import React, { useState } from "react";
import { useDashboard, Child } from "@/context/DashboardContext";
import { Search, UserCheck, Calendar, Phone, Heart, FileText, ChevronRight, Activity, Smile, Plus, Trash2, UserPlus } from "lucide-react";
import { Card, Badge, Dialog, Select } from "@/components/ui/ui";

export default function ChildManagementTab() {
  const { children, therapists, assignTherapistToChild, addChild, deleteChild } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [concernFilter, setConcernFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reassignChildId, setReassignChildId] = useState<string | null>(null);
  const [reassignTherapistId, setReassignTherapistId] = useState("");

  // Registration form state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    dob: "",
    gender: "Male" as "Male" | "Female" | "Other",
    parentName: "",
    whatsapp: "",
    address: "",
    schoolName: "",
    schoolClass: "",
    mainConcern: "",
    diagnosis: "",
    referredBy: "",
    assignedTherapistId: "",
    status: "Pending Review" as Child["status"],
  });

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters logic
  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConcern =
      concernFilter === "all" || child.mainConcern === concernFilter;

    const matchesStatus =
      statusFilter === "all" || child.status === statusFilter;

    return matchesSearch && matchesConcern && matchesStatus;
  });

  const getStatusVariant = (status: Child["status"]) => {
    switch (status) {
      case "Active":
        return "success";
      case "Pending Review":
        return "info";
      case "On Hold":
        return "warning";
      case "Discharged":
        return "secondary";
      default:
        return "primary";
    }
  };

  const getConcernOptions = () => {
    const concerns = Array.from(new Set(children.map((c) => c.mainConcern)));
    return [
      { label: "All Concerns", value: "all" },
      ...concerns.map((con) => ({ label: con, value: con })),
    ];
  };

  const getStatusOptions = () => [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "Active" },
    { label: "Pending Review", value: "Pending Review" },
    { label: "On Hold", value: "On Hold" },
    { label: "Discharged", value: "Discharged" },
  ];

  const getTherapistName = (id: string) => {
    const t = therapists.find((ther) => ther.id === id);
    return t ? t.name : "Unassigned";
  };

  const handleOpenDetail = (child: Child) => {
    setSelectedChild(child);
    setIsDetailOpen(true);
  };

  const handleReassignClick = (child: Child, e: React.MouseEvent) => {
    e.stopPropagation();
    setReassignChildId(child.id);
    setReassignTherapistId(child.assignedTherapistId);
  };

  const submitReassignment = () => {
    if (reassignChildId && reassignTherapistId) {
      assignTherapistToChild(reassignChildId, reassignTherapistId);
      if (selectedChild && selectedChild.id === reassignChildId) {
        setSelectedChild((prev) => prev ? { ...prev, assignedTherapistId: reassignTherapistId } : null);
      }
      setReassignChildId(null);
    }
  };

  const calcAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return Math.max(0, age);
  };

  const resetRegisterForm = () => {
    setRegisterForm({
      name: "",
      dob: "",
      gender: "Male",
      parentName: "",
      whatsapp: "",
      address: "",
      schoolName: "",
      schoolClass: "",
      mainConcern: "",
      diagnosis: "",
      referredBy: "",
      assignedTherapistId: therapists.length > 0 ? therapists[0].id : "",
      status: "Pending Review",
    });
  };

  const handleRegisterOpen = () => {
    resetRegisterForm();
    setIsRegisterOpen(true);
  };

  const handleRegisterSubmit = () => {
    if (!registerForm.name.trim() || !registerForm.dob || !registerForm.parentName.trim()) return;

    const today = new Date();
    const dateOfRegistration = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    addChild({
      name: registerForm.name.trim(),
      dob: registerForm.dob,
      age: calcAge(registerForm.dob),
      gender: registerForm.gender,
      parentName: registerForm.parentName.trim(),
      whatsapp: registerForm.whatsapp.trim(),
      address: registerForm.address.trim(),
      schoolName: registerForm.schoolName.trim(),
      schoolClass: registerForm.schoolClass.trim(),
      mainConcern: registerForm.mainConcern.trim() || "Not specified",
      diagnosis: registerForm.diagnosis.trim(),
      referredBy: registerForm.referredBy.trim() || "Self-referred",
      dateOfRegistration,
      assignedTherapistId: registerForm.assignedTherapistId || (therapists.length > 0 ? therapists[0].id : ""),
      status: registerForm.status,
    });

    setIsRegisterOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteChild(deleteConfirmId);
      setDeleteConfirmId(null);
      if (selectedChild && selectedChild.id === deleteConfirmId) {
        setIsDetailOpen(false);
        setSelectedChild(null);
      }
    }
  };

  const inputClass = "h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5";

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Card */}
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 pl-10.5 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Select
            value={concernFilter}
            onChange={setConcernFilter}
            options={getConcernOptions()}
            placeholder="Filter by Concern"
            className="w-full sm:w-48"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={getStatusOptions()}
            placeholder="Filter by Status"
            className="w-full sm:w-44"
          />
          <button
            onClick={handleRegisterOpen}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            Register New Child
          </button>
        </div>
      </Card>

      {/* Children Table */}
      <Card className="overflow-hidden p-0 border border-blue-50/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">ID & Child Name</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Main Concern</th>
                <th className="px-6 py-4">Assigned Therapist</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <UserPlus className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No children registered yet</p>
                      <p className="text-xs text-slate-300">Click &quot;Register New Child&quot; to add the first entry</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child) => (
                  <tr
                    key={child.id}
                    onClick={() => handleOpenDetail(child)}
                    className="group cursor-pointer hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {child.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">{child.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span>{child.age} yrs / {child.gender}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 truncate max-w-[150px] inline-block font-semibold">
                        {child.mainConcern}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{getTherapistName(child.assignedTherapistId)}</span>
                        <span className="text-[9px] text-slate-400">
                          {therapists.find((t) => t.id === child.assignedTherapistId)?.specialization || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(child.status)}>{child.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleReassignClick(child, e)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(child.id); }}
                          className="rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-rose-500 shadow-xs transition-colors hover:bg-rose-50 hover:text-rose-700"
                          title="Delete child"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDetail(child)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register New Child Dialog */}
      <Dialog
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Child"
        maxWidth="3xl"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-blue-600" />
              Child Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" placeholder="e.g. Aarav Patel" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input type="date" value={registerForm.dob} onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <Select value={registerForm.gender} onChange={(val) => setRegisterForm({ ...registerForm, gender: val as "Male" | "Female" | "Other" })} options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-emerald-600" />
              Parent / Guardian
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Parent Name *</label>
                <input type="text" placeholder="e.g. Vikram Patel" value={registerForm.parentName} onChange={(e) => setRegisterForm({ ...registerForm, parentName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input type="text" placeholder="+91 98860 12345" value={registerForm.whatsapp} onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" placeholder="Full address" value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" />
              School Details
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>School Name</label>
                <input type="text" placeholder="e.g. Little Bees Play School" value={registerForm.schoolName} onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Class / Grade</label>
                <input type="text" placeholder="e.g. LKG, 1st Standard" value={registerForm.schoolClass} onChange={(e) => setRegisterForm({ ...registerForm, schoolClass: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-600" />
              Clinical Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Main Concern</label>
                <input type="text" placeholder="e.g. Autism Spectrum Disorder" value={registerForm.mainConcern} onChange={(e) => setRegisterForm({ ...registerForm, mainConcern: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Diagnosis</label>
                <input type="text" placeholder="e.g. ASD (Level 1), Speech Delay" value={registerForm.diagnosis} onChange={(e) => setRegisterForm({ ...registerForm, diagnosis: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Referred By</label>
                <input type="text" placeholder="e.g. Dr. R. K. Mehta (Pediatrician)" value={registerForm.referredBy} onChange={(e) => setRegisterForm({ ...registerForm, referredBy: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Assign Therapist</label>
                <Select value={registerForm.assignedTherapistId} onChange={(val) => setRegisterForm({ ...registerForm, assignedTherapistId: val })} options={therapists.map((t) => ({ label: `${t.name} (${t.specialization})`, value: t.id }))} placeholder="Select Therapist" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsRegisterOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleRegisterSubmit} disabled={!registerForm.name.trim() || !registerForm.dob || !registerForm.parentName.trim()} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" />
              Register Child
            </button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion" maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50/50 border border-rose-100 p-4">
            <div className="rounded-xl bg-rose-100 p-2.5">
              <Trash2 className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">
                Remove {children.find((c) => c.id === deleteConfirmId)?.name || "this child"}?
              </p>
              <p className="text-[10px] text-rose-600 mt-0.5">
                This will also remove all related appointments, assessments, and escalations.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDeleteConfirmId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleDeleteConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/15 hover:bg-rose-700 transition-colors">Yes, Delete</button>
          </div>
        </div>
      </Dialog>

      {/* Child Detail Dialog Modal */}
      <Dialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedChild ? `${selectedChild.name} - Clinical Profile` : ""} maxWidth="3xl">
        {selectedChild && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Child Details</p>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{selectedChild.name}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedChild.id} | {selectedChild.gender}, {selectedChild.age} yrs</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Parent Info</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  <span>{selectedChild.parentName} ({selectedChild.whatsapp})</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{selectedChild.address}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Therapy Assignment</p>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{getTherapistName(selectedChild.assignedTherapistId)}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{therapists.find((t) => t.id === selectedChild.assignedTherapistId)?.specialization}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100">
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Diagnosis</h5>
                <p className="text-xs font-bold text-slate-800">{selectedChild.diagnosis || "No formal diagnosis recorded"}</p>
                <p className="text-[10px] text-slate-500 font-semibold">Primary Concern: {selectedChild.mainConcern}</p>
              </div>
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">School details</h5>
                <p className="text-xs font-semibold text-slate-700">{selectedChild.schoolName}</p>
                <p className="text-[10px] text-slate-500 font-medium">Class: {selectedChild.schoolClass}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                Active Therapy Plan
              </h4>
              {selectedChild.therapyPlan ? (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/10 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Short-Term Goals (3 Months)</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-0.5">{selectedChild.therapyPlan.shortTermGoals}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400">Long-Term Goals (6-12 Months)</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-0.5">{selectedChild.therapyPlan.longTermGoals}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-2">Assigned Exercise Protocol</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedChild.therapyPlan.exercises.map((ex, idx) => (
                        <div key={idx} className="flex flex-col bg-white p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{ex.name}</span>
                            <span className="rounded-full bg-slate-50 border px-1.5 py-0.5 text-[8px] font-bold text-slate-500 uppercase">{ex.duration}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 leading-normal">{ex.goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No therapy plan has been finalized for this child yet.</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-emerald-600" />
                Session History & Logs
              </h4>
              <div className="space-y-3">
                {selectedChild.sessionLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No daily session log entries recorded yet.</p>
                ) : (
                  selectedChild.sessionLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800">{log.date}</span>
                          <span className="text-[10px] text-slate-400 font-bold">|</span>
                          <span className="text-[10px] text-slate-500 font-bold">{log.therapistName} ({log.therapyType})</span>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold ${log.cooperationLevel === "Good" ? "bg-emerald-50 text-emerald-700" : log.cooperationLevel === "Moderate" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                          Cooperation: {log.cooperationLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        Behavior Profile: <span className="font-medium text-slate-500">{log.behaviorNotes}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                        Session Notes: &quot;{log.sessionNotes}&quot;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Reassign Therapist Dialog */}
      <Dialog isOpen={reassignChildId !== null} onClose={() => setReassignChildId(null)} title="Reassign Therapist Assignment" maxWidth="md">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select a specialized therapist below to assign this child&apos;s future sessions to.</p>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Therapist</label>
            <Select value={reassignTherapistId} onChange={setReassignTherapistId} options={therapists.map((t) => ({ label: `${t.name} (${t.specialization} - Load: ${t.workload}/${t.maxCapacity})`, value: t.id }))} placeholder="Select Therapist" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => setReassignChildId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={submitReassignment} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700">Save Reassignment</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
