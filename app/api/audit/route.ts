import { NextResponse } from "next/server";
import { buildMockReport } from "@/lib/mockData";
import type { AuditInput } from "@/lib/types";

// POST /api/audit
// Today: returns a deterministic mock Oh Crap Report after a short delay so the
// "analyzing" screen feels real. Later: extract text + call Gemini here and
// return the same AuditReport shape.
export async function POST(req: Request) {
  let input: AuditInput;
  try {
    input = (await req.json()) as AuditInput;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!input?.targetRole) {
    return NextResponse.json(
      { error: "targetRole is required" },
      { status: 400 },
    );
  }

  // Simulate model latency.
  await new Promise((r) => setTimeout(r, 1200));

  const report = buildMockReport(input);
  return NextResponse.json(report);
}
