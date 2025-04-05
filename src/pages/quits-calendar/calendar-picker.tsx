"use client"

import * as React from 'react';
const { useState } = React;
import { ChevronLeft, ChevronRight, CalendarIcon, Home, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CalendarPicker() {
  const [date, setDate] = useState<string>("02/17/2025")
  const [month, setMonth] = useState<string>("Aug")
  const [year, setYear] = useState<string>("2025")
  const [selectedDay, setSelectedDay] = useState<number>(17)

  // Days of the week
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

  // Previous month days (greyed out)
  const prevMonthDays = [26, 27, 28, 29, 30, 31]

  // Current month days
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1)

  // Next month days (greyed out)
  const nextMonthDays = [1, 2, 3, 4, 5, 6]

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    // Format date as MM/DD/YYYY
    const monthNum = 8 // August is 8
    setDate(`${monthNum.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${year}`)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-[#1e3a73] text-white p-4">
        <div className="flex items-center justify-between mb-6">
          <ChevronLeft className="w-6 h-6" />
          <div className="flex items-center">
            <div className="flex gap-0.5 mr-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-white/70 rounded-full" />
              ))}
            </div>
            <span className="text-2xl font-semibold">Quits</span>
          </div>
          <div className="w-6" /> {/* Empty div for spacing */}
        </div>
        <h1 className="text-center text-xl font-medium">Calendar</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-[#fef3e1] p-4">
        {/* Date Input */}
        <div className="mb-4">
          <label className="text-lg font-medium text-[#5f4b8b]">Date</label>
          <div className="border-2 border-[#5f4b8b] rounded-lg p-3 flex justify-between items-center bg-white">
            <input
              type="text"
              value={date}
              onChange={(e: any) => setDate(e.target.value)}
              className="text-xl w-full outline-none"
            />
            <CalendarIcon className="w-6 h-6 text-gray-500 bg-gray-200 rounded-full p-1" />
          </div>
          <p className="text-gray-500 mt-1">MM/DD/YYYY</p>
        </div>

        {/* Calendar Widget */}
        <div className="bg-[#eeecf9] rounded-lg p-4">
          {/* Month/Year Selector */}
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-6 h-6 text-gray-500" />
              <select
                value={month}
                onChange={(e: any) => setMonth(e.target.value)}
                className="text-xl font-medium bg-transparent appearance-none pr-8"
              >
                <option>Aug</option>
              </select>
              <ChevronRight className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-6 h-6 text-gray-500" />
              <select
                value={year}
                onChange={(e: any) => setYear(e.target.value)}
                className="text-xl font-medium bg-transparent appearance-none pr-8"
              >
                <option>2025</option>
              </select>
              <ChevronRight className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="text-center font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Previous month days */}
            {prevMonthDays.map((day) => (
              <div key={`prev-${day}`} className="text-center py-2 text-gray-400">
                {day}
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((day) => (
              <button
                key={`current-${day}`}
                className={cn("text-center py-2 rounded-full", day === selectedDay ? "bg-[#5f4b8b] text-white" : "")}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </button>
            ))}

            {/* Next month days */}
            {nextMonthDays.map((day) => (
              <div key={`next-${day}`} className="text-center py-2 text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="ghost" className="text-[#5f4b8b]">
              Clear
            </Button>
            <div className="flex gap-4">
              <Button variant="ghost" className="text-[#5f4b8b]">
                Cancel
              </Button>
              <Button variant="ghost" className="text-[#5f4b8b] font-bold">
                OK
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e3a73] text-white p-4">
        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <Home className="w-6 h-6" />
            <span className="text-sm">Dashboard</span>
          </div>
          <div className="flex flex-col items-center">
            <CalendarIcon className="w-6 h-6" />
            <span className="text-sm">Calendar</span>
          </div>
          <div className="flex flex-col items-center">
            <Search className="w-6 h-6" />
            <span className="text-sm">Search</span>
          </div>
          <div className="flex flex-col items-center">
            <Filter className="w-6 h-6" />
            <span className="text-sm">Filter</span>
          </div>
        </div>
      </nav>
    </div>
  )
}

