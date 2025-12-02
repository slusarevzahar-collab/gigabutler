"use client"

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import BottomNavigation from "@/components/BottomNavigation"
import GuestsPage from "@/components/GuestsPage"
import TasksPage from "@/components/TasksPage"
import AssistantPage from "@/components/AssistantPage"
import ProfilePage from "@/components/ProfilePage"

const tabs = ["guests", "tasks", "assistant", "profile"]

export default function Home() {
  const [activeTab, setActiveTab] = useState("guests")

  const currentIndex = tabs.indexOf(activeTab)

  // Load theme from localStorage on mount (globally for all tabs)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Listen for theme changes from any component
    const handleThemeChange = (event: CustomEvent) => {
      const { theme } = event.detail
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    window.addEventListener('themeChange' as any, handleThemeChange)

    return () => {
      window.removeEventListener('themeChange' as any, handleThemeChange)
    }
  }, [])

  // Horizontal swipe between main tabs with finger tracking
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const didInitPositionRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const startClientXRef = useRef<number | null>(null)
  const startClientYRef = useRef<number | null>(null)
  const lockedAxisRef = useRef<"x" | "y" | null>(null)
  const x = useMotionValue(0)
  const animRef = useRef<any>(null)
  const dragConstraints = useMemo(() => ({ left: -((tabs.length - 1) * containerWidth), right: 0 }), [containerWidth])
  const pointerIdRef = useRef<number | null>(null)
  const rafScheduledRef = useRef(false)
  const lastDxRef = useRef(0)
  const dprRef = useRef(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
  const snap = (v: number) => Math.round(v * dprRef.current) / dprRef.current
  const isAnimatingRef = useRef(false)

  // Stop any running animation on unmount
  useEffect(() => {
    return () => {
      animRef.current?.stop?.()
    }
  }, [])

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab')
    if (savedTab && tabs.includes(savedTab)) {
      setActiveTab(savedTab)
    }
  }, [])

  // One-time silent alignment after we know width and activeTab (prevents initial snap/jitter)
  useEffect(() => {
    if (!didInitPositionRef.current && containerWidth > 0) {
      const idx = tabs.indexOf(activeTab)
      x.set(snap(-idx * containerWidth))
      didInitPositionRef.current = true
    }
  }, [activeTab, containerWidth, x])

  const handleTabChange = (newTab: string) => {
    const index = tabs.indexOf(newTab)
    if (containerWidth > 0) {
      animRef.current?.stop?.()
      isAnimatingRef.current = true
      const controls = animate(x, -index * containerWidth, { ease: "easeOut", duration: 0.26, onUpdate: (v) => x.set(snap(v)) })
      animRef.current = controls
      controls.finished.then(() => {
        setActiveTab(newTab)
        isAnimatingRef.current = false
        if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
          (window as any).requestIdleCallback(() => localStorage.setItem('activeTab', newTab))
        } else {
          setTimeout(() => localStorage.setItem('activeTab', newTab), 0)
        }
      })
    } else {
      // fallback if width is unknown – measure and align immediately
      const width = containerRef.current?.getBoundingClientRect().width || 0
      setActiveTab(newTab)
      if (width > 0) {
        setContainerWidth(width)
        x.set(snap(-index * width))
      }
      localStorage.setItem('activeTab', newTab)
    }
  }

  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.getBoundingClientRect().width
      dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      setContainerWidth(width)
      const initIndex = tabs.indexOf(activeTab)
      x.set(snap(-initIndex * width))
    }
    // optional: update on resize
    const onResize = () => {
      if (!containerRef.current || isDraggingRef.current || isAnimatingRef.current) return
      const width = containerRef.current.getBoundingClientRect().width
      dprRef.current = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      setContainerWidth(width)
      const idx = tabs.indexOf(activeTab)
      x.set(snap(-idx * width))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pointer-driven horizontal gesture (no Framer drag) to avoid jitter
  const handlePointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    // Ignore gestures that originate from nested components that explicitly stop root swipe (e.g., Assistant subtabs)
    const target = e.target as HTMLElement
    if (target?.closest?.('[data-stop-root-swipe="true"], [data-swipe-scope]')) {
      return
    }
    // capture start
    animRef.current?.stop?.()
    isDraggingRef.current = true
    dragStartXRef.current = x.get()
    startClientXRef.current = e.clientX
    startClientYRef.current = e.clientY
    lockedAxisRef.current = null
    pointerIdRef.current = e.pointerId
    try { el.setPointerCapture(e.pointerId) } catch {}

    const schedule = () => {
      if (rafScheduledRef.current) return
      rafScheduledRef.current = true
      requestAnimationFrame(() => {
        rafScheduledRef.current = false
        const dx = lastDxRef.current
        // Rubber-band on edges for smoother feel
        const minX = dragConstraints.left
        const raw = dragStartXRef.current + dx
        let nextX = raw
        if (raw > 0) {
          nextX = raw * 0.35
        } else if (raw < minX) {
          const beyond = raw - minX
          nextX = minX + beyond * 0.35
        }
        x.set(snap(nextX))
      })
    }

    const handleMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current || startClientXRef.current == null || startClientYRef.current == null) return
      const dx = ev.clientX - startClientXRef.current
      const dy = ev.clientY - startClientYRef.current
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)

      if (!lockedAxisRef.current) {
        const ratioX = absY === 0 ? Infinity : absX / absY
        const ratioY = absX === 0 ? Infinity : absY / absX
        if (absX > 14 && ratioX >= 2) {
          lockedAxisRef.current = "x"
          try { el.style.touchAction = "none" } catch {}
          // lock page scroll to prevent address bar/overscroll jitter
          try { (document.documentElement as HTMLElement).style.overscrollBehaviorY = "none" } catch {}
        } else if (absY > 16 && ratioY >= 2) {
          lockedAxisRef.current = "y"
        }
      }

      if (lockedAxisRef.current === "x") {
        ev.preventDefault()
        lastDxRef.current = dx
        schedule()
      } else if (lockedAxisRef.current === "y") {
        // abort horizontal drag gracefully: snap back to current slide immediately
        const idx = tabs.indexOf(activeTab)
        x.set(snap(-idx * containerWidth))
        cleanup()
      }
    }

    const handleUp = () => {
      if (!isDraggingRef.current) { cleanup(); return }
      // if we didn't lock to x, just cleanup
      if (lockedAxisRef.current !== "x") { cleanup(); return }

      // Use actually rendered x, apply directional threshold (prevents indecisive snaps)
      const currentX = x.get()
      const current = tabs.indexOf(activeTab)
      let next = current
      const progressFromCurrent = (-currentX / containerWidth) - current
      const threshold = 0.2
      if (progressFromCurrent > threshold && current < tabs.length - 1) next = current + 1
      else if (progressFromCurrent < -threshold && current > 0) next = current - 1

      isAnimatingRef.current = true
      const controls = animate(x, -next * containerWidth, { ease: "easeOut", duration: 0.26, onUpdate: (v) => x.set(snap(v)) })
      animRef.current = controls
      controls.finished.then(() => {
        const now = tabs.indexOf(activeTab)
        if (next !== now) {
          const nextTab = tabs[next]
          setActiveTab(nextTab)
          if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
            (window as any).requestIdleCallback(() => localStorage.setItem('activeTab', nextTab))
          } else {
            setTimeout(() => localStorage.setItem('activeTab', nextTab), 0)
          }
        }
        isAnimatingRef.current = false
      })
      cleanup()
    }

    const handleCancel = () => {
      cleanup()
    }

    const cleanup = () => {
      isDraggingRef.current = false
      lockedAxisRef.current = null
      rafScheduledRef.current = false
      try { if (pointerIdRef.current != null) el.releasePointerCapture(pointerIdRef.current) } catch {}
      try { el.style.touchAction = "pan-y" } catch {}
      // restore page scroll
      try { (document.documentElement as HTMLElement).style.overscrollBehaviorY = "" } catch {}
      window.removeEventListener('pointermove', handleMove as any)
      window.removeEventListener('pointerup', handleUp as any)
      window.removeEventListener('pointercancel', handleCancel as any)
    }

    window.addEventListener('pointermove', handleMove, { passive: false })
    window.addEventListener('pointerup', handleUp, { passive: true })
    window.addEventListener('pointercancel', handleCancel, { passive: true })
  }

  return (
    <div className="h-[100svh] overscroll-none flex flex-col bg-gradient-to-br from-zinc-50 via-blue-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 overflow-hidden">
      {/* Main Content - теперь со свайпом */}
      <div className="flex-1 overflow-hidden relative">
        <div ref={containerRef} className="w-full h-full overflow-hidden">
          <motion.div
            className="flex h-full select-none transform-gpu"
            onPointerDown={handlePointerDown}
            draggable={false}
            style={{ x, touchAction: "pan-y", willChange: "transform", overscrollBehaviorX: "none", overscrollBehaviorY: "none", backfaceVisibility: "hidden" }}
          >
            <div className="min-w-full shrink-0 h-full overflow-hidden" style={{ scrollbarGutter: "stable" }}>
              <GuestsPage />
            </div>
            <div className="min-w-full shrink-0 h-full overflow-hidden" style={{ scrollbarGutter: "stable" }}>
              <TasksPage />
            </div>
            <div className="min-w-full shrink-0 h-full overflow-hidden" style={{ scrollbarGutter: "stable" }}>
              <AssistantPage />
            </div>
            <div className="min-w-full shrink-0 h-full overflow-hidden" style={{ scrollbarGutter: "stable" }}>
              <ProfilePage />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}