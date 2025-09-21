import React from 'react';
import { Plane, Loader2, MapPin, Luggage, Sun, Cloud } from 'lucide-react';

export default function loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative w-full max-w-md aspect-video">
        {/* Sun animation */}
        <div className="absolute top-4 right-4">
          <Sun className="w-8 h-8 text-yellow-500 animate-pulse" />
        </div>

        {/* Animated plane path */}
        <div className="absolute w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <path
              className="stroke-gray-300 dark:stroke-gray-600"
              d="M 0,100 C 100,100 300,100 400,100"
              fill="none"
              strokeDasharray="5,5"
              strokeWidth="2"
            />
            <g className="animate-[moveAlong_3s_linear_infinite]">
              <Plane className="w-8 h-8 text-primary-500 -rotate-90" />
            </g>
          </svg>
        </div>

        {/* Cloud animations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="cloud-1 absolute">
            <Cloud className="w-16 h-16 text-white dark:text-gray-700 opacity-80 animate-[floatCloud_10s_linear_infinite]" />
          </div>
          <div className="cloud-2 absolute">
            <Cloud className="w-20 h-20 text-white dark:text-gray-700 opacity-60 animate-[floatCloud_15s_linear_infinite_2s]" />
          </div>
        </div>

        {/* Map pins appearing */}
        <div className="absolute w-full h-full">
          <MapPin className="absolute top-1/4 left-1/4 w-6 h-6 text-red-500 animate-bounce" />
          <MapPin className="absolute bottom-1/3 right-1/3 w-6 h-6 text-red-500 animate-bounce delay-1000" />
        </div>

        {/* Loading indicator and luggage */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="relative mb-4">
            <Luggage className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            <Loader2 className="absolute inset-0 w-12 h-12 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Preparing Your Journey
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-xs">
            Packing your virtual bags! We&apos;ll have everything ready in a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
