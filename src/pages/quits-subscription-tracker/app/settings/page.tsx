"use client"

import { ArrowLeft, Moon, Bell, CreditCard, HelpCircle, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-blue-800 text-white px-4 py-2 flex justify-between items-center">
        <span className="text-lg font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-white"></div>
          <div className="h-3 w-4 bg-white mask-wifi"></div>
          <div className="h-3 w-6 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-blue-800 text-white p-4 flex items-center">
        <button onClick={() => router.back()} className="p-2 mr-4" aria-label="Go back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <SettingsItem icon={<Moon className="w-5 h-5 text-blue-800" />} title="Dark Mode" action={<Switch />} />
          <SettingsItem
            icon={<Bell className="w-5 h-5 text-blue-800" />}
            title="Notifications"
            action={<Switch defaultChecked />}
          />
          <SettingsItem icon={<CreditCard className="w-5 h-5 text-blue-800" />} title="Payment Methods" />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <SettingsItem icon={<HelpCircle className="w-5 h-5 text-blue-800" />} title="Help & Support" />
          <SettingsItem icon={<LogOut className="w-5 h-5 text-red-500" />} title="Log Out" titleClass="text-red-500" />
        </div>

        <div className="text-center text-gray-500 text-sm mt-6">
          <p>Quits v1.2.0</p>
          <p className="mt-1">© 2023 Quits Inc.</p>
        </div>
      </div>
    </div>
  )
}

function SettingsItem({ icon, title, action, titleClass = "" }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="mr-3">{icon}</div>
      <span className={`flex-1 ${titleClass}`}>{title}</span>
      {action}
    </div>
  )
}

