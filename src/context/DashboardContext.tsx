"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// ================= TYPES =================

export interface Exercise {
  id: string;
  name: string;
  category: "PT" | "OT" | "Speech" | "Behavior" | "Oral Motor" | "Social Skills";
  goal: string;
  description: string;
  instructions: string;
  duration: string; // e.g. "10 mins" or "3 sets of 10 reps"
  completed?: boolean;
  response?: "Good" | "Partial" | "Refused" | "";
}

export interface SessionLog {
  id: string;
  date: string;
  therapistName: string;
  therapyType: string;
  cooperationLevel: "Good" | "Moderate" | "Poor";
  exercisesPlanned: string[];
  exercisesCompleted: string[];
  improvementIndicators: {
    attention: boolean;
    eyeContact: boolean;
    sittingTolerance: boolean;
    speechResponse: boolean;
    motorSkills: boolean;
  };
  behaviorNotes: string;
  parentFeedback: string;
  sessionNotes: string;
}

export interface TherapyPlan {
  id: string;
  type: string; // OT, Speech, Physio, Behaviour, Combination
  shortTermGoals: string; // 3 months
  longTermGoals: string; // 6-12 months
  frequencyPerWeek: number;
  startDate: string;
  exercises: Exercise[];
  homeProgram: string;
  status: "Approved" | "Pending Review" | "Needs Modification";
}

export interface CaseHistory {
  parentConcern: string;
  pregnancyHistory: string; // "Normal" | "C-section" | "Premature" | "Complications"
  pregnancyDetails: string;
  milestones: {
    headControl: "Normal" | "Delayed";
    sitting: "Normal" | "Delayed";
    crawling: "Normal" | "Delayed";
    walking: "Normal" | "Delayed";
    firstWords: "Normal" | "Delayed";
    toiletTraining: "Normal" | "Delayed";
  };
  medicalConditions: string[]; // e.g. ["Seizures", "Allergies"]
  previousTherapy: string; // "Yes" or "No"
  previousTherapyDetails?: string;
  schoolHistory: string;
}

export interface ClinicalObservation {
  seatingTolerance: number; // 3=Yes, 2=Sometimes, 1=No
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
  muscleStrength: { neck: number; trunk: number; upperLimbs: number; lowerLimbs: number }; // 0-5
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
}

export interface Child {
  id: string; // e.g. KCR-2026-001
  name: string;
  dob: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  parentName: string;
  whatsapp: string;
  address: string;
  schoolName: string;
  schoolClass: string;
  mainConcern: string;
  diagnosis: string;
  referredBy: string;
  dateOfRegistration: string;
  assignedTherapistId: string;
  status: "Active" | "Pending Review" | "On Hold" | "Discharged";
  therapyPlan?: TherapyPlan;
  sessionLogs: SessionLog[];
}

export interface Therapist {
  id: string;
  name: string;
  specialization: "Speech Therapist" | "Occupational Therapist" | "Physiotherapist" | "Behavioral Therapist";
  email: string;
  phone: string;
  whatsapp: string;
  workload: number; // current patient count
  maxCapacity: number;
  activeSessionsPerWeek: number;
  status: "Active" | "On Leave";
}

export interface Appointment {
  id: string;
  childId: string;
  childName: string;
  therapistId: string;
  therapistName: string;
  timeSlot: string; // e.g. "09:00 AM"
  date: string; // YYYY-MM-DD
  type: "Assessment" | "Review" | "Therapy";
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
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
  linkId?: string; // ID of the escalation, assessment, etc.
}

interface DashboardContextType {
  children: Child[];
  therapists: Therapist[];
  appointments: Appointment[];
  assessments: AssessmentForm[];
  escalations: Escalation[];
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: "admin" | "therapist" | "parent";
  setUserRole: (role: "admin" | "therapist" | "parent") => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  activeTherapistId: string;
  setActiveTherapistId: (id: string) => void;
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  // Actions
  addChild: (child: Omit<Child, "id" | "sessionLogs">) => void;
  deleteChild: (childId: string) => void;
  addTherapist: (therapist: Omit<Therapist, "id" | "workload" | "activeSessionsPerWeek">) => void;
  updateTherapist: (therapist: Therapist) => void;
  assignTherapistToChild: (childId: string, therapistId: string) => void;
  approveTherapyPlan: (childId: string) => void;
  modifyExercises: (childId: string, exercises: Exercise[]) => void;
  reviewAssessment: (assessmentId: string, decision: "Approved" | "Reject", remarks: string) => void;
  resolveEscalation: (escalationId: string, doctorRemarks: string, updatedExercises?: Exercise[]) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  bookAppointment: (appointment: Omit<Appointment, "id" | "status">) => void;
  submitAssessment: (form: Omit<AssessmentForm, "id" | "status">) => void;
  logSession: (
    childId: string,
    session: Omit<SessionLog, "id">,
    raiseEscalation: boolean,
    escalationType?: Escalation["type"],
    escalationDesc?: string
  ) => void;
}

