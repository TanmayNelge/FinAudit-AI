export function RoutePlaceholder({ title, description }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
        {title} module is being configured.
      </div>
    </div>
  )
}
