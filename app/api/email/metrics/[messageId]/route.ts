import { NextResponse, NextRequest } from "next/server"
import { prismadb } from "@/lib/prismadb"

export async function GET(req: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const metrics = await prismadb.emailMetrics.findUnique({
      where: { campaignId: params.messageId },
      select: {
        sends: true,
        opens: true,
        clicks: true,
        bounces: true,
        unsubscribes: true,
      }
    })

    if (!metrics) {
      return NextResponse.json({ error: "Metrics not found" }, { status: 404 })
    }

    return NextResponse.json({
      messageId: params.messageId,
      opens: metrics.opens,
      clicks: metrics.clicks,
      unsubscribes: metrics.unsubscribes
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
