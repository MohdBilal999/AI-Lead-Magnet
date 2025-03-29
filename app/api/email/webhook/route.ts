import { type NextRequest, NextResponse } from "next/server"
import { prismadb } from "@/lib/prismadb"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // SendGrid sends an array of events
    const events = Array.isArray(data) ? data : [data]

    for (const event of events) {
      const campaignId = event.campaignId || ""
      const email = event.email || ""
      const eventType = event.event || ""

      if (!campaignId || !email || !eventType) {
        console.warn("Missing required fields in webhook event:", event)
        continue
      }

      // Record the event
      await prismadb.emailEvent.create({
        data: {
          campaignId,
          leadEmail: email,
          eventType,
          url: event.url || null,
          userAgent: event.useragent || null,
          ipAddress: event.ip || null,
        },
      })

      // Find the lead by email
      const lead = await prismadb.lead.findFirst({
        where: { email },
      })

      if (!lead) {
        console.warn(`Lead not found for email: ${email}`)
        continue
      }

      // Find the recipient
      const recipient = await prismadb.emailRecipient.findFirst({
        where: {
          campaignId,
          leadId: lead.id,
        },
      })

      if (!recipient) {
        console.warn(`Recipient not found for campaign ${campaignId} and lead ${lead.id}`)
        continue
      }

      // Update metrics based on event type
      if (eventType === "open") {
        // Update metrics
        await prismadb.emailMetrics.updateMany({
          where: { campaignId },
          data: { opens: { increment: 1 } },
        })

        // Update recipient if not already opened
        if (!recipient.openedAt) {
          await prismadb.emailRecipient.update({
            where: { id: recipient.id },
            data: {
              status: "opened",
              openedAt: new Date(),
            },
          })
        }
      } else if (eventType === "click") {
        // Update metrics
        await prismadb.emailMetrics.updateMany({
          where: { campaignId },
          data: { clicks: { increment: 1 } },
        })

        // Update recipient
        await prismadb.emailRecipient.update({
          where: { id: recipient.id },
          data: {
            status: "clicked",
            clickedAt: new Date(),
          },
        })
      } else if (eventType === "bounce") {
        // Update metrics
        await prismadb.emailMetrics.updateMany({
          where: { campaignId },
          data: { bounces: { increment: 1 } },
        })

        // Update recipient
        await prismadb.emailRecipient.update({
          where: { id: recipient.id },
          data: { status: "bounced" },
        })
      } else if (eventType === "unsubscribe") {
        // Update metrics
        await prismadb.emailMetrics.updateMany({
          where: { campaignId },
          data: { unsubscribes: { increment: 1 } },
        })

        // Update recipient
        await prismadb.emailRecipient.update({
          where: { id: recipient.id },
          data: { status: "unsubscribed" },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing email webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

