import React from "react"
import { Home, Calendar, Search, Filter } from "lucide-react"

export default function BottomNavigation() {
  return (
    <div className="bg-primary text-white flex justify-around py-3">
      <button className="flex flex-col items-center px-4 py-2">
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Dashboard</span>
      </button>
      <button className="flex flex-col items-center px-4 py-2">
        <Calendar className="w-6 h-6" />
        <span className="text-xs mt-1">Calendar</span>
      </button>
      <button className="flex flex-col items-center px-4 py-2">
        <Search className="w-6 h-6" />
        <span className="text-xs mt-1">Search</span>
      </button>
      <button className="flex flex-col items-center px-4 py-2">
        <Filter className="w-6 h-6" />
        <span className="text-xs mt-1">Filter</span>
      </button>
    </div>
  )
}

