"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonLink } from "./ui";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#dimensions", label: "What we score" },
  { href: "/report", label: "Sample report" },
  { href: "/story-bank", label: "Story Bank" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.82)"
            : "rgba(255,255,255,0.45)",
          boxShadow: scrolled
            ? "0 10px 40px -22px rgba(32,32,28,0.4)"
            : "0 0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3 }}
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-pill border border-line/70 px-4 py-2.5 backdrop-blur-xl sm:px-5"
      >
        <Link href="/" className="flex items-center gap-2 pl-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-cream text-sm font-bold">
            P
          </span>
          <span className="font-display text-[19px] tracking-tight">
            Pressure&nbsp;Test
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline text-sm font-medium text-ink-soft hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <ButtonLink href="/upload" variant="dark" size="md">
            Start my mock interview
          </ButtonLink>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist md:hidden"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-line bg-paper p-4 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-soft hover:bg-mist"
                >
                  {l.label}
                </Link>
              ))}
              <ButtonLink href="/upload" variant="dark" className="mt-2 w-full">
                Start my mock interview
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
