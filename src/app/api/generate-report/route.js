import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert pediatric occupational therapist, clinical psychologist, and special educator at Kids Care Rehab Centre, Chennai.
Your task is to generate report content for pediatric rehabilitation across 4 clinical pathways:
1. Autism Spectrum Disorder (ISAA clinical scale)
2. ADHD Presentation (Conners' rating scale)
3. Developmental Delay (Developmental milestone checklist)
4. Specific Learning Disability (LDST screening battery)

Always return clinical, practical, accurate text.
If asked for a full report, return ONLY a valid JSON object with keys: "therapistReport" and "parentReport".
If asked for a single section rewrite, return ONLY the plain text paragraph/sentence requested without quotes or markdown wrappers.
If asked for an IEP report, return ONLY a valid JSON object matching the IEP report structure provided.
IMPORTANT: IEP reports must NOT contain individual exercises, therapy exercises, or exercise prescriptions. Focus only on high-level goals, progress, and 3-month plans.`;

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (_) {
    body = {};
  }

  const {
    mode,
    sectionKey,
    customPrompt,
    childData,
    category,
    assessmentData,
    isaaResults,
    domainScores,
    connersResults,
    delayResults,
    ldstResults,
    previousAssessment,
    cycleNumber
  } = body;

  const rawCat = (category || childData?.therapy_category || childData?.profile || childData?.diagnosis || "").toLowerCase();
  let resolvedCategory = "asd";
  if (rawCat.includes("adhd") || rawCat.includes("conner")) resolvedCategory = "adhd";
  else if (rawCat.includes("delay") || rawCat.includes("developmental")) resolvedCategory = "developmental_delay";
  else if (rawCat.includes("learn") || rawCat.includes("ldst") || rawCat.includes("sld") || rawCat.includes("dyslex")) resolvedCategory = "learning_disability";
  else if (rawCat.includes("iep") || rawCat.includes("special")) resolvedCategory = "iep";

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let userPrompt = "";

    if (mode === "iepReport") {
      const isFirstCycle = !previousAssessment || cycleNumber === 1;
      const prevDomains = previousAssessment?.domain_scores || {};
      const currDomains = domainScores || {};

      const domainComparison = isFirstCycle ? "N/A — first assessment" : Object.keys(currDomains).map(k => {
        const prev = prevDomains[k] ?? 0;
        const curr = currDomains[k] ?? 0;
        const diff = curr - prev;
        const trend = diff > 5 ? "Improved" : diff < -5 ? "Declined" : "Unchanged";
        return `${k}: ${prev}% → ${curr}% (${trend})`;
      }).join("\n");

      userPrompt = `Generate an IEP (Individualized Education Program) 3-month progress report for a child at Kids Care Rehab Centre, Chennai.

IMPORTANT RULES:
- Do NOT include any exercises, therapy exercises, or exercise prescriptions
- Focus ONLY on high-level goals, progress observations, and 3-month improvement plan
- Base all conclusions strictly on the assessment data provided — do not fabricate progress

Student Information:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "5y"}
Diagnosis: ${childData?.diagnosis || "IEP Special School"}
Assessment Date: ${childData?.assessmentDate || new Date().toISOString().split("T")[0]}
IEP Cycle: ${cycleNumber || 1} (${isFirstCycle ? "First Assessment — Establishing Baseline" : "Follow-up Assessment"})

Current Assessment:
Domain Scores (0-100%): ${JSON.stringify(currDomains, null, 2)}

${isFirstCycle ? "" : `Previous Assessment Domain Scores:
${JSON.stringify(prevDomains, null, 2)}

Domain Progress Comparison:
${domainComparison}`}

Clinical Observations:
${childData?.clinicalObservations || "Assessed using standard IEP 14-domain special school protocol"}

Return ONLY this exact JSON structure (no extra text):
{
  "assessmentSummary": {
    "overallSummary": "2-3 sentence clinical summary of current status based on domain scores",
    "domainHighlights": "Specific observations about strongest and weakest domains based on scores",
    "clinicalObservations": "Any notable clinical observations from the assessment data"
  },
  "progressComparison": {
    "isFirstCycle": ${isFirstCycle},
    "baseline": "${isFirstCycle ? "Narrative establishing this as the baseline assessment" : ""}",
    "improved": ${isFirstCycle ? "[]" : '["list of domains/areas showing improvement"]'},
    "unchanged": ${isFirstCycle ? "[]" : '["list of domains/areas with no significant change"]'},
    "needsImprovement": ["list of specific areas requiring focused work"],
    "narrative": "2-3 sentence narrative describing overall progress"
  },
  "areasForImprovement": ["3-4 specific high-level areas for improvement, NO exercises"],
  "threeMonthPlan": {
    "goals": ["3-5 measurable, specific goals for the next 3 months"],
    "approach": "High-level description of the therapeutic approach and focus areas",
    "expectedOutcomes": "What improvement is expected by the next review"
  },
  "recommendedOutcomes": "Overall expected outcome statement for the 3-month period"
}`;
    } else if (mode === "singleSection") {
      userPrompt = customPrompt || `Rewrite the ${sectionKey} section for ${childData?.name || "the child"} evaluated for ${resolvedCategory}.`;
    } else {
      // Full Report Generation — tailored by clinical pathway
      if (resolvedCategory === "adhd") {
        userPrompt = `Generate a clinical ADHD evaluation report for Kids Care Rehab Centre, Chennai.
Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "6y"}
Diagnosis: ${childData?.diagnosis || "ADHD Presentation"}
Primary Concern: ${childData?.primaryConcern || "Attention, impulsivity, and high activity levels"}

