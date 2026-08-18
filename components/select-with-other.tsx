"use client"

import { useState } from "react"
import { Input, Select } from "@/components/form-controls"

const OTHER = "__other__"

export function SelectWithOther({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  otherPlaceholder = "Enter a value",
  required = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  otherPlaceholder?: string
  required?: boolean
}) {
  const isKnown = options.includes(value)
  const [forceOther, setForceOther] = useState(false)
  const otherSelected = forceOther || (Boolean(value) && !isKnown)
  const selectValue = otherSelected ? OTHER : value

  return (
    <div className="grid gap-2">
      <Select
        id={id}
        required={required}
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value
          if (next === OTHER) {
            setForceOther(true)
            onChange(isKnown ? "" : value)
            return
          }
          setForceOther(false)
          onChange(next)
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={OTHER}>Other</option>
      </Select>
      {otherSelected ? (
        <Input
          id={`${id}-other`}
          value={value}
          required={required}
          onChange={(e) => {
            const next = e.target.value
            if (options.includes(next)) setForceOther(false)
            onChange(next)
          }}
          placeholder={otherPlaceholder}
        />
      ) : null}
    </div>
  )
}
