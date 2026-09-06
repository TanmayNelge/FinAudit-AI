import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  FileJson,
  Info,
  ShieldCheck,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues' },
  { id: 'extracted', label: 'Extracted Data' },
  { id: 'audit', label: 'Audit Trail' },
]

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function severityMeta(severity) {
  if (severity === 'High') {
    return {
      badge: 'border-destructive/20 bg-destructive/10 text-destructive',
      icon: AlertTriangle,
      dot: 'bg-destructive',
    }
  }
  if (severity === 'Medium') {
    return {
      badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
      icon: AlertTriangle,
      dot: 'bg-amber-400',
    }
  }
  return {
    badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    icon: Info,
    dot: 'bg-blue-400',
  }
}

function riskMeta(score) {
  if (score == null) return null
  if (score >= 80) return { label: 'Low risk', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', bar: 'bg-emerald-500' }
  if (score >= 60) return { label: 'Moderate risk', badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400', bar: 'bg-amber-400' }
  return { label: 'High risk', badge: 'border-destructive/20 bg-destructive/10 text-destructive', bar: 'bg-destructive' }
}

function statusMeta(status) {
  if (status === 'processing') {
    return { label: 'Processing', badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400', icon: Loader2 }
  }
  if (status === 'completed') {
    return { label: 'Completed', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 }
  }
  if (status === 'failed') {
    return { label: 'Failed', badge: 'border-destructive/20 bg-destructive/10 text-destructive', icon: XCircle }
  }
  return { label: 'Pending', badge: 'border-border bg-secondary text-muted-foreground', icon: Clock }
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

function ScorePanel({ doc }) {
  const risk = riskMeta(doc.complianceScore)
  const score =
    doc.status === 'completed' && doc.complianceScore != null ? doc.complianceScore : null

  if (score == null) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          {doc.status === 'processing'
            ? 'Compliance score will appear once analysis finishes.'
            : 'No compliance score available.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Compliance score
          </p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-foreground">
            {score}
            <span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>
        {risk && (
          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', risk.badge)}>
            {risk.label}
          </span>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', risk?.bar)}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          AI audit completed by Gemini
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          {doc.flaggedIssues?.length || 0} flagged {doc.flaggedIssues?.length === 1 ? 'issue' : 'issues'}
        </span>
      </div>
    </div>
  )
}

function AnalysisSummary({ doc }) {
  if (doc.status === 'processing') {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        This document is currently being analyzed by the compliance pipeline. The
        extracted text has been submitted for review and a compliance score and
        flagged issues will appear here shortly.
      </p>
    )
  }
  if (doc.status === 'failed') {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        The compliance analysis could not be completed for this document — no
        extractable text or an upstream processing failure was encountered. No
        issues were flagged and no compliance score was assigned.
      </p>
    )
  }
  if (doc.status === 'completed' && doc.complianceScore == null) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        This document completed analysis but no compliance score was recorded.
      </p>
    )
  }

  const issues = doc.flaggedIssues || []
  const high = issues.filter((issue) => issue.severity === 'High').length
  const medium = issues.filter((issue) => issue.severity === 'Medium').length
  const low = issues.filter((issue) => issue.severity === 'Low').length

  const parts = [
    `This document received a compliance score of ${doc.complianceScore}/100 after an automated review of its extracted content.`,
  ]
  if (issues.length === 0) {
    parts.push('No compliance issues were flagged during the analysis.')
  } else {
    parts.push(
      `${issues.length} ${issues.length === 1 ? 'issue was' : 'issues were'} flagged: ${high} high, ${medium} medium and ${low} low severity.`,
    )
    if (high > 0) {
      parts.push('High-severity findings require immediate review before the document is relied upon.')
    } else {
      parts.push('No high-severity findings were detected, though lower-severity items should still be reviewed.')
    }
  }

  return (
    <div className="space-y-3">
      {parts.map((text, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      ))}
    </div>
  )
}

function IssueCard({ issue, index }) {
  const meta = severityMeta(issue.severity)
  const Icon = meta.icon
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', meta.badge)}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            #{index + 1} · {issue.clause || 'Unspecified clause'}
          </span>
          <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', meta.badge)}>
            <span className={cn('mr-1.5 size-1.5 rounded-full', meta.dot)} />
            {issue.severity || 'Unspecified'}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {issue.reason}
        </p>
      </div>
    </div>
  )
}

function ExtractedDataTab({ doc }) {
  const issues = doc.flaggedIssues || []
  const counts = { High: 0, Medium: 0, Low: 0 }
  issues.forEach((issue) => {
    if (counts[issue.severity] !== undefined) counts[issue.severity] += 1
    else counts[issue.severity] = 1
  })

  const structured = {
    fileName: doc.fileName,
    status: doc.status,
    complianceScore: doc.complianceScore ?? null,
    flaggedIssues: issues,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status" value={doc.status} />
        <Field label="Compliance score" value={doc.complianceScore != null ? `${doc.complianceScore}/100` : '—'} />
        <Field label="Flagged issues" value={issues.length} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="High severity" value={counts.High} />
        <Field label="Medium severity" value={counts.Medium} />
        <Field label="Low severity" value={counts.Low} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <FileJson className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Structured AI output
          </p>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
          {JSON.stringify(structured, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function AuditTrailTab({ doc }) {
  const events = [
    {
      id: 'uploaded',
      title: 'Document uploaded',
      description: 'File received and queued for compliance analysis.',
      time: doc.createdAt,
      icon: FileText,
      tone: 'text-foreground',
    },
    {
      id: doc.status === 'failed' ? 'failed' : doc.status === 'completed' ? 'completed' : 'processing',
      title:
        doc.status === 'failed'
          ? 'Analysis failed'
          : doc.status === 'completed'
            ? 'Analysis completed'
            : 'Analysis in progress',
      description:
        doc.status === 'failed'
          ? 'The document could not be processed by the compliance pipeline.'
          : doc.status === 'completed'
            ? `Compliance score recorded at ${doc.complianceScore}/100 with ${doc.flaggedIssues?.length || 0} flagged ${(doc.flaggedIssues?.length || 0) === 1 ? 'issue' : 'issues'}.`
            : 'The document is currently being reviewed by the AI pipeline.',
      time: doc.updatedAt,
      icon: doc.status === 'failed' ? XCircle : doc.status === 'completed' ? CheckCircle2 : Loader2,
      tone: doc.status === 'failed' ? 'text-destructive' : doc.status === 'completed' ? 'text-emerald-400' : 'text-blue-400',
    },
  ]

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((event) => {
        const Icon = event.icon
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                'absolute -left-[31px] flex size-5 items-center justify-center rounded-full border border-border bg-card',
                event.tone,
              )}
            >
              <Icon className="size-3" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formatDate(event.time)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function DocumentSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="flex animate-pulse flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
        <div className="mt-2 h-8 w-24 rounded bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-44 animate-pulse rounded-xl border border-border bg-card lg:col-span-2" />
      </div>
    </div>
  )
}

export function DocumentDetailsPage() {
  const { id } = useParams()

  // Key the presenter by the route id so navigating between documents remounts
  // it with fresh state instead of resetting state inside an effect.
  return <DocumentDetails key={id} id={id} />
}

function DocumentDetails({ id }) {
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch on mount (component is remounted per id via the parent's key).
  useEffect(() => {
    let cancelled = false
    api
      .get(`/api/documents/${id}`)
      .then((response) => {
        if (!cancelled) setDocument(response.data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load document:', err)
        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setError('Unable to load this document right now.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const retry = () => {
    setLoading(true)
    setError('')
    setNotFound(false)
    api
      .get(`/api/documents/${id}`)
      .then((response) => setDocument(response.data))
      .catch((err) => {
        console.error('Failed to load document:', err)
        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setError('Unable to load this document right now.')
        }
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return <DocumentSkeleton />
  }

  if (notFound || error) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 py-20 text-center">
        <div className={cn(
          'flex size-12 items-center justify-center rounded-full',
          notFound ? 'bg-secondary text-muted-foreground' : 'bg-destructive/10 text-destructive',
        )}>
          {notFound ? (
            <FileText className="size-6" aria-hidden="true" />
          ) : (
            <XCircle className="size-6" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {notFound ? 'Document not found' : 'Unable to load document.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {notFound
              ? 'This document may have been deleted or you do not have access to it.'
              : error}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!notFound && (
            <button
              type="button"
              onClick={retry}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          )}
          <Link
            to="/documents"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back to documents
          </Link>
        </div>
      </div>
    )
  }

  const status = statusMeta(document.status)
  const StatusIcon = status.icon
  const risk = riskMeta(document.complianceScore)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link
        to="/documents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to documents
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <FileText className="size-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                  {document.fileName}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploaded {formatDate(document.createdAt)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', status.badge)}>
                    <StatusIcon className="size-3" aria-hidden="true" />
                    {status.label}
                  </span>
                  {risk && (
                    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', risk.badge)}>
                      {risk.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {document.status === 'completed' && document.complianceScore != null && (
              <div className="shrink-0 text-left lg:text-right">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Compliance score
                </p>
                <p className={cn('mt-1 font-mono text-3xl font-bold', risk?.badge.split(' ')[0])}>
                  {document.complianceScore}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Document analysis sections"
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="flex flex-col gap-6"
        >
          {activeTab === 'overview' && (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <ScorePanel doc={document} />
                <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                  <h2 className="text-sm font-semibold text-foreground">Analysis summary</h2>
                  <div className="mt-3">
                    <AnalysisSummary doc={document} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Field label="File name" value={document.fileName} />
                <Field label="Status" value={document.status} />
                <Field label="Latest score" value={document.complianceScore != null ? `${document.complianceScore}/100` : '—'} />
                <Field label="Flagged issues" value={document.flaggedIssues?.length || 0} />
              </div>
            </>
          )}

          {activeTab === 'issues' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Detected compliance issues</h2>
              <div className="mt-4 flex flex-col gap-3">
                {document.status === 'completed' &&
                  (document.flaggedIssues?.length > 0 ? (
                    document.flaggedIssues.map((issue, index) => (
                      <IssueCard key={index} issue={issue} index={index} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="size-6" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No compliance issues detected</p>
                      <p className="text-xs text-muted-foreground">
                        The AI audit found no flagged clauses or regulatory risks in this document.
                      </p>
                    </div>
                  ))}

                {document.status === 'processing' && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">Analysis in progress</p>
                    <p className="text-xs text-muted-foreground">
                      Flagged issues will appear here once the compliance review completes.
                    </p>
                  </div>
                )}

                {document.status === 'failed' && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <XCircle className="size-6 text-destructive" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">Analysis failed</p>
                    <p className="text-xs text-muted-foreground">
                      No issues were flagged because the document could not be analyzed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'extracted' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Extracted data</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The structured result produced by the AI pipeline for this document.
              </p>
              <div className="mt-4">
                <ExtractedDataTab doc={document} />
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Audit trail</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Processing events recorded for this document.
              </p>
              <div className="mt-6">
                <AuditTrailTab doc={document} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}