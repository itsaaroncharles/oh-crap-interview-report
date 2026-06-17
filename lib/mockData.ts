import type {
  AreaKey,
  AuditCard,
  AuditInput,
  AuditReport,
  CaseStudy,
  ImprovementArea,
  InterviewQuestion,
  InterviewReport,
  InterviewTurn,
  PracticeScore,
  ReadinessLabel,
  SavedAnswer,
  Severity,
} from "./types";

// ---------------------------------------------------------------------------
// MOCK DATA LAYER
// This is the single place that fakes the AI. When the Gemini key arrives,
// replace the bodies of buildMockReport / mockFollowUp with real calls, the
// returned shapes (AuditReport, PracticeScore, etc.) stay identical.
// ---------------------------------------------------------------------------

export function labelForScore(score: number): ReadinessLabel {
  if (score >= 90) return "Strong";
  if (score >= 75) return "Good";
  if (score >= 60) return "Risky";
  if (score >= 40) return "Weak";
  return "Unclear";
}

const MOCK_CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-medisave",
    title: "MediSave Recurring Payment Redesign",
    summary:
      "Reworked the recurring-payment cancellation flow for an insurance app so members could pause or stop plans without calling support.",
    detectedRole: "Sole designer, partnered with 1 PM and 2 engineers",
    detectedImpact: "Support tickets for cancellations dropped (no baseline given)",
    scores: {
      problemClarity: 8,
      userEvidence: 7,
      ownership: 6,
      rationale: 7,
      tradeoffs: 4,
      impact: 5,
      reflection: 6,
    },
  },
  {
    id: "cs-onboarding",
    title: "First-Run Onboarding Redesign",
    summary:
      "Redesigned the new-user onboarding to surface the core value within the first session and reduce day-1 drop-off.",
    detectedRole: "Led design, collaborated with growth team",
    detectedImpact: "Activation 'improved', engagement metric undefined",
    scores: {
      problemClarity: 7,
      userEvidence: 6,
      ownership: 7,
      rationale: 6,
      tradeoffs: 5,
      impact: 4,
      reflection: 5,
    },
  },
  {
    id: "cs-banner",
    title: "Homepage Banner Optimisation",
    summary:
      "Iterated on the marketing homepage hero banner to lift click-through to the signup flow.",
    detectedRole: "Unclear, uses 'we' throughout",
    detectedImpact: "Conversion 'lifted', baseline, timeframe, attribution missing",
    scores: {
      problemClarity: 5,
      userEvidence: 3,
      ownership: 3,
      rationale: 4,
      tradeoffs: 2,
      impact: 4,
      reflection: 3,
    },
  },
];

