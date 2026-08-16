// Pure JavaScript Scoring Engine for Kids Care Rehab Centre

/**
 * 1. Calculate ISAA Score and Severity
 * @param {Object} isaaRatings - Map of item1..item40 to rating values (1 to 5)
 */
export function calculateISAAScore(isaaRatings = {}) {
  let totalScore = 0;
  let ratedCount = 0;

  const sectionScores = {
    I: 0, // Social Relationship (1-9, max 45)
    II: 0, // Emotional Responsiveness (10-14, max 25)
    III: 0, // Speech-Language (15-20, max 30)
    IV: 0, // Behaviour Pattern (21-28, max 40)
    V: 0, // Cognitive Component (29-34, max 30)
    VI: 0 // Sensory Aspects (35-40, max 30)
  };

  for (let i = 1; i <= 40; i++) {
    const val = Number(isaaRatings[`item${i}`]) || 0;
    if (val > 0) {
      totalScore += val;
      ratedCount++;

      if (i >= 1 && i <= 9) sectionScores.I += val;
      else if (i >= 10 && i <= 14) sectionScores.II += val;
      else if (i >= 15 && i <= 20) sectionScores.III += val;
      else if (i >= 21 && i <= 28) sectionScores.IV += val;
      else if (i >= 29 && i <= 34) sectionScores.V += val;
      else if (i >= 35 && i <= 40) sectionScores.VI += val;
    }
  }

  let severity = "Does not indicate autism";
  let severityLevel = 0;
  let clinicalBadge = "Routed to developmental pathway";

  if (totalScore === 0 && ratedCount === 0) {
    severity = "Not Assessed";
    severityLevel = 0;
    clinicalBadge = "Assessment pending";
  } else if (totalScore >= 154) {
    severity = "Severe Autism";
    severityLevel = 3;
    clinicalBadge = "Needs very substantial support";
  } else if (totalScore >= 107) {
    severity = "Moderate Autism";
    severityLevel = 2;
    clinicalBadge = "Needs substantial support";
  } else if (totalScore >= 70) {
    severity = "Mild Autism";
    severityLevel = 1;
    clinicalBadge = "Needs support";
  }

  return {
    totalScore,
    ratedCount,
    severity,
    severityLevel,
    clinicalBadge,
    sectionScores
  };
}

/**
 * Helper to sum ratings from a map of keys
 */
function sumRatings(mapObj = {}, keys = [], maxPerItem = 3) {
  let sum = 0;
  let count = 0;
  keys.forEach((key) => {
    if (mapObj[key] !== undefined && mapObj[key] !== null) {
      sum += Number(mapObj[key]);
      count++;
    }
  });
  if (count === 0) return 50; // default baseline
  return Math.round((sum / (count * maxPerItem)) * 100);
}

/**
 * 2. Calculate Domain Scores (0-100)
 */
export function calculateDomainScores(formData = {}) {
  const commMap = formData.s5_communication || formData.tab4_communication || {};
  const socialMap = formData.s8_social || formData.tab4_social || formData.tab6_social || {};
  const taskMap = formData.s6_attention || formData.tab5_task || formData.tab5_attention || {};
  const emotionMap = formData.s14_emotional || formData.tab5_emotional || formData.tab8_emotional || {};
  const fineMap = formData.s10_fineMotor || formData.tab6_fine || formData.tab7_fineMotor || {};
  const grossMap = formData.s11_grossMotor || formData.tab6_gross || formData.tab7_grossMotor || {};
  const adlMap = formData.s13_adl || formData.tab7_adl || formData.tab8_adl || {};
  const sensoryConcerns = formData.sensoryConcerns || formData.tab8_sensoryConcerns || formData.tab7_sensoryConcerns || [];

  const commKeys = [
    "respondsName", "eyeContact", "simpleInstructions", "simpleInstruct", "oneStep", "twoStep",
    "gestures", "requestsNeeds", "usesWords", "usesPhrases", "namesObjects",
    "answersQuestions", "communicatesPain"
  ];
  const communication = sumRatings(commMap, commKeys, 3);

  const socialKeys = [
    "respondsAdults", "respondsPeers", "greetsOthers", "sharesToys",
    "takesTurns", "imitatesActions", "imitates", "functionalPlay", "pretendPlay", "groupActivity", "classroomRules"
  ];
  const socialSkills = sumRatings(socialMap, socialKeys, 3);

  const taskKeys = [
    "sitsForActivity", "attendsTeacher", "completesSimpleTask", "completesTask", "waitsTurn",
    "respondsRedirection", "redirection", "transitionsActivities", "transitions", "worksPrompts", "worksIndependently", "worksIndep"
  ];
  const attention = sumRatings(taskMap, taskKeys, 3);

  const emotionKeys = [
    "expressesCalmly", "expressesNeeds", "waitsWithoutDistress", "waitsDistress", "acceptsNo", "handlesCorrection",
    "calmsAfterUpset", "calmsUpset", "acceptsChangeRoutine", "acceptsChange", "ageAppropriateResponse", "emotionalResponse"
  ];
  const emotionScore = sumRatings(emotionMap, emotionKeys, 3);
  const behaviour = Math.round((attention * 0.5) + (emotionScore * 0.5));

  const fineKeys = [
    "reachesGrasps", "transfersHand", "stacksBlocks", "pegboard", "beading",
    "tearsPaper", "pastesPaper", "usesCrayons", "pencilGrip", "scribbling",
    "tracing", "usesScissors", "scissors", "buttoning"
  ];
  const fineMotor = sumRatings(fineMap, fineKeys, 3);

  const grossKeys = [
    "sittingBalance", "standingBalance", "walking", "running", "jumping",
    "climbingStairs", "stairs", "kickingBall", "throwingBall", "catchingBall", "bodyCoordination", "bodyCoord", "postureControl", "muscleTone"
  ];
  const grossMotor = sumRatings(grossMap, grossKeys, 3);

  const adlKeys = [
    "eatingIndependently", "eating", "drinkingCup", "drinking", "handWashing", "brushing", "dressing", "undressing",
    "toileting", "indicatesToilet", "wearsFootwear", "footwear", "arrangesBag", "schoolBag", "cleansUp", "followsRoutine", "dailyRoutine"
  ];
  const adl = sumRatings(adlMap, adlKeys, 3);

  // Sensory score based on sensory concerns list count
  let sensory = 80 - (sensoryConcerns.length * 10);
  if (sensory < 20) sensory = 20;

  return {
    communication,
    socialSkills,
    behaviour,
    attention,
    fineMotor,
    grossMotor,
    adl,
    sensory
  };
}

