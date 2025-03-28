"use client"

import { Home, Calendar, Search, Filter } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="bg-blue-800 text-white grid grid-cols-4 py-2 border-t border-blue-700">
      <NavItem
        icon={<Home className="w-6 h-6" />}
        label="Dashboard"
        active={pathname === "/"}
        onClick={() => router.push("/")}
      />
      <NavItem
        icon={<Calendar className="w-6 h-6" />}
        label="Calendar"
        active={pathname === "/calendar"}
        onClick={() => router.push("/calendar")}
      />
      <NavItem
        icon={<Search className="w-6 h-6" />}
        label="Search"
        active={pathname === "/search"}
        onClick={() => router.push("/search")}
      />
      <NavItem
        icon={<Filter className="w-6 h-6" />}
        label="Filter"
        active={pathname === "/filter"}
        onClick={() => router.push("/filter")}
      />
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button className="flex flex-col items-center justify-center py-2" onClick={onClick}>
      <div className={active ? "text-white" : "text-blue-200"}>{icon}</div>
      <span className={`text-xs mt-1 ${active ? "text-white" : "text-blue-200"}`}>{label}</span>
    </button>
  )
}