// ================= CONTEXT CREATION =================
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}

// ================= EXERCISE LIBRARY TEMPLATES =================
const PHYSIO_EXERCISES: Exercise[] = [
  { id: "pe-1", name: "Sit-to-Stand Exercise", category: "PT", goal: "Strengthen lower extremities and trunk", description: "The child sits on a chair or bench with feet flat on the floor, stands up without using hands if possible, then slowly sits back down.", instructions: "Repeat 10 times, 3 sets. Ensure knee alignment over toes.", duration: "10 mins" },
  { id: "pe-2", name: "Squats for Children", category: "PT", goal: "Build quad strength and core stability", description: "Child stands with feet shoulder-width apart, bends knees keeping back straight, lowers body, and returns to stand.", instructions: "Repeat 8-12 reps, 3 sets. Use toys/games to make it engaging.", duration: "8 mins" },
  { id: "pe-3", name: "Single-Leg Standing", category: "PT", goal: "Improve static balance", description: "Child stands upright and lifts one foot off the ground, maintaining balance.", instructions: "Hold for 10-15 seconds. Repeat 3 times per leg. Provide light support if needed.", duration: "5 mins" },
  { id: "pe-4", name: "Seated Balance on Therapy Ball", category: "PT", goal: "Improve dynamic trunk stability", description: "Child sits on therapy ball with feet flat. Therapist encourages reaching for toys, clapping, or catching balls.", instructions: "Perform reaching tasks in all directions for 5-10 minutes.", duration: "10 mins" },
  { id: "pe-5", name: "Standing Balance Exercise", category: "PT", goal: "Enhance standing equilibrium", description: "Child stands with feet apart or together and maintains balance on foam padding or uneven surfaces.", instructions: "Hold balance for 30s, repeat 5 times. Incorporate ball catch.", duration: "8 mins" },
  { id: "pe-6", name: "Heel-to-Toe Walking", category: "PT", goal: "Dynamic balance and coordination", description: "Child walks slowly along a straight line, placing each heel directly in front of the opposite foot's toes.", instructions: "Walk 10 steps forward and backward. Use colorful tape on floor.", duration: "5 mins" },
  { id: "pe-7", name: "Stair Climbing Exercise", category: "PT", goal: "Functional mobility and coordination", description: "Child climbs up and down stairs using handrails or therapist support.", instructions: "Ascend and descend 1 flight of stairs, 3 times. Focus on reciprocal foot placement.", duration: "10 mins" },
  { id: "pe-8", name: "Crawling Activities", category: "PT", goal: "Bilateral integration and shoulder stability", description: "Child crawls on hands and knees across floor, through play tunnels, or over cushions.", instructions: "Crawl through 5m tunnel, retrieve toy, and crawl back. Repeat 5 times.", duration: "7 mins" },
  { id: "pe-9", name: "Bear Walk", category: "PT", goal: "Strengthen shoulders, hips, and core", description: "Child places hands and feet on floor, lifts knees, and walks forward keeping hips raised.", instructions: "Bear walk for 10 meters. Incorporate in obstacle course.", duration: "5 mins" },
  { id: "pe-10", name: "Crab Walk", category: "PT", goal: "Trunk and upper limb extensor strengthening", description: "Child sits on floor, places hands behind them, lifts hips, and walks forward/sideways.", instructions: "Walk 5 meters forward and backward. Focus on keeping hips high.", duration: "5 mins" },
  { id: "pe-11", name: "Tandem Walking", category: "PT", goal: "Advance narrow base of support balance", description: "Child walks slowly along balance beam or straight line placing one foot directly in front of the other.", instructions: "Walk 15 feet. Assist with handhold if needed.", duration: "6 mins" },
  { id: "pe-12", name: "Balance Board Activities", category: "PT", goal: "Proprioceptive training", description: "Child stands or sits on balance board, maintaining stability while reaching for items.", instructions: "Maintain balance for 1 min. Play catch with a light balloon.", duration: "8 mins" },
  { id: "pe-13", name: "Treadmill Activities", category: "PT", goal: "Gait symmetry and cardiovascular endurance", description: "Child walks on treadmill at slow, comfortable speed under strict supervision.", instructions: "Walk at 0.8 km/h for 5 minutes. Adjust speed based on gait pattern.", duration: "5 mins" },
  { id: "pe-14", name: "Ball Kicking Activities", category: "PT", goal: "Single limb support and eye-foot coordination", description: "Child stands and kicks ball towards a goal, alternating feet.", instructions: "Kick ball towards target 10 times with each foot. Distance 3 meters.", duration: "7 mins" },
  { id: "pe-15", name: "Wall Push-Ups", category: "PT", goal: "Upper body strength and joint loading", description: "Child faces wall at arms length, places hands at shoulder height, bends elbows to bring body closer, and pushes back.", instructions: "Perform 12 repetitions, 2 sets. Keep back straight and heels flat.", duration: "5 mins" },
];

