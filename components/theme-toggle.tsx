"use client"

import { useEffect, useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui-kit/feedback"
import { cn } from "@/lib/utils"

const themeListeners = new Set<() => void>()

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    themeListeners.delete(onStoreChange)
    media.removeEventListener("change", onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

function emitTheme() {
  for (const listener of themeListeners) listener()
}

function readDark() {
  const stored = localStorage.getItem("vc-theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return stored ? stored === "dark" : prefersDark
}

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark)
}

/**
 * Class-based light/dark toggle. Persists to localStorage (a UI preference,
 * not application data) and toggles `.dark` on <html>.
 */
export function ThemeToggle({
  className,
  size = "icon",
}: {
  className?: string
  size?: "icon" | "icon-sm"
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const dark = useSyncExternalStore(subscribeTheme, readDark, () => false)

  useEffect(() => {
    if (mounted) applyDark(dark)
  }, [mounted, dark])

  function toggle() {
    const next = !dark
    localStorage.setItem("vc-theme", next ? "dark" : "light")
    applyDark(next)
    emitTheme()
  }

  const label = mounted && dark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Tooltip label={label}>
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={toggle}
        aria-label={label}
        title={label}
        className={cn("text-muted-foreground hover:text-foreground", className)}
      >
        {mounted && dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </Button>
    </Tooltip>
  )
}
