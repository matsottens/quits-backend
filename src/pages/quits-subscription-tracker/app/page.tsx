"use client"

import { MoreVertical, Plus, Settings } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function Home() {
  // Function to handle redirection to external URL
  const redirectToSettings = () => {
    window.location.href = "https://v0.dev/chat/dashboard-price-S4FxHlf4oSF"
  }

  return (
    <div className="flex flex-col h-screen bg-cream-100">
      {/* Status Bar */}
      <div className="bg-blue-800 text-white px-4 py-2 flex justify-between items-center">
        <span className="text-lg font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-white"></div>
          <div className="h-3 w-4 bg-white mask-wifi"></div>
          <div className="h-3 w-6 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* App Header */}
      <div className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <button className="p-2" onClick={redirectToSettings} aria-label="Settings">
          <Settings className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center">
          <div className="w-5 h-5 mr-1 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white rounded-full opacity-70" />
                ))}
              </div>
            </div>
          </div>
          <span className="text-2xl font-bold">Quits</span>
        </div>
        <button className="p-2">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-blue-800 text-white">
        <button className="flex-1 py-3 text-blue-200">Upcoming</button>
        <button className="flex-1 py-3 border-b-2 border-white font-medium">Price</button>
      </div>

      {/* Subscription List */}
      <div className="flex-1 overflow-auto">
        <SubscriptionItem
          logo={
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-2xl font-serif font-bold">V</span>
            </div>
          }
          name="Volkskrant"
          price="€22,75"
        />

        <SubscriptionItem
          logo={
            <div className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="6" height="12" rx="3" fill="#F44336" />
                <rect x="9" y="6" width="6" height="12" rx="3" fill="#FFC107" />
                <rect x="16" y="6" width="6" height="12" rx="3" fill="#4CAF50" />
              </svg>
            </div>
          }
          name="Monday"
          price="€44,95"
        />

        <SubscriptionItem
          logo={
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-2xl font-serif font-bold">P</span>
            </div>
          }
          name="Parool"
          price="€27,08"
        />

        <SubscriptionItem
          logo={
            <div className="w-full h-full rounded-full bg-blue-800 flex items-center justify-center">
              <span className="text-white font-bold">t</span>
            </div>
          }
          name="Trouw"
          price="€18,95"
        />

        <SubscriptionItem
          logo={
            <div className="flex items-center justify-center">
              <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0V24L5 19.5L10 24L15 19.5L20 24V0H0Z" fill="#E50914" />
                <path d="M3 3H17V16L14 13.5L10 16L6 13.5L3 16V3Z" fill="#E50914" />
                <path d="M10 8.5L13 12H7L10 8.5Z" fill="white" />
              </svg>
            </div>
          }
          name="Netflix"
          price="€13,95"
        />

        <SubscriptionItem
          logo={
            <div className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#58CC02"
                />
                <path
                  d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                  fill="#58CC02"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle cx="9" cy="10" r="1.5" fill="black" />
                <circle cx="15" cy="10" r="1.5" fill="black" />
                <path
                  d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          }
          name="Duolingo"
          price="€8,95"
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

function SubscriptionItem({ logo, name, price }) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center px-4 py-5">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 overflow-hidden">
          {logo}
        </div>
        <span className="text-xl flex-1">{name}</span>
        <span className="text-xl font-medium mr-4">{price}</span>
        <button className="p-1">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

