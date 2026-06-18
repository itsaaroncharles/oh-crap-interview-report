"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button, ButtonLink } from "@/components/ui";
import { ALL_AREA_KEYS, areaCard } from "@/lib/mockData";
import { scoreAnswer } from "@/lib/api";
import { addToStoryBank, isCurrentReportUnlocked } from "@/lib/store";
import type {
  AreaKey,
  PracticeMessage,
  PracticeScore,
  SavedAnswer,
  StoryType,
} from "@/lib/types";

type DrillCard = ReturnType<typeof areaCard>;

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-ink-faint">
          Setting up the room…
        </div>
      }
    >
      <PracticeRoom />
    </Suspense>
  );
}

function PracticeRoom() {
  const params = useSearchParams();
  const areaParam = params.get("area") ?? "ownership";
  const areaKey = (
    ALL_AREA_KEYS.includes(areaParam as AreaKey) ? areaParam : "ownership"
  ) as AreaKey;

  const [card, setCard] = useState<DrillCard | null>(null);
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [turn, setTurn] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [lastScore, setLastScore] = useState<PracticeScore | null>(null);
  const [locked, setLocked] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gate: practice rounds are part of the paid report.
  useEffect(() => {
    setLocked(!isCurrentReportUnlocked());
  }, []);

  // Resolve the area to drill (client-only), seed the opening question.
  useEffect(() => {
    const found = areaCard(areaKey);
    setCard(found);
    setMessages([
      { id: "open", role: "interviewer", content: found.drillQuestion },
    ]);
    setTurn(0);
    setLastScore(null);
  }, [areaKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  if (locked) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-ink-faint">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
            <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        <h1 className="font-display mt-5 text-2xl">Practice rounds are part of the full report</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Unlock your report to drill this area and re-take the interview for a
          higher score.
        </p>
        <ButtonLink href="/report" variant="dark" className="mt-6">
          Go to my report →
        </ButtonLink>
      </div>
    );
  }

  if (!card || locked === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-faint">
        Setting up the room…
      </div>
    );
  }

  async function send() {
    const answer = draft.trim();
    if (!answer || thinking) return;

    const myMsg: PracticeMessage = {
      id: `c-${Date.now()}`,
      role: "candidate",
      content: answer,
    };
    setMessages((m) => [...m, myMsg]);
    setDraft("");
    setThinking(true);

    try {
      const data = await scoreAnswer({ cardId: card!.key, turn, answer });

      // Attach score to the candidate message.
      setMessages((m) =>
        m.map((msg) =>
          msg.id === myMsg.id
            ? { ...msg, score: data.score, coaching: data.coaching }
            : msg,
        ),
      );
      setLastScore(data.score);

      setMessages((m) => [
        ...m,
        {
          id: `i-${Date.now()}`,
          role: "interviewer",
          content: data.followUp,
        },
      ]);
      setTurn((t) => t + 1);
    } finally {
      setThinking(false);
    }
  }

  const lastCandidate = [...messages]
    .reverse()
    .find((m) => m.role === "candidate" && m.score);

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---- Chat column ---- */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link
                href="/report"
                className="link-underline text-sm font-medium text-ink-faint"
              >
                ← Back to report
              </Link>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight">
                Practice room
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                Drilling: <span className="font-medium text-ink">{card.title}</span>
              </p>
            </div>
            <span className="rounded-pill bg-mist px-3 py-1.5 text-xs font-medium text-ink-soft">
              Turn {turn + 1}
            </span>
          </div>

          <div className="flex min-h-[420px] flex-1 flex-col rounded-3xl border border-line bg-paper">
            <div
              ref={scrollRef}
              className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-5 sm:p-6"
              style={{ maxHeight: "55vh" }}
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}
              </AnimatePresence>
              {thinking && <TypingBubble />}
            </div>

            <div className="border-t border-line p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  }}
                  placeholder="Answer the interviewer… (⌘/Ctrl + Enter to send)"
                  className="max-h-40 flex-1 resize-none rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/10"
                />
                <Button
                  onClick={send}
                  variant="dark"
                  disabled={!draft.trim() || thinking}
                  className="h-12"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Side panel ---- */}
        <aside className="space-y-4">
          <ScorePanel score={lastScore} />
          {lastCandidate?.coaching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-accent/30 bg-accent-soft p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Coach
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {lastCandidate.coaching}
              </p>
            </motion.div>
          )}

          <div className="rounded-3xl border border-line bg-paper p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Better answer angle
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {card.betterAnswerAngle}
            </p>
          </div>

          {lastCandidate && (
            <SaveAnswer
              question={card.drillQuestion}
              answer={lastCandidate.content}
            />
          )}
        </aside>
      </div>
    </section>
  );
}

