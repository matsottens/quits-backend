import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#ffedd6] px-6 py-8 flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-12">
        <div className="text-[#000000] font-semibold text-lg">9:41</div>
        <div className="flex items-center gap-1">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 4.5H2.5M16 4.5H14.5M4 4.5H5.5M7 4.5H8.5M10 4.5H11.5M13 4.5H14.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 1.5L8 9.5L15 1.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="1.5" width="18" height="9" rx="2" stroke="black" strokeWidth="1.5" />
            <rect x="20" y="3.5" width="2" height="5" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-16">
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.6">
                {/* Outer ring */}
                <circle cx="8" cy="8" r="1.2" fill="#26457a" />
                <circle cx="8" cy="16" r="1.2" fill="#26457a" />
                <circle cx="8" cy="24" r="1.2" fill="#26457a" />
                <circle cx="8" cy="32" r="1.2" fill="#26457a" />

                <circle cx="16" cy="8" r="1.2" fill="#26457a" />
                <circle cx="16" cy="32" r="1.2" fill="#26457a" />

                <circle cx="24" cy="8" r="1.2" fill="#26457a" />
                <circle cx="24" cy="32" r="1.2" fill="#26457a" />

                <circle cx="32" cy="8" r="1.2" fill="#26457a" />
                <circle cx="32" cy="16" r="1.2" fill="#26457a" />
                <circle cx="32" cy="24" r="1.2" fill="#26457a" />
                <circle cx="32" cy="32" r="1.2" fill="#26457a" />

                {/* Middle ring */}
                <circle cx="16" cy="16" r="1.5" fill="#26457a" />
                <circle cx="16" cy="24" r="1.5" fill="#26457a" />
                <circle cx="24" cy="16" r="1.5" fill="#26457a" />
                <circle cx="24" cy="24" r="1.5" fill="#26457a" />

                {/* Center dot */}
                <circle cx="20" cy="20" r="2" fill="#26457a" />
              </g>
            </svg>
          </div>
          <span className="text-[#26457a] text-4xl font-bold">Quits</span>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-semibold text-center mb-6 text-[#26457a]">Sign in</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-[#26457a] text-lg mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="email@domain.com"
            className="w-full p-4 rounded-lg border border-[#e0e0e0] bg-white text-[#828282]"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="password" className="block text-[#26457a] text-lg mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password123"
            className="w-full p-4 rounded-lg border border-[#e0e0e0] bg-white text-[#828282]"
          />
        </div>

        <div className="mb-6">
          <Link href="#" className="text-[#4285f4] text-base">
            Forgot Password?
          </Link>
        </div>

        <button className="w-full bg-black text-white py-4 rounded-lg text-lg font-medium mb-6">Continue</button>

        <p className="text-center text-[#828282] mb-6 text-sm">
          By clicking continue, you agree to our{" "}
          <Link href="#" className="text-black font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-black font-medium">
            Privacy Policy
          </Link>
        </p>

        <button className="w-full bg-[#eeeeee] text-black py-3 rounded-lg text-base font-medium mb-4 flex items-center justify-center">
          <div className="mr-2 flex items-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.1711 8.36788H17.4998V8.33329H9.99984V11.6666H14.7094C14.0223 13.607 12.1761 15 9.99984 15C7.23859 15 4.99984 12.7612 4.99984 10C4.99984 7.23871 7.23859 5 9.99984 5C11.2744 5 12.4344 5.48683 13.3177 6.28537L15.6744 3.92871C14.1897 2.52683 12.1957 1.66663 9.99984 1.66663C5.39775 1.66663 1.6665 5.39788 1.6665 10C1.6665 14.6021 5.39775 18.3333 9.99984 18.3333C14.6019 18.3333 18.3332 14.6021 18.3332 10C18.3332 9.44121 18.2757 8.89579 18.1711 8.36788Z"
                fill="#4285F4"
              />
              <path
                d="M2.62744 6.12121L5.36536 8.12913C6.10619 6.29496 7.90036 5 9.99994 5C11.2745 5 12.4345 5.48683 13.3178 6.28537L15.6745 3.92871C14.1899 2.52683 12.1958 1.66663 9.99994 1.66663C6.74494 1.66663 3.91869 3.47371 2.62744 6.12121Z"
                fill="#EA4335"
              />
              <path
                d="M10 18.3333C12.1525 18.3333 14.1084 17.5096 15.5871 16.17L13.0079 13.9875C12.1429 14.6452 11.0862 15.0009 10 15C7.83255 15 5.99213 13.6179 5.29963 11.6892L2.58047 13.783C3.85422 16.4817 6.70297 18.3333 10 18.3333Z"
                fill="#34A853"
              />
              <path
                d="M18.1711 8.36788H17.4998V8.33329H9.99984V11.6666H14.7094C14.3848 12.5908 13.7885 13.3971 13.0069 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3332 14.1667 18.3332 10C18.3332 9.44121 18.2757 8.89579 18.1711 8.36788Z"
                fill="#FBBC05"
              />
            </svg>
          </div>
          Continue with Gmail
        </button>

        <button className="w-full bg-[#eeeeee] text-black py-3 rounded-lg text-base font-medium mb-8 flex items-center justify-center">
          <div className="mr-2 flex items-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="20" rx="2" fill="#0078D4" />
              <path d="M10 5H16V11L10 13.5L4 11V5H10Z" fill="white" />
              <path d="M10 13.5V20L4 17.5V11L10 13.5Z" fill="#0078D4" fillOpacity="0.8" />
              <path d="M10 20V13.5L16 11V17.5L10 20Z" fill="#0078D4" fillOpacity="0.6" />
            </svg>
          </div>
          Continue with Outlook
        </button>

        {/* Bottom Indicator */}
        <div className="flex justify-center">
          <div className="w-12 h-1 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

