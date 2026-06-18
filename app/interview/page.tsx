"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui";
import { INTERVIEW_QUESTIONS } from "@/lib/mockData";
import { generateReport, scoreAnswer } from "@/lib/api";
import { useDictation, useTTS } from "@/lib/useSpeech";
import {
  commitAttempt,
  loadInput,
  loadLastScore,
  nextAttempt,
  saveInterviewReport,
  saveLastScore,
} from "@/lib/store";
import type { InterviewTurn, PracticeScore } from "@/lib/types";

const GRACE_SEC = 5;
const ANSWER_SEC = 90;
const QUESTIONS = INTERVIEW_QUESTIONS;

type Phase = "lobby" | "asking" | "grace" | "answering" | "scoring" | "finishing";

interface Bubble {
  id: string;
  role: "interviewer" | "candidate";
  text: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const tts = useTTS();
  const dictation = useDictation();

  const [phase, setPhase] = useState<Phase>("lobby");
  const [qi, setQi] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [remaining, setRemaining] = useState(GRACE_SEC);
  const [muted, setMuted] = useState(false);
  const [attempt, setAttempt] = useState(1);

  const draftRef = useRef("");
  const turnsRef = useRef<InterviewTurn[]>([]);
  const answerStartRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(false);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    setAttempt(nextAttempt());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [bubbles, phase]);

  const current = QUESTIONS[qi];

  // ---- submit the current answer, score it, advance ----
  const submitAnswer = useCallback(async () => {
    dictation.stop();
    tts.stop();
    const answer = draftRef.current.trim();
    const q = QUESTIONS[qi];
    const durationSec = Math.round((Date.now() - answerStartRef.current) / 1000);
    setPhase("scoring");

    let score: PracticeScore = {
      clarity: 2,
      specificity: 2,
      evidence: 2,
      ownership: 2,
      readiness: 20,
    };
    if (answer) {
      try {
        const data = await scoreAnswer({ cardId: q.area, turn: qi, answer });
        score = data.score;
      } catch {
        /* keep fallback score */
      }
    }

    turnsRef.current.push({
      questionId: q.id,
      question: q.prompt,
      answer: answer || "(no answer given)",
      durationSec,
      score,
    });

    // Note: the score is kept in turnsRef for the report only, we deliberately
    // do NOT surface it on the bubble. A real interviewer doesn't flash a
    // scorecard at you mid-answer.
    setBubbles((b) =>
      b.map((x) =>
        x.id === `q-${qi}-ans` ? { ...x, text: answer || "(skipped)" } : x,
      ),
    );

    setDraft("");
    dictation.set("");

    if (qi + 1 < QUESTIONS.length) {
      setQi((i) => i + 1);
      setPhase("asking");
    } else {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, dictation, tts]);

  const submitRef = useRef(submitAnswer);
  useEffect(() => {
    submitRef.current = submitAnswer;
  }, [submitAnswer]);

  // ---- finish: build the report ----
  async function finish() {
    setPhase("finishing");
    const input = loadInput() ?? { targetRole: "Product Designer" as const };
    const prev = loadLastScore() ?? undefined;
    const a = nextAttempt();
    try {
      const report = await generateReport({
        turns: turnsRef.current,
        attempt: a,
        input,
        previousScore: prev,
      });
      saveInterviewReport(report);
      commitAttempt(a);
      saveLastScore(report.readinessScore);
    } catch {
      /* noop */
    }
    router.push("/report");
  }

  // ---- ASKING: add the question bubble + speak it ----
  useEffect(() => {
    if (phase !== "asking" || !current) return;
    setBubbles((b) => [
      ...b,
      { id: `q-${qi}`, role: "interviewer", text: current.prompt },
      { id: `q-${qi}-ans`, role: "candidate", text: "" },
    ]);

    // Guard so we advance to "grace" exactly once, whether that's triggered by
    // the voice finishing, the muted/unsupported short delay, or a safety net
    // for browsers that expose speechSynthesis but never fire `onend`.
    let advanced = false;
    const toGrace = () => {
      if (advanced) return;
      advanced = true;
      clearTimeout(safety);
      setRemaining(GRACE_SEC);
      setPhase("grace");
    };
    const spoken = `${current.spoken ? current.spoken + " " : ""}${current.prompt}`;
    const estimate = Math.min(2500 + spoken.length * 55, 14000);
    const safety = setTimeout(toGrace, estimate);

    if (mutedRef.current || !tts.supported) {
      clearTimeout(safety);
      const t = setTimeout(toGrace, 900);
      return () => {
        clearTimeout(t);
        clearTimeout(safety);
      };
    }
    tts.speak(spoken, toGrace);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qi]);

  // ---- GRACE countdown ----
  useEffect(() => {
    if (phase !== "grace") return;
    if (remaining <= 0) {
      answerStartRef.current = Date.now();
      setRemaining(ANSWER_SEC);
      if (dictation.supported) dictation.start("");
      setPhase("answering");
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining]);

  // ---- ANSWER countdown ----
  useEffect(() => {
    if (phase !== "answering") return;
    if (remaining <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining]);

  // ---- mirror live dictation into the draft while listening ----
  useEffect(() => {
    if (phase === "answering" && dictation.listening) {
      setDraft(dictation.transcript);
    }
  }, [dictation.transcript, dictation.listening, phase]);

  function begin() {
    turnsRef.current = [];
    setBubbles([]);
    setQi(0);
    setPhase("asking");
  }

  // -------------------- LOBBY --------------------
  if (phase === "lobby") {
    return <Lobby attempt={attempt} muted={muted} setMuted={setMuted} onBegin={begin} ttsSupported={tts.supported} micSupported={dictation.supported} />;
  }

  // -------------------- FINISHING --------------------
  if (phase === "finishing") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <SpeakingOrb active size={92} />
        <p className="font-display text-2xl">Scoring your interview…</p>
        <p className="text-ink-soft">Reading the transcript against your résumé and portfolio.</p>
      </div>
    );
  }

  const total = QUESTIONS.length;

  // -------------------- INTERVIEW --------------------
  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-pill bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft ring-1 ring-line">
              Attempt {attempt}
            </span>
            <div className="flex items-center gap-1.5">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < qi
                      ? "w-4 bg-good"
                      : i === qi
                        ? "w-6 bg-accent"
                        : "w-4 bg-cloud"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMuted((m) => !m);
                if (!muted) tts.stop();
              }}
              className="flex h-9 items-center gap-1.5 rounded-pill bg-paper px-3 text-xs font-medium text-ink-soft ring-1 ring-line hover:bg-mist"
              title="Toggle interviewer voice"
            >
              {muted ? "🔇 Voice off" : "🔊 Voice on"}
            </button>
            <button
              onClick={() => finish()}
              className="flex h-9 items-center rounded-pill bg-paper px-3 text-xs font-medium text-ink-soft ring-1 ring-line hover:bg-mist"
            >
              End &amp; score
            </button>
          </div>
        </div>

        {/* Transcript */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex-1 space-y-4 overflow-y-auto rounded-3xl border border-line bg-paper/60 p-4 backdrop-blur sm:p-6"
        >
          {/* Speaking orb header */}
          <div className="flex items-center gap-3 pb-2">
            <SpeakingOrb active={tts.speaking || phase === "asking"} size={44} />
            <div>
              <p className="text-sm font-medium">Your interviewer</p>
              <p className="text-xs text-ink-faint">
                {phase === "asking"
                  ? "Speaking…"
                  : phase === "grace"
                    ? "Waiting for you"
                    : phase === "answering"
                      ? dictation.listening
                        ? "Listening to your answer"
                        : "Your turn"
                      : "Reviewing"}
              </p>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {bubbles
              .filter((b) => b.role === "interviewer" || b.text)
              .map((b) => (
                <ChatBubble key={b.id} bubble={b} />
              ))}
          </AnimatePresence>

          {phase === "scoring" && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-cream">
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
          )}
        </div>

        {/* Composer */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {phase === "grace" ? (
              <motion.div
                key="grace"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-center gap-4 rounded-3xl border border-accent/30 bg-accent-soft py-6"
              >
                <span className="font-display text-5xl text-accent">
                  {remaining}
                </span>
                <p className="text-sm font-medium text-ink">
                  Get ready… your answer window opens in a moment.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-line bg-paper p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs">
                    {dictation.supported ? (
                      <span className="flex items-center gap-1.5 font-medium text-accent">
                        <motion.span
                          className="h-2 w-2 rounded-full bg-danger"
                          animate={
                            dictation.listening
                              ? { opacity: [1, 0.3, 1] }
                              : { opacity: 0.3 }
                          }
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        {dictation.listening ? "Recording, just talk" : "Mic ready"}
                      </span>
                    ) : (
                      <span className="text-ink-faint">
                        Mic not supported here, type your answer
                      </span>
                    )}
                  </div>
                  <CountdownPill seconds={remaining} active={phase === "answering"} />
                </div>
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    dictation.set(e.target.value);
                  }}
                  disabled={phase !== "answering"}
                  placeholder={
                    phase === "answering"
                      ? "Speak now, or type your answer here…"
                      : "…"
                  }
                  className="w-full resize-none rounded-2xl bg-mist px-4 py-3 text-sm outline-none transition focus:bg-paper focus:ring-2 focus:ring-accent/20"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      dictation.stop();
                      submitRef.current();
                    }}
                    className="text-xs font-medium text-ink-faint hover:text-ink"
                  >
                    Skip question
                  </button>
                  <Button
                    onClick={() => {
                      dictation.stop();
                      submitRef.current();
                    }}
                    variant="dark"
                    disabled={phase !== "answering"}
                  >
                    Done answering →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------