const MOCK_CARDS: AuditCard[] = [
  {
    id: "card-ownership",
    index: 1,
    title: "Your ownership is blurry",
    severity: "high",
    caseStudyTitle: "Homepage Banner Optimisation",
    interviewerConcern:
      "You say “we” throughout, so I can’t tell whether you led this work or simply supported it.",
    whyItMatters:
      "Design interviews are decided on ownership. If I can’t see what you personally drove, I default to assuming you did the smaller share.",
    likelyQuestion:
      "What part of this project would not have happened without you?",
    betterAnswerAngle:
      "Separate your contribution from the team’s. Name the specific decisions, artefacts, and conversations you personally owned.",
  },
  {
    id: "card-metrics",
    index: 2,
    title: "Your impact claim may not survive follow-up",
    severity: "high",
    caseStudyTitle: "MediSave Recurring Payment Redesign",
    interviewerConcern:
      "The result sounds good, but it’s unclear whether your design caused it or something else moved at the same time.",
    whyItMatters:
      "Senior interviewers probe causality. A number with no baseline, timeframe, or attribution reads as a vanity metric.",
    likelyQuestion:
      "How do you know this improvement came from your design and not another factor?",
    betterAnswerAngle:
      "Be honest about causality. State the baseline and timeframe, then separate what you measured from what you reasonably infer.",
  },
  {
    id: "card-tradeoffs",
    index: 3,
    title: "Your trade-offs are missing",
    severity: "medium",
    caseStudyTitle: "MediSave Recurring Payment Redesign",
    interviewerConcern:
      "Every decision looks like an obvious win. Real product work has costs, and I don’t see you weighing any.",
    whyItMatters:
      "Showing trade-offs signals design maturity. Without them you look like you got lucky rather than exercised judgement.",
    likelyQuestion:
      "What did this solution cost you, what got worse, and why was that acceptable?",
    betterAnswerAngle:
      "Name one real cost (an added step, a deferred edge case) and explain the reasoning that made it the right trade.",
  },
  {
    id: "card-rationale",
    index: 4,
    title: "Your final design appears too suddenly",
    severity: "medium",
    caseStudyTitle: "First-Run Onboarding Redesign",
    interviewerConcern:
      "You show research and then polished final screens, but the decision-making in between is thin.",
    whyItMatters:
      "I’m hiring your judgement, not your Figma file. The space between insight and final pixels is where I evaluate you.",
    likelyQuestion:
      "What alternatives did you explore, and why did you reject them?",
    betterAnswerAngle:
      "Walk one fork in the road: the options on the table, the criteria you judged them against, and why you chose this one.",
  },
  {
    id: "card-research",
    index: 5,
    title: "Your research feels surface-level",
    severity: "medium",
    caseStudyTitle: "First-Run Onboarding Redesign",
    interviewerConcern:
      "“Users found it confusing” tells me a conclusion but not the evidence behind it.",
    whyItMatters:
      "I want to know your research is real, not a retrofit. Sample size and method tell me how much to trust the insight.",
    likelyQuestion:
      "How many people did you talk to, how did you recruit them, and what specifically did you observe?",
    betterAnswerAngle:
      "Quote the method and the count: “In 6 of 8 moderated sessions, users failed to locate X.”",
  },
  {
    id: "card-reflection",
    index: 6,
    title: "No sign of what you’d do differently",
    severity: "low",
    caseStudyTitle: "Homepage Banner Optimisation",
    interviewerConcern:
      "Every project ends in success. I can’t see how you learn or grow from shipping.",
    whyItMatters:
      "Reflection is a proxy for seniority. The best designers are openly critical of their own past work.",
    likelyQuestion:
      "If you ran this project again, what would you change and why?",
    betterAnswerAngle:
      "Pick one genuine miss and connect it to a principle you now apply, show the lesson, not just the regret.",
  },
  {
    id: "card-business",
    index: 7,
    title: "Business framing is thin",
    severity: "low",
    caseStudyTitle: "MediSave Recurring Payment Redesign",
    interviewerConcern:
      "I see the user problem clearly, but not why the business cared enough to fund this.",
    whyItMatters:
      "Product roles reward designers who connect user value to business outcomes. Without it you read as a UI specialist.",
    likelyQuestion:
      "Why did the business prioritise this over everything else on the roadmap?",
    betterAnswerAngle:
      "Tie the user pain to a cost the business felt, support load, churn, revenue, and the stakeholder who owned it.",
  },
];

const TOP_RISKS = [
  "Impact claims are vague, numbers lack baseline and attribution",
  "Personal ownership is unclear, heavy use of “we”",
  "Trade-offs are missing, every decision looks like a clean win",
  "Research process feels surface-level, conclusions without method",
  "Final design decisions are not well justified",
];

/**
 * Builds a mock Oh Crap Report. Deterministic so the demo always tells the
 * same story. Swap the body for a Gemini call later; keep the return shape.
 */
export function buildMockReport(input: AuditInput): AuditReport {
  const readinessScore = 64;
  return {
    id: `report-${Date.now()}`,
    createdAt: new Date().toISOString(),
    input,
    readinessScore,
    readinessLabel: labelForScore(readinessScore),
    mainRisk:
      "Your case studies look visually polished, but the story doesn’t clearly prove design judgement, ownership, or measurable impact, the three things a hiring manager will pressure-test hardest.",
    topRisks: TOP_RISKS,
    strongestCaseStudy: "MediSave Recurring Payment Redesign",
    weakestCaseStudy: "Homepage Banner Optimisation",
    candidateLevel: `mid-level ${input.targetRole.toLowerCase()}`,
    caseStudies: MOCK_CASE_STUDIES,
    cards: MOCK_CARDS,
  };
}

