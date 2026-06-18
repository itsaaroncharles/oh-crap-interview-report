"use client";

import { motion } from "framer-motion";
import {
  ButtonLink,
  Eyebrow,
  Reveal,
  staggerContainer,
  staggerItem,
} from "@/components/ui";
import { HeroInterviewDemo } from "@/components/hero-demo";
import { ShowcaseInterview } from "@/components/showcase-interview";

const steps = [
  { k: "01", t: "Tell the AI about you", d: "Drop in your résumé, portfolio link, and any case studies. The AI reads your actual work before it ever asks a question." },
  { k: "02", t: "Sit a real mock interview", d: "Your interviewer speaks each question aloud. You answer out loud, against the clock, exactly like the room you're dreading." },
  { k: "03", t: "Get your Oh Crap score", d: "A readiness score and the specific moments your story cracked under follow-up, tied to what's actually in your portfolio." },
  { k: "04", t: "Drill the weak spots", d: "Each weak area becomes a focused practice round. Push back, rewrite, and tighten until the answer sounds senior." },
  { k: "05", t: "Re-take. Score higher.", d: "Run the interview again and watch the number move. That delta is the whole point." },
];

const areas = [
  { t: "Personal ownership", d: "Can the interviewer tell what you drove, or does everything hide behind “we”?" },
  { t: "Measurable impact", d: "Baseline, timeframe, attribution, or a vanity number that dies on the follow-up?" },
  { t: "Trade-offs & judgement", d: "Mature work shows costs. What got worse, and why was it acceptable?" },
  { t: "Decision rationale", d: "Why this design over the alternatives you explored?" },
  { t: "Research depth", d: "Method and sample size, or a conclusion with nothing behind it?" },
  { t: "Reflection & growth", d: "What would you do differently, and what principle did you keep?" },
];

const quotes = [
  "“I would have died if they asked me that.”",
  "Answers that survive the follow-up",
  "Ownership the interviewer can see",
  "Trade-offs that signal seniority",
  "Research with method, not vibes",
  "A score that climbs as you practise",
];

type Plan = {
  name: string;
  price: string;
  caption: string;
  tag: string;
  blurb: string;
  points: string[];
  featured: boolean;
  cta: string;
  href: string;
};

