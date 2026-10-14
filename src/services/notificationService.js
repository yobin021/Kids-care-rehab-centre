import { reportService } from './reportService';
import { iepService } from './iepService';

/**
 * Service to aggregate and manage clinical review notifications for administrators.
 */
export const notificationService = {
  /**
   * Dispatches a global event so all UI components update in real time.
   */
  notifyChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clinical_notifications_changed'));
    }
  },

  /**
   * Fetches all pending report notifications across therapy pathways and IEP programs.
   * @param {Array} childrenList Optional children list to resolve names if not joined.
   */
  async getAdminNotifications(childrenList = []) {
    const notifications = [];
    const seenChildIds = new Set();
    const seenReportIds = new Set();

    const childMap = new Map();
    if (Array.isArray(childrenList)) {
      childrenList.forEach((c) => {
        if (c?.id) childMap.set(c.id, c);
        if (c?.custom_id) childMap.set(c.custom_id, c);
      });
    }

    // 1. Fetch therapy pathway pending reports
    try {
      const therapyPending = await reportService.getAllPending();
      if (Array.isArray(therapyPending)) {
        therapyPending.forEach((rep) => {
          if (!rep) return;
          const repId = rep.id;
          const childId = rep.child_id || rep.childId;
          const resolvedChild = childMap.get(childId);
          const childName = rep.children?.name || resolvedChild?.name || rep.childName || `Child (${childId || 'Patient'})`;
          
          let displayPathway = "Therapy Pathway";
          const at = (rep.assessment_type || "").toLowerCase();
          if (at.includes("asd") || at.includes("autism") || at.includes("isaa")) displayPathway = "ISAA Autism";
          else if (at.includes("adhd") || at.includes("conner")) displayPathway = "Conners' ADHD";
          else if (at.includes("delay") || at.includes("developmental")) displayPathway = "Developmental Delay";
          else if (at.includes("learn") || at.includes("ldst") || at.includes("sld")) displayPathway = "Learning Disability";
          else if (at.includes("iep") || at.includes("special")) displayPathway = "Special School IEP";

          if (repId) seenReportIds.add(repId);
          if (childId) seenChildIds.add(childId);

          notifications.push({
            id: `notif-rep-${repId || childId}`,
            reportId: repId,
            childId: childId,
            childName: childName,
            pathway: displayPathway,
            preparedBy: rep.prepared_by || "Clinical Staff",
            createdAt: rep.created_at || rep.submitted_for_review_at || new Date().toISOString(),
            message: `Report generated for ${childName}. Please review and submit/publish it.`,
            reviewUrl: `/reports/${childId}/review`,
            isIep: false
          });
        });
      }
    } catch (err) {
      console.warn("notificationService therapy pending fetch warning:", err);
    }

    // 2. Fetch IEP program pending reports
    try {
      const iepPending = await iepService.getPendingReview();
      if (Array.isArray(iepPending)) {
        iepPending.forEach((iep) => {
          if (!iep) return;
          const repId = iep.id;
          const childId = iep.child_id || iep.childId;
          const resolvedChild = childMap.get(childId);
          const childName = iep.children?.name || resolvedChild?.name || iep.childName || `Student (${childId || 'IEP'})`;

          if (repId && seenReportIds.has(repId)) return;
          if (repId) seenReportIds.add(repId);
          if (childId) seenChildIds.add(childId);

          notifications.push({
            id: `notif-iep-${repId || childId}`,
            reportId: repId,
            childId: childId,
            childName: childName,
            pathway: "Special School IEP",
            preparedBy: iep.prepared_by || "Special Educator",
            createdAt: iep.created_at || iep.submitted_for_review_at || new Date().toISOString(),
            message: `IEP Progress Report generated for ${childName}. Please review and submit/publish it.`,
            reviewUrl: repId ? `/iep/report/${repId}/review` : `/reports/${childId}/review`,
            isIep: true
          });
        });
      }
    } catch (err) {
      console.warn("notificationService IEP pending fetch warning:", err);
    }

    // 3. Fallback: inspect localStorage for pending drafts
    if (typeof window !== "undefined") {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("report_draft_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const draft = JSON.parse(raw);
              if (draft && (draft.status === "pending_review" || draft.review_status === "pending_review")) {
                const childId = draft.childId || draft.child_id || key.replace("report_draft_", "");
                // If not already in DB list:
                if (childId && !seenChildIds.has(childId)) {
                  seenChildIds.add(childId);
                  const resolvedChild = childMap.get(childId);
                  const childName = draft.childName || resolvedChild?.name || `Child (${childId})`;
                  const at = (draft.assessment_type || draft.formState?.assessment_type || "").toLowerCase();
                  let displayPathway = "Therapy Pathway";
                  if (at.includes("asd") || at.includes("autism")) displayPathway = "ISAA Autism";
                  else if (at.includes("adhd")) displayPathway = "Conners' ADHD";
                  else if (at.includes("delay")) displayPathway = "Developmental Delay";
                  else if (at.includes("learn") || at.includes("ldst")) displayPathway = "Learning Disability";
                  else if (at.includes("iep")) displayPathway = "Special School IEP";

                  notifications.push({
                    id: `notif-local-${childId}`,
                    reportId: draft.reportId || draft.id || childId,
                    childId: childId,
                    childName: childName,
                    pathway: displayPathway,
                    preparedBy: draft.formState?.therapistReport?.preparedBy || draft.preparedBy || "Therapist",
                    createdAt: draft.updatedDate || new Date().toISOString(),
                    message: `Report generated for ${childName}. Please review and submit/publish it.`,
                    reviewUrl: `/reports/${childId}/review`,
                    isIep: displayPathway === "Special School IEP"
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("notificationService localStorage check notice:", err);
      }
    }

    // Sort newest first
    return notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
};
