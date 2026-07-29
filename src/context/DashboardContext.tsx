"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ================= TYPES =================

export type UserRole = "admin" | "staff" | "parent" | "therapist";

export interface UserSession {
  role: UserRole;
  name: string;
  username: string;
  token: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: "PT" | "OT" | "Speech" | "Behavior" | "Oral Motor" | "Social Skills" | "Cognitive" | "Communication" | "Sensory";
  goal: string;
  description: string;
  instructions: string;
  duration: string;
  completed?: boolean;
  response?: "Good" | "Partial" | "Refused" | "Great" | "Okay" | "Difficult" | "";
  benefits?: string[];
}

export interface ChildSession {
  id: string;
  childId: string;
  date: string;
  therapistName: string;
  type: "Therapy" | "Review" | "Assessment";
  duration: string;
  response: "Good" | "Moderate" | "Poor";
  escalated: boolean;
  notes: string;
}

export interface ChildReport {
  id: string;
  childId: string;
  reportDate: string;
  generatedBy: string;
  publishedBy?: string;
  status: "Published" | "Draft";
  therapistText: string;
  parentText: string;
  assignedExercises: string[];
}

export interface ParentAccount {
  phone: string;
  password: string;
  childId: string;
  active: boolean;
}

export interface EscalationDetailItem {
  id: string;
  childId: string;
  childName: string;
  date: string;
  therapistName: string;
  status: "Open" | "Reviewed";
  sessionNotes: string;
  plannedCount: number;
  completedCount: number;
  cooperationLevel: "Good" | "Moderate" | "Poor";
  behavioursNoted: string[];
  adminRemarks?: string;
  nextSessionActions?: string[];
}

export interface TherapyPlan {
  id: string;
  type: string;
  shortTermGoals: string;
  longTermGoals: string;
  frequencyPerWeek: number;
  startDate: string;
  exercises: Exercise[];
  homeProgram: string;
  status: "Approved" | "Pending Review" | "Needs Modification";
}

export interface CaseHistory {
  parentConcern: string;
  pregnancyHistory: string;
  pregnancyDetails: string;
  milestones: {
    headControl: "Normal" | "Delayed";
    sitting: "Normal" | "Delayed";
    crawling: "Normal" | "Delayed";
    walking: "Normal" | "Delayed";
    firstWords: "Normal" | "Delayed";
    toiletTraining: "Normal" | "Delayed";
  };
  medicalConditions: string[];
  previousTherapy: string;
  previousTherapyDetails?: string;
  schoolHistory: string;
}

export interface ClinicalObservation {
  seatingTolerance: number;
  eyeContact: number;
  responseToName: number;
  jointAttention: number;
  followsSimpleCommands: number;
  followsTwoStepCommands: number;
  attentionSpan: number;
  taskCompletion: number;
  impulseControl: number;
  functionalPlay: number;
  peerInteraction: number;
  sensorySeeking: number;
  sensoryAvoidance: number;
  stereotypicalMovements: number;
  emotionalRegulation: number;
}

export interface OTAssessmentDetails {
  sensoryProfile: {
    auditory: { sensitiveToNoise: string; coversEars: string };
    visual: { distractedByStimuli: string; looksAtSpinning: string };
    tactile: { avoidsTouch: string; seeksTouch: string; clothingSensitivity: string };
    vestibular: { fearOfMovement: string; seeksSpinningJumping: string };
    proprioceptive: { crashesIntoObjects: string; usesExcessiveForce: string };
  };
  fineMotor: { pencilGrasp: string; coloring: string; cutting: string; beadThreading: string; copyingShapes: string };
  grossMotor: { balance: string; running: string; jumping: string; stairClimbing: string; ballSkills: string };
  clinicalImpression: {
    sensoryProcessing: "Mild" | "Moderate" | "Severe" | "None";
    attention: "Mild" | "Moderate" | "Severe" | "None";
    socialCommunication: "Mild" | "Moderate" | "Severe" | "None";
    fineMotorDelays: "Mild" | "Moderate" | "Severe" | "None";
    grossMotorDelays: "Mild" | "Moderate" | "Severe" | "None";
  };
}

export interface PTAssessmentDetails {
  posture: { head: string; shoulders: string; trunk: string; pelvis: string; feet: string };
  muscleTone: { neck: string; trunk: string; upperLimbs: string; lowerLimbs: string };
  rangeOfMotion: { shoulder: string; elbow: string; wrist: string; hip: string; knee: string; ankle: string };
  muscleStrength: { neck: number; trunk: number; upperLimbs: number; lowerLimbs: number };
  balance: { staticSitting: string; dynamicSitting: string; staticStanding: string; dynamicStanding: string; singleLeg: string };
  gaitAnalysis: { heelStrike: string; toeClearance: string; stepLength: string; cadence: string; symmetry: string };
  outcomeMeasures: { gmfmScore: string; pediScore: string; weeFimScore: string };
}

