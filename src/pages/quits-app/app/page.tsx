import Image from "next/image"
import { MoreVertical, Plus, Settings } from "lucide-react"
import BottomNavigation from "@/components/bottom-navigation"

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-cream-100">
      {/* Status Bar */}
      <div className="bg-primary p-4 pt-10 text-white flex justify-between items-center">
        <div className="text-lg font-semibold">9:41</div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-4 bg-white rounded-sm"></div>
          <div className="h-3 w-3 bg-white rounded-full"></div>
          <div className="h-3 w-6 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-primary p-4 flex justify-between items-center">
        <button className="p-2">
          <Settings className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center justify-center flex-1">
          <Image src="/images/quits-logo.png" alt="Quits logo" width={140} height={42} className="h-auto w-32" />
        </div>
        <button className="p-2">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-primary text-white flex">
        <button className="flex-1 py-4 border-b-2 border-white font-medium">Upcoming</button>
        <button className="flex-1 py-4 text-white/80 font-medium">Price</button>
      </div>

      {/* Subscription List */}
      <div className="flex-1 overflow-auto bg-cream-100">
        <div className="bg-white rounded-3xl mx-4 my-6 overflow-hidden shadow-sm">
          {subscriptions.map((subscription, index) => (
            <div key={subscription.name} className="border-b border-gray-100 last:border-b-0">
              <div className="flex items-center p-4">
                <div className="w-12 h-12 mr-4 flex items-center justify-center">
                  <Image
                    src={subscription.logoUrl || "/placeholder.svg"}
                    alt={subscription.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{subscription.name}</h3>
                </div>
                <div className="text-right mr-4">
                  <div className="text-gray-800 whitespace-pre-line">{subscription.timeLeft}</div>
                </div>
                <button className="p-2">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

const subscriptions = [
  {
    name: "Volkskrant",
    logoUrl: "/images/volkskrant-logo.png",
    timeLeft: "4 months",
  },
  {
    name: "Monday",
    logoUrl: "/images/monday-logo.svg",
    timeLeft: "6 months",
  },
  {
    name: "Parool",
    logoUrl: "/images/parool-logo.jpeg",
    timeLeft: "9 months",
  },
  {
    name: "Trouw",
    logoUrl: "/images/trouw-logo.jpeg",
    timeLeft: "1 year,\n3 months",
  },
  {
    name: "Netflix",
    logoUrl: "/images/netflix-logo.png",
    timeLeft: "1 year,\n8 months",
  },
  {
    name: "Duolingo",
    logoUrl: "/images/duolingo-logo.png",
    timeLeft: "2 years,\n3 months",
  },
  {
    name: "Trainmore",
    logoUrl: "/images/trainmore-logo.jpeg",
    timeLeft: "2 years",
  },
]

