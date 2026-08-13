"use client"

import { useRef, useState, type ReactNode } from "react"
import { Check, Upload, File as FileIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

/* --------------------------------- Checkbox --------------------------------- */

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: string
  disabled?: boolean
  id?: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        )}
      >
        {checked ? <Check className="size-3.5" aria-hidden="true" /> : null}
      </button>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">{description}</span> : null}
      </span>
    </label>
  )
}

/* -------------------------------- Radio group ------------------------------- */

export type RadioOption = { value: string; label: string; description?: string }

export function RadioGroup({
  options,
  value,
  onChange,
  name,
}: {
  options: RadioOption[]
  value: string
  onChange: (v: string) => void
  name: string
}) {
  return (
    <div role="radiogroup" className="space-y-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
              active ? "border-primary bg-primary/5" : "border-border hover:border-input",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                active ? "border-primary" : "border-input",
              )}
              aria-hidden="true"
            >
              {active ? <span className="size-2.5 rounded-full bg-primary" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              {opt.description ? (
                <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">{opt.description}</span>
              ) : null}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/* -------------------------------- File upload ------------------------------- */

export function FileUpload({
  accept = "PDF, PNG, JPG up to 10MB",
  onFiles,
}: {
  accept?: string
  onFiles?: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = [...files, ...Array.from(list)]
    setFiles(next)
    onFiles?.(next)
  }

  const remove = (idx: number) => {
    const next = files.filter((_, i) => i !== idx)
    setFiles(next)
    onFiles?.(next)
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-input hover:bg-muted/40",
        )}
      >
        <span className="mb-3 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
          <Upload className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">
          Drag &amp; drop files, or <span className="text-primary">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{accept}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
              <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${f.name}`}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
