"use client"

import type React from "react"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

interface LayoutWithBackgroundProps {
  children: React.ReactNode
}

export default function LayoutWithBackground({ children }: LayoutWithBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full">
      <AnimatedBackground />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

