"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Search, Plus, ChevronDown, MessageCircle, Users, Baby, Phone, X, User, ChevronRight, ChevronLeft, Car, Camera, Trash2, FileText, Copy, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, PanInfo, useMotionValue, animate } from "framer-motion";

interface Guest {
  id: string;
  room: string;
  roomType: string;
  name: string;
  guestCount: number;
  childCount?: number;
  babyCount?: number;
  status: "staying" | "expected" | "checked-out";
  statusColor: "green" | "orange" | "gray";
  dates?: { from: string; to: string };
  phone?: string;
  transfers?: Array<{ date: string; room: string; roomType: string; note: string }>;
  car?: { make: string; model: string; number: string; transportType?: "Такси" | "Личный автомобиль" | "Трансфер" };
  photos?: string[];
}

const roomTypeColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  DTS: { bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/30 dark:from-blue-500/30 dark:to-blue-600/40 backdrop-blur-xl", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  DKS: { bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/30 dark:from-purple-500/30 dark:to-purple-600/40 backdrop-blur-xl", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
  DKG: { bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 dark:from-emerald-500/30 dark:to-emerald-600/40 backdrop-blur-xl", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  DTG: { bg: "bg-gradient-to-br from-green-500/20 to-green-600/30 dark:from-green-500/30 dark:to-green-600/40 backdrop-blur-xl", text: "text-green-700 dark:text-green-300", badge: "bg-green-500/20 text-green-700 dark:text-green-300" },
  XJG: { bg: "bg-gradient-to-br from-rose-500/20 to-rose-600/30 dark:from-rose-500/30 dark:to-rose-600/40 backdrop-blur-xl", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-500/20 text-rose-700 dark:text-rose-300" },
  XJS: { bg: "bg-gradient-to-br from-pink-500/20 to-pink-600/30 dark:from-pink-500/30 dark:to-pink-600/40 backdrop-blur-xl", text: "text-pink-700 dark:text-pink-300", badge: "bg-pink-500/20 text-pink-700 dark:text-pink-300" },
  CDG: { bg: "bg-gradient-to-br from-teal-500/20 to-teal-600/30 dark:from-teal-500/30 dark:to-teal-600/40 backdrop-blur-xl", text: "text-teal-700 dark:text-teal-300", badge: "bg-teal-500/20 text-teal-700 dark:text-teal-300" },
};

function getRoomTypeColors(roomType: string) {
  return roomTypeColors[roomType] || { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300", badge: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300" };
}

function getLastName(fullName: string): string {
  return fullName.split(" ")[0];
}

// helpers: smooth color interpolation between amber -> green based on progress
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(fromHex: string, toHex: string, t: number) {
  const a = hexToRgb(fromHex);
  const b = hexToRgb(toHex);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bb = Math.round(lerp(a.b, b.b, t));
  return rgbToHex(r, g, bb);
}

// ИСПРАВЛЕНО: Шаблоны с динамическими данными гостя
const getTemplates = (guest: Guest | null) => [
  {
    title: "PRE-ARRIVAL",
    content: `Добрый день! 👋\n\nМы рады приветствовать Вас в нашем отеле. Ваше заселение запланировано на ${guest?.dates?.from || "[дата]"}.\n\n📍 Номер комнаты: ${guest?.room || "[номер]"} (${guest?.roomType || "[тип]"})\n⏰ Время заселения: с 14:00\n🔑 Регистрация на ресепшн\n\nЕсли у Вас есть особые пожелания или вопросы, пожалуйста, дайте нам знать.\n\nС уважением,\nКоманда отеля`,
  },
  {
    title: "Список ресторанов",
    content: `🍽 Рестораны и кафе нашего отеля:\n\n🥐 Завтрак\n⏰ 07:00 - 11:00\n📍 Главный ресторан, 1 этаж\n\n🍝 Обед и ужин\n⏰ 12:00 - 23:00\n📍 Главный ресторан, 1 этаж\n\n☕️ Кофейня\n⏰ 08:00 - 22:00\n📍 Лобби\n\n🍸 Бар\n⏰ 18:00 - 02:00\n📍  5 этаж\n\nПриятного аппетита!`,
  },
  {
    title: "Информация о СПА",
    content: `💆‍♀️ СПА и Wellness центр\n\n🏊‍♂️ Бассейн: 06:00 - 23:00\n🧖‍♀️ Сауна: 10:00 - 22:00\n💪 Фитнес-зал: 24/7\n💆‍♂️ Массаж: по предварительной записи\n\n📞 Запись: доб. 100\n📍 Расположение: 2 этаж, секция B\n\nБудем рады видеть Вас!`,
  },
  {
    title: "Check-out информация",
    content: `📋 Информация о выезде\n\n⏰ Время выезда: до 12:00\n🔑 Сдать ключи на ресепшн\n💳 Оплата дополнительных услуг\n\n📦 Поздний выезд (Late check-out):\n   • До 18:00 - 50% от стоимости\n   • После 18:00 - полная стоимость\n\n🚖 Трансфер до аэропорта - по запросу\n\nСпасибо, что выбрали наш отель! 🙏`,
  },
  {
    title: "Услуги отеля",
    content: `🏨 Услуги и удобства:\n\n📶 Wi-Fi: бесплатно (пароль на ресепшн)\n🅿️ Парковка: подземная, бесплатно\n🧺 Прачечная: доб. 200\n🧹 Уборка номера: ежедневно\n🍽 Room service: 24/7 (доб. 300)\n\n🎯 Дополнительно:\n• Экскурсионное бюро\n• Аренда автомобилей\n• Услуги консьержа\n\n📞 Ресепшн 24/7: доб. 0`,
  },
  {
    title: "Приветствие при заселении",
    content: `Добро пожаловать! 🎉\n\nБлагодарим за выбор нашего отеля!\n\n🔑 Ваш номер: ${guest?.room || "[номер]"} (${guest?.roomType || "[тип]"})\n👤 Гость: ${guest?.name || "[имя]"}\n📅 Проживание: ${guest?.dates?.from || "[дата]"} - ${guest?.dates?.to || "[дата]"}\n\nЖелаем приятного отдыха! Если потребуется помощь, мы всегда на связи.\n\nС уважением,\nАдминистрация отеля`,
  },
];

const mockGuestsData: Guest[] = [
  { id: "1", room: "1101", roomType: "XJG", name: "Петров Александр Иванович", guestCount: 2, childCount: 2, status: "staying", statusColor: "green", dates: { from: "1 ноя", to: "8 ноя" }, phone: "+7 (999) 123-45-67" },
  { id: "2", room: "1102", roomType: "DTG", name: "Сидорова Елена Петровна", guestCount: 1, childCount: 1, status: "staying", statusColor: "green", dates: { from: "28 окт", to: "10 ноя" }, phone: "+7 (999) 234-56-78" },
  { id: "3", room: "1103", roomType: "DTG", name: "Козлов Дмитрий Сергеевич", guestCount: 2, childCount: 2, status: "staying", statusColor: "green", dates: { from: "3 ноя", to: "15 ноя" }, phone: "+7 (999) 345-67-89", car: { make: "BMW", model: "X5", number: "А123ВС777", transportType: "Личный автомобиль" } },
  { id: "4", room: "1104", roomType: "DKG", name: "Морозова Анна Викторовна", guestCount: 2, status: "staying", statusColor: "green", dates: { from: "30 окт", to: "7 ноя" }, phone: "+7 (999) 456-78-90" },
  { id: "5", room: "1105", roomType: "DTG", name: "Новиков Игорь Владимирович", guestCount: 1, childCount: 2, babyCount: 1, status: "staying", statusColor: "green", dates: { from: "2 ноя", to: "12 ноя" }, phone: "+7 (999) 567-89-01" },
  { id: "6", room: "1106", roomType: "DKG", name: "Волков Сергей Михайлович", guestCount: 2, status: "staying", statusColor: "green", dates: { from: "29 окт", to: "9 ноя" }, phone: "+7 (999) 678-90-12", car: { make: "Mercedes", model: "E-Class", number: "В456ТС199", transportType: "Личный автомобиль" } },
  { id: "7", room: "1107", roomType: "DTG", name: "Соколова Ольга Андреевна", guestCount: 2, childCount: 1, status: "staying", statusColor: "green", dates: { from: "1 ноя", to: "11 ноя" }, phone: "+7 (999) 789-01-23" },
  { id: "8", room: "1108", roomType: "DKG", name: "Лебедев Максим Николаевич", guestCount: 2, status: "staying", statusColor: "green", dates: { from: "31 окт", to: "8 ноя" }, phone: "+7 (999) 890-12-34" },
  { id: "9", room: "1109", roomType: "DTG", name: "Павлов Андрей Геннадьевич", guestCount: 2, childCount: 3, status: "staying", statusColor: "green", dates: { from: "27 окт", to: "13 ноя" }, phone: "+7 (999) 901-23-45", car: { make: "Audi", model: "Q7", number: "С789НО123", transportType: "Личный автомобиль" } },
  { id: "10", room: "1110", roomType: "DKG", name: "Егорова Татьяна Олеговна", guestCount: 1, childCount: 1, status: "staying", statusColor: "green", dates: { from: "3 ноя", to: "10 ноя" }, phone: "+7 (999) 012-34-56" },
  { id: "11", room: "1111", roomType: "CDG", name: "Федоров Виктор Павлович", guestCount: 2, status: "staying", statusColor: "green", dates: { from: "2 ноя", to: "14 ноя" }, phone: "+7 (999) 123-56-78", car: { make: "Lexus", model: "RX350", number: "Т234АВ777", transportType: "Личный автомобиль" } },
  { id: "12", room: "1112", roomType: "CDG", name: "Романов Евгений Сергеевич", guestCount: 2, childCount: 2, status: "staying", statusColor: "green", dates: { from: "29 окт", to: "12 ноя" }, phone: "+7 (999) 234-67-89" },
  { id: "13", room: "1113", roomType: "DTG", name: "Кузнецов Николай Иванович", guestCount: 2, status: "expected", statusColor: "orange", dates: { from: "6 ноя", to: "13 ноя" }, phone: "+7 (999) 345-78-90" },
  { id: "14", room: "1114", roomType: "DKG", name: "Смирнова Марина Алексеевна", guestCount: 1, childCount: 1, status: "expected", statusColor: "orange", dates: { from: "7 ноя", to: "14 ноя" }, phone: "+7 (999) 456-89-01" },
  { id: "15", room: "1115", roomType: "DTG", name: "Белов Артем Дмитриевич", guestCount: 2, childCount: 2, babyCount: 1, status: "expected", statusColor: "orange", dates: { from: "8 ноя", to: "18 ноя" }, phone: "+7 (999) 567-90-12", car: { make: "Toyota", model: "Land Cruiser", number: "М567КР199", transportType: "Личный автомобиль" } },
  { id: "16", room: "1116", roomType: "DKG", name: "Захарова Ирина Владимировна", guestCount: 2, status: "expected", statusColor: "orange", dates: { from: "6 ноя", to: "15 ноя" }, phone: "+7 (999) 678-01-23" },
  { id: "17", room: "1117", roomType: "DTG", name: "Михайлов Константин Петрович", guestCount: 1, childCount: 2, status: "expected", statusColor: "orange", dates: { from: "7 ноя", to: "16 ноя" }, phone: "+7 (999) 789-12-34" },
  { id: "18", room: "1118", roomType: "DKG", name: "Григорьева Светлана Юрьевна", guestCount: 2, childCount: 1, status: "expected", statusColor: "orange", dates: { from: "9 ноя", to: "17 ноя" }, phone: "+7 (999) 890-23-45" },
  { id: "19", room: "1119", roomType: "DTG", name: "Васильев Георгий Александрович", guestCount: 2, childCount: 3, status: "expected", statusColor: "orange", dates: { from: "8 ноя", to: "20 ноя" }, phone: "+7 (999) 901-34-56", car: { make: "Porsche", model: "Cayenne", number: "Х890УР777", transportType: "Личный автомобиль" } },
  { id: "20", room: "1120", roomType: "DKG", name: "Алексеева Наталья Игоревна", guestCount: 1, status: "expected", statusColor: "orange", dates: { from: "10 ноя", to: "17 ноя" }, phone: "+7 (999) 012-45-67" },
  { id: "21", room: "1121", roomType: "DTG", name: "Степанов Владислав Андреевич", guestCount: 2, childCount: 2, status: "expected", statusColor: "orange", dates: { from: "7 ноя", to: "19 ноя" }, phone: "+7 (999) 123-67-89" },
  { id: "22", room: "1122", roomType: "DKG", name: "Николаева Виктория Сергеевна", guestCount: 2, status: "expected", statusColor: "orange", dates: { from: "6 ноя", to: "14 ноя" }, phone: "+7 (999) 234-78-90", car: { make: "Range Rover", model: "Sport", number: "Н123АС199", transportType: "Личный автомобиль" } },
  { id: "23", room: "1123", roomType: "DTG", name: "Иванов Алексей Петрович", guestCount: 2, status: "checked-out", statusColor: "gray", dates: { from: "25 окт", to: "4 ноя" }, phone: "+7 (999) 345-89-01" },
  { id: "24", room: "1124", roomType: "DKG", name: "Макарова Екатерина Михайловна", guestCount: 2, childCount: 2, status: "checked-out", statusColor: "gray", dates: { from: "27 окт", to: "5 ноя" }, phone: "+7 (999) 456-90-12" },
  { id: "25", room: "1125", roomType: "DTG", name: "Борисов Павел Николаевич", guestCount: 2, status: "checked-out", statusColor: "gray", dates: { from: "28 окт", to: "4 ноя" }, phone: "+7 (999) 567-01-23", car: { make: "Volkswagen", model: "Tiguan", number: "Р456ВТ777", transportType: "Личный автомобиль" } },
  { id: "26", room: "1126", roomType: "DKG", name: "Семенова Людмила Александровна", guestCount: 1, childCount: 1, status: "checked-out", statusColor: "gray", dates: { from: "26 окт", to: "3 ноя" }, phone: "+7 (999) 678-12-34" },
  { id: "27", room: "1127", roomType: "DTG", name: "Антонов Владимир Юрьевич", guestCount: 2, childCount: 1, status: "checked-out", statusColor: "gray", dates: { from: "29 окт", to: "5 ноя" }, phone: "+7 (999) 789-23-45" },
];

export default function GuestsPage() {
  const [activeTab, setActiveTab] = useState("staying");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsDialogGuest, setDetailsDialogGuest] = useState<Guest | null>(null);
  const [guests, setGuests] = useState<Guest[]>(mockGuestsData);
  const [statusChangeGuest, setStatusChangeGuest] = useState<Guest | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"staying" | "expected" | "checked-out">("staying");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentColumn, setCurrentColumn] = useState<"main" | "checked-out">("main");
  const [columnDirection, setColumnDirection] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const subtabs = ["staying", "expected"] as const;
  const x = useMotionValue(0);
  const animRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [indicatorProgress, setIndicatorProgress] = useState(0);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
      const currentIdx = subtabs.indexOf(activeTab as any);
      x.set(-currentIdx * width);
      setIndicatorProgress(currentIdx);
    }
    if (headerRef.current) {
      const measure = () => setHeaderHeight(headerRef.current!.offsetHeight);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(headerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  useEffect(() => () => animRef.current?.stop?.(), []);

  const goToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(subtabs.length - 1, index));
    const newTab = subtabs[clamped];
    setActiveTab(newTab);

    if (containerWidth > 0) {
      animRef.current?.stop?.();
      const controls = animate(x, -clamped * containerWidth, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        onUpdate: (v) => setIndicatorProgress(-v / containerWidth),
      });
      animRef.current = controls;
    }
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (containerWidth === 0) return;
    const swipeThreshold = containerWidth * 0.3;
    const velocityThreshold = 500;
    const currentX = x.get();
    const currentIndex = Math.round(-currentX / containerWidth);
    let newIndex = currentIndex;

    if (Math.abs(info.velocity.x) > velocityThreshold) {
      if (info.velocity.x < 0 && currentIndex < subtabs.length - 1) newIndex = currentIndex + 1;
      else if (info.velocity.x > 0 && currentIndex > 0) newIndex = currentIndex - 1;
    } else if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x < 0 && currentIndex < subtabs.length - 1) newIndex = currentIndex + 1;
      else if (info.offset.x > 0 && currentIndex > 0) newIndex = currentIndex - 1;
    }

    setIsDraggingTabs(false);
    goToIndex(newIndex);
  };

  const handleDrag = () => {
    if (containerWidth === 0) return;
    const currentX = x.get();
    const progress = -currentX / containerWidth;
    setIndicatorProgress(Math.max(0, Math.min(subtabs.length - 1, progress)));
  };

  useEffect(() => {
    localStorage.setItem("guests", JSON.stringify(guests));
  }, [guests]);
  useEffect(() => {
    localStorage.setItem("guestsActiveTab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    localStorage.setItem("guestsSearchQuery", searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    localStorage.setItem("guestsSearchExpanded", searchExpanded.toString());
  }, [searchExpanded]);
  useEffect(() => {
    localStorage.setItem("guestsCurrentColumn", currentColumn);
  }, [currentColumn]);
  useEffect(() => {
    if (expandedId) localStorage.setItem("guestsExpandedId", expandedId);
    else localStorage.removeItem("guestsExpandedId");
  }, [expandedId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    setScrollY(currentScrollY < 0 ? 0 : currentScrollY);
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesTab = currentColumn === "main" ? guest.status === activeTab : guest.status === "checked-out";
    const matchesSearch = searchQuery === "" || guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || guest.room.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const stayingCount = guests.filter((g) => g.status === "staying").length;
  const expectedCount = guests.filter((g) => g.status === "expected").length;
  const checkedOutCount = guests.filter((g) => g.status === "checked-out").length;

  // Новая логика: сжимаем высоту шапки и двигаем контент трансформацией
  const safeScrollY = Math.max(0, scrollY);
  const rawOffset = Math.min(safeScrollY, headerHeight);
  const headerOffset = Math.round(rawOffset);
  const headerVisibleHeight = Math.max(headerHeight - headerOffset, 0);
  const scrollYRounded = Math.round(safeScrollY);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Единый вертикальный скролл */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto overscroll-contain" onScroll={handleScroll}>
          {/* Верхняя часть-обертка со сжимаемой высотой */}
          <div className="overflow-hidden" style={{ height: headerVisibleHeight }}>
            <div ref={headerRef} className="glass-effect border-0 border-b border-white/10 shadow-premium-md will-change-transform transition-none transform-gpu" style={{ transform: `translate3d(0, -${scrollYRounded}px, 0)` }}>
              <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                {!searchExpanded ? (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3" />
                    <div className="flex gap-2 items-center">
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="rounded-2xl h-10 w-10 sm:h-11 sm:w-11 glass-effect shadow-premium-sm flex items-center justify-center" onClick={() => setSearchExpanded(true)}>
                        <Search className="w-5 h-5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="rounded-2xl h-10 w-10 sm:h-11 sm:w-11 gradient-premium-blue text-white shadow-premium-md flex items-center justify-center" onClick={() => {}}>
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 w-full">
                    <Input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 h-10 sm:h-11 text-sm glass-effect border-0 shadow-premium-sm" autoFocus />
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="rounded-2xl h-10 w-10 sm:h-11 sm:w-11 glass-effect shadow-premium-sm flex items-center justify-center" onClick={() => { setSearchExpanded(false); setSearchQuery(""); }}>
                      <X className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {!searchExpanded && (
                <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white bg-clip-text text-transparent">Гости</h1>
                </div>
              )}
            </div>
          </div>

          {/* Подвкладки — sticky */}
          <div
            className="sticky top-0 z-20 glass-effect border-0 border-b border-white/10 px-4 sm:px-6 shadow-premium-md"
            data-stop-root-swipe="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="py-2 sm:py-3 relative">
              {currentColumn === "main" ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="w-full flex justify-center gap-6 sm:gap-8">
                      <button onClick={() => goToIndex(0)} className={cn("px-1 text-sm font-bold inline-flex items-center transition-all duration-150", activeTab === "staying" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")}>Проживают ({stayingCount})</button>
                      <button onClick={() => goToIndex(1)} className={cn("px-1 text-sm font-bold inline-flex items-center transition-all duration-150", activeTab === "expected" ? "text-amber-600 dark:text-amber-400" : "text-zinc-400")}>Ожидаются ({expectedCount})</button>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setColumnDirection(1); setCurrentColumn("checked-out"); }} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setColumnDirection(-1); setCurrentColumn("main"); }} className="absolute left-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <h2 className="mx-auto inline-flex items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-300">Выехали ({checkedOutCount})</h2>
                </div>
              )}

              {currentColumn === "main" ? (
                <div className={cn("absolute bottom-0 left-0 h-0.5 w-1/2 rounded-full", isDraggingTabs ? "transition-none" : "transition-all duration-300 ease-out")} style={{ transform: `translateX(${indicatorProgress * 100}%)`, backgroundColor: lerpColor("#f59e0b", "#10b981", Math.max(0, Math.min(1, 1 - indicatorProgress))) }} />
              ) : (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-zinc-500 rounded-full" />
              )}
            </div>
          </div>

          {/* Контент — один общий вертикальный скролл */}
          {currentColumn === "main" ? (
            <div ref={containerRef} className="w-full overflow-hidden">
              {containerWidth > 0 && (
                <motion.div className="flex select-none" data-swipe-scope onPointerDown={(e) => e.stopPropagation()} drag="x" dragElastic={0.1} dragMomentum={false} dragConstraints={{ left: -containerWidth * (subtabs.length - 1), right: 0 }} onDragStart={() => setIsDraggingTabs(true)} onDrag={handleDrag} onDragEnd={handleDragEnd} style={{ x, touchAction: "pan-y", willChange: "transform" }}>
                  <div className="px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] min-w-full shrink-0 box-border">
                    <div className="space-y-3 sm:space-y-4">
                      {guests
                        .filter((g) => g.status === "staying" && (searchQuery === "" || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.room.includes(searchQuery)))
                        .map((guest) => (
                          <GuestCard key={guest.id} guest={guest} isExpanded={expandedId === guest.id} onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onNameClick={() => setDetailsDialogGuest(guest)} onRoomClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onStatusButtonClick={() => { setStatusChangeGuest(guest); setShowStatusDialog(true); }} />
                        ))}
                    </div>
                  </div>
                  <div className="px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] min-w-full shrink-0 box-border">
                    <div className="space-y-3 sm:space-y-4">
                      {guests
                        .filter((g) => g.status === "expected" && (searchQuery === "" || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.room.includes(searchQuery)))
                        .map((guest) => (
                          <GuestCard key={guest.id} guest={guest} isExpanded={expandedId === guest.id} onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onNameClick={() => setDetailsDialogGuest(guest)} onRoomClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onStatusButtonClick={() => { setStatusChangeGuest(guest); setShowStatusDialog(true); }} />
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false} custom={columnDirection} mode="wait">
              <motion.div key={currentColumn} custom={columnDirection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.15 } }} className="px-3 sm:px-4 py-4 sm:py-5 pb-[calc(var(--app-bottom-bar-height,4rem)+1rem+env(safe-area-inset-bottom))] space-y-3 sm:space-y-4">
                {filteredGuests.map((guest) => (
                  <GuestCard key={guest.id} guest={guest} isExpanded={expandedId === guest.id} onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onNameClick={() => setDetailsDialogGuest(guest)} onRoomClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)} onStatusButtonClick={() => { setStatusChangeGuest(guest); setShowStatusDialog(true); }} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <GuestDetailsDialog
        guest={detailsDialogGuest}
        open={!!detailsDialogGuest}
        onOpenChange={(open) => !open && setDetailsDialogGuest(null)}
        onAddTransfer={(guestId: string, transfer: { date: string; room: string; roomType: string; note: string }) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, transfers: [...(g.transfers || []), transfer] } : g)))
        }
        onUpdateTransfer={(guestId: string, transferIndex: number, transfer: { date: string; room: string; roomType: string; note: string }) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, transfers: (g.transfers || []).map((t, i) => (i === transferIndex ? transfer : t)) } : g)))
        }
        onDeleteTransfer={(guestId: string, transferIndex: number) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, transfers: (g.transfers || []).filter((_, i) => i !== transferIndex) } : g)))
        }
        onAddPhoto={(guestId: string, photoUrl: string) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, photos: [...(g.photos || []), photoUrl] } : g)))
        }
        onRemovePhoto={(guestId: string, photoIndex: number) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, photos: (g.photos || []).filter((_, i) => i !== photoIndex) } : g)))
        }
        onUpdateCar={(guestId: string, car: { make: string; model: string; number: string; transportType?: "Такси" | "Личный автомобиль" | "Трансфер" } | undefined) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, car } : g)))
        }
        onUpdateDates={(guestId: string, dates: { from: string; to: string }) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, dates } : g)))
        }
        onUpdateGuestCount={(guestId: string, guestCount: number, childCount?: number, babyCount?: number) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, guestCount, childCount, babyCount } : g)))
        }
        onUpdatePhone={(guestId: string, phone: string) =>
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, phone } : g)))
        }
        onStatusButtonClick={(guest: Guest) => {
          setStatusChangeGuest(guest);
          setShowStatusDialog(true);
        }}
      />

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm p-0">
          <div className="p-4 sm:p-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => { setSelectedStatus("expected"); setShowStatusDialog(false); setShowConfirmDialog(true); }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500" />
                <span className="text-sm sm:text-base">Ожидаются</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => { setSelectedStatus("staying"); setShowStatusDialog(false); setShowConfirmDialog(true); }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                <span className="text-sm sm:text-base">Проживают</span>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => { setSelectedStatus("checked-out"); setShowStatusDialog(false); setShowConfirmDialog(true); }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-400" />
                <span className="text-sm sm:text-base">Выехали</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">Подтвердите действие</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Переместить гостя {statusChangeGuest?.name} ({statusChangeGuest?.room}) в {selectedStatus === "expected" ? "Ожидаются" : selectedStatus === "staying" ? "Проживают" : "Выехали"}?</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="outline" className="flex-1 text-sm h-9 sm:h-10" onClick={() => setShowConfirmDialog(false)}>Отменить</Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm h-9 sm:h-10" onClick={() => {
                if (!statusChangeGuest) return;
                setGuests((prev) => prev.map((g) => (g.id === statusChangeGuest.id ? { ...g, status: selectedStatus, statusColor: selectedStatus === "staying" ? "green" : selectedStatus === "expected" ? "orange" : "gray" } : g)));
                setShowConfirmDialog(false);
                setStatusChangeGuest(null);
                setExpandedId(null);
              }}>Подтвердить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuestCard({ guest, isExpanded, onToggle, onNameClick, onRoomClick, onStatusButtonClick }: { guest: Guest; isExpanded: boolean; onToggle: () => void; onNameClick: () => void; onRoomClick: () => void; onStatusButtonClick: () => void }) {
  const totalGuests = guest.guestCount + (guest.childCount || 0) + (guest.babyCount || 0);
  const roomColors = getRoomTypeColors(guest.roomType);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, layout: { duration: 0.2 } }} className="glass-effect rounded-3xl p-4 sm:p-5 shadow-premium-md cursor-pointer overflow-hidden transition-all duration-150 hover:shadow-premium-lg border-0" onClick={onToggle}>
      <div className="flex items-start gap-3 sm:gap-4">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={(e) => { e.stopPropagation(); onRoomClick(); }} className={cn("flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl flex-shrink-0 shadow-premium-sm", roomColors.bg)}>
          <div className={cn("text-lg sm:text-xl md:text-2xl font-bold", roomColors.text)}>{guest.room}</div>
          <div className={cn("text-[10px] sm:text-xs font-bold", roomColors.text)}>{guest.roomType}</div>
        </motion.button>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={(e) => { e.stopPropagation(); onNameClick(); }} className="font-semibold text-xs sm:text-sm leading-tight text-left hover:text-primary flex-1 min-w-0">
              <span className="line-clamp-2">{isExpanded ? guest.name : getLastName(guest.name)}</span>
            </motion.button>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-premium-sm", guest.statusColor === "green" ? "bg-emerald-500" : guest.statusColor === "orange" ? "bg-amber-500" : "bg-zinc-400")} />
              <motion.button animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} onClick={(e) => { e.stopPropagation(); onToggle(); }} className="text-zinc-400 hover:text-zinc-600">
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>

          {!isExpanded ? (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{totalGuests}</span>
              </div>
              {guest.dates && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 glass-effect px-2 py-1 rounded-xl">
                  <span>{guest.dates.from}</span>
                  <span>→</span>
                  <span>{guest.dates.to}</span>
                </div>
              )}
              {guest.car && (
                <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs">
                  <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{guest.guestCount}</span>
                </div>
                {guest.childCount && guest.childCount > 0 && (
                  <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{guest.childCount}</span>
                  </div>
                )}
                {guest.babyCount && guest.babyCount > 0 && (
                  <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs">
                    <Baby className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{guest.babyCount}</span>
                  </div>
                )}
              </div>
              {guest.dates && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 glass-effect px-2 py-1 rounded-xl w-fit">
                  <span>{guest.dates.from}</span>
                  <span>→</span>
                  <span>{guest.dates.to}</span>
                </div>
              )}
              {guest.car && (
                <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-xl text-[10px] sm:text-xs w-fit">
                  <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate">{guest.car.make} {guest.car.model}</span>
                </div>
              )}

              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1 glass-effect px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-medium hover:shadow-premium-md flex items-center justify-center gap-1.5" onClick={(e) => { e.stopPropagation(); }}>
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Шаблоны
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1 gradient-premium-blue text-white px-3 py-2 rounded-2xl text-[10px] sm:text-xs font-medium shadow-premium-sm hover:shadow-premium-md flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Чат
                </motion.button>
              </div>

              {guest.phone && (
                <div className="mt-3 flex items-center gap-2 text-[10px] sm:text-xs glass-effect px-3 py-2 rounded-2xl">
                  <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{guest.phone}</span>
                </div>
              )}

              <div className="mt-2">
                <button onClick={(e) => { e.stopPropagation(); onStatusButtonClick(); }} className="text-xs text-blue-600 hover:underline">Изменить статус</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function GuestDetailsDialog({ guest, open, onOpenChange, onAddTransfer, onUpdateTransfer, onDeleteTransfer, onAddPhoto, onRemovePhoto, onUpdateCar, onUpdateDates, onUpdateGuestCount, onUpdatePhone, onStatusButtonClick }: any) {
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [showTemplateEdit, setShowTemplateEdit] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ title: string; content: string } | null>(null);
  const [editTemplateText, setEditTemplateText] = useState("");
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [showCarEdit, setShowCarEdit] = useState(false);
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carTransportType, setCarTransportType] = useState<"Такси" | "Личный автомобиль" | "Трансфер">("Личный автомобиль");
  const [showTransferEdit, setShowTransferEdit] = useState(false);
  const [editingTransferIndex, setEditingTransferIndex] = useState<number | null>(null);
  const [transferDate, setTransferDate] = useState("");
  const [transferRoom, setTransferRoom] = useState("");
  const [transferRoomType, setTransferRoomType] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [showDatesEdit, setShowDatesEdit] = useState(false);
  const [editDateFrom, setEditDateFrom] = useState("");
  const [editDateTo, setEditDateTo] = useState("");
  const [showGuestCountEdit, setShowGuestCountEdit] = useState(false);
  const [editGuestCount, setEditGuestCount] = useState(0);
  const [editChildCount, setEditChildCount] = useState(0);
  const [editBabyCount, setEditBabyCount] = useState(0);

  if (!guest) return null;

  const templates = getTemplates(guest);
  const statusText = { staying: "Проживают", expected: "Ожидаются", "checked-out": "Выехали" };
  const statusColor = { staying: "bg-emerald-50 text-emerald-700 border-emerald-200", expected: "bg-amber-50 text-amber-700 border-amber-200", "checked-out": "bg-zinc-100 text-zinc-700 border-zinc-300" } as const;

  const handleSelectTemplate = (template: { title: string; content: string }) => {
    setSelectedTemplate(template);
    setEditTemplateText(template.content);
    setShowTemplatesDialog(false);
    setShowTemplateEdit(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">Данные гостя</h2>
          <button onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="flex items-center gap-4">
            <div className={cn("flex flex-col items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0 shadow-premium-sm", getRoomTypeColors(guest.roomType).bg)}>
              <div className={cn("text-xl font-bold", getRoomTypeColors(guest.roomType).text)}>{guest.room}</div>
              <div className={cn("text-xs font-bold", getRoomTypeColors(guest.roomType).text)}>{guest.roomType}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base leading-tight mb-2">{guest.name}</h3>
            </div>
          </div>

          <button onClick={() => onStatusButtonClick(guest)} className={cn("w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm border transition-colors hover:opacity-80", statusColor[guest.status])}>
            <span>{statusText[guest.status]}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {guest.phone && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
                <Phone className="w-4 h-4" />
                <span>{guest.phone}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" onClick={() => setShowTemplatesDialog(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Шаблоны
                </Button>
                <Button variant="outline" className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Чат
                </Button>
              </div>
            </div>
          )}

          {guest.dates && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
              <CalendarIcon className="w-4 h-4" />
              <span>Заезд: {guest.dates.from}</span>
              <span>→</span>
              <span>Выезд: {guest.dates.to}</span>
            </div>
          )}
        </div>

        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-sm p-0">
            <div className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Список шаблонов</h3>
              {templates.map((template, index) => (
                <Button key={index} variant="ghost" className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => handleSelectTemplate(template)}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm sm:text-base">{template.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTemplateEdit} onOpenChange={setShowTemplateEdit}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedTemplate?.title}</h3>
                <button onClick={() => setShowTemplateEdit(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col space-y-2">
                <label className="text-sm font-medium">Текст сообщения</label>
                <textarea className="flex-1 w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={editTemplateText} onChange={(e) => setEditTemplateText(e.target.value)} style={{ minHeight: "450px" }} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(editTemplateText)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать
                </Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setShowTemplateEdit(false)}>Готово</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}