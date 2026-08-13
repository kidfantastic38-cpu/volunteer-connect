"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastTone = "success" | "info" | "warning" | "error"

export type Toast = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastInput = { title: string; description?: string; tone?: ToastTone; duration?: number }

type ToastContextValue = {
  toast: (input: ToastInput) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneConfig: Record<ToastTone, { icon: typeof Info; accent: string }> = {
  success: { icon: CheckCircle2, accent: "text-success" },
  info: { icon: Info, accent: "text-info" },
  warning: { icon: AlertTriangle, accent: "text-warning" },
  error: { icon: XCircle, accent: "text-destructive" },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, tone = "info", duration = 4000 }: ToastInput) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((list) => [...list, { id, title, description, tone }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const { icon: Icon, accent } = toneConfig[t.tone]
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-popover p-4 shadow-e4 animate-in slide-in-from-bottom-2 fade-in"
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-popover-foreground">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
