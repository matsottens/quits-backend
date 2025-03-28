"use client"

import type React from "react"

import { X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
}

export default function SearchBar({ value, onChange, onClose }: SearchBarProps) {
  return (
    <div className="p-2 bg-[#f9f0e1] border-b border-gray-300">
      <div className="relative flex items-center">
        <input
          id="search-input"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search subscriptions..."
          className="w-full py-3 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1e3c72]"
        />
        <button onClick={onClose} className="absolute right-3">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

