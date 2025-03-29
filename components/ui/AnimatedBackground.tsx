"use client"

import { useEffect, useRef } from "react"

interface AnimatedBackgroundProps {
  className?: string
}

export default function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      type: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 30 + 15
        this.speedX = Math.random() * 0.2 - 0.1
        this.speedY = Math.random() * 0.2 - 0.1
        this.opacity = Math.random() * 0.08 + 0.02
        this.type = Math.random() > 0.5 ? "circle" : "hexagon"
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.x > canvas.width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = canvas.height + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        if (this.type === "circle") {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        } else {
          this.drawHexagon()
        }
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`
        ctx.fill()
      }

      drawHexagon() {
        if (!ctx) return
        const numberOfSides = 6
        const step = (2 * Math.PI) / numberOfSides
        ctx.beginPath()
        for (let i = 0; i < numberOfSides; i++) {
          const x = this.x + this.size * Math.cos(i * step)
          const y = this.y + this.size * Math.sin(i * step)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
      }
    }

    class MarketingElement {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      type: "chart" | "analytics" | "device" | "profile"
      rotation: number
      opacity: number

      constructor() {
        this.size = Math.random() * 40 + 30
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.speedX = Math.random() * 0.3 - 0.15
        this.speedY = Math.random() * 0.3 - 0.15
        this.rotation = Math.random() * Math.PI
        this.opacity = Math.random() * 0.15 + 0.1
        this.type = ["chart", "analytics", "device", "profile"][Math.floor(Math.random() * 4)] as any
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity

        switch (this.type) {
          case "chart":
            this.drawChart()
            break
          case "analytics":
            this.drawAnalytics()
            break
          case "device":
            this.drawDevice()
            break
          case "profile":
            this.drawProfile()
            break
        }

        ctx.restore()
      }

      drawChart() {
        if (!ctx) return
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(-this.size / 2, 0)
        for (let i = 0; i < 10; i++) {
          ctx.lineTo(-this.size / 2 + i * (this.size / 10), (-this.size / 3) * Math.sin(i * 0.5) * Math.random())
        }
        ctx.stroke()
      }

      drawAnalytics() {
        if (!ctx) return
        ctx.fillStyle = "rgba(99, 102, 241, 0.8)"
        for (let i = 0; i < 4; i++) {
          const height = this.size * (0.3 + Math.random() * 0.7)
          ctx.fillRect(i * (this.size / 5), 0, this.size / 7, -height)
        }
      }

      drawDevice() {
        if (!ctx) return
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)"
        ctx.lineWidth = 2
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size)
        ctx.beginPath()
        ctx.moveTo(-this.size / 3, -this.size / 4)
        ctx.lineTo(this.size / 3, -this.size / 4)
        ctx.moveTo(-this.size / 3, 0)
        ctx.lineTo(this.size / 4, 0)
        ctx.stroke()
      }

      drawProfile() {
        if (!ctx) return
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, -this.size / 4, this.size / 4, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, this.size / 2)
        ctx.stroke()
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += 0.002

        if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.x > canvas.width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = canvas.height + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size
      }
    }

    const drawGrid = () => {
      const size = 20
      ctx.strokeStyle = "rgba(229, 231, 235, 0.2)"
      ctx.lineWidth = 0.5

      for (let x = 0; x < canvas.width; x += size) {
        for (let y = 0; y < canvas.height; y += size) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    const drawHexagonAtPoint = (x: number, y: number, size: number) => {
      const numberOfSides = 6
      const step = (2 * Math.PI) / numberOfSides
      ctx.beginPath()
      for (let i = 0; i < numberOfSides; i++) {
        const xPos = x + size * Math.cos(i * step)
        const yPos = y + size * Math.sin(i * step)
        if (i === 0) {
          ctx.moveTo(xPos, yPos)
        } else {
          ctx.lineTo(xPos, yPos)
        }
      }
      ctx.closePath()
      ctx.stroke()
    }

    const particles: Particle[] = Array.from({ length: 15 }, () => new Particle())

    const elements: MarketingElement[] = Array.from({ length: 8 }, () => new MarketingElement())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(255, 255, 255, 0.99)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawGrid()

      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)"
      ctx.lineWidth = 1
      elements.forEach((el1, i) => {
        elements.forEach((el2, j) => {
          if (i < j) {
            const distance = Math.hypot(el1.x - el2.x, el1.y - el2.y)
            if (distance < 300) {
              ctx.beginPath()
              ctx.moveTo(el1.x, el1.y)
              ctx.lineTo(el2.x, el2.y)
              ctx.stroke()
            }
          }
        })
      })

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      elements.forEach((element) => {
        element.update()
        element.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`} />
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/[0.02] via-purple-500/[0.02] to-blue-500/[0.02] -z-10" />
    </>
  )
}

