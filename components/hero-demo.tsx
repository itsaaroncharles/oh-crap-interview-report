"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Animated, looping preview of the spoken mock interview for the hero.
// It plays a multi-turn CONVERSATION: the interviewer asks, you "speak"
// (waveform + live word-by-word transcription), they follow up, you answer
// again, three exchanges that accumulate and scroll like a real chat, then
// gently reset and loop. Fixed height + docked composer, so nothing reflows.

type Turn = { role: "HM" | "You"; text: string };

const CONVERSATIONS: Turn[][] = [
  [
    { role: "HM", text: "Within that project, what were the parts you personally drove?" },
    { role: "You", text: "I owned the information architecture and the journey mapping, and I ran the usability sessions that reframed the flow." },
    { role: "HM", text: "Got it. And when the team disagreed on a direction, how did you handle that?" },
    { role: "You", text: "I mapped each option against the top user task, then walked engineering through the trade-offs until we aligned." },
    { role: "HM", text: "Nice. So how did you know the redesign was actually working?" },
    { role: "You", text: "Completion went from 62% to 81% over six weeks, and the lift tracked the exact friction we'd removed in testing." },
  ],
  [
    { role: "HM", text: "Tell me about a time a project didn't go the way you hoped." },
    { role: "You", text: "My first checkout redesign shipped late because I designed for the happy path and missed the refund edge cases." },
    { role: "HM", text: "What did you take away from that?" },
    { role: "You", text: "Now I pull engineering into edge-case mapping on day one, it's cheaper to find the hard states early than after handoff." },
    { role: "HM", text: "And if you ran it again today?" },
    { role: "You", text: "I'd prototype the error states first, since that's where the real complexity and the real user anxiety actually live." },
  ],
];

// Pacing of the looping demo (slowed ~20% for a calmer read).
const REVEAL_MS = 114; // per word
const HM_HOLD = 2040; // reading beat after a question
const YOU_HOLD = 1320; // beat after an answer finishes
const RESET_HOLD = 1800;

export function HeroInterviewDemo() {
  const [convo, setConvo] = useState(0);
  const [step, setStep] = useState(0); // index of the turn currently playing
  const [revealed, setRevealed] = useState(0); // words shown for active You turn
  const [seconds, setSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = CONVERSATIONS[convo];
  const finished = step >= thread.length;
  const current = finished ? null : thread[step];
  const answering = current?.role === "You";

  // Drive the conversation forward.
  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => {
        setConvo((c) => (c + 1) % CONVERSATIONS.length);
        setStep(0);
        setRevealed(0);
        setSeconds(0);
      }, RESET_HOLD);
      return () => clearTimeout(t);
    }

    const turn = thread[step];
    if (turn.role === "HM") {
      const hold = Math.max(HM_HOLD, turn.text.split(" ").length * 132);
      const t = setTimeout(() => setStep((s) => s + 1), hold);
      return () => clearTimeout(t);
    }

    // You turn: reveal words, then advance.
    setRevealed(0);
    const words = turn.text.split(" ").length;
    const reveal = setInterval(() => {
      setRevealed((r) => {
        if (r >= words) {
          clearInterval(reveal);
          return r;
        }
        return r + 1;
      });
    }, REVEAL_MS);
    const t = setTimeout(() => setStep((s) => s + 1), words * REVEAL_MS + YOU_HOLD);
    return () => {
      clearInterval(reveal);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convo, step]);

  // Continuous session timer while a conversation is running.
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [convo, finished]);

  // Auto-scroll to the latest turn.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [step, revealed]);

  const shown = thread.slice(0, Math.min(step + 1, thread.length));
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line bg-paper shadow-[0_50px_120px_-50px_rgba(32,32,28,0.4)]">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-mist px-5 py-3.5">
        <Orb active={!answering} size={14} />
        <span className="text-sm font-medium">Mock interview</span>
        <span className="ml-auto text-xs text-ink-faint">Attempt 1</span>
      </div>

      {/* transcript, fixed height, scrolls, bottom-aligned.
          The whole thread crossfades on loop (keyed by convo) so bubbles never
          drift out of the card; within a thread, new turns animate in. */}
      <div
        ref={scrollRef}
        className="no-scrollbar relative h-[252px] overflow-hidden px-5 pt-5 sm:px-7"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={convo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-3"
          >
            {shown.map((turn, i) => {
              const isActiveYou = i === step && turn.role === "You";
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-3 ${turn.role === "You" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar who={turn.role} />
                  {turn.role === "HM" ? (
                    <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-mist px-4 py-3 text-sm leading-relaxed text-ink">
                      {turn.text}
                    </p>
                  ) : (
                    <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 text-sm leading-relaxed text-white">
                      {isActiveYou ? <Reveal text={turn.text} count={revealed} /> : turn.text}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* docked composer */}
      <div className="px-5 pb-5 pt-3 sm:px-7">
        <div className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
          <span className="flex shrink-0 items-center gap-2 text-xs font-medium">
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{ background: answering ? "#c0492f" : "#8c887b" }}
              animate={answering ? { opacity: [1, 0.25, 1] } : { opacity: 0.5 }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
            <span className={answering ? "text-accent" : "text-ink-faint"}>
              {answering ? "Recording" : "Listening for the question…"}
            </span>
          </span>

          <Waveform active={answering} />

          <span
            className={`shrink-0 font-mono text-xs tabular-nums ${
              answering ? "text-accent" : "text-ink-faint/50"
            }`}
          >
            {mm}:{ss}
          </span>
        </div>
      </div>
    </div>
  );
}

function Reveal({ text, count }: { text: string; count: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={i}
          animate={{ opacity: i < count ? 1 : 0.28 }}
          transition={{ duration: 0.3 }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </>
  );
}

// Calm travelling-wave equaliser with a sine envelope (taller in the middle).
const BAR_COUNT = 44;
const ENVELOPE = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  return 0.4 + 0.6 * Math.sin(Math.PI * t);
});

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-7 flex-1 items-center justify-center gap-[3px] overflow-hidden">
      {ENVELOPE.map((env, i) => (
        <motion.span
          key={i}
          className="block w-[2.5px] rounded-full bg-accent/60"
          style={{ height: "100%", originY: 0.5 }}
          animate={
            active
              ? { scaleY: [0.18 * env, env, 0.32 * env, 0.85 * env, 0.18 * env] }
              : { scaleY: 0.12 }
          }
          transition={
            active
              ? {
                  duration: 1.1,
                  delay: i * 0.035,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </span>
  );
}

function Avatar({ who }: { who: "HM" | "You" }) {
  const isHM = who === "HM";
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        isHM ? "bg-ink text-cream" : "bg-accent text-white"
      }`}
    >
      {who}
    </span>
  );
}

function Orb({ active, size }: { active: boolean; size: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #e9b9a6, #c15f3c 60%, #a64e30)",
        }}
        animate={active ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
      />
    </span>
  );
}
