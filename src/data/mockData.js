export const mockUsers = [
  { 
    id: 1, 
    username: "admin", 
    password: "admin123", 
    role: "admin",
    name: "Dr. Radha Balachandar",
    designation: "Director"
  },
  { 
    id: 2, 
    username: "priya", 
    password: "staff123", 
    role: "staff",
    name: "Priya S",
    designation: "Senior Therapist"
  },
  { 
    id: 3, 
    username: "meena", 
    password: "staff456", 
    role: "staff",
    name: "Meena R",
    designation: "Therapist"
  }
];

export const mockParentUsers = [
  {
    id: 1, 
    phone: "9841000001",
    password: "parent123", 
    role: "parent",
    name: "Sirajudeen",
    childId: "KCR-2024-002"
  }
];

export const mockChildren = [
  {
    id: "KCR-2023-001",
    name: "Lakshmanan A.R",
    dob: "2019-09-15",
    age: "6y 10m",
    gender: "Male",
    diagnosis: "ASD",
    profile: "A",
    school: "Mrs. Ellen Sharma Memorial Nursery School",
    class: "LKG",
    registeredDate: "2021-09-10",
    primaryConcern: "Speech delay, limited eye contact, sensory processing issues, sitting tolerance problems",
    referredBy: "Self",
    previousTherapy: true,
    previousTherapyDetails: "Speech therapy for 6 months before joining",
    parent: {
      name: "L. Arunachalam",
      relationship: "Father",
      phone: "9884000002",
      email: "arunachalam@email.com",
      address: "Mylapore, Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Limited participation in class activities",
    reportsCount: 2,
    lastReportDate: "2023-08-10"
  },
  {
    id: "KCR-2024-002",
    name: "Arsh Mohammed",
    dob: "2021-01-15",
    age: "5y 6m",
    gender: "Male",
    diagnosis: "ASD",
    profile: "B",
    school: "St. Christopher's Academy",
    class: "UKG",
    registeredDate: "2022-07-27",
    primaryConcern: "Poor eye contact, reduced social communication, tongue-tie affecting speech clarity",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Sirajudeen",
      relationship: "Father",
      phone: "9841000001",
      email: "siraj@email.com",
      address: "Royapettah, Chennai",
      portalActive: true,
      portalPassword: "parent123"
    },
    languages: "Tamil, English",
    schoolFeedback: "Friendly with peers, needs support in group activities",
    reportsCount: 1,
    lastReportDate: "2025-11-18"
  },
  {
    id: "KCR-2022-003",
    name: "Arshan I.M",
    dob: "2017-07-27",
    age: "9y",
    gender: "Male",
    diagnosis: "Developmental Delay",
    profile: "D",
    school: "St. Christopher's Academy",
    class: "Class 3",
    registeredDate: "2022-07-27",
    primaryConcern: "Toe walking, flaccid muscle tone, scissoring gait, fine motor and writing difficulties",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Irshad",
      relationship: "Father",
      phone: "9790000003",
      email: "irshad@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Difficulty with writing tasks and physical activities",
    reportsCount: 1,
    lastReportDate: "2022-08-08"
  },
  {
    id: "KCR-2025-004",
    name: "Krishnan K.K",
    dob: "2019-04-10",
    age: "5y 9m",
    gender: "Male",
    diagnosis: "ASD + ADHD",
    profile: "C",
    school: "Not yet confirmed",
    class: "",
    registeredDate: "2025-01-29",
    primaryConcern: "Social skills delay, hyperactivity, brain development support",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Krishnan Kumar K.T",
      relationship: "Father",
      phone: "9962000004",
      email: "krishnankumar@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil",
    schoolFeedback: "Not yet in school",
    reportsCount: 0,
    lastReportDate: null
  },
  {
    id: "KCR-2024-005",
    name: "Sashanth",
    dob: "2017-02-14",
    age: "7y",
    gender: "Male",
    diagnosis: "ASD",
    profile: "A",
    school: "Mainstream school",
    class: "Class 1",
    registeredDate: "2024-02-01",
    primaryConcern: "Social communication delay, stimming behaviours, sensory processing difficulties",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Ananda Kumar",
      relationship: "Father",
      phone: "9500000005",
      email: "anandakumar@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Needs support in social communication",
    reportsCount: 1,
    lastReportDate: "2024-09-18"
  },
  {
    id: "KCR-2025-006",
    name: "Yeshmith S.J",
    dob: "2019-10-05",
    age: "6y",
    gender: "Male",
    diagnosis: "ASD",
    profile: "B",
    school: "Mainstream school",
    class: "LKG",
    registeredDate: "2025-01-15",
    primaryConcern: "Social communication delay, behaviour difficulties, above-average intelligence",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Jai Ganesh",
      relationship: "Father",
      phone: "9841000006",
      email: "jaiganesg@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Bright child, gets bored and disturbs others",
    reportsCount: 1,
    lastReportDate: "2025-10-07"
  },
  {
    id: "KCR-2025-007",
    name: "Yeshvi",
    dob: "2019-12-01",
    age: "6y",
    gender: "Female",
    diagnosis: "ADHD",
    profile: "C",
    school: "Mainstream school",
    class: "LKG",
    registeredDate: "2025-11-10",
    primaryConcern: "Hyperactivity, impulsive behaviour, writing refusal, poor ADL, coordination difficulties",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "Guardian",
      relationship: "Grandmother",
      phone: "9884000007",
      email: "guardian@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Not writing, shouting, lying on floor during PT",
    reportsCount: 1,
    lastReportDate: "2025-12-10"
  },
  {
    id: "KCR-2024-008",
    name: "Avantika K.N",
    dob: "2014-08-20",
    age: "10y",
    gender: "Female",
    diagnosis: "Learning Disability",
    profile: "E",
    school: "Mainstream school",
    class: "Class 5",
    registeredDate: "2024-08-01",
    primaryConcern: "Restricted attention, spelling errors, slow writing, failed 3 subjects",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "A. Kuppuswamy",
      relationship: "Father",
      phone: "9962000008",
      email: "kuppuswamy@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil, English",
    schoolFeedback: "Reading adequate, writing slow, attention poor",
    reportsCount: 1,
    lastReportDate: "2024-09-19"
  },
  {
    id: "KCR-2022-009",
    name: "Senthilnathan R",
    dob: "2018-03-12",
    age: "4y 6m at assessment",
    gender: "Male",
    diagnosis: "Selective Mutism",
    profile: "B",
    school: "Maharishi Vidya Mandhir",
    class: "LKG",
    registeredDate: "2022-07-30",
    primaryConcern: "Cannot speak in school and public places, social anxiety, behaviour issues",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parent: {
      name: "D. Raghunathan",
      relationship: "Father",
      phone: "9500000009",
      email: "raghunathan@email.com",
      address: "Chennai",
      portalActive: false,
      portalPassword: ""
    },
    languages: "Tamil",
    schoolFeedback: "Does not speak at school at all",
    reportsCount: 1,
    lastReportDate: "2022-10-21"
  }
];

