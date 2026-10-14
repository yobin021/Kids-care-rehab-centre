/**
 * reassessmentHelpers.js
 * Enforces the clinical protocol: Re-assessments can only be conducted once every 3 months (90 days).
 */

export function checkReassessmentEligibility(assessments = [], reports = [], fallbackDateStr = null) {
  let latestDate = null;

  // 1. Check all completed assessments
  if (Array.isArray(assessments) && assessments.length > 0) {
    assessments.forEach((ass) => {
      const dStr = ass.assessment_date || ass.created_at || ass.date;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          if (!latestDate || d > latestDate) latestDate = d;
        }
      }
    });
  }

  // 2. Check all reports (published or pending)
  if (Array.isArray(reports) && reports.length > 0) {
    reports.forEach((rep) => {
      const dStr = rep.published_at || rep.created_at || rep.publishedDate;
      if (dStr) {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          if (!latestDate || d > latestDate) latestDate = d;
        }
      }
    });
  }

  // 3. Optional fallback date string
  if (!latestDate && fallbackDateStr) {
    const d = new Date(fallbackDateStr);
    if (!isNaN(d.getTime())) latestDate = d;
  }

  // If no previous assessment or report exists, the child is immediately eligible
  if (!latestDate) {
    return {
      eligible: true,
      hasPreviousAssessment: false,
      lastAssessmentDate: null,
      lastAssessmentDateFormatted: null,
      nextEligibleDate: null,
      nextEligibleDateFormatted: null,
      daysRemaining: 0,
      monthsRemaining: 0
    };
  }

  // 3-Month Interval: add 3 months to the latest assessment date
  const nextEligible = new Date(latestDate);
  nextEligible.setMonth(nextEligible.getMonth() + 3);

  const now = new Date();
  const diffMs = nextEligible.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const eligible = daysRemaining <= 0;

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return {
    eligible,
    hasPreviousAssessment: true,
    lastAssessmentDate: latestDate.toISOString().split("T")[0],
    lastAssessmentDateFormatted: formatDate(latestDate),
    nextEligibleDate: nextEligible.toISOString().split("T")[0],
    nextEligibleDateFormatted: formatDate(nextEligible),
    daysRemaining: Math.max(0, daysRemaining),
    monthsRemaining: Math.max(0, Math.ceil(daysRemaining / 30))
  };
}
