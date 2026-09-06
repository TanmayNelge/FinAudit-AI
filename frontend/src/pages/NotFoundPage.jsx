import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center text-foreground">
      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ShieldCheck className="size-6" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Back to dashboard
      </Link>
    </div>
  )
}