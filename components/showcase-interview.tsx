"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Animated focal card for the "mock interview" section: the interviewer speaks
// a question (orb pulses with an expanding ring), then it flips to a recording
// state with a live waveform + ticking timer, cycling through a few questions.

const QUESTIONS = [
  "What part of this project would not have happened without you?",
  "How did you know the redesign was actually working?",
  "What was the hardest trade-off you had to make, and why?",
];

type Phase = "speaking" | "recording";

export function ShowcaseInterview() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("speaking");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase === "speaking") {
      setSeconds(0);
      const t = setTimeout(() => setPhase("recording"), 2400);
      return () => clearTimeout(t);
    }
    // recording
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const next = setTimeout(() => {
      setIdx((i) => (i + 1) % QUESTIONS.length);
      setPhase("speaking");
    }, 4200);
    return () => {
      clearInterval(tick);
      clearTimeout(next);
    };
  }, [phase, idx]);

  const speaking = phase === "speaking";
  const ss = seconds.toString().padStart(2, "0");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper p-7 text-center grain">
      <div className="mesh-soft pointer-events-none absolute inset-0 opacity-80" />
      <div className="relative flex min-h-[300px] flex-col items-center">
        {/* orb */}
        <div className="relative mx-auto h-24 w-24">
          {speaking && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full ring-2 ring-accent/40"
                animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full ring-2 ring-accent/30"
                animate={{ scale: [1, 1.55], opacity: [0.4, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut", delay: 0.95 }}
              />
            </>
          )}
          <motion.div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #edc4b2, #c15f3c 58%, #a64e30)",
            }}
            animate={
              speaking
                ? { scale: [1, 1.06, 1], opacity: [0.92, 1, 0.92] }
                : { scale: 1, opacity: 0.96 }
            }
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={speaking ? "lbl-spk" : "lbl-rec"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent"
          >
            {speaking ? "Interviewer · speaking" : "Your answer · recording"}
          </motion.p>
        </AnimatePresence>

        {/* question */}
        <div className="mt-3 flex min-h-[3.6rem] items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="font-display max-w-sm text-xl leading-snug"
            >
              “{QUESTIONS[idx]}”
            </motion.p>
          </AnimatePresence>
        </div>

        {/* status pill */}
        <div className="mt-auto pt-6">
          <AnimatePresence mode="wait">
            {speaking ? (
              <motion.div
                key="pill-listen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 rounded-pill bg-mist px-4 py-2 text-sm text-ink-faint"
              >
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </span>
                Listening for your answer
              </motion.div>
            ) : (
              <motion.div
                key="pill-rec"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-3 rounded-pill bg-accent-soft px-4 py-2 text-sm font-medium text-accent"
              >
                <span className="flex items-center gap-1.5">
                  <motion.span
                    className="h-2 w-2 rounded-full bg-danger"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Recording your answer
                </span>
                <MiniWave />
                <span className="font-mono tabular-nums">0:{ss}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const BARS = Array.from({ length: 18 }, (_, i) => {
  const t = i / 17;
  return 0.45 + 0.55 * Math.sin(Math.PI * t);
});

function MiniWave() {
  return (
    <span className="flex h-4 items-center gap-[2px]">
      {BARS.map((env, i) => (
        <motion.span
          key={i}
          className="block w-[2px] rounded-full bg-accent/60"
          style={{ height: "100%", originY: 0.5 }}
          animate={{ scaleY: [0.2 * env, env, 0.35 * env, 0.8 * env, 0.2 * env] }}
          transition={{
            duration: 1,
            delay: i * 0.04,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
