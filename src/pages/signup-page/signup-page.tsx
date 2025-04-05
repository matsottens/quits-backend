/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
"use client"

import * as React from 'react';
import { Link } from '../../utils/nextCompatibility';
// Remove Next.js font imports and add CSS imports for the fonts
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
// Removed duplicate import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const { useState } = React;

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted with:", { email, password })
  }

  return (
    <div className={`flex flex-col min-h-screen bg-[#ffefd5] font-sans`}>
      {/* Status bar */}
      <div className="flex justify-between items-center p-4">
        <div className="text-black font-medium">9:41</div>
        <div className="flex items-center gap-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 14L12 8L18 14" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 14L12 8L18 14" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="black" strokeWidth="2" />
            <rect x="7" y="10" width="10" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-12 flex items-center">
          <div className="w-8 h-8 mr-2 relative">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5">
              {Array(16)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="rounded-full bg-slate-400 opacity-70"></div>
                ))}
            </div>
          </div>
          <span className="text-4xl font-bold text-[#1a365d] font-serif">Quits</span>
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-[#1a365d] mb-2 font-serif tracking-wide">
            Create an account
          </h1>
          <p className="text-center text-[#1a365d] mb-8 font-sans text-sm tracking-wide">
            Enter your email to sign up for this app
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[#1a365d] font-medium font-sans text-sm tracking-wide">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="h-14 px-4 bg-white border-gray-200 font-sans text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[#1a365d] font-medium font-sans text-sm tracking-wide">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Password123"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                className="h-14 px-4 bg-white border-gray-200 font-sans text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-black hover:bg-black/90 text-white text-base font-normal font-sans tracking-wide"
            >
              Continue
            </Button>
          </form>

          <p className="text-center text-gray-500 mt-6 font-sans text-xs tracking-wide">
            By clicking continue, you agree to our{" "}
            <Link href="#" className="text-black font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-black font-medium">
              Privacy Policy
            </Link>
          </p>

          <div className="text-center mt-6">
            <Link href="/login" className="text-[#1a365d] font-medium font-sans text-sm tracking-wide">
              Already have an account? Log in here.
            </Link>
          </div>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social login buttons */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-14 bg-gray-100 hover:bg-gray-200 border-gray-200 flex items-center justify-center gap-2 font-sans text-sm tracking-wide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                  fill="#FFC107"
                />
                <path
                  d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z"
                  fill="#FF3D00"
                />
                <path
                  d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
                  fill="#4CAF50"
                />
                <path
                  d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                  fill="#1976D2"
                />
              </svg>
              <span>Continue with Gmail</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 bg-gray-100 hover:bg-gray-200 border-gray-200 flex items-center justify-center gap-2 font-sans text-sm tracking-wide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0078D4" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 12.5V21.5H5.5C4.4 21.5 3.5 20.6 3.5 19.5V5.5C3.5 4.4 4.4 3.5 5.5 3.5H19.5C20.6 3.5 21.5 4.4 21.5 5.5V12.5H11.5Z" />
              </svg>
              <span>Continue with Outlook</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

