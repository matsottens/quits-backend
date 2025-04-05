"use client"

import * as React from 'react';
const { useState, useEffect } = React;
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#ffefd5]">
      {/* Status bar - static mockup */}
      <div className="py-2 px-4 flex justify-between items-center">
        <div className="text-black font-semibold">9:41</div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-4 bg-black rounded-sm"></div>
          <div className="h-3 w-3 bg-black rounded-full"></div>
          <div className="h-3 w-6 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Back button */}
      <div className="px-6 py-4">
        <button className="text-black">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center">
          <div className="grid grid-cols-5 gap-1 mr-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#3a5998] opacity-60"></div>
            ))}
          </div>
          <div className="text-5xl font-bold text-[#3a5998]">Quits</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <h1 className="text-3xl font-bold text-center text-[#3a5998] mb-4 drop-shadow-md">
          Scanning for active subscriptions.
        </h1>

        {/* Loading spinner */}
        <div className="w-16 h-16 my-8 relative">
          <div
            className="w-16 h-16 border-4 border-[#3a5998] border-t-transparent rounded-full animate-spin"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${loadingProgress}%, 0 ${loadingProgress}%)`,
            }}
          ></div>
        </div>

        <p className="text-xl text-center text-[#3a5998] font-semibold drop-shadow-sm">
          Please wait while we find your subscriptions.
        </p>
      </div>

      {/* Next button */}
      <div className="p-6 flex justify-end">
        <Button variant="link" className="text-[#3a5998] text-xl font-semibold">
          Next
        </Button>
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center pb-8">
        <div className="w-36 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}

