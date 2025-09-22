// src/components/CivicLogo.jsx
import React from "react";

export default function CivicLogo() {
    return (
        <div className="flex items-center space-x-2 group cursor-pointer select-none">
            {/* === Symbol === */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                <svg
                    className="w-10 h-10 text-green-500 transition-transform duration-700 group-hover:rotate-180 group-hover:scale-110"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Outer Circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#grad1)"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Arrows / Progress Symbol */}
                    <path
                        d="M50 15 L58 30 L42 30 Z"
                        fill="url(#grad1)"
                    />
                    <path
                        d="M85 50 L70 58 L70 42 Z"
                        fill="url(#grad1)"
                    />
                    <path
                        d="M50 85 L42 70 L58 70 Z"
                        fill="url(#grad1)"
                    />
                    <path
                        d="M15 50 L30 42 L30 58 Z"
                        fill="url(#grad1)"
                    />
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="100" y2="100">
                            <stop offset="0%" stopColor="#22c55e" /> {/* Tailwind green-500 */}
                            <stop offset="100%" stopColor="#3b82f6" /> {/* Tailwind blue-500 */}
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* === Text === */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                CivicSense
            </h1>
        </div>
    );
}
