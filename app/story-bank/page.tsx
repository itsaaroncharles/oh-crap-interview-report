"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { loadStoryBank } from "@/lib/store";
import type { SavedAnswer, StoryType } from "@/lib/types";

const TYPES: { type: StoryType; example: string }[] = [
  { type: "Conflict", example: "Tell me about a stakeholder disagreement." },
  { type: "Impact", example: "Tell me about a project that moved a metric." },
  { type: "Leadership", example: "Tell me about influencing without authority." },
  { type: "Failure", example: "Tell me about something that didn’t work." },
  { type: "Craft", example: "Walk me through a design decision." },
];

export default function StoryBankPage() {
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [filter, setFilter] = useState<StoryType | "All">("All");

  useEffect(() => {
    setAnswers(loadStoryBank());
  }, []);

  const visible =
    filter === "All" ? answers : answers.filter((a) => a.storyType === filter);

  const countFor = (t: StoryType) =>
    answers.filter((a) => a.storyType === t).length;

  return (
    <section className="px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Story Bank</Eyebrow>
            <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your interview-ready answers.
            </h1>
            <p className="mt-2 max-w-xl text-ink-soft">
              The stronger version of every answer you&apos;ve drilled, sorted
              by story type, ready for recruiter screens and onsites.
            </p>
          </div>
          <ButtonLink href="/report" variant="dark">
            Drill more questions →
          </ButtonLink>
        </div>

        {/* Type overview */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() =>
                setFilter((f) => (f === t.type ? "All" : t.type))
              }
              className={`rounded-2xl border p-3 text-left transition ${
                filter === t.type
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-paper hover:border-ink/30"
              }`}
            >
              <span className="text-xs font-semibold">{t.type}</span>
              <span className="mt-1 block text-xs text-ink-faint">
                {countFor(t.type)} saved
              </span>
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="mt-6 flex items-center gap-2 text-sm">
          <span className="text-ink-faint">Showing:</span>
          <button
            onClick={() => setFilter("All")}
            className={`rounded-pill px-3 py-1 font-medium ${
              filter === "All" ? "bg-ink text-white" : "bg-mist text-ink-soft"
            }`}
          >
            All ({answers.length})
          </button>
          {filter !== "All" && (
            <button
              onClick={() => setFilter("All")}
              className="link-underline text-ink-faint"
            >
              clear filter
            </button>
          )}
        </div>

        {/* List */}
        <div className="mt-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {visible.length === 0 ? (
              <EmptyState />
            ) : (
              visible.map((a) => <AnswerCard key={a.id} a={a} />)
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function AnswerCard({ a }: { a: SavedAnswer }) {
  const [showOriginal, setShowOriginal] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-3xl border border-line bg-paper p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-pill bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          {a.storyType}
        </span>
        <span className="text-xs text-ink-faint">
          {new Date(a.savedAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold">“{a.question}”</h3>

      <div className="mt-4 rounded-2xl bg-[#e7f7ef] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a734d]">
          Improved answer
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {a.improvedAnswer}
        </p>
      </div>

      <button
        onClick={() => setShowOriginal((s) => !s)}
        className="link-underline mt-3 text-xs font-medium text-ink-faint"
      >
        {showOriginal ? "Hide" : "Show"} original answer
      </button>
      <AnimatePresence>
        {showOriginal && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 overflow-hidden rounded-2xl bg-mist p-4 text-sm italic text-ink-soft"
          >
            {a.originalAnswer}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl border border-dashed border-line bg-mist p-10 text-center"
    >
      <p className="text-ink-soft">Nothing saved here yet.</p>
      <p className="mt-1 text-sm text-ink-faint">
        Drill a question in the practice room, then save the stronger answer.
      </p>
      <ButtonLink href="/report" variant="dark" className="mt-5">
        Go to your report →
      </ButtonLink>
    </motion.div>
  );
}