Assessment Data: Conners' Rating Scale
Presentation: ${assessmentData?.adhd_presentation || connersResults?.presentation || "Combined Presentation"}
Overall Score: ${assessmentData?.adhd_score ?? connersResults?.totalScore ?? "Elevated"}
Subtest Scores: ${JSON.stringify(assessmentData?.subtest_scores || connersResults || { inattention: "Elevated", hyperactivity: "Elevated" }, null, 2)}

Please generate both therapist and parent reports in valid JSON format with keys "therapistReport" (background, assessmentFindings, currentStatus, recommendations, reviewPlan) and "parentReport" (aboutYourChild, whatWeFound, strengths, workingOn, focusAreas, therapyPlan, homeAdvice, encouragement). Focus on attention span, impulse control, movement breaks, and positive behavioral reinforcement.`;
      } else if (resolvedCategory === "developmental_delay") {
        userPrompt = `Generate a clinical Developmental Delay evaluation report for Kids Care Rehab Centre, Chennai.
Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "4y"}
Diagnosis: ${childData?.diagnosis || "Developmental Delay"}
Primary Concern: ${childData?.primaryConcern || "Motor and communication milestones delay"}

Assessment Data: Developmental Checklist Battery
Severity: ${assessmentData?.delay_severity || delayResults?.severity || "Moderate Delay"}
Delay Areas: ${JSON.stringify(assessmentData?.delay_areas || delayResults?.delayAreas || ["Gross Motor", "Fine Motor", "Speech & Language"])}
Milestone Checklist Summary: ${JSON.stringify(assessmentData?.milestone_status || delayResults?.milestoneStatus || {})}

Please generate both therapist and parent reports in valid JSON format with keys "therapistReport" and "parentReport". Focus on motor planning, speech milestones, early intervention, and daily developmental play.`;
      } else if (resolvedCategory === "learning_disability") {
        userPrompt = `Generate a clinical Specific Learning Disability (LDST) report for Kids Care Rehab Centre, Chennai.
Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "8y"}
Diagnosis: ${childData?.diagnosis || "Specific Learning Disability (SLD)"}
Primary Concern: ${childData?.primaryConcern || "Reading, writing, and calculation challenges"}

Assessment Data: Learning Disability Screening Test (LDST)
Total Score: ${assessmentData?.ldst_total_score ?? ldstResults?.totalScore ?? "Elevated Risk"}
Classification: ${assessmentData?.ldst_classification || ldstResults?.classification || "Dyslexia & Dysgraphia Risk"}
Subtest Staging: ${JSON.stringify(assessmentData?.ldst_subtest_scores || ldstResults || { dyslexiaRisk: "Moderate", dysgraphiaRisk: "Mild", dyscalculiaRisk: "Low" }, null, 2)}

Please generate both therapist and parent reports in valid JSON format with keys "therapistReport" (background, assessmentFindings, currentStatus, recommendations, reviewPlan) and "parentReport" (aboutYourChild, whatWeFound, strengths, workingOn, focusAreas, therapyPlan, homeAdvice, encouragement). Focus on dyslexia decoding, phonics strategies, dysgraphia fine motor ergonomics, working memory, and school accommodations.`;
      } else if (resolvedCategory === "special_school" || resolvedCategory === "iep") {
        userPrompt = `Generate a comprehensive Individualized Education Program (IEP) and multi-domain clinical evaluation report for Kids Care Rehab Centre, Chennai.
Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "5y"}
Diagnosis: ${childData?.diagnosis || "Special Education / Multi-Domain Developmental Needs"}
Primary Concern: ${childData?.primaryConcern || "Academic readiness, adaptive living, and communication"}

Assessment Data: 14-Domain IEP Assessment Battery
Profile: ${assessmentData?.profile || "Profile 2"}
Domain Scores: ${JSON.stringify(assessmentData?.domain_scores || domainScores || {}, null, 2)}