const plans: Plan[] = [
  {
    name: "The mock interview",
    price: "$0",
    caption: "free",
    tag: "Always free",
    blurb: "Sit the real thing and see where you stand.",
    points: [
      "Full spoken mock interview",
      "Your Oh Crap readiness score",
      "A summary of your biggest weak spot",
    ],
    featured: false,
    cta: "Try it free",
    href: "/upload",
  },
  {
    name: "Full report",
    price: "$9",
    caption: "per report",
    tag: "Unlock to improve",
    blurb: "Turn the summary into a plan, and a higher score.",
    points: [
      "Every weak spot, tied to your work",
      "A practice round to drill each one",
      "Re-take to raise your Oh Crap score",
      "Full transcript, scored answer by answer",
    ],
    featured: true,
    cta: "Start a free interview",
    href: "/upload",
  },
  {
    name: "Onsite pack",
    price: "$24",
    caption: "3 reports",
    tag: "Full interview loop",
    blurb: "Prepping multiple rounds at one company.",
    points: [
      "Three full report unlocks",
      "Company-tuned questions",
      "Story Bank exports",
      "Best value per report",
    ],
    featured: false,
    cta: "Get the Onsite pack",
    href: "/upload",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative px-5 pt-16 pb-20 sm:pt-24">
        {/* Mesh + grain extends up behind the floating navbar so there's no
            flat band/seam above the hero. */}
        <div className="mesh-hero grain pointer-events-none absolute inset-x-0 -top-28 bottom-0 -z-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.6rem] leading-[1.02] tracking-tight sm:text-7xl"
          >
            Have your{" "}
            <span className="italic-serif">oh-crap</span> moment
            <br className="hidden sm:block" /> here, not in the{" "}
            <span className="marker">interview</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            Drop in your résumé and portfolio, then sit a brutally honest spoken
            mock interview. We show you exactly where your story falls apart, the stuff a hiring manager will pounce on, and drill it until it
            doesn&apos;t.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ButtonLink href="/upload" variant="dark" size="lg">
              Start my mock interview →
            </ButtonLink>
            <ButtonLink href="/report" variant="ghost" size="lg">
              See a sample report
            </ButtonLink>
          </motion.div>

          <p className="mt-4 text-xs text-ink-faint">
            No login needed · Your interviewer talks · ~10 minutes
          </p>
        </div>

        {/* Interview preview, animated, voice-recording feel */}
        <Reveal delay={0.2} className="relative mx-auto mt-16 max-w-3xl">
          <HeroInterviewDemo />
        </Reveal>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <section className="border-y border-line bg-sand py-7">
        <div className="flex overflow-hidden">
          <div className="animate-marquee font-display flex shrink-0 items-center gap-12 whitespace-nowrap pr-12 text-xl text-ink sm:text-3xl">
            {[...quotes, ...quotes].map((q, i) => (
              <span key={i} className="flex items-center gap-12">
                {q}
                <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS (5 steps) ---------- */}
      <section id="how" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display mt-4 text-4xl tracking-tight sm:text-6xl">
              Interview first. <span className="italic-serif">Then</span> the
              brutal truth.
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Most tools just skim your portfolio and call it feedback. We put
              you in the hot seat first, because nothing sticks like the
              question that made you sweat.
            </p>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {steps.map((s) => (
              <motion.div
                key={s.k}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group rounded-3xl border border-line bg-paper p-6 hover:border-accent/40 hover:shadow-[0_30px_60px_-40px_rgba(193,95,60,0.4)]"
              >
                <span className="font-display text-3xl text-accent">{s.k}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {s.d}
                </p>
              </motion.div>
            ))}
            <div className="flex flex-col justify-center gap-3 rounded-3xl bg-accent p-6 text-cream">
              <p className="font-display text-2xl leading-tight">
                Your first interview is free.
              </p>
              <ButtonLink href="/upload" variant="signal" className="self-start">
                Begin →
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- INTERVIEW SHOWCASE (replaces generic dark slab) ---------- */}
      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2rem] border border-line bg-sand p-6 sm:p-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>The mock interview</Eyebrow>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              It speaks. You answer out loud. The clock runs.
            </h2>
            <p className="mt-4 text-ink-soft">
              No multiple choice, no typing essays at your own pace. Your
              interviewer asks a question in a real voice, you get a few seconds
              to gather yourself, then you answer like it counts. That pressure
              is exactly what surfaces the gaps.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Questions generated from your real projects",
                "Spoken aloud, answer by voice or type",
                "Follow-ups that probe where you got vague",
                "Every answer scored on clarity, evidence & ownership",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/upload" variant="dark" className="mt-7">
              Try the interview →
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.12}>
            <ShowcaseInterview />
          </Reveal>
        </div>
      </section>

      {/* ---------- WHAT WE SCORE ---------- */}
      <section id="dimensions" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Eyebrow>What we score</Eyebrow>
            <h2 className="font-display mt-4 text-4xl tracking-tight sm:text-6xl">
              The six things a hiring manager pounces on.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((d, i) => (
              <motion.div
                key={d.t}
                whileHover={{ backgroundColor: "#fbf9f4" }}
                className="bg-paper p-7"
              >
                <span className="font-mono text-xs text-ink-faint">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{d.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {d.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <Eyebrow>Simple pricing</Eyebrow>
            <h2 className="font-display mt-4 text-4xl tracking-tight sm:text-5xl">
              Free to try. Pay per report.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              The mock interview and your score are free. Only pay when you want
              the full breakdown and the practice to fix it. No subscription.
            </p>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-5 md:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.06}>
                <PlanCard plan={p} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-faint">
            {["Free mock interview", "Pay per report", "No subscription", "Nothing recurring"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" /> {t}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="px-5 py-24">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl tracking-tight [text-wrap:balance] sm:text-5xl">
            The question you fumble here
            <br className="hidden sm:block" /> is the one you&apos;ll{" "}
            <span className="italic-serif">nail</span> in the room.
          </h2>
          <div className="mt-9">
            <ButtonLink href="/upload" variant="dark" size="lg">
              Start my mock interview →
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`relative flex h-full flex-col rounded-[1.75rem] p-7 ${
        featured
          ? "bg-accent text-cream shadow-[0_40px_90px_-40px_rgba(193,95,60,0.7)] md:-mt-3 md:mb-3"
          : "border border-line bg-paper"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream">
          {plan.tag}
        </span>
      )}

      {!featured && (
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {plan.tag}
        </span>
      )}

      <h3 className={`text-lg font-medium ${featured ? "mt-2 text-cream" : "mt-3"}`}>
        {plan.name}
      </h3>

      <div className="mt-3 flex items-end gap-1.5">
        <span className="font-display text-5xl leading-none">{plan.price}</span>
        <span
          className={`pb-1 text-sm ${featured ? "text-cream/70" : "text-ink-faint"}`}
        >
          {plan.caption}
        </span>
      </div>

      <p className={`mt-3 text-sm ${featured ? "text-cream/80" : "text-ink-soft"}`}>
        {plan.blurb}
      </p>

      <div
        className={`my-6 h-px w-full ${featured ? "bg-cream/20" : "bg-line"}`}
      />

      <ul className="flex-1 space-y-3 text-sm">
        {plan.points.map((pt) => (
          <li key={pt} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                featured ? "bg-cream/20" : "bg-accent-soft"
              }`}
            >
              <Check className={`h-2.5 w-2.5 ${featured ? "text-cream" : "text-accent"}`} />
            </span>
            <span className={featured ? "text-cream/90" : "text-ink-soft"}>
              {pt}
            </span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={plan.href}
        variant={featured ? "signal" : "ghost"}
        className="mt-7 w-full"
      >
        {plan.cta}
      </ButtonLink>
    </motion.div>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 10.5l3.2 3.2L15.5 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
