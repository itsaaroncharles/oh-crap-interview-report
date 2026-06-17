"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

// ---- Reveal: scroll-triggered fade/rise (amplemarket-style section reveals)

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---- Button

type Variant = "primary" | "dark" | "ghost" | "signal";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-deep shadow-[0_8px_24px_-10px_rgba(193,95,60,0.6)]",
  dark: "bg-ink text-cream hover:bg-[#34332d] shadow-[0_8px_24px_-12px_rgba(32,32,28,0.6)]",
  signal: "bg-cream text-ink ring-1 ring-line hover:bg-paper",
  ghost: "bg-transparent text-ink hover:bg-mist border border-line",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...rest },
  ref,
) {
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  return (
    <button
      ref={ref}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-pill font-medium ${sizing} ${variantClasses[variant]} disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  return (
    <Link
      href={href}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-pill font-medium ${sizing} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

// ---- Severity pill

export function SeverityPill({
  severity,
}: {
  severity: "high" | "medium" | "low";
}) {
  const map = {
    high: { bg: "bg-[#f6e0da]", dot: "bg-danger", text: "text-[#9e3a23]", label: "High risk" },
    medium: { bg: "bg-[#f5e8cf]", dot: "bg-warn", text: "text-[#8a5e16]", label: "Medium" },
    low: { bg: "bg-[#e2ecdd]", dot: "bg-good", text: "text-[#3f6b3f]", label: "Low" },
  }[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${map.bg} ${map.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

// ---- Eyebrow label

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}
