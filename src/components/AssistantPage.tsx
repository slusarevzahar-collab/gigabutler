"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion"

interface Message {
  id: string
  type: "assistant" | "user"
  content: string
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content: "Здравствуйте! Я ваш AI-помощник дворецкого. Чем могу помочь? Я могу помочь с запросами гостей, приоритизацией задач, информацией об отеле и многим другим.",
  },
]

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [scrollY, setScrollY] = useState(0)

  // Telegram-style swipe animation (унифицированный подход)
  const tabs = ["chat", "tips"]
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Измеряем ширину контейнера
  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      setContainerWidth(width)
      const initIndex = tabs.indexOf(activeTab)
      controls.set({ x: -initIndex * width })
    }
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
    const onResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      setContainerWidth(width)
      const idx = tabs.indexOf(activeTab)
      controls.set({ x: -idx * width })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
    const savedMessages = localStorage.getItem('assistantMessages')
    const savedActiveTab = localStorage.getItem('assistantActiveTab')
    const savedInputValue = localStorage.getItem('assistantInputValue')
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error('Failed to parse saved messages:', e)
      }
    }
    
    if (savedActiveTab && ['chat', 'tips'].includes(savedActiveTab)) {
      setActiveTab(savedActiveTab)
    }
    
    if (savedInputValue) {
      setInputValue(savedInputValue)
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('assistantMessages', JSON.stringify(messages))
  }, [messages])

  // Save input value to localStorage
  useEffect(() => {
    localStorage.setItem('assistantInputValue', inputValue)
  }, [inputValue])

  // Save active tab to localStorage
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    localStorage.setItem('assistantActiveTab', newTab)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop
    setScrollY(currentScrollY)
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          type: "user",
          content: inputValue,
        },
      ])
      setInputValue("")
    }
  }

  // Calculate header translation
  const headerTranslateY = -Math.min(scrollY, headerHeight)
  const tabsAreSticky = scrollY >= headerHeight

  return (
    <div className="flex flex-col h-full relative" data-stop-root-swipe="true">
      {/* Скрывающаяся верхняя часть */}
      <div 
        ref={headerRef}
        className="glass-effect border-0 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0 shadow-premium-md transition-transform"
        style={{ transform: `translateY(${headerTranslateY}px)` }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white bg-clip-text text-transparent">
          AI Ассистент
        </h1>
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
          <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => goToIndex(0)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all duration-150 border-b-2",
                activeTab === "chat" 
                  ? "text-primary border-primary" 
                  : "text-zinc-400 border-transparent"
              )}
            >
              Чат
            </button>
            <button
              onClick={() => goToIndex(1)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all duration-150 border-b-2",
                activeTab === "tips" 
                  ? "text-primary border-primary" 
                  : "text-zinc-400 border-transparent"
              )}
            >
              Советы (4)
            </button>
          </div>
        </div>
      </div>

      {/* Messages with Swipe */}
      <div className="flex-1 overflow-hidden relative">
        <div ref={containerRef} className="w-full h-full overflow-hidden">
          <motion.div
            className="flex h-full select-none"
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
            {/* Chat Tab Content */}
            <div 
              ref={scrollContainerRef}
              className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 min-w-full shrink-0 box-border pb-[calc(var(--app-bottom-bar-height,4rem)+5.5rem+env(safe-area-inset-bottom))]"
              onScroll={handleScroll}
            >
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={message.type === "assistant" ? "flex gap-2 sm:gap-3" : "flex gap-2 sm:gap-3 justify-end"}
                  >
                    {message.type === "assistant" && (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl gradient-premium-purple flex items-center justify-center flex-shrink-0 shadow-premium-md">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.1 }}
                      className={
                        message.type === "assistant"
                          ? "glass-effect rounded-3xl rounded-tl-lg p-3 sm:p-4 max-w-[80%] shadow-premium-md border-0"
                          : "gradient-premium-blue rounded-3xl rounded-tr-lg p-3 sm:p-4 max-w-[80%] text-white shadow-premium-md"
                      }
                    >
                      <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Tips Tab Content */}
            <div 
              className="h-full overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 min-w-full shrink-0 box-border pb-[calc(var(--app-bottom-bar-height,4rem)+5.5rem+env(safe-area-inset-bottom))]"
              onScroll={handleScroll}
            >
              <div className="text-center py-16 text-zinc-500 text-sm">
                Советы скоро появятся
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Input - поднято над нижним баром, чтобы не перекрывать навигацию */}
      <div className="absolute left-0 right-0 glass-effect border-0 border-t border-white/10 p-3 sm:p-4 shadow-premium-lg z-40 bottom-[calc(var(--app-bottom-bar-height,4rem)+env(safe-area-inset-bottom)+0.5rem)]">
        <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-2 text-center">
          AI может делать ошибки. Проверяйте важную информацию.
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 rounded-3xl text-sm h-11 sm:h-12 glass-effect border-0 shadow-premium-sm"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={handleSend}
            className="rounded-3xl gradient-premium-blue text-white flex-shrink-0 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center shadow-premium-md transition-all duration-150 hover:shadow-premium-lg"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}