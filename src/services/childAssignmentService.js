import { db } from "../lib/db.js";

/**
 * Child Assignment & Access Control Service
 * 
 * Rules:
 * 1. Admin has access to ALL child profiles at all times.
 * 2. If a particular staff registers a child, that staff can view the profile of the child.
 * 3. Other staff cannot view that child's profile without permission from the admin.
 * 4. The admin can add staff members who can view the child's profile.
 * 5. The admin can remove staff members who can view the child's profile.
 * 6. If a staff member's permission is removed by admin, they can no longer view the profile.
 */

const STORAGE_KEY = "kcr_child_assignments";
const LISTENERS = new Set();

function getStorageAssignments() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("childAssignmentService read notice:", e);
    return {};
  }
}

function setStorageAssignments(assignments) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    // Notify all listeners within same window
    LISTENERS.forEach((fn) => {
      try {
        fn(assignments);
      } catch (_) {}
    });
    // Dispatch window storage event for multi-tab sync
    window.dispatchEvent(new Event("child-assignments-updated"));
  } catch (e) {
    console.warn("childAssignmentService write notice:", e);
  }
}

/**
 * Normalize an assignment record to ensure authorizedStaff and revokedStaffIds arrays exist
 */
function normalizeRecord(record, childId) {
  if (!record) return null;
  const authorizedStaff = Array.isArray(record.authorizedStaff)
    ? [...record.authorizedStaff]
    : [];
  const revokedStaffIds = Array.isArray(record.revokedStaffIds)
    ? [...record.revokedStaffIds]
    : [];

  // Migration for legacy records without authorizedStaff
  if (record.authorizedStaff === undefined) {
    if (record.registeredByStaffId && !revokedStaffIds.includes(record.registeredByStaffId)) {
      authorizedStaff.push({
        id: record.registeredByStaffId,
        name: record.registeredByStaffName || "Staff (Registrar)",
        designation: record.assignedStaffDesignation || "Clinical Specialist",
        isRegistrar: true,
        role: "registrar",
        grantedBy: "Registration",
        grantedAt: record.registeredAt || new Date().toISOString()
      });
    }
    if (
      record.assignedStaffId &&
      record.assignedStaffId !== record.registeredByStaffId &&
      !revokedStaffIds.includes(record.assignedStaffId) &&
      !authorizedStaff.some((s) => s.id === record.assignedStaffId)
    ) {
      authorizedStaff.push({
        id: record.assignedStaffId,
        name: record.assignedStaffName || "Staff Member",
        designation: record.assignedStaffDesignation || "Clinical Specialist",
        isRegistrar: false,
        role: "permitted",
        grantedBy: "Admin",
        grantedAt: record.assignedAt || new Date().toISOString()
      });
    }
  }

  return {
    ...record,
    childId: record.childId || childId,
    authorizedStaff,
    revokedStaffIds
  };
}

