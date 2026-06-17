import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream grain grain-dark">
      <div className="mesh-ink pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-cream text-sm font-bold">
                P
              </span>
              <span className="font-display text-xl">Pressure Test</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              Sit a realistic AI mock interview, find what you&apos;re blind to,
              and drill it until your answers sound clear, honest, and senior.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/40">
              Product
            </p>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li>
                <Link href="/upload" className="link-underline hover:text-cream">
                  Start a mock interview
                </Link>
              </li>
              <li>
                <Link href="/report" className="link-underline hover:text-cream">
                  Sample report
                </Link>
              </li>
              <li>
                <Link href="/story-bank" className="link-underline hover:text-cream">
                  Story Bank
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/40">
              Who it&apos;s for
            </p>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li>UX Designers</li>
              <li>Product Designers</li>
              <li>UX Researchers</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Pressure Test. MVP demo.</p>
          <p>Have your oh-crap moment here, not in the interview.</p>
        </div>
      </div>
    </footer>
  );
}