// ---------------------------------------------------------------------------
// Practice room mock
// ---------------------------------------------------------------------------

const FOLLOW_UPS: Record<string, string[]> = {
  "card-ownership": [
    "Good start. But that still sounds like a team achievement. What part would not have happened without you specifically?",
    "Okay, so you owned that decision. Who pushed back, and how did you bring them along?",
    "That’s much clearer. Last thing: if your PM described your role here, would they use the same words you just did?",
  ],
  "card-metrics": [
    "Right, but what was the number before you shipped, and over what window did you measure it?",
    "Understood. Were there any other changes live at the same time that could explain part of that lift?",
    "Good. So how would you state this honestly to me without overclaiming causality?",
  ],
  default: [
    "Walk me through the reasoning behind that, not just what you did, but why.",
    "What did that choice cost you? Nothing is free.",
    "If a skeptical PM challenged that, how would you defend it?",
  ],
};

export function openingQuestion(card: AuditCard): string {
  return card.likelyQuestion;
}

export function mockFollowUp(cardId: string, turn: number): string {
  const list = FOLLOW_UPS[cardId] ?? FOLLOW_UPS.default;
  return list[Math.min(turn, list.length - 1)];
}

/**
 * Fakes scoring of a candidate answer. Heuristic on purpose: longer, more
 * specific answers (numbers, "I", method words) score higher so the demo feels
 * responsive. Replace with a Gemini judge later.
 */
export function mockScoreAnswer(answer: string): PracticeScore {
  const text = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  const lengthBoost = Math.min(words / 60, 1); // up to 1
  const hasNumbers = /\d/.test(text) ? 1 : 0;
  const hasI = /\bi\b|\bmy\b/.test(text) ? 1 : 0;
  const hasMethod =
    /(test|interview|baseline|because|trade|chose|measured|session)/.test(text)
      ? 1
      : 0;

  const clamp = (n: number) => Math.max(2, Math.min(10, Math.round(n)));

  const clarity = clamp(4 + lengthBoost * 4 + hasMethod * 1);
  const specificity = clamp(3 + lengthBoost * 3 + hasNumbers * 3);
  const evidence = clamp(3 + hasNumbers * 3 + hasMethod * 3);
  const ownership = clamp(3 + hasI * 4 + lengthBoost * 2);
  const readiness = Math.round(
    ((clarity + specificity + evidence + ownership) / 40) * 100,
  );

  return { clarity, specificity, evidence, ownership, readiness };
}

export function mockCoaching(score: PracticeScore): string {
  if (score.ownership <= 4)
    return "Lead with “I”. Right now this reads as a team win, name the decisions that were yours.";
  if (score.evidence <= 4)
    return "Anchor it in evidence. Add a baseline, a number, or the method behind your claim.";
  if (score.specificity <= 5)
    return "Get concrete. Swap the general statement for one specific moment or artefact.";
  return "Strong answer. Tighten it to 30 seconds and you’d land this in the room.";
}

// ---------------------------------------------------------------------------
// MOCK INTERVIEW
// A small bank of questions, one per improvement area. The interviewer asks
// these one at a time (voice). Later: have Gemini generate these from the
// candidate's actual resume + portfolio.
// ---------------------------------------------------------------------------

