/**
 * Helper to trigger browser print with formatted file name:
 * child_name_child_id_report_no.pdf
 * e.g. Rohan_Gupta_KCR-2026-001_report_2.pdf
 */
import { db } from "../lib/db";
import { assessmentService } from "../services/assessmentService";

/**
 * Normalizes and formats the file name string:
 * child_name_child_id_report_no
 */
export function formatReportFilename({ childName, childId, reportNo = 1 }) {
  const cleanName = (childName || "Child")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_");

  let cleanId = (childId || "ID").trim();
  // If it's a 36-character standard UUID, use the concise 8-character prefix like displayed across the portal
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanId)) {
    cleanId = cleanId.slice(0, 8);
  }
  cleanId = cleanId.replace(/[^\w-]/g, "_");

  const cleanReportNo = Number(reportNo) || 1;

  // Format required: child_name_child_id_report_no
  // Note: Modern browsers append .pdf automatically in the Save dialog
  return `${cleanName}_${cleanId}_report_${cleanReportNo}`;
}

/**
 * Resolves the sequential report number for a child.
 * If the child has taken 2 assessment reports, this resolves to 2.
 */
export async function resolveChildReportNumber({ childId, currentReportId = null, fallbackCycle = null }) {
  if (fallbackCycle && Number(fallbackCycle) > 0) {
    return Number(fallbackCycle);
  }

  if (!childId) return 1;

  try {
    // 1. Fetch reports for this child ordered chronologically
    let reports = [];
    try {
      const dbReports = await db.select("reports", {
        match: { child_id: childId },
        order: { column: "created_at", ascending: true }
      });
      if (Array.isArray(dbReports)) reports = dbReports;
    } catch (_) {}

    // 2. Fetch assessments for this child
    let assessments = [];
    try {
      const dbAssessments = await assessmentService.getByChildId(childId);
      if (Array.isArray(dbAssessments)) assessments = dbAssessments;
    } catch (_) {}

    // If a specific currentReportId is supplied, determine its chronological position
    if (currentReportId && reports.length > 0) {
      const idx = reports.findIndex((r) => r.id === currentReportId);
      if (idx !== -1) {
        return idx + 1;
      }
    }

    // Determine the count of reports / assessments taken by this child
    const totalCount = Math.max(reports.length, assessments.length);
    if (totalCount > 0) {
      return totalCount;
    }
  } catch (err) {
    console.warn("Notice resolving child report number:", err?.message || err);
  }

  return 1;
}

/**
 * Formats file name as: child_name_child_id_report_no
 * Sets document.title to this name so browser print / PDF download pre-fills the file name.
 */
export async function printReportWithFilename({
  childName,
  childId,
  reportNo,
  currentReportId = null,
  fallbackCycle = null
}) {
  if (typeof window === "undefined") return;

  let calculatedReportNo = reportNo;

  // If reportNo is not explicitly provided (> 0) or needs calculation
  if (!calculatedReportNo) {
    if (fallbackCycle && Number(fallbackCycle) > 0) {
      calculatedReportNo = Number(fallbackCycle);
    } else if (childId) {
      try {
        calculatedReportNo = await resolveChildReportNumber({
          childId,
          currentReportId,
          fallbackCycle
        });
      } catch (_) {
        calculatedReportNo = 1;
      }
    } else {
      calculatedReportNo = 1;
    }
  }

  const filename = formatReportFilename({
    childName,
    childId,
    reportNo: calculatedReportNo
  });

  const originalTitle = document.title;
  document.title = filename;

  const cleanup = () => {
    window.removeEventListener("afterprint", cleanup);
    document.title = originalTitle;
  };
  window.addEventListener("afterprint", cleanup);

  // Give browser engine a tick to register updated document.title and finalize print layout
  setTimeout(() => {
    window.print();
  }, 250);

  // Safety fallback after 60s in case afterprint is not supported
  setTimeout(() => {
    window.removeEventListener("afterprint", cleanup);
  }, 60000);
}