export const mockStaff = [
  {
    id: 1,
    name: "Priya S",
    designation: "Senior Therapist",
    username: "priya",
    password: "staff123",
    isActive: true,
    childrenHandled: 18,
    sessionsThisMonth: 24,
    joinedDate: "2020-06-01"
  },
  {
    id: 2,
    name: "Meena R",
    designation: "Therapist",
    username: "meena",
    password: "staff456",
    isActive: true,
    childrenHandled: 14,
    sessionsThisMonth: 19,
    joinedDate: "2021-03-15"
  }
];

export const mockExercises = [
  {
    id: "EX001",
    name: "Brain Gym Exercises",
    category: "Cognitive",
    categoryColor: "#185FA5",
    description: "Simple body movements designed to support coordination, attention, and learning readiness.",
    homeDescription: "Simple movements to help your child's brain and body work together. Great to do first thing in the morning.",
    benefits: [
      "Improves concentration and attention",
      "Enhances coordination and balance",
      "Promotes relaxation and readiness for learning"
    ],
    instructions: [
      "Start with cross crawl — touch right elbow to left knee",
      "Do lazy 8s — draw figure 8 in the air with your hand",
      "Hook-ups — cross ankles and wrists, breathe deeply for 1 minute"
    ],
    duration: "10 minutes",
    frequency: "Daily",
    forProfiles: ["A", "B", "C", "D", "E"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX002",
    name: "Sensory Integration Activities",
    category: "Sensory",
    categoryColor: "#3C3489",
    description: "Controlled sensory input through movement, touch, balance, and proprioception.",
    homeDescription: "Allow your child to explore different textures — sand, clay, water — for 20 minutes. Let them explore freely.",
    benefits: [
      "Improves sensory processing",
      "Enhances attention and concentration",
      "Promotes emotional regulation"
    ],
    instructions: [
      "Set up a sensory bin with rice, sand, or water beads",
      "Let child explore with hands freely",
      "Introduce different textures gradually each week"
    ],
    duration: "20 minutes",
    frequency: "Daily",
    forProfiles: ["A", "B", "C", "D", "E"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX003",
    name: "Communication Cards",
    category: "Communication",
    categoryColor: "#0F6E56",
    description: "Picture-based cards to help children express needs, wants, feelings and choices.",
    homeDescription: "Show picture cards and encourage your child to name or point to each one during daily activities.",
    benefits: [
      "Builds vocabulary",
      "Encourages pointing and requesting",
      "Reduces frustration from communication difficulty"
    ],
    instructions: [
      "Hold up a picture card and name it",
      "Wait for child to point or say the word",
      "Celebrate every attempt, correct or not"
    ],
    duration: "15 minutes",
    frequency: "Daily",
    forProfiles: ["A", "B", "C"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX004",
    name: "Speech Therapy Exercises",
    category: "Communication",
    categoryColor: "#0F6E56",
    description: "Structured activities to improve speech production, language development and oral motor control.",
    homeDescription: "Practise simple sound games and naming activities with your child during playtime.",
    benefits: [
      "Improves speech clarity",
      "Enhances communication skills",
      "Develops language and vocabulary"
    ],
    instructions: [
      "Practise animal sounds together",
      "Name objects around the house",
      "Read picture books and ask what/who/where questions"
    ],
    duration: "20 minutes",
    frequency: "5 days per week",
    forProfiles: ["A", "B"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX005",
    name: "Social Skills Training",
    category: "Social",
    categoryColor: "#854F0B",
    description: "Structured activities to improve interaction, turn-taking, and peer communication.",
    homeDescription: "Practise taking turns during simple games and encourage greeting family members daily.",
    benefits: [
      "Improves peer interaction",
      "Develops turn-taking skills",
      "Builds confidence in social settings"
    ],
    instructions: [
      "Play simple board games to practise turn-taking",
      "Practise greetings with different family members",
      "Role-play social situations like sharing toys"
    ],
    duration: "20 minutes",
    frequency: "Daily",
    forProfiles: ["A", "B", "C"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX006",
    name: "Swing Therapy",
    category: "Sensory",
    categoryColor: "#3C3489",
    description: "Vestibular stimulation using a pediatric swing to improve balance, body awareness and sensory regulation.",
    homeDescription: "Gentle swinging at the park for 15 minutes helps regulate your child's sensory system.",
    benefits: [
      "Improves balance and postural control",
      "Enhances body awareness",
      "Helps regulate sensory processing"
    ],
    instructions: [
      "Start with slow gentle swinging",
      "Gradually increase range if child is comfortable",
      "Watch for signs of overstimulation"
    ],
    duration: "15 minutes",
    frequency: "3 times per week",
    forProfiles: ["A", "C"],
    isHomeExercise: false,
    isClinicExercise: true
  },
  {
    id: "EX007",
    name: "Jumping Jacks",
    category: "Gross Motor",
    categoryColor: "#993C1D",
    description: "Child stands with feet together, jumps while spreading legs and raising arms overhead.",
    homeDescription: "Fun jumping exercise to build strength and coordination. Do together as a family activity.",
    benefits: [
      "Improves cardiovascular endurance",
      "Enhances bilateral coordination",
      "Increases lower limb strength"
    ],
    instructions: [
      "Start with feet together, arms at sides",
      "Jump and spread legs while raising arms overhead",
      "Return to start and repeat"
    ],
    duration: "5 minutes",
    frequency: "Daily",
    forProfiles: ["D", "C"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX008",
    name: "Pegboard Activity",
    category: "Fine Motor",
    categoryColor: "#854F0B",
    description: "Child places pegs into corresponding holes to develop finger strength and coordination.",
    homeDescription: "Simple peg activity to strengthen your child's fingers and improve hand-eye coordination.",
    benefits: [
      "Improves fine motor skills",
      "Enhances finger strength",
      "Develops hand-eye coordination"
    ],
    instructions: [
      "Set out pegboard and pegs",
      "Show child how to place one peg",
      "Encourage independent placement",
      "Progress to patterns and colours"
    ],
    duration: "10 minutes",
    frequency: "Daily",
    forProfiles: ["D", "E", "C"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX009",
    name: "Memory Game",
    category: "Cognitive",
    categoryColor: "#185FA5",
    description: "Card matching activity to improve short-term memory, attention and concentration.",
    homeDescription: "Simple card matching game to play with your child to build memory and focus.",
    benefits: [
      "Improves short-term memory",
      "Enhances concentration",
      "Develops problem-solving skills"
    ],
    instructions: [
      "Start with 4 pairs of cards face down",
      "Take turns flipping two cards",
      "Match pairs and collect them",
      "Increase pairs as child improves"
    ],
    duration: "15 minutes",
    frequency: "Daily",
    forProfiles: ["E", "B"],
    isHomeExercise: true,
    isClinicExercise: true
  },
  {
    id: "EX010",
    name: "Behaviour Cards",
    category: "Behaviour",
    categoryColor: "#993C1D",
    description: "Visual aids that teach appropriate behaviours, social rules and expected responses.",
    homeDescription: "Picture cards showing good behaviour to review with your child each morning.",
    benefits: [
      "Improves understanding of appropriate behaviour",
      "Enhances social and emotional skills",
      "Reduces challenging behaviours"
    ],
    instructions: [
      "Show one behaviour card at a time",
      "Discuss what is shown on the card",
      "Practise the behaviour together",
      "Praise when child shows the correct behaviour"
    ],
    duration: "10 minutes",
    frequency: "Daily",
    forProfiles: ["A", "B", "C"],
    isHomeExercise: true,
    isClinicExercise: true
  }
];

export const mockDefaultReport = {
  aboutYourChild: "We are happy to share that Arsh has made wonderful progress over the past year. When he first came to us, he had difficulty with eye contact and communication. Today, he communicates using full sentences, makes friends easily, and responds well in conversation.",
  strengths: [
    "Improved eye contact during one-on-one interactions",
    "Responds consistently to name call",
    "Beginning to use two-word phrases to express needs",
    "Warm and friendly with therapists and other children"
  ],
  supportAreas: [
    "Expanding vocabulary and sentence length",
    "Social communication in group classroom settings",
    "Reducing stimming behaviours during quiet table tasks",
    "Strengthening narrative skills and event retelling"
  ],
  plan: {
    type: "Speech + Social Skills + OT",
    frequency: "2 Sessions / week",
    duration: "6 Months",
    nextReview: "October 2026"
  },
  homeAdvice: "Practise naming objects during daily activities (e.g. while bathing, eating, or dressing). Use picture communication cards during meals and playtime to encourage clear requests.",
  homeSuggestions: [
    "Practise naming objects during daily activities",
    "Use picture cards during meals and play time",
    "Encourage 2-word requests before giving items"
  ],
  encouragement: "With your support at home and our guidance at the clinic, Arsh will continue to grow beautifully.",
  therapistName: "Priya S",
  doctorName: "Dr. R. Radha Balachandar"
};

export const mockAssessmentResult = {
  childId: "KCR-2024-002",
  childName: "Arsh Mohammed",
  assessmentDate: "2026-07-28",
  assessedBy: "Priya S",
  isaa: {
    totalScore: 94,
    severity: "Mild Autism",
    severityLevel: 1,
    sectionScores: { 
      I: 28, II: 18, III: 22, 
      IV: 14, V: 8, VI: 4 
    }
  },
  domainScores: {
    communication: 42,
    socialSkills: 38,
    behaviour: 55,
    attention: 60,
    fineMotor: 72,
    grossMotor: 80,
    adl: 65,
    sensory: 35
  },
  profile: "B",
  profileName: "ASD High Functioning",
  clinicExercises: [
    "Brain Gym Exercises",
    "Social Skills Training",
    "Narrative Activities",
    "Sensory Integration",
    "Communication Cards",
    "Speech Therapy Exercises"
  ],
  homeExercises: [
    "Brain Gym Exercises",
    "Communication Cards",
    "Sensory Integration Activities"
  ]
};
