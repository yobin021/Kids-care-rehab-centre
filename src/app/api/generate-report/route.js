import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert pediatric occupational therapist and clinical specialist at Kids Care Rehab Centre, Chennai.
Your task is to generate report content for pediatric rehabilitation. Always return clinical, practical, accurate text.

If asked for a full report, return ONLY a valid JSON object with keys: "therapistReport" and "parentReport".
If asked for a single section rewrite, return ONLY the plain text paragraph/sentence requested without quotes or markdown wrappers.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, sectionKey, customPrompt, childData, isaaResults, domainScores } = body;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let userPrompt = "";

    if (mode === "singleSection") {
      userPrompt = customPrompt || `Rewrite the ${sectionKey} section for ${childData?.name || "the child"}.`;
    } else {
      userPrompt = `Child Info:
Name: ${childData?.name || "Child"}
Age: ${childData?.age || "5y"}
Diagnosis: ${childData?.diagnosis || "ASD"}
Primary Concern: ${childData?.primaryConcern || "Developmental delay"}

ISAA Assessment Results:
Total Score: ${isaaResults?.totalScore || 94} / 200
Severity: ${isaaResults?.severity || "Mild Autism"}

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
      // Groq API (Development)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Groq API Error:", errText);
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      reportText = data.choices[0].message.content;
    } else {
      // Fallback response when offline or no API key
      if (mode === "singleSection") {
        return NextResponse.json({
          success: true,
          source: "mock",
          text: getFallbackSectionText(sectionKey, childData)
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
        source: anthropicKey ? "claude" : "groq",
        text: cleanText
      });
    }

    // Full report JSON parsing
    let jsonStr = reportText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      source: anthropicKey ? "claude" : "groq",
      data: parsedData
    });
  } catch (error) {
    console.error("Report generation route error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
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