const OT_EXERCISES: Exercise[] = [
  { id: "oe-1", name: "Pencil Grasp Training", category: "OT", goal: "Improve tripod grasp pattern", description: "Using adaptive grips, writing tasks, and coloring templates to enforce standard finger placement.", instructions: "Color inside lines of simple shape for 5 mins using tripod grip.", duration: "10 mins" },
  { id: "oe-2", name: "Bead Threading", category: "OT", goal: "Enhance fine motor precision and focus", description: "Child threads colorful wooden beads of decreasing sizes onto a lace.", instructions: "Thread 15 beads. Encourage pincer grasp for holding beads.", duration: "8 mins" },
  { id: "oe-3", name: "Sensory Brush / Joint Compression", category: "OT", goal: "Sensory regulation and joint awareness", description: "Wilbarger brushing protocol followed by gentle compression on elbows, shoulders, hips, and knees.", instructions: "Brush back and limbs, perform 10 gentle compression pulses per joint.", duration: "10 mins" },
  { id: "oe-4", name: "Clay Sculpting (Play-doh)", category: "OT", goal: "Hand intrinsic muscle strengthening", description: "Kneading, rolling, and cutting clay to retrieve small hidden toys.", instructions: "Find 6 plastic beads hidden in medium-resistance therapy putty.", duration: "10 mins" },
];

const SPEECH_EXERCISES: Exercise[] = [
  { id: "se-1", name: "Articulatory Placement (S, R sounds)", category: "Speech", goal: "Correct phoneme distortion", description: "Using mirror visual feedback to guide tongue and lip placement for targeted sounds.", instructions: "Produce 's' sound in isolation 20 times, then in simple words.", duration: "15 mins" },
  { id: "se-2", name: "Picture Card Naming", category: "Speech", goal: "Expand active expressive vocabulary", description: "Child names flashcards depicting everyday items and constructs 2-word combinations.", instructions: "Target 15 nouns, prompt for 'I see [item]' or '[color] [item]'.", duration: "10 mins" },
  { id: "se-3", name: "Oral Motor Straw Drinking", category: "Oral Motor", goal: "Strengthen lip seal and tongue retraction", description: "Drinking thick liquids (e.g. yogurt or puree) through thin, curly straws.", instructions: "Drink 4 oz of thick liquid through a curly straw.", duration: "8 mins" },
];

