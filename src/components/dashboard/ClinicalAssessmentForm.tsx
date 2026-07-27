"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  User,
  Calendar,
  CheckCircle2,
  Save,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  X,
  FileText,
  Activity,
  Brain,
  Smile,
  ShieldAlert,
  Volume2,
  BookOpen,
  Award,
  Check,
  ClipboardCheck,
  Heart
} from "lucide-react";

// ================= TYPES & INTERFACES =================

export interface AssessmentFormData {
  // Tab 1: Child & Case Details
  childDetails: {
    childName: string;
    dob: string;
    ageYears: number | string;
    ageMonths: number | string;
    gender: "Male" | "Female" | "Other" | "";
    assessmentDate: string;
    parentName: string;
    contactNumber: string;
    address: string;
    diagnosis: string;
    assessedBy: string;
    designation: string;
    schoolClass: string;
    udidNumber: string;
    assessmentType: "Initial" | "Review";
    languagesSpoken: string;
    referredBy: string;
    primaryComplaint: string;
    whenConcernNoticed: string;
    previousTherapy: "Yes" | "No" | "";
    previousTherapyDetails: string;
    hearingScreening: "Yes" | "No" | "Not done" | "";
    hearingScreeningResult: string;
    familyHistoryDelay: "Yes" | "No" | "";
    fatherOccupation: string;
    motherOccupation: string;
    bothParentsWorking: "Yes" | "No" | "";
    primaryCaretaker: string;
    schoolFeedback: string;
    peerInteractionNotes: string;
    socialBehaviourNotes: string;
  };

  // Tab 2: Developmental & Medical History
  devHistory: {
    birthHistoryChips: string[];
    birthHistoryDetails: string;
    milestones: Record<string, { status: "Achieved" | "Delayed" | ""; remarks: string }>;
    medicalChips: string[];
    medicalDetails: string;
    difficultyChips: string[];
    difficultyOther: string;
  };

  // Tab 3: Previous Therapy & School History
  therapySchoolHistory: {
    previousTherapyChips: string[];
    previousTherapyDetails: string;
    schoolStatusChip: string;
    schoolDetails: string;
    parentPriorityGoals: string[];
  };

  // Tab 4: Attention, Communication & Social Skills
  communicationSocial: {
    attentionToggles: Record<string, "Yes" | "No" | "">;
    sittingToleranceChip: string;
    commRatings: Record<string, { score: number | null; remarks: string }>;
    commSummary: string;
    receptiveToggles: Record<string, "Yes" | "No" | "">;
    expressiveToggles: Record<string, "Yes" | "No" | "">;
    socialRatings: Record<string, { score: number | null; remarks: string }>;
    socialSummary: string;
  };

  // Tab 5: Behaviour & Emotional Regulation
  behaviourEmotional: {
    taskRatings: Record<string, { score: number | null; remarks: string }>;
    taskSummary: string;
    behaviourTable: Record<string, { status: "Present" | "Not Present" | ""; remarks: string }>;
    triggerChips: string[];
    behaviourSummary: string;
    emotionalRatings: Record<string, { score: number | null; remarks: string }>;
    emotionalSummary: string;
  };

  // Tab 6: Motor Skills & Sensory Processing
  motorSensory: {
    fineMotorRatings: Record<string, { score: number | null; remarks: string }>;
    fineMotorSummary: string;
    grossMotorRatings: Record<string, { score: number | null; remarks: string }>;
    grossMotorSummary: string;
    sensoryTable: Record<string, { response: "Over Responsive" | "Under Responsive" | "Seeking" | ""; remarks: string }>;
    sensoryChips: string[];
    sensorySummary: string;
  };

  // Tab 7: Pre-Academic, ADL & Learning Style
  academicADL: {
    preAcademicRatings: Record<string, { score: number | null; remarks: string }>;
    preAcademicSummary: string;
    adlRatings: Record<string, { score: number | null; remarks: string }>;
    adlSummary: string;
    learningStyleChips: string[];
    learningStyleRemarks: string;
  };

  // Tab 8: Oral-Motor & Articulation
  oralMotorArticulation: {
    oralMotorTable: Record<string, { status: "Normal" | "Impaired" | ""; remarks: string }>;
    soundInventory: Record<string, { status: "Correct" | "Error" | ""; childResponse: string }>;
    positionWiseWordTest: Record<string, { remarks: string }>;
  };

  // Tab 9: ISAA
  isaa: {
    ratings: Record<number, number>; // 1 to 40 items -> score 1 to 5
    clinicalRemarks: string;
  };

  // Tab 10: Strengths, Goals & Recommendations
  goalsRecommendations: {
    strengths: string[];
    supportChips: string[];
    supportDetails: string;
    presentLevels: {
      communication: string;
      academic: string;
      behaviour: string;
      social: string;
      adl: string;
      motor: string;
      sensory: string;
    };
    shortTermGoals: Record<string, { goal: string; strategy: string; review: string }>;
    longTermGoals: Record<string, { goal: string; outcome: string; review: string }>;
    interventionChips: string[];
    interventionDetails: string;
    homeProgramSuggestions: string[];
    firstReviewDate: string;
    secondReviewDate: string;
    thirdReviewDate: string;
  };

  // Tab 11: Observations Summary & Sign-Off
  summarySignOff: {
    observations: {
      attention: string;
      receptiveLanguage: string;
      expressiveLanguage: string;
      articulation: string;
      oralMotor: string;
      intelligibility: string;
      behaviour: string;
      socialSkills: string;
      sensoryProcessing: string;
      motorSkills: string;
      adl: string;
    };
    recommendationChips: string[];
    reevaluationWeeks: string;
    finalRemarks: string;
    assessorName: string;
    assessorDesignation: string;
    assessorSignatureDate: string;
    parentName: string;
    parentRelationship: string;
    parentSignatureDate: string;
  };
}