// Warm, conversational questions, this is the interview itself, so the tone
// stays polite and curious, like a real hiring manager. The critical read
// happens later, in the report. Each still maps to an area we score quietly.
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q-warmup",
    area: "impact",
    spoken: "Hey, thanks so much for making the time today, it's great to chat.",
    prompt:
      "To start, I'd love if you could walk me through a project you're really proud of. What was the problem you were tackling, and what did you end up shipping?",
  },
  {
    id: "q-ownership",
    area: "ownership",
    spoken: "That's a great overview, thank you.",
    prompt:
      "I'd love to understand your role a little more. Within that project, what were the parts you personally drove?",
  },
  {
    id: "q-impact",
    area: "impact",
    spoken: "Makes sense.",
    prompt:
      "When you think about the impact of that work, how did you and the team know it was actually making a difference?",
  },
  {
    id: "q-tradeoffs",
    area: "tradeoffs",
    spoken: "Really interesting.",
    prompt:
      "Every project has trade-offs. Were there any tough calls or compromises you had to make along the way?",
  },
  {
    id: "q-rationale",
    area: "rationale",
    spoken: "I appreciate you walking me through that.",
    prompt:
      "I'm curious about how you got there, were there other directions you considered before landing on what you shipped?",
  },
  {
    id: "q-reflection",
    area: "reflection",
    spoken: "This has been really great.",
    prompt:
      "As a last one, if you got to do this project again, is there anything you'd approach differently? No wrong answers here.",
  },
];

const AREA_META: Record<
  AreaKey,
  { title: string; whatGoodLooksLike: string; drillQuestion: string }
> = {
  ownership: {
    title: "Personal ownership",
    whatGoodLooksLike:
      "You separate your contribution from the team's and name the specific decisions, artefacts, and conversations you drove.",
    drillQuestion:
      "What part of this project would not have happened without you?",
  },
  impact: {
    title: "Measurable impact",
    whatGoodLooksLike:
      "You give a baseline, a timeframe, and honestly separate what you measured from what you reasonably infer.",
    drillQuestion:
      "How do you know this improvement came from your design and not another factor?",
  },
  tradeoffs: {
    title: "Trade-offs & judgement",
    whatGoodLooksLike:
      "You name a real cost of your solution and explain the reasoning that made it the right call.",
    drillQuestion:
      "What did this solution cost you, what got worse, and why was that acceptable?",
  },
  rationale: {
    title: "Decision rationale",
    whatGoodLooksLike:
      "You walk one fork in the road: the options, the criteria, and why you chose this one.",
    drillQuestion:
      "What alternatives did you explore, and why did you reject them?",
  },
  research: {
    title: "Research depth",
    whatGoodLooksLike:
      "You quote the method and the count, “in 6 of 8 sessions, users failed to…”, not just a conclusion.",
    drillQuestion:
      "How many people did you talk to, how did you recruit them, and what did you observe?",
  },
  reflection: {
    title: "Reflection & growth",
    whatGoodLooksLike:
      "You name one genuine miss and connect it to a principle you now apply.",
    drillQuestion:
      "If you ran this project again, what would you change and why?",
  },
};

const AREA_DIAGNOSIS: Record<AreaKey, string> = {
  ownership:
    "Across your résumé and case studies the language is mostly “we”. The redesigns read as team efforts, so an interviewer can't yet see the slice you personally drove.",
  impact:
    "Your portfolio cites outcomes (“improved engagement”, “lifted conversion”) but rarely a baseline, timeframe, or attribution. The numbers don't yet survive a follow-up.",
  tradeoffs:
    "Every case study ends in a clean win. There's no visible cost or constraint, which makes the work read as lucky rather than judged.",
  rationale:
    "Your case studies jump from research to polished final screens. The decision-making in between, the forks you took, is thin.",
  research:
    "Research shows up as conclusions (“users were confused”) without method or sample size, so it's hard to trust how grounded it is.",
  reflection:
    "Nothing in your materials shows what you'd do differently. Reflection is a proxy for seniority, and right now it's missing.",
};

/** Minimal area descriptor used by the practice room when drilling one area. */
export function areaCard(key: AreaKey) {
  const meta = AREA_META[key];
  return {
    key,
    title: meta.title,
    drillQuestion: meta.drillQuestion,
    betterAnswerAngle: meta.whatGoodLooksLike,
    diagnosis: AREA_DIAGNOSIS[key],
  };
}

export const ALL_AREA_KEYS: AreaKey[] = [
  "ownership",
  "impact",
  "tradeoffs",
  "rationale",
  "research",
  "reflection",
];

function severityFor(score: number): Severity {
  if (score < 55) return "high";
  if (score < 72) return "medium";
  return "low";
}