Please generate both therapist and parent reports in valid JSON format with keys "therapistReport" (background, assessmentFindings, currentStatus, recommendations, reviewPlan) and "parentReport" (aboutYourChild, whatWeFound, strengths, workingOn, focusAreas, therapyPlan, homeAdvice, encouragement). Focus on adaptive life skills, educational baselines, social communication, and 3-month IEP milestone targets.`;
      } else {
        // ASD / ISAA (Default)
        userPrompt = `Generate a clinical Autism Spectrum Disorder (ASD) evaluation report for Kids Care Rehab Centre, Chennai.
Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "5y"}
Diagnosis: ${childData?.diagnosis || "Autism Spectrum Disorder"}
Primary Concern: ${childData?.primaryConcern || "Communication and social interaction"}

ISAA Assessment Results:
Total Score: ${assessmentData?.isaa_score ?? isaaResults?.totalScore ?? "88"} / 200
Severity: ${assessmentData?.isaa_severity || isaaResults?.severity || "Mild Autism"}
Domain Scores: ${JSON.stringify(assessmentData?.domain_scores || domainScores || {}, null, 2)}

Please generate both therapist and parent reports in valid JSON format with keys "therapistReport" and "parentReport".`;
      }
    }

    let reportText = "";

    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }]
        })
      });

      if (!res.ok) {
        throw new Error(`Anthropic API error: ${res.status}`);
      }

      const data = await res.json();
      reportText = data.content[0].text;
    } else if (groqKey) {
      const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      };

      if (mode !== "singleSection") {
        payload.response_format = { type: "json_object" };
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      reportText = data.choices?.[0]?.message?.content || "";
    } else {
      // Fallback response when offline or no API key
      if (mode === "singleSection") {
        return NextResponse.json({
          success: true,
          source: "mock",
          text: getFallbackSectionText(sectionKey, childData, resolvedCategory, assessmentData)
        });
      }
      if (mode === "iepReport") {
        return NextResponse.json({
          success: true,
          source: "mock",
          data: getFallbackIepReport(childData, domainScores, isaaResults, previousAssessment, cycleNumber)
        });
      }
      return NextResponse.json({
        success: true,
        source: "mock",
        data: getFallbackFullReport(childData, resolvedCategory, assessmentData)
      });
    }

    if (mode === "singleSection") {
      let cleanText = reportText.trim().replace(/^["']|["']$/g, "");
      return NextResponse.json({
        success: true,
        source: anthropicKey ? "claude" : groqKey ? "groq" : "mock",
        text: cleanText
      });
    }

    // Robust full report JSON parsing
    let jsonStr = reportText.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      source: anthropicKey ? "claude" : groqKey ? "groq" : "mock",
      data: parsedData
    });
  } catch (error) {
    console.warn("Report generation using clinical fallback:", error.message);
    if (mode === "singleSection") {
      return NextResponse.json({
        success: true,
        source: "fallback",
        text: getFallbackSectionText(sectionKey, childData, resolvedCategory, assessmentData)
      });
    }
    if (mode === "iepReport") {
      return NextResponse.json({
        success: true,
        source: "fallback",
        data: getFallbackIepReport(childData, domainScores, isaaResults, previousAssessment, cycleNumber)
      });
    }
    return NextResponse.json({
      success: true,
      source: "fallback",
      data: getFallbackFullReport(childData, resolvedCategory, assessmentData)
    });
  }
}

function getFallbackSectionText(sectionKey, childData, category = "asd", assessmentData = null) {
  const name = childData?.name || "the child";
  const age = childData?.age || "5y";

  if (category === "adhd") {
    switch (sectionKey) {
      case "background":
        return `${name} is a ${age} patient referred for evaluation of sustained attention, impulsivity, and motor restlessness. Evaluated using the Conners' ADHD Rating Scale.`;
      case "assessmentFindings":
      case "findings":
        return `Conners' ADHD evaluation indicates clinically elevated scores in ${assessmentData?.adhd_presentation || 'Combined'} presentation, with primary challenges in sustained attention and impulse inhibition.`;
      case "currentStatus":
      case "status":
        return `${name} exhibits high energy and creativity. Responds well to structured 1-on-1 tasks paired with visual schedules and structured movement breaks.`;
      case "recommendations":
        return `Occupational therapy with sensory regulation 2x/week, Behavioral therapy for executive functioning and impulse control, Classroom accommodation plan with movement breaks.`;
      case "reviewPlan":
        return `Progress will be re-evaluated in 12 weeks to monitor sitting tolerance, task completion rates, and impulse regulation.`;
      case "aboutYourChild":
        return `We are delighted to work with ${name}! They bring tremendous energy, curiosity, and warmth to our therapy sessions.`;
      case "whatWeFound":
        return `${name} is bright and learns rapidly through hands-on activities. They benefit from structured routines and short movement breaks to help sustain attention.`;
      case "workingOn":
        return `Building sustained focus for table tasks, practicing 'stop-and-think' before acting, and smooth transitions between activities.`;
      case "homeAdvice":
        return `Create predictable daily routines with visual timers. Provide physical movement before seated homework, and break tasks into 10-minute chunks.`;
      default:
        return `Targeted therapeutic intervention for ${name} focusing on attention, focus, and behavioral regulation.`;
    }
  }

  if (category === "developmental_delay") {
    switch (sectionKey) {
      case "background":
        return `${name} is a ${age} patient evaluated for developmental delays across physical, motor, and communicative milestones.`;
      case "assessmentFindings":
      case "findings":
        return `Developmental screening indicates ${assessmentData?.delay_severity || 'mild-to-moderate delay'} across key milestones, requiring targeted early intervention support.`;
      case "currentStatus":
      case "status":
        return `${name} shows good engagement and willingness to imitate movements. Steady progress noted in basic motor planning and receptive comprehension.`;
      case "recommendations":
        return `Early Intervention Occupational Therapy 2x/week, Pediatric Physiotherapy/Speech Therapy as indicated, Daily home developmental exercise regimen.`;
      case "reviewPlan":
        return `Quarterly milestone review in 12 weeks to benchmark progress against developmental age equivalents.`;
      case "aboutYourChild":
        return `${name} is an endearing, sweet child who showed great curiosity and perseverance during our developmental evaluation.`;
      case "whatWeFound":
        return `${name} has strong receptive skills and enjoys interactive play. With targeted exercises, their motor coordination and speech milestones will steadily catch up.`;
      case "workingOn":
        return `Strengthening core and fine motor grasping, expanding words for daily needs, and balance activities.`;
      case "homeAdvice":
        return `Encourage tummy time, floor crawling games, and hand-eye coordination games like stacking blocks. Talk through daily activities to stimulate speech.`;
      default:
        return `Targeted early intervention for ${name} focusing on developmental milestone recovery.`;
    }
  }

  if (category === "learning_disability") {
    switch (sectionKey) {
      case "background":
        return `${name} is a ${age} student evaluated for academic difficulties using the Learning Disability Screening Battery (LDST).`;
      case "assessmentFindings":
      case "findings":
        return `LDST screening battery reveals specific vulnerabilities in phonological decoding, handwriting motor control, and working memory retention.`;
      case "currentStatus":
      case "status":
        return `${name} has strong verbal reasoning and conceptual intelligence, but experiences processing bottlenecks and writing fatigue during timed tasks.`;
      case "recommendations":
        return `Special Education & Remedial Therapy 2-3x/week, Multisensory phonics (Orton-Gillingham approach), Fine motor pencil grip modification, School accommodations.`;
      case "reviewPlan":
        return `Academic and screening re-evaluation in 12 weeks to gauge reading fluency and written expression gains.`;
      case "aboutYourChild":
        return `${name} is a bright and capable child who expressed wonderful creativity and reasoning during our academic screening.`;
      case "whatWeFound":
        return `${name} understands concepts very well when explained verbally. Their reading and writing difficulties are specific processing differences, not a lack of effort.`;
      case "workingOn":
        return `Phonemic decoding for reading fluency, pencil grip comfort and letter spacing, and number-sense strategies.`;
      case "homeAdvice":
        return `Read together daily using paired reading. Avoid comparing with peers, celebrate small reading victories, and allow audiobooks to nurture their love for stories.`;
      default:
        return `Targeted academic remediation for ${name} addressing specific learning processing differences.`;
    }
  }

  if (category === "special_school" || category === "iep") {
    switch (sectionKey) {
      case "background":
        return `${name} is a ${age} student receiving specialized education and multidisciplinary developmental intervention at Kids Care Rehab Centre.`;
      case "assessmentFindings":
      case "findings":
        return `Comprehensive 14-domain assessment indicates ${assessmentData?.profile || 'Profile 2'} functional status, with emerging competencies across communication, self-help, and motor baselines.`;
      case "currentStatus":
      case "status":
        return `${name} demonstrates good engagement in classroom routines, follows visual schedules, and continues to develop independent life skills and functional communication.`;
      case "recommendations":
        return `Individualized special education program 5 days/week, speech & communication training, activities of daily living (ADL) coaching, and quarterly IEP progress review.`;
      case "reviewPlan":
        return `Comprehensive IEP multidisciplinary review scheduled in 12 weeks to benchmark progress across the 14 functional developmental domains.`;
      case "aboutYourChild":
        return `${name} is a delightful and cooperative student who brings enthusiasm and positive energy to our special education classroom!`;
      case "whatWeFound":
        return `${name} shows wonderful progress in routine comprehension and imitation, with targeted instruction supporting functional independence.`;
      case "workingOn":
        return `Enhancing independent daily living skills (eating, dressing), receptive communication, and classroom sitting endurance.`;
      case "homeAdvice":
        return `Maintain structured visual routines at home. Involve ${name} in simple household tasks like putting away toys and eating independently.`;
      default:
        return `Individualized special education program for ${name} supporting multi-domain growth.`;
    }
  }

  // Default: ASD
  switch (sectionKey) {
    case "background":
      return `${name} is a ${age} patient presenting with ${childData?.primaryConcern || "developmental delay"}. Evaluated using ISAA protocol by therapy team.`;
    case "assessmentFindings":
    case "findings":
      return `ISAA evaluation for ${name} indicates mild developmental deficits. Scores show strengths in gross motor skills with priority support needed in social communication.`;
    case "currentStatus":
    case "status":
      return `${name} demonstrates good eye contact during 1-on-1 sessions. Shows progress in understanding 1-step commands, while working on turn-taking skills.`;
    case "recommendations":
      return `Recommended 2 sessions per week of Speech & Occupational Therapy for 6 months, alongside daily home sensory and communication exercises.`;
    case "reviewPlan":
      return `Progress will be re-evaluated in 12 weeks to assess gains in expressive vocabulary and sitting tolerance.`;
    case "aboutYourChild":
      return `We are happy to share that ${name} is doing wonderfully in therapy sessions! They show great enthusiasm during interactive visual games.`;
    case "whatWeFound":
      return `${name} exhibits strong gross motor skills and visual learning capability. Speech clarity and social peer engagement are currently being supported.`;
    case "workingOn":
      return `Our primary focus is expanding sentence length, building sitting tolerance to 15 minutes, and practicing turn-taking with peers.`;
    case "homeAdvice":
      return `Practise naming objects during meal times and bath routines. Provide picture cards for choosing toys at home.`;
    default:
      return `Targeted therapeutic intervention for ${name} focusing on developmental goals.`;
  }
}

