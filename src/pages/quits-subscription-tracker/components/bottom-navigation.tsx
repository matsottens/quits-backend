"use client"

import * as React from "react"
import { Home, Calendar, Search, Filter } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-[#1e3a73] text-white p-4">
      <div className="flex justify-around items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex flex-col items-center ${isActive("/dashboard") ? "text-accent" : ""}`}
        >
          <Home size={24} />
          <span className="text-sm">Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/calendar")}
          className={`flex flex-col items-center ${isActive("/calendar") ? "text-accent" : ""}`}
        >
          <Calendar size={24} />
          <span className="text-sm">Calendar</span>
        </button>
        <button
          onClick={() => navigate("/search")}
          className={`flex flex-col items-center ${isActive("/search") ? "text-accent" : ""}`}
        >
          <Search size={24} />
          <span className="text-sm">Search</span>
        </button>
        <button
          onClick={() => navigate("/filter")}
          className={`flex flex-col items-center ${isActive("/filter") ? "text-accent" : ""}`}
        >
          <Filter size={24} />
          <span className="text-sm">Filter</span>
        </button>
      </div>
    </nav>
  )
}

