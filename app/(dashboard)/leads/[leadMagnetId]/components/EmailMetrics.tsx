"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmailMetrics } from "@/app/actions/EmailActions"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface EmailMetricsProps {
  messageId: string
}

interface Metrics {
  messageId: string
  opens: number
  clicks: number
  unsubscribes: number
}

export default function EmailMetrics({ messageId }: EmailMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getEmailMetrics(messageId)
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching email metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)

    return () => clearInterval(interval)
  }, [messageId])

  if (loading) {
    return <div className="text-center py-4">Loading metrics...</div>
  }

  if (!metrics) {
    return <div className="text-center py-4">No metrics available</div>
  }

  const chartData = [
    { name: "Opens", value: metrics.opens },
    { name: "Clicks", value: metrics.clicks },
    { name: "Unsubscribes", value: metrics.unsubscribes },
  ]

  const clickRate = metrics.opens > 0 ? ((metrics.clicks / metrics.opens) * 100).toFixed(1) : "0"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Campaign Metrics</CardTitle>
        <CardDescription>Performance data for your email campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.opens}</div>
            <div className="text-sm text-muted-foreground">Opens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.clicks}</div>
            <div className="text-sm text-muted-foreground">Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{clickRate}%</div>
            <div className="text-sm text-muted-foreground">Click Rate</div>
          </div>
        </div>

        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