function getFallbackFullReport(childData, category = "asd", assessmentData = null) {
  const name = childData?.name || "Child";
  const age = childData?.age || "5y";

  if (category === "adhd") {
    const presentation = assessmentData?.adhd_presentation || "Combined Presentation";
    return {
      therapistReport: {
        background: `${name} is a ${age} patient referred for evaluation of high motor activity, distractibility, and impulsivity. Evaluated using the Conners' ADHD Rating Scale.`,
        assessmentFindings: `Conners' ADHD evaluation indicates clinically elevated scores in ${presentation}. Primary challenges noted in sustained attention, impulse inhibition, and high motor activity during non-preferred tasks.`,
        currentStatus: `${name} demonstrates excellent energy and creative problem-solving. Responds very well to 1-on-1 structured tasks with clear visual cues and frequent sensory breaks.`,
        recommendations: "Occupational therapy with sensory regulation 2x/week, Behavioral therapy for executive functioning and impulse control, Classroom accommodation plan with movement breaks.",
        reviewPlan: "Progress will be re-evaluated in 12 weeks to monitor sitting tolerance, task completion rates, and impulse regulation.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Occupational & Behavioral Therapist",
        date: new Date().toISOString().split("T")[0]
      },
      parentReport: {
        aboutYourChild: `We are delighted to work with ${name}! They bring tremendous energy, curiosity, and warmth to our sessions.`,
        whatWeFound: `${name} is bright and learns rapidly through hands-on activities. They benefit from structured routines and short movement breaks to help sustain attention.`,
        strengths: [
          "High curiosity and eagerness to explore",
          "Responds warmly to positive reinforcement",
          "Enjoys energetic physical and sensory games",
          "Quick learner with interactive visual aids"
        ],
        workingOn: "Building sustained focus for table tasks, practicing 'stop-and-think' before acting, and smooth transitions between activities.",
        focusAreas: [
          "Attention span during structured tasks",
          "Impulse regulation and waiting turns",
          "Organizing materials and following multi-step directions"
        ],
        therapyPlan: "Occupational Therapy & Behavioral Intervention, 2 sessions/week for 6 months.",
        therapyType: "Occupational & Behavioral Therapy",
        sessionsPerWeek: 2,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Create predictable daily routines with visual timers. Provide physical movement before seated homework, and break tasks into 10-minute chunks.",
        homeSuggestions: [
          "Use a 10-minute visual countdown timer for homework",
          "Provide sensory heavy-work (pushing a wall, jumping) before seated tasks",
          "Use positive praise immediately when instructions are followed"
        ],
        encouragement: `With consistent routines and your encouragement at home, ${name}'s vibrant energy will become their greatest strength.`
      }
    };
  }

  if (category === "developmental_delay") {
    const severity = assessmentData?.delay_severity || "Mild-to-Moderate Delay";
    const areas = assessmentData?.delay_areas?.join(", ") || "Gross Motor, Fine Motor, and Expressive Speech";
    return {
      therapistReport: {
        background: `${name} is a ${age} patient evaluated for developmental delays across physical, motor, and communicative milestones.`,
        assessmentFindings: `Standardized developmental screening indicates ${severity} with primary delays observed in ${areas}. Early intervention is recommended to support milestone recovery.`,
        currentStatus: `${name} shows good engagement and willingness to imitate movements. Steady progress noted in basic motor planning and receptive comprehension.`,
        recommendations: "Early Intervention Occupational Therapy 2x/week, Pediatric Physiotherapy/Speech Therapy as indicated, Daily home developmental exercise regimen.",
        reviewPlan: "Quarterly milestone review in 12 weeks to benchmark progress against developmental age equivalents.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Pediatric Developmental Therapist",
        date: new Date().toISOString().split("T")[0]
      },
      parentReport: {
        aboutYourChild: `${name} is an endearing, sweet child who showed great curiosity and perseverance during our developmental evaluation.`,
        whatWeFound: `${name} has strong receptive skills and enjoys interactive play. With targeted exercises, their motor coordination and speech milestones will steadily catch up.`,
        strengths: [
          "Tries hard during guided activities",
          "Good eye contact and smiling interaction",
          "Loves music and cause-and-effect toys",
          "Shows steady willingness to learn new movements"
        ],
        workingOn: "Strengthening core and fine motor grasping, expanding words for daily needs, and balance activities.",
        focusAreas: [
          "Gross and fine motor coordination",
          "Speech and language milestone achievement",
          "Independent self-help skills (spoon feeding, drinking)"
        ],
        therapyPlan: "Early Intervention & Pediatric Rehabilitation, 2-3 sessions/week for 6 months.",
        therapyType: "Early Intervention & Physical Therapy",
        sessionsPerWeek: 2,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Encourage floor play, tummy time, and hand-eye coordination games like stacking cups. Talk through daily activities to stimulate speech.",
        homeSuggestions: [
          "Encourage 15 minutes of obstacle course floor crawling daily",
          "Practice pincer grasp using safe finger foods",
          "Narrate everyday actions clearly to build vocabulary"
        ],
        encouragement: `Every child develops at their own unique pace. With early intervention and your love, ${name} will make wonderful strides.`
      }
    };
  }

  if (category === "learning_disability") {
    const dyslexia = assessmentData?.ldst_subtest_scores?.dyslexiaRisk || "Moderate Risk";
    const dysgraphia = assessmentData?.ldst_subtest_scores?.dysgraphiaRisk || "Mild Risk";
    const dyscalculia = assessmentData?.ldst_subtest_scores?.dyscalculiaRisk || "Low Risk";
    return {
      therapistReport: {
        background: `${name} is a ${age} student evaluated for academic difficulties using the Learning Disability Screening Battery (LDST).`,
        assessmentFindings: `Screening indicates risk staging: Dyslexia (${dyslexia}), Dysgraphia (${dysgraphia}), Dyscalculia (${dyscalculia}). Digit span testing indicates working memory vulnerabilities during multi-step academic tasks.`,
        currentStatus: `${name} demonstrates strong verbal reasoning and conceptual intelligence, but experiences phonological processing bottlenecks and handwriting fatigue.`,
        recommendations: "Special Education & Remedial Therapy 2-3x/week, Multisensory phonics (Orton-Gillingham approach), Fine motor pencil grip modification, School accommodations (extra time).",
        reviewPlan: "Academic and screening re-evaluation in 12 weeks to gauge reading fluency and written expression gains.",
        preparedBy: "Senior Clinical Specialist",
        designation: "Special Educator & Clinical Remediation Specialist",
        date: new Date().toISOString().split("T")[0]
      },
      parentReport: {
        aboutYourChild: `${name} is a bright and capable child who expressed wonderful creativity and reasoning during our academic screening.`,
        whatWeFound: `${name} understands concepts very well when explained verbally. Their reading and writing difficulties are specific processing differences, not a lack of effort or capability.`,
        strengths: [
          "Strong verbal vocabulary and general knowledge",
          "Excellent creative problem-solving",
          "Understands stories well when read aloud",
          "Determined and hard-working attitude"
        ],
        workingOn: "Phonemic decoding for reading fluency, pencil grip comfort and letter spacing, and number-sense strategies.",
        focusAreas: [
          "Multisensory reading and spelling strategies",
          "Handwriting endurance and spacing",
          "Math visualization using manipulatives"
        ],
        therapyPlan: "Remedial Education & Occupational Therapy, 2-3 sessions/week for 6 months.",
        therapyType: "Remedial Education & Occupational Therapy",
        sessionsPerWeek: 3,
        duration: "6 months",
        nextReviewDate: "12 weeks",
        homeAdvice: "Read together daily using paired reading. Avoid comparing with peers, celebrate small reading victories, and allow audiobooks to nurture their love for stories.",
        homeSuggestions: [
          "15 minutes of paired reading daily with finger tracking",
          "Use pencil grips and slant boards to reduce hand fatigue",
          "Break homework into short, focused intervals with breaks"
        ],
        encouragement: `With the right multisensory tools and school accommodations, ${name}'s unique strengths and intellect will shine brightly.`
      }
    };
  }

  if (category === "special_school" || category === "iep") {
    const profile = assessmentData?.profile || "Profile 2";
    return {
      therapistReport: {
        background: `${name} is a ${age} student receiving specialized education and multidisciplinary intervention. Assessed using the 14-domain special education assessment protocol.`,
        assessmentFindings: `Evaluation establishes current developmental status as ${profile}. Functional baselines indicate foundational strengths in receptive comprehension and routine compliance, with targeted support required in self-help and motor coordination.`,
        currentStatus: `${name} actively participates in structured classroom tasks, responds warmly to verbal guidance, and demonstrates emerging independence during guided mealtime and activity transitions.`,
        recommendations: "Full-day Special Education curriculum, Daily Activities of Daily Living (ADL) coaching, Multi-sensory communication support, Quarterly IEP milestone reviews.",
        reviewPlan: "Multidisciplinary IEP progress review in 12 weeks to benchmark progress across functional developmental domains.",
        preparedBy: "Senior Special Educator",
        designation: "Head of Special Education & Rehabilitation",
        date: new Date().toISOString().split("T")[0]
      },
      parentReport: {
        aboutYourChild: `${name} is an enthusiastic and cheerful student who brings wonderful warmth to our special education classroom!`,
        whatWeFound: `${name} responds well to visual schedules and interactive routines. With structured repetition, their functional independence and communication are making steady gains.`,
        strengths: [
          "Follows predictable classroom routines happily",
          "Warm, affectionate relationship with teachers",
          "Eager to try table-top learning tasks",
          "Shows steady progress in understanding visual cues"
        ],
        workingOn: "Mastering independent eating and dressing, expanding functional communication requests, and sustained attention during group circles.",
        focusAreas: [
          "Activities of daily living & self-care skills",
          "Functional communication for expressing choices",
          "Gross motor balance and fine motor classroom grasp"
        ],
        therapyPlan: "Individualized Special Education Program & Functional Skills Coaching, 5 days/week.",
        therapyType: "Special Education & Multidisciplinary IEP",
        sessionsPerWeek: 5,
        duration: "3 months (Cycle 1)",
        nextReviewDate: "12 weeks",
        homeAdvice: "Maintain predictable routines at home using visual charts. Provide opportunities for independent self-help like spoon feeding and putting on shoes.",
        homeSuggestions: [
          "Use a visual schedule chart for morning and bedtime routines",
          "Encourage independent self-feeding with child-safe utensils",
          "Praise each completed step with smiles and high-fives"
        ],
        encouragement: `Every milestone, no matter how small, is a victory. With consistent school and home teamwork, ${name} will continue to thrive and grow.`
      }
    };
  }

  // Default: Autism Spectrum Disorder (ASD)
  const isaaScore = assessmentData?.isaa_score || "88";
  const isaaSeverity = assessmentData?.isaa_severity || "Mild Autism";
  return {
    therapistReport: {
      background: `${name} is a ${age} patient presenting with ${childData?.primaryConcern || "communication and social interaction concerns"}. Evaluated using standard ISAA protocol.`,
      assessmentFindings: `ISAA assessment yields a score of ${isaaScore}, indicating ${isaaSeverity}. Primary developmental challenges observed in reciprocal social communication, emotional responsiveness, and sensory modulation.`,
      currentStatus: `${name} responds to name call consistently and follows simple 1-step commands. Shows curiosity during visual activities and sensory play.`,
      recommendations: "Speech therapy 2x/week, Occupational therapy with sensory integration 2x/week, Parent guidance program.",
      reviewPlan: "Progress will be re-evaluated in 12 weeks with focus on communication clarity, turn-taking, and sitting tolerance.",
      preparedBy: "Senior Clinical Specialist",
      designation: "Occupational & Speech Therapist",
      date: new Date().toISOString().split("T")[0]
    },
    parentReport: {
      aboutYourChild: `We are happy to share that ${name} has made wonderful progress. They communicate needs clearly and engage warmly with therapists.`,
      whatWeFound: `${name} shows strong visual processing and enthusiasm for learning activities.`,
      strengths: [
        "Responds consistently to name call",
        "Uses gestures and single words to express needs",
        "Warm and friendly with therapy staff",
        "Enjoys sensory play activities"
      ],
      workingOn: "Building two-word phrase communication, sitting tolerance, and turn-taking with peers.",
      focusAreas: [
        "Expanding vocabulary and sentence length",
        "Social interaction in classroom settings",
        "Sitting tolerance during quiet table tasks"
      ],
      therapyPlan: "Speech + Social Skills + OT, 2 sessions per week for 6 months.",
      therapyType: "Speech + Occupational Therapy",
      sessionsPerWeek: 2,
      duration: "6 months",
      nextReviewDate: "12 weeks",
      homeAdvice: "Practise naming objects during daily routines (bathing, meal time). Encourage 2-word requests before handing items.",
      homeSuggestions: [
        "Practise naming objects during daily activities",
        "Use picture cards during meals and play time",
        "Encourage 2-word requests before giving items"
      ],
      encouragement: `With your support at home and our guidance at the clinic, ${name} will continue to grow beautifully.`
    }
  };
}

