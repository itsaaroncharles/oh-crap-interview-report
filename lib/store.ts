"use client";

import type {
  AuditInput,
  AuditReport,
  InterviewReport,
  InterviewSession,
  SavedAnswer,
} from "./types";
import { STORY_BANK_SEED } from "./mockData";

// Tiny sessionStorage/localStorage helpers so the no-login MVP can pass data
// between screens. Story bank persists in localStorage; report is per-session.
// Every accessor guards `typeof window` FIRST so these are safe to call during
// render (SSR) without throwing "window is not defined".

type Kind = "session" | "local";

const REPORT_KEY = "ppt.report";
const INPUT_KEY = "ppt.input";
const BANK_KEY = "ppt.storybank";
const IREPORT_KEY = "ppt.ireport";
const SESSION_KEY = "ppt.session";
const ATTEMPT_KEY = "ppt.attempt";
const LASTSCORE_KEY = "ppt.lastscore";

function read<T>(kind: Kind, key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const store = kind === "local" ? window.localStorage : window.sessionStorage;
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(kind: Kind, key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    const store = kind === "local" ? window.localStorage : window.sessionStorage;
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export const saveInput = (input: AuditInput) =>
  write("session", INPUT_KEY, input);
export const loadInput = () => read<AuditInput>("session", INPUT_KEY);

export const saveReport = (report: AuditReport) =>
  write("session", REPORT_KEY, report);
export const loadReport = () => read<AuditReport>("session", REPORT_KEY);

// ---- Interview ----

export const saveInterviewReport = (report: InterviewReport) =>
  write("session", IREPORT_KEY, report);
export const loadInterviewReport = () =>
  read<InterviewReport>("session", IREPORT_KEY);

export const saveSession = (s: InterviewSession) =>
  write("session", SESSION_KEY, s);
export const loadSession = () => read<InterviewSession>("session", SESSION_KEY);

/** Returns the attempt number for the NEXT interview (1-based). */
export function nextAttempt(): number {
  const n = read<number>("local", ATTEMPT_KEY) ?? 0;
  return n + 1;
}
export function commitAttempt(n: number) {
  write("local", ATTEMPT_KEY, n);
}

export const saveLastScore = (score: number) =>
  write("local", LASTSCORE_KEY, score);
export const loadLastScore = () => read<number>("local", LASTSCORE_KEY);

// ---- Per-report unlock (mock paywall) ----
// A report is free to generate; unlocking it (one-time payment) reveals the
// full breakdown, the practice rounds, and re-takes. Stored by report id so a
// brand-new interview is locked again.

const UNLOCKED_KEY = "ppt.unlockedReports";

export function isReportUnlocked(id: string | undefined): boolean {
  if (!id) return false;
  const ids = read<string[]>("local", UNLOCKED_KEY) ?? [];
  return ids.includes(id);
}

export function unlockReport(id: string) {
  const ids = read<string[]>("local", UNLOCKED_KEY) ?? [];
  if (!ids.includes(id)) write("local", UNLOCKED_KEY, [...ids, id]);
}

/** Is the latest interview report unlocked? Used to gate the practice room. */
export function isCurrentReportUnlocked(): boolean {
  const report = read<InterviewReport>("session", IREPORT_KEY);
  if (!report) return true; // no real report (e.g. sample/demo) → don't gate
  return isReportUnlocked(report.id);
}

export function loadStoryBank(): SavedAnswer[] {
  if (typeof window === "undefined") return STORY_BANK_SEED;
  const existing = read<SavedAnswer[]>("local", BANK_KEY);
  if (existing) return existing;
  write("local", BANK_KEY, STORY_BANK_SEED);
  return STORY_BANK_SEED;
}

export function addToStoryBank(answer: SavedAnswer): SavedAnswer[] {
  const current = loadStoryBank();
  const next = [answer, ...current];
  write("local", BANK_KEY, next);
  return next;
}