/**
 * Scores a finished interview and produces the Oh Crap report. Aggregates the
 * per-answer scores by area. On retakes (attempt > 1) we nudge weak areas up so
 * the user feels the payoff of practising, replace with a real Gemini judge.
 */
export function buildInterviewReport(
  turns: InterviewTurn[],
  attempt: number,
  input: AuditInput,
  previousScore?: number,
): InterviewReport {
  const areaKeys: AreaKey[] = [
    "ownership",
    "impact",
    "tradeoffs",
    "rationale",
    "research",
    "reflection",
  ];

  // Average answered turns per area; areas with no turn get a baseline.
  const byArea = new Map<AreaKey, number[]>();
  for (const t of turns) {
    const q = INTERVIEW_QUESTIONS.find((x) => x.id === t.questionId);
    const area = q?.area ?? "impact";
    const arr = byArea.get(area) ?? [];
    arr.push(t.score.readiness);
    byArea.set(area, arr);
  }

  const retakeBoost = Math.min((attempt - 1) * 11, 24);

  const areas: ImprovementArea[] = areaKeys.map((key) => {
    const scores = byArea.get(key);
    const base = scores
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 48 + Math.round(Math.random() * 8);
    const score = Math.min(95, base + retakeBoost);
    const meta = AREA_META[key];
    return {
      key,
      title: meta.title,
      score,
      severity: severityFor(score),
      diagnosis: AREA_DIAGNOSIS[key],
      whatGoodLooksLike: meta.whatGoodLooksLike,
      drillQuestion: meta.drillQuestion,
    };
  });

  const readinessScore = Math.round(
    areas.reduce((a, b) => a + b.score, 0) / areas.length,
  );

  const headline =
    readinessScore >= 75
      ? "You're holding up well under pressure. A few areas still wobble on the follow-up, tighten these and you're interview-ready."
      : "You present nicely, but under follow-up the story doesn't yet prove ownership, impact, and judgement. Here's exactly where it cracked.";

  return {
    id: `ireport-${Date.now()}`,
    createdAt: new Date().toISOString(),
    attempt,
    input,
    readinessScore,
    readinessLabel: labelForScore(readinessScore),
    previousScore,
    headline,
    candidateLevel: `mid-level ${input.targetRole.toLowerCase()}`,
    areas: areas.sort((a, b) => a.score - b.score),
    transcript: turns,
  };
}

/** A pre-baked sample report for visitors who land on /report directly. */
export function sampleInterviewReport(): InterviewReport {
  const fakeTurns: InterviewTurn[] = INTERVIEW_QUESTIONS.map((q) => ({
    questionId: q.id,
    question: q.prompt,
    answer: "(sample answer)",
    durationSec: 40,
    score: { clarity: 6, specificity: 4, evidence: 4, ownership: 4, readiness: 52 },
  }));
  return buildInterviewReport(fakeTurns, 1, {
    targetRole: "Product Designer",
    portfolioUrl: "https://sample-portfolio.com",
  });
}

// ---------------------------------------------------------------------------
// Story bank seed
// ---------------------------------------------------------------------------

export const STORY_BANK_SEED: SavedAnswer[] = [
  {
    id: "story-1",
    storyType: "Impact",
    question: "Tell me about a project that moved a metric.",
    originalAnswer:
      "I redesigned the recurring payment flow and it improved things a lot for users.",
    improvedAnswer:
      "Cancellations were generating ~18% of our support tickets. I redesigned the self-serve pause/cancel flow; in the 6 weeks after launch those tickets dropped from 18% to 7% of volume. I can’t claim the design was the only factor, but the drop tracked exactly to the friction points we removed in testing.",
    savedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "story-2",
    storyType: "Craft",
    question: "Walk me through one design decision and why you made it.",
    originalAnswer: "We added a sticky CTA because it looked better.",
    improvedAnswer:
      "Users were comparing plan details across a long page and losing the next step. I chose a persistent sticky CTA over a fixed footer because the footer collided with iOS gesture areas in testing. It cost a sliver of content height, acceptable, since the comparison content was already scannable.",
    savedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];
