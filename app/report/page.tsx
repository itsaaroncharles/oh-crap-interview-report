"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ButtonLink,
  Eyebrow,
  Reveal,
  SeverityPill,
  staggerContainer,
  staggerItem,
} from "@/components/ui";
import { labelForScore, sampleInterviewReport } from "@/lib/mockData";
import { loadInterviewReport } from "@/lib/store";
import type { ImprovementArea, InterviewReport, InterviewTurn } from "@/lib/types";

export default function ReportPage() {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    const stored = loadInterviewReport();
    if (stored) {
      setReport(stored);
    } else {
      setReport(sampleInterviewReport());
      setIsSample(true);
    }
  }, []);

  if (!report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-faint">
        Loading your report…
      </div>
    );
  }

  const delta =
    report.previousScore != null
      ? report.readinessScore - report.previousScore
      : null;

  return (
    <section className="px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {isSample && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
            <span className="text-accent">
              Sample report. Sit your own mock interview to see your real score.
            </span>
            <ButtonLink href="/upload" variant="primary" size="md">
              Start my interview →
            </ButtonLink>
          </div>
        )}

        <Reveal>
          <Eyebrow>
            Your Oh Crap Report · Attempt {report.attempt}
          </Eyebrow>
          <h1 className="font-display mt-4 text-4xl tracking-tight sm:text-5xl">
            Here&apos;s where it cracked.
          </h1>
        </Reveal>

        {/* Score + headline */}
        <Reveal delay={0.08} className="mt-8">
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <ScoreDial report={report} delta={delta} />
            <div className="rounded-3xl border border-line bg-paper p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                The verdict
              </p>
              <p className="font-display mt-3 text-xl leading-snug sm:text-2xl">
                {report.headline}
              </p>
              {delta != null && (
                <div
                  className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium ${
                    delta >= 0
                      ? "bg-[#e2ecdd] text-[#3f6b3f]"
                      : "bg-[#f6e0da] text-danger"
                  }`}
                >
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} points{" "}
                  {delta >= 0 ? "up" : "down"} from your last attempt (
                  {report.previousScore})
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Improvement areas */}
        <div className="mt-14">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight">
              What to work on
            </h2>
            <p className="mt-2 text-ink-soft">
              Ranked weakest first, each tied to what the AI saw in your résumé
              and portfolio. Drill one, then re-take the interview.
            </p>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-6 space-y-4"
          >
            {report.areas.map((area, i) => (
              <AreaCard key={area.key} area={area} index={i + 1} />
            ))}
          </motion.div>
        </div>

        {/* Transcript */}
        {!isSample && report.transcript.length > 0 && (
          <div className="mt-14">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight">
                Your transcript
              </h2>
            </Reveal>
            <div className="mt-6 space-y-3">
              {report.transcript.map((t, i) => (
                <Reveal key={i}>
                  <TranscriptRow turn={t} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Retake CTA */}
        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-cream grain grain-dark sm:p-12">
            <div className="mesh-ink pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                Drilled a few areas? Prove it.
              </h2>
              <p className="mt-3 max-w-lg text-cream/70">
                Re-take the interview and watch your score move. Most people jump
                10 to 20 points on their second run once the story tightens.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/interview" variant="primary" size="lg">
                  Take the interview again →
                </ButtonLink>
                <ButtonLink href="/story-bank" variant="signal" size="lg">
                  View Story Bank
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ScoreDial({
  report,
  delta,
}: {
  report: InterviewReport;
  delta: number | null;
}) {
  const score = report.readinessScore;
  const color =
    score >= 75 ? "#5a8c5a" : score >= 60 ? "#c98a2b" : "#c0492f";
  const c = 2 * Math.PI * 52;
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-ink p-6 text-center text-cream grain grain-dark">
      <div className="mesh-ink pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl">{score}</span>
          <span className="text-xs text-cream/50">/ 100</span>
        </div>
      </div>
      <span
        className="relative mt-4 rounded-pill px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${color}33`, color: "#f3efe6" }}
      >
        {report.readinessLabel} · {meaning(score)}
      </span>
      {delta != null && (
        <span className="relative mt-2 text-xs text-cream/60">
          {delta >= 0 ? "+" : ""}
          {delta} vs attempt {report.attempt - 1}
        </span>
      )}
    </div>
  );
}

function meaning(score: number) {
  return {
    Strong: "interview-ready",
    Good: "needs polishing",
    Risky: "struggles under follow-up",
    Weak: "major gaps in the story",
    Unclear: "not enough evidence",
  }[labelForScore(score)];
}

function AreaCard({ area, index }: { area: ImprovementArea; index: number }) {
  const [open, setOpen] = useState(false);
  const color =
    area.score >= 72 ? "bg-good" : area.score >= 55 ? "bg-warn" : "bg-danger";
  return (
    <motion.div
      variants={staggerItem}
      className="overflow-hidden rounded-3xl border border-line bg-paper"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-mist"
      >
        <span className="font-display hidden text-2xl text-cloud sm:block">
          {index}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityPill severity={area.severity} />
            <span className="text-xs text-ink-faint">{area.score}/100</span>
          </div>
          <h3 className="mt-2 text-base font-semibold sm:text-lg">
            {area.title}
          </h3>
          <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-cloud">
            <motion.span
              className={`block h-full rounded-full ${color}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${area.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-lg"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-4 border-t border-line p-5 sm:px-6">
              <Detail label="What the AI saw in your materials" tone="ink">
                {area.diagnosis}
              </Detail>
              <Detail label="What good looks like" tone="accent">
                {area.whatGoodLooksLike}
              </Detail>
              <ButtonLink href={`/practice?area=${area.key}`} variant="dark">
                Start practice round →
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Detail({
  label,
  children,
  tone = "soft",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "soft" | "ink" | "accent";
}) {
  const c = { soft: "text-ink-faint", ink: "text-ink", accent: "text-accent" }[tone];
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${c}`}>
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

function TranscriptRow({ turn }: { turn: InterviewTurn }) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-5">
      <p className="text-sm font-medium text-ink">“{turn.question}”</p>
      <p className="mt-2 text-sm italic text-ink-soft">
        {turn.answer}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3 text-xs">
        <Chip>Clarity {turn.score.clarity}/10</Chip>
        <Chip>Evidence {turn.score.evidence}/10</Chip>
        <Chip>Ownership {turn.score.ownership}/10</Chip>
        <Chip>{turn.durationSec}s</Chip>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill bg-mist px-2.5 py-1 font-medium text-ink-soft">
      {children}
    </span>
  );
}
