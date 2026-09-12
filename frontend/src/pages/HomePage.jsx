import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  ScanSearch,
  Gauge,
  AlertTriangle,
  ClipboardList,
  Bell,
  FileText,
  LayoutDashboard,
  Lock,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { ThemeToggle } from '@/components/ui/theme-toggle.jsx'

const features = [
  {
    icon: ScanSearch,
    title: 'AI compliance review',
    description:
      'Upload a PDF and Gemini extracts the document, then reviews it for regulatory and compliance risk in a single pipeline run.',
  },
  {
    icon: Gauge,
    title: 'Actionable compliance score',
    description:
      'Every document gets a clear 0–100 score with a risk label, so you can prioritise what needs a human review first.',
  },
  {
    icon: AlertTriangle,
    title: 'Flagged issues by severity',
    description:
      'Non-compliant clauses and reasons are surfaced automatically and colour-coded by severity — High, Medium and Low.',
  },
  {
    icon: LayoutDashboard,
    title: 'Live compliance dashboard',
    description:
      'Track total audits, average scores and critical alerts on a dashboard that refreshes as documents finish processing.',
  },
  {
    icon: ClipboardList,
    title: 'Full audit trail',
    description:
      'Every upload, completion and failure is logged in a chronological audit history you can search, filter and sort.',
  },
  {
    icon: Bell,
    title: 'Completion notifications',
    description:
      'Get notified the moment an analysis finishes or fails — with preference controls for exactly which events alert you.',
  },
]

const steps = [
  {
    number: '01',
    icon: UploadCloud,
    title: 'Upload a PDF',
    description:
      'Drop in a financial document from the upload queue. Validation runs before we accept the file, and progress is shown live.',
  },
  {
    number: '02',
    icon: ScanSearch,
    title: 'AI analyses it',
    description:
      'Text is extracted and sent through the compliance review pipeline, with each stage reported back in real time.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Review the results',
    description:
      'Read the compliance score, drill into flagged clauses by severity, and keep the full audit trail for later reference.',
  },
]

const securityPoints = [
  {
    icon: Lock,
    title: 'Session cookies only',
    description: 'Signed in via HTTP-only JWT cookies — no tokens stored in browser storage.',
  },
  {
    icon: ShieldCheck,
    title: 'Workspace-scoped data',
    description: 'Documents and notifications are owned and isolated per user account.',
  },
  {
    icon: FileText,
    title: 'Metadata, not files',
    description: 'Only document metadata and AI results are persisted — no raw file bytes.',
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold">FinAudit AI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex" aria-label="Sections">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" render={<Link to="/login" />}>
              Sign in
            </Button>
            <Button render={<Link to="/login" />}>
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              AI-powered compliance auditing
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Audit financial documents for compliance — in seconds
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              FinAudit AI turns PDFs into clear compliance verdicts. Upload a document, let
              the pipeline extract and analyse it, then review the score and flagged risks
              — all from one dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link to="/login" />}>
                Start auditing free
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button size="lg" variant="outline" render={<Link to="/login" />}>
                Sign in
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              No credit card required · Create an account to get started
            </p>
          </div>

          {/* Decorative result preview */}
          <div aria-hidden="true" className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">Q3 Financial Statement.pdf</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Compliance review · Completed
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Verified
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Compliance score</p>
                    <p className="mt-1 font-mono text-3xl font-semibold text-foreground">87<span className="text-base text-muted-foreground">/100</span></p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Low risk
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[87%] rounded-full bg-emerald-500/80" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Flagged clauses · 2
                </p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span className="truncate">Disclosure timing clause incomplete</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                  <span className="truncate">Missing regulatory approval statement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Features</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Everything your compliance team needs to stay ahead
              </h2>
              <p className="mt-4 text-muted-foreground">
                A focused pipeline that covers the full document audit lifecycle — from upload to
                reviewable results.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-border py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Three steps from upload to verdict
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="relative">
                    {index < steps.length - 1 && (
                      <span className="absolute left-full top-6 hidden h-px w-8 -translate-y-1/2 bg-border md:block" aria-hidden="true" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">{step.number}</span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="scroll-mt-20 border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Security</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Built on secure defaults
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {securityPoints.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.title} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Turn every document into a compliance verdict
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create your FinAudit AI account and run your first compliance audit in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" render={<Link to="/login" />}>
                Start auditing free
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
            </div>
            <span className="font-medium text-foreground">FinAudit AI</span>
          </div>
          <p className="font-mono text-xs">
            Compliance &amp; document audit platform
          </p>
          <Link to="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  )
}