function getFallbackIepReport(childData, domainScores, isaaResults, previousAssessment, cycleNumber) {
  const name = childData?.name || "the child";
  const diagnosis = childData?.diagnosis || "IEP Special School";
  const age = childData?.age || "5y";
  const isFirstCycle = !previousAssessment || cycleNumber === 1;
  const cycle = cycleNumber || 1;
  const currDomains = domainScores || {};
  const prevDomains = previousAssessment?.domain_scores || {};

  const improved = [];
  const unchanged = [];
  const needsImprovement = [];

  if (!isFirstCycle) {
    Object.keys(currDomains).forEach(k => {
      const prev = prevDomains[k] ?? 0;
      const curr = currDomains[k] ?? 0;
      const diff = curr - prev;
      const label = k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
      if (diff > 5) improved.push(label);
      else if (diff < -5) needsImprovement.push(label);
      else unchanged.push(label);
    });
  }

  const weakDomains = Object.entries(currDomains)
    .filter(([, v]) => v < 60)
    .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()));

  return {
    assessmentSummary: {
      overallSummary: `${name} is a ${age} student presenting with ${diagnosis}. The current IEP assessment (Cycle ${cycle}) was conducted across the 14 special school developmental domains. Assessment findings provide a ${isFirstCycle ? "baseline" : "comparative"} evaluation of educational and developmental progress.`,
      domainHighlights: weakDomains.length > 0
        ? `Areas requiring priority focus include: ${weakDomains.slice(0, 3).join(", ")}. Relatively stronger performance was observed in gross motor and functional play areas.`
        : "The student demonstrates steady performance across assessed domains, with communication and cognitive concepts identified as primary areas for continued IEP development.",
      clinicalObservations: `${name} was cooperative during the assessment session. Responsiveness to structured educational tasks and engagement with the special educator were noted. ${isFirstCycle ? "This assessment establishes the baseline for the 3-month IEP cycle." : "Comparison with the previous assessment informs the revised 3-month plan."}`
    },
    progressComparison: {
      isFirstCycle,
      baseline: isFirstCycle
        ? `This is the initial IEP assessment for ${name}, establishing the developmental baseline across all 14 special school domains. The findings will serve as the reference point for evaluating progress in subsequent 3-month cycles.`
        : "",
      improved: improved.length > 0 ? improved : (isFirstCycle ? [] : ["To be determined at next review"]),
      unchanged: unchanged.length > 0 ? unchanged : [],
      needsImprovement: isFirstCycle ? weakDomains.slice(0, 4) : (needsImprovement.length > 0 ? needsImprovement : weakDomains.slice(0, 3)),
      narrative: isFirstCycle
        ? `As this is ${name}'s first IEP assessment, this report establishes the baseline for developmental and educational progress. The identified areas of need will form the foundation of the 3-month intervention plan.`
        : `Since the previous assessment, ${improved.length > 0 ? `improvements have been noted in ${improved.join(", ")}` : "progress has been steady across domains"}. ${needsImprovement.length > 0 ? `Continued focused support is recommended for ${needsImprovement.join(", ")}.` : "The student is making expected developmental progress."}`
    },
    areasForImprovement: isFirstCycle
      ? (weakDomains.length > 0 ? weakDomains.slice(0, 4) : [
          "Expressive communication — building functional vocabulary and sentence use",
          "Social interaction — developing turn-taking and peer engagement skills",
          "Attention and task completion — increasing sitting tolerance and on-task behaviour",
          "Daily living skills — improving independence in self-care routines"
        ])
      : (needsImprovement.length > 0 ? needsImprovement.slice(0, 4) : weakDomains.slice(0, 3)),
    threeMonthPlan: {
      goals: [
        `Improve functional communication — ${name} will initiate communication in 3 out of 5 opportunities without prompting`,
        `Increase sustained attention during structured learning activities to 15–20 minutes`,
        `Demonstrate 3+ appropriate social interactions with peers per session`,
        `Show measurable improvement in at least 2 identified priority domains by next assessment`
      ],
      approach: `The 3-month plan for ${name} will focus on a structured, multi-sensory educational approach to address the identified priority areas. Sessions will integrate individualized learning materials, educator collaboration, and a consistent routine.`,
      expectedOutcomes: `By the end of this 3-month period, ${name} is expected to demonstrate measurable progress in the identified priority areas, with particular focus on communication and pre-academic readiness.`
    },
    recommendedOutcomes: `With consistent educational support and family engagement, ${name} is expected to make meaningful progress over the next 3 months. The structured IEP plan provides a clear framework for targeted improvement.`
  };
}
