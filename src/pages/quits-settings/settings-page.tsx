"use client"

import { useState } from "react"
import { ChevronLeft, Home, Calendar, Search, Filter } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [notificationPeriod, setNotificationPeriod] = useState("2 Months")

  return (
    <div className="flex flex-col h-screen bg-[#FFF0D6]">
      {/* Header */}
      <header className="bg-[#1e3a73] text-white p-4 flex items-center justify-between">
        <button className="p-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center">
          <Image src="/placeholder.svg?height=24&width=24" alt="Quits logo" width={24} height={24} className="mr-2" />
          <span className="text-2xl font-semibold">Quits</span>
        </div>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </header>

      {/* Settings Title */}
      <div className="bg-[#1e3a73] text-white p-4 pb-6 flex justify-center">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[210px] bg-gray-100 p-4 flex flex-col space-y-8">
          <div className="font-semibold text-lg">Linked email</div>
          <div className="font-semibold text-lg">Notifications</div>
          <div className="font-semibold text-lg">Notification preferences</div>
          <div className="font-semibold text-lg">Email notifications</div>
          <div className="font-semibold text-lg">Privacy</div>
          <div className="font-semibold text-lg">Security</div>
          <div className="font-semibold text-lg">Help</div>
          <div className="mt-auto font-semibold text-lg">Sign out</div>
        </div>

        {/* Right content */}
        <div className="flex-1 p-4 flex flex-col space-y-8">
          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="text-lg">mats_ottens@hotmail.com</div>
            <button className="text-blue-500 font-medium">Change email</button>
          </div>

          {/* Notifications toggle */}
          <div className="flex justify-between items-center">
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:bg-[#6b5ca5] data-[state=unchecked]:bg-[#6b5ca5]/40"
            />
            <div className="text-lg">Off/On</div>
          </div>

          {/* Notification preferences */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Checkbox
                id="1month"
                checked={notificationPeriod === "1 Month"}
                onCheckedChange={() => setNotificationPeriod("1 Month")}
                className="border-2 border-gray-400 data-[state=checked]:bg-[#6b5ca5] data-[state=checked]:border-[#6b5ca5]"
              />
              <label htmlFor="1month" className="ml-2 text-lg">
                1 Month
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="2months"
                checked={notificationPeriod === "2 Months"}
                onCheckedChange={() => setNotificationPeriod("2 Months")}
                className="border-2 border-gray-400 data-[state=checked]:bg-[#6b5ca5] data-[state=checked]:border-[#6b5ca5]"
              />
              <label htmlFor="2months" className="ml-2 text-lg">
                2 Months
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="3months"
                checked={notificationPeriod === "3 Months"}
                onCheckedChange={() => setNotificationPeriod("3 Months")}
                className="border-2 border-gray-400 data-[state=checked]:bg-[#6b5ca5] data-[state=checked]:border-[#6b5ca5]"
              />
              <label htmlFor="3months" className="ml-2 text-lg">
                3 Months
              </label>
            </div>
          </div>

          {/* Email notifications toggle */}
          <div className="flex justify-between items-center">
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              className="data-[state=checked]:bg-[#6b5ca5] data-[state=unchecked]:bg-[#6b5ca5]/40"
            />
            <div className="text-lg">Off/On</div>
          </div>

          {/* Privacy */}
          <div className="flex justify-end">
            <button className="text-blue-500 font-medium">Manage email permissions</button>
          </div>

          {/* Security */}
          <div className="flex justify-end">
            <button className="text-blue-500 font-medium">Change password</button>
          </div>

          {/* Help */}
          <div className="flex justify-end">
            <button className="text-blue-500 font-medium">FAQ</button>
          </div>

          <div className="flex justify-end">
            <button className="text-blue-500 font-medium">Contact support</button>
          </div>

          {/* Version */}
          <div className="flex justify-center">
            <div className="text-lg">Version 1.1.0</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[#1e3a73] text-white p-4 flex justify-around">
        <Link href="#" className="flex flex-col items-center">
          <Home size={24} />
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link href="#" className="flex flex-col items-center">
          <Calendar size={24} />
          <span className="text-sm">Calendar</span>
        </Link>
        <Link href="#" className="flex flex-col items-center">
          <Search size={24} />
          <span className="text-sm">Search</span>
        </Link>
        <Link href="#" className="flex flex-col items-center">
          <Filter size={24} />
          <span className="text-sm">Filter</span>
        </Link>
      </div>
    </div>
  )
}