export interface AssessmentForm {
  id: string;
  childId: string;
  childName: string;
  assessmentDate: string;
  type: "Occupational Therapy" | "Physiotherapy" | "Autism Screening" | "ADHD Screening";
  therapistId: string;
  therapistName: string;
  status: "Pending Review" | "Approved";
  caseHistory: CaseHistory;
  clinicalObservation: ClinicalObservation;
  otDetails?: OTAssessmentDetails;
  ptDetails?: PTAssessmentDetails;
  clinicalImpressionSummary: string;
  recommendations: string;
  isaaScore?: number;
  severityBand?: string;
  profileAssigned?: string;
}

export interface Child {
  id: string;
  name: string;
  dob: string;
  age: string | number;
  gender: "Male" | "Female" | "Other";
  parentName: string;
  relationship?: "Father" | "Mother" | "Guardian";
  whatsapp: string;
  email?: string;
  address: string;
  schoolName: string;
  schoolClass: string;
  mainConcern: string;
  diagnosis: string;
  provisionalDiagnosis?: string;
  profile?: "Profile A" | "Profile B" | "Profile C" | "Profile D" | "Profile E";
  assignedTherapist?: "Priya" | "Meena" | string;
  assignedTherapistId?: string;
  referredBy: string;
  dateOfRegistration: string;
  lastSessionDate?: string;
  status: "Active" | "Pending Review" | "On Hold" | "Discharged";
  primaryConcern?: string;
  previousTherapy?: boolean | string;
  previousTherapyDetails?: string;
  languagesSpoken?: string;
  schoolFeedback?: string;
  parentPortalActive?: boolean;
}

export interface Therapist {
  id: string;
  name: string;
  specialization: "Speech Therapist" | "Occupational Therapist" | "Physiotherapist" | "Behavioral Therapist";
  email: string;
  phone: string;
  whatsapp: string;
  workload: number;
  maxCapacity: number;
  activeSessionsPerWeek: number;
  status: "Active" | "On Leave";
}

export interface Appointment {
  id: string;
  childId: string;
  childName: string;
  therapistId?: string;
  therapist?: "Priya" | "Meena" | string;
  therapistName?: string;
  timeSlot?: string;
  time?: string;
  date: string;
  type: "Assessment" | "Review" | "Therapy";
  confirmed?: boolean;
  notes?: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled" | "In Progress" | "Upcoming";
}

export interface Escalation {
  id: string;
  childId: string;
  childName: string;
  therapistId: string;
  therapistName: string;
  type: "Aggression" | "Sensory Overload" | "Therapy Refusal" | "Behavioral Issue";
  date: string;
  description: string;
  behaviorNotes: string;
  recentExercises: string[];
  cooperationLevel: "Good" | "Moderate" | "Poor";
  status: "Open" | "Resolved";
  resolutionComments?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "escalation" | "review" | "appointment" | "system";
  time: string;
  read: boolean;
  linkId?: string;
}

export interface Enquiry {
  id: string;
  date: string;
  parentName: string;
  childName: string;
  phone: string;
  area: string;
  mainConcern: string;
  status: "New" | "Called" | "Appointment Booked" | "Not Interested";
}

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  designation: string;
  active: boolean;
  assignedChildrenCount: number;
  sessionsThisMonth: number;
}