function Lobby({
  attempt,
  muted,
  setMuted,
  onBegin,
  ttsSupported,
  micSupported,
}: {
  attempt: number;
  muted: boolean;
  setMuted: (f: (m: boolean) => boolean) => void;
  onBegin: () => void;
  ttsSupported: boolean;
  micSupported: boolean;
}) {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:py-24">
      <div className="mesh-soft pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-xl text-center">
        <SpeakingOrb active size={110} className="mx-auto" />
        <h1 className="font-display mt-8 text-4xl sm:text-5xl">
          {attempt > 1 ? "Round " + attempt + ". Let's beat your last score." : "Your mock interview"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          {QUESTIONS.length} questions. Your interviewer speaks each one aloud, you&apos;ll get a {GRACE_SEC}-second beat to think, then your answer
          window opens and we listen. Talk like it&apos;s the real thing.
        </p>

        <div className="mt-8 space-y-3 rounded-3xl border border-line bg-paper p-5 text-left text-sm">
          <Row ok={ttsSupported} label="Interviewer voice" detail={ttsSupported ? "Ready" : "Not available, questions show as text"} />
          <Row ok={micSupported} label="Answer by microphone" detail={micSupported ? "Ready (allow mic access when asked)" : "Not in this browser, you can type instead"} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-pill bg-paper px-4 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line hover:bg-mist"
          >
            {muted ? "🔇 Voice off" : "🔊 Voice on"}
          </button>
          <Button onClick={onBegin} variant="dark" size="lg">
            Begin interview →
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Best with headphones, in a quiet room. You can end and score anytime.
        </p>
      </div>
    </section>
  );
}

