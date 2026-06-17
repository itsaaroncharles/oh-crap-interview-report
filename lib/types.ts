// Shared domain types for Portfolio Pressure Test.
// These match the shape the mock API returns today and the Gemini API will return later.

export type Severity = "high" | "medium" | "low";

export type TargetRole =
  | "UX Designer"
  | "Product Designer"
  | "Senior Product Designer"
  | "UX Researcher";

export interface AuditInput {
  targetRole: TargetRole;
  portfolioUrl?: string;
  portfolioFileName?: string;
  resumeFileName?: string;
  targetCompany?: string;
  jobDescription?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  detectedRole: string;
  detectedImpact: string;
  scores: ScoreBreakdown;
}

export interface ScoreBreakdown {
  problemClarity: number;
  userEvidence: number;
  ownership: number;
  rationale: number;
  tradeoffs: number;
  impact: number;
  reflection: number;
}

export interface AuditCard {
  id: string;
  index: number;
  title: string;
  severity: Severity;
  caseStudyTitle: string;
  interviewerConcern: string;
  whyItMatters: string;
  likelyQuestion: string;
  betterAnswerAngle: string;
}

export type ReadinessLabel =
  | "Strong"
  | "Good"
  | "Risky"
  | "Weak"
  | "Unclear";

export interface AuditReport {
  id: string;
  createdAt: string;
  input: AuditInput;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  mainRisk: string;
  topRisks: string[];
  strongestCaseStudy: string;
  weakestCaseStudy: string;
  candidateLevel: string;
  caseStudies: CaseStudy[];
  cards: AuditCard[];
}

// ---- Practice room ----

export interface PracticeScore {
  clarity: number;
  specificity: number;
  evidence: number;
  ownership: number;
  readiness: number;
}

export type ChatRole = "interviewer" | "candidate";

export interface PracticeMessage {
  id: string;
  role: ChatRole;
  content: string;
  score?: PracticeScore;
  coaching?: string;
}

// ---- Mock interview ----

export interface InterviewQuestion {
  id: string;
  /** Which improvement dimension this probes. */
  area: AreaKey;
  prompt: string;
  /** Spoken aloud intro for the interviewer voice (optional flavour). */
  spoken?: string;
}

export interface InterviewTurn {
  questionId: string;
  question: string;
  answer: string;
  durationSec: number;
  score: PracticeScore;
}

export interface InterviewSession {
  id: string;
  attempt: number;
  startedAt: string;
  turns: InterviewTurn[];
}

// ---- Improvement areas (what to work on) ----

export type AreaKey =
  | "ownership"
  | "impact"
  | "tradeoffs"
  | "rationale"
  | "research"
  | "reflection";

export interface ImprovementArea {
  key: AreaKey;
  title: string;
  score: number; // 0-100
  severity: Severity;
  diagnosis: string; // tied to resume/portfolio
  whatGoodLooksLike: string;
  drillQuestion: string;
}

export interface InterviewReport {
  id: string;
  createdAt: string;
  attempt: number;
  input: AuditInput;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  previousScore?: number;
  headline: string;
  candidateLevel: string;
  areas: ImprovementArea[];
  transcript: InterviewTurn[];
}

// ---- Story bank ----

export type StoryType =
  | "Conflict"
  | "Impact"
  | "Leadership"
  | "Failure"
  | "Craft";

export interface SavedAnswer {
  id: string;
  storyType: StoryType;
  question: string;
  originalAnswer: string;
  improvedAnswer: string;
  savedAt: string;
}
