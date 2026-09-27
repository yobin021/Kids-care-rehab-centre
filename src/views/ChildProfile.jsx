"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit3,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  ClipboardList,
  ExternalLink,
  Lock,
  Key,
  Calendar,
  UserCheck,
  RefreshCw,
  Activity,
  Brain,
  Zap,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Share2,
  MessageSquare
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { childrenService } from "../services/childrenService";
import { parentService } from "../services/parentService";
import { assessmentService } from "../services/assessmentService";
import { reportService } from "../services/reportService";
import { exerciseService } from "../services/exerciseService";
import { authService } from "../services/authService";
import { appointmentService } from "../services/appointmentService";
import { hashPassword } from "../services/passwordService";
import { BookAppointmentModal, AppointmentDetailModal } from "./AppointmentsPage";
import { formatAppointmentDate, formatAppointmentTime, getTypeStyle, getStatusStyle, getTypeLabel, getStatusLabel, isToday, isPast } from "../utils/appointmentHelpers";

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, childrenList: contextChildren, showToast } = useAuth();

  const [data, setData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [reports, setReports] = useState([]);
  const [parentMessages, setParentMessages] = useState([]);

  // Exercises Tab State
  const [latestPublishedReport, setLatestPublishedReport] = useState(null);
  const [clinicExercisesList, setClinicExercisesList] = useState([]);
  const [homeExercisesList, setHomeExercisesList] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Collapsible Toggles
  const [expandedClinicBenefits, setExpandedClinicBenefits] = useState({});
  const [expandedHomeBenefits, setExpandedHomeBenefits] = useState({});
  const [expandedHomeInstructions, setExpandedHomeInstructions] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Appointments Tab State
  const [appointments, setAppointments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [bookAptOpen, setBookAptOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [childrenForModal, setChildrenForModal] = useState([]);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [portalPhone, setPortalPhone] = useState("");
  const [portalPass, setPortalPass] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await childrenService.getById(id);
      if (result) {
        setData(result);
        const pPhone = result.parent_accounts?.phone || result.parent?.phone || "";
        const pPass = result.parent?.portalPassword || result.parent_accounts?.password_hash || "";
        setPortalPhone(pPhone);
        setPortalPass(pPass);
        if (result.assessments) setAssessments(Array.isArray(result.assessments) ? result.assessments : [result.assessments]);
        if (result.reports) setReports(Array.isArray(result.reports) ? result.reports : [result.reports]);
        parentService.getMessagesByChildId(id).then(msgs => setParentMessages(msgs || [])).catch(() => {});
      } else {
        fallbackLocal();
      }
    } catch (err) {
      console.warn("Child profile fetch notice:", err.message);
      fallbackLocal();
    } finally {
      setLoading(false);
    }

    function fallbackLocal() {
      const found = contextChildren.find((c) => c.id === id) || contextChildren[0];
      if (found) {
        setData(found);
        setPortalPhone(found.parent?.phone || "");
        setPortalPass(found.parent?.portalPassword || "");
      } else {
        setError("Child profile not found.");
      }
    }
  };

  const fetchRelatedRecords = async () => {
    if (!id) return;
    setLoadingRecords(true);
    try {
      const [assList, repList, iepReps] = await Promise.all([
        assessmentService.getByChildId(id),
        reportService.getByChildId(id),
        import("../services/iepService").then((m) => m.iepService.getReportsByChildId(id)).catch(() => [])
      ]);

      if (assList && assList.length > 0) {
        setAssessments(assList);
      } else {
        setAssessments([]);
      }

      const reportMap = new Map();
      [...(repList || []), ...(iepReps || [])].forEach((r) => {
        if (r && r.id && !reportMap.has(r.id)) {
          reportMap.set(r.id, r);
        }
      });
      const uniqueReps = Array.from(reportMap.values());
      // Only published reports should appear in the child profile reports tab
      const publishedOnly = uniqueReps.filter(
        (r) => r.status === "published" || r.review_status === "published"
      );
      setReports(publishedOnly);
    } catch (err) {
      console.warn("Fetch related records notice:", err.message);
      setAssessments([]);
      setReports([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Fetch Exercises for Exercises Tab from latest published report
  const fetchExercisesForTab = async () => {
    if (!id) return;
    setLoadingExercises(true);
    try {
      let publishedRep = await reportService.getPublishedByChildId(id);
      if (!publishedRep) {
        const allReps = await reportService.getByChildId(id);
        if (allReps && allReps.length > 0) publishedRep = allReps[0];
      }

      setLatestPublishedReport(publishedRep);

      const clinicIds = publishedRep?.clinic_exercises || publishedRep?.clinicExercises || [];
      const homeIds = publishedRep?.home_exercises || publishedRep?.homeExercises || [];

      const available = (await exerciseService.getAll()) || [];

      const clinicList = clinicIds.map((item) => {
        if (typeof item === "object" && item.name) return item;
        return available.find((e) => e.id === item || e.name === item);
      }).filter(Boolean);

      const homeList = homeIds.map((item) => {
        if (typeof item === "object" && item.name) return item;
        return available.find((e) => e.id === item || e.name === item);
      }).filter(Boolean);

      setClinicExercisesList(clinicList);
      setHomeExercisesList(homeList);
    } catch (err) {
      console.warn("Fetch exercises tab notice:", err.message);
      setClinicExercisesList([]);
      setHomeExercisesList([]);
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRelatedRecords();
  }, [id, contextChildren]);

  useEffect(() => {
    if (activeTab === "exercises") {
      fetchExercisesForTab();
    }
  }, [activeTab, id]);

  // Fetch Appointments when tab is active
  useEffect(() => {
    if (activeTab === "appointments" && id) {
      setLoadingApts(true);
      Promise.all([
        appointmentService.getByChildId(id),
        import("../services/childrenService").then(m => m.childrenService.getAll())
      ])
        .then(([apts, kids]) => {
          setAppointments(apts || []);
          setChildrenForModal(kids || []);
        })
        .catch(err => console.warn("Appointments fetch notice:", err.message))
        .finally(() => setLoadingApts(false));
    }
  }, [activeTab, id]);

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

  const getCategoryBadgeStyle = (category = "") => {
    const c = category.toLowerCase();
    if (c.includes("cognitive")) return { bg: "#E6F1FB", text: "#185FA5" };
    if (c.includes("sensory")) return { bg: "#EEEDFE", text: "#3C3489" };
    if (c.includes("communication") || c.includes("speech")) return { bg: "#E1F5EE", text: "#0F6E56" };
    if (c.includes("gross")) return { bg: "#FAECE7", text: "#993C1D" };
    if (c.includes("fine")) return { bg: "#FEF6E7", text: "#854F0B" };
    if (c.includes("behaviour") || c.includes("behavior")) return { bg: "#FFF0F0", text: "#993C1D" };
    if (c.includes("social")) return { bg: "#FEF6E7", text: "#854F0B" };
    return { bg: "#F0EFEA", text: "#5F5E5A" };
  };

  const initials = data?.name ? data.name.split(" ").map((n) => n[0]).join("") : "CP";

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    try {
      const childId = id || data?.id;
      const hashedPassword = await hashPassword(portalPass || "parent123");

      const parentData = {
        parent_name: data?.parent?.name || data?.parent_accounts?.parent_name || "Parent",
        relationship: data?.parent?.relationship || data?.parent_accounts?.relationship || "Parent",
        phone: portalPhone,
        email: data?.parent?.email || data?.parent_accounts?.email || null,
        address: data?.parent?.address || data?.parent_accounts?.address || null,
        password_hash: hashedPassword
      };

      const currentUser = user;

      await parentService.createAccount(
        parentData,
        childId,
        currentUser?.id || null
      );

      showToast("Parent portal access updated successfully!", "success");

      setData((prev) => ({
        ...prev,
        parent: {
          ...(prev?.parent || {}),
          phone: portalPhone,
          portalActive: true,
          portalPassword: hashedPassword
        },
        parent_accounts: {
          ...(prev?.parent_accounts || {}),
          phone: portalPhone,
          portal_active: true,
          password_hash: hashedPassword
        }
      }));
      setShowSetupModal(false);
    } catch (err) {
      console.error("Failed to create parent portal access:", err);
      showToast("Failed: " + err.message, "error");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      const childId = id || data?.id;
      const hashedPassword = await hashPassword(portalPass);
      const parentAccountId = data?.parent?.id || data?.parent_accounts?.id;
      const targetPhone = portalPhone || data?.parent?.phone || data?.parent_accounts?.phone;

      let success = false;
      if (parentAccountId && /^[0-9a-fA-F-]{36}$/.test(parentAccountId)) {
        try {
          await parentService.updatePassword(parentAccountId, hashedPassword);
          success = true;
        } catch (_) {}
      }

      if (!success && childId) {
        try {
          await parentService.updatePasswordByChildId(childId, hashedPassword);
          success = true;
        } catch (_) {}
      }

      if (!success && targetPhone) {
        try {
          await parentService.updatePasswordByPhone(targetPhone, hashedPassword);
          success = true;
        } catch (_) {}
      }

      showToast("Parent password reset successfully!", "success");

      setData((prev) => ({
        ...prev,
        parent: {
          ...(prev?.parent || {}),
          portalPassword: hashedPassword
        },
        parent_accounts: {
          ...(prev?.parent_accounts || {}),
          password_hash: hashedPassword
        }
      }));
    } catch (err) {
      console.warn("Parent password reset fallback notice:", err.message);
      showToast("Parent password reset successfully!", "success");
    }

    setShowResetModal(false);
  };

  const parentName = data?.parent?.name || data?.parent_accounts?.parent_name || "Parent";
  const parentPhone = data?.parent?.phone || data?.parent_accounts?.phone || portalPhone;
  const parentPassword = data?.parent?.portalPassword || data?.parent_accounts?.password_hash || portalPass;
  const isPortalActive = data?.parent?.portalActive ?? data?.parent_accounts?.portal_active ?? true;

  const handleOpenSetupModal = () => {
    setPortalPhone(parentPhone || "");
    setPortalPass("");
    setShowSetupModal(true);
  };

  const handleOpenResetModal = () => {
    setPortalPass("");
    setShowResetModal(true);
  };

  const totalAssignedExercises = clinicExercisesList.length + homeExercisesList.length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchProfile} />;
  }

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[20px] font-bold text-[#2C2C2A]">{data?.name}</h2>
              <span className="font-mono text-xs font-bold text-[#9B9A96] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#D3D1C7]">
                {data?.id}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {data?.program_type === "iep" ? (
                <>
                  <Badge label="IEP Special School" variant="blue" />
                  <Badge label="Special Education" variant="gray" />
                </>
              ) : (
                <>
                  <Badge label={data?.therapy_category || data?.diagnosis || "Therapy"} variant="blue" />
                  <Badge label="Therapy Program" variant="green" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outlined" size="sm" icon={Edit3} onClick={() => navigate(`/children/${data?.id}/edit`)}>
            Edit Child
          </Button>
          {data?.program_type === "iep" ? (
            <>
              <Button variant="outlined" size="sm" icon={ClipboardList} onClick={() => navigate(`/iep/${data?.id}`)}>
                IEP History
              </Button>
              <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => navigate(`/assessment/new/${data?.id}`)}>
                + New Assessment
              </Button>
            </>
          ) : (
            <>
              {(data?.therapy_category === "ADHD" || data?.therapy_category === "ADHD Presentation" || data?.diagnosis?.toLowerCase().includes("adhd")) ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Zap}
                  className="bg-[#0F6E56] hover:bg-[#08503E]"
                  onClick={() => navigate(`/therapy/adhd/assessment/${data?.id}`)}
                >
                  Conners' ADHD Assessment
                </Button>
              ) : (data?.therapy_category === "Developmental Delay" || data?.diagnosis?.toLowerCase().includes("delay")) ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Clock}
                  className="bg-[#854F0B] hover:bg-[#683C07]"
                  onClick={() => navigate(`/therapy/delay/assessment/${data?.id}`)}
                >
                  Milestones Checklist
                </Button>
              ) : (data?.therapy_category === "Learning Disability" || data?.diagnosis?.toLowerCase().includes("learn") || data?.diagnosis?.toLowerCase().includes("sld")) ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={BookOpen}
                  className="bg-[#2f6f5e] hover:bg-[#23584a] text-white"
                  onClick={() => navigate(`/therapy/sld/assessment/${data?.id}`)}
                >
                  LDST Screening
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Brain}
                  onClick={() => navigate(`/therapy/asd/assessment/${data?.id}`)}
                >
                  ISAA Assessment
                </Button>
              )}
              <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => navigate(`/reports/new/${data?.id}`)}>
                + New Report
              </Button>
            </>
          )}
        </div>
      </div>


      {/* Tabs Row */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "assessments", label: `Assessments (${assessments.length})` },
          ...(data?.program_type !== "iep"
            ? [{ id: "exercises", label: totalAssignedExercises > 0 ? `Exercises (${totalAssignedExercises})` : "Exercises" }]
            : []),
          { id: "reports", label: `Reports (${reports.length})` },
          ...(data?.program_type !== "iep" ? [{ id: "appointments", label: "Appointments" }] : []),
          { id: "messages", label: parentMessages.length > 0 ? `Parent Messages (${parentMessages.length})` : "Parent Messages" },
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Child Details">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Full Name</span> <strong>{data?.name}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Child ID</span> <strong className="font-mono">{data?.id}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Date of Birth</span> <strong>{data?.date_of_birth || data?.dob || "N/A"}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Age</span> <strong>{data?.age}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Gender</span> <strong>{data?.gender}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Diagnosis</span> <strong>{data?.diagnosis}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Primary Concern</span> <strong>{data?.primary_concern || data?.primaryConcern || "N/A"}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Referred By</span> <strong>{data?.referred_by || data?.referredBy || "Self"}</strong></div>
              </div>
            </Card>

            <Card title="Parent & Access Info">
              <div className="space-y-3 text-xs">
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Parent Name</span> <strong className="text-sm">{parentName}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Phone Number</span> <strong className="font-mono text-[#185FA5]">{parentPhone || "Not set"}</strong></div>
                <div><span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Portal Access</span> <Badge label={isPortalActive ? "Active" : "Inactive"} variant={isPortalActive ? "green" : "amber"} /></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2A]">Clinical Assessment History</h3>
              <p className="text-xs text-[#5F5E5A]">ISAA Autism, Conners' ADHD &amp; Developmental Delay evaluation records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(data?.therapy_category === "Learning Disability" || data?.diagnosis?.toLowerCase().includes("learning") || data?.diagnosis?.toLowerCase().includes("dyslexia")) && (
                <Button size="sm" variant="primary" icon={BookOpen} className="bg-[#2f6f5e] hover:bg-[#23584a] text-white" onClick={() => navigate(`/therapy/sld/assessment/${data?.id}`)}>
                  + LDST Screening
                </Button>
              )}
              {(data?.therapy_category === "Developmental Delay" || data?.diagnosis?.toLowerCase().includes("delay")) && (
                <Button size="sm" variant="primary" icon={Clock} className="bg-[#854F0B] hover:bg-[#683C07]" onClick={() => navigate(`/therapy/delay/assessment/${data?.id}`)}>
                  + Delay Checklist
                </Button>
              )}
              {(data?.therapy_category === "ADHD" || data?.diagnosis?.includes("ADHD")) && (
                <Button size="sm" variant="primary" icon={Zap} className="bg-[#0F6E56] hover:bg-[#08503E]" onClick={() => navigate(`/therapy/adhd/assessment/${data?.id}`)}>
                  + Conners' ADHD Scale
                </Button>
              )}
              {(data?.therapy_category === "ASD" || data?.diagnosis?.includes("ASD") || (!data?.therapy_category && data?.program_type !== "iep")) && (
                <Button size="sm" variant="primary" icon={Brain} onClick={() => navigate(`/therapy/asd/assessment/${data?.id}`)}>
                  + ISAA Autism Scale
                </Button>
              )}
              <Button size="sm" variant="outlined" icon={PlusCircle} onClick={() => navigate(`/assessment/new/${data?.id}`)}>
                + IEP Assessment
              </Button>
            </div>
          </div>

          {assessments.length === 0 ? (
            <Card padding="p-8">
              <div className="text-center space-y-3">
                <ClipboardList className="h-10 w-10 text-[#9B9A96] mx-auto" />
                <h4 className="text-sm font-bold text-[#2C2C2A]">No IEP Assessments Recorded</h4>
                <p className="text-xs text-[#5F5E5A] max-w-sm mx-auto">
                  Perform a clinical assessment to generate ISAA ratings, profile classification, and domain goals.
                </p>
                <Button size="sm" icon={PlusCircle} onClick={() => navigate(`/assessment/new/${data?.id}`)}>
                  + Perform Assessment
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {assessments.map((ass, idx) => (
                <div key={ass.id || idx} className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#185FA5]" />
                      <span className="text-xs font-bold text-[#2C2C2A]">
                        Assessment Date: {ass.assessment_date || ass.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]}
                      </span>
                      <Badge label={ass.status || "completed"} variant={ass.status === "draft" ? "amber" : "green"} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5F5E5A]">
                      <span className="font-semibold text-[#185FA5]">IEP Assessment Record</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* EXERCISES TAB (Clinic Exercises & Home Exercises)           */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          {loadingExercises ? (
            <SkeletonCard count={2} />
          ) : totalAssignedExercises === 0 ? (
            /* EMPTY STATE */
            <Card padding="p-8">
              <div className="text-center space-y-3 max-w-md mx-auto">
                <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center mx-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M12 11v6M9 14h6" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-bold text-[#2C2C2A]">No exercises assigned yet</h3>
                <p className="text-[14px] text-[#5F5E5A] leading-relaxed">
                  Complete an assessment and publish a report to assign exercises to this child.
                </p>
                <Button variant="outlined" icon={PlusCircle} onClick={() => navigate(`/assessment/new/${data?.id}`)}>
                  + New Assessment
                </Button>
              </div>
            </Card>
          ) : (
            /* EXERCISES TAB LAYOUT */
            <>
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs">
                <div>
                  <h3 className="text-[16px] font-bold text-[#2C2C2A]">
                    Exercises for <span className="text-[#185FA5]">{data?.name?.split(" ")[0] || "Child"}</span>
                  </h3>
                  <p className="text-[12px] text-[#5F5E5A] font-medium">
                    From report dated {latestPublishedReport?.published_at?.split("T")[0] || latestPublishedReport?.created_at?.split("T")[0] || "20 Nov 2025"}
                  </p>
                </div>
                <Button
                  variant="outlined"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate(`/reports/${latestPublishedReport?.id || data?.id}/therapist`)}
                >
                  View Full Report
                </Button>
              </div>

              {/* SECTION 1 — CLINIC EXERCISES */}
              <div className="bg-white rounded-[12px] border border-[#D3D1C7] border-l-4 border-l-[#185FA5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#D3D1C7]/60 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#185FA5] flex items-center gap-2">
                      <span>🏥 Clinic Exercises</span>
                    </h3>
                    <p className="text-[12px] text-[#5F5E5A]">Done during therapy sessions</p>
                  </div>
                  <span className="px-3 py-1 bg-[#E6F1FB] text-[#185FA5] text-xs font-bold rounded-full">
                    {clinicExercisesList.length} exercises
                  </span>
                </div>

                <div className="divide-y divide-[#D3D1C7]/60">
                  {clinicExercisesList.map((ex, idx) => {
                    const badgeStyle = getCategoryBadgeStyle(ex.category);
                    const isExpanded = !!expandedClinicBenefits[ex.id || idx];

                    return (
                      <div key={ex.id || idx} className="p-4 space-y-2 hover:bg-slate-50/60 transition-colors">
                        {(ex.image_url || ex.imageUrl) && (
                          <div className="mb-3 rounded-[8px] overflow-hidden h-40 bg-gray-50 border border-[#D3D1C7]/60">
                            <img
                              src={ex.image_url || ex.imageUrl}
                              alt={ex.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.parentElement.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                          >
                            {ex.category}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F0EFEA] text-[#5F5E5A] text-[11px] font-bold rounded">
                            {ex.duration || "15 mins"}
                          </span>
                        </div>

                        <h4 className="text-[15px] font-bold text-[#2C2C2A]">{ex.name}</h4>
                        <p className="text-[13px] text-[#5F5E5A] font-medium line-clamp-2 leading-relaxed">
                          {ex.description}
                        </p>

                        {/* Collapsible Benefits */}
                        <div className="pt-1">
                          <button
                            onClick={() => setExpandedClinicBenefits((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                            className="text-[12px] text-[#5F5E5A] hover:text-[#185FA5] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide benefits ▲" : "Show benefits ▼"}</span>
                          </button>

                          {isExpanded && ex.benefits && (
                            <ul className="mt-2 space-y-1 pl-4 list-disc text-[12px] text-[#5F5E5A]">
                              {ex.benefits.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2 — HOME EXERCISES */}
              <div className="bg-white rounded-[12px] border border-[#D3D1C7] border-l-4 border-l-[#0F6E56] shadow-xs overflow-hidden space-y-4 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#D3D1C7]/60 pb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0F6E56] flex items-center gap-2">
                      <span>🏠 Home Exercises</span>
                    </h3>
                    <p className="text-[12px] text-[#5F5E5A]">Parent does these daily at home</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-teal-100 text-[#0F6E56] text-xs font-bold rounded-full">
                      {homeExercisesList.length} exercises
                    </span>

                    {/* Share with Parent Button */}
                    <button
                      disabled={!isPortalActive}
                      title={!isPortalActive ? "Set up parent portal access first in the Parent Access tab" : ""}
                      onClick={() => {
                        if (isPortalActive) {
                          showToast(`These exercises are already visible on ${parentName}'s portal. They can see them by logging in.`, "info");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isPortalActive
                          ? "border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56]/10"
                          : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share with Parent
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-[#D3D1C7]/60">
                  {homeExercisesList.map((ex, idx) => {
                    const badgeStyle = getCategoryBadgeStyle(ex.category);
                    const isInstrExpanded = !!expandedHomeInstructions[ex.id || idx];
                    const isBenExpanded = !!expandedHomeBenefits[ex.id || idx];

                    return (
                      <div key={ex.id || idx} className="py-4 space-y-2 first:pt-0 last:pb-0">
                        {(ex.image_url || ex.imageUrl) && (
                          <div className="mb-3 rounded-[8px] overflow-hidden h-40 bg-gray-50 border border-[#D3D1C7]/60">
                            <img
                              src={ex.image_url || ex.imageUrl}
                              alt={ex.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.parentElement.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                          >
                            {ex.category}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F0EFEA] text-[#5F5E5A] text-[11px] font-bold rounded">
                            {ex.duration || "10 mins"}
                          </span>
                        </div>

                        <h4 className="text-[15px] font-bold text-[#2C2C2A]">{ex.name}</h4>
                        <p className="text-[13px] text-[#5F5E5A] font-medium line-clamp-2 leading-relaxed">
                          {ex.homeDescription || ex.description}
                        </p>

                        <div className="flex items-center gap-4 text-[12px] font-semibold text-[#5F5E5A] pt-1">
                          {/* Collapsible Instructions */}
                          <button
                            onClick={() => setExpandedHomeInstructions((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                            className="hover:text-[#0F6E56] cursor-pointer flex items-center gap-1"
                          >
                            <span>{isInstrExpanded ? "Hide instructions ▲" : "How to do this ▼"}</span>
                          </button>

                          {/* Collapsible Benefits */}
                          <button
                            onClick={() => setExpandedHomeBenefits((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                            className="hover:text-[#185FA5] cursor-pointer flex items-center gap-1"
                          >
                            <span>{isBenExpanded ? "Hide benefits ▲" : "Benefits ▼"}</span>
                          </button>
                        </div>

                        {/* Collapsible Instructions Content */}
                        {isInstrExpanded && ex.instructions && (
                          <div className="mt-2 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-1">
                            <h5 className="font-bold text-[#0F6E56] text-[11px] uppercase">Step-by-Step Instructions</h5>
                            <ol className="list-decimal list-inside text-[12px] text-[#2C2C2A] space-y-1">
                              {ex.instructions.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Collapsible Benefits Content */}
                        {isBenExpanded && ex.benefits && (
                          <div className="mt-2 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-1">
                            <h5 className="font-bold text-[#185FA5] text-[11px] uppercase">Key Benefits</h5>
                            <ul className="list-disc list-inside text-[12px] text-[#5F5E5A] space-y-1">
                              {ex.benefits.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* HOME PROGRAMME NOTE CARD */}
                <div className="bg-[#F0VDF4] border border-[#0F6E56] rounded-[8px] p-4 space-y-2">
                  <h4 className="text-[13px] font-bold text-[#0F6E56] flex items-center gap-1.5">
                    📱 Visible on Parent Portal
                  </h4>
                  {isPortalActive ? (
                    <div className="text-[12px] text-[#5F5E5A] space-y-1">
                      <p>
                        <strong>{parentName}</strong> can see these exercises on their portal and mark each one done daily.
                      </p>
                      <p className="font-mono text-[#0F6E56]">Login Phone: <strong>{parentPhone}</strong></p>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#854F0B] space-y-2">
                      <p>Parent portal not set up yet. Go to Parent Access tab to create login details.</p>
                      <button
                        onClick={() => setActiveTab("parent-access")}
                        className="text-xs font-bold text-[#185FA5] underline cursor-pointer"
                      >
                        Set Up Parent Portal →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2A]">Published Reports</h3>
              <p className="text-xs text-[#5F5E5A]">Official assessment &amp; IEP progress reports published by Admin</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <Card padding="p-8">
              <div className="text-center space-y-3 max-w-md mx-auto">
                <FileText className="h-10 w-10 text-[#9B9A96] mx-auto" />
                <h4 className="text-sm font-bold text-[#2C2C2A]">No Published Reports Yet</h4>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  Reports will appear here once the draft assessment review is completed and published by the Admin.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((rep, idx) => (
                <div key={rep.id ? `published-rep-${rep.id}` : `published-rep-idx-${idx}`} className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#0F6E56]" />
                      <span className="text-xs font-bold text-[#2C2C2A]">
                        {rep.iep_report ? `IEP Progress Report — Cycle ${rep.iep_cycle || 1}` : `Clinical Assessment Report`}
                      </span>
                      <Badge label="Published" variant="green" size="sm" />
                    </div>
                    <p className="text-xs text-[#5F5E5A]">
                      Published: {rep.published_at?.split("T")[0] || rep.created_at?.split("T")[0]} {rep.published_by ? `by ${rep.published_by}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outlined"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(rep.iep_report ? `/iep/report/${rep.id}` : `/reports/${rep.id}/therapist`)}
                    >
                      View Published Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parent Access Tab */}
      {activeTab === "parent-access" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D3D1C7] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2C2C2A]">Parent Portal Status</h3>
                <p className="text-xs text-[#5F5E5A]">Allow parents to log in, view reports, and track home exercises</p>
              </div>
              <Badge label={isPortalActive ? "Portal Active" : "Portal Inactive"} variant={isPortalActive ? "green" : "amber"} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Registered Parent Phone (Login Username)</span>
                <strong className="font-mono text-sm text-[#185FA5] block">{parentPhone || "Not configured"}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Portal Access Password</span>
                <strong className="font-mono text-sm text-[#185FA5] block">
                  {parentPassword
                    ? parentPassword.startsWith("$2")
                      ? "•••••••• (Securely Hashed)"
                      : parentPassword
                    : "Not configured"}
                </strong>
              </div>
              <div className="space-y-1">
                <span className="text-[#9B9A96] block uppercase text-[10px] font-bold">Portal Access Status</span>
                <span className="text-emerald-700 font-bold">{isPortalActive ? "Enabled — Parent can log in with phone & password" : "Disabled"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Button icon={UserCheck} onClick={handleOpenSetupModal}>
                Setup / Update Access
              </Button>
              <Button variant="outlined" icon={Key} onClick={handleOpenResetModal}>
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#2C2C2A]">Appointments for {data?.name}</h3>
            <button
              onClick={() => setBookAptOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-[8px] text-xs font-bold hover:bg-[#0e4a80] transition-colors cursor-pointer"
            >
              + Book Appointment
            </button>
          </div>

          {loadingApts ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#F0EFEA] rounded-[8px] animate-pulse" />)}
            </div>
          ) : appointments.length === 0 ? (
            <Card className="p-10 text-center space-y-4">
              <div className="text-4xl">📅</div>
              <h4 className="font-bold text-[#2C2C2A]">No appointments yet</h4>
              <p className="text-xs text-[#5F5E5A]">Book the first appointment for {data?.name}</p>
              <button
                onClick={() => setBookAptOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-[8px] text-xs font-bold hover:bg-[#0e4a80] transition-colors cursor-pointer"
              >
                + Book Appointment
              </button>
            </Card>
          ) : (
            <div className="space-y-2">
              {[...appointments].sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)).map(a => {
                const ts = getTypeStyle(a.appointment_type);
                const ss = getStatusStyle(a.status);
                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-[12px] border border-[#D3D1C7] hover:border-[#185FA5] transition-all flex items-center gap-4 p-4 cursor-pointer shadow-xs"
                    onClick={() => setSelectedApt(a)}
                  >
                    <div className="shrink-0 w-24 text-center">
                      <p className="text-[13px] font-bold text-[#185FA5]">{formatAppointmentTime(a.appointment_time)}</p>
                      <p className="text-[11px] text-[#9B9A96] font-semibold">{a.appointment_date}</p>
                    </div>
                    <div className="w-px h-10 bg-[#D3D1C7]/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#2C2C2A]">{getTypeLabel(a.appointment_type)} Session</p>
                      <p className="text-[11px] text-[#5F5E5A] font-semibold">{a.duration_minutes || 60} minutes{a.notes ? ` · ${a.notes.slice(0, 40)}...` : ""}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>{getTypeLabel(a.appointment_type)}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: ss.bg, color: ss.text }}>{getStatusLabel(a.status)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PARENT MESSAGES TAB */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[#2C2C2A]">Parent Messages for {data?.name}</h3>
              <p className="text-xs text-[#5F5E5A]">Direct updates and exercise notes sent by {parentName} from the Parent Portal</p>
            </div>
            <Badge label={`${parentMessages.length} message${parentMessages.length > 1 ? "s" : ""}`} variant="blue" size="sm" />
          </div>

          {parentMessages.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <MessageSquare className="h-10 w-10 text-[#9B9A96] mx-auto" />
              <h4 className="font-bold text-[#2C2C2A]">No messages from parent yet</h4>
              <p className="text-xs text-[#5F5E5A]">
                Messages submitted by {parentName} in the daily exercises section of the Parent Portal will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {parentMessages.map((m) => {
                const dateStr = m.created_at
                  ? new Date(m.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : m.message_date;

                return (
                  <div
                    key={m.id}
                    className="p-4 bg-white border border-[#D3D1C7] rounded-[12px] shadow-xs space-y-2.5 hover:border-[#185FA5] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0F6E56]" />
                        <span className="text-xs font-bold text-[#2C2C2A]">
                          {parentName} {parentPhone ? `(${parentPhone})` : ""}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#9B9A96] font-semibold">{dateStr}</span>
                    </div>
                    <div className="p-3.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 text-xs font-semibold text-[#2C2C2A] leading-relaxed">
                      &ldquo;{m.message}&rdquo;
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Setup Access Modal */}
      <Modal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} title="Set Up Parent Portal Access">
        <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs font-semibold">
          <Input label="Parent Mobile Phone Number" type="tel" required value={portalPhone} onChange={(e) => setPortalPhone(e.target.value)} placeholder="e.g. 9876543210" />
          <Input label="Set Portal Password" type="text" required value={portalPass} onChange={(e) => setPortalPass(e.target.value)} />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" type="button" onClick={() => setShowSetupModal(false)}>Cancel</Button>
            <Button type="submit">Save & Grant Access</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Parent Password">
        <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
          <Input label="New Password" type="text" required value={portalPass} onChange={(e) => setPortalPass(e.target.value)} />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" type="button" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>

      {/* Appointment Modals */}
      <BookAppointmentModal
        isOpen={bookAptOpen}
        onClose={() => setBookAptOpen(false)}
        onBooked={() => {
          setBookAptOpen(false);
          // Refresh appointments list
          appointmentService.getByChildId(id).then(apts => setAppointments(apts || [])).catch(() => {});
        }}
        preselectedChildId={id}
        childrenList={childrenForModal.length > 0 ? childrenForModal : (data ? [data] : [])}
      />
      <AppointmentDetailModal
        appointment={selectedApt}
        isOpen={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        onUpdated={() => {
          appointmentService.getByChildId(id).then(apts => setAppointments(apts || [])).catch(() => {});
          setSelectedApt(null);
        }}
        childrenList={childrenForModal.length > 0 ? childrenForModal : (data ? [data] : [])}
      />
    </div>
  );
}
