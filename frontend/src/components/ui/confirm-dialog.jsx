import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button.jsx'

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirming = false,
  error = '',
  onConfirm,
}) {
  const handleOpenChange = () => {
    if (!confirming) onClose?.()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/60" />
        <DialogPrimitive.Popup
          dismissible={!confirming}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl outline-none"
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full',
                variant === 'danger'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary',
              )}
            >
              {variant === 'danger' ? (
                <AlertTriangle className="size-5" aria-hidden="true" />
              ) : (
                <Loader2 className="size-5" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <DialogPrimitive.Close
              render={<Button variant="outline" disabled={confirming} />}
              onClick={() => onClose?.()}
            >
              {cancelLabel}
            </DialogPrimitive.Close>
            <Button
              variant={variant === 'danger' ? 'destructive' : 'default'}
              disabled={confirming}
              onClick={onConfirm}
            >
              {confirming && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}