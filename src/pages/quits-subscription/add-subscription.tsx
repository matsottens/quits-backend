"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Home, Calendar, Search, Filter, CreditCard, Clock, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddSubscription() {
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [notifyMe, setNotifyMe] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log({ name, duration, notifyMe })

    // Redirect to dashboard upcoming page
    router.push("/dashboard/upcoming")
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-[#1e3a73] text-white p-4 flex items-center relative">
        <Link href="/dashboard" className="absolute left-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <div className="flex">
              <div className="grid grid-cols-3 gap-[2px]">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-[3px] h-[3px] bg-white rounded-full opacity-70" />
                ))}
              </div>
            </div>
            <h1 className="text-2xl font-semibold">Quits</h1>
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="bg-[#1e3a73] text-white py-4 px-6 text-center">
        <h2 className="text-2xl font-semibold">Add subscription</h2>
      </div>

      {/* Form */}
      <div className="flex-1 bg-[#ffefd5] p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-700">Subscription Details</h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 text-sm font-medium mb-1.5">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Subscription Name</span>
                </div>
                <Input
                  placeholder="Enter subscription name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-[#f5f7fa] border border-gray-200 rounded-md px-4 text-base focus:border-[#6a5acd] focus:ring-1 focus:ring-[#6a5acd] transition-all"
                />
              </div>

              {/* Duration Field */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 text-sm font-medium mb-1.5">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Duration</span>
                </div>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="h-12 bg-[#f5f7fa] border border-gray-200 rounded-md px-4 text-base focus:border-[#6a5acd] focus:ring-1 focus:ring-[#6a5acd] transition-all">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="3years">3 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notify Me Field */}
              <div className="space-y-2">
                <div className="flex items-center text-gray-600 text-sm font-medium mb-1.5">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Notification Preference</span>
                </div>
                <Select value={notifyMe} onValueChange={setNotifyMe}>
                  <SelectTrigger className="h-12 bg-[#f5f7fa] border border-gray-200 rounded-md px-4 text-base focus:border-[#6a5acd] focus:ring-1 focus:ring-[#6a5acd] transition-all">
                    <SelectValue placeholder="Select notification timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 month in advance</SelectItem>
                    <SelectItem value="2months">2 months in advance</SelectItem>
                    <SelectItem value="3months">3 months in advance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-[#1e3a73] hover:bg-[#152a54] text-white px-6 py-2.5 rounded-md text-base font-medium transition-colors"
            >
              Confirm
            </Button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="bg-[#1e3a73] text-white p-4">
        <div className="flex justify-around items-center">
          <Link href="/dashboard" className="flex flex-col items-center">
            <Home size={24} />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center">
            <Calendar size={24} />
            <span className="text-sm">Calendar</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center">
            <Search size={24} />
            <span className="text-sm">Search</span>
          </Link>
          <Link href="/filter" className="flex flex-col items-center">
            <Filter size={24} />
            <span className="text-sm">Filter</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

