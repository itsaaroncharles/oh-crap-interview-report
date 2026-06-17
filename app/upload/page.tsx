"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Eyebrow } from "@/components/ui";
import { saveInput } from "@/lib/store";
import type { AuditInput, TargetRole } from "@/lib/types";

const roles: TargetRole[] = [
  "UX Designer",
  "Product Designer",
  "Senior Product Designer",
  "UX Researcher",
];

export default function UploadPage() {
  const router = useRouter();
  const [role, setRole] = useState<TargetRole>("Product Designer");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<string>("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [error, setError] = useState("");

  const canSubmit = portfolioUrl.trim().length > 0 || portfolioFile.length > 0;

  function submit() {
    if (!canSubmit) {
      setError("Add a portfolio URL or upload a PDF so we have something to review.");
      return;
    }
    const input: AuditInput = {
      targetRole: role,
      portfolioUrl: portfolioUrl.trim() || undefined,
      portfolioFileName: portfolioFile || undefined,
      resumeFileName: resumeFile || undefined,
      targetCompany: company.trim() || undefined,
      jobDescription: jd.trim() || undefined,
    };
    saveInput(input);
    router.push("/interview");
  }

  return (
    <section className="px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Eyebrow>Step 1 · Tell the AI about you</Eyebrow>
          <h1 className="font-display mt-4 text-4xl tracking-tight sm:text-5xl">
            First, let your interviewer get to know your work.
          </h1>
          <p className="mt-3 text-ink-soft">
            Drop in your résumé, portfolio, and anything else. The AI reads it,
            then interviews you on <em>your</em> actual projects. The more you
            add, the sharper the questions.
          </p>
        </motion.div>

        <div className="mt-10 space-y-8 rounded-3xl border border-line bg-paper p-6 shadow-[0_30px_80px_-50px_rgba(11,15,26,0.4)] sm:p-8">
          {/* Role */}
          <Field label="What are you preparing for?" required>
            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`btn-press rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
                    role === r
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-paper text-ink-soft hover:border-ink/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          {/* Portfolio */}
          <Field
            label="Your portfolio"
            required
            hint="Paste a link or upload a PDF, either works."
          >
            <input
              type="url"
              inputMode="url"
              placeholder="https://your-portfolio.com"
              value={portfolioUrl}
              onChange={(e) => {
                setPortfolioUrl(e.target.value);
                setError("");
              }}
              className="w-full rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/10"
            />
            <div className="my-3 flex items-center gap-3 text-xs text-ink-faint">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <FileDrop
              label={portfolioFile || "Upload portfolio PDF"}
              active={!!portfolioFile}
              onPick={(name) => {
                setPortfolioFile(name);
                setError("");
              }}
            />
          </Field>

          {/* Resume */}
          <Field label="Resume" hint="Optional, but it sharpens the audit.">
            <FileDrop
              label={resumeFile || "Upload resume PDF"}
              active={!!resumeFile}
              onPick={setResumeFile}
            />
          </Field>

          {/* Company */}
          <Field label="Target company" hint="Optional.">
            <input
              type="text"
              placeholder="e.g. Linear, Figma, GovTech"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/10"
            />
          </Field>

          {/* JD */}
          <Field label="Job description" hint="Optional, paste it for role-specific questions.">
            <textarea
              rows={4}
              placeholder="Paste the job description…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="w-full resize-none rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/10"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-sm text-[#c23434]">
              {error}
            </p>
          )}

          <Button onClick={submit} variant="dark" size="lg" className="w-full">
            Start my mock interview →
          </Button>
          <p className="text-center text-xs text-ink-faint">
            Demo uses mock analysis. Files aren&apos;t uploaded anywhere, only
            the file name is used.
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </span>
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function FileDrop({
  label,
  active,
  onPick,
}: {
  label: string;
  active: boolean;
  onPick: (name: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-mist text-ink-soft hover:border-ink/30"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink">
        {active ? "✓" : "↑"}
      </span>
      <span className="truncate font-medium">{label}</span>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f.name);
        }}
      />
    </label>
  );
}
