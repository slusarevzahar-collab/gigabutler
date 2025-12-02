"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Plus, MoreVertical, Clock, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, PanInfo, useMotionValue, useAnimation } from "framer-motion"

interface Task {
  id: string
  category: "main" | "office" | "completed"
  title: string
  description: string
  assignee: string
  time: string
  priority?: "normal" | "high"
  status: "normal" | "pending" | "in-progress"
}

const mockTasks: Task[] = [
  {
    id: "1",
    category: "office",
    title: "Update guest database",
    description: "Add new VIP guests to system",
    assignee: "Hotel Management",
    time: "02:00 PM",
    priority: "normal",
    status: "normal",
  },
  {
    id: "2",
    category: "office",
    title: "Prepare monthly report",
    description: "Due by end of day",
    assignee: "Front Desk",
    time: "10:00 AM",
    priority: "high",
    status: "in-progress",
  },
]

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("office")
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [scrollY, setScrollY] = useState(0)
  
  // Telegram-style swipe animation (унифицированный подход)
  const tabs = ["main", "office", "completed"]
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Измеряем ширину контейнера и выставляем начальную позицию
  useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)
        const initIndex = tabs.indexOf(activeTab)
        controls.set({ x: -initIndex * width })
      }
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
    }
    measure()
    const onResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      setContainerWidth(width)
      const idx = tabs.indexOf(activeTab)
      controls.set({ x: -idx * width })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Функция программного переключения
  const goToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(tabs.length - 1, index))
    setActiveTab(tabs[clamped])
    controls.start({
      x: -clamped * containerWidth,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    })
  }

  // Обработчик свайпа
  const handleDragEnd = (_event: any, info: PanInfo) => {
    const swipeThreshold = containerWidth * 0.4
    const velocityThreshold = 500

    const offsetX = info.offset.x
    const velocityX = info.velocity.x

    const currentIndex = tabs.indexOf(activeTab)
    let newIndex = currentIndex

    if (Math.abs(velocityX) > velocityThreshold) {
      if (velocityX < 0 && currentIndex < tabs.length - 1) {
        newIndex = currentIndex + 1
      } else if (velocityX > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1
      }
    } else if (Math.abs(offsetX) > swipeThreshold) {
      if (offsetX < 0 && currentIndex < tabs.length - 1) {
        newIndex = currentIndex + 1
      } else if (offsetX > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1
      }
    }

    goToIndex(newIndex)
  }

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    const savedActiveTab = localStorage.getItem('tasksActiveTab')
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Failed to parse saved tasks:', e)
      }
    }
    
    if (savedActiveTab && ['main', 'office', 'completed'].includes(savedActiveTab)) {
      setActiveTab(savedActiveTab)
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  // Save active tab to localStorage
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    localStorage.setItem('tasksActiveTab', newTab)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop
    setScrollY(currentScrollY)
  }

  const mainCount = tasks.filter((t) => t.category === "main").length
  const officeCount = tasks.filter((t) => t.category === "office").length
  const completedCount = tasks.filter((t) => t.category === "completed").length

  // Calculate header translation
  const headerTranslateY = -Math.min(scrollY, headerHeight)
  const tabsAreSticky = scrollY >= headerHeight

  return (
    <div className="flex flex-col h-full">
      {/* Скрывающаяся верхняя часть */}
      <div 
        ref={headerRef}
        className="glass-effect border-0 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0 shadow-premium-md transition-transform"
        style={{ transform: `translateY(${headerTranslateY}px)` }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white bg-clip-text text-transparent">
            Задачи
          </h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="rounded-2xl h-10 w-10 sm:h-11 sm:w-11 gradient-premium-blue text-white shadow-premium-md flex items-center justify-center transition-all duration-150 hover:shadow-premium-lg"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Подвкладки - прилипают когда достигают верха */}
      <div 
        className={cn(
          "glass-effect border-0 border-b border-white/10 px-4 sm:px-6 flex-shrink-0 shadow-premium-md transition-all",
          tabsAreSticky ? "sticky top-0 z-10" : ""
        )}
        data-stop-root-swipe
        onPointerDown={(e) => e.stopPropagation()}
        style={!tabsAreSticky ? { transform: `translateY(${headerTranslateY}px)` } : {}}
      >
        <div className="py-4 sm:py-5">
          <div className="w-full grid grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => goToIndex(0)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all duration-150 border-b-2",
                activeTab === "main" 
                  ? "text-primary border-primary" 
                  : "text-zinc-400 border-transparent"
              )}
            >
              Основные ({mainCount})
            </button>
            <button
              onClick={() => goToIndex(1)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all duration-150 border-b-2",
                activeTab === "office" 
                  ? "text-primary border-primary" 
                  : "text-zinc-400 border-transparent"
              )}
            >
              Офис ({officeCount})
            </button>
            <button
              onClick={() => goToIndex(2)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all duration-150 border-b-2",
                activeTab === "completed" 
                  ? "text-primary border-primary" 
                  : "text-zinc-400 border-transparent"
              )}
            >
              Выполнено ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Task List with Telegram-style Swipe */}
      <div className="flex-1 overflow-hidden relative">
        <div ref={containerRef} className="w-full h-full overflow-hidden">
          <motion.div
            className="flex h-full"
            data-swipe-scope
            onPointerDown={(e) => e.stopPropagation()}
            drag="x"
            dragElastic={0.05}
            dragMomentum={false}
            dragDirectionLock
            dragConstraints={{ left: -((tabs.length - 1) * containerWidth), right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ touchAction: "pan-y", willChange: "transform" }}
          >
            {/* Main Tab Content */}
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] min-w-full shrink-0 box-border"
              onScroll={handleScroll}
            >
              <div className="space-y-3 sm:space-y-4">
                {tasks.filter((t) => t.category === "main").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            
            {/* Office Tab Content */}
            <div 
              className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] min-w-full shrink-0 box-border"
              onScroll={handleScroll}
            >
              <div className="space-y-3 sm:space-y-4">
                {tasks.filter((t) => t.category === "office").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            
            {/* Completed Tab Content */}
            <div 
              className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] min-w-full shrink-0 box-border"
              onScroll={handleScroll}
            >
              <div className="space-y-3 sm:space-y-4">
                {tasks.filter((t) => t.category === "completed").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-effect rounded-3xl p-4 sm:p-5 shadow-premium-md transition-all duration-150 hover:shadow-premium-lg border-0"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Category Badge */}
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 gradient-premium-purple rounded-2xl flex-shrink-0 shadow-premium-sm">
          <span className="text-xs sm:text-sm font-semibold text-white">Office</span>
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="text-zinc-400 hover:text-zinc-600 flex-shrink-0 rounded-xl p-1.5 glass-effect transition-all duration-150"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-3 glass-effect px-2 py-1.5 rounded-xl w-fit">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="truncate">{task.assignee}</span>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
            <span>{task.time}</span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {task.priority === "high" && (
              <Badge variant="outline" className="glass-effect border-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5 shadow-premium-sm">
                <span className="mr-1">⚠</span> high
              </Badge>
            )}
            {task.status === "normal" && (
              <Badge variant="outline" className="glass-effect border-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 shadow-premium-sm">
                <span className="mr-1">○</span> normal
              </Badge>
            )}
            {task.status === "pending" && (
              <Badge variant="outline" className="glass-effect border-0 text-zinc-600 dark:text-zinc-400 text-xs px-2 py-0.5 shadow-premium-sm">
                <span className="mr-1">○</span> Pending
              </Badge>
            )}
            {task.status === "in-progress" && (
              <Badge variant="outline" className="glass-effect border-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 shadow-premium-sm">
                <span className="mr-1">◉</span> In Progress
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 glass-effect rounded-2xl px-3 py-2">
            {task.description}
          </div>
        </div>
      </div>
    </motion.div>
  )
}