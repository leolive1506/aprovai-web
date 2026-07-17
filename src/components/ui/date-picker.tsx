"use client"

import { useState } from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    placeholder?: string
    className?: string
    selected?: DateRange
    onSelect?: (range: DateRange | undefined) => void
}

export function DatePicker({ placeholder = "Selecionar período", className, selected, onSelect }: DatePickerProps) {
    const [month, setMonth] = useState<Date>(selected?.from ?? new Date())

    const hasValue = selected?.from || selected?.to

    const label = selected?.from
        ? selected.to
            ? `${format(selected.from, "dd MMM", { locale: ptBR })} → ${format(selected.to, "dd MMM yy", { locale: ptBR })}`
            : format(selected.from, "dd MMM yyyy", { locale: ptBR })
        : placeholder

    const dayCount = selected?.from && selected?.to
        ? Math.ceil((selected.to.getTime() - selected.from.getTime()) / 86400000)
        : null

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-all duration-150 cursor-pointer",
                        hasValue
                            ? "bg-primary/10 border-primary/25 text-primary"
                            : "bg-white border-zinc-200/80 text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
                        className
                    )}
                >
                    <CalendarIcon className="size-3.5 shrink-0" />
                    {label}
                    <ChevronDownIcon className="size-3 text-current opacity-60" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 rounded-xl border border-zinc-200/80 shadow-xl shadow-zinc-900/10 overflow-hidden"
                align="start"
                sideOffset={8}
            >
                <div className="px-4 pt-4 pb-3 border-b border-zinc-100 bg-zinc-50/60">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Selecionar período</p>
                    {selected?.from ? (
                        <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                            {format(selected.from, "dd 'de' MMM", { locale: ptBR })}
                            {selected.to && ` → ${format(selected.to, "dd 'de' MMM yyyy", { locale: ptBR })}`}
                        </p>
                    ) : (
                        <p className="text-sm text-zinc-400 mt-0.5">Escolha a data de início</p>
                    )}
                </div>

                <div className="p-4">
                    <div className="
                    **:data-[range-start=true]:bg-primary! **:data-[range-start=true]:text-primary-foreground!
                    **:data-[range-end=true]:bg-primary! **:data-[range-end=true]:text-primary-foreground!
                    **:data-[range-middle=true]:bg-primary/12! **:data-[range-middle=true]:text-primary!
                ">
                        <Calendar
                            mode="range"
                            selected={selected}
                            onSelect={onSelect}
                            locale={ptBR}
                            numberOfMonths={2}
                            month={month}
                            onMonthChange={setMonth}
                            showOutsideDays={false}
                            classNames={{
                                nav: "hidden",
                                range_start: "rounded-l-lg! rounded-r-none! bg-primary/20!",
                                range_end: "rounded-r-lg! rounded-l-none! bg-primary/20!",
                                range_middle: "rounded-none! bg-primary/10!",
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/60">
                    <div className="flex items-center gap-1.5">
                        {selected?.from && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelect?.(undefined)}
                                    className="h-7 px-2.5 text-xs cursor-pointer text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    Limpar
                                </Button>
                                {dayCount && (
                                    <span className="text-xs text-zinc-400 ml-1">{dayCount} dia{dayCount !== 1 ? "s" : ""}</span>
                                )}
                            </>
                        )}
                        {!selected?.from && (
                            <span className="text-xs text-zinc-400">Clique para selecionar o início</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMonth(m => subMonths(m, 1))}
                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-500 hover:text-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <ChevronLeftIcon className="size-3.5" />
                        </button>
                        <button
                            onClick={() => setMonth(m => addMonths(m, 1))}
                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-500 hover:text-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <ChevronRightIcon className="size-3.5" />
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
