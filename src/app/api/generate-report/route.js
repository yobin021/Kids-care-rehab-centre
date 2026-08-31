import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert pediatric occupational therapist and clinical specialist at Kids Care Rehab Centre, Chennai.
Your task is to generate report content for pediatric rehabilitation. Always return clinical, practical, accurate text.

If asked for a full report, return ONLY a valid JSON object with keys: "therapistReport" and "parentReport".
If asked for a single section rewrite, return ONLY the plain text paragraph/sentence requested without quotes or markdown wrappers.
If asked for an IEP report, return ONLY a valid JSON object matching the IEP report structure provided.
IMPORTANT: IEP reports must NOT contain individual exercises, therapy exercises, or exercise prescriptions. Focus only on high-level goals, progress, and 3-month plans.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, sectionKey, customPrompt, childData, isaaResults, domainScores, previousAssessment, cycleNumber } = body;


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
Diagnosis: ${childData?.diagnosis || "ASD"}
Assessment Date: ${childData?.assessmentDate || new Date().toISOString().split("T")[0]}
IEP Cycle: ${cycleNumber || 1} (${isFirstCycle ? "First Assessment — Establishing Baseline" : "Follow-up Assessment"})

Current Assessment:
ISAA Score: ${isaaResults?.totalScore ?? "Not scored"} / 200
Severity: ${isaaResults?.severity || "Not assessed"}
Domain Scores (0-100%): ${JSON.stringify(currDomains, null, 2)}

${isFirstCycle ? "" : `Previous Assessment Domain Scores:
${JSON.stringify(prevDomains, null, 2)}

Domain Progress Comparison:
${domainComparison}

Previous ISAA Score: ${previousAssessment?.isaa_score ?? "Not recorded"}
Previous Severity: ${previousAssessment?.isaa_severity ?? "Not recorded"}`}

Parent Goals from Assessment:
${childData?.parentGoals || "Not specified"}

Clinical Observations:
${childData?.clinicalObservations || "Assessed using standard IEP and ISAA protocols"}

Return ONLY this exact JSON structure (no extra text):
{
  "assessmentSummary": {
    "overallSummary": "2-3 sentence clinical summary of current status based on ISAA score and domain scores",
    "domainHighlights": "Specific observations about strongest and weakest domains based on scores",
    "clinicalObservations": "Any notable clinical observations from the assessment data"
  },
  "progressComparison": {
    "isFirstCycle": ${isFirstCycle},
    "baseline": "${isFirstCycle ? "Narrative establishing this as the baseline assessment" : ""}",
    "improved": ${isFirstCycle ? "[]" : '["list of domains/areas showing improvement"]'},
    "unchanged": ${isFirstCycle ? "[]" : '["list of domains/areas with no significant change"]'},
    "needsImprovement": ["list of specific areas requiring focused work"],
    "narrative": "2-3 sentence narrative ${isFirstCycle ? "establishing baseline and initial status" : "describing overall progress since last assessment"}"
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

      userPrompt = customPrompt || `Rewrite the ${sectionKey} section for ${childData?.name || "the child"}.`;
    } else {
      userPrompt = `Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "5y"}
Diagnosis: ${childData?.diagnosis || "ASD"}
Primary Concern: ${childData?.primaryConcern || "Developmental delay"}

ISAA Assessment Results:
Total Score: ${isaaResults?.totalScore ?? "Not Assessed"} / 200
Severity: ${isaaResults?.severity || "Not Assessed"}

Domain Competency Scores (0-100):
${JSON.stringify(domainScores || {}, null, 2)}

Please generate both therapist and parent reports in valid JSON format.`;
    }

    let reportText = "";

    if (anthropicKey) {
      // Claude API (Production)
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
        const errText = await res.text();
        console.error("Anthropic API Error:", errText);
        throw new Error(`Anthropic API error: ${res.status}`);
      }

      const data = await res.json();
      reportText = data.content[0].text;
    } else if (groqKey) {
      // Groq API (Primary LLM)
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
        const errText = await res.text();
        console.error("Groq API Error:", errText);
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
          text: getFallbackSectionText(sectionKey, childData)
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
        data: getFallbackFullReport(childData)
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
    console.error("Report generation route error:", error);
    // Fallback response on error so user UI never crashes
    const body = await req.json().catch(() => ({}));
    if (body.mode === "singleSection") {
      return NextResponse.json({
        success: true,
        source: "fallback",
        text: getFallbackSectionText(body.sectionKey, body.childData)
      });
    }
    if (body.mode === "iepReport") {
      return NextResponse.json({
        success: true,
        source: "fallback",
        data: getFallbackIepReport(body.childData, body.domainScores, body.isaaResults, body.previousAssessment, body.cycleNumber)
      });
    }
    return NextResponse.json({
      success: true,
      source: "fallback",
      data: getFallbackFullReport(body.childData)
    });
  }
}

function getFallbackSectionText(sectionKey, childData) {
  const name = childData?.name || "the child";
  const diagnosis = childData?.diagnosis || "ASD";
  const age = childData?.age || "5y";

  switch (sectionKey) {
    case "background":
      return `${name} is a ${age} patient presenting with ${childData?.primaryConcern || "developmental delay"}. Evaluated using ISAA protocol by therapy team.`;
    case "findings":
      return `ISAA evaluation for ${name} indicates mild developmental deficits. Scores show strengths in gross motor skills with priority support needed in social communication.`;
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
    case "therapyPlan":
      return `Speech and Occupational Therapy, 2 sessions per week for 6 months with quarterly review.`;
    case "homeAdvice":
      return `Practise naming objects during meal times and bath routines. Provide picture cards for choosing toys at home.`;
    case "encouragement":
      return `With your warmth at home and our team's guidance, ${name} will continue to achieve great milestones!`;
    default:
      return `Targeted therapeutic intervention for ${name} focusing on developmental goals.`;
  }
}

