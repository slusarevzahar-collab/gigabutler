"use client"

import { Users, ClipboardList, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useLayoutEffect, useRef } from "react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "guests", label: "Гости", icon: Users },
    { id: "tasks", label: "Задачи", icon: ClipboardList },
    { id: "assistant", label: "AI", icon: Bot },
    { id: "profile", label: "Профиль", icon: User },
  ]

  const navRef = useRef<HTMLElement | null>(null)

  // Measure bar height and expose as CSS var for safe content padding
  useLayoutEffect(() => {
    const setBarHeightVar = () => {
      const h = navRef.current?.offsetHeight || 0
      try {
        document.documentElement.style.setProperty("--app-bottom-bar-height", `${h}px`)
      } catch {}
    }
    setBarHeightVar()
    window.addEventListener("resize", setBarHeightVar)
    window.addEventListener("orientationchange", setBarHeightVar)
    return () => {
      window.removeEventListener("resize", setBarHeightVar)
      window.removeEventListener("orientationchange", setBarHeightVar)
    }
  }, [])

  return (
    <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 pointer-events-auto">
      <div className="glass-effect-strong rounded-3xl shadow-premium-xl border-0">
        <div className="flex items-center justify-around min-h-16 px-2 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-150 px-1 py-2"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className={cn(
                    "relative rounded-2xl px-4 py-2 transition-all duration-150",
                    isActive && "gradient-premium-blue shadow-premium-md"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-150",
                    isActive ? "text-white" : "text-zinc-700 dark:text-zinc-300"
                  )} />
                </motion.div>
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.85,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                  className={cn(
                    "text-[10px] sm:text-xs font-medium leading-tight text-center transition-all duration-150",
                    isActive ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {tab.label}
                </motion.span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}