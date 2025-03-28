import Link from "next/link"

export default function OnboardingScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-[#ffefd5] text-[#2b4b81]">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-4">
        <div className="text-lg font-semibold">9:41</div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.33 4.67c1.1 0 2.17.33 3.07.93.9.6 1.6 1.47 2 2.47.4 1 .5 2.1.3 3.13-.2 1.03-.7 1.97-1.47 2.7-.77.73-1.77 1.23-2.83 1.43-1.07.2-2.17.1-3.17-.3-1-.4-1.87-1.1-2.47-2-.6-.9-.93-1.97-.93-3.07 0-1.47.57-2.87 1.6-3.9 1.03-1.03 2.43-1.6 3.9-1.6zM19 12c.34 0 .67.03 1 .1V4c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h7.1c-.07-.33-.1-.66-.1-1 0-1.07.41-2.07 1.17-2.83.76-.76 1.76-1.17 2.83-1.17z" />
            </svg>
          </div>
          <div className="h-4 w-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
          </div>
          <div className="h-4 w-6 relative">
            <div className="absolute inset-0 border-2 border-current rounded-sm"></div>
            <div className="absolute inset-y-0 left-0 right-1 bg-current rounded-sm mx-[2px] my-[2px]"></div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="flex justify-center mt-16 mb-auto">
        <div className="flex items-center">
          <div className="relative h-12 w-12 mr-2">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#2b4b81] opacity-50">
              <circle cx="20" cy="20" r="5" />
              <circle cx="40" cy="20" r="5" />
              <circle cx="60" cy="20" r="5" />
              <circle cx="80" cy="20" r="5" />

              <circle cx="20" cy="40" r="5" />
              <circle cx="40" cy="40" r="5" />
              <circle cx="60" cy="40" r="5" />
              <circle cx="80" cy="40" r="5" />

              <circle cx="20" cy="60" r="5" />
              <circle cx="40" cy="60" r="5" />
              <circle cx="60" cy="60" r="5" />
              <circle cx="80" cy="60" r="5" />

              <circle cx="20" cy="80" r="5" />
              <circle cx="40" cy="80" r="5" />
              <circle cx="60" cy="80" r="5" />
              <circle cx="80" cy="80" r="5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#2b4b81]">Quits</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center mb-auto">
        <h2 className="text-5xl font-bold mb-6 text-[#2b4b81] drop-shadow-md">Get started.</h2>
        <p className="text-2xl text-[#2b4b81] opacity-80">Take control of your wallet.</p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end p-6">
        <Link href="/onboarding/step2" className="text-2xl font-semibold text-[#2b4b81]">
          Next
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center pb-8">
        <div className="w-1/3 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}