// Initial Empty State Generator
const getInitialFormData = (): AssessmentFormData => ({
  childDetails: {
    childName: "Aarav Patel",
    dob: "2020-04-12",
    ageYears: 5,
    ageMonths: 10,
    gender: "Male",
    assessmentDate: new Date().toISOString().split("T")[0],
    parentName: "Vikram Patel",
    contactNumber: "+91 98451 98451",
    address: "No 14, 2nd Main Road, Anna Nagar, Chennai - 600040",
    diagnosis: "Sensory Processing Delay & Speech Clarity",
    assessedBy: "Ananya Das",
    designation: "Senior Occupational Therapist & Special Educator",
    schoolClass: "Little Elly Preschool / UKG",
    udidNumber: "",
    assessmentType: "Initial",
    languagesSpoken: "Tamil, English",
    referredBy: "Dr. R. K. Mehta (Pediatrician)",
    primaryComplaint: "Child displays hyperactivity in classroom, poor attention span (less than 3 mins), and difficulty expressing full sentences clearly.",
    whenConcernNoticed: "Around 2.5 years of age when peer interaction started at preschool.",
    previousTherapy: "Yes",
    previousTherapyDetails: "Speech Therapy at local center for 6 months (2024)",
    hearingScreening: "Yes",
    hearingScreeningResult: "Passed BERA & OAE Screening",
    familyHistoryDelay: "No",
    fatherOccupation: "Software Engineer",
    motherOccupation: "Banking Executive",
    bothParentsWorking: "Yes",
    primaryCaretaker: "Mother & Paternal Grandmother",
    schoolFeedback: "Teacher reports restlessness during carpet time and reluctance to share toys.",
    peerInteractionNotes: "Prefers parallel play. Needs encouragement for turn-taking.",
    socialBehaviourNotes: "Warm towards familiar adults, gets anxious in crowded noisy spaces."
  },

  devHistory: {
    birthHistoryChips: ["Normal delivery"],
    birthHistoryDetails: "Full term, cried immediately after birth, weight 3.1kg.",
    milestones: {
      "Neck holding": { status: "Achieved", remarks: "3 months" },
      "Sitting": { status: "Achieved", remarks: "6.5 months" },
      "Crawling": { status: "Achieved", remarks: "9 months" },
      "Walking": { status: "Achieved", remarks: "13 months" },
      "Speech development": { status: "Delayed", remarks: "First words at 22 months" },
      "Toilet training": { status: "Achieved", remarks: "Completed by 3.5 years" }
    },
    medicalChips: [],
    medicalDetails: "No history of seizures or major hospitalizations.",
    difficultyChips: ["Speech delay", "Poor attention", "Sensory issues", "Hyperactivity"],
    difficultyOther: ""
  },

  therapySchoolHistory: {
    previousTherapyChips: ["Speech therapy", "Occupational therapy"],
    previousTherapyDetails: "Received OT and Speech for 6 months in 2024 with moderate improvement in eye contact.",
    schoolStatusChip: "Playschool",
    schoolDetails: "Attending Little Elly Preschool, UKG section, 4 hours daily.",
    parentPriorityGoals: [
      "Improve speech clarity and express full sentences",
      "Increase sitting tolerance during homework time to 15 minutes",
      "Reduce sensory seeking behaviors like spinning and jumping",
      "Follow 2-step instructions without repeated prompts",
      "Improve independent buttoning and self-feeding"
    ]
  },

  communicationSocial: {
    attentionToggles: {
      "Maintains eye contact": "Yes",
      "Responds to name": "Yes",
      "Follows 1-step command": "Yes",
      "Follows 2–3 step commands": "No",
      "Sustains attention during activity": "No",
      "Easily distracted": "Yes"
    },
    sittingToleranceChip: "2–5 minutes",
    commRatings: {
      "Responds to name": { score: 2, remarks: "Responds when called in quiet setting" },
      "Maintains eye contact": { score: 2, remarks: "Intermittent eye contact during play" },
      "Understands simple instructions": { score: 2, remarks: "Understands routine directions" },
      "Follows one-step commands": { score: 3, remarks: "Independent" },
      "Follows two-step commands": { score: 1, remarks: "Requires gestural prompt" },
      "Uses gestures / pointing": { score: 3, remarks: "Points to express desire" },
      "Requests needs appropriately": { score: 2, remarks: "Uses single words + pointing" },
      "Uses sounds / words": { score: 3, remarks: "Has >50 functional words" },
      "Uses phrases / sentences": { score: 1, remarks: "2-word telegraphic combinations" },
      "Names familiar objects": { score: 3, remarks: "Identifies common household objects" },
      "Answers simple questions": { score: 1, remarks: "Needs repetition" },
      "Communicates pain / discomfort": { score: 2, remarks: "Shows area of hurt" }
    },
    commSummary: "Child demonstrates emerging receptive language skills but expressive output remains restricted to 2-word phrases.",
    receptiveToggles: {
      "Understands familiar instructions": "Yes",
      "Identifies pictures / objects": "Yes",
      "Understands 'what / who / where' questions": "No",
      "Understands prepositions": "No",
      "Understands short stories / classroom directions": "No"
    },
    expressiveToggles: {
      "Uses single words / short phrases": "Yes",
      "Speaks in full sentences": "No",
      "Names objects / actions": "Yes",
      "Narrates simple events": "No",
      "Asks and answers questions": "No",
      "Uses correct grammar / tenses": "No"
    },
    socialRatings: {
      "Responds to adults": { score: 2, remarks: "Friendly with familiar staff" },
      "Responds to peers": { score: 1, remarks: "Limited spontaneous initiation" },
      "Greets others": { score: 2, remarks: "Says hi with prompt" },
      "Shares toys / materials": { score: 1, remarks: "Needs adult mediation" },
      "Takes turns": { score: 1, remarks: "Short wait capacity" },
      "Imitates actions": { score: 2, remarks: "Imitates gross motor actions" },
      "Functional play": { score: 2, remarks: "Explores toys as intended" },
      "Pretend play": { score: 1, remarks: "Emerging play with kitchen set" },
      "Participates in group activity": { score: 1, remarks: "Tends to wander out of circle" },
      "Understands simple classroom rules": { score: 1, remarks: "Inconsistent compliance" }
    },
    socialSummary: "Social interaction is primarily adult-focused. Peer engagement requires structured guidance."
  },

  behaviourEmotional: {
    taskRatings: {
      "Sits for activity": { score: 1, remarks: "Requires physical support" },
      "Attends to teacher": { score: 2, remarks: "Attends for short bursts" },
      "Completes simple task": { score: 2, remarks: "Completes with 1 prompt" },
      "Waits for turn": { score: 1, remarks: "Impulsive" },
      "Responds to redirection": { score: 2, remarks: "Responds to visual cues" },
      "Transitions between activities": { score: 1, remarks: "Displays resistance during favorite toy transition" },
      "Works with prompts": { score: 2, remarks: "Verbal and physical prompts required" },
      "Works independently": { score: 1, remarks: "Under 2 mins" }
    },
    taskSummary: "Task persistence is enhanced when visual timer and tangible rewards are used.",
    behaviourTable: {
      "Hyperactivity": { status: "Present", remarks: "Constant motor activity in unstructured times" },
      "Poor attention": { status: "Present", remarks: "Wanderness noted" },
      "Tantrums": { status: "Present", remarks: "When denied access to tablet" },
      "Crying episodes": { status: "Not Present", remarks: "" },
      "Aggression": { status: "Not Present", remarks: "" },
      "Self-injurious behaviour": { status: "Not Present", remarks: "" },
      "Repetitive behaviour": { status: "Present", remarks: "Hand flapping when excited" },
      "Resistance to task": { status: "Present", remarks: "Pushes paper away when difficult" },
      "Difficulty with change": { status: "Present", remarks: "Needs advance verbal notice" },
      "Sensory-seeking behaviour": { status: "Present", remarks: "Jumping, crashing into soft mats" },
      "Fear / anxiety": { status: "Not Present", remarks: "" },
      "Sleep-related behaviour concern": { status: "Not Present", remarks: "" }
    },
    triggerChips: ["Denied object", "Waiting", "Noise", "Transition"],
    behaviourSummary: "Behaviors are primarily sensory-driven or related to low frustration tolerance during non-preferred tasks.",
    emotionalRatings: {
      "Expresses needs calmly": { score: 1, remarks: "Cries or pulls hand when upset" },
      "Waits without distress": { score: 1, remarks: "Struggles with wait time >1 min" },
      "Accepts 'no'": { score: 1, remarks: "Triggers mild protest" },
      "Handles correction": { score: 2, remarks: "Accepts gentle redirection" },
      "Calms after upset": { score: 2, remarks: "Calms down with deep pressure / warm hug" },
      "Accepts change in routine": { score: 1, remarks: "Requires visual schedule" },
      "Shows age-appropriate emotional response": { score: 2, remarks: "Generally happy" }
    },
    emotionalSummary: "Co-regulation techniques (proprioceptive input) effectively soothe emotional dysregulation."
  },

  motorSensory: {
    fineMotorRatings: {
      "Reaches and grasps objects": { score: 3, remarks: "Age appropriate" },
      "Transfers objects hand to hand": { score: 3, remarks: "Good coordination" },
      "Stacks blocks": { score: 2, remarks: "Stacks 6-8 blocks" },
      "Peg board activity": { score: 2, remarks: "Completes with focus" },
      "Beading / threading": { score: 1, remarks: "Struggles with thin lace" },
      "Tears paper": { score: 3, remarks: "Good bilateral coordination" },
      "Pastes paper": { score: 2, remarks: "Requires guidance for glue amount" },
      "Uses crayons": { score: 2, remarks: "Palmar to immature tripod transition" },
      "Pencil grip": { score: 1, remarks: "Uses quadrupod / static tripod" },
      "Scribbling": { score: 3, remarks: "Vigorous scribbling" },
      "Tracing": { score: 1, remarks: "Off-track on curved lines" },
      "Uses scissors safely": { score: 1, remarks: "Cuts paper snips only" },
      "Buttoning / unbuttoning": { score: 0, remarks: "Not developed" }
    },
    fineMotorSummary: "Fine motor control shows weak intrinsic hand muscle strength and delayed distal pencil grip.",
    grossMotorRatings: {
      "Sitting balance": { score: 3, remarks: "Good static and dynamic" },
      "Standing balance": { score: 3, remarks: "Good" },
      "Walking": { score: 3, remarks: "Normal gait pattern" },
      "Running": { score: 3, remarks: "Fast speed, occasional tripping" },
      "Jumping": { score: 2, remarks: "Jumps with two feet" },
      "Climbing stairs": { score: 3, remarks: "Reciprocal foot pattern" },
      "Kicking ball": { score: 2, remarks: "Kicks forward" },
      "Throwing ball": { score: 2, remarks: "Overhand throw" },
      "Catching ball": { score: 1, remarks: "Catches large ball against chest" },
      "Body coordination": { score: 2, remarks: "Moderate agility" },
      "Posture control": { score: 2, remarks: "Slouches during long desk work" },
      "Muscle tone concern": { score: 2, remarks: "Mild joint hypermobility noted in wrist" }
    },
    grossMotorSummary: "Gross motor foundational skills are functional; high energy level seeking vestibular input.",
    sensoryTable: {
      "Sound": { response: "Over Responsive", remarks: "Covers ears during mixer grinder / vacuum sound" },
      "Touch": { response: "Seeking", remarks: "Enjoys deep hugs and therapy putty" },
      "Movement": { response: "Seeking", remarks: "Enjoys spinning on swing and trampoline jumping" },
      "Light / visual input": { response: "Seeking", remarks: "Fascinated by spinning fan blades" },
      "Smell": { response: "Over Responsive", remarks: "Picky with strong food smells" },
      "Taste / food texture": { response: "Over Responsive", remarks: "Avoids lumpy/crunchy textures" },
      "Oral sensory needs": { response: "Seeking", remarks: "Mouths collar of shirt when anxious" },
      "Deep pressure need": { response: "Seeking", remarks: "Crashes into pillows" }
    },
    sensoryChips: ["Covers ears", "Toe walking", "Spins objects", "Hand flapping", "Chews objects", "Seeks pressure", "Avoids certain food textures", "Constant movement seeking"],
    sensorySummary: "Sensory profile highlights auditory hyper-reactivity alongside vestibular and proprioceptive seeking behaviors."
  },

  academicADL: {
    preAcademicRatings: {
      "Matches objects": { score: 3, remarks: "Independent" },
      "Matches pictures": { score: 3, remarks: "Independent" },
      "Sorts objects": { score: 2, remarks: "Sorts by color" },
      "Identifies colours": { score: 3, remarks: "Red, Blue, Yellow, Green" },
      "Identifies shapes": { score: 2, remarks: "Circle, Square, Triangle" },
      "Identifies body parts": { score: 3, remarks: "Eyes, Ears, Nose, Hands, Feet" },
      "Identifies animals": { score: 2, remarks: "Dog, Cat, Cow, Elephant" },
      "Identifies fruits / vegetables": { score: 2, remarks: "Apple, Banana, Mango" },
      "Identifies alphabets": { score: 1, remarks: "A, B, C recognition" },
      "Identifies numbers": { score: 1, remarks: "1 to 5 recognition" },
      "Counts objects": { score: 1, remarks: "Rote counts to 5" },
      "Recites rhymes": { score: 2, remarks: "Recites fragments with rhythm" },
      "Recognises name": { score: 3, remarks: "Recognises written first name" },
      "Copies lines / shapes": { score: 2, remarks: "Vertical and horizontal lines" },
      "Pre-writing readiness": { score: 1, remarks: "Requires tracing stencils" }
    },
    preAcademicSummary: "Strong visual matching skills. Academic symbol recognition (letters/numbers) requires multisensory reinforcement.",
    adlRatings: {
      "Eating independently": { score: 2, remarks: "Eats with spoon with spills" },
      "Drinking from cup / bottle": { score: 3, remarks: "Independent" },
      "Hand washing": { score: 2, remarks: "Needs prompt to use soap" },
      "Brushing": { score: 1, remarks: "Resists toothbrush bristles" },
      "Dressing": { score: 1, remarks: "Puts on t-shirt with guidance" },
      "Undressing": { score: 2, remarks: "Removes shoes and socks" },
      "Toileting": { score: 2, remarks: "Potty trained during daytime" },
      "Indicates toilet need": { score: 2, remarks: "Uses gesture / word 'toilet'" },
      "Wears footwear": { score: 2, remarks: "Puts on slip-ons" },
      "Arranges school bag": { score: 1, remarks: "Requires adult assist" },
      "Cleans up after activity": { score: 1, remarks: "With verbal encouragement" },
      "Follows daily routine": { score: 2, remarks: "Understands routine visual chart" }
    },
    adlSummary: "Fair ADL independence. Self-care routines like oral hygiene (brushing) are limited by oral tactile sensitivity.",
    learningStyleChips: ["Visual method", "Picture cards", "Objects / real materials", "Music / rhymes", "Movement-based learning", "Repetition", "One-to-one teaching"],
    learningStyleRemarks: "Child learns best when tasks incorporate movement breaks and visual token boards."
  },

  oralMotorArticulation: {
    oralMotorTable: {
      "Mouth Opening": { status: "Normal", remarks: "Adequate jaw range" },
      "Jaw Movement": { status: "Normal", remarks: "Symmetrical" },
      "Lip Movement": { status: "Impaired", remarks: "Weak lip seal during puckering" },
      "Cheek Strength": { status: "Impaired", remarks: "Reduced cheek puff hold time (<3 sec)" },
      "Tongue Movement": { status: "Impaired", remarks: "Restricted tongue tip elevation" },
      "Tongue Control": { status: "Impaired", remarks: "Lateral deviation noted during rapid movement" },
      "Tongue Strength": { status: "Impaired", remarks: "Mild hypotonia" },
      "Drooling / Saliva Control": { status: "Normal", remarks: "Adequate control" },
      "Breath Support": { status: "Impaired", remarks: "Sustains 'ahh' for 3 seconds" },
      "Voice Quality": { status: "Normal", remarks: "Clear tone" }
    },
    soundInventory: {
      "/p/ (pen)": { status: "Correct", childResponse: "pen" },
      "/b/ (bat)": { status: "Correct", childResponse: "bat" },
      "/t/ (toy)": { status: "Correct", childResponse: "toy" },
      "/d/ (dog)": { status: "Correct", childResponse: "dog" },
      "/k/ (cat)": { status: "Error", childResponse: "tat (Fronting)" },
      "/g/ (goat)": { status: "Error", childResponse: "doat (Fronting)" },
      "/s/ (sun)": { status: "Error", childResponse: "thun (Lisping)" },
      "/sh/ (shoe)": { status: "Error", childResponse: "so (Distortion)" },
      "/ch/ (chair)": { status: "Error", childResponse: "tair" },
      "/l/ (lion)": { status: "Correct", childResponse: "lion" },
      "/r/ (rabbit)": { status: "Error", childResponse: "wabbit (Substitution)" },
      "/f/ (fish)": { status: "Correct", childResponse: "pish" },
      "/v/ (van)": { status: "Error", childResponse: "ban" },
      "/th/ (thumb)": { status: "Error", childResponse: "tumb" },
      "/z/ (zebra)": { status: "Error", childResponse: "jebra" }
    },
    positionWiseWordTest: {
      "/p/": { remarks: "Correct in initial/medial/final positions" },
      "/t/": { remarks: "Correct initial ('top') and final ('cat')" },
      "/k/": { remarks: "Substitutes /t/ for /k/ in initial ('tat' for 'key')" },
      "/s/": { remarks: "Interdental distortion in all positions" },
      "/r/": { remarks: "Substitutes /w/ for /r/ ('wabbit', 'cawrot')" },
      "/l/": { remarks: "Correct in initial ('lion'), omitted in final" },
      "/sh/": { remarks: "De-palatalized to /s/" },
      "/ch/": { remarks: "De-affricated to /t/" },
      "/th/": { remarks: "Substitutes /t/ for /th/" }
    }
  },

  isaa: {
    ratings: {
      1: 4, 2: 3, 3: 4, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4, // Section I (Social)
      10: 3, 11: 3, 12: 3, 13: 2, 14: 4, // Section II (Emotional)
      15: 1, 16: 3, 17: 3, 18: 3, 19: 3, 20: 4, // Section III (Speech)
      21: 4, 22: 3, 23: 2, 24: 4, 25: 3, 26: 1, 27: 2, 28: 1, // Section IV (Behaviour)
      29: 2, 30: 3, 31: 4, 32: 3, 33: 3, 34: 3, // Section V (Cognitive)
      35: 4, 36: 1, 37: 3, 38: 4, 39: 3, 40: 1 // Section VI (Sensory)
    },
    clinicalRemarks: "ISAA clinical evaluation indicates moderate autism characteristics, predominantly driven by sensory processing differences, social reciprocity challenges, and speech fronting/echolalia."
  },

  goalsRecommendations: {
    strengths: [
      "High energy and affectionate temperament with familiar caregivers",
      "Good visual-spatial skills (matching shapes and colors)",
      "Receptive language is stronger than expressive language",
      "Responds very well to positive reinforcement and visual charts",
      "Enjoys music, rhyming, and physical movement activities"
    ],
    supportChips: ["Communication", "Attention", "Behaviour", "Social skills", "Fine motor", "Sensory processing"],
    supportDetails: "Requires comprehensive early intervention blending Speech Therapy, Occupational Therapy, and Behavioural Support.",
    presentLevels: {
      communication: "2-word phrases, speech fronting (/k/->/t/), points to express wants",
      academic: "Identifies primary colors, basic shapes, numbers 1-5, matches pictures",
      behaviour: "Sensory seeking (jumping/spinning), low frustration tolerance for denied items",
      social: "Parallel play, adult-oriented social seeking, requires prompt to turn take",
      adl: "Independent eating with spoon, day-time potty trained, needs help with buttons/laces",
      motor: "Good gross motor jumping/running; immature quadrupod grip for pre-writing",
      sensory: "Auditory hyper-reactivity (covers ears), vestibular and proprioceptive seeker"
    },
    shortTermGoals: {
      "Communication": { goal: "Use 3-word functional phrases to request items", strategy: "PECS / Communication cards + verbal prompting", review: "3 Months" },
      "Attention": { goal: "Increase seated activity attention span to 10 mins", strategy: "Visual timer + token economy board", review: "3 Months" },
      "Behaviour": { goal: "Reduce task avoidance tantrums by 50%", strategy: "First-Then visual schedule + sensory breaks", review: "3 Months" },
      "Social Skills": { goal: "Take 3 consecutive turns in a guided board game", strategy: "Peer buddy activity with therapist mediation", review: "3 Months" },
      "Pre-Academics": { goal: "Trace vertical, horizontal, and slant lines accurately", strategy: "Multi-sensory sand tray & thick triangular crayons", review: "3 Months" },
      "ADL": { goal: "Button/unbutton 3 large shirt buttons independently", strategy: "Button snake activity & dressing frame", review: "3 Months" },
      "Fine Motor": { goal: "Develop dynamic tripod grasp using pencil grip aid", strategy: "Therapy putty pinching & bead threading", review: "3 Months" },
      "Gross Motor": { goal: "Catch a thrown 6-inch ball from 4 feet distance", strategy: "Two-handed chest catch games with balloon/ball", review: "3 Months" },
      "Sensory": { goal: "Tolerate mixer grinder sound using noise-mufflers", strategy: "Auditory desensitization protocol & Wilbarger brushing", review: "3 Months" }
    },
    longTermGoals: {
      "Communication": { goal: "Engage in 3-turn conversational exchanges with peers", outcome: "Functional social expressive language", review: "1 Year" },
      "Behaviour": { goal: "Self-regulate emotional distress using break requests", outcome: "Independent emotional regulation", review: "1 Year" },
      "Learning / Academics": { goal: "Complete UKG pre-writing and number readiness skills", outcome: "Successful mainstream school readiness", review: "1 Year" },
      "Social Skills": { goal: "Participate independently in small group play (4 peers)", outcome: "Age-appropriate peer reciprocity", review: "1 Year" },
      "ADL Independence": { goal: "Complete morning grooming and dressing routine independently", outcome: "Self-care autonomy", review: "1 Year" },
      "Therapy Support": { goal: "Fade physical and gestural prompts to verbal cues only", outcome: "Generalization of skills", review: "1 Year" },
      "School Readiness": { goal: "Maintain 20 minutes classroom sitting tolerance without disruption", outcome: "Full classroom integration", review: "1 Year" }
    },
    interventionChips: [
      "Special education",
      "Speech and communication support",
      "Occupational therapy",
      "Sensory integration activities",
      "Parent counselling",
      "Home programme"
    ],
    interventionDetails: "Recommended OT 3x per week (45 mins each), Speech Therapy 2x per week (45 mins each), and Home Sensory Diet daily.",
    homeProgramSuggestions: [
      "Perform Wilbarger brushing & joint compression protocol every 3-4 hours during awake time.",
      "Practice straw drinking with thick smoothies/mango juice to strengthen lip seal.",
      "Use 'First [Homework] -> Then [Playground]' visual chart strictly at home.",
      "Engage in 10 minutes of daily paper tearing, clay rolling, and bead threading.",
      "Provide 15 minutes of heavy work (pushing laundry basket, pillow crashing) before bedtime."
    ],
    firstReviewDate: "2026-04-25",
    secondReviewDate: "2026-07-25",
    thirdReviewDate: "2026-10-25"
  },

  summarySignOff: {
    observations: {
      attention: "Attention span is short (2-3 mins) but improves significantly with visual token boards and sensory movement breaks.",
      receptiveLanguage: "Understands 1-step routine commands; requires visual/gestural support for multi-step directions.",
      expressiveLanguage: "Communicates via 2-word phrases and pointing. Displays fronting phonological process (/k/->/t/).",
      articulation: "Sound errors noted in /k/, /g/, /s/, /sh/, /r/. Speech intelligibility is ~65% to unfamiliar listeners.",
      oralMotor: "Mild lip seal weakness and reduced tongue tip elevation. Breath support is 3 seconds for vowel prolongation.",
      intelligibility: "65% in quiet room; drops to 40% when child is excited or in noisy surroundings.",
      behaviour: "Sensory seeking jumping and spinning noted. Responds well to gentle co-regulation and proprioceptive input.",
      socialSkills: "Warm social affect; peer interaction is predominantly parallel. Turn-taking needs adult guidance.",
      sensoryProcessing: "Auditory hyper-reactivity combined with high proprioceptive and vestibular seeking needs.",
      motorSkills: "Gross motor balance is functional. Fine motor displays immature pencil grip and intrinsic hand weakness.",
      adl: "Feeds independently with spoon; potty trained daytime; needs assistance with buttons and shoe laces."
    },
    recommendationChips: [
      "Speech Therapy",
      "Oral-Motor Exercises",
      "Home Practice Program",
      "School Collaboration",
      "Parent Guidance",
      "Re-evaluation"
    ],
    reevaluationWeeks: "12",
    finalRemarks: "Aarav exhibits a encouraging clinical response to sensory integration and visual communication strategies. Family is highly motivated and cooperative. Regular multidisciplinary progress reviews recommended.",
    assessorName: "Ananya Das",
    assessorDesignation: "Senior Occupational Therapist & Special Educator",
    assessorSignatureDate: new Date().toISOString().split("T")[0],
    parentName: "Vikram Patel",
    parentRelationship: "Father",
    parentSignatureDate: new Date().toISOString().split("T")[0]
  }
});

