"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  PlusCircle,
  Eye,
  FilePlus,
  Filter,
  CheckCircle2,
  School,
  Activity,
  Share2,
  UserCheck,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Trash2
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { childrenService } from "../services/childrenService";
import { childAssignmentService } from "../services/childAssignmentService";
import { THERAPY_CATEGORIES } from "../services/therapyService";
import { detectChildCategory } from "../utils/categoryHelpers";

export default function ChildrenList() {
  const navigate = useNavigate();
  const {
    user,
    isAdmin,
    childrenList,
    allChildrenList,
    staffList,
    assignments,
    forwardChildToStaff,
    assignChildToStaff,
    unassignChild,
    addStaffPermission,
    removeStaffPermission,
    showToast
  } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");

  // Forwarding / Assignment Modal State (Admin)
  const [forwardModalChild, setForwardModalChild] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [forwardNotes, setForwardNotes] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await childrenService.getAll();
      if (Array.isArray(res)) {
        if (isAdmin) {
          setData(res);
        } else {
          setData(childAssignmentService.filterChildrenForUser(res, user));
        }
      } else {
        setData(childrenList || []);
      }
    } catch (err) {
      console.warn("Using local fallback children:", err.message);
      setData(childrenList || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [childrenList, isAdmin, user]);

  const filteredChildren = useMemo(() => {
    const list = Array.isArray(data) ? data : (childrenList || []);
    return list.filter((child) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        child.name?.toLowerCase().includes(q) ||
        child.id?.toLowerCase().includes(q) ||
        child.school?.toLowerCase().includes(q) ||
        child.therapy_category?.toLowerCase().includes(q);

      // Program filter
      let matchesProgram = true;
      if (selectedFilter === "iep") matchesProgram = child.program_type === "iep";
      else if (selectedFilter !== "all") {
        matchesProgram = child.program_type === "therapy" && child.therapy_category === selectedFilter;
      }

      // Assignment status filter (Admin)
      let matchesAssignment = true;
      if (isAdmin && assignmentFilter !== "all") {
        const authorized = childAssignmentService.getAuthorizedStaff(child.id);
        const hasStaff = authorized.length > 0;
        if (assignmentFilter === "assigned") matchesAssignment = hasStaff;
        if (assignmentFilter === "unassigned") matchesAssignment = !hasStaff;
      }

      return matchesQuery && matchesProgram && matchesAssignment;
    });
  }, [data, childrenList, searchQuery, selectedFilter, assignmentFilter, isAdmin, assignments]);

  // Open Permissions Modal for a child
  const handleOpenForward = (child) => {
    setForwardModalChild(child);
    setSelectedStaffId("");
    setForwardNotes("");
  };

  const handleCloseForward = () => {
    setForwardModalChild(null);
    setSelectedStaffId("");
    setForwardNotes("");
  };

  const handleConfirmForward = async () => {
    if (!forwardModalChild) return;
    if (!selectedStaffId) {
      showToast("Please select a staff member to grant viewing access.", "danger");
      return;
    }

    const targetStaff = (staffList || []).find((s) => s.id === selectedStaffId);
    if (!targetStaff) {
      showToast("Selected staff member was not found.", "danger");
      return;
    }

    setIsForwarding(true);
    try {
      await addStaffPermission(forwardModalChild.id, targetStaff, {
        notes: forwardNotes,
        grantedBy: user?.name || "Admin"
      });
      showToast(`Viewing access granted to ${targetStaff.name} for ${forwardModalChild.name}!`, "success");
      setSelectedStaffId("");
      setForwardNotes("");
      fetchChildren();
    } catch (err) {
      console.error("Permission grant error:", err);
      showToast("Failed to grant staff access: " + err.message, "danger");
    } finally {
      setIsForwarding(false);
    }
  };

  const handleRemoveStaffFromList = async (staffId, staffName) => {
    if (!forwardModalChild) return;
    if (window.confirm(`Remove viewing access for ${staffName || "this staff member"}? They will no longer be able to view ${forwardModalChild.name}'s profile.`)) {
      try {
        await removeStaffPermission(forwardModalChild.id, staffId, {
          removedBy: user?.name || "Admin"
        });
        showToast(`Removed viewing access for ${staffName}.`, "info");
        fetchChildren();
      } catch (err) {
        showToast("Failed to remove staff access.", "danger");
      }
    }
  };

  const handleUnassignFromList = async () => {
    if (!forwardModalChild) return;
    if (window.confirm(`Remove staff assignment for ${forwardModalChild.name}? Profile will be visible to Admin only.`)) {
      try {
        await unassignChild(forwardModalChild.id);
        showToast("Child assignment removed. Now visible to Admin only.", "info");
        handleCloseForward();
        fetchChildren();
      } catch (err) {
        showToast("Failed to unassign child.", "danger");
      }
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* ═══ Header Section ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[20px] font-bold text-[#2C2C2A]">Children &amp; Students Registry</h2>
            {isAdmin ? (
              <Badge label="Admin Full Roster" variant="blue" size="sm" />
            ) : (
              <Badge label="Assigned Care Scope" variant="green" size="sm" />
            )}
          </div>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
            {isAdmin
              ? "All registered students across Special School and Clinical Therapy pathways. You can forward or assign any child profile to staff members."
              : "Showing students assigned to your clinical roster or assessed under your direct care. Access to other profiles is restricted."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button icon={PlusCircle} onClick={() => navigate("/children/new")}>
              Register New Child
            </Button>
          )}
        </div>
      </div>

      {/* ═══ Staff Scope Info Notice ═══ */}
      {!isAdmin && (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold">Staff Care Scope Active</p>
              <p className="text-emerald-700 text-[11px]">
                You have access to <strong>{filteredChildren.length}</strong> children currently assigned to you or assessed by you.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 bg-white/70 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0 self-start sm:self-auto">
            Role: {user?.designation || "Clinical Staff"}
          </div>
        </div>
      )}

      {/* ═══ Search & Filters ═══ */}
      <Card padding="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Search by name, ID, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-[#9B9A96] absolute left-3 top-3.5" />
            </div>

            {/* Assignment Status Filter (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar touch-pan-x flex-nowrap w-full sm:w-auto pb-1">
                <span className="text-[11px] font-bold text-[#5F5E5A] uppercase tracking-wider mr-1 shrink-0">Assignment:</span>
                {[
                  { id: "all", label: "All Statuses" },
                  { id: "assigned", label: "Assigned to Staff" },
                  { id: "unassigned", label: "Unassigned (Admin Only)" }
                ].map((af) => (
                  <button
                    key={af.id}
                    onClick={() => setAssignmentFilter(af.id)}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold cursor-pointer transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                      assignmentFilter === af.id
                        ? "bg-[#0F6E56] text-white"
                        : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
                    }`}
                  >
                    {af.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Program Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll no-scrollbar touch-pan-x flex-nowrap w-full pb-1 pt-1 border-t border-[#D3D1C7]/50">
            <span className="text-[11px] font-bold text-[#5F5E5A] uppercase tracking-wider mr-1 shrink-0">Program:</span>
            {[
              { id: "all", label: "All Students" },
              { id: "iep", label: "IEP (Special School)" },
              { id: "ASD", label: "Therapy: ASD" },
              { id: "ADHD", label: "Therapy: ADHD" },
              { id: "Developmental Delay", label: "Therapy: Dev Delay" },
              { id: "Learning Disability", label: "Therapy: Learning Dis." }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                  selectedFilter === f.id
                    ? "bg-[#185FA5] text-white shadow-xs"
                    : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ═══ Roster Table ═══ */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchChildren} />
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Child ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Program Pathway</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Parent Name &amp; Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {filteredChildren.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-xs text-[#5F5E5A]">
                      {!isAdmin ? (
                        <div className="max-w-md mx-auto space-y-2 py-4">
                          <Lock className="h-8 w-8 text-[#9B9A96] mx-auto mb-2 opacity-60" />
                          <p className="font-bold text-[#2C2C2A]">No Children Assigned to You Yet</p>
                          <p className="text-[#5F5E5A] text-[11px]">
                            Once the Admin forwards a child profile to your account or you perform an assessment, the student profile will automatically appear here.
                          </p>
                        </div>
                      ) : (
                        "No children match the selected filters. Click \"+ Register Child\" to add a new record."
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredChildren.map((c) => {
                    const isIep = c.program_type === "iep";
                    const ass = childAssignmentService.getAssignment(c.id);
                    const childCat = detectChildCategory(c);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[#185FA5]">{c.id}</td>
                        <td className="px-4 py-3 font-bold text-[#2C2C2A]">{c.name}</td>
                        <td className="px-4 py-3 text-[#5F5E5A]">{c.age || "—"} / {c.gender || "—"}</td>
                        <td className="px-4 py-3">
                          {isIep ? (
                            <Badge label="IEP Special School" variant="blue" size="sm" />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Badge label={c.therapy_category || "ASD"} variant="green" size="sm" />
                              <span className="text-[10px] text-[#5F5E5A] font-semibold">Therapy</span>
                            </div>
                          )}
                        </td>
                        {/* Permitted Staff Column */}
                        <td className="px-4 py-3">
                          {(() => {
                            const authorizedStaff = childAssignmentService.getAuthorizedStaff(c.id);
                            return authorizedStaff.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  {authorizedStaff.length === 1 ? authorizedStaff[0].name : `${authorizedStaff.length} Permitted`}
                                </span>
                                {authorizedStaff.length > 1 && (
                                  <span className="text-[10px] text-[#5F5E5A] truncate max-w-[140px]" title={authorizedStaff.map((s) => s.name).join(", ")}>
                                    {authorizedStaff.map((s) => s.name).join(", ")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 w-fit">
                                Admin Only
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-[#5F5E5A]">
                          <div>{c.parent?.name || "Parent"}</div>
                          <div className="text-[10px] font-mono text-[#9B9A96]">{c.parent?.phone || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Admin Staff Access Permissions */}
                            {isAdmin && (
                              <Button
                                variant="outlined"
                                size="sm"
                                icon={UserCheck}
                                onClick={() => handleOpenForward(c)}
                                className="text-[#0F6E56] border-[#0F6E56]/40 hover:bg-[#0F6E56]/10"
                                title="Manage Staff Viewing Access"
                              >
                                Permissions
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/children/${c.id}`)}>
                              Profile
                            </Button>
                            <Button variant="outlined" size="sm" icon={FilePlus} onClick={() => navigate(childCat.assessmentRoute)}>
                              + Assessment
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ═══ Mobile Card View ═══ */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredChildren.length === 0 ? (
              <Card padding="p-8">
                <p className="text-center text-xs text-[#5F5E5A]">
                  {!isAdmin ? (
                    "No children currently assigned to you. Once forwarded by the admin or assessed, they will appear here."
                  ) : (
                    "No children registered yet."
                  )}
                </p>
              </Card>
            ) : (
              filteredChildren.map((c) => {
                const childCat = detectChildCategory(c);
                const ass = childAssignmentService.getAssignment(c.id);

                return (
                  <Card key={c.id} padding="p-4" className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#2C2C2A]">{c.name}</h3>
                        <span className="font-mono text-xs text-[#185FA5]">{c.id}</span>
                      </div>
                      {childCat.isIep ? (
                        <Badge label="IEP Special School" variant="blue" size="sm" />
                      ) : (
                        <Badge label={childCat.categoryLabel} variant={childCat.badgeVariant} size="sm" />
                      )}
                    </div>

                    {/* Staff assignment pill */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#5F5E5A] font-medium">Access:</span>
                      {(() => {
                        const authorizedStaff = childAssignmentService.getAuthorizedStaff(c.id);
                        return authorizedStaff.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            {authorizedStaff.length === 1 ? authorizedStaff[0].name : `${authorizedStaff.length} Permitted Staff`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Admin Only
                          </span>
                        );
                      })()}
                    </div>

                    <div className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-2 pt-2 border-t border-[#D3D1C7]/60`}>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="sm"
                          fullWidth
                          icon={UserCheck}
                          onClick={() => handleOpenForward(c)}
                          className="text-[#0F6E56] border-[#0F6E56]/40 px-1 text-[11px] justify-center"
                          title="Manage Staff Access"
                        >
                          Perms
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="sm"
                        fullWidth
                        icon={Eye}
                        onClick={() => navigate(`/children/${c.id}`)}
                        className="justify-center text-[11px] px-1"
                      >
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        icon={FilePlus}
                        onClick={() => navigate(childCat.assessmentRoute)}
                        className="justify-center text-[11px] px-1"
                      >
                        Assess
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ═══ Admin Staff Access & Permissions Modal ═══ */}
      <Modal
        isOpen={Boolean(forwardModalChild)}
        onClose={handleCloseForward}
        title={forwardModalChild ? `Staff Profile Access Permissions — ${forwardModalChild.name}` : "Staff Access Permissions"}
      >
        {forwardModalChild && (
          <div className="space-y-4 text-xs text-[#2C2C2A]">
            <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#2C2C2A]">{forwardModalChild.name}</span>
                <span className="font-mono text-xs text-[#9B9A96]">{forwardModalChild.id}</span>
              </div>
              <p className="text-[#5F5E5A]">
                Program: <strong>{forwardModalChild.program_type === "iep" ? "IEP Special School" : (forwardModalChild.therapy_category || "Therapy")}</strong>
              </p>
              {(() => {
                const ass = childAssignmentService.getAssignment(forwardModalChild.id);
                return ass?.registeredByStaffName ? (
                  <p className="text-[#5F5E5A] text-[11px]">
                    Registered by: <strong>{ass.registeredByStaffName}</strong>
                  </p>
                ) : null;
              })()}
              <p className="text-[11px] text-[#5F5E5A] pt-1 border-t border-[#E5E5E0]">
                <strong>Policy:</strong> Only the registering staff member can view this profile initially. Other staff require permission from Admin. You can add or remove permitted staff below.
              </p>
            </div>

            {/* Currently Permitted Staff */}
            <div className="space-y-2">
              {(() => {
                const authorizedStaff = childAssignmentService.getAuthorizedStaff(forwardModalChild.id);
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#5F5E5A] uppercase tracking-wider">
                        Permitted Staff Members ({authorizedStaff.length})
                      </label>
                      <span className="text-[11px] text-[#9B9A96]">
                        {authorizedStaff.length === 0 ? "Admin Only" : "Can view profile"}
                      </span>
                    </div>

                    {authorizedStaff.length === 0 ? (
                      <div className="p-3 bg-amber-50 rounded-[8px] border border-amber-200 text-amber-800 text-center">
                        <p className="font-bold text-xs">No staff currently permitted</p>
                        <p className="text-[11px] text-amber-700">Only Administrator Dr. Radha can view this student's profile.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {authorizedStaff.map((staff) => (
                          <div
                            key={staff.id}
                            className="p-2.5 rounded-[8px] border border-[#D3D1C7] bg-white flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-bold text-xs">
                                {staff.name?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-xs text-[#2C2C2A]">{staff.name}</p>
                                  {staff.isRegistrar ? (
                                    <Badge label="Registrar" variant="purple" size="sm" />
                                  ) : (
                                    <Badge label="Permitted" variant="green" size="sm" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[#5F5E5A]">{staff.designation || "Clinical Specialist"}</p>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="outlined"
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs py-1 px-2 shrink-0"
                              icon={Trash2}
                              onClick={() => handleRemoveStaffFromList(staff.id, staff.name)}
                              title={`Remove ${staff.name}'s viewing access`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Grant Permission to New Staff */}
            <div className="pt-3 border-t border-[#D3D1C7] space-y-2.5">
              <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider">
                Grant Viewing Permission to Staff Member
              </label>

              {(() => {
                const currentAuth = childAssignmentService.getAuthorizedStaff(forwardModalChild.id);
                const unpermittedStaff = (staffList || [])
                  .filter((s) => s.isActive !== false)
                  .filter((s) => !currentAuth.some((a) => a.id === s.id));

                if (unpermittedStaff.length === 0) {
                  return (
                    <p className="text-[11px] text-[#5F5E5A] italic p-2 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                      All active staff members currently have viewing access.
                    </p>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {unpermittedStaff.map((staff) => {
                        const isSelected = selectedStaffId === staff.id;
                        return (
                          <div
                            key={staff.id}
                            onClick={() => setSelectedStaffId(staff.id)}
                            className={`p-2 rounded-[8px] border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-[#0F6E56] bg-[#0F6E56]/5 ring-1 ring-[#0F6E56]"
                                : "border-[#D3D1C7] hover:border-[#0F6E56]/50 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                  isSelected ? "bg-[#0F6E56] text-white" : "bg-[#F8F8F6] text-[#2C2C2A]"
                                }`}
                              >
                                {staff.name?.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-[#2C2C2A]">{staff.name}</p>
                                <p className="text-[10px] text-[#5F5E5A]">{staff.designation || "Clinical Specialist"}</p>
                              </div>
                            </div>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-[#0F6E56] bg-[#0F6E56] text-white" : "border-[#D3D1C7]"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">
                        Clinical Handover Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={forwardNotes}
                        onChange={(e) => setForwardNotes(e.target.value)}
                        placeholder="e.g. Granted for clinical observation..."
                        className="w-full p-2 rounded-[8px] border border-[#D3D1C7] text-xs outline-none focus:border-[#0F6E56]"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={UserCheck}
                      className="w-full bg-[#0F6E56] hover:bg-[#08503E] justify-center"
                      disabled={!selectedStaffId || isForwarding}
                      loading={isForwarding}
                      onClick={handleConfirmForward}
                    >
                      + Grant Viewing Access
                    </Button>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#D3D1C7]">
              <Button size="sm" variant="outlined" onClick={handleCloseForward}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