const MOCK_CHILDREN: Child[] = [
  {
    id: "KCR-2026-001",
    name: "Aarav Patel",
    dob: "2020-04-12",
    age: 6,
    gender: "Male",
    parentName: "Vikram Patel",
    whatsapp: "+91 98451 98451",
    address: "12, Park Street, Bengaluru",
    schoolName: "Little Elly Preschool",
    schoolClass: "UKG",
    mainConcern: "Speech Delay, Sensory seeking behavior",
    diagnosis: "Sensory Processing Disorder & Speech Delay",
    referredBy: "Dr. R. K. Mehta (Pediatrician)",
    dateOfRegistration: "2026-01-10",
    assignedTherapistId: "t-2",
    status: "Active",
    therapyPlan: {
      id: "tp-1",
      type: "OT & Speech",
      shortTermGoals: "Improve tripod grasp, sitting tolerance to 15 mins, and expressive vocab.",
      longTermGoals: "Complete school readiness and peer communication.",
      frequencyPerWeek: 3,
      startDate: "2026-01-15",
      exercises: [
        { id: "oe-1", name: "Pencil Grasp Training", category: "OT", goal: "Improve tripod grasp pattern", description: "Using adaptive grips, writing tasks, and coloring templates to enforce standard finger placement.", instructions: "Color inside lines of simple shape for 5 mins using tripod grip.", duration: "10 mins" },
        { id: "oe-2", name: "Bead Threading", category: "OT", goal: "Enhance fine motor precision and focus", description: "Child threads colorful wooden beads of decreasing sizes onto a lace.", instructions: "Thread 15 beads. Encourage pincer grasp for holding beads.", duration: "8 mins" },
        { id: "se-2", name: "Picture Card Naming", category: "Speech", goal: "Expand active expressive vocabulary", description: "Child names flashcards depicting everyday items and constructs 2-word combinations.", instructions: "Target 15 nouns, prompt for 'I see [item]' or '[color] [item]'.", duration: "10 mins" }
      ],
      homeProgram: "Daily joint compression, straw drinking, and naming cards for 15 mins.",
      status: "Approved"
    },
    sessionLogs: [
      {
        id: "log-1",
        date: "2026-07-20",
        therapistName: "Ananya Das",
        therapyType: "Occupational Therapy",
        cooperationLevel: "Good",
        exercisesPlanned: ["Pencil Grasp Training", "Bead Threading"],
        exercisesCompleted: ["Pencil Grasp Training", "Bead Threading"],
        improvementIndicators: {
          attention: true,
          eyeContact: true,
          sittingTolerance: true,
          speechResponse: false,
          motorSkills: true
        },
        behaviorNotes: "Aarav was very co-operative today. He sat for 12 minutes during the pencil grasp activity.",
        parentFeedback: "Parent noticed less sensory seeking behavior during evening homework.",
        sessionNotes: "Recommended to continue joint compression protocol."
      },
      {
        id: "log-2",
        date: "2026-07-18",
        therapistName: "Dr. Preethi Sen",
        therapyType: "Speech Therapy",
        cooperationLevel: "Moderate",
        exercisesPlanned: ["Picture Card Naming"],
        exercisesCompleted: ["Picture Card Naming"],
        improvementIndicators: {
          attention: true,
          eyeContact: false,
          sittingTolerance: true,
          speechResponse: true,
          motorSkills: false
        },
        behaviorNotes: "Some resistance initially, but settled with picture cards after a minor sensory break.",
        parentFeedback: "Parent practiced card naming twice at home.",
        sessionNotes: "Focusing on two-word phrases."
      }
    ]
  }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "a-1",
    childId: "KCR-2026-001",
    childName: "Aarav Patel",
    therapistId: "t-2",
    therapistName: "Ananya Das",
    timeSlot: "10:30 AM",
    date: "2026-07-25",
    type: "Therapy",
    status: "Confirmed"
  }
];