// ISAA 40 Questions Data
const ISAA_QUESTIONS: { id: number; section: string; question: string }[] = [
  // Section I - Social Relationship and Reciprocity
  { id: 1, section: "Section I — Social Relationship & Reciprocity", question: "Has poor eye contact" },
  { id: 2, section: "Section I — Social Relationship & Reciprocity", question: "Lacks social smile" },
  { id: 3, section: "Section I — Social Relationship & Reciprocity", question: "Remains aloof" },
  { id: 4, section: "Section I — Social Relationship & Reciprocity", question: "Does not reach out to others" },
  { id: 5, section: "Section I — Social Relationship & Reciprocity", question: "Unable to relate to people" },
  { id: 6, section: "Section I — Social Relationship & Reciprocity", question: "Unable to respond to social/environmental cues" },
  { id: 7, section: "Section I — Social Relationship & Reciprocity", question: "Engages in solitary and repetitive play activities" },
  { id: 8, section: "Section I — Social Relationship & Reciprocity", question: "Unable to take turns in social interaction" },
  { id: 9, section: "Section I — Social Relationship & Reciprocity", question: "Does not maintain peer relationships" },

  // Section II - Emotional Responsiveness
  { id: 10, section: "Section II — Emotional Responsiveness", question: "Shows inappropriate emotional response" },
  { id: 11, section: "Section II — Emotional Responsiveness", question: "Shows exaggerated emotions" },
  { id: 12, section: "Section II — Emotional Responsiveness", question: "Engages in self-stimulating emotions" },
  { id: 13, section: "Section II — Emotional Responsiveness", question: "Lacks fear of danger" },
  { id: 14, section: "Section II — Emotional Responsiveness", question: "Excited or agitated for no apparent reason" },

  // Section III - Speech-Language and Communication
  { id: 15, section: "Section III — Speech–Language & Communication", question: "Acquired speech and lost it" },
  { id: 16, section: "Section III — Speech–Language & Communication", question: "Has difficulty in using non-verbal language or gestures to communicate" },
  { id: 17, section: "Section III — Speech–Language & Communication", question: "Engages in stereotyped and repetitive use of language" },
  { id: 18, section: "Section III — Speech–Language & Communication", question: "Engages in echolalic speech" },
  { id: 19, section: "Section III — Speech–Language & Communication", question: "Produces infantile squeals / unusual noises" },
  { id: 20, section: "Section III — Speech–Language & Communication", question: "Unable to initiate or sustain conversation with others" },

  // Section IV - Behaviour Pattern
  { id: 21, section: "Section IV — Behaviour Pattern", question: "Engages in stereotyped and repetitive motor activities" },
  { id: 22, section: "Section IV — Behaviour Pattern", question: "Shows preoccupation with parts of objects" },
  { id: 23, section: "Section IV — Behaviour Pattern", question: "Shows excessive attachment to specific objects" },
  { id: 24, section: "Section IV — Behaviour Pattern", question: "Gets disturbed by trivial changes in environment" },
  { id: 25, section: "Section IV — Behaviour Pattern", question: "Insistence on sameness / following routines rigidly" },
  { id: 26, section: "Section IV — Behaviour Pattern", question: "Shows self-injurious behaviour" },
  { id: 27, section: "Section IV — Behaviour Pattern", question: "Shows aggressive behaviour" },
  { id: 28, section: "Section IV — Behaviour Pattern", question: "Engages in destructive behaviour" },

  // Section V - Cognitive Component
  { id: 29, section: "Section V — Cognitive Component", question: "Appears as if deaf" },
  { id: 30, section: "Section V — Cognitive Component", question: "Absent / delayed echolalia" },
  { id: 31, section: "Section V — Cognitive Component", question: "Unusual response to sensory stimuli" },
  { id: 32, section: "Section V — Cognitive Component", question: "Absence of imaginative play" },
  { id: 33, section: "Section V — Cognitive Component", question: "Does not imitate" },
  { id: 34, section: "Section V — Cognitive Component", question: "Uneven skill development" },

  // Section VI - Sensory Aspects
  { id: 35, section: "Section VI — Sensory Aspects", question: "Hypersensitive to sounds" },
  { id: 36, section: "Section VI — Sensory Aspects", question: "Insensitive to pain" },
  { id: 37, section: "Section VI — Sensory Aspects", question: "Unusual preoccupation with sensory aspects of objects" },
  { id: 38, section: "Section VI — Sensory Aspects", question: "Fascination with spinning objects" },
  { id: 39, section: "Section VI — Sensory Aspects", question: "Unusual response to light / colour" },
  { id: 40, section: "Section VI — Sensory Aspects", question: "Insensitive to temperature changes" }
];

// Tab Metadata definitions
const TABS_CONFIG = [
  { id: 1, title: "1. Child & Case Details", shortTitle: "Child & Case", key: "childDetails" },
  { id: 2, title: "2. Developmental & Medical History", shortTitle: "Dev & Medical", key: "devHistory" },
  { id: 3, title: "3. Previous Therapy & School History", shortTitle: "Therapy & School", key: "therapySchoolHistory" },
  { id: 4, title: "4. Attention, Communication & Social Skills", shortTitle: "Communication & Social", key: "communicationSocial" },
  { id: 5, title: "5. Behaviour & Emotional Regulation", shortTitle: "Behaviour & Emotion", key: "behaviourEmotional" },
  { id: 6, title: "6. Motor Skills & Sensory Processing", shortTitle: "Motor & Sensory", key: "motorSensory" },
  { id: 7, title: "7. Pre-Academic, ADL & Learning Style", shortTitle: "Pre-Academic & ADL", key: "academicADL" },
  { id: 8, title: "8. Oral-Motor & Articulation", shortTitle: "Oral-Motor & Speech", key: "oralMotorArticulation" },
  { id: 9, title: "9. ISAA Rating Scale", shortTitle: "ISAA Autism Scale", key: "isaa" },
  { id: 10, title: "10. Strengths, Goals & Recommendations", shortTitle: "Goals & Plan", key: "goalsRecommendations" },
  { id: 11, title: "11. Observations & Sign-Off", shortTitle: "Summary & Sign-Off", key: "summarySignOff" }
];