export interface DashboardContextType {
  user: UserSession | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTherapistId: string;
  setActiveTherapistId: (id: string) => void;
  activeChildId: string;
  setActiveChildId: (id: string) => void;

  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  login: (username: string, pass: string) => { success: boolean; role?: UserRole };
  parentLogin: (phone: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;

  // Collections
  children: Child[];
  therapists: Therapist[];
  appointments: Appointment[];
  assessments: AssessmentForm[];
  escalations: Escalation[];
  notifications: Notification[];
  enquiries: Enquiry[];
  staffMembers: StaffMember[];
  sessions: ChildSession[];
  reports: ChildReport[];
  parentAccounts: Record<string, ParentAccount>;
  escalationItems: EscalationDetailItem[];

  // Actions
  addChild: (childData: any) => string;
  updateChild: (childId: string, updatedFields: Partial<Child>) => void;
  deleteChild: (childId: string) => void;
  createParentPortalLogin: (childId: string, phone: string, pass: string) => void;
  addTherapist: (therapist: any) => void;
  updateTherapist: (therapist: Therapist) => void;
  assignTherapistToChild: (childId: string, therapistId: string) => void;
  approveTherapyPlan: (childId: string) => void;
  modifyExercises: (childId: string, exercises: Exercise[]) => void;
  reviewAssessment: (assessmentId: string, decision: "Approved" | "Reject", remarks: string) => void;
  resolveEscalation: (escalationId: string, doctorRemarks: string, updatedExercises?: Exercise[]) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  bookAppointment: (apptData: any) => void;
  submitAssessment: (form: any) => void;
  logSession: (sessionData: any) => void;

  // Phase 2 specific actions
  publishReport: (reportId: string, therapistText: string, parentText: string, exercises: string[]) => void;
  reviewEscalationDetail: (id: string, adminRemarks: string, selectedActions: string[]) => void;

  // Enquiry & Staff Actions
  updateEnquiryStatus: (id: string, newStatus: Enquiry["status"]) => void;
  addStaffMember: (member: any) => void;
  toggleStaffStatus: (id: string) => void;
  prefillRegistrationData: Partial<Child> | null;
  setPrefillRegistrationData: (data: Partial<Child> | null) => void;
}

// ================= CONTEXT CREATION =================
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}

// ================= INITIAL MOCK DATA =================