function Row({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
          ok ? "bg-good text-white" : "bg-cloud text-ink-faint"
        }`}
      >
        {ok ? "✓" : "!"}
      </span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs text-ink-faint">{detail}</span>
    </div>
  );
}

function ChatBubble({ bubble }: { bubble: Bubble }) {
  const isInterviewer = bubble.role === "interviewer";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isInterviewer ? "" : "flex-row-reverse"}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isInterviewer ? "bg-ink text-cream" : "bg-accent text-white"
        }`}
      >
        {isInterviewer ? "HM" : "You"}
      </span>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isInterviewer
            ? "rounded-tl-sm bg-mist text-ink"
            : "rounded-tr-sm bg-accent text-white"
        }`}
      >
        {bubble.text}
      </div>
    </motion.div>
  );
}

function CountdownPill({ seconds, active }: { seconds: number; active: boolean }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const low = seconds <= 15;
  return (
    <span
      className={`rounded-pill px-2.5 py-1 text-xs font-semibold tabular-nums ${
        low && active ? "bg-[#f6e0da] text-danger" : "bg-mist text-ink-soft"
      }`}
    >
      ⏱ {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

function SpeakingOrb({
  active,
  size = 64,
  className = "",
}: {
  active: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #e9b9a6, #c15f3c 60%, #a64e30)",
        }}
        animate={
          active
            ? { scale: [1, 1.07, 1], opacity: [0.92, 1, 0.92] }
            : { scale: 1, opacity: 0.85 }
        }
        transition={{ duration: 1.6, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      />
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full ring-2 ring-accent/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
