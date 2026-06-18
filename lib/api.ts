"use client";

// Client-side stand-in for the mock API. The app is statically exported (for
// GitHub Pages), which can't run server route handlers, so the mock logic runs
// in the browser here. The shapes match what the old /api routes returned.
//
// When you move to a server host (e.g. Vercel) and wire in Gemini, swap these
// two functions to `fetch()` real endpoints — the call sites won't change.

import {
  buildInterviewReport,
  mockCoaching,
  mockFollowUp,
  mockScoreAnswer,
} from "./mockData";
import type {
  AuditInput,
  InterviewReport,
  InterviewTurn,
  PracticeScore,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scoreAnswer(args: {
  cardId: string;
  turn: number;
  answer: string;
}): Promise<{ score: PracticeScore; coaching: string; followUp: string }> {
  await delay(700);
  const score = mockScoreAnswer(args.answer);
  return {
    score,
    coaching: mockCoaching(score),
    followUp: mockFollowUp(args.cardId, args.turn),
  };
}

export async function generateReport(args: {
  turns: InterviewTurn[];
  attempt: number;
  input: AuditInput;
  previousScore?: number;
}): Promise<InterviewReport> {
  await delay(1100);
  return buildInterviewReport(
    args.turns ?? [],
    args.attempt ?? 1,
    args.input ?? { targetRole: "Product Designer" },
    args.previousScore,
  );
}