const MOCK_ASSESSMENTS: AssessmentForm[] = [
  {
    id: "as-1",
    childId: "KCR-2026-001",
    childName: "Aarav Patel",
    assessmentDate: "2026-01-12",
    type: "Occupational Therapy",
    therapistId: "t-2",
    therapistName: "Ananya Das",
    status: "Approved",
    caseHistory: {
      parentConcern: "Delayed speech, frequent sensory seeking behaviors (spinning, jumping).",
      pregnancyHistory: "Normal",
      pregnancyDetails: "Full term, normal delivery, no immediate complications.",
      milestones: {
        headControl: "Normal",
        sitting: "Normal",
        crawling: "Normal",
        walking: "Normal",
        firstWords: "Delayed",
        toiletTraining: "Normal"
      },
      medicalConditions: [],
      previousTherapy: "No",
      schoolHistory: "Attending local preschool UKG. Social interactions are limited."
    },
    clinicalObservation: {
      seatingTolerance: 2,
      eyeContact: 2,
      responseToName: 2,
      jointAttention: 2,
      followsSimpleCommands: 3,
      followsTwoStepCommands: 2,
      attentionSpan: 2,
      taskCompletion: 2,
      impulseControl: 2,
      functionalPlay: 2,
      peerInteraction: 1,
      sensorySeeking: 3,
      sensoryAvoidance: 1,
      stereotypicalMovements: 2,
      emotionalRegulation: 2
    },
    otDetails: {
      sensoryProfile: {
        auditory: { sensitiveToNoise: "Sometimes covers ears", coversEars: "Yes, under loud noise" },
        visual: { distractedByStimuli: "Highly distracted by spinning toys", looksAtSpinning: "Frequently" },
        tactile: { avoidsTouch: "No", seeksTouch: "Yes, deep pressure", clothingSensitivity: "No" },
        vestibular: { fearOfMovement: "No", seeksSpinningJumping: "Constantly seeking" },
        proprioceptive: { crashesIntoObjects: "Yes, crashes into furniture", usesExcessiveForce: "Sometimes" }
      },
      fineMotor: { pencilGrasp: "Palmar grasp", coloring: "Poor control", cutting: "Needs assistance", beadThreading: "Needs prompts", copyingShapes: "Can copy vertical line" },
      grossMotor: { balance: "Fair", running: "Fast, clumsy", jumping: "Frequent", stairClimbing: "Alternating steps", ballSkills: "Catching delayed" },
      clinicalImpression: {
        sensoryProcessing: "Moderate",
        attention: "Mild",
        socialCommunication: "Moderate",
        fineMotorDelays: "Moderate",
        grossMotorDelays: "None"
      }
    },
    clinicalImpressionSummary: "Aarav presents with sensory seeking behaviors, tactile and proprioceptive seekers, and mild delays in fine motor coordination.",
    recommendations: "Start OT twice a week. Focus on sensory diet, fine motor coordination, and visual tracking."
  }
];

const MOCK_ESCALATIONS: Escalation[] = [
  {
    id: "esc-1",
    childId: "KCR-2026-001",
    childName: "Aarav Patel",
    therapistId: "t-2",
    therapistName: "Ananya Das",
    type: "Sensory Overload",
    date: "2026-07-15",
    description: "Aarav experienced overload during the loud drill next door and refused to complete the session.",
    behaviorNotes: "Agitated, covers ears, running around room.",
    recentExercises: ["Pencil Grasp Training", "Bead Threading"],
    cooperationLevel: "Poor",
    status: "Open"
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    title: "Urgent Escalation: Aarav Patel",
    description: "Clinical alert flagged: 'Sensory Overload'",
    type: "escalation",
    time: "3 days ago",
    read: false,
    linkId: "esc-1"
  }
];