const INITIAL_CHILDREN: Child[] = [
  {
    id: "KCR-2024-002",
    name: "Arsh Mohammed",
    dob: "2021-01-15",
    age: "5y 6m",
    gender: "Male",
    parentName: "Sirajudeen",
    relationship: "Father",
    whatsapp: "9841000001",
    email: "siraj@email.com",
    address: "T. Nagar, Chennai",
    mainConcern: "Speech clarity, hyperactivity during table tasks",
    diagnosis: "ASD",
    provisionalDiagnosis: "ASD with Speech Delay",
    profile: "Profile B",
    assignedTherapist: "Priya",
    assignedTherapistId: "t-2",
    schoolName: "St. Christopher's Academy",
    schoolClass: "UKG",
    referredBy: "Self",
    dateOfRegistration: "2022-07-27",
    lastSessionDate: "25 Jul 2026",
    status: "Active",
    primaryConcern: "Poor eye contact and reduced social communication skills",
    previousTherapy: true,
    previousTherapyDetails: "OT 6 months",
    languagesSpoken: "Tamil, English, Urdu",
    schoolFeedback: "Friendly with peers, needs prompt for table activities.",
    parentPortalActive: true
  },
  {
    id: "KCR-2023-001",
    name: "Lakshmanan A.R",
    dob: "2019-03-15",
    age: "7y",
    gender: "Male",
    parentName: "Rajesh A.R",
    relationship: "Father",
    whatsapp: "9840111223",
    email: "rajesh.ar@gmail.com",
    address: "Anna Nagar, Chennai",
    mainConcern: "Social communication and sensory sensitivity",
    diagnosis: "ASD",
    provisionalDiagnosis: "Autism Spectrum Disorder Level 1",
    profile: "Profile A",
    assignedTherapist: "Priya",
    assignedTherapistId: "t-2",
    schoolName: "DAV Boys School",
    schoolClass: "Class 2",
    referredBy: "Dr. K. Swaminathan",
    dateOfRegistration: "2023-05-10",
    lastSessionDate: "20 Jul 2026",
    status: "Active",
    primaryConcern: "Social communication and sensory sensitivity",
    previousTherapy: true,
    previousTherapyDetails: "Speech therapy 1 year",
    languagesSpoken: "Tamil, English",
    parentPortalActive: false
  },
  {
    id: "KCR-2022-003",
    name: "Arshan I.M",
    dob: "2017-08-11",
    age: "9y",
    gender: "Male",
    parentName: "Imran Khan",
    relationship: "Father",
    whatsapp: "9790044332",
    email: "imran.k@yahoo.com",
    address: "Mylapore, Chennai",
    mainConcern: "Motor planning and handwriting difficulties",
    diagnosis: "Dev. Delay",
    provisionalDiagnosis: "Global Developmental Delay",
    profile: "Profile D",
    assignedTherapist: "Meena",
    assignedTherapistId: "t-1",
    schoolName: "St. Bedes School",
    schoolClass: "Class 4",
    referredBy: "Dr. Sunitha Rao",
    dateOfRegistration: "2022-09-01",
    lastSessionDate: "18 Jul 2026",
    status: "Active",
    primaryConcern: "Motor planning and handwriting difficulties",
    previousTherapy: true,
    previousTherapyDetails: "Physiotherapy 1.5 years",
    languagesSpoken: "Tamil, English",
    parentPortalActive: false
  },
  {
    id: "KCR-2024-004",
    name: "Krishnan K.K",
    dob: "2020-10-05",
    age: "5y 9m",
    gender: "Male",
    parentName: "Karthik Krishnan",
    relationship: "Father",
    whatsapp: "9884188990",
    email: "karthik.kk@gmail.com",
    address: "Adyar, Chennai",
    mainConcern: "Attention span under 3 mins, impulsivity",
    diagnosis: "ASD+ADHD",
    provisionalDiagnosis: "Autism + ADHD Dual Diagnosis",
    profile: "Profile C",
    assignedTherapist: "Meena",
    assignedTherapistId: "t-1",
    schoolName: "Bala Vidya Mandir",
    schoolClass: "LKG",
    referredBy: "Dr. Anand Iyer",
    dateOfRegistration: "2024-04-12",
    lastSessionDate: "22 Jul 2026",
    status: "Active",
    primaryConcern: "Attention span under 3 mins, impulsivity",
    previousTherapy: false,
    languagesSpoken: "Tamil, English",
    parentPortalActive: false
  },
  {
    id: "KCR-2024-005",
    name: "Sashanth",
    dob: "2019-04-18",
    age: "7y",
    gender: "Male",
    parentName: "Srinivasan",
    relationship: "Father",
    whatsapp: "9962033445",
    email: "srini.s@gmail.com",
    address: "Velachery, Chennai",
    mainConcern: "Repetitive hand flapping and echolalia",
    diagnosis: "ASD",
    provisionalDiagnosis: "Autism Spectrum Disorder",
    profile: "Profile A",
    assignedTherapist: "Priya",
    assignedTherapistId: "t-2",
    schoolName: "Sunshine School",
    schoolClass: "Class 1",
    referredBy: "Dr. Mehta",
    dateOfRegistration: "2024-06-20",
    lastSessionDate: "15 Jul 2026",
    status: "Active",
    primaryConcern: "Repetitive hand flapping and echolalia",
    previousTherapy: true,
    previousTherapyDetails: "Speech therapy 8 months",
    languagesSpoken: "Tamil",
    parentPortalActive: false
  },
  {
    id: "KCR-2025-006",
    name: "Yeshmith S.J",
    dob: "2020-02-14",
    age: "6y",
    gender: "Male",
    parentName: "Senthil Kumar",
    relationship: "Father",
    whatsapp: "9841077665",
    email: "senthil.sj@gmail.com",
    address: "Royapettah, Chennai",
    mainConcern: "Toe walking, auditory hypersensitivity",
    diagnosis: "ASD",
    provisionalDiagnosis: "ASD Level 2",
    profile: "Profile B",
    assignedTherapist: "Meena",
    assignedTherapistId: "t-1",
    schoolName: "Asan Memorial School",
    schoolClass: "UKG",
    referredBy: "Dr. Preethi",
    dateOfRegistration: "2025-01-15",
    lastSessionDate: "24 Jul 2026",
    status: "Active",
    primaryConcern: "Toe walking, auditory hypersensitivity",
    previousTherapy: false,
    languagesSpoken: "Tamil, English",
    parentPortalActive: false
  },
  {
    id: "KCR-2025-007",
    name: "Yeshvi",
    dob: "2020-05-22",
    age: "6y",
    gender: "Female",
    parentName: "Venkatesh R",
    relationship: "Father",
    whatsapp: "9790199887",
    email: "venkat.r@gmail.com",
    address: "Porur, Chennai",
    mainConcern: "Restlessness, emotional dysregulation",
    diagnosis: "ADHD",
    provisionalDiagnosis: "ADHD Hyperactive Type",
    profile: "Profile C",
    assignedTherapist: "Priya",
    assignedTherapistId: "t-2",
    schoolName: "PSBB School",
    schoolClass: "UKG",
    referredBy: "Dr. Swaminathan",
    dateOfRegistration: "2025-03-10",
    lastSessionDate: "27 Jul 2026",
    status: "Active",
    primaryConcern: "Restlessness, emotional dysregulation",
    previousTherapy: true,
    previousTherapyDetails: "Behavior Therapy 4 months",
    languagesSpoken: "Tamil, Telugu",
    parentPortalActive: false
  },
  {
    id: "KCR-2024-008",
    name: "Avantika K.N",
    dob: "2016-11-30",
    age: "10y",
    gender: "Female",
    parentName: "Narayanan K.S",
    relationship: "Father",
    whatsapp: "9500011224",
    email: "narayan.kn@gmail.com",
    address: "Kotturpuram, Chennai",
    mainConcern: "Dyslexia, low self-esteem in writing tasks",
    diagnosis: "Learning Disability",
    provisionalDiagnosis: "Specific Learning Disability in Reading",
    profile: "Profile E",
    assignedTherapist: "Meena",
    assignedTherapistId: "t-1",
    schoolName: "Vidya Mandir School",
    schoolClass: "Class 5",
    referredBy: "School Principal",
    dateOfRegistration: "2024-11-05",
    lastSessionDate: "10 Jul 2026",
    status: "Active",
    primaryConcern: "Dyslexia, low self-esteem in writing tasks",
    previousTherapy: true,
    previousTherapyDetails: "Remedial instruction 1 year",
    languagesSpoken: "Tamil, English",
    parentPortalActive: false
  }
];

