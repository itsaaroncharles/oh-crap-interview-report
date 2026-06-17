"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Thin wrappers around the browser Web Speech APIs. No API key needed.
// - speak(): SpeechSynthesis (broad support) for the interviewer's voice.
// - useDictation(): SpeechRecognition (Chrome/Edge) for answering by voice,
//   with graceful fallback to typing when unsupported.

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useTTS() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer a natural English voice.
      voiceRef.current =
        voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|samantha|aria/i.test(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang)) ||
        voices[0] ||
        null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 1.02;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      u.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(u);
    },
    [],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { supported, speaking, speak, stop };
}

export function useDictation() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);
  const baseRef = useRef(""); // text committed before current session

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) baseRef.current = (baseRef.current + " " + final).trim();
      setTranscript((baseRef.current + " " + interim).trim());
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const start = useCallback((seed = "") => {
    if (!recRef.current) return;
    baseRef.current = seed;
    setTranscript(seed);
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  const set = useCallback((text: string) => {
    baseRef.current = text;
    setTranscript(text);
  }, []);

  return { supported, listening, transcript, start, stop, set };
}
