"use client"

import { useState, useEffect } from "react"
import { Camera, ChevronDown, ChevronRight, Users, Calendar, Activity, Moon, Bell, Globe, Languages, Settings, Shield, HelpCircle, Info, Edit2, Check, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

interface ShiftDay {
  date: string
  day: string
  dateNum: string
  startTime: string
  endTime: string
  isWorking: boolean
  isCurrent?: boolean
}

const defaultShifts: ShiftDay[] = [
  { date: "10 ноя", day: "Пн", dateNum: "10", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "11 ноя", day: "Вт", dateNum: "11", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "12 ноя", day: "Ср", dateNum: "12", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "13 ноя", day: "Чт", dateNum: "13", startTime: "08:00", endTime: "20:00", isWorking: true, isCurrent: true },
  { date: "14 ноя", day: "Пт", dateNum: "14", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "15 ноя", day: "Сб", dateNum: "15", startTime: "—", endTime: "—", isWorking: false },
  { date: "16 ноя", day: "Вс", dateNum: "16", startTime: "—", endTime: "—", isWorking: false },
  { date: "17 ноя", day: "Пн", dateNum: "17", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "18 ноя", day: "Вт", dateNum: "18", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "19 ноя", day: "Ср", dateNum: "19", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "20 ноя", day: "Чт", dateNum: "20", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "21 ноя", day: "Пт", dateNum: "21", startTime: "08:00", endTime: "20:00", isWorking: true },
  { date: "22 ноя", day: "Сб", dateNum: "22", startTime: "—", endTime: "—", isWorking: false },
  { date: "23 ноя", day: "Вс", dateNum: "23", startTime: "—", endTime: "—", isWorking: false },
]

const defaultProfileData = {
  name: "John Doe",
  position: "Butler",
  hotel: "Grand Hotel",
  email: "john.doe@grandhotel.com"
}

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    shift: true,
    actions: false,
  })
  
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [profileData, setProfileData] = useState(defaultProfileData)
  const [tempProfileData, setTempProfileData] = useState(profileData)

  const [shifts, setShifts] = useState<ShiftDay[]>(defaultShifts)
  const [selectedShiftIndex, setSelectedShiftIndex] = useState<number | null>(null)
  const [tempShift, setTempShift] = useState<ShiftDay | null>(null)

  const [lastScrollY, setLastScrollY] = useState(0)
  const [showHeader, setShowHeader] = useState(true)

  const currentShift = shifts.find(s => s.isCurrent)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedProfileData = localStorage.getItem('profileData')
    const savedShifts = localStorage.getItem('profileShifts')
    const savedExpandedSections = localStorage.getItem('profileExpandedSections')
    
    if (savedProfileData) {
      try {
        const parsed = JSON.parse(savedProfileData)
        setProfileData(parsed)
        setTempProfileData(parsed)
      } catch (e) {
        console.error('Failed to parse saved profile data:', e)
      }
    }
    
    if (savedShifts) {
      try {
        setShifts(JSON.parse(savedShifts))
      } catch (e) {
        console.error('Failed to parse saved shifts:', e)
      }
    }
    
    if (savedExpandedSections) {
      try {
        setExpandedSections(JSON.parse(savedExpandedSections))
      } catch (e) {
        console.error('Failed to parse saved expanded sections:', e)
      }
    }
  }, [])

  // Save profile data to localStorage
  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData))
  }, [profileData])

  // Save shifts to localStorage
  useEffect(() => {
    localStorage.setItem('profileShifts', JSON.stringify(shifts))
  }, [shifts])

  // Save expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem('profileExpandedSections', JSON.stringify(expandedSections))
  }, [expandedSections])

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Определяем направление скролла
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      // Скроллим вниз - скрываем заголовок
      setShowHeader(false);
    } else if (currentScrollY < lastScrollY) {
      // Скроллим вверх - показываем заголовок
      setShowHeader(true);
    }
    
    // Если в самом верху - всегда показываем заголовок
    if (currentScrollY < 10) {
      setShowHeader(true);
    }
    
    setLastScrollY(currentScrollY);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    const newTheme = newDarkMode ? 'dark' : 'light'
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    // Dispatch custom event to sync theme across all tabs
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme } 
    }))
  }

  const handleProfileEdit = () => {
    setTempProfileData(profileData)
    setIsProfileDialogOpen(true)
  }

  const handleProfileSave = () => {
    setProfileData(tempProfileData)
    setIsProfileDialogOpen(false)
  }

  const handleShiftClick = (index: number) => {
    setSelectedShiftIndex(index)
    setTempShift({ ...shifts[index] })
  }

  const handleShiftSave = () => {
    if (selectedShiftIndex !== null && tempShift) {
      const newShifts = [...shifts]
      newShifts[selectedShiftIndex] = tempShift
      setShifts(newShifts)
      setSelectedShiftIndex(null)
      setTempShift(null)
    }
  }

  const handleShiftCancel = () => {
    setSelectedShiftIndex(null)
    setTempShift(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Premium Header */}
      <motion.div 
        className="glass-effect border-0 border-b border-white/10 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0 shadow-premium-md"
        animate={{ 
          y: showHeader ? 0 : -100,
          opacity: showHeader ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white bg-clip-text text-transparent">
          Профиль
        </h1>
      </motion.div>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))]" onScroll={handleScroll}>
        <div className="px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4">
          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-effect rounded-3xl p-5 sm:p-6 shadow-premium-md border-0"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-5">
              <div className="relative">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 gradient-premium-blue shadow-premium-md">
                  <AvatarFallback className="gradient-premium-blue text-white text-xl sm:text-2xl font-semibold">
                    {profileData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 gradient-premium-purple rounded-full flex items-center justify-center text-white shadow-premium-md"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold truncate">{profileData.name}</h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{profileData.position} • {profileData.hotel}</p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{profileData.email}</p>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-xs sm:text-sm font-medium">Напарники</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 glass-effect rounded-full px-3 py-1.5 shadow-premium-sm">
                  <Avatar className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 to-cyan-400">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-[10px] sm:text-xs">АИ</AvatarFallback>
                  </Avatar>
                  <span className="text-xs sm:text-sm">Алексей Иванов</span>
                </div>
                <div className="flex items-center gap-2 glass-effect rounded-full px-3 py-1.5 shadow-premium-sm">
                  <Avatar className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-400 to-pink-400">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-[10px] sm:text-xs">МП</AvatarFallback>
                  </Avatar>
                  <span className="text-xs sm:text-sm">Мария Петрова</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.1 }}
              onClick={handleProfileEdit}
              className="w-full gradient-premium-blue text-white rounded-2xl text-sm sm:text-base h-11 sm:h-12 shadow-premium-md transition-all duration-150 hover:shadow-premium-lg flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Редактировать профиль
            </motion.button>
          </motion.div>

          {/* Shift Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.03 }}
            className="glass-effect rounded-3xl shadow-premium-md overflow-hidden border-0"
          >
            <motion.button
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.1 }}
              onClick={() => toggleSection("shift")}
              className="w-full flex items-center justify-between p-4 sm:p-5 transition-all duration-150"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
                <span className="font-semibold text-base sm:text-lg">График смен</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.shift ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {expandedSections.shift && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 sm:px-5 pb-4 sm:pb-5"
                >
                  {/* Grid of days */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {shifts.map((shift, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => handleShiftClick(index)}
                        className={`
                          relative rounded-2xl aspect-[3/4] flex flex-col items-center justify-center p-1 sm:p-2 transition-all duration-150 shadow-premium-sm
                          ${shift.isCurrent 
                            ? 'gradient-premium-blue text-white shadow-premium-md' 
                            : shift.isWorking 
                              ? 'glass-effect text-zinc-800 dark:text-zinc-200' 
                              : 'glass-effect text-zinc-500 dark:text-zinc-400'}
                        `}
                      >
                        <div className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">{shift.day}</div>
                        <div className="text-sm sm:text-lg font-bold mb-0.5 sm:mb-1">{shift.dateNum}</div>
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Current shift info */}
                  {currentShift && currentShift.isWorking && (
                    <div className="glass-effect rounded-2xl p-3 sm:p-4 shadow-premium-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Текущая смена:</span>
                        <span className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                          {currentShift.startTime} - {currentShift.endTime}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.06 }}
            className="glass-effect rounded-3xl shadow-premium-md overflow-hidden border-0"
          >
            <motion.button
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.1 }}
              onClick={() => toggleSection("actions")}
              className="w-full flex items-center justify-between p-4 sm:p-5 transition-all duration-150"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium text-sm sm:text-base">История действий</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.actions ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Dark Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.09 }}
            className="glass-effect rounded-3xl p-4 sm:p-5 shadow-premium-md border-0 cursor-pointer"
            onClick={toggleDarkMode}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-medium text-sm sm:text-base">Темная тема</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} onClick={(e) => e.stopPropagation()} />
            </div>
          </motion.div>

          {/* Settings Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.12 }}
            className="glass-effect rounded-3xl shadow-premium-md overflow-hidden border-0"
          >
            <MenuItem icon={Bell} label="Уведомления" />
            <MenuItem icon={Globe} label="Appearance" />
            <MenuItem icon={Languages} label="Язык" value="Русский" />
            <MenuItem icon={Settings} label="Настройки" />
            <MenuItem icon={Shield} label="Конфиденциальность" />
            <MenuItem icon={HelpCircle} label="Помощь" />
            <MenuItem icon={Info} label="About" showBorder={false} />
          </motion.div>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Редактировать профиль</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Измените информацию о вашем профиле
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Имя</Label>
              <Input
                id="name"
                value={tempProfileData.name}
                onChange={(e) => setTempProfileData({ ...tempProfileData, name: e.target.value })}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position" className="text-xs sm:text-sm">Должность</Label>
              <Input
                id="position"
                value={tempProfileData.position}
                onChange={(e) => setTempProfileData({ ...tempProfileData, position: e.target.value })}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotel" className="text-xs sm:text-sm">Отель</Label>
              <Input
                id="hotel"
                value={tempProfileData.hotel}
                onChange={(e) => setTempProfileData({ ...tempProfileData, hotel: e.target.value })}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={tempProfileData.email}
                onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)} className="text-sm h-9">
              Отмена
            </Button>
            <Button onClick={handleProfileSave} className="bg-blue-500 hover:bg-blue-600 text-white text-sm h-9">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Edit Dialog */}
      <Dialog open={selectedShiftIndex !== null} onOpenChange={(open) => !open && handleShiftCancel()}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Редактировать смену</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {tempShift && `${tempShift.day}, ${tempShift.date}`}
            </DialogDescription>
          </DialogHeader>
          {tempShift && (
            <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="isWorking" className="flex-1 text-xs sm:text-sm">Рабочий день</Label>
                <Switch
                  id="isWorking"
                  checked={tempShift.isWorking}
                  onCheckedChange={(checked) => setTempShift({ 
                    ...tempShift, 
                    isWorking: checked,
                    startTime: checked ? "08:00" : "—",
                    endTime: checked ? "20:00" : "—"
                  })}
                />
              </div>
              {tempShift.isWorking && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime" className="text-xs sm:text-sm">Начало смены</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={tempShift.startTime}
                      onChange={(e) => setTempShift({ ...tempShift, startTime: e.target.value })}
                      className="text-sm sm:text-base h-9 sm:h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime" className="text-xs sm:text-sm">Конец смены</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={tempShift.endTime}
                      onChange={(e) => setTempShift({ ...tempShift, endTime: e.target.value })}
                      className="text-sm sm:text-base h-9 sm:h-10"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleShiftCancel} className="text-sm h-9">
              Отмена
            </Button>
            <Button onClick={handleShiftSave} className="bg-blue-500 hover:bg-blue-600 text-white text-sm h-9">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              ОК
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuItem({ icon: Icon, label, value, showBorder = true }: {icon: any; label: string; value?: string; showBorder?: boolean}) {
  return (
    <motion.button
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.1 }}
      className={`w-full flex items-center justify-between p-4 sm:p-5 transition-all duration-150 ${
        showBorder ? "border-b border-white/10" : ""
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
        <span className="font-medium text-sm sm:text-base">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{value}</span>}
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
      </div>
    </motion.button>
  )
}