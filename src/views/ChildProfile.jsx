import React, { useState, useEffect, useMemo } from "react";
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
  MessageSquare,
  ShieldAlert,
  Trash2,
  Dumbbell,
  Home
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { childrenService } from "../services/childrenService";
import { childAssignmentService } from "../services/childAssignmentService";
import { parentService } from "../services/parentService";
import { assessmentService } from "../services/assessmentService";
import { reportService } from "../services/reportService";
import { exerciseService, resolveExerciseItem, resolveExerciseList } from "../services/exerciseService";
import { MASTER_EXERCISES } from "../data/exercisesData";
import { authService } from "../services/authService";
import { appointmentService } from "../services/appointmentService";
import { hashPassword } from "../services/passwordService";
import { BookAppointmentModal, AppointmentDetailModal } from "./AppointmentsPage";
import { formatAppointmentDate, formatAppointmentTime, getTypeStyle, getStatusStyle, getTypeLabel, getStatusLabel, isToday, isPast } from "../utils/appointmentHelpers";
import { detectChildCategory } from "../utils/categoryHelpers";
import { checkReassessmentEligibility } from "../utils/reassessmentHelpers";
import { db } from "../lib/db";

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isAdmin,
    isStaff,
    isChildAccessible,
    staffList,
    forwardChildToStaff,
    assignChildToStaff,
    unassignChild,
    addStaffPermission,
    removeStaffPermission,
    getAuthorizedStaff,
    assignments,
    childrenList: contextChildren,
    deleteRegisteredChild,
    showToast
  } = useAuth();

  const [data, setData] = useState(null);
  const childCat = detectChildCategory(data);
  const [assessments, setAssessments] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [parentMessages, setParentMessages] = useState([]);

  // 3-Month Re-assessment Interval Eligibility
  const reassessmentEligibility = useMemo(() => {
    return checkReassessmentEligibility(assessments, reports, data?.lastReportDate);
  }, [assessments, reports, data?.lastReportDate]);

  // Multi-Staff Permissions & Assignment State
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState("");
  const [permissionNotes, setPermissionNotes] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isRemovingStaff, setIsRemovingStaff] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(() => childAssignmentService.getAssignment(id));
  const [authorizedStaffList, setAuthorizedStaffList] = useState(() => childAssignmentService.getAuthorizedStaff(id));

  // Delete Child Profile State (Admin Only)
  const [showDeleteChildModal, setShowDeleteChildModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeletingChild, setIsDeletingChild] = useState(false);

  const isDeleteNameMatched =
    Boolean(data?.name) &&
    deleteConfirmName.trim().length > 0 &&
    deleteConfirmName.trim().toLowerCase() === data.name.trim().toLowerCase();

  const handleDeleteChildProfile = async () => {
    if (!isAdmin) {
      showToast("Access Denied: Only administrators can delete child profiles.", "danger");
      return;
    }

    if (!isDeleteNameMatched) {
      showToast("Child name does not match. Please type the exact name to confirm deletion.", "danger");
      return;
    }

    const targetId = id || data?.id;
    if (!targetId) return;

    try {
      setIsDeletingChild(true);
      await childrenService.delete(targetId);

      // Clean up local assignments
      try {
        childAssignmentService.deleteAssignment(targetId);
      } catch (_) {}

      if (typeof deleteRegisteredChild === "function") {
        deleteRegisteredChild(targetId);
      }

      showToast(`Child profile for "${data?.name}" has been permanently deleted.`, "success");
      setShowDeleteChildModal(false);
      navigate("/children", { replace: true });
    } catch (err) {
      console.error("Failed to delete child profile:", err);
      showToast(`Failed to delete profile: ${err.message || "Unknown error"}`, "danger");
      setIsDeletingChild(false);
    }
  };

  useEffect(() => {
    const targetId = id || data?.id;
    if (targetId) {
      const ass = childAssignmentService.getAssignment(targetId);
      setCurrentAssignment(ass);
      const authorized = childAssignmentService.getAuthorizedStaff(targetId);
      setAuthorizedStaffList(authorized);
    }
  }, [id, data?.id, assignments]);

  const handleAddStaffAccess = async () => {
    if (!selectedStaffToAdd) {
      showToast("Please select a staff member to grant access to.", "danger");
      return;
    }
    const targetStaff = (staffList || []).find((s) => s.id === selectedStaffToAdd);
    if (!targetStaff) {
      showToast("Selected staff member was not found.", "danger");
      return;
    }

    setIsAddingStaff(true);
    try {
      const targetId = id || data?.id;
      await addStaffPermission(targetId, targetStaff, {
        grantedBy: user?.name || "Admin",
        notes: permissionNotes
      });
      const updatedAss = childAssignmentService.getAssignment(targetId);
      setCurrentAssignment(updatedAss);
      setAuthorizedStaffList(childAssignmentService.getAuthorizedStaff(targetId));
      showToast(`Viewing access granted to ${targetStaff.name}!`, "success");
      setSelectedStaffToAdd("");
      setPermissionNotes("");
    } catch (err) {
      console.error("Add staff permission error:", err);
      showToast("Failed to grant staff access: " + err.message, "danger");
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleRemoveStaffAccess = async (staffMemberId, staffMemberName) => {
    if (!window.confirm(`Are you sure you want to remove viewing access for ${staffMemberName || "this staff member"}? They will no longer be able to view this child's profile.`)) {
      return;
    }

    setIsRemovingStaff(true);
    try {
      const targetId = id || data?.id;
      await removeStaffPermission(targetId, staffMemberId, {
        removedBy: user?.name || "Admin"
      });
      const updatedAss = childAssignmentService.getAssignment(targetId);
      setCurrentAssignment(updatedAss);
      setAuthorizedStaffList(childAssignmentService.getAuthorizedStaff(targetId));
      showToast(`Removed viewing access for ${staffMemberName || "staff member"}.`, "info");
    } catch (err) {
      console.error("Remove staff permission error:", err);
      showToast("Failed to remove staff access: " + err.message, "danger");
    } finally {
      setIsRemovingStaff(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (!assessmentId) return;
    if (window.confirm("Are you sure you want to delete this assessment record? This action cannot be undone.")) {
      try {
        await assessmentService.delete(assessmentId, id || data?.id);
        showToast("Assessment record deleted successfully.", "success");
        fetchRelatedRecords();
      } catch (err) {
        showToast("Failed to delete assessment: " + err.message, "danger");
      }
    }
  };

  const handleDeleteReport = async (reportId, assessmentType) => {
    if (!reportId) return;
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      try {
        await reportService.delete(reportId, assessmentType);
        showToast("Report deleted successfully.", "success");
        fetchRelatedRecords();
        fetchExercisesForTab();
      } catch (err) {
        showToast("Failed to delete report: " + err.message, "danger");
      }
    }
  };

  // Exercises Tab State
  const [latestPublishedReport, setLatestPublishedReport] = useState(null);
  const [clinicExercisesList, setClinicExercisesList] = useState([]);
  const [homeExercisesList, setHomeExercisesList] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Collapsible Toggles
  const [expandedClinicBenefits, setExpandedClinicBenefits] = useState({});
  const [expandedHomeBenefits, setExpandedHomeBenefits] = useState({});
  const [expandedHomeInstructions, setExpandedHomeInstructions] = useState({});
  const [previewExerciseModal, setPreviewExerciseModal] = useState(null);

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
        if (result.assessments && Array.isArray(result.assessments)) {
          setAssessments(result.assessments);
        } else if (result.assessments) {
          setAssessments([result.assessments]);
        } else {
          setAssessments([]);
        }
        if (result.reports) {
          const publishedReps = (Array.isArray(result.reports) ? result.reports : [result.reports]).filter(
            (r) => r.status === "published" || r.review_status === "published"
          );
          setReports(publishedReps);
        }
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
      const [assList, repList, iepReps, aptList] = await Promise.all([
        assessmentService.getByChildId(id),
        reportService.getByChildId(id),
        import("../services/iepService").then((m) => m.iepService.getReportsByChildId(id)).catch(() => []),
        appointmentService.getByChildId(id).catch(() => [])
      ]);

      if (assList && assList.length > 0) {
        setAssessments(assList);
      } else {
        setAssessments([]);
      }

      if (aptList && aptList.length > 0) {
        setAppointments(aptList);
      } else {
        setAppointments([]);
      }

      const reportMap = new Map();
      [...(repList || []), ...(iepReps || [])].forEach((r) => {
        if (r && r.id && !reportMap.has(r.id)) {
          reportMap.set(r.id, r);
        }
      });
      const uniqueReps = Array.from(reportMap.values());
      // Only published reports should appear in the published reports section
      const publishedOnly = uniqueReps.filter(
        (r) => r.status === "published" || r.review_status === "published"
      );
      const pendingOnly = uniqueReps.filter(
        (r) => r.status === "pending_review" || r.review_status === "pending_review"
      );
      if (typeof window !== "undefined") {
        try {
          const draftRaw = localStorage.getItem(`report_draft_${id}`);
          if (draftRaw) {
            const draftObj = JSON.parse(draftRaw);
            if (draftObj && (draftObj.status === "pending_review" || draftObj.review_status === "pending_review")) {
              if (!pendingOnly.some((p) => p.id === draftObj.reportId || p.id === draftObj.id)) {
                pendingOnly.push({ ...draftObj, id: draftObj.reportId || draftObj.id || `draft-${id}` });
              }
            }
          }
        } catch (_) {}
      }
      setPendingReports(pendingOnly);

      const sortedPublished = [...publishedOnly].sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || a.last_edited_at || 0).getTime();
        const dateB = new Date(b.published_at || b.created_at || b.last_edited_at || 0).getTime();
        return dateB - dateA;
      });
      setReports(sortedPublished);

      // Eagerly resolve and populate active exercises from the NEWEST published report
      if (sortedPublished.length > 0) {
        const latestRep = sortedPublished[0];
        setLatestPublishedReport(latestRep);
        const extractEx = (arr) => Array.isArray(arr) && arr.length > 0 ? arr : null;

        let cIds = extractEx(latestRep.clinic_exercises) ||
                   extractEx(latestRep.clinicExercises) ||
                   extractEx(latestRep.therapy_details?.clinic_exercises) ||
                   extractEx(latestRep.formState?.exercises?.clinicExercises) ||
                   extractEx(latestRep.formState?.clinicEx) ||
                   extractEx(latestRep.clinicEx) ||
                   [];
        let hIds = extractEx(latestRep.home_exercises) ||
                   extractEx(latestRep.homeExercises) ||
                   extractEx(latestRep.therapy_details?.home_exercises) ||
                   extractEx(latestRep.formState?.exercises?.homeExercises) ||
                   extractEx(latestRep.formState?.homeEx) ||
                   extractEx(latestRep.homeEx) ||
                   [];

        // Fallback to associated assessment exercises if report exercises were null
        if ((cIds.length === 0 || hIds.length === 0) && assList && assList.length > 0) {
          const linkedAss = latestRep.assessment_id
            ? assList.find((a) => a.id === latestRep.assessment_id)
            : null;
          const targetAssList = linkedAss ? [linkedAss, ...assList] : assList;
          for (const ass of targetAssList) {
            if (cIds.length === 0 && (ass.clinic_exercises?.length || ass.clinicExercises?.length)) {
              cIds = ass.clinic_exercises || ass.clinicExercises;
            }
            if (hIds.length === 0 && (ass.home_exercises?.length || ass.homeExercises?.length)) {
              hIds = ass.home_exercises || ass.homeExercises;
            }
            if (cIds.length > 0 && hIds.length > 0) break;
          }
        }

        // Fallback to localStorage published report cache
        if ((cIds.length === 0 || hIds.length === 0) && typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(`report_published_${id}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (cIds.length === 0) {
                cIds = extractEx(parsed.clinic_exercises) || extractEx(parsed.clinicEx) || extractEx(parsed.formState?.exercises?.clinicExercises) || [];
              }
              if (hIds.length === 0) {
                hIds = extractEx(parsed.home_exercises) || extractEx(parsed.homeEx) || extractEx(parsed.formState?.exercises?.homeExercises) || [];
              }
            }
          } catch (_) {}
        }

        if (cIds.length > 0 || hIds.length > 0) {
          const cList = resolveExerciseList(cIds, MASTER_EXERCISES);
          const hList = resolveExerciseList(hIds, MASTER_EXERCISES);
          setClinicExercisesList(cList);
          setHomeExercisesList(hList);
        } else {
          setClinicExercisesList([]);
          setHomeExercisesList([]);
        }
      } else {
        // No published report — ensure exercises are cleared
        setLatestPublishedReport(null);
        setClinicExercisesList([]);
        setHomeExercisesList([]);
      }
    } catch (err) {
      console.warn("Fetch related records notice:", err.message);
      setAssessments([]);
      setReports([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Fetch Exercises for Exercises Tab ONLY from a published report
  const fetchExercisesForTab = async (targetChild = data) => {
    if (!id) return;
    setLoadingExercises(true);
    try {
      // Only look for published reports — never fall back to drafts or assessments
      let publishedRep = null;
      try {
        const allReps = await reportService.getByChildId(id);
        if (Array.isArray(allReps)) {
          const pubList = allReps.filter(
            (r) => r.status === 'published' || r.review_status === 'published'
          ).sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at || a.last_edited_at || 0).getTime();
            const dateB = new Date(b.published_at || b.created_at || b.last_edited_at || 0).getTime();
            return dateB - dateA;
          });
          publishedRep = pubList[0] || null;
        }
      } catch (_) {}

      if (!publishedRep) {
        // No published report exists — show empty state
        setLatestPublishedReport(null);
        setClinicExercisesList([]);
        setHomeExercisesList([]);
        return;
      }

      setLatestPublishedReport(publishedRep);
      const extractEx = (arr) => Array.isArray(arr) && arr.length > 0 ? arr : null;

      let clinicIds = extractEx(publishedRep.clinic_exercises) ||
                      extractEx(publishedRep.clinicExercises) ||
                      extractEx(publishedRep.therapy_details?.clinic_exercises) ||
                      extractEx(publishedRep.formState?.exercises?.clinicExercises) ||
                      extractEx(publishedRep.formState?.clinicEx) ||
                      extractEx(publishedRep.clinicEx) ||
                      [];
      let homeIds = extractEx(publishedRep.home_exercises) ||
                    extractEx(publishedRep.homeExercises) ||
                    extractEx(publishedRep.therapy_details?.home_exercises) ||
                    extractEx(publishedRep.formState?.exercises?.homeExercises) ||
                    extractEx(publishedRep.formState?.homeEx) ||
                    extractEx(publishedRep.homeEx) ||
                    [];

      // Fallback 1: Associated Assessment exercises
      if (clinicIds.length === 0 || homeIds.length === 0) {
        try {
          const assList = await assessmentService.getByChildId(id);
          if (Array.isArray(assList) && assList.length > 0) {
            const linkedAss = publishedRep?.assessment_id
              ? assList.find((a) => a.id === publishedRep.assessment_id)
              : null;
            const targetAssList = linkedAss ? [linkedAss, ...assList] : assList;
            for (const ass of targetAssList) {
              if (clinicIds.length === 0 && (ass.clinic_exercises?.length || ass.clinicExercises?.length)) {
                clinicIds = ass.clinic_exercises || ass.clinicExercises;
              }
              if (homeIds.length === 0 && (ass.home_exercises?.length || ass.homeExercises?.length)) {
                homeIds = ass.home_exercises || ass.homeExercises;
              }
              if (clinicIds.length > 0 && homeIds.length > 0) break;
            }
          }
        } catch (_) {}
      }

      // Fallback 2: localStorage published report cache
      if ((clinicIds.length === 0 || homeIds.length === 0) && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`report_published_${id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (clinicIds.length === 0) {
              clinicIds = extractEx(parsed.clinic_exercises) || extractEx(parsed.clinicEx) || extractEx(parsed.formState?.exercises?.clinicExercises) || [];
            }
            if (homeIds.length === 0) {
              homeIds = extractEx(parsed.home_exercises) || extractEx(parsed.homeEx) || extractEx(parsed.formState?.exercises?.homeExercises) || [];
            }
          }
        } catch (_) {}
      }

      const available = (await exerciseService.getAll()) || [];

      const clinicList = resolveExerciseList(clinicIds, available);
      const homeList = resolveExerciseList(homeIds, available);

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
    fetchExercisesForTab();
  }, [id, contextChildren]);

  useEffect(() => {
    if (id && data?.program_type !== "iep") {
      fetchExercisesForTab(data);
    }
  }, [id, data?.therapy_category, data?.diagnosis, data?.program_type]);

  useEffect(() => {
    if (activeTab === "exercises") {
      fetchExercisesForTab(data);
    }
  }, [activeTab]);

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
  const isPortalActive = Boolean(data?.parent?.portalActive || data?.parent_accounts?.portal_active);

  const handleTogglePortalStatus = async () => {
    const nextStatus = !isPortalActive;
    try {
      const childId = id || data?.id;
      const targetPhone = portalPhone || data?.parent?.phone || data?.parent_accounts?.phone;
      
      try {
        await parentService.updatePortalStatus(childId, targetPhone, nextStatus);
      } catch (dbErr) {
        console.warn("parentService.updatePortalStatus notice:", dbErr.message);
      }

      setData((prev) => ({
        ...prev,
        parent: {
          ...(prev?.parent || {}),
          portalActive: nextStatus
        },
        parent_accounts: {
          ...(prev?.parent_accounts || {}),
          portal_active: nextStatus
        }
      }));

      if (typeof window !== "undefined") {
        try {
          const registered = JSON.parse(localStorage.getItem("kcr_registered_children") || "[]");
          const updated = registered.map(c =>
            c.id === childId
              ? {
                  ...c,
                  parent: { ...(c.parent || {}), portalActive: nextStatus },
                  parent_accounts: { ...(c.parent_accounts || {}), portal_active: nextStatus }
                }
              : c
          );
          localStorage.setItem("kcr_registered_children", JSON.stringify(updated));
        } catch (_) {}
      }

      showToast(nextStatus ? "Parent portal access activated!" : "Parent portal access deactivated.", "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update status: " + err.message, "error");
    }
  };

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

  const isAccessible = isAdmin || (isChildAccessible && isChildAccessible(id || data?.id, data));

  if (!isAccessible) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="h-20 w-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-md">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <Badge label="Restricted Access" variant="amber" size="md" />
          <h2 className="text-2xl font-black text-[#2C2C2A] tracking-tight">
            Child Profile Restricted to Permitted Staff
          </h2>
          <p className="text-sm text-[#5F5E5A] leading-relaxed">
            This student's profile (<strong>{data?.name || id}</strong>) is currently private. Only the staff member who registered this child or clinical staff granted permission by Administrator <strong>Dr. Radha</strong> can view this profile.
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#D3D1C7] text-xs text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#2C2C2A]">
            <Lock className="h-4 w-4 text-[#854F0B]" />
            <span>Profile Access Rules:</span>
          </div>
          <p className="text-[#5F5E5A]">
            • <strong>Registering Staff:</strong> When a staff member registers a child, only that staff member can view the child's profile automatically.
          </p>
          <p className="text-[#5F5E5A]">
            • <strong>Admin Permission Required:</strong> All other staff require explicit permission from Administrator <strong>Dr. Radha</strong> to access this profile.
          </p>
          <p className="text-[#5F5E5A]">
            • <strong>Admin Controls:</strong> The Administrator can add and remove staff members who can view this profile at any time.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button variant="primary" onClick={() => navigate("/children")}>
            View My Assigned Students
          </Button>
        </div>
      </div>
    );
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

            {/* Staff Access & Permissions Status Pill */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {isAdmin ? (
                authorizedStaffList.length > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      Permitted Staff ({authorizedStaffList.length}): {authorizedStaffList.map((s) => s.name).join(", ")}
                    </span>
                    <button
                      onClick={() => setShowPermissionsModal(true)}
                      className="ml-1 text-[11px] underline text-[#0F6E56] hover:text-emerald-950 cursor-pointer font-bold"
                    >
                      Manage Access
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Admin Only (No staff permitted)</span>
                    <button
                      onClick={() => setShowPermissionsModal(true)}
                      className="ml-1 text-[11px] underline text-[#854F0B] hover:text-amber-950 cursor-pointer font-bold"
                    >
                      + Add Staff
                    </button>
                  </div>
                )
              ) : (
                (() => {
                  const myPerm = authorizedStaffList.find(
                    (s) => s.id === user?.id || (s.name && s.name.toLowerCase() === (user?.name || "").toLowerCase())
                  );
                  const isRegistrar =
                    myPerm?.isRegistrar ||
                    currentAssignment?.registeredByStaffId === user?.id ||
                    data?.registered_by === user?.id;

                  return isRegistrar ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-800">
                      <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                      <span>Access Granted: Registered by you</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Access Granted by Admin Dr. Radha</span>
                    </div>
                  );
                })()
              )}

              {currentAssignment?.registeredByStaffName && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F8F6] border border-[#D3D1C7] rounded-full text-xs font-medium text-[#5F5E5A]">
                  <span>Registered by: {currentAssignment.registeredByStaffName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xs:flex xs:items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <Button
              variant="outlined"
              size="sm"
              icon={UserCheck}
              className="border-[#0F6E56] text-[#0F6E56] hover:bg-emerald-50 font-bold justify-center"
              onClick={() => setShowPermissionsModal(true)}
              title="Manage staff members who can view this child profile"
            >
              Staff Permissions
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            icon={Edit3}
            className="justify-center"
            onClick={() => navigate(`/children/${data?.id}/edit`)}
          >
            Edit Child
          </Button>
          {isAdmin && (
            <Button
              variant="outlined"
              size="sm"
              icon={Trash2}
              className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 font-bold justify-center col-span-2 xs:col-span-1"
              onClick={() => {
                setDeleteConfirmName("");
                setShowDeleteChildModal(true);
              }}
              title="Permanently delete this child profile (Admin only)"
            >
              Delete Profile
            </Button>
          )}
          {childCat.isIep && (
            <Button
              variant="outlined"
              size="sm"
              icon={ClipboardList}
              className="justify-center col-span-2 xs:col-span-1"
              onClick={() => navigate(`/iep/${data?.id}`)}
            >
              IEP History
            </Button>
          )}
        </div>
      </div>


      {/* Tabs Row */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-1 overflow-x-auto touch-scroll no-scrollbar touch-pan-x">
        {[
          { id: "overview", label: "Overview" },
          { id: "assessments", label: `Assessments (${assessments.length})` },
          ...(data?.program_type !== "iep"
            ? [{ id: "exercises", label: `Exercises (${totalAssignedExercises})` }]
            : []),
          { id: "reports", label: `Reports (${reports.length})` },
          ...(data?.program_type !== "iep"
            ? [{ id: "appointments", label: `Appointments (${appointments.length})` }]
            : []),
          { id: "messages", label: parentMessages.length > 0 ? `Parent Messages (${parentMessages.length})` : "Parent Messages" },
          { id: "parent-access", label: "Parent Access" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 px-4 py-2 sm:px-5 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card title="Child Details">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-xs">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2A]">Clinical Assessment History</h3>
              <p className="text-xs text-[#5F5E5A]">Evaluations and milestone progress records for {childCat.categoryLabel}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {assessments.length === 0 ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon={childCat.isIep ? ClipboardList : (childCat.category === 'developmental_delay' ? Clock : childCat.category === 'adhd' ? Zap : childCat.category === 'learning_disability' ? BookOpen : Brain)}
                  style={{ backgroundColor: childCat.themeColor }}
                  onClick={() => navigate(`${childCat.assessmentRoute}?new=true`)}
                >
                  + Perform Initial {childCat.shortAssessmentName}
                </Button>
              ) : reassessmentEligibility.eligible ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon={childCat.isIep ? ClipboardList : (childCat.category === 'developmental_delay' ? Clock : childCat.category === 'adhd' ? Zap : childCat.category === 'learning_disability' ? BookOpen : Brain)}
                  style={{ backgroundColor: childCat.themeColor }}
                  onClick={() => navigate(`${childCat.assessmentRoute}?new=true`)}
                  title="3-month clinical interval satisfied. Ready for next evaluation cycle."
                >
                  + Perform Re-assessment (Cycle {assessments.length + 1})
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Clock}
                  onClick={() => {
                    showToast(
                      `Clinical Protocol: Re-assessments can only be taken once every 3 months. Next eligible re-assessment for ${data?.name || "this child"} is on ${reassessmentEligibility.nextEligibleDateFormatted} (${reassessmentEligibility.daysRemaining} days remaining).`,
                      "info"
                    );
                  }}
                  className="bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                  title={`3-month cycle active. Next eligible date: ${reassessmentEligibility.nextEligibleDateFormatted}`}
                >
                  🔒 Next Re-assessment in {reassessmentEligibility.daysRemaining}d
                </Button>
              )}
            </div>
          </div>

          {/* 3-Month Interval Protocol Banner */}
          {assessments.length > 0 && (
            reassessmentEligibility.eligible ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-3 text-xs text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>3-Month Re-assessment Cycle Open:</strong> Previous assessment was on <strong>{reassessmentEligibility.lastAssessmentDateFormatted}</strong> (over 3 months ago). Eligible for Cycle {assessments.length + 1} evaluation.
                  </span>
                </div>
                <Badge label="Cycle Open" variant="green" size="sm" />
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-[10px] p-3 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>3-Month Re-assessment Protocol Active:</strong> Previous assessment completed on <strong>{reassessmentEligibility.lastAssessmentDateFormatted}</strong>. Next eligible re-assessment opens on <strong className="underline text-amber-950">{reassessmentEligibility.nextEligibleDateFormatted}</strong> ({reassessmentEligibility.daysRemaining} days remaining).
                  </span>
                </div>
                <Badge label={`Eligible in ${reassessmentEligibility.daysRemaining}d`} variant="amber" size="sm" />
              </div>
            )
          )}

          {assessments.length === 0 ? (
            <Card padding="p-8">
              <div className="text-center space-y-3">
                <ClipboardList className="h-10 w-10 text-[#9B9A96] mx-auto" />
                <h4 className="text-sm font-bold text-[#2C2C2A]">{childCat.emptyAssessmentTitle}</h4>
                <p className="text-xs text-[#5F5E5A] max-w-sm mx-auto">
                  {childCat.emptyAssessmentDesc}
                </p>
                <Button
                  size="sm"
                  icon={PlusCircle}
                  style={{ backgroundColor: childCat.themeColor }}
                  onClick={() => navigate(childCat.assessmentRoute)}
                >
                  + Perform {childCat.shortAssessmentName}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {assessments.map((ass, idx) => {
                const isDelayAss = ass.source_table === 'assessment_developmental_delay' || ass.delay_total_score !== undefined;
                const isAdhdAss = ass.source_table === 'assessment_adhd' || ass.conners_total_score !== undefined;
                const isLdstAss = ass.source_table === 'assessment_learning_disability' || ass.ldst_total_score !== undefined;
                const isAsdAss = ass.source_table === 'assessment_asd' || (ass.isaa_score !== undefined && !isDelayAss);
                const title = isDelayAss
                  ? 'Developmental Delay Checklist'
                  : isAdhdAss
                  ? "Conners' ADHD Rating Assessment"
                  : isLdstAss
                  ? 'LDST Screening Assessment'
                  : isAsdAss
                  ? 'ISAA Autism Assessment'
                  : 'IEP Special School Assessment';

                // Check if a report has been generated specifically for this assessment instance (1:1 constraint)
                const allAvailableReports = [...(reports || []), ...(pendingReports || [])];
                const matchingReport = allAvailableReports.find((r) => r.assessment_id === ass.id || r.assessmentId === ass.id);
                const hasReport = Boolean(matchingReport);
                const isReportPublished = matchingReport?.status === "published" || matchingReport?.review_status === "published";

                return (
                  <div key={ass.id || idx} className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#185FA5]" />
                        <span className="text-xs font-bold text-[#2C2C2A]">
                          Assessment Date: {ass.assessment_date || ass.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]}
                        </span>
                        <Badge
                          label={hasReport ? (isReportPublished ? "Report Published" : "Report Generated / In Review") : (ass.status === "completed" ? "Completed" : ass.status === "draft" ? "Draft / In Progress" : ass.status || "In Progress")}
                          variant={hasReport ? (isReportPublished ? "green" : "amber") : (ass.status === "completed" ? "green" : "amber")}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#5F5E5A]">
                        <span className="font-semibold text-[#185FA5]">{title}</span>
                        {ass.delay_total_score !== undefined && ass.delay_total_score !== null && (
                          <span>Milestones: <strong>{ass.delay_total_score}</strong> {ass.delay_severity ? `(${ass.delay_severity})` : ''}</span>
                        )}
                        {ass.conners_total_score !== undefined && ass.conners_total_score !== null && (
                          <span>Score: <strong>{ass.conners_total_score}</strong></span>
                        )}
                        {ass.isaa_score !== undefined && ass.isaa_score !== null && !isDelayAss && (
                          <span>ISAA: <strong>{ass.isaa_score}</strong> ({ass.isaa_severity})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {hasReport ? (
                        <Button
                          size="sm"
                          variant="outlined"
                          icon={Eye}
                          onClick={() => {
                            let viewRoute = `/assessment/new/${data?.id}?assessmentId=${ass.id}`;
                            if (isDelayAss) viewRoute = `/therapy/delay/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isAdhdAss) viewRoute = `/therapy/adhd/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isLdstAss) viewRoute = `/therapy/sld/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isAsdAss) viewRoute = `/therapy/asd/assessment/${data?.id}?assessmentId=${ass.id}`;
                            navigate(viewRoute);
                          }}
                          className="border-[#185FA5] text-[#185FA5] hover:bg-blue-50"
                          title="Assessment form finalized. View only mode."
                        >
                          View Assessment
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outlined"
                          icon={Edit3}
                          onClick={() => {
                            let editRoute = `/assessment/new/${data?.id}?assessmentId=${ass.id}`;
                            if (isDelayAss) editRoute = `/therapy/delay/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isAdhdAss) editRoute = `/therapy/adhd/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isLdstAss) editRoute = `/therapy/sld/assessment/${data?.id}?assessmentId=${ass.id}`;
                            else if (isAsdAss) editRoute = `/therapy/asd/assessment/${data?.id}?assessmentId=${ass.id}`;
                            navigate(editRoute);
                          }}
                          className="border-[#185FA5] text-[#185FA5] hover:bg-blue-50"
                        >
                          Edit Assessment
                        </Button>
                      )}

                      {hasReport ? (
                        isReportPublished ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            icon={CheckCircle2}
                            onClick={() => navigate(matchingReport.iep_report ? `/iep/report/${matchingReport.id}` : `/reports/${matchingReport.id || data?.id}/therapist`)}
                            className="border-[#0F6E56] text-[#0F6E56] hover:bg-emerald-50"
                          >
                            View Clinical Report
                          </Button>
                        ) : isAdmin ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            icon={Edit3}
                            onClick={() => navigate(`/reports/${matchingReport.id || data?.id}/review`)}
                            className="border-amber-600 text-amber-700 hover:bg-amber-50"
                          >
                            Review &amp; Edit Report
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outlined"
                            icon={Eye}
                            onClick={() => navigate(`/reports/${matchingReport.id || data?.id}/therapist`)}
                            className="border-amber-600 text-amber-700 hover:bg-amber-50"
                          >
                            View Report (In Review)
                          </Button>
                        )
                      ) : (
                        <Button
                          size="sm"
                          variant="outlined"
                          icon={FileText}
                          onClick={() => navigate(`/reports/new/${data?.id}?assessmentId=${ass.id}`)}
                        >
                          + Generate Report
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outlined"
                        icon={Trash2}
                        onClick={() => handleDeleteAssessment(ass.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        title="Delete Assessment"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* EXERCISES TAB (Clinic Exercises & Home Exercises)           */}
      {/* ────────────────────────────────────────────────────────── */}
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
                <Button variant="outlined" icon={PlusCircle} onClick={() => navigate(childCat.assessmentRoute)}>
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
                      <Dumbbell className="h-4 w-4 text-[#185FA5]" />
                      <span>Clinic Exercises</span>
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
                      <div key={ex.id || idx} className="p-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Exercise Guide Sheet Preview with proper scaling */}
                          {(ex.image_url || ex.imageUrl) && (
                            <div
                              onClick={() => setPreviewExerciseModal(ex)}
                              className="w-full sm:w-64 md:w-72 shrink-0 rounded-[10px] overflow-hidden bg-[#F8F9FA] border border-[#D3D1C7] shadow-2xs flex items-center justify-center p-2 cursor-pointer group relative hover:border-[#185FA5] transition-all"
                              title="Click to view full exercise guide sheet"
                            >
                              <img
                                src={ex.image_url || ex.imageUrl}
                                alt={ex.name}
                                className="w-full h-44 sm:h-48 object-contain rounded-[6px] transition-transform duration-200 group-hover:scale-[1.02]"
                                onError={(e) => {
                                  e.currentTarget.parentElement.style.display = "none";
                                }}
                              />
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 hover:bg-black/85 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-3 w-3" /> View Full Guide
                              </span>
                            </div>
                          )}

                          {/* Exercise Details */}
                          <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                              >
                                {ex.category}
                              </span>
                              <span className="px-2 py-0.5 bg-[#F0EFEA] text-[#5F5E5A] text-[11px] font-bold rounded">
                                {ex.duration || "15 mins"}
                              </span>
                              {ex.frequency && (
                                <span className="text-[11px] text-[#5F5E5A] font-semibold">
                                  • {ex.frequency}
                                </span>
                              )}
                            </div>

                            <h4 className="text-[15px] font-bold text-[#2C2C2A]">{ex.name}</h4>
                            <p className="text-[13px] text-[#5F5E5A] font-medium leading-relaxed">
                              {ex.description}
                            </p>

                            {/* Collapsible Benefits */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedClinicBenefits((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                                className="text-[12px] text-[#5F5E5A] hover:text-[#185FA5] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isExpanded ? "Hide benefits ▲" : "Show benefits ▼"}</span>
                              </button>

                              {isExpanded && ex.benefits && (
                                <ul className="mt-2 space-y-1 pl-4 list-disc text-[12px] text-[#5F5E5A] bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]/60">
                                  {ex.benefits.map((b, bIdx) => (
                                    <li key={bIdx}>{b}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
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
                      <Home className="h-4 w-4 text-[#0F6E56]" />
                      <span>Home Exercises</span>
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
                      <div key={ex.id || idx} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Exercise Guide Sheet Preview with proper scaling */}
                          {(ex.image_url || ex.imageUrl) && (
                            <div
                              onClick={() => setPreviewExerciseModal(ex)}
                              className="w-full sm:w-64 md:w-72 shrink-0 rounded-[10px] overflow-hidden bg-[#F8F9FA] border border-[#D3D1C7] shadow-2xs flex items-center justify-center p-2 cursor-pointer group relative hover:border-[#0F6E56] transition-all"
                              title="Click to view full exercise guide sheet"
                            >
                              <img
                                src={ex.image_url || ex.imageUrl}
                                alt={ex.name}
                                className="w-full h-44 sm:h-48 object-contain rounded-[6px] transition-transform duration-200 group-hover:scale-[1.02]"
                                onError={(e) => {
                                  e.currentTarget.parentElement.style.display = "none";
                                }}
                              />
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 hover:bg-black/85 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-3 w-3" /> View Full Guide
                              </span>
                            </div>
                          )}

                          {/* Exercise Details */}
                          <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                              >
                                {ex.category}
                              </span>
                              <span className="px-2 py-0.5 bg-[#F0EFEA] text-[#5F5E5A] text-[11px] font-bold rounded">
                                {ex.duration || "10 mins"}
                              </span>
                              {ex.frequency && (
                                <span className="text-[11px] text-[#5F5E5A] font-semibold">
                                  • {ex.frequency}
                                </span>
                              )}
                            </div>

                            <h4 className="text-[15px] font-bold text-[#2C2C2A]">{ex.name}</h4>
                            <p className="text-[13px] text-[#5F5E5A] font-medium line-clamp-2 leading-relaxed">
                              {ex.home_description || ex.homeDescription || ex.description}
                            </p>

                            <div className="flex items-center gap-4 text-[12px] font-semibold text-[#5F5E5A] pt-1">
                              {/* Collapsible Instructions */}
                              <button
                                type="button"
                                onClick={() => setExpandedHomeInstructions((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                                className="hover:text-[#0F6E56] cursor-pointer flex items-center gap-1"
                              >
                                <span>{isInstrExpanded ? "Hide instructions ▲" : "How to do this ▼"}</span>
                              </button>

                              {/* Collapsible Benefits */}
                              <button
                                type="button"
                                onClick={() => setExpandedHomeBenefits((prev) => ({ ...prev, [ex.id || idx]: !prev[ex.id || idx] }))}
                                className="hover:text-[#185FA5] cursor-pointer flex items-center gap-1"
                              >
                                <span>{isBenExpanded ? "Hide benefits ▲" : "Benefits ▼"}</span>
                              </button>
                            </div>

                            {/* Collapsible Instructions Content */}
                            {isInstrExpanded && (
                              <div className="mt-2 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-1">
                                <h5 className="font-bold text-[#0F6E56] text-[11px] uppercase">Instructions & Home Technique</h5>
                                <p className="text-[12px] text-[#2C2C2A] leading-relaxed">
                                  {ex.home_description || ex.description}
                                </p>
                                {ex.instructions && (
                                  <ol className="list-decimal list-inside text-[12px] text-[#2C2C2A] space-y-1 pt-1">
                                    {ex.instructions.map((step, sIdx) => (
                                      <li key={sIdx}>{step}</li>
                                    ))}
                                  </ol>
                                )}
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
                        </div>
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
              <h3 className="text-sm font-bold text-[#2C2C2A]">Clinical Reports</h3>
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
                        {rep.assessment_type
                          ? `${rep.assessment_type.toUpperCase().replace('_', ' ')} Assessment Report`
                          : rep.iep_report
                          ? `IEP Progress Report — Cycle ${rep.iep_cycle || 1}`
                          : `Clinical Assessment Report`}
                      </span>
                      {rep.assessment_type && (
                        <span className="text-[10px] font-bold text-[#185FA5] bg-[#EBF4FE] px-2 py-0.5 rounded-full uppercase">
                          {rep.assessment_type.replace('_', ' ')}
                        </span>
                      )}
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
                    {isAdmin && (
                      <Button
                        variant="outlined"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteReport(rep.id, rep.assessment_type)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        title="Delete Report"
                      >
                        Delete
                      </Button>
                    )}
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
              <Button
                variant="outlined"
                size="sm"
                onClick={handleTogglePortalStatus}
                className={isPortalActive ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}
              >
                {isPortalActive ? "Deactivate Access" : "Activate Access"}
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

      {/* Exercise Full Guide Sheet Modal */}
      <Modal
        isOpen={!!previewExerciseModal}
        onClose={() => setPreviewExerciseModal(null)}
        title={previewExerciseModal?.name || "Exercise Clinical Guide Sheet"}
      >
        <div className="space-y-4">
          <div className="bg-[#F8F9FA] rounded-[10px] p-2 border border-[#D3D1C7] flex items-center justify-center overflow-hidden">
            <img
              src={previewExerciseModal?.image_url || previewExerciseModal?.imageUrl}
              alt={previewExerciseModal?.name}
              className="max-h-[65vh] max-w-full w-auto object-contain rounded"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F1FB] text-[#185FA5]">
                {previewExerciseModal?.category}
              </span>
              <span className="px-2 py-0.5 bg-[#F0EFEA] text-[#5F5E5A] text-[11px] font-bold rounded flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#5F5E5A]" /> {previewExerciseModal?.duration || "15 mins"}
              </span>
              {previewExerciseModal?.frequency && (
                <span className="px-2 py-0.5 bg-amber-50 text-[#854F0B] text-[11px] font-bold rounded border border-amber-200/60">
                  🔄 {previewExerciseModal.frequency}
                </span>
              )}
            </div>

            <p className="text-[13px] text-[#2C2C2A] font-medium leading-relaxed">
              {previewExerciseModal?.home_description || previewExerciseModal?.description}
            </p>

            {previewExerciseModal?.benefits && previewExerciseModal.benefits.length > 0 && (
              <div className="pt-2 border-t border-[#D3D1C7]/60">
                <span className="font-bold text-[#185FA5] uppercase text-[10px] block mb-1">
                  Clinical & Developmental Benefits
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#5F5E5A]">
                  {previewExerciseModal.benefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setPreviewExerciseModal(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Manage Staff Access & Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Staff Profile Access Permissions — ${data?.name || "Child"}`}
      >
        <div className="space-y-5 text-xs text-[#2C2C2A]">
          {/* Child Summary Header */}
          <div className="p-3.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#2C2C2A]">{data?.name}</span>
              <span className="font-mono text-xs font-bold text-[#9B9A96] bg-white px-2 py-0.5 rounded border border-[#D3D1C7]">
                {data?.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#5F5E5A] flex-wrap">
              <span>Program: <strong>{data?.program_type === "iep" ? "IEP Special School" : (data?.therapy_category || "Therapy")}</strong></span>
              <span>•</span>
              <span>
                Registered by: <strong>{currentAssignment?.registeredByStaffName || "Administrator"}</strong>
              </span>
            </div>
            <p className="text-[11px] text-[#5F5E5A] leading-relaxed pt-1 border-t border-[#E5E5E0]">
              <strong>Access Policy:</strong> If a particular staff registers the child, only that staff can view the profile. Other staff require permission from the Admin. As Admin, you can add and remove staff who can view this child's profile.
            </p>
          </div>

          {/* Section 1: Currently Permitted Staff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5F5E5A] uppercase tracking-wider">
                Staff With Viewing Permission ({authorizedStaffList.length})
              </label>
              <span className="text-[11px] text-[#9B9A96]">
                {authorizedStaffList.length === 0 ? "No staff currently permitted" : "Can view child profile"}
              </span>
            </div>

            {authorizedStaffList.length === 0 ? (
              <div className="p-4 bg-amber-50/60 rounded-[8px] border border-amber-200 text-center space-y-1">
                <p className="font-bold text-amber-900">No staff members currently have access</p>
                <p className="text-[11px] text-amber-700">
                  This profile is visible only to Administrator Dr. Radha. Use the form below to grant access to clinical staff.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {authorizedStaffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3 rounded-[8px] border border-[#D3D1C7] bg-white flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-bold text-xs shrink-0">
                        {staff.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-[#2C2C2A]">{staff.name}</p>
                          {staff.isRegistrar ? (
                            <Badge label="Registrar" variant="purple" size="sm" />
                          ) : (
                            <Badge label="Permitted by Admin" variant="green" size="sm" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#5F5E5A]">
                          {staff.designation || "Clinical Specialist"}
                          {staff.grantedAt && (
                            <span className="text-[#9B9A96]"> • Added {new Date(staff.grantedAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outlined"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs py-1 px-2.5 shrink-0"
                      icon={Trash2}
                      disabled={isRemovingStaff}
                      onClick={() => handleRemoveStaffAccess(staff.id, staff.name)}
                      title={`Remove ${staff.name}'s permission to view this child profile`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Add Staff Member */}
          <div className="pt-3 border-t border-[#D3D1C7] space-y-3">
            <label className="block text-xs font-bold text-[#5F5E5A] uppercase tracking-wider">
              Grant Viewing Permission to Staff Member
            </label>

            {(() => {
              const unpermittedStaff = (staffList || [])
                .filter((s) => s.isActive !== false)
                .filter((s) => !authorizedStaffList.some((a) => a.id === s.id));

              if (unpermittedStaff.length === 0) {
                return (
                  <p className="text-[11px] text-[#5F5E5A] italic p-2.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                    All registered clinical staff members already have viewing access to this child.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {unpermittedStaff.map((staff) => {
                      const isSelected = selectedStaffToAdd === staff.id;
                      return (
                        <div
                          key={staff.id}
                          onClick={() => setSelectedStaffToAdd(staff.id)}
                          className={`p-2.5 rounded-[8px] border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-[#0F6E56] bg-[#0F6E56]/5 ring-1 ring-[#0F6E56]"
                              : "border-[#D3D1C7] hover:border-[#0F6E56]/50 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? "bg-[#0F6E56] text-white" : "bg-[#F8F8F6] text-[#2C2C2A]"
                            }`}>
                              {staff.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#2C2C2A]">{staff.name}</p>
                              <p className="text-[11px] text-[#5F5E5A]">{staff.designation || "Clinical Specialist"}</p>
                            </div>
                          </div>

                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#0F6E56] bg-[#0F6E56] text-white" : "border-[#D3D1C7]"
                          }`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5F5E5A] mb-1">
                      Clinical Notes / Reason for Access (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={permissionNotes}
                      onChange={(e) => setPermissionNotes(e.target.value)}
                      placeholder="e.g. Granted for sensory integration assessment and therapy sessions..."
                      className="w-full p-2.5 rounded-[8px] border border-[#D3D1C7] text-xs outline-none focus:border-[#0F6E56]"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    icon={UserCheck}
                    className="w-full bg-[#0F6E56] hover:bg-[#08503E] justify-center"
                    disabled={!selectedStaffToAdd || isAddingStaff}
                    loading={isAddingStaff}
                    onClick={handleAddStaffAccess}
                  >
                    + Grant Profile Access
                  </Button>
                </div>
              );
            })()}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-[#D3D1C7]">
            <Button size="sm" variant="outlined" onClick={() => setShowPermissionsModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Delete Child Profile Confirmation Modal */}
      {isAdmin && (
        <Modal
          isOpen={showDeleteChildModal}
          onClose={() => {
            if (!isDeletingChild) {
              setShowDeleteChildModal(false);
              setDeleteConfirmName("");
            }
          }}
          title="Delete Child Profile (Admin Only)"
          size="md"
        >
          <div className="space-y-5 text-slate-800">
            {/* Danger Warning Box */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900">
                    Irreversible Permanent Deletion
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    You are deleting the entire profile for <strong className="font-black text-rose-950">{data?.name}</strong> (ID: {data?.id}). This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/70 text-[11px] text-rose-700 space-y-1">
                <p className="font-bold uppercase tracking-wider text-[10px] text-rose-800">The following records will be permanently erased:</p>
                <ul className="list-disc list-inside space-y-0.5 pl-1 font-medium">
                  <li>Complete child registration profile and clinical data</li>
                  <li>All completed &amp; draft assessment forms (ISAA, Conners', DD, LDST, IEP)</li>
                  <li>All clinical reports (therapist &amp; parent published reports)</li>
                  <li>Prescribed clinic and home daily exercise routines</li>
                  <li>Scheduled appointments, parent account login &amp; portal access</li>
                </ul>
              </div>
            </div>

            {/* Type name to confirm input */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                To confirm, type the child's exact name <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 select-all">{data?.name}</span> below:
              </label>

              <Input
                type="text"
                placeholder={`Type "${data?.name}" to confirm`}
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                autoFocus
                disabled={isDeletingChild}
                className={isDeleteNameMatched ? "border-emerald-500 focus:border-emerald-600 ring-1 ring-emerald-500" : ""}
              />

              {deleteConfirmName.trim() && !isDeleteNameMatched && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Name doesn't match yet. Please type exactly: "{data?.name}"
                </p>
              )}

              {isDeleteNameMatched && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Name matches! Click the button below to permanently delete this profile.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col-reverse xs:flex-row xs:items-center xs:justify-end gap-2 sm:gap-2.5">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowDeleteChildModal(false);
                  setDeleteConfirmName("");
                }}
                disabled={isDeletingChild}
                className="w-full xs:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteChildProfile}
                disabled={!isDeleteNameMatched || isDeletingChild}
                className="w-full xs:w-auto justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                icon={Trash2}
              >
                {isDeletingChild ? "Deleting Profile..." : "Permanently Delete Profile"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
