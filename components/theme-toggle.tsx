"use client"

import { useEffect, useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

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
 * Minimal class-based theme toggle. Persists the choice to localStorage
 * (a UI preference, not application data) and toggles `.dark` on <html>.
 */
export function ThemeToggle({ className }: { className?: string }) {
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

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-pressed={mounted ? dark : undefined}
      className={className}
    >
      {mounted && dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      {mounted && dark ? "Light" : "Dark"} mode
    </Button>
  )
}