function Bubble({ message }: { message: PracticeMessage }) {
  const isInterviewer = message.role === "interviewer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isInterviewer ? "" : "flex-row-reverse"}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isInterviewer ? "bg-ink text-signal" : "bg-accent text-white"
        }`}
      >
        {isInterviewer ? "HM" : "You"}
      </span>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isInterviewer
            ? "rounded-tl-sm bg-mist text-ink"
            : "rounded-tr-sm bg-accent text-white"
        }`}
      >
        {message.content}
        {message.score && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            <MiniStat label="Clarity" v={message.score.clarity} />
            <MiniStat label="Specificity" v={message.score.specificity} />
            <MiniStat label="Evidence" v={message.score.evidence} />
            <MiniStat label="Ownership" v={message.score.ownership} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MiniStat({ label, v }: { label: string; v: number }) {
  return (
    <span className="rounded-pill bg-white/20 px-2 py-0.5 text-[10px] font-medium">
      {label} {v}/10
    </span>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-signal">
        HM
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-mist px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-faint"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function ScorePanel({ score }: { score: PracticeScore | null }) {
  const rows: { label: string; v: number }[] = score
    ? [
        { label: "Clarity", v: score.clarity },
        { label: "Specificity", v: score.specificity },
        { label: "Evidence", v: score.evidence },
        { label: "Ownership", v: score.ownership },
      ]
    : [
        { label: "Clarity", v: 0 },
        { label: "Specificity", v: 0 },
        { label: "Evidence", v: 0 },
        { label: "Ownership", v: 0 },
      ];
  return (
    <div className="rounded-3xl border border-line bg-ink p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
          Interview readiness
        </p>
        <span className="font-display text-2xl font-semibold">
          {score ? `${score.readiness}%` : "·"}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-xs text-white/60">
              <span>{r.label}</span>
              <span>{score ? `${r.v}/10` : "·"}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full rounded-full bg-signal"
                initial={{ width: 0 }}
                animate={{ width: `${r.v * 10}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
      {!score && (
        <p className="mt-4 text-xs text-white/40">
          Answer the question to see your scores update.
        </p>
      )}
    </div>
  );
}

const STORY_TYPES: StoryType[] = [
  "Conflict",
  "Impact",
  "Leadership",
  "Failure",
  "Craft",
];

function SaveAnswer({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [improved, setImproved] = useState(answer);
  const [type, setType] = useState<StoryType>("Impact");
  const [saved, setSaved] = useState(false);

  // Keep the editable answer synced to the latest candidate message.
  useEffect(() => {
    setImproved(answer);
    setSaved(false);
  }, [answer]);

  function save() {
    const entry: SavedAnswer = {
      id: `story-${Date.now()}`,
      storyType: type,
      question,
      originalAnswer: answer,
      improvedAnswer: improved,
      savedAt: new Date().toISOString(),
    };
    addToStoryBank(entry);
    setSaved(true);
  }

  return (
    <div className="rounded-3xl border border-line bg-paper p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Save to Story Bank
      </p>
      <textarea
        rows={4}
        value={improved}
        onChange={(e) => {
          setImproved(e.target.value);
          setSaved(false);
        }}
        className="mt-2 w-full resize-none rounded-2xl border border-line bg-mist px-3 py-2.5 text-sm outline-none focus:border-accent focus:bg-paper"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STORY_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-pill px-3 py-1 text-xs font-medium transition ${
              type === t
                ? "bg-ink text-white"
                : "bg-mist text-ink-soft hover:bg-cloud"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <Button
        onClick={save}
        variant={saved ? "signal" : "primary"}
        className="mt-3 w-full"
        disabled={saved}
      >
        {saved ? "Saved ✓" : "Save answer"}
      </Button>
    </div>
  );
}
