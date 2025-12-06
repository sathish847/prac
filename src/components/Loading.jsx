import { useEffect, useState } from 'react'

export default function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100)
    }, 2000) // Simulate loading time

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logo-dark-full.png"
            alt="Shri Shri Mahaperiyavaa Housing and Properties Pvt Ltd. Logo"
            className="h-20 w-auto object-contain mx-auto animate-pulse"
          />
        </div>

        {/* Loading Text */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primary mb-2 leading-tight">Shri Shri Mahaperiyavaa</h2>
          <p className="text-gray-600 text-sm">Housing & Properties</p>
          <p className="text-gray-500 text-xs mt-1">Loading your dashboard...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{progress}%</p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
