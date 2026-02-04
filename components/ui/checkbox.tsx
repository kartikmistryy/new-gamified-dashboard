"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "onChange" | "checked"
> & {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (!inputRef.current) return
      inputRef.current.indeterminate = checked === "indeterminate"
    }, [checked])

    return (
      <input
        ref={inputRef}
        type="checkbox"
        className={cn(
          "peer size-4 shrink-0 rounded-sm border border-gray-300 bg-white shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          "checked:border-emerald-500 checked:bg-emerald-500 checked:accent-emerald-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={checked === "indeterminate" ? false : checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        aria-checked={checked === "indeterminate" ? "mixed" : checked}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
