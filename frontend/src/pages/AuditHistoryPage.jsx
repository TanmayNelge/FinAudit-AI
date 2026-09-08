import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import { ErrorState, EmptyState } from '@/components/ui/state.jsx'
import {
  Search,
  SearchX,
  Inbox,
  RefreshCw,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'

const PAGE_SIZE = 10

const EVENT_OPTIONS = [
  { value: 'all', label: 'All events' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function eventMeta(type) {
  if (type === 'uploaded') {
    return {
      label: 'Uploaded',
      badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
      icon: Upload,
    }
  }
  if (type === 'completed') {
    return {
      label: 'Completed',
      badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      icon: CheckCircle2,
    }
  }
  return {
    label: 'Failed',
    badge: 'border-destructive/20 bg-destructive/10 text-destructive',
    icon: XCircle,
  }
}

function SortHeader({ label, sortKey, activeKey, sortDir, onSort }) {
  const isActive = activeKey === sortKey
  const Icon = isActive ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <Icon className={cn('size-3.5', !isActive && 'opacity-60')} aria-hidden="true" />
    </button>
  )
}

function SkeletonRows({ rows = PAGE_SIZE }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-8 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <div className="size-4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          </td>
          <td className="p-4">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </td>
          <td className="p-4">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4 text-right">
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
        </tr>
      ))}
    </>
  )
}

function deriveEvents(documents) {
  const events = []
  documents.forEach((doc) => {
    events.push({
      key: `${doc._id}-uploaded`,
      docId: doc._id,
      fileName: doc.fileName,
      type: 'uploaded',
      score: null,
      time: doc.createdAt,
      description: 'Document received and queued for compliance analysis.',
    })

    if (doc.status === 'completed') {
      events.push({
        key: `${doc._id}-completed`,
        docId: doc._id,
        fileName: doc.fileName,
        type: 'completed',
        score: doc.complianceScore,
        time: doc.updatedAt,
        description: doc.complianceScore != null
          ? `Compliance score ${doc.complianceScore}/100. ${doc.flaggedIssues?.length || 0} issue${(doc.flaggedIssues?.length || 0) === 1 ? '' : 's'} flagged.`
          : 'Analysis completed without a compliance score.',
      })
    } else if (doc.status === 'failed') {
      events.push({
        key: `${doc._id}-failed`,
        docId: doc._id,
        fileName: doc.fileName,
        type: 'failed',
        score: null,
        time: doc.updatedAt,
        description: 'The document could not be processed by the compliance pipeline.',
      })
    }
  })
  return events
}

export function AuditHistoryPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [sortKey, setSortKey] = useState('time')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/documents')
      setDocuments(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to load audit history:', err)
      setError('Unable to load audit history right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/documents')
      .then((response) => {
        if (!cancelled) {
          setDocuments(response.data)
          setError('')
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load audit history:', err)
        setError('Unable to load audit history right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const events = useMemo(() => deriveEvents(documents), [documents])

  const filtered = useMemo(() => {
    let result = events
    if (eventFilter !== 'all') {
      result = result.filter((ev) => ev.type === eventFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (ev) =>
          ev.fileName?.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q),
      )
    }
    return result
  }, [events, eventFilter, query])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'time') cmp = (a.time || '').localeCompare(b.time || '')
      else if (sortKey === 'fileName') cmp = (a.fileName || '').localeCompare(b.fileName || '')
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type)
      else if (sortKey === 'score') cmp = (a.score ?? -1) - (b.score ?? -1)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, sorted.length)

  const hasFilters = query.trim() !== '' || eventFilter !== 'all'

  const clearFilters = () => {
    setQuery('')
    setEventFilter('all')
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Audit History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A chronological ledger of every compliance analysis performed across your documents.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by document name or description…"
              aria-label="Search audit history"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="event-filter">
              Filter by event type
            </label>
            <select
              id="event-filter"
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {EVENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchDocs}
              aria-label="Refresh audit history"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            icon={SearchX}
            title="Unable to load audit history."
            message={error}
            onRetry={fetchDocs}
          />
        )}

        {/* Loading */}
        {!error && loading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Event</th>
                  <th className="p-4">Document</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Score</th>
                  <th className="p-4 text-right">
                    <SortHeader label="Date" sortKey="time" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        )}

        {/* Empty (no events at all) */}
        {!error && !loading && events.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No audit history"
            description="No documents have been audited yet. Upload a document to begin."
          />
        )}

        {/* Table */}
        {!error && !loading && events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">
                    <SortHeader label="Event" sortKey="type" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4">
                    <SortHeader label="Document" sortKey="fileName" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4">
                    <SortHeader label="Status" sortKey="type" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4">
                    <SortHeader label="Score" sortKey="score" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4 text-right">
                    <SortHeader label="Date" sortKey="time" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                          <SearchX className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No events match your filters</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or event filter.
                        </p>
                        {hasFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((ev) => {
                    const meta = eventMeta(ev.type)
                    const Icon = meta.icon
                    return (
                      <tr key={ev.key} className="group transition-colors hover:bg-secondary/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', meta.badge)}>
                              <Icon className="size-4" aria-hidden="true" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{meta.label}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/documents/${ev.docId}`}
                            className="inline-flex max-w-56 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                            title={ev.fileName}
                          >
                            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{ev.fileName}</span>
                          </Link>
                          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground" title={ev.description}>
                            {ev.description}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', meta.badge)}>
                            {ev.type === 'processing' && (
                              <Clock className="size-3 animate-pulse" aria-hidden="true" />
                            )}
                            {meta.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {ev.score != null ? (
                            <span className={cn('font-mono text-sm font-semibold', ev.score >= 80 ? 'text-emerald-400' : 'text-amber-400')}>
                              {ev.score}%
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right text-xs text-muted-foreground">
                          {formatDate(ev.time)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && !loading && events.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
              <span className="font-medium text-foreground">{sorted.length}</span> events
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="px-2 font-mono text-xs text-muted-foreground">
                {safePage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
