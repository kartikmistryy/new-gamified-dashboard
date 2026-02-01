import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface IndicatorStyle {
  left: number
  width: number
}

interface UseTabIndicatorOptions {
  activeTab: string
  dependencies?: unknown[]
}

export default function useTabIndicator({
  activeTab,
  dependencies = [],
}: UseTabIndicatorOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
    left: 0,
    width: 0,
  })

  const registerTabRef = useCallback((key: string, el: HTMLElement | null) => {
    tabRefs.current[key] = el
  }, [])

  const depsKey = useMemo(() => {
    try {
      return JSON.stringify(dependencies)
    } catch {
      return String(dependencies)
    }
  }, [dependencies])

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab]
    const containerEl = containerRef.current
    if (!activeEl || !containerEl) return
    const containerRect = containerEl.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()
    setIndicatorStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    })
  }, [activeTab, depsKey])

  return {
    containerRef,
    registerTabRef,
    indicatorStyle,
  }
}