// ================= PROVIDER COMPONENT =================
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "therapist" | "parent">("admin");
  const [activeTherapistId, setActiveTherapistId] = useState<string>("t-2"); // Ananya Das (OT)
  const [activeChildId, setActiveChildId] = useState<string>("KCR-2026-001"); // Aarav Patel

  // ================= MOCK STATE =================
  const [therapists, setTherapists] = useState<Therapist[]>([
    { id: "t-1", name: "Dr. Preethi Sen", specialization: "Speech Therapist", email: "preethi.sen@kidscare.com", phone: "+91 98451 22340", whatsapp: "+91 98451 22340", workload: 3, maxCapacity: 5, activeSessionsPerWeek: 18, status: "Active" },
    { id: "t-2", name: "Ananya Das", specialization: "Occupational Therapist", email: "ananya.das@kidscare.com", phone: "+91 97412 88432", whatsapp: "+91 97412 88432", workload: 4, maxCapacity: 6, activeSessionsPerWeek: 22, status: "Active" },
    { id: "t-3", name: "Rajesh Kumar", specialization: "Physiotherapist", email: "rajesh.kumar@kidscare.com", phone: "+91 94421 55678", whatsapp: "+91 94421 55678", workload: 2, maxCapacity: 5, activeSessionsPerWeek: 12, status: "Active" },
    { id: "t-4", name: "Dr. Sarah Alvi", specialization: "Behavioral Therapist", email: "sarah.alvi@kidscare.com", phone: "+91 99800 11223", whatsapp: "+91 99800 11223", workload: 1, maxCapacity: 4, activeSessionsPerWeek: 6, status: "Active" },
  ]);

  const [childrenData, setChildrenData] = useState<Child[]>(MOCK_CHILDREN);

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const [assessments, setAssessments] = useState<AssessmentForm[]>(MOCK_ASSESSMENTS);

  const [escalations, setEscalations] = useState<Escalation[]>(MOCK_ESCALATIONS);

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // ================= ACTIONS =================

  // Auto-generate child ID like KCR-2026-001
  const generateChildId = () => {
    const year = new Date().getFullYear();
    const existingNums = childrenData
      .map((c) => {
        const match = c.id.match(/KCR-\d{4}-(\d{3})/);
        return match ? parseInt(match[1], 10) : 0;
      });
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `KCR-${year}-${String(nextNum).padStart(3, "0")}`;
  };

  const addChild = (newChild: Omit<Child, "id" | "sessionLogs">) => {
    const id = generateChildId();
    const child: Child = {
      ...newChild,
      id,
      sessionLogs: [],
    };
    setChildrenData((prev) => [...prev, child]);
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "New Child Registered",
        description: `${child.name} (${id}) has been registered successfully.`,
        type: "system",
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const deleteChild = (childId: string) => {
    const child = childrenData.find((c) => c.id === childId);
    setChildrenData((prev) => prev.filter((c) => c.id !== childId));
    setAppointments((prev) => prev.filter((a) => a.childId !== childId));
    setAssessments((prev) => prev.filter((a) => a.childId !== childId));
    setEscalations((prev) => prev.filter((e) => e.childId !== childId));
    if (child) {
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Child Record Removed",
          description: `${child.name} (${childId}) has been removed from the system.`,
          type: "system",
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const addTherapist = (newTherapist: Omit<Therapist, "id" | "workload" | "activeSessionsPerWeek">) => {
    const id = `t-${therapists.length + 1}`;
    setTherapists((prev) => [
      ...prev,
      {
        ...newTherapist,
        id,
        workload: 0,
        activeSessionsPerWeek: 0,
      },
    ]);
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Staff Added",
        description: `New therapist ${newTherapist.name} has been added successfully.`,
        type: "system",
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const updateTherapist = (updated: Therapist) => {
    setTherapists((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const assignTherapistToChild = (childId: string, therapistId: string) => {
    const therapist = therapists.find((t) => t.id === therapistId);
    if (!therapist) return;

    setChildrenData((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const oldTherapistId = c.assignedTherapistId;
          if (oldTherapistId !== therapistId) {
            setTherapists((prevT) =>
              prevT.map((t) => {
                if (t.id === oldTherapistId) return { ...t, workload: Math.max(0, t.workload - 1) };
                if (t.id === therapistId) return { ...t, workload: t.workload + 1 };
                return t;
              })
            );
          }
          return { ...c, assignedTherapistId: therapistId };
        }
        return c;
      })
    );
  };

  const approveTherapyPlan = (childId: string) => {
    setChildrenData((prev) =>
      prev.map((c) => {
        if (c.id === childId && c.therapyPlan) {
          return {
            ...c,
            status: "Active",
            therapyPlan: { ...c.therapyPlan, status: "Approved" },
          };
        }
        return c;
      })
    );
  };

  const modifyExercises = (childId: string, updatedExercises: Exercise[]) => {
    setChildrenData((prev) =>
      prev.map((c) => {
        if (c.id === childId && c.therapyPlan) {
          return {
            ...c,
            therapyPlan: {
              ...c.therapyPlan,
              exercises: updatedExercises,
              status: c.therapyPlan.status === "Needs Modification" ? "Approved" : c.therapyPlan.status,
            },
          };
        }
        return c;
      })
    );
  };

  const reviewAssessment = (assessmentId: string, decision: "Approved" | "Reject", remarks: string) => {
    setAssessments((prev) =>
      prev.map((as) => {
        if (as.id === assessmentId) {
          if (decision === "Approved") {
            setChildrenData((prevChildren) =>
              prevChildren.map((c) => {
                if (c.id === as.childId) {
                  return { ...c, status: "Active" };
                }
                return c;
              })
            );
          }
          return { ...as, status: decision === "Approved" ? "Approved" : "Pending Review" };
        }
        return as;
      })
    );

    setNotifications((prev) =>
      prev.map((n) => (n.linkId === assessmentId ? { ...n, read: true } : n))
    );

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: `Assessment ${decision}`,
        description: `Assessment for ${assessments.find((a) => a.id === assessmentId)?.childName} has been ${decision.toLowerCase()}. Remarks: "${remarks}"`,
        type: "system",
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const resolveEscalation = (escalationId: string, doctorRemarks: string, updatedExercises?: Exercise[]) => {
    const escalation = escalations.find((e) => e.id === escalationId);
    if (!escalation) return;

    setEscalations((prev) =>
      prev.map((e) => (e.id === escalationId ? { ...e, status: "Resolved", resolutionComments: doctorRemarks } : e))
    );

    if (updatedExercises && updatedExercises.length > 0) {
      modifyExercises(escalation.childId, updatedExercises);
    } else {
      setChildrenData((prev) =>
        prev.map((c) => {
          if (c.id === escalation.childId && c.therapyPlan) {
            return {
              ...c,
              therapyPlan: { ...c.therapyPlan, status: "Approved" },
            };
          }
          return c;
        })
      );
    }

    setNotifications((prev) =>
      prev.map((n) => (n.linkId === escalationId ? { ...n, read: true } : n))
    );

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Escalation Resolved",
        description: `Case for ${escalation.childName} resolved. Instruction sent: "${doctorRemarks}"`,
        type: "system",
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const bookAppointment = (newAppt: Omit<Appointment, "id" | "status">) => {
    const id = `a-${appointments.length + 1}`;
    setAppointments((prev) => [
      ...prev,
      {
        ...newAppt,
        id,
        status: "Confirmed",
      },
    ]);
  };

  const submitAssessment = (newForm: Omit<AssessmentForm, "id" | "status">) => {
    const id = `as-${assessments.length + 1}`;
    const form: AssessmentForm = {
      ...newForm,
      id,
      status: "Pending Review",
    };
    setAssessments((prev) => [...prev, form]);

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: `New Assessment: ${form.childName}`,
        description: `${form.type} assessment completed by ${form.therapistName} requires signature review.`,
        type: "review",
        time: "Just now",
        read: false,
        linkId: id,
      },
      ...prev,
    ]);
  };

  const logSession = (
    childId: string,
    session: Omit<SessionLog, "id">,
    raiseEscalation: boolean,
    escalationType?: Escalation["type"],
    escalationDesc?: string
  ) => {
    const logId = `log-${Date.now()}`;
    const fullLog: SessionLog = { ...session, id: logId };

    setChildrenData((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          return {
            ...c,
            sessionLogs: [fullLog, ...c.sessionLogs],
          };
        }
        return c;
      })
    );

    if (raiseEscalation && escalationType && escalationDesc) {
      const activeTherapist = therapists.find((t) => t.id === activeTherapistId);
      const childObj = childrenData.find((c) => c.id === childId);
      const escId = `esc-${Date.now()}`;
      
      const newEsc: Escalation = {
        id: escId,
        childId,
        childName: childObj?.name || "Unknown Child",
        therapistId: activeTherapistId,
        therapistName: activeTherapist?.name || "Staff",
        type: escalationType,
        date: session.date,
        description: escalationDesc,
        behaviorNotes: session.behaviorNotes,
        recentExercises: session.exercisesCompleted,
        cooperationLevel: session.cooperationLevel,
        status: "Open",
      };

      setEscalations((prev) => [newEsc, ...prev]);

      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: `Urgent Escalation: ${newEsc.childName}`,
          description: `Clinical alert flagged: "${escalationDesc}"`,
          type: "escalation",
          time: "Just now",
          read: false,
          linkId: escId,
        },
        ...prev,
      ]);
    } else {
      const childObj = childrenData.find((c) => c.id === childId);
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Session Logged",
          description: `Daily session log for ${childObj?.name} saved successfully.`,
          type: "system",
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        children: childrenData,
        therapists,
        appointments,
        assessments,
        escalations,
        notifications,
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        isLoggedIn,
        setIsLoggedIn,
        activeTherapistId,
        setActiveTherapistId,
        activeChildId,
        setActiveChildId,
        addChild,
        deleteChild,
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
