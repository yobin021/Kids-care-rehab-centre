/**
 * Utility helpers to classify children into IEP vs Therapy pathways.
 * 
 * Clinical Rule:
 * Children registered under the Individualized Education Program (IEP) Special School 
 * pathway have structured 24-section developmental milestone tracking and do NOT have 
 * physical/clinical exercise prescriptions. Exercise regimens are strictly reserved for 
 * Therapy children (ASD, ADHD, Developmental Delay, Learning Disability).
 */

export function isIepProgram(entity) {
  if (!entity) return false;

  // Explicit program type check
  if (entity.program_type === "iep" || entity.programType === "iep") return true;
  if (entity.program_type === "therapy" || entity.programType === "therapy") return false;

  // Therapy category existence indicates Therapy pathway
  if (entity.therapy_category || entity.therapyCategory) return false;

  const diag = (entity.diagnosis || entity.childDiagnosis || "").toUpperCase();
  const prof = (entity.profile || entity.childProfile || "").toUpperCase();

  // If diagnosis or profile matches therapy categories, it is therapy
  if (
    diag.includes("ADHD") ||
    diag.includes("DELAY") ||
    diag.includes("DEVELOPMENTAL") ||
    diag.includes("LEARNING") ||
    diag.includes("DISABILITY") ||
    diag.includes("ASD") ||
    diag.includes("AUTISM") ||
    prof.includes("PROFILE A") ||
    prof.includes("PROFILE B") ||
    prof.includes("PROFILE C")
  ) {
    return false;
  }

  // If diagnosis, school, or profile matches IEP / Special School / IDD
  if (
    diag.includes("IEP") ||
    diag.includes("SPECIAL SCHOOL") ||
    diag.includes("INTELLECTUAL") ||
    prof.includes("IEP") ||
    prof.includes("SPECIAL SCHOOL")
  ) {
    return true;
  }

  // Check child ID (e.g., standard demo IEP student KCR-2024-001)
  const id = entity.id || entity.childId || entity.child_id;
  if (id === "KCR-2024-001") {
    return true;
  }

  return false;
}
