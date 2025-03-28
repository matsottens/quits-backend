"use client"

import { useState } from "react"
import { Search, Filter, Home, Calendar } from "lucide-react"
import SubscriptionList from "@/components/subscription-list"
import SearchBar from "@/components/search-bar"

export default function Dashboard() {
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
    if (!searchVisible) {
      // Focus the search input when opened
      setTimeout(() => {
        const searchInput = document.getElementById("search-input")
        if (searchInput) searchInput.focus()
      }, 100)
    } else {
      // Clear search when closed
      setSearchQuery("")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#f9f0e1]">
      {/* Header */}
      <header className="bg-[#1e3c72] text-white p-4 flex justify-between items-center">
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
          </svg>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2">
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full opacity-70">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="white" />
              <circle cx="12" cy="7" r="2" fill="white" />
              <circle cx="17" cy="12" r="2" fill="white" />
              <circle cx="7" cy="12" r="2" fill="white" />
              <circle cx="12" cy="17" r="2" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Quits</h1>
        </div>
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        </div>
      </header>

      {/* Tab Header */}
      <div className="flex border-b border-gray-300 bg-[#1e3c72] text-white">
        <button className="flex-1 py-3 font-semibold border-b-2 border-white">Upcoming</button>
        <button className="flex-1 py-3 font-semibold">Price</button>
      </div>

      {/* Search Bar (conditionally rendered) */}
      {searchVisible && (
        <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClose={toggleSearch} />
      )}

      {/* Subscription List */}
      <div className="flex-1 overflow-auto">
        <SubscriptionList searchQuery={searchQuery} />
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e3c72] text-white grid grid-cols-4 p-3">
        <button className="flex flex-col items-center justify-center">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button className="flex flex-col items-center justify-center">
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Calendar</span>
        </button>
        <button className="flex flex-col items-center justify-center" onClick={toggleSearch}>
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center justify-center">
          <Filter className="h-6 w-6" />
          <span className="text-xs mt-1">Filter</span>
        </button>
      </nav>
    </div>
  )
}