export default function ClinicalAssessmentForm() {
  const { children, activeTherapistId, therapists, submitAssessment, setActiveTab } = useDashboard();
  const currentTherapist = therapists.find((t) => t.id === activeTherapistId);

  const [activeTabId, setActiveTabId] = useState(1);
  const [formData, setFormData] = useState<AssessmentFormData>(getInitialFormData);
  const [draftRestored, setDraftRestored] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([1]));

  // Auto-restore draft on mount
  useEffect(() => {
    const childId = formData.childDetails.childName || "default";
    const savedDraft = localStorage.getItem(`assessment_draft_${childId}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setDraftRestored(true);
      } catch (err) {
        console.error("Failed to parse saved draft", err);
      }
    }
  }, []);

  // Save to localStorage on field change
  const updateFormData = (updater: (prev: AssessmentFormData) => AssessmentFormData) => {
    setFormData((prev) => {
      const updated = updater(prev);
      const childId = updated.childDetails.childName || "default";
      localStorage.setItem(`assessment_draft_${childId}`, JSON.stringify(updated));
      return updated;
    });
    setVisitedTabs((prev) => new Set(prev).add(activeTabId));
  };

  const handleManualSave = () => {
    const childId = formData.childDetails.childName || "default";
    localStorage.setItem(`assessment_draft_${childId}`, JSON.stringify(formData));
    setSaveStatus("Progress saved locally!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // ISAA Auto-calculation
  const isaaTotalScore = useMemo(() => {
    return Object.values(formData.isaa.ratings).reduce((sum, score) => sum + (score || 0), 0);
  }, [formData.isaa.ratings]);

  const isaaInterpretation = useMemo(() => {
    if (isaaTotalScore >= 154) return { label: "Severe Autism", variant: "bg-red-100 text-red-800 border-red-300" };
    if (isaaTotalScore >= 107) return { label: "Moderate Autism", variant: "bg-amber-100 text-amber-800 border-amber-300" };
    if (isaaTotalScore >= 70) return { label: "Mild Autism", variant: "bg-blue-100 text-blue-800 border-blue-300" };
    return { label: "Does not indicate autism", variant: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  }, [isaaTotalScore]);

  // Completion calculation
  const completionPercentage = useMemo(() => {
    let completedCount = 0;
    const totalTabs = 11;
    
    if (formData.childDetails.childName && formData.childDetails.dob) completedCount++;
    if (formData.devHistory.birthHistoryChips.length > 0) completedCount++;
    if (formData.therapySchoolHistory.parentPriorityGoals.some(g => g.trim() !== "")) completedCount++;
    if (Object.keys(formData.communicationSocial.commRatings).length > 0) completedCount++;
    if (Object.keys(formData.behaviourEmotional.taskRatings).length > 0) completedCount++;
    if (Object.keys(formData.motorSensory.fineMotorRatings).length > 0) completedCount++;
    if (Object.keys(formData.academicADL.preAcademicRatings).length > 0) completedCount++;
    if (Object.keys(formData.oralMotorArticulation.oralMotorTable).length > 0) completedCount++;
    if (Object.keys(formData.isaa.ratings).length >= 35) completedCount++;
    if (formData.goalsRecommendations.strengths.some(s => s.trim() !== "")) completedCount++;
    if (formData.summarySignOff.assessorName) completedCount++;

    return Math.round((completedCount / totalTabs) * 100);
  }, [formData]);

  const handleNextTab = () => {
    if (activeTabId < 11) {
      const nextId = activeTabId + 1;
      setActiveTabId(nextId);
      setVisitedTabs((prev) => new Set(prev).add(nextId));
    }
  };

  const handlePrevTab = () => {
    if (activeTabId > 1) {
      setActiveTabId(activeTabId - 1);
    }
  };

  const handleFinalSubmit = () => {
    setShowConfirmModal(false);
    
    // Trigger Context submission
    submitAssessment({
      childId: "KCR-2026-001",
      childName: formData.childDetails.childName,
      assessmentDate: formData.childDetails.assessmentDate,
      type: "Occupational Therapy",
      therapistId: activeTherapistId,
      therapistName: formData.childDetails.assessedBy || currentTherapist?.name || "Ananya Das",
      caseHistory: {
        parentConcern: formData.childDetails.primaryComplaint,
        pregnancyHistory: "Normal",
        pregnancyDetails: formData.devHistory.birthHistoryDetails,
        milestones: {
          headControl: formData.devHistory.milestones["Neck holding"]?.status === "Delayed" ? "Delayed" : "Normal",
          sitting: formData.devHistory.milestones["Sitting"]?.status === "Delayed" ? "Delayed" : "Normal",
          crawling: formData.devHistory.milestones["Crawling"]?.status === "Delayed" ? "Delayed" : "Normal",
          walking: formData.devHistory.milestones["Walking"]?.status === "Delayed" ? "Delayed" : "Normal",
          firstWords: formData.devHistory.milestones["Speech development"]?.status === "Delayed" ? "Delayed" : "Normal",
          toiletTraining: formData.devHistory.milestones["Toilet training"]?.status === "Delayed" ? "Delayed" : "Normal"
        },
        medicalConditions: formData.devHistory.medicalChips,
        previousTherapy: formData.childDetails.previousTherapy === "Yes" ? "Yes" : "No",
        previousTherapyDetails: formData.childDetails.previousTherapyDetails,
        schoolHistory: formData.therapySchoolHistory.schoolDetails
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
      clinicalImpressionSummary: formData.summarySignOff.finalRemarks,
      recommendations: formData.goalsRecommendations.interventionDetails
    });

    // Clear local storage draft
    const childId = formData.childDetails.childName || "default";
    localStorage.removeItem(`assessment_draft_${childId}`);
    
    // Redirect to review tab
    setActiveTab("assessments");
  };

  const activeTabMeta = TABS_CONFIG.find((t) => t.id === activeTabId)!;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-24 text-slate-800">
      
      {/* Draft Restored Banner */}
      {draftRestored && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 fill-slate-950" />
            <span>Draft restored from local storage for {formData.childDetails.childName || "Child"}</span>
          </div>
          <button
            onClick={() => setDraftRestored(false)}
            className="text-slate-950 hover:bg-amber-600/30 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Save Toast Alert */}
      {saveStatus && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* STICKY CHILD HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#185FA5] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-xs text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <span className="text-blue-100 text-[10px] block uppercase tracking-wider font-extrabold leading-none">Child Name</span>
                <span className="font-extrabold text-white text-base leading-tight">{formData.childDetails.childName || "Aarav Patel"}</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-6 border-l border-white/20 pl-6">
              <div>
                <span className="text-blue-100 text-[10px] block uppercase tracking-wider font-extrabold leading-none">Child ID</span>
                <span className="font-semibold text-white">KCR-2026-001</span>
              </div>
              <div>
                <span className="text-blue-100 text-[10px] block uppercase tracking-wider font-extrabold leading-none">Date of Assessment</span>
                <span className="font-semibold text-white">{formData.childDetails.assessmentDate}</span>
              </div>
              <div>
                <span className="text-blue-100 text-[10px] block uppercase tracking-wider font-extrabold leading-none">Assessed By</span>
                <span className="font-semibold text-white">{formData.childDetails.assessedBy || currentTherapist?.name || "Ananya Das"}</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-28 sm:w-36 bg-blue-900/50 rounded-full h-2.5 overflow-hidden border border-white/20">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-black text-emerald-300 whitespace-nowrap">{completionPercentage}% Completed</span>
            </div>
          </div>
        </div>

        {/* STICKY RATING LEGEND STRIP */}
        <div className="bg-[#12487e] border-t border-white/10 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <span className="font-extrabold text-blue-100 uppercase text-[10px] tracking-wider">
              {activeTabId === 9 ? "ISAA Rating Scale:" : "Clinical Rating Scale:"}
            </span>

            {activeTabId === 9 ? (
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full border border-emerald-400">1 = Rarely (Upto 20%)</span>
                <span className="bg-lime-600 text-white px-2 py-0.5 rounded-full border border-lime-400">2 = Sometimes (21–40%)</span>
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full border border-amber-300">3 = Frequently (41–60%)</span>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full border border-orange-300">4 = Mostly (61–80%)</span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full border border-rose-400">5 = Always (81–100%)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full border border-rose-400">0 = Not Developed</span>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full border border-orange-300">1 = Emerging / Full Support</span>
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full border border-amber-300">2 = Partial Support</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full border border-emerald-400">3 = Independent / Age Appropriate</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* STICKY TAB NAVIGATION BAR */}
      <nav className="sticky top-[86px] z-30 bg-white border-b border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 px-4 py-2 max-w-7xl mx-auto min-w-max">
          {TABS_CONFIG.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isVisited = visitedTabs.has(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setVisitedTabs((prev) => new Set(prev).add(tab.id));
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  isActive
                    ? "bg-[#185FA5] text-white border-[#185FA5] shadow-sm"
                    : isVisited
                    ? "bg-blue-50/70 text-slate-700 border-blue-100 hover:bg-blue-100/60"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{tab.shortTitle}</span>
                {isVisited && (
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    isActive ? "bg-white text-[#185FA5]" : "bg-blue-600 text-white"
                  }`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN TAB CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        
        {/* ================= TAB 1: CHILD & CASE DETAILS ================= */}
        {activeTabId === 1 && (
          <SectionCard title="Child & Case Identification Details" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Child&apos;s Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.childDetails.childName}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, childName: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none"
                  placeholder="Full Name of Child"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Date of Birth <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={formData.childDetails.dob}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        childDetails: { ...prev.childDetails, dob: e.target.value }
                      }))
                    }
                    className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none"
                  />
                  <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 flex items-center">
                    Age: {formData.childDetails.ageYears}y {formData.childDetails.ageMonths}m
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Gender</label>
                <RadioPills
                  options={["Male", "Female", "Other"]}
                  value={formData.childDetails.gender}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, gender: val as any }
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Date of Assessment <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.childDetails.assessmentDate}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, assessmentDate: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={formData.childDetails.parentName}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, parentName: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Father / Mother Name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={formData.childDetails.contactNumber}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, contactNumber: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="+91 Mobile Number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.childDetails.address}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, address: e.target.value }
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Residential Address"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Diagnosis / Clinical Condition</label>
                <input
                  type="text"
                  value={formData.childDetails.diagnosis}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, diagnosis: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. SPD, ADHD, Autism Spectrum, Speech Delay"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assessed By <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.childDetails.assessedBy}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, assessedBy: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Therapist / Examiner Name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.childDetails.designation}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, designation: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. Occupational Therapist / Speech Therapist"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">School / Class</label>
                <input
                  type="text"
                  value={formData.childDetails.schoolClass}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, schoolClass: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. Little Elly Preschool - UKG"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">UDID / Disability ID (if any)</label>
                <input
                  type="text"
                  value={formData.childDetails.udidNumber}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, udidNumber: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="UDID Card Number"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Assessment Type</label>
                <RadioPills
                  options={["Initial", "Review"]}
                  value={formData.childDetails.assessmentType}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, assessmentType: val as any }
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Languages Spoken at Home</label>
                <input
                  type="text"
                  value={formData.childDetails.languagesSpoken}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, languagesSpoken: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. Tamil, English"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Referred By</label>
                <input
                  type="text"
                  value={formData.childDetails.referredBy}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, referredBy: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Pediatrician / School Teacher"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Complaint / Parental Concern</label>
                <textarea
                  rows={3}
                  value={formData.childDetails.primaryComplaint}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, primaryComplaint: e.target.value }
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Describe main difficulties observed by parents"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">When did parents first notice concern?</label>
                <input
                  type="text"
                  value={formData.childDetails.whenConcernNoticed}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, whenConcernNoticed: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. At 2 years of age"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Any Previous Therapy Taken?</label>
                <RadioPills
                  options={["Yes", "No"]}
                  value={formData.childDetails.previousTherapy}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, previousTherapy: val as any }
                    }))
                  }
                />
              </div>

              {formData.childDetails.previousTherapy === "Yes" && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specify Previous Therapy Type & Duration</label>
                  <textarea
                    rows={2}
                    value={formData.childDetails.previousTherapyDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        childDetails: { ...prev.childDetails, previousTherapyDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="e.g. Speech Therapy 6 months at local center"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Hearing Screening Done?</label>
                <RadioPills
                  options={["Yes", "No", "Not done"]}
                  value={formData.childDetails.hearingScreening}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, hearingScreening: val as any }
                    }))
                  }
                />
              </div>

              {formData.childDetails.hearingScreening === "Yes" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hearing Screening Result</label>
                  <input
                    type="text"
                    value={formData.childDetails.hearingScreeningResult}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        childDetails: { ...prev.childDetails, hearingScreeningResult: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="e.g. Passed BERA test"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Family History of Speech Delay / Hearing Loss?</label>
                <RadioPills
                  options={["Yes", "No"]}
                  value={formData.childDetails.familyHistoryDelay}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, familyHistoryDelay: val as any }
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Father&apos;s Occupation</label>
                  <input
                    type="text"
                    value={formData.childDetails.fatherOccupation}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        childDetails: { ...prev.childDetails, fatherOccupation: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Occupation"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mother&apos;s Occupation</label>
                  <input
                    type="text"
                    value={formData.childDetails.motherOccupation}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        childDetails: { ...prev.childDetails, motherOccupation: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Occupation"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Both Parents Working?</label>
                <RadioPills
                  options={["Yes", "No"]}
                  value={formData.childDetails.bothParentsWorking}
                  onChange={(val) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, bothParentsWorking: val as any }
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Caretaker / Communication Partner</label>
                <input
                  type="text"
                  value={formData.childDetails.primaryCaretaker}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, primaryCaretaker: e.target.value }
                    }))
                  }
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="e.g. Mother / Grandmother"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">School Feedback / Teacher&apos;s Report</label>
                <textarea
                  rows={2}
                  value={formData.childDetails.schoolFeedback}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, schoolFeedback: e.target.value }
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Feedback from classroom teacher"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Peer Interaction Notes</label>
                <textarea
                  rows={2}
                  value={formData.childDetails.peerInteractionNotes}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, peerInteractionNotes: e.target.value }
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Notes on peer relationship and play"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Social Behaviour / Temperament</label>
                <textarea
                  rows={2}
                  value={formData.childDetails.socialBehaviourNotes}
                  onChange={(e) =>
                    updateFormData((prev) => ({
                      ...prev,
                      childDetails: { ...prev.childDetails, socialBehaviourNotes: e.target.value }
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  placeholder="Temperament and emotional baseline"
                />
              </div>

            </div>
          </SectionCard>
        )}

        {/* ================= TAB 2: DEVELOPMENTAL & MEDICAL HISTORY ================= */}
        {activeTabId === 2 && (
          <div className="space-y-6">
            <SectionCard title="Birth History" icon={Activity}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Birth History Conditions (Select all that apply)</label>
                  <ChipGroup
                    options={["Normal delivery", "C-section", "Preterm", "Low birth weight", "NICU admission", "Birth complications"]}
                    selected={formData.devHistory.birthHistoryChips}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        devHistory: { ...prev.devHistory, birthHistoryChips: selected }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Birth History Details</label>
                  <textarea
                    rows={2}
                    value={formData.devHistory.birthHistoryDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        devHistory: { ...prev.devHistory, birthHistoryDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Details about delivery, birth weight, oxygen, NICU stay..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Developmental Milestones" icon={Activity}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Milestone Area</th>
                      <th className="p-3 font-extrabold text-slate-700 w-48 text-center">Status</th>
                      <th className="p-3 font-extrabold text-slate-700">Remarks / Age Achieved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Neck holding", "Sitting", "Crawling", "Walking", "Speech development", "Toilet training"].map((item) => {
                      const current = formData.devHistory.milestones[item] || { status: "", remarks: "" };
                      return (
                        <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item}</td>
                          <td className="p-3 text-center">
                            <RadioPills
                              options={["Achieved", "Delayed"]}
                              value={current.status}
                              onChange={(val) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  devHistory: {
                                    ...prev.devHistory,
                                    milestones: {
                                      ...prev.devHistory.milestones,
                                      [item]: { ...current, status: val as any }
                                    }
                                  }
                                }))
                              }
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.remarks}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  devHistory: {
                                    ...prev.devHistory,
                                    milestones: {
                                      ...prev.devHistory.milestones,
                                      [item]: { ...current, remarks: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="e.g. Achieved at 6 months"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Medical History" icon={Activity}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Medical Conditions (Multi-select)</label>
                  <ChipGroup
                    options={["Seizure history", "Hearing difficulty", "Vision difficulty", "Sleep issues", "Feeding difficulty", "Frequent illness", "Medication", "Other"]}
                    selected={formData.devHistory.medicalChips}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        devHistory: { ...prev.devHistory, medicalChips: selected }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Medical Details</label>
                  <textarea
                    rows={2}
                    value={formData.devHistory.medicalDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        devHistory: { ...prev.devHistory, medicalDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Specific medications, doctor recommendations, EEG/MRI reports..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Main Areas of Difficulty (Reported by Parent)" icon={AlertCircle}>
              <div className="space-y-4">
                <ChipGroup
                  options={["Speech delay", "Poor attention", "Hyperactivity", "Behaviour issues", "Poor social interaction", "Learning difficulty", "Sensory issues", "Motor difficulty", "Poor ADL skills", "School readiness concern"]}
                  selected={formData.devHistory.difficultyChips}
                  onChange={(selected) =>
                    updateFormData((prev) => ({
                      ...prev,
                      devHistory: { ...prev.devHistory, difficultyChips: selected }
                    }))
                  }
                />
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Other Difficulty (Specify if any)</label>
                  <input
                    type="text"
                    value={formData.devHistory.difficultyOther}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        devHistory: { ...prev.devHistory, difficultyOther: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Additional parental concerns"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 3: PREVIOUS THERAPY & SCHOOL HISTORY ================= */}
        {activeTabId === 3 && (
          <div className="space-y-6">
            <SectionCard title="Previous Therapy Taken" icon={FileText}>
              <div className="space-y-4">
                <ChipGroup
                  options={["Physiotherapy", "Occupational therapy", "Speech therapy", "Special education", "Behaviour therapy", "Psychological counselling", "Sensory integration", "Early intervention", "None"]}
                  selected={formData.therapySchoolHistory.previousTherapyChips}
                  onChange={(selected) =>
                    updateFormData((prev) => ({
                      ...prev,
                      therapySchoolHistory: { ...prev.therapySchoolHistory, previousTherapyChips: selected }
                    }))
                  }
                />
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Therapy Details (Duration, center, outcome)</label>
                  <textarea
                    rows={3}
                    value={formData.therapySchoolHistory.previousTherapyDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        therapySchoolHistory: { ...prev.therapySchoolHistory, previousTherapyDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Details of previous intervention programs"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="School History" icon={BookOpen}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">School Status (Single select)</label>
                  <ChipGroup
                    singleSelect
                    options={["Not yet admitted", "Playschool", "Mainstream school", "Special school", "Home-based learning"]}
                    selected={formData.therapySchoolHistory.schoolStatusChip ? [formData.therapySchoolHistory.schoolStatusChip] : []}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        therapySchoolHistory: { ...prev.therapySchoolHistory, schoolStatusChip: selected[0] || "" }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">School Name / Class / Concerns</label>
                  <textarea
                    rows={3}
                    value={formData.therapySchoolHistory.schoolDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        therapySchoolHistory: { ...prev.therapySchoolHistory, schoolDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="School name, current grade, teacher notes, academic performance..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Parent Priority Goals (Top 5)" icon={Award}>
              <div className="space-y-3">
                {formData.therapySchoolHistory.parentPriorityGoals.map((goalText, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-[#185FA5] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={goalText}
                      onChange={(e) => {
                        const newGoals = [...formData.therapySchoolHistory.parentPriorityGoals];
                        newGoals[idx] = e.target.value;
                        updateFormData((prev) => ({
                          ...prev,
                          therapySchoolHistory: { ...prev.therapySchoolHistory, parentPriorityGoals: newGoals }
                        }));
                      }}
                      className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                      placeholder={`Priority Goal ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 4: ATTENTION, COMMUNICATION & SOCIAL SKILLS ================= */}
        {activeTabId === 4 && (
          <div className="space-y-6">
            <SectionCard title="Attention & Listening Skills" icon={Brain}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Maintains eye contact",
                  "Responds to name",
                  "Follows 1-step command",
                  "Follows 2–3 step commands",
                  "Sustains attention during activity",
                  "Easily distracted"
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{item}</span>
                    <YesNoToggle
                      value={formData.communicationSocial.attentionToggles[item] || ""}
                      onChange={(val) =>
                        updateFormData((prev) => ({
                          ...prev,
                          communicationSocial: {
                            ...prev.communicationSocial,
                            attentionToggles: { ...prev.communicationSocial.attentionToggles, [item]: val }
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Sitting Tolerance" icon={Activity}>
              <ChipGroup
                singleSelect
                options={["Less than 2 minutes", "2–5 minutes", "5–10 minutes", "10–20 minutes", "More than 20 minutes"]}
                selected={formData.communicationSocial.sittingToleranceChip ? [formData.communicationSocial.sittingToleranceChip] : []}
                onChange={(selected) =>
                  updateFormData((prev) => ({
                    ...prev,
                    communicationSocial: { ...prev.communicationSocial, sittingToleranceChip: selected[0] || "" }
                  }))
                }
              />
            </SectionCard>

            <SectionCard title="Communication and Language Assessment (0–3 Rating)" icon={Volume2}>
              <div className="space-y-3">
                {[
                  "Responds to name",
                  "Maintains eye contact",
                  "Understands simple instructions",
                  "Follows one-step commands",
                  "Follows two-step commands",
                  "Uses gestures / pointing",
                  "Requests needs appropriately",
                  "Uses sounds / words",
                  "Uses phrases / sentences",
                  "Names familiar objects",
                  "Answers simple questions",
                  "Communicates pain / discomfort"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.communicationSocial.commRatings[item]?.score ?? null}
                    remarks={formData.communicationSocial.commRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: {
                          ...prev.communicationSocial,
                          commRatings: {
                            ...prev.communicationSocial.commRatings,
                            [item]: { score, remarks: prev.communicationSocial.commRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: {
                          ...prev.communicationSocial,
                          commRatings: {
                            ...prev.communicationSocial.commRatings,
                            [item]: { score: prev.communicationSocial.commRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}
                
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Communication and Language Summary</label>
                  <textarea
                    rows={3}
                    value={formData.communicationSocial.commSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: { ...prev.communicationSocial, commSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Overall receptive and expressive language clinical observations..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Receptive Language (Yes / No)" icon={BookOpen}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Understands familiar instructions",
                  "Identifies pictures / objects",
                  "Understands 'what / who / where' questions",
                  "Understands prepositions",
                  "Understands short stories / classroom directions"
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{item}</span>
                    <YesNoToggle
                      value={formData.communicationSocial.receptiveToggles[item] || ""}
                      onChange={(val) =>
                        updateFormData((prev) => ({
                          ...prev,
                          communicationSocial: {
                            ...prev.communicationSocial,
                            receptiveToggles: { ...prev.communicationSocial.receptiveToggles, [item]: val }
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Expressive Language (Yes / No)" icon={Volume2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Uses single words / short phrases",
                  "Speaks in full sentences",
                  "Names objects / actions",
                  "Narrates simple events",
                  "Asks and answers questions",
                  "Uses correct grammar / tenses"
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{item}</span>
                    <YesNoToggle
                      value={formData.communicationSocial.expressiveToggles[item] || ""}
                      onChange={(val) =>
                        updateFormData((prev) => ({
                          ...prev,
                          communicationSocial: {
                            ...prev.communicationSocial,
                            expressiveToggles: { ...prev.communicationSocial.expressiveToggles, [item]: val }
                          }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Social Skills and Play Skills (0–3 Rating)" icon={Smile}>
              <div className="space-y-3">
                {[
                  "Responds to adults",
                  "Responds to peers",
                  "Greets others",
                  "Shares toys / materials",
                  "Takes turns",
                  "Imitates actions",
                  "Functional play",
                  "Pretend play",
                  "Participates in group activity",
                  "Understands simple classroom rules"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.communicationSocial.socialRatings[item]?.score ?? null}
                    remarks={formData.communicationSocial.socialRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: {
                          ...prev.communicationSocial,
                          socialRatings: {
                            ...prev.communicationSocial.socialRatings,
                            [item]: { score, remarks: prev.communicationSocial.socialRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: {
                          ...prev.communicationSocial,
                          socialRatings: {
                            ...prev.communicationSocial.socialRatings,
                            [item]: { score: prev.communicationSocial.socialRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Social Skills Summary</label>
                  <textarea
                    rows={3}
                    value={formData.communicationSocial.socialSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        communicationSocial: { ...prev.communicationSocial, socialSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Peer relationship, turn taking, play maturity..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 5: BEHAVIOUR & EMOTIONAL REGULATION ================= */}
        {activeTabId === 5 && (
          <div className="space-y-6">
            <SectionCard title="Attention, Sitting Tolerance and Task Behaviour (0–3 Rating)" icon={Brain}>
              <div className="space-y-3">
                {[
                  "Sits for activity",
                  "Attends to teacher",
                  "Completes simple task",
                  "Waits for turn",
                  "Responds to redirection",
                  "Transitions between activities",
                  "Works with prompts",
                  "Works independently"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.behaviourEmotional.taskRatings[item]?.score ?? null}
                    remarks={formData.behaviourEmotional.taskRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: {
                          ...prev.behaviourEmotional,
                          taskRatings: {
                            ...prev.behaviourEmotional.taskRatings,
                            [item]: { score, remarks: prev.behaviourEmotional.taskRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: {
                          ...prev.behaviourEmotional,
                          taskRatings: {
                            ...prev.behaviourEmotional.taskRatings,
                            [item]: { score: prev.behaviourEmotional.taskRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Task Behaviour Summary</label>
                  <textarea
                    rows={2}
                    value={formData.behaviourEmotional.taskSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: { ...prev.behaviourEmotional, taskSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Task completion style and prompt dependency..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Behaviour Assessment" icon={ShieldAlert}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Behaviour Concern</th>
                      <th className="p-3 font-extrabold text-slate-700 w-48 text-center">Status</th>
                      <th className="p-3 font-extrabold text-slate-700">Frequency / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "Hyperactivity",
                      "Poor attention",
                      "Tantrums",
                      "Crying episodes",
                      "Aggression",
                      "Self-injurious behaviour",
                      "Repetitive behaviour",
                      "Resistance to task",
                      "Difficulty with change",
                      "Sensory-seeking behaviour",
                      "Fear / anxiety",
                      "Sleep-related behaviour concern"
                    ].map((item) => {
                      const current = formData.behaviourEmotional.behaviourTable[item] || { status: "", remarks: "" };
                      return (
                        <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item}</td>
                          <td className="p-3 text-center">
                            <RadioPills
                              options={["Present", "Not Present"]}
                              value={current.status}
                              onChange={(val) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  behaviourEmotional: {
                                    ...prev.behaviourEmotional,
                                    behaviourTable: {
                                      ...prev.behaviourEmotional.behaviourTable,
                                      [item]: { ...current, status: val as any }
                                    }
                                  }
                                }))
                              }
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.remarks}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  behaviourEmotional: {
                                    ...prev.behaviourEmotional,
                                    behaviourTable: {
                                      ...prev.behaviourEmotional.behaviourTable,
                                      [item]: { ...current, remarks: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Frequency / Trigger remarks"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Possible Behaviour Triggers & Summary" icon={AlertCircle}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Triggers (Multi-select)</label>
                  <ChipGroup
                    options={["Denied object", "Waiting", "Noise", "New place", "Task demand", "Hunger", "Fatigue", "Transition", "Unknown"]}
                    selected={formData.behaviourEmotional.triggerChips}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: { ...prev.behaviourEmotional, triggerChips: selected }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Behaviour Summary</label>
                  <textarea
                    rows={3}
                    value={formData.behaviourEmotional.behaviourSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: { ...prev.behaviourEmotional, behaviourSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Overall behavioural dynamics and co-regulation strategy..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Emotional Regulation (0–3 Rating)" icon={Smile}>
              <div className="space-y-3">
                {[
                  "Expresses needs calmly",
                  "Waits without distress",
                  "Accepts 'no'",
                  "Handles correction",
                  "Calms after upset",
                  "Accepts change in routine",
                  "Shows age-appropriate emotional response"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.behaviourEmotional.emotionalRatings[item]?.score ?? null}
                    remarks={formData.behaviourEmotional.emotionalRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: {
                          ...prev.behaviourEmotional,
                          emotionalRatings: {
                            ...prev.behaviourEmotional.emotionalRatings,
                            [item]: { score, remarks: prev.behaviourEmotional.emotionalRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: {
                          ...prev.behaviourEmotional,
                          emotionalRatings: {
                            ...prev.behaviourEmotional.emotionalRatings,
                            [item]: { score: prev.behaviourEmotional.emotionalRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emotional Regulation Summary</label>
                  <textarea
                    rows={2}
                    value={formData.behaviourEmotional.emotionalSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        behaviourEmotional: { ...prev.behaviourEmotional, emotionalSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Self-soothing techniques and regulatory support needed..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 6: MOTOR SKILLS & SENSORY PROCESSING ================= */}
        {activeTabId === 6 && (
          <div className="space-y-6">
            <SectionCard title="Fine Motor Skills (0–3 Rating)" icon={Activity}>
              <div className="space-y-3">
                {[
                  "Reaches and grasps objects",
                  "Transfers objects hand to hand",
                  "Stacks blocks",
                  "Peg board activity",
                  "Beading / threading",
                  "Tears paper",
                  "Pastes paper",
                  "Uses crayons",
                  "Pencil grip",
                  "Scribbling",
                  "Tracing",
                  "Uses scissors safely",
                  "Buttoning / unbuttoning"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.motorSensory.fineMotorRatings[item]?.score ?? null}
                    remarks={formData.motorSensory.fineMotorRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: {
                          ...prev.motorSensory,
                          fineMotorRatings: {
                            ...prev.motorSensory.fineMotorRatings,
                            [item]: { score, remarks: prev.motorSensory.fineMotorRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: {
                          ...prev.motorSensory,
                          fineMotorRatings: {
                            ...prev.motorSensory.fineMotorRatings,
                            [item]: { score: prev.motorSensory.fineMotorRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fine Motor Summary</label>
                  <textarea
                    rows={2}
                    value={formData.motorSensory.fineMotorSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: { ...prev.motorSensory, fineMotorSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Hand strength, grasp type, bilateral integration..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Gross Motor Skills (0–3 Rating)" icon={Activity}>
              <div className="space-y-3">
                {[
                  "Sitting balance",
                  "Standing balance",
                  "Walking",
                  "Running",
                  "Jumping",
                  "Climbing stairs",
                  "Kicking ball",
                  "Throwing ball",
                  "Catching ball",
                  "Body coordination",
                  "Posture control",
                  "Muscle tone concern"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.motorSensory.grossMotorRatings[item]?.score ?? null}
                    remarks={formData.motorSensory.grossMotorRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: {
                          ...prev.motorSensory,
                          grossMotorRatings: {
                            ...prev.motorSensory.grossMotorRatings,
                            [item]: { score, remarks: prev.motorSensory.grossMotorRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: {
                          ...prev.motorSensory,
                          grossMotorRatings: {
                            ...prev.motorSensory.grossMotorRatings,
                            [item]: { score: prev.motorSensory.grossMotorRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gross Motor Summary</label>
                  <textarea
                    rows={2}
                    value={formData.motorSensory.grossMotorSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: { ...prev.motorSensory, grossMotorSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Postural stability, endurance, muscle tone..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Sensory Processing Assessment" icon={Sparkles}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Sensory Area</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center">Response Style</th>
                      <th className="p-3 font-extrabold text-slate-700">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "Sound",
                      "Touch",
                      "Movement",
                      "Light / visual input",
                      "Smell",
                      "Taste / food texture",
                      "Oral sensory needs",
                      "Deep pressure need"
                    ].map((item) => {
                      const current = formData.motorSensory.sensoryTable[item] || { response: "", remarks: "" };
                      return (
                        <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item}</td>
                          <td className="p-3 text-center">
                            <RadioPills
                              options={["Over Responsive", "Under Responsive", "Seeking"]}
                              value={current.response}
                              onChange={(val) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  motorSensory: {
                                    ...prev.motorSensory,
                                    sensoryTable: {
                                      ...prev.motorSensory.sensoryTable,
                                      [item]: { ...current, response: val as any }
                                    }
                                  }
                                }))
                              }
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.remarks}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  motorSensory: {
                                    ...prev.motorSensory,
                                    sensoryTable: {
                                      ...prev.motorSensory.sensoryTable,
                                      [item]: { ...current, remarks: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Clinical observations"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Sensory Concerns Noted & Summary" icon={Sparkles}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Sensory Concerns Noted (Multi-select)</label>
                  <ChipGroup
                    options={[
                      "Covers ears",
                      "Avoids touch",
                      "Toe walking",
                      "Spins objects",
                      "Hand flapping",
                      "Chews objects",
                      "Seeks pressure",
                      "Avoids certain food textures",
                      "Fear of movement",
                      "Constant movement seeking"
                    ]}
                    selected={formData.motorSensory.sensoryChips}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: { ...prev.motorSensory, sensoryChips: selected }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sensory Summary</label>
                  <textarea
                    rows={3}
                    value={formData.motorSensory.sensorySummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        motorSensory: { ...prev.motorSensory, sensorySummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Overall sensory integration profile and sensory diet recommendation..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 7: PRE-ACADEMIC, ADL & LEARNING STYLE ================= */}
        {activeTabId === 7 && (
          <div className="space-y-6">
            <SectionCard title="Pre-Academic and Academic Skills (0–3 Rating)" icon={BookOpen}>
              <div className="space-y-3">
                {[
                  "Matches objects",
                  "Matches pictures",
                  "Sorts objects",
                  "Identifies colours",
                  "Identifies shapes",
                  "Identifies body parts",
                  "Identifies animals",
                  "Identifies fruits / vegetables",
                  "Identifies alphabets",
                  "Identifies numbers",
                  "Counts objects",
                  "Recites rhymes",
                  "Recognises name",
                  "Copies lines / shapes",
                  "Pre-writing readiness"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.academicADL.preAcademicRatings[item]?.score ?? null}
                    remarks={formData.academicADL.preAcademicRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: {
                          ...prev.academicADL,
                          preAcademicRatings: {
                            ...prev.academicADL.preAcademicRatings,
                            [item]: { score, remarks: prev.academicADL.preAcademicRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: {
                          ...prev.academicADL,
                          preAcademicRatings: {
                            ...prev.academicADL.preAcademicRatings,
                            [item]: { score: prev.academicADL.preAcademicRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pre-Academic Skills Summary</label>
                  <textarea
                    rows={2}
                    value={formData.academicADL.preAcademicSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: { ...prev.academicADL, preAcademicSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Cognitive matching, sorting, pre-reading and writing baseline..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Activities of Daily Living (ADL) (0–3 Rating)" icon={CheckCircle2}>
              <div className="space-y-3">
                {[
                  "Eating independently",
                  "Drinking from cup / bottle",
                  "Hand washing",
                  "Brushing",
                  "Dressing",
                  "Undressing",
                  "Toileting",
                  "Indicates toilet need",
                  "Wears footwear",
                  "Arranges school bag",
                  "Cleans up after activity",
                  "Follows daily routine"
                ].map((item) => (
                  <RatingRow
                    key={item}
                    label={item}
                    rating={formData.academicADL.adlRatings[item]?.score ?? null}
                    remarks={formData.academicADL.adlRatings[item]?.remarks || ""}
                    onRatingChange={(score) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: {
                          ...prev.academicADL,
                          adlRatings: {
                            ...prev.academicADL.adlRatings,
                            [item]: { score, remarks: prev.academicADL.adlRatings[item]?.remarks || "" }
                          }
                        }
                      }))
                    }
                    onRemarksChange={(remarks) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: {
                          ...prev.academicADL,
                          adlRatings: {
                            ...prev.academicADL.adlRatings,
                            [item]: { score: prev.academicADL.adlRatings[item]?.score ?? null, remarks }
                          }
                        }
                      }))
                    }
                  />
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">ADL Summary</label>
                  <textarea
                    rows={2}
                    value={formData.academicADL.adlSummary}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: { ...prev.academicADL, adlSummary: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Independent self-care autonomy..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Learning Style & Teaching Strategies" icon={Brain}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Preferred Learning Modality (Multi-select)</label>
                  <ChipGroup
                    options={[
                      "Visual method",
                      "Verbal instruction",
                      "Picture cards",
                      "Objects / real materials",
                      "Music / rhymes",
                      "Movement-based learning",
                      "Repetition",
                      "Imitation",
                      "Play-based learning",
                      "Smart TV / digital learning",
                      "One-to-one teaching",
                      "Group activity"
                    ]}
                    selected={formData.academicADL.learningStyleChips}
                    onChange={(selected) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: { ...prev.academicADL, learningStyleChips: selected }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Learning Style Remarks</label>
                  <textarea
                    rows={3}
                    value={formData.academicADL.learningStyleRemarks}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        academicADL: { ...prev.academicADL, learningStyleRemarks: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Best instructional prompts and reinforcers..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 8: ORAL-MOTOR & ARTICULATION (Speech Form) ================= */}
        {activeTabId === 8 && (
          <div className="space-y-6">
            <SectionCard title="Oral–Motor Examination" icon={Volume2}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Oral Motor Parameter</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center w-48">Status</th>
                      <th className="p-3 font-extrabold text-slate-700">Clinical Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "Mouth Opening",
                      "Jaw Movement",
                      "Lip Movement",
                      "Cheek Strength",
                      "Tongue Movement",
                      "Tongue Control",
                      "Tongue Strength",
                      "Drooling / Saliva Control",
                      "Breath Support",
                      "Voice Quality"
                    ].map((item) => {
                      const current = formData.oralMotorArticulation.oralMotorTable[item] || { status: "", remarks: "" };
                      return (
                        <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item}</td>
                          <td className="p-3 text-center">
                            <RadioPills
                              options={["Normal", "Impaired"]}
                              value={current.status}
                              onChange={(val) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  oralMotorArticulation: {
                                    ...prev.oralMotorArticulation,
                                    oralMotorTable: {
                                      ...prev.oralMotorArticulation.oralMotorTable,
                                      [item]: { ...current, status: val as any }
                                    }
                                  }
                                }))
                              }
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.remarks}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  oralMotorArticulation: {
                                    ...prev.oralMotorArticulation,
                                    oralMotorTable: {
                                      ...prev.oralMotorArticulation.oralMotorTable,
                                      [item]: { ...current, remarks: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Notes on range, speed, symmetry"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Sound Inventory Screening" icon={Volume2}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Target Sound</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center w-48">Accuracy</th>
                      <th className="p-3 font-extrabold text-slate-700">Child&apos;s Actual Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "/p/ (pen)",
                      "/b/ (bat)",
                      "/t/ (toy)",
                      "/d/ (dog)",
                      "/k/ (cat)",
                      "/g/ (goat)",
                      "/s/ (sun)",
                      "/sh/ (shoe)",
                      "/ch/ (chair)",
                      "/l/ (lion)",
                      "/r/ (rabbit)",
                      "/f/ (fish)",
                      "/v/ (van)",
                      "/th/ (thumb)",
                      "/z/ (zebra)"
                    ].map((item) => {
                      const current = formData.oralMotorArticulation.soundInventory[item] || { status: "", childResponse: "" };
                      return (
                        <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item}</td>
                          <td className="p-3 text-center">
                            <RadioPills
                              options={["Correct", "Error"]}
                              value={current.status}
                              onChange={(val) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  oralMotorArticulation: {
                                    ...prev.oralMotorArticulation,
                                    soundInventory: {
                                      ...prev.oralMotorArticulation.soundInventory,
                                      [item]: { ...current, status: val as any }
                                    }
                                  }
                                }))
                              }
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.childResponse}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  oralMotorArticulation: {
                                    ...prev.oralMotorArticulation,
                                    soundInventory: {
                                      ...prev.oralMotorArticulation.soundInventory,
                                      [item]: { ...current, childResponse: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Transcribed pronunciation"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Position-Wise Word Test" icon={Volume2}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700">Sound</th>
                      <th className="p-3 font-extrabold text-slate-700">Initial</th>
                      <th className="p-3 font-extrabold text-slate-700">Medial</th>
                      <th className="p-3 font-extrabold text-slate-700">Final</th>
                      <th className="p-3 font-extrabold text-slate-700">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { sound: "/p/", initial: "Pen", medial: "Apple", final: "Cup" },
                      { sound: "/t/", initial: "Top", medial: "Water", final: "Cat" },
                      { sound: "/k/", initial: "Key", medial: "Monkey", final: "Book" },
                      { sound: "/s/", initial: "Sun", medial: "Basket", final: "Bus" },
                      { sound: "/r/", initial: "Red", medial: "Carrot", final: "Car" },
                      { sound: "/l/", initial: "Lion", medial: "Balloon", final: "Ball" },
                      { sound: "/sh/", initial: "Shoe", medial: "Washing", final: "Fish" },
                      { sound: "/ch/", initial: "Chair", medial: "Teacher", final: "Watch" },
                      { sound: "/th/", initial: "Thumb", medial: "Mother", final: "Bath" }
                    ].map((row) => {
                      const current = formData.oralMotorArticulation.positionWiseWordTest[row.sound] || { remarks: "" };
                      return (
                        <tr key={row.sound} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-black text-[#185FA5]">{row.sound}</td>
                          <td className="p-3 text-slate-600 font-medium">{row.initial}</td>
                          <td className="p-3 text-slate-600 font-medium">{row.medial}</td>
                          <td className="p-3 text-slate-600 font-medium">{row.final}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={current.remarks}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  oralMotorArticulation: {
                                    ...prev.oralMotorArticulation,
                                    positionWiseWordTest: {
                                      ...prev.oralMotorArticulation.positionWiseWordTest,
                                      [row.sound]: { remarks: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Position wise clarity notes"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 9: ISAA (Indian Scale for Assessment of Autism) ================= */}
        {activeTabId === 9 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">ISAA — Indian Scale for Assessment of Autism</h2>
                  <p className="text-blue-200 text-xs mt-1">
                    Rate each item on a 1–5 scale: 1 = Rarely (Upto 20%), 2 = Sometimes (21–40%), 3 = Frequently (41–60%), 4 = Mostly (61–80%), 5 = Always (81–100%).
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 block">Total ISAA Score</span>
                    <span className="text-3xl font-black text-amber-300">{isaaTotalScore}</span>
                    <span className="text-[10px] text-blue-200 font-bold block">out of 200</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold ${isaaInterpretation.variant}`}>
                    {isaaInterpretation.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Interpretation Legend Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800 block">70 – 106</span>
                <span className="text-[11px] font-black text-blue-900">Mild Autism</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-800 block">107 – 153</span>
                <span className="text-[11px] font-black text-amber-900">Moderate Autism</span>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-xs font-bold text-red-800 block">154 – 200</span>
                <span className="text-[11px] font-black text-red-900">Severe Autism</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 block">Below 70</span>
                <span className="text-[11px] font-black text-emerald-900">No Autism Indicated</span>
              </div>
            </div>

            {/* 40 Questions List */}
            <SectionCard title="ISAA 40-Item Rating Questionnaire" icon={Brain}>
              <div className="space-y-4">
                {ISAA_QUESTIONS.map((q, idx) => {
                  const showSectionHeader = idx === 0 || ISAA_QUESTIONS[idx - 1].section !== q.section;
                  const currentRating = formData.isaa.ratings[q.id] || null;

                  return (
                    <React.Fragment key={q.id}>
                      {showSectionHeader && (
                        <div className="pt-4 pb-2 border-b-2 border-[#185FA5] mt-6 first:mt-0">
                          <h3 className="text-sm font-black text-[#185FA5] uppercase tracking-wide">
                            {q.section}
                          </h3>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors gap-3">
                        <div className="flex items-start gap-3">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-[#185FA5] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {q.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800 leading-snug">{q.question}</span>
                        </div>

                        {/* 5-Point Rating Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {[
                            { score: 1, color: "bg-emerald-600 hover:bg-emerald-700" },
                            { score: 2, color: "bg-lime-600 hover:bg-lime-700" },
                            { score: 3, color: "bg-amber-500 hover:bg-amber-600" },
                            { score: 4, color: "bg-orange-500 hover:bg-orange-600" },
                            { score: 5, color: "bg-rose-600 hover:bg-rose-700" }
                          ].map((item) => {
                            const isSelected = currentRating === item.score;
                            return (
                              <button
                                key={item.score}
                                type="button"
                                onClick={() =>
                                  updateFormData((prev) => ({
                                    ...prev,
                                    isaa: {
                                      ...prev.isaa,
                                      ratings: { ...prev.isaa.ratings, [q.id]: item.score }
                                    }
                                  }))
                                }
                                className={`h-9 w-9 rounded-lg font-black text-xs transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? `${item.color} text-white ring-2 ring-slate-900 ring-offset-1 scale-110`
                                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                {item.score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                <div className="pt-4">
                  <label className="text-xs font-bold text-slate-700 block mb-1">ISAA Clinical Remarks</label>
                  <textarea
                    rows={3}
                    value={formData.isaa.clinicalRemarks}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        isaa: { ...prev.isaa, clinicalRemarks: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Qualitative observations on ISAA score interpretation..."
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 10: STRENGTHS, GOALS & RECOMMENDATIONS ================= */}
        {activeTabId === 10 && (
          <div className="space-y-6">
            <SectionCard title="Strengths of the Child (Top 5)" icon={Award}>
              <div className="space-y-3">
                {formData.goalsRecommendations.strengths.map((strText, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={strText}
                      onChange={(e) => {
                        const newStr = [...formData.goalsRecommendations.strengths];
                        newStr[idx] = e.target.value;
                        updateFormData((prev) => ({
                          ...prev,
                          goalsRecommendations: { ...prev.goalsRecommendations, strengths: newStr }
                        }));
                      }}
                      className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                      placeholder={`Strength ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Areas Requiring Support" icon={AlertCircle}>
              <div className="space-y-4">
                <ChipGroup
                  options={[
                    "Communication",
                    "Attention",
                    "Behaviour",
                    "Social skills",
                    "Play skills",
                    "Pre-academics",
                    "Academics",
                    "Fine motor",
                    "Gross motor",
                    "Sensory processing",
                    "ADL skills",
                    "Emotional regulation",
                    "School readiness",
                    "Parent guidance"
                  ]}
                  selected={formData.goalsRecommendations.supportChips}
                  onChange={(selected) =>
                    updateFormData((prev) => ({
                      ...prev,
                      goalsRecommendations: { ...prev.goalsRecommendations, supportChips: selected }
                    }))
                  }
                />
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Details on Support Needed</label>
                  <textarea
                    rows={2}
                    value={formData.goalsRecommendations.supportDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        goalsRecommendations: { ...prev.goalsRecommendations, supportDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="Specific clinical priorities..."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Present Level of Performance" icon={Activity}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  communication: "Communication Level",
                  academic: "Academic / Pre-Academic Level",
                  behaviour: "Behaviour Level",
                  social: "Social Skill Level",
                  adl: "ADL Level",
                  motor: "Motor Skill Level",
                  sensory: "Sensory Level"
                }).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
                    <input
                      type="text"
                      value={(formData.goalsRecommendations.presentLevels as any)[key] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateFormData((prev) => ({
                          ...prev,
                          goalsRecommendations: {
                            ...prev.goalsRecommendations,
                            presentLevels: { ...prev.goalsRecommendations.presentLevels, [key]: val }
                          }
                        }));
                      }}
                      className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                      placeholder={`Current ${label}`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Short-Term Goals (3 Months)" icon={Calendar}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700 w-36">Area</th>
                      <th className="p-3 font-extrabold text-slate-700">Target Goal</th>
                      <th className="p-3 font-extrabold text-slate-700">Strategy / Activity</th>
                      <th className="p-3 font-extrabold text-slate-700 w-28">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Communication", "Attention", "Behaviour", "Social Skills", "Pre-Academics", "ADL", "Fine Motor", "Gross Motor", "Sensory"].map((area) => {
                      const current = formData.goalsRecommendations.shortTermGoals[area] || { goal: "", strategy: "", review: "3 Months" };
                      return (
                        <tr key={area} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{area}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.goal}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    shortTermGoals: {
                                      ...prev.goalsRecommendations.shortTermGoals,
                                      [area]: { ...current, goal: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="3-month goal"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.strategy}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    shortTermGoals: {
                                      ...prev.goalsRecommendations.shortTermGoals,
                                      [area]: { ...current, strategy: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Strategy / activity"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.review}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    shortTermGoals: {
                                      ...prev.goalsRecommendations.shortTermGoals,
                                      [area]: { ...current, review: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Long-Term Goals (6–12 Months)" icon={Calendar}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-extrabold text-slate-700 w-36">Area</th>
                      <th className="p-3 font-extrabold text-slate-700">Target Goal</th>
                      <th className="p-3 font-extrabold text-slate-700">Expected Outcome</th>
                      <th className="p-3 font-extrabold text-slate-700 w-28">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Communication", "Behaviour", "Learning / Academics", "Social Skills", "ADL Independence", "Therapy Support", "School Readiness"].map((area) => {
                      const current = formData.goalsRecommendations.longTermGoals[area] || { goal: "", outcome: "", review: "1 Year" };
                      return (
                        <tr key={area} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{area}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.goal}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    longTermGoals: {
                                      ...prev.goalsRecommendations.longTermGoals,
                                      [area]: { ...current, goal: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="1-year goal"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.outcome}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    longTermGoals: {
                                      ...prev.goalsRecommendations.longTermGoals,
                                      [area]: { ...current, outcome: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                              placeholder="Expected outcome"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={current.review}
                              onChange={(e) =>
                                updateFormData((prev) => ({
                                  ...prev,
                                  goalsRecommendations: {
                                    ...prev.goalsRecommendations,
                                    longTermGoals: {
                                      ...prev.goalsRecommendations.longTermGoals,
                                      [area]: { ...current, review: e.target.value }
                                    }
                                  }
                                }))
                              }
                              className="w-full h-8 px-2 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-[#185FA5]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Recommended Intervention Plan" icon={Heart}>
              <div className="space-y-4">
                <ChipGroup
                  options={[
                    "Special education",
                    "Behaviour support",
                    "Speech and communication support",
                    "Physiotherapy",
                    "Occupational therapy",
                    "Sensory integration activities",
                    "Developmental therapy",
                    "ADL training",
                    "Social skill training",
                    "Parent counselling",
                    "Home programme",
                    "Group activity",
                    "School readiness programme"
                  ]}
                  selected={formData.goalsRecommendations.interventionChips}
                  onChange={(selected) =>
                    updateFormData((prev) => ({
                      ...prev,
                      goalsRecommendations: { ...prev.goalsRecommendations, interventionChips: selected }
                    }))
                  }
                />
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Recommended Frequency / Duration</label>
                  <textarea
                    rows={2}
                    value={formData.goalsRecommendations.interventionDetails}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        goalsRecommendations: { ...prev.goalsRecommendations, interventionDetails: e.target.value }
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                    placeholder="e.g. OT 3x per week (45 mins), Speech 2x per week"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Home Programme Suggestions" icon={Sparkles}>
              <div className="space-y-3">
                {formData.goalsRecommendations.homeProgramSuggestions.map((suggText, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={suggText}
                      onChange={(e) => {
                        const newSugg = [...formData.goalsRecommendations.homeProgramSuggestions];
                        newSugg[idx] = e.target.value;
                        updateFormData((prev) => ({
                          ...prev,
                          goalsRecommendations: { ...prev.goalsRecommendations, homeProgramSuggestions: newSugg }
                        }));
                      }}
                      className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                      placeholder={`Suggestion ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Review Plan Dates" icon={Calendar}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">First Review Date</label>
                  <input
                    type="date"
                    value={formData.goalsRecommendations.firstReviewDate}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        goalsRecommendations: { ...prev.goalsRecommendations, firstReviewDate: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Second Review Date</label>
                  <input
                    type="date"
                    value={formData.goalsRecommendations.secondReviewDate}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        goalsRecommendations: { ...prev.goalsRecommendations, secondReviewDate: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Third Review Date</label>
                  <input
                    type="date"
                    value={formData.goalsRecommendations.thirdReviewDate}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        goalsRecommendations: { ...prev.goalsRecommendations, thirdReviewDate: e.target.value }
                      }))
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                Note: Progress will be reviewed regularly and goals will be modified according to the child&apos;s improvement, readiness and individual needs.
              </p>
            </SectionCard>
          </div>
        )}

        {/* ================= TAB 11: OBSERVATIONS SUMMARY & SIGN-OFF ================= */}
        {activeTabId === 11 && (
          <div className="space-y-6">
            <SectionCard title="Overall Clinical Observations & Summary" icon={FileText}>
              <div className="space-y-4">
                {Object.entries({
                  attention: "Attention & Concentration",
                  receptiveLanguage: "Receptive Language",
                  expressiveLanguage: "Expressive Language",
                  articulation: "Articulation / Pronunciation",
                  oralMotor: "Oral-Motor Findings",
                  intelligibility: "Intelligibility Level",
                  behaviour: "Behaviour & Emotional Baseline",
                  socialSkills: "Social Skills & Play",
                  sensoryProcessing: "Sensory Processing Profile",
                  motorSkills: "Motor Skills (Fine & Gross)",
                  adl: "Activities of Daily Living (ADL)"
                }).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
                    <textarea
                      rows={2}
                      value={(formData.summarySignOff.observations as any)[key] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: {
                            ...prev.summarySignOff,
                            observations: { ...prev.summarySignOff.observations, [key]: val }
                          }
                        }));
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                      placeholder={`Summary of ${label}`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Clinical Recommendations" icon={ClipboardCheck}>
              <div className="space-y-4">
                <ChipGroup
                  options={["Speech Therapy", "Oral-Motor Exercises", "Home Practice Program", "School Collaboration", "Parent Guidance", "Re-evaluation"]}
                  selected={formData.summarySignOff.recommendationChips}
                  onChange={(selected) =>
                    updateFormData((prev) => ({
                      ...prev,
                      summarySignOff: { ...prev.summarySignOff, recommendationChips: selected }
                    }))
                  }
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Re-evaluation Period:</label>
                  <input
                    type="text"
                    value={formData.summarySignOff.reevaluationWeeks}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        summarySignOff: { ...prev.summarySignOff, reevaluationWeeks: e.target.value }
                      }))
                    }
                    className="w-24 h-9 px-2 border border-slate-300 rounded-lg text-xs font-bold text-center outline-none focus:border-[#185FA5]"
                  />
                  <span className="text-xs font-bold text-slate-600">weeks</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Final Remarks by Special Educator / Therapy Team" icon={FileText}>
              <textarea
                rows={4}
                value={formData.summarySignOff.finalRemarks}
                onChange={(e) =>
                  updateFormData((prev) => ({
                    ...prev,
                    summarySignOff: { ...prev.summarySignOff, finalRemarks: e.target.value }
                  }))
                }
                className="w-full p-3 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5]"
                placeholder="Final remarks, diagnostic summary and prognosis..."
              />
            </SectionCard>

            {/* TWO-COLUMN SIGN-OFF PANEL */}
            <SectionCard title="Official Sign-Off & Verification" icon={Award}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Assessor */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-[#185FA5] uppercase tracking-wider">Primary Assessor</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Assessor Name</label>
                    <input
                      type="text"
                      value={formData.summarySignOff.assessorName}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, assessorName: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Designation</label>
                    <input
                      type="text"
                      value={formData.summarySignOff.assessorDesignation}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, assessorDesignation: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature</label>
                    <div className="h-12 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center text-xs font-extrabold text-blue-900 italic">
                      [ Signed Electronically by {formData.summarySignOff.assessorName || "Assessor"} ]
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Date</label>
                    <input
                      type="date"
                      value={formData.summarySignOff.assessorSignatureDate}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, assessorSignatureDate: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                </div>

                {/* Right Column: Parent / Guardian */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Parent / Guardian Verification</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={formData.summarySignOff.parentName}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, parentName: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Relationship to Child</label>
                    <input
                      type="text"
                      value={formData.summarySignOff.parentRelationship}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, parentRelationship: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature</label>
                    <div className="h-12 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center text-xs font-extrabold text-slate-700 italic">
                      [ Verified by {formData.summarySignOff.parentName || "Parent"} ]
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Date</label>
                    <input
                      type="date"
                      value={formData.summarySignOff.parentSignatureDate}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          summarySignOff: { ...prev.summarySignOff, parentSignatureDate: e.target.value }
                        }))
                      }
                      className="w-full h-9 px-2.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#185FA5]"
                    />
                  </div>
                </div>

              </div>
            </SectionCard>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-4 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Submit Clinical Assessment Report</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* STICKY FOOTER NAVIGATION BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-extrabold text-[#185FA5] hidden sm:inline">Active Section:</span>
            <span className="text-xs font-bold text-slate-800 truncate">{activeTabMeta.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTabId > 1 && (
              <button
                type="button"
                onClick={handlePrevTab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleManualSave}
              className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Progress</span>
            </button>

            {activeTabId < 11 ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="px-4 py-2 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer"
              >
                <span>Next Section</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer"
              >
                <span>Review & Submit</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#185FA5]">
                <ClipboardCheck className="h-6 w-6" />
                <h3 className="text-lg font-black text-slate-800">Confirm Submission</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <p>Are you sure you want to submit the clinical assessment report for:</p>
              
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1 text-slate-800">
                <div><span className="font-extrabold text-blue-900">Child:</span> {formData.childDetails.childName}</div>
                <div><span className="font-extrabold text-blue-900">Assessment Date:</span> {formData.childDetails.assessmentDate}</div>
                <div><span className="font-extrabold text-blue-900">Assessed By:</span> {formData.childDetails.assessedBy}</div>
                <div><span className="font-extrabold text-blue-900">Overall Progress:</span> {completionPercentage}% Completed</div>
                {formData.isaa.ratings[1] && (
                  <div><span className="font-extrabold text-blue-900">ISAA Score:</span> {isaaTotalScore} ({isaaInterpretation.label})</div>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Submitting will save this report to the clinical dashboard and clear the local storage draft.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= REUSABLE HELPER UI COMPONENTS =================

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#185FA5] flex items-center justify-center">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function RadioPills({ options, value, onChange }: { options: string[]; value: string; onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border cursor-pointer ${
              isSelected
                ? "bg-[#185FA5] text-white border-[#185FA5] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: "Yes" | "No" | ""; onChange: (val: "Yes" | "No") => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange("Yes")}
        className={`px-3 py-1 rounded-full text-xs font-black transition-all border cursor-pointer ${
          value === "Yes"
            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("No")}
        className={`px-3 py-1 rounded-full text-xs font-black transition-all border cursor-pointer ${
          value === "No"
            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
        }`}
      >
        No
      </button>
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
  singleSelect = false
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  singleSelect?: boolean;
}) {
  const toggleChip = (opt: string) => {
    if (singleSelect) {
      onChange(selected.includes(opt) ? [] : [opt]);
    } else {
      if (selected.includes(opt)) {
        onChange(selected.filter((item) => item !== opt));
      } else {
        onChange([...selected, opt]);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleChip(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? "bg-[#185FA5] text-white border-[#185FA5] shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function RatingRow({
  label,
  rating,
  remarks,
  onRatingChange,
  onRemarksChange
}: {
  label: string;
  rating: number | null;
  remarks: string;
  onRatingChange: (score: number) => void;
  onRemarksChange: (remarks: string) => void;
}) {
  const RATING_CONFIG = [
    { score: 0, label: "0", color: "bg-rose-600 text-white hover:bg-rose-700" },
    { score: 1, label: "1", color: "bg-orange-500 text-white hover:bg-orange-600" },
    { score: 2, label: "2", color: "bg-amber-500 text-white hover:bg-amber-600" },
    { score: 3, label: "3", color: "bg-emerald-600 text-white hover:bg-emerald-700" }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors gap-3">
      <span className="text-xs font-bold text-slate-800 flex-1">{label}</span>

      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1">
          {RATING_CONFIG.map((item) => {
            const isSelected = rating === item.score;
            return (
              <button
                key={item.score}
                type="button"
                onClick={() => onRatingChange(item.score)}
                className={`h-8 w-8 rounded-lg font-black text-xs transition-all shadow-xs cursor-pointer ${
                  isSelected
                    ? `${item.color} ring-2 ring-slate-900 ring-offset-1 scale-105`
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          className="h-8 px-2.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-[#185FA5] w-full sm:w-48"
          placeholder="Remarks"
        />
      </div>
    </div>
  );
}