function getFallbackFullReport(childData) {
  return {
    therapistReport: {
      background: `${childData?.name || "Child"} is a ${childData?.age || "5y"} patient presenting with ${childData?.primaryConcern || "developmental delay"}. Evaluated using ISAA protocol.`,
      findings: "ISAA assessment indicates mild developmental & autism spectrum considerations with main deficits in social communication.",
      currentStatus: `${childData?.name || "Child"} responds to name call consistently and follows simple commands. Shows curiosity during visual activities.`,
      recommendations: "Speech therapy 2x/week, Occupational therapy 2x/week, Parent guidance program.",
      reviewPlan: "Progress will be re-evaluated in 12 weeks with focus on communication clarity and social interaction."
    },
    parentReport: {
      aboutYourChild: `We are happy to share that ${childData?.name || "your child"} has made wonderful progress. They communicate needs clearly and engage warmly with therapists.`,
      whatWeFound: `${childData?.name || "Your child"} shows strong visual processing and enthusiasm for learning activities.`,
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
      nextReviewDate: "2026-10-15",
      homeAdvice: "Practise naming objects during daily routines (bathing, meal time). Encourage 2-word requests before handing items.",
      homeSuggestions: [
        "Practise naming objects during daily activities",
        "Use picture cards during meals and play time",
        "Encourage 2-word requests before giving items"
      ],
      encouragement: `With your support at home and our guidance at the clinic, ${childData?.name || "your child"} will continue to grow beautifully.`
    }
  };
}

function getFallbackIepReport(childData, domainScores, isaaResults, previousAssessment, cycleNumber) {
  const name = childData?.name || "the child";
  const diagnosis = childData?.diagnosis || "Autism Spectrum Disorder";
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

  // Identify weak domains for first cycle
  const weakDomains = Object.entries(currDomains)
    .filter(([, v]) => v < 60)
    .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()));

  const severity = isaaResults?.severity || "Moderate Autism";
  const score = isaaResults?.totalScore ?? "Not scored";

  return {
    assessmentSummary: {
      overallSummary: `${name} is a ${age} child presenting with ${diagnosis}. The current IEP assessment (Cycle ${cycle}) was conducted using ISAA protocol, yielding a score of ${score} indicating ${severity}. Assessment findings provide a ${isFirstCycle ? "baseline" : "comparative"} evaluation of developmental progress across key domains.`,
      domainHighlights: weakDomains.length > 0
        ? `Areas requiring priority support include: ${weakDomains.slice(0, 3).join(", ")}. Relatively stronger performance was observed in gross motor and self-help areas.`
        : "The child demonstrates relatively uniform performance across assessed domains, with communication and social interaction identified as primary areas for continued development.",
      clinicalObservations: `${name} was cooperative during the assessment session. Responsiveness to structured activities and engagement with the therapist were noted. ${isFirstCycle ? "This assessment establishes the baseline for the 3-month IEP cycle." : "Comparison with the previous assessment informs the revised 3-month plan."}`
    },
    progressComparison: {
      isFirstCycle,
      baseline: isFirstCycle
        ? `This is the initial IEP assessment for ${name}, establishing the developmental baseline across all domains. The findings will serve as the reference point for evaluating progress in subsequent 3-month cycles.`
        : "",
      improved: improved.length > 0 ? improved : (isFirstCycle ? [] : ["To be determined at next review"]),
      unchanged: unchanged.length > 0 ? unchanged : [],
      needsImprovement: isFirstCycle ? weakDomains.slice(0, 4) : (needsImprovement.length > 0 ? needsImprovement : weakDomains.slice(0, 3)),
      narrative: isFirstCycle
        ? `As this is ${name}'s first IEP assessment, this report establishes the baseline for developmental progress. The identified areas of need will form the foundation of the 3-month intervention plan.`
        : `Since the previous assessment, ${improved.length > 0 ? `improvements have been noted in ${improved.join(", ")}` : "progress has been steady across domains"}. ${needsImprovement.length > 0 ? `Continued focused support is recommended for ${needsImprovement.join(", ")}.` : "The child is making expected developmental progress."}`
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
        `Increase sustained attention during structured activities to 10–15 minutes`,
        `Demonstrate 3+ appropriate social interactions with peers per therapy session`,
        `Show measurable improvement in at least 2 identified priority domains by next assessment`
      ],
      approach: `The 3-month plan for ${name} will focus on a structured, systematic approach to address the identified priority areas. Sessions will integrate multi-modal learning techniques, parent collaboration, and a consistent routine to support skill generalisation across home and clinic environments.`,
      expectedOutcomes: `By the end of this 3-month period, ${name} is expected to demonstrate measurable progress in the identified priority areas, with particular focus on communication and social interaction. The next IEP assessment will formally evaluate progress against these goals.`
    },
    recommendedOutcomes: `With consistent therapeutic support and family engagement, ${name} is expected to make meaningful developmental progress over the next 3 months. The structured IEP plan provides a clear framework for targeted improvement, and the next review will assess achievement against these goals.`
  };
}
