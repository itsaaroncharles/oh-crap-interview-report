import { NextResponse } from "next/server";
import { mockCoaching, mockFollowUp, mockScoreAnswer } from "@/lib/mockData";

// POST /api/practice
// Body: { cardId, turn, answer }
// Returns a score for the answer, coaching, and the interviewer's next
// follow-up. Later: replace with a Gemini "interviewer + judge" call.
export async function POST(req: Request) {
  const { cardId, turn, answer } = (await req.json()) as {
    cardId: string;
    turn: number;
    answer: string;
  };

  if (!answer?.trim()) {
    return NextResponse.json({ error: "answer required" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 700));

  const score = mockScoreAnswer(answer);
  const coaching = mockCoaching(score);
  const followUp = mockFollowUp(cardId, turn);

  return NextResponse.json({ score, coaching, followUp });
}