const INITIAL_SESSIONS: ChildSession[] = [
  { id: "s-1", childId: "KCR-2024-002", date: "25 Jul 2026", therapistName: "Priya", type: "Therapy", duration: "60 min", response: "Good", escalated: false, notes: "Completed all exercises" },
  { id: "s-2", childId: "KCR-2024-002", date: "18 Jul 2026", therapistName: "Priya", type: "Therapy", duration: "60 min", response: "Moderate", escalated: false, notes: "Partial completion, good eye contact" },
  { id: "s-3", childId: "KCR-2024-002", date: "11 Jul 2026", therapistName: "Priya", type: "Therapy", duration: "60 min", response: "Poor", escalated: true, notes: "Aggressive behaviour noted" },
  { id: "s-4", childId: "KCR-2024-002", date: "04 Jul 2026", therapistName: "Meena", type: "Review", duration: "45 min", response: "Good", escalated: false, notes: "Significant improvement in communication" },
  { id: "s-5", childId: "KCR-2024-002", date: "27 Jun 2026", therapistName: "Priya", type: "Therapy", duration: "60 min", response: "Good", escalated: false, notes: "All exercises done, parent present" }
];

const INITIAL_REPORTS: ChildReport[] = [
  {
    id: "rep-1",
    childId: "KCR-2024-002",
    reportDate: "20 Jul 2026",
    generatedBy: "Priya S (Senior Therapist)",
    publishedBy: "Dr. R. Radha Balachandar",
    status: "Published",
    therapistText: `Master Arsh Mohammed, aged 5 years 6 months, presented for a comprehensive developmental evaluation. Assessment using the Corner Parent Rating Scale and Vineland Social Maturity Scale indicated limitations in social communication, expressive and receptive language, sensory processing, and sitting tolerance.

Following approximately one year of therapy including Social Skills Training, Brain Gym, Sensory Integration, Speech Therapy with oral-motor exercises, and visual cue card training, significant progress has been observed. The child now communicates using multiple words and sentences, initiates conversations with peers, and demonstrates improved eye contact and task attendance.

Continued therapy is recommended with focus on narrative skills, social communication, and expressive language development.`,
    parentText: `We are happy to share that Arsh has made wonderful progress over the past year. When he first came to us, he had difficulty with eye contact and communication. Today, he communicates using full sentences, makes friends easily, and responds well in conversation.

We will continue to work on helping him tell stories, answer questions, and communicate more confidently in different situations. We recommend continued therapy sessions twice a week for the next six months.

With your support at home and our guidance at the clinic, Arsh will continue to grow beautifully.`,
    assignedExercises: ["Brain Gym Exercises", "Communication Cards", "Sensory Integration"]
  }
];