export const childAssignmentService = {
  /**
   * Subscribe to assignment changes
   */
  subscribe(callback) {
    LISTENERS.add(callback);
    return () => LISTENERS.delete(callback);
  },

  /**
   * Get all assignments map: { [childId]: AssignmentRecord }
   */
  getAllAssignments() {
    const raw = getStorageAssignments();
    const normalized = {};
    Object.entries(raw).forEach(([childId, rec]) => {
      normalized[childId] = normalizeRecord(rec, childId);
    });
    return normalized;
  },

  /**
   * Get assignment for a single child
   */
  getAssignment(childId) {
    if (!childId) return null;
    const all = getStorageAssignments();
    const rec = all[childId];
    return rec ? normalizeRecord(rec, childId) : null;
  },

  /**
   * Record when a child is registered by a user (staff or admin)
   * If registered by staff: they are granted immediate access as the registrar.
   * If registered by admin: no staff has access yet until admin explicitly grants permission.
   */
  recordStaffRegistration(childId, staffUser) {
    if (!childId || !staffUser) return null;
    const all = getStorageAssignments();
    const raw = all[childId] || { childId, history: [] };
    const existing = normalizeRecord(raw, childId);

    const isStaff = staffUser.role === "staff";
    const staffId = staffUser.id || staffUser.userId;
    const staffName = staffUser.name || staffUser.username || "Staff";
    const staffDesignation = staffUser.designation || "Clinical Specialist";

    const authorizedStaff = isStaff
      ? [
          {
            id: staffId,
            name: staffName,
            designation: staffDesignation,
            isRegistrar: true,
            role: "registrar",
            grantedBy: "Registration",
            grantedAt: new Date().toISOString()
          }
        ]
      : [];

    const updated = {
      ...existing,
      childId,
      registeredByStaffId: isStaff ? staffId : null,
      registeredByStaffName: isStaff ? staffName : (staffUser.name || "Administrator"),
      registeredByRole: staffUser.role || "staff",
      registeredAt: new Date().toISOString(),
      authorizedStaff,
      revokedStaffIds: (existing.revokedStaffIds || []).filter((id) => id !== staffId),
      assignedStaffId: isStaff ? staffId : null,
      assignedStaffName: isStaff ? staffName : null,
      assignedStaffDesignation: isStaff ? staffDesignation : null,
      history: [
        {
          action: "registered",
          staffId: isStaff ? staffId : null,
          registeredBy: staffName,
          role: staffUser.role || "staff",
          timestamp: new Date().toISOString()
        },
        ...(existing.history || [])
      ]
    };

    all[childId] = updated;
    setStorageAssignments(all);
    return updated;
  },

  /**
   * Get all staff permitted to view this child profile
   */
  getAuthorizedStaff(childId) {
    if (!childId) return [];
    const assignment = this.getAssignment(childId);
    return assignment?.authorizedStaff || [];
  },

  /**
   * Grant permission to a staff member to view this child profile (Admin action)
   */
  async addStaffPermission(childId, staffMember, { grantedBy = "Admin", notes = "" } = {}) {
    if (!childId || !staffMember) return null;

    const all = getStorageAssignments();
    const raw = all[childId] || {
      childId,
      authorizedStaff: [],
      revokedStaffIds: [],
      history: []
    };
    const existing = normalizeRecord(raw, childId);

    const staffId = staffMember.id || staffMember.userId;
    const staffName = staffMember.name || staffMember.username || "Staff";
    const staffDesignation = staffMember.designation || "Clinical Specialist";

    // Remove staffId from revoked list if present
    const updatedRevoked = (existing.revokedStaffIds || []).filter((id) => id !== staffId);

    const currentAuthorized = Array.isArray(existing.authorizedStaff) ? [...existing.authorizedStaff] : [];
    const existingIndex = currentAuthorized.findIndex(
      (s) => s.id === staffId || (s.name && s.name.toLowerCase() === staffName.toLowerCase())
    );

    const newStaffItem = {
      id: staffId,
      name: staffName,
      designation: staffDesignation,
      isRegistrar: existing.registeredByStaffId === staffId,
      role: existing.registeredByStaffId === staffId ? "registrar" : "permitted",
      grantedBy,
      grantedAt: new Date().toISOString(),
      notes: notes || ""
    };

    if (existingIndex >= 0) {
      currentAuthorized[existingIndex] = { ...currentAuthorized[existingIndex], ...newStaffItem };
    } else {
      currentAuthorized.push(newStaffItem);
    }

    const updated = {
      ...existing,
      childId,
      authorizedStaff: currentAuthorized,
      revokedStaffIds: updatedRevoked,
      assignedStaffId: existing.assignedStaffId || staffId,
      assignedStaffName: existing.assignedStaffName || staffName,
      assignedStaffDesignation: existing.assignedStaffDesignation || staffDesignation,
      notes: notes || existing.notes || "",
      history: [
        {
          action: "permission_granted",
          staffId,
          staffName,
          grantedBy,
          timestamp: new Date().toISOString(),
          notes: notes || ""
        },
        ...(existing.history || [])
      ]
    };

    all[childId] = updated;
    setStorageAssignments(all);

    // Try persisting to Supabase if applicable
    try {
      await db.update(
        "children",
        {
          assigned_staff_id: staffId,
          assigned_staff_name: staffName
        },
        { id: childId }
      ).catch(() => {});
    } catch (_) {}

    return updated;
  },

  /**
   * Remove permission for a staff member to view this child profile (Admin action)
   */
  async removeStaffPermission(childId, staffId, { removedBy = "Admin", reason = "" } = {}) {
    if (!childId || !staffId) return null;

    const all = getStorageAssignments();
    const raw = all[childId];
    if (!raw) return null;
    const existing = normalizeRecord(raw, childId);

    const currentAuthorized = Array.isArray(existing.authorizedStaff) ? [...existing.authorizedStaff] : [];
    const removedStaff = currentAuthorized.find((s) => s.id === staffId);
    const updatedAuthorized = currentAuthorized.filter((s) => s.id !== staffId);

    const currentRevoked = Array.isArray(existing.revokedStaffIds) ? [...existing.revokedStaffIds] : [];
    if (!currentRevoked.includes(staffId)) {
      currentRevoked.push(staffId);
    }

    let newAssignedId = existing.assignedStaffId;
    let newAssignedName = existing.assignedStaffName;
    let newAssignedDesignation = existing.assignedStaffDesignation;

    // If removing the primary assigned staff, shift to next permitted staff or null
    if (existing.assignedStaffId === staffId) {
      if (updatedAuthorized.length > 0) {
        newAssignedId = updatedAuthorized[0].id;
        newAssignedName = updatedAuthorized[0].name;
        newAssignedDesignation = updatedAuthorized[0].designation;
      } else {
        newAssignedId = null;
        newAssignedName = null;
        newAssignedDesignation = null;
      }
    }

    const updated = {
      ...existing,
      authorizedStaff: updatedAuthorized,
      revokedStaffIds: currentRevoked,
      assignedStaffId: newAssignedId,
      assignedStaffName: newAssignedName,
      assignedStaffDesignation: newAssignedDesignation,
      history: [
        {
          action: "permission_revoked",
          staffId,
          staffName: removedStaff?.name || "Staff",
          removedBy,
          timestamp: new Date().toISOString(),
          notes: reason || ""
        },
        ...(existing.history || [])
      ]
    };

    all[childId] = updated;
    setStorageAssignments(all);

    try {
      await db.update(
        "children",
        {
          assigned_staff_id: newAssignedId,
          assigned_staff_name: newAssignedName
        },
        { id: childId }
      ).catch(() => {});
    } catch (_) {}

    return updated;
  },

  /**
   * Assign or forward child to a staff member (Admin action, alias to addStaffPermission)
   */
  async assignChild(childId, staffMember, { notes = "", assignedBy = "Admin" } = {}) {
    return this.addStaffPermission(childId, staffMember, { grantedBy: assignedBy, notes });
  },

  /**
   * Forward a child profile to a staff member (alias with forwarding history note)
   */
  async forwardChild(childId, staffMember, { notes = "", forwardedBy = "Admin" } = {}) {
    return this.addStaffPermission(childId, staffMember, {
      grantedBy: forwardedBy,
      notes: notes ? `Forwarded: ${notes}` : "Forwarded by Administrator"
    });
  },

  /**
   * Remove child primary assignment (Admin action)
   */
  async unassignChild(childId, { unassignedBy = "Admin" } = {}) {
    if (!childId) return null;
    const assignment = this.getAssignment(childId);
    if (!assignment) return null;

    if (assignment.assignedStaffId) {
      return this.removeStaffPermission(childId, assignment.assignedStaffId, {
        removedBy: unassignedBy,
        reason: "Unassigned by Administrator"
      });
    }
    return assignment;
  },

  /**
   * Record when staff completes an assessment (audit history)
   */
  async recordStaffAssessment(childId, staffUser, assessmentType = "Clinical Assessment") {
    if (!childId || !staffUser) return;
    const staffId = staffUser.id;
    const staffName = staffUser.name || staffUser.username || "Staff";

    const all = getStorageAssignments();
    const raw = all[childId] || { childId, history: [] };
    const existing = normalizeRecord(raw, childId);

    const assessedIds = Array.isArray(existing.assessedByStaffIds) ? [...existing.assessedByStaffIds] : [];
    const assessedNames = Array.isArray(existing.assessedByStaffNames) ? [...existing.assessedByStaffNames] : [];

    if (staffId && !assessedIds.includes(staffId)) {
      assessedIds.push(staffId);
    }
    if (staffName && !assessedNames.includes(staffName)) {
      assessedNames.push(staffName);
    }

    const updated = {
      ...existing,
      childId,
      assessedByStaffIds: assessedIds,
      assessedByStaffNames: assessedNames,
      lastAssessedAt: new Date().toISOString(),
      lastAssessedBy: staffName,
      history: [
        {
          action: "assessed",
          assessmentType,
          staffId,
          staffName,
          timestamp: new Date().toISOString()
        },
        ...(existing.history || [])
      ]
    };

    all[childId] = updated;
    setStorageAssignments(all);
    return updated;
  },

  /**
   * Check whether a user is authorized to view a child profile
   * Rules:
   * 1. Admin can view ALL child profiles.
   * 2. Parent can view only their linked child.
   * 3. Staff can view ONLY if:
   *    - They registered the child (and their access was not revoked by Admin), OR
   *    - The admin granted them permission (they are in authorizedStaff).
   * 4. Any staff not in authorizedStaff or explicitly revoked CANNOT view the profile.
   */
  canStaffAccess(childId, user, childData = null) {
    if (!user) return false;

    // 1. Admins have access to ALL child profiles
    if (user.role === "admin") return true;

    // 2. Parents can only access their linked child
    if (user.role === "parent") {
      return (
        user.childId === childId ||
        user.child_id === childId
      );
    }

    // 3. For Staff:
    if (user.role === "staff") {
      const assignment = this.getAssignment(childId);

      if (assignment) {
        // If admin explicitly revoked this staff member's permission, deny access
        if (
          Array.isArray(assignment.revokedStaffIds) &&
          (assignment.revokedStaffIds.includes(user.id) ||
           (user.username && assignment.revokedStaffIds.includes(user.username)))
        ) {
          return false;
        }

        // If authorizedStaff array exists, it is the primary authority
        if (Array.isArray(assignment.authorizedStaff) && assignment.authorizedStaff.length > 0) {
          const isAuthorized = assignment.authorizedStaff.some(
            (s) =>
              s.id === user.id ||
              (user.username && s.id === user.username) ||
              (s.name && user.name && s.name.toLowerCase() === user.name.toLowerCase())
          );
          if (isAuthorized) return true;
          // If authorized staff array exists and this staff is not in it, deny access
          return false;
        }

        // Legacy fallbacks for records before migration
        if (assignment.registeredByStaffId && assignment.registeredByStaffId === user.id) {
          return true;
        }
        if (assignment.assignedStaffId && assignment.assignedStaffId === user.id) {
          return true;
        }
        if (assignment.assignedStaffName && user.name && assignment.assignedStaffName.toLowerCase() === user.name.toLowerCase()) {
          return true;
        }
      }

      // Check if child record directly states registered_by matches user.id and not revoked
      if (childData && childData.registered_by && childData.registered_by === user.id) {
        if (assignment && Array.isArray(assignment.revokedStaffIds) && assignment.revokedStaffIds.includes(user.id)) {
          return false;
        }
        return true;
      }

      return false;
    }

    return false;
  },

  /**
   * Filter child list based on user permissions
   */
  filterChildrenForUser(childrenList = [], user) {
    if (!Array.isArray(childrenList)) return [];
    if (!user) return [];
    if (user.role === "admin") return childrenList; // Admin sees ALL

    return childrenList.filter((c) => this.canStaffAccess(c.id, user, c));
  },

  /**
   * Delete assignment record for a child
   */
  deleteAssignment(childId) {
    if (!childId) return;
    const assignments = getStorageAssignments();
    if (assignments[childId]) {
      delete assignments[childId];
      setStorageAssignments(assignments);
    }
  }
};