/**
 * 3. Classify Clinical Profile
 */
export function classifyProfile(domainScores = {}, isaaLevel = 0) {
  let profile = "B";

  if (isaaLevel === 0) {
    if (domainScores.attention < 50) {
      profile = "E";
    } else if (domainScores.grossMotor < 50) {
      profile = "D";
    } else {
      profile = "E";
    }
  } else if (isaaLevel === 1) {
    if (domainScores.communication > 60 && domainScores.socialSkills > 50) {
      profile = "B";
    } else {
      profile = "A";
    }
  } else if (isaaLevel === 2 || isaaLevel === 3) {
    if (domainScores.attention < 40 || domainScores.behaviour < 40) {
      profile = "C";
    } else {
      profile = "A";
    }
  }

  const profileMap = {
    A: {
      profileName: "ASD — Communication Focus",
      profileDescription: "Speech, social, and sensory therapy needed. High emphasis on receptive/expressive language and structural routines."
    },
    B: {
      profileName: "ASD High Functioning",
      profileDescription: "Narrative, CBT, and social skills focus. Strong foundation with support needed for group interaction and peer communication."
    },
    C: {
      profileName: "ASD + ADHD Combined",
      profileDescription: "Behaviour, sensory regulation, and attention focus. Integrated sensory diet and impulse management required."
    },
    D: {
      profileName: "Motor or Developmental Delay",
      profileDescription: "Physiotherapy and functional physical training required to build postural control, gait, and coordination."
    },
    E: {
      profileName: "Learning Disability Pathway",
      profileDescription: "Remedial education, working memory support, and attention enhancement exercises required."
    }
  };

  const info = profileMap[profile] || profileMap.B;

  return {
    profile,
    profileName: info.profileName,
    profileDescription: info.profileDescription
  };
}

/**
 * 4. Select Exercises based on Profile & Domain Scores
 */
export function selectExercises(profile = "B", domainScores = {}) {
  const clinicExercises = ["Brain Gym Exercises", "Sensory Integration Activities"];
  const homeExercises = ["Brain Gym Exercises"];

  if (profile === "A") {
    clinicExercises.push("Speech Therapy Exercises", "Communication Cards", "Behaviour Cards", "Swing Therapy", "ABA Activities");
    homeExercises.push("Communication Cards", "Everyday Routine Book");
  } else if (profile === "B") {
    clinicExercises.push("Social Skills Training", "Narrative Activities", "CBT Activities", "Role Play");
    homeExercises.push("Social Stories", "Game Expression Puzzle");
  } else if (profile === "C") {
    clinicExercises.push("Swing Therapy", "Vibrator Therapy", "Fine Motor Activities", "ABA Activities", "Behaviour Modification");
    homeExercises.push("Sensory Fidget Toy", "Weighted Blanket", "My Calm Corner");
  } else if (profile === "D") {
    clinicExercises.push("Physiotherapy Exercises", "Balance Training", "Treadmill", "Wedge Exercises", "Standing Frame");
    homeExercises.push("Stretching Exercises", "Hole Rings", "Cones");
  } else if (profile === "E") {
    clinicExercises.push("Memory Activities", "Attention Training", "Remedial Tasks", "Brain Gym Activity Book");
    homeExercises.push("Memory Game", "Spelling Flashcards", "Magnet Maze");
  }

  // Domain score checks
  if (domainScores.fineMotor < 50) {
    if (!clinicExercises.includes("Pegboard Activity")) clinicExercises.push("Pegboard Activity", "Bead Stringing", "Buttoning and Zipping");
    if (!homeExercises.includes("Butterfly Lacing Toy")) homeExercises.push("Butterfly Lacing Toy", "Beads Maze");
  }

  if (domainScores.grossMotor < 50) {
    if (!clinicExercises.includes("Jumping Jacks")) clinicExercises.push("Jumping Jacks", "Bear Walk", "Frog Jumps", "Obstacle Course");
  }

  if (domainScores.adl < 50) {
    if (!clinicExercises.includes("ADL Training")) clinicExercises.push("ADL Training");
    if (!homeExercises.includes("Dressing Frame")) homeExercises.push("Dressing Frame", "Everyday Routine Book");
  }

  if (domainScores.communication < 40) {
    if (!clinicExercises.includes("Communication Cards")) clinicExercises.push("Communication Cards");
    if (!homeExercises.includes("Communication Flash Cards")) homeExercises.push("Communication Flash Cards");
  }

  return {
    clinicExercises: Array.from(new Set(clinicExercises)),
    homeExercises: Array.from(new Set(homeExercises))
  };
}