const INITIAL_ESCALATIONS_DETAIL: EscalationDetailItem[] = [
  {
    id: "esc-101",
    childId: "KCR-2025-007",
    childName: "Yeshvi",
    date: "27 Jul 2026",
    therapistName: "Meena",
    status: "Open",
    sessionNotes: "Child became aggressive when asked to complete writing task. Threw objects. Screamed for 10 minutes. Could not complete planned exercises. Parent was not present during session.",
    plannedCount: 3,
    completedCount: 0,
    cooperationLevel: "Poor",
    behavioursNoted: ["Aggression", "Throwing objects", "Non-cooperation"]
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", childId: "KCR-2024-002", childName: "Arsh Mohammed", therapist: "Priya", therapistId: "t-2", therapistName: "Priya S", time: "09:00 AM", timeSlot: "09:00 AM", date: "2026-07-27", type: "Therapy", confirmed: true, status: "Completed" },
  { id: "apt-2", childId: "KCR-2025-006", childName: "Yeshmith S.J", therapist: "Meena", therapistId: "t-1", therapistName: "Meena R", time: "10:00 AM", timeSlot: "10:00 AM", date: "2026-07-27", type: "Review", confirmed: true, status: "In Progress" },
  { id: "apt-3", childId: "KCR-2023-001", childName: "Lakshmanan A.R", therapist: "Priya", therapistId: "t-2", therapistName: "Priya S", time: "11:00 AM", timeSlot: "11:00 AM", date: "2026-07-27", type: "Assessment", confirmed: true, status: "Upcoming" },
  { id: "apt-4", childId: "KCR-2024-004", childName: "Krishnan K.K", therapist: "Meena", therapistId: "t-1", therapistName: "Meena R", time: "02:00 PM", timeSlot: "02:00 PM", date: "2026-07-27", type: "Therapy", confirmed: true, status: "Upcoming" }
];

const INITIAL_ENQUIRIES: Enquiry[] = [
  { id: "enq-1", date: "27 Jul 2026", parentName: "Rajeev M", childName: "Rohit", phone: "9841098410", area: "Royapettah", mainConcern: "Speech delay (2.5y non-verbal)", status: "New" },
  { id: "enq-2", date: "25 Jul 2026", parentName: "Sudha K", childName: "Preethi", phone: "9962099620", area: "Mylapore", mainConcern: "Autism concern & poor eye contact", status: "Called" },
  { id: "enq-3", date: "22 Jul 2026", parentName: "Anand R", childName: "Karthik", phone: "9884098840", area: "T.Nagar", mainConcern: "ADHD & classroom hyperactivity", status: "Appointment Booked" },
  { id: "enq-4", date: "20 Jul 2026", parentName: "Meera L", childName: "Divya", phone: "9790097900", area: "Adyar", mainConcern: "Behaviour issues & temper tantrums", status: "Called" },
  { id: "enq-5", date: "18 Jul 2026", parentName: "Suresh P", childName: "Arun", phone: "9500095000", area: "Velachery", mainConcern: "Dev. delay & motor planning", status: "New" }
];

const INITIAL_STAFF: StaffMember[] = [
  { id: "st-1", name: "Priya S", username: "priya", designation: "Senior Therapist & Special Educator", active: true, assignedChildrenCount: 18, sessionsThisMonth: 24 },
  { id: "st-2", name: "Meena R", username: "meena", designation: "Occupational Therapist", active: true, assignedChildrenCount: 14, sessionsThisMonth: 19 }
];

const INITIAL_THERAPISTS: Therapist[] = [
  { id: "t-1", name: "Meena R", specialization: "Occupational Therapist", email: "meena@kidscare.com", phone: "+91 98451 22340", whatsapp: "+91 98451 22340", workload: 14, maxCapacity: 20, activeSessionsPerWeek: 19, status: "Active" },
  { id: "t-2", name: "Priya S", specialization: "Speech Therapist", email: "priya@kidscare.com", phone: "+91 97412 88432", whatsapp: "+91 97412 88432", workload: 18, maxCapacity: 25, activeSessionsPerWeek: 24, status: "Active" }
];

// ================= PROVIDER COMPONENT =================
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>("admin");
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeTherapistId, setActiveTherapistId] = useState<string>("t-2");
  const [activeChildId, setActiveChildId] = useState<string>("KCR-2024-002");

  const [childrenList, setChildrenList] = useState<Child[]>(INITIAL_CHILDREN);
  const [therapists, setTherapists] = useState<Therapist[]>(INITIAL_THERAPISTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [sessions, setSessions] = useState<ChildSession[]>(INITIAL_SESSIONS);
  const [reports, setReports] = useState<ChildReport[]>(INITIAL_REPORTS);
  const [escalationItems, setEscalationItems] = useState<EscalationDetailItem[]>(INITIAL_ESCALATIONS_DETAIL);
  const [parentAccounts, setParentAccounts] = useState<Record<string, ParentAccount>>({
    "9841000001": { phone: "9841000001", password: "parent123", childId: "KCR-2024-002", active: true }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [prefillRegistrationData, setPrefillRegistrationData] = useState<Partial<Child> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed: UserSession = JSON.parse(saved);
        setUser(parsed);
        setUserRoleState(parsed.role);
        setIsLoggedInState(true);
      } catch (err) {
        console.error("Failed to restore session", err);
      }
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem("user_session", JSON.stringify(updated));
    }
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    if (!loggedIn) {
      setUser(null);
      localStorage.removeItem("user_session");
    }
  };

  const login = (usernameInput: string, passInput: string): { success: boolean; role?: UserRole } => {
    const u = usernameInput.trim().toLowerCase();
    const p = passInput.trim();

    let session: UserSession | null = null;

    if (u === "admin" && p === "admin123") {
      session = { role: "admin", name: "Administrator", username: "admin", token: "mock-token-admin" };
    } else if (u === "priya" && p === "staff123") {
      session = { role: "staff", name: "Priya S", username: "priya", token: "mock-token-priya" };
    } else if (u === "meena" && p === "staff456") {
      session = { role: "staff", name: "Meena R", username: "meena", token: "mock-token-meena" };
    } else if (u === "parent@email.com" && p === "parent123") {
      session = { role: "parent", name: "Arsh's Parent", username: "parent@email.com", token: "mock-token-parent" };
    }

    if (session) {
      setUser(session);
      setUserRoleState(session.role);
      setIsLoggedInState(true);
      localStorage.setItem("user_session", JSON.stringify(session));
      setActiveTab("dashboard");
      return { success: true, role: session.role };
    }

    return { success: false };
  };

  const parentLogin = (phoneInput: string, passInput: string): { success: boolean; message?: string } => {
    const cleanPhone = phoneInput.trim().replace(/\D/g, "");
    const cleanPass = passInput.trim();

    const found = Object.values(parentAccounts).find(
      (acc) => acc.phone.replace(/\D/g, "") === cleanPhone && acc.password === cleanPass && acc.active
    );

    if (found || (cleanPhone.endsWith("9841000001") && cleanPass === "parent123")) {
      const targetChildId = found?.childId || "KCR-2024-002";
      const session: UserSession = {
        role: "parent",
        name: "Arsh's Parent",
        username: phoneInput,
        token: "mock-parent-token"
      };
      setUser(session);
      setUserRoleState("parent");
      setIsLoggedInState(true);
      setActiveChildId(targetChildId);
      localStorage.setItem("user_session", JSON.stringify(session));
      setActiveTab("parent-home");
      return { success: true };
    }

    return {
      success: false,
      message: "Incorrect phone number or password. Please check with your therapist."
    };
  };

  const logout = () => {
    setUser(null);
    setIsLoggedInState(false);
    localStorage.removeItem("user_session");
    setActiveTab("login");
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addChild = (childData: any): string => {
    const newId = `KCR-2026-00${childrenList.length + 1}`;
    const newChild: Child = {
      ...childData,
      id: newId
    };
    setChildrenList((prev) => [newChild, ...prev]);
    showToast(`Child registered successfully. Child ID: ${newId} has been assigned.`, "success");
    return newId;
  };

  const updateChild = (childId: string, updatedFields: Partial<Child>) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, ...updatedFields } : c))
    );
    showToast("Child details updated successfully.", "success");
  };

  const deleteChild = (childId: string) => {
    setChildrenList((prev) => prev.filter((c) => c.id !== childId));
    showToast("Child record removed.", "info");
  };

  const createParentPortalLogin = (childId: string, phone: string, pass: string) => {
    const cleanPhone = phone.trim();
    setParentAccounts((prev) => ({
      ...prev,
      [cleanPhone]: { phone: cleanPhone, password: pass, childId, active: true }
    }));

    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, parentPortalActive: true, whatsapp: cleanPhone } : c))
    );

    showToast("Parent portal access created. Share login details with the parent.", "success");
  };

  const addTherapist = (t: any) => {
    const newT: Therapist = { ...t, id: `t-${therapists.length + 1}` };
    setTherapists((prev) => [...prev, newT]);
  };

  const updateTherapist = (t: Therapist) => {
    setTherapists((prev) => prev.map((item) => (item.id === t.id ? t : item)));
  };

  const assignTherapistToChild = (childId: string, therapistId: string) => {
    setChildrenList((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, assignedTherapistId: therapistId } : c))
    );
  };

  const approveTherapyPlan = (childId: string) => {
    showToast(`Therapy plan approved for ${childId}`, "success");
  };

  const modifyExercises = (childId: string, exercises: Exercise[]) => {
    showToast("Exercises modified.", "info");
  };

  const reviewAssessment = (assessmentId: string, decision: "Approved" | "Reject", remarks: string) => {
    showToast(`Assessment ${decision}`, "success");
  };

  const resolveEscalation = (escalationId: string, doctorRemarks: string, updatedExercises?: Exercise[]) => {
    showToast("Escalation resolved.", "success");
  };

  const markNotificationRead = (notifId: string) => {};
  const markAllNotificationsRead = () => {};

  const bookAppointment = (apptData: any) => {
    const newAppt: Appointment = {
      ...apptData,
      id: `apt-${Date.now()}`,
      time: apptData.time || apptData.timeSlot || "10:00 AM",
      timeSlot: apptData.time || apptData.timeSlot || "10:00 AM",
      therapist: apptData.therapist || "Priya",
      status: "Upcoming"
    };
    setAppointments((prev) => [newAppt, ...prev]);
    showToast(`Appointment booked for ${newAppt.childName} on ${newAppt.date} at ${newAppt.time}.`, "success");
  };

  const submitAssessment = (form: any) => {
    showToast("Clinical Assessment Form submitted successfully!", "success");
  };

  const logSession = (sessionData: any) => {
    const newS: ChildSession = {
      id: `s-${Date.now()}`,
      childId: sessionData.childId || activeChildId,
      date: sessionData.date || new Date().toISOString().split("T")[0],
      therapistName: sessionData.therapistName || "Priya",
      type: sessionData.type || "Therapy",
      duration: sessionData.duration || "60 min",
      response: sessionData.response || "Good",
      escalated: sessionData.escalated || false,
      notes: sessionData.notes || "Session completed successfully."
    };
    setSessions((prev) => [newS, ...prev]);
    showToast("Therapy session logged successfully!", "success");
  };

  const publishReport = (reportId: string, therapistText: string, parentText: string, exercises: string[]) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "Published",
              therapistText,
              parentText,
              assignedExercises: exercises,
              publishedBy: "Dr. R. Radha Balachandar"
            }
          : r
      )
    );
    showToast("Report published successfully. Parent can now view it on their portal.", "success");
  };

  const reviewEscalationDetail = (id: string, adminRemarks: string, selectedActions: string[]) => {
    setEscalationItems((prev) =>
      prev.map((esc) =>
        esc.id === id
          ? { ...esc, status: "Reviewed", adminRemarks, nextSessionActions: selectedActions }
          : esc
      )
    );
    showToast("Escalation reviewed. Therapist will see updated plan in next session.", "success");
  };

  const updateEnquiryStatus = (id: string, newStatus: Enquiry["status"]) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    showToast("Enquiry status updated.", "info");
  };

  const addStaffMember = (member: any) => {
    const newStaff: StaffMember = {
      ...member,
      id: `st-${staffMembers.length + 1}`,
      assignedChildrenCount: 0,
      sessionsThisMonth: 0
    };
    setStaffMembers((prev) => [...prev, newStaff]);
    showToast(`Staff account for ${member.name} created successfully.`, "success");
  };

  const toggleStaffStatus = (id: string) => {
    setStaffMembers((prev) =>
      prev.map((st) => (st.id === id ? { ...st, active: !st.active } : st))
    );
    showToast("Staff status updated.", "info");
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        userRole,
        setUserRole,
        isLoggedIn,
        setIsLoggedIn,
        activeTab,
        setActiveTab,
        activeTherapistId,
        setActiveTherapistId,
        activeChildId,
        setActiveChildId,

        toasts,
        showToast,
        removeToast,

        login,
        parentLogin,
        logout,

        children: childrenList,
        therapists,
        appointments,
        assessments: [
          {
            id: "ass-1",
            childId: "KCR-2024-002",
            childName: "Arsh Mohammed",
            assessmentDate: "15 Jun 2026",
            type: "Autism Screening",
            therapistId: "t-2",
            therapistName: "Priya S",
            status: "Approved",
            isaaScore: 92,
            severityBand: "Mild Autism (70–106)",
            profileAssigned: "Profile B",
            caseHistory: { parentConcern: "Speech delay", pregnancyHistory: "Normal", pregnancyDetails: "", milestones: { headControl: "Normal", sitting: "Normal", crawling: "Normal", walking: "Normal", firstWords: "Delayed", toiletTraining: "Normal" }, medicalConditions: [], previousTherapy: "Yes", schoolHistory: "Preschool" },
            clinicalObservation: { seatingTolerance: 2, eyeContact: 2, responseToName: 2, jointAttention: 2, followsSimpleCommands: 2, followsTwoStepCommands: 1, attentionSpan: 2, taskCompletion: 2, impulseControl: 2, functionalPlay: 2, peerInteraction: 2, sensorySeeking: 2, sensoryAvoidance: 1, stereotypicalMovements: 1, emotionalRegulation: 2 },
            clinicalImpressionSummary: "Shows progress in sitting tolerance and response to name.",
            recommendations: "Continue OT and Speech Therapy."
          }
        ],
        escalations: [],
        notifications: [],
        enquiries,
        staffMembers,
        sessions,
        reports,
        parentAccounts,
        escalationItems,

        addChild,
        updateChild,
        deleteChild,
        createParentPortalLogin,
        addTherapist,
        updateTherapist,
        assignTherapistToChild,
        approveTherapyPlan,
        modifyExercises,
        reviewAssessment,
        resolveEscalation,
        markNotificationRead,
        markAllNotificationsRead,
        bookAppointment,
        submitAssessment,
        logSession,
        publishReport,
        reviewEscalationDetail,

        updateEnquiryStatus,
        addStaffMember,
        toggleStaffStatus,
        prefillRegistrationData,
        setPrefillRegistrationData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
