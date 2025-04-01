import { type NextRequest, NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"

// This route handles webhooks from SendGrid for email events
export async function POST(request: NextRequest) {
  try {
    // SendGrid sends an array of events
    const events = await request.json()

    console.log("SendGrid webhook received:", JSON.stringify(events))

    // Process each event
    for (const event of events) {
      // Extract the campaign ID from custom args or message ID
      const campaignId = event.customArgs?.campaignId || extractCampaignId(event.sg_message_id)

      if (!campaignId) {
        console.warn("Event missing campaignId:", event)
        continue
      }

      // Find the campaign
      const campaign = await prismadb.emailCampaign.findUnique({
        where: { id: campaignId },
        include: { metrics: true },
      })

      if (!campaign) {
        console.warn(`Campaign not found for ID: ${campaignId}`)
        continue
      }

      // Update metrics based on event type
      switch (event.event) {
        case "open":
          await updateMetrics(campaignId, { opens: 1 })
          break
        case "click":
          await updateMetrics(campaignId, { clicks: 1 })
          break
        case "unsubscribe":
          await updateMetrics(campaignId, { unsubscribes: 1 })
          break
        case "delivered":
          await updateMetrics(campaignId, { delivered: 1 })
          break
        case "bounce":
        case "dropped":
          await updateMetrics(campaignId, { bounces: 1 })
          break
        default:
          console.log(`Unhandled event type: ${event.event}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing email webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Helper function to extract campaign ID from SendGrid message ID
function extractCampaignId(sgMessageId: string): string | null {
  if (!sgMessageId) return null

  // If we embedded the campaign ID in the message ID (e.g., "campaignId-timestamp.filterId")
  const parts = sgMessageId.split(".")
  if (parts.length > 0) {
    const idParts = parts[0].split("-")
    if (idParts.length > 0) {
      return idParts[0]
    }
  }
  return null
}

// Helper function to update metrics
async function updateMetrics(campaignId: string, metricsUpdate: Record<string, number>) {
  try {
    // Check if metrics exist for this campaign
    const existingMetrics = await prismadb.emailMetrics.findUnique({
      where: { campaignId },
    })

    if (existingMetrics) {
      // Update existing metrics
      await prismadb.emailMetrics.update({
        where: { campaignId },
        data: Object.entries(metricsUpdate).reduce((acc, [key, value]) => {
          acc[key] = { increment: value }
          return acc
        }, {} as any),
      })
    } else {
      // Create new metrics record
      await prismadb.emailMetrics.create({
        data: {
          campaignId,
          ...Object.entries(metricsUpdate).reduce((acc, [key, value]) => {
            acc[key] = value
            return acc
          }, {} as any),
        },
      })
    }

    console.log(`Updated metrics for campaign ${campaignId}:`, metricsUpdate)
  } catch (error) {
    console.error(`Error updating metrics for campaign ${campaignId}:`, error)
  }
}

