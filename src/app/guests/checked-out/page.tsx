"use client";

import { useState } from "react";
import { Search, ChevronLeft, X, MessageCircle, Users, Baby, Phone, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
}

const roomTypeColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  DTS: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300"
  },
  DKS: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300"
  }
};

function getRoomTypeColors(roomType: string) {
  return roomTypeColors[roomType] || {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    badge: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300"
  };
}

function getLastName(fullName: string): string {
  return fullName.split(' ')[0];
}

const mockCheckedOutGuests: Guest[] = [
  {
    id: "10",
    room: "103",
    roomType: "DTS",
    name: "Соколова Ольга Валерьевна",
    guestCount: 1,
    status: "checked-out",
    statusColor: "gray",
    dates: { from: "20 окт", to: "1 ноя" },
    phone: "+7 (999) 012-34-56"
  },
  {
    id: "11",
    room: "302",
    roomType: "DKS",
    name: "Волков Максим Юрьевич",
    guestCount: 2,
    status: "checked-out",
    statusColor: "gray",
    dates: { from: "22 окт", to: "31 окт" },
    phone: "+7 (999) 123-45-67"
  },
  {
    id: "12",
    room: "155",
    roomType: "DTS",
    name: "Новикова Татьяна Андреевна",
    guestCount: 2,
    childCount: 2,
    status: "checked-out",
    statusColor: "gray",
    dates: { from: "18 окт", to: "28 окт" },
    phone: "+7 (999) 234-56-78"
  },
  {
    id: "13",
    room: "418",
    roomType: "DKS",
    name: "Романов Владимир Степанович",
    guestCount: 1,
    status: "checked-out",
    statusColor: "gray",
    dates: { from: "15 окт", to: "25 окт" },
    phone: "+7 (999) 345-67-89"
  },
  {
    id: "14",
    room: "309",
    roomType: "DTS",
    name: "Захарова Екатерина Игоревна",
    guestCount: 1,
    childCount: 1,
    babyCount: 1,
    status: "checked-out",
    statusColor: "gray",
    dates: { from: "10 окт", to: "20 окт" },
    phone: "+7 (999) 456-78-90"
  }
];

export default function CheckedOutGuestsPage() {
  const router = useRouter();
  const [guests] = useState<Guest[]>(mockCheckedOutGuests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = searchQuery === "" ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.room.includes(searchQuery);
    return matchesSearch;
  });

  const handleCardExpand = (guestId: string) => {
    setExpandedId(expandedId === guestId ? null : guestId);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header - Same as GuestsPage */}
      <div className="bg-white dark:bg-zinc-900 px-2 sm:px-4 py-2 sm:py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          {!searchExpanded ? (
            <>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => router.push("/")}>
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <h1 className="text-lg sm:text-2xl font-bold">Гости</h1>
              </div>
              <div className="flex gap-1 sm:gap-2 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => setSearchExpanded(true)}>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                <Button
                  size="icon"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white h-8 w-8 sm:h-10 sm:w-10">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 w-full"
            >
              <Input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-8 sm:h-10 text-sm"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                onClick={() => {
                  setSearchExpanded(false);
                  setSearchQuery("");
                }}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Выехали Tab Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-500 pb-1 sm:pb-2">
          <h2 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100">
            Выехали ({filteredGuests.length})
          </h2>
        </div>
      </div>

      {/* Guest List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4 space-y-2 sm:space-y-3 pb-20">
        {filteredGuests.length === 0 && searchQuery !== "" ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            Гости не найдены
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              isExpanded={expandedId === guest.id}
              onToggle={() => handleCardExpand(guest.id)}
              onPhoneClick={(g) => {
                setSelectedGuest(g);
                setShowPhoneMenu(true);
              }}
            />
          ))
        )}
      </div>

      {/* Phone Menu Dialog */}
      <Dialog open={showPhoneMenu} onOpenChange={setShowPhoneMenu}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm p-0">
          <div className="p-4 sm:p-6 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto py-2 sm:py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => {
                if (selectedGuest?.phone) {
                  window.location.href = `tel:${selectedGuest.phone}`;
                }
                setShowPhoneMenu(false);
              }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Позвонить</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuestCard({
  guest,
  isExpanded,
  onToggle,
  onPhoneClick
}: {
  guest: Guest;
  isExpanded: boolean;
  onToggle: () => void;
  onPhoneClick: (guest: Guest) => void;
}) {
  const displayName = isExpanded ? guest.name : getLastName(guest.name);
  const totalGuests = guest.guestCount + (guest.childCount || 0) + (guest.babyCount || 0);
  const roomColors = getRoomTypeColors(guest.roomType);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, layout: { duration: 0.2 } }}
      className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-sm cursor-pointer overflow-hidden"
      onClick={onToggle}
    >
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Room Number */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex-shrink-0 transition-all duration-150",
            roomColors.bg,
            "hover:opacity-80"
          )}>
          <div className={cn("text-base sm:text-xl font-bold", roomColors.text)}>{guest.room}</div>
          <div className={cn("text-[10px] sm:text-xs", roomColors.badge)}>{guest.roomType}</div>
        </button>

        {/* Guest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="font-medium text-xs sm:text-sm leading-tight text-left">
              {displayName}
            </div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-zinc-400" />
          </div>

          {/* Guest Count Icons */}
          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-zinc-500 dark:text-zinc-400">
            {!isExpanded ? (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{totalGuests}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{guest.guestCount}</span>
                </div>
                {guest.childCount && guest.childCount > 0 && (
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    <span className="text-xs sm:text-sm">{guest.childCount}</span>
                  </div>
                )}
                {guest.babyCount && guest.babyCount > 0 && (
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Baby className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{guest.babyCount}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-4" onClick={(e) => e.stopPropagation()}>
                  {/* Dates */}
                  {guest.dates && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span><span className="hidden sm:inline">Заезд: </span>{guest.dates.from}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span><span className="hidden sm:inline">Выезд: </span>{guest.dates.to}</span>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {guest.phone && (
                    <div
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl cursor-pointer select-none active:bg-zinc-100 dark:active:bg-zinc-800"
                      onClick={() => onPhoneClick(guest)}>
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{guest.phone}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 sm:pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-400 h-8 sm:h-9 text-xs sm:text-sm rounded-xl">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Чат
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}