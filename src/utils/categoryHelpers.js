/**
 * Centralized Category & Assessment Routing Helper
 * Guarantees that each child only ever sees and routes to their dedicated assessment form:
 * - Developmental Delay -> /therapy/delay/assessment/:childId
 * - ADHD -> /therapy/adhd/assessment/:childId
 * - Learning Disability -> /therapy/sld/assessment/:childId
 * - ASD -> /therapy/asd/assessment/:childId
 * - IEP Special School -> /assessment/new/:childId
 */

export function detectChildCategory(child) {
  if (!child) {
    return {
      category: 'developmental_delay',
      categoryLabel: 'Developmental Delay',
      isIep: false,
      assessmentRoute: '/therapy/delay/assessment',
      shortAssessmentName: 'Delay Checklist',
      assessmentName: 'Developmental Delay Milestones Checklist',
      badgeVariant: 'amber',
      themeColor: '#854F0B',
      emptyAssessmentTitle: 'No Developmental Delay Assessments Recorded',
      emptyAssessmentDesc: 'Complete the early childhood milestone checklist & clinical red flags evaluation.'
    };
  }

  const prog = (child.program_type || '').toLowerCase();
  const rawCat = (
    child.therapy_category ||
    child.diagnosis ||
    child.profile ||
    ''
  ).toLowerCase();

  // 1. Explicit IEP Program
  if (prog === 'iep' || rawCat.includes('special school') || (rawCat.includes('iep') && !rawCat.includes('therapy'))) {
    return {
      category: 'iep',
      categoryLabel: 'IEP Special School',
      isIep: true,
      assessmentRoute: `/assessment/new/${child.id}`,
      shortAssessmentName: 'IEP Assessment',
      assessmentName: 'IEP 24-Domain Assessment Protocol',
      badgeVariant: 'blue',
      themeColor: '#185FA5',
      emptyAssessmentTitle: 'No IEP Assessments Recorded',
      emptyAssessmentDesc: 'Perform a comprehensive special education assessment across the 24 developmental domains.'
    };
  }

  // 2. Developmental Delay
  if (rawCat.includes('delay') || rawCat.includes('developmental') || rawCat.includes('milestone')) {
    return {
      category: 'developmental_delay',
      categoryLabel: 'Developmental Delay',
      isIep: false,
      assessmentRoute: `/therapy/delay/assessment/${child.id}`,
      shortAssessmentName: 'Delay Checklist',
      assessmentName: 'Developmental Checklists (Birth to Five)',
      badgeVariant: 'amber',
      themeColor: '#854F0B',
      emptyAssessmentTitle: 'No Developmental Delay Assessments Recorded',
      emptyAssessmentDesc: 'Complete the early childhood milestone checklist & clinical red flags evaluation.'
    };
  }

  // 3. ADHD / Conners
  if (rawCat.includes('adhd') || rawCat.includes('conner') || rawCat.includes('hyperactiv') || rawCat.includes('inattent')) {
    return {
      category: 'adhd',
      categoryLabel: 'ADHD Presentation',
      isIep: false,
      assessmentRoute: `/therapy/adhd/assessment/${child.id}`,
      shortAssessmentName: "Conners' Scale",
      assessmentName: "Conners' 3 ADHD Clinical Rating Scale",
      badgeVariant: 'green',
      themeColor: '#0F6E56',
      emptyAssessmentTitle: 'No ADHD Assessments Recorded',
      emptyAssessmentDesc: "Evaluate behavioral presentations, executive functioning, and attention metrics using Conners' Rating Scale."
    };
  }

  // 4. Learning Disability / LDST / SLD / Dyslexia
  if (
    rawCat.includes('learn') ||
    rawCat.includes('ldst') ||
    rawCat.includes('sld') ||
    rawCat.includes('dyslex') ||
    rawCat.includes('dysgraph') ||
    rawCat.includes('dyscalcul')
  ) {
    return {
      category: 'learning_disability',
      categoryLabel: 'Learning Disability',
      isIep: false,
      assessmentRoute: `/therapy/sld/assessment/${child.id}`,
      shortAssessmentName: 'LDST Screening',
      assessmentName: 'Learning Disability Screening Battery (LDST)',
      badgeVariant: 'purple',
      themeColor: '#2f6f5e',
      emptyAssessmentTitle: 'No LDST Assessments Recorded',
      emptyAssessmentDesc: 'Screen for reading, spelling, calculation, and working memory vulnerabilities.'
    };
  }

  // 5. Default Therapy: ASD / ISAA
  return {
    category: 'asd',
    categoryLabel: 'ASD',
    isIep: false,
    assessmentRoute: `/therapy/asd/assessment/${child.id}`,
    shortAssessmentName: 'ISAA Scale',
    assessmentName: 'Indian Scale for Assessment of Autism (ISAA)',
    badgeVariant: 'blue',
    themeColor: '#185FA5',
    emptyAssessmentTitle: 'No ISAA Assessments Recorded',
    emptyAssessmentDesc: 'Perform an autism spectrum clinical assessment across the 6 ISAA behavioral domains.'
  };
}
