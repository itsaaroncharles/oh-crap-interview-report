import { NextResponse } from "next/server";
import { buildInterviewReport } from "@/lib/mockData";
import type { AuditInput, InterviewTurn } from "@/lib/types";

// POST /api/interview-report
// Body: { turns, attempt, input, previousScore }
// Today: aggregates the per-answer scores into an Oh Crap report (with a small
// retake boost so practising pays off). Later: send the transcript + the
// candidate's resume/portfolio to Gemini and return the same InterviewReport.
export async function POST(req: Request) {
  const { turns, attempt, input, previousScore } = (await req.json()) as {
    turns: InterviewTurn[];
    attempt: number;
    input: AuditInput;
    previousScore?: number;
  };

  await new Promise((r) => setTimeout(r, 1100));

  const report = buildInterviewReport(
    turns ?? [],
    attempt ?? 1,
    input ?? { targetRole: "Product Designer" },
    previousScore,
  );
  return NextResponse.json(report);
}
