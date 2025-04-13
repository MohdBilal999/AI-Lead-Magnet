import { type NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    console.log("SendGrid webhook received:", JSON.stringify(events));

    for (const event of events) {
      const campaignId =
        event.customArgs?.campaignId || extractCampaignId(event.sg_message_id);
      if (!campaignId) {
        console.warn("Event missing campaignId:", event);
        continue;
      }

      // Create EmailEvent record with timestamp
      await prismadb.emailEvent.create({
        data: {
          campaignId,
          leadEmail: event.email,
          eventType: event.event,
          url: event.url || null,
          userAgent: event.useragent || null,
          ipAddress: event.ip || null,
          timestamp: new Date(),
        },
      });

      // Find recipient for status update
      const recipient = await prismadb.emailRecipient.findFirst({
        where: {
          campaign: { id: campaignId },
          lead: { email: event.email },
        },
      });

      if (recipient) {
        // Update recipient status based on event type
        const statusUpdate = getStatusUpdate(event.event);
        if (statusUpdate) {
          await prismadb.emailRecipient.update({
            where: { id: recipient.id },
            data: statusUpdate,
          });
        }
      }

      // Update metrics based on event type
      await updateMetrics(campaignId, event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

function getStatusUpdate(eventType: string) {
  switch (eventType) {
    case "delivered":
      return {
        status: "sent",
        sentAt: new Date(),
      };
    case "open":
      return {
        status: "opened",
        openedAt: new Date(),
      };
    case "click":
      return {
        status: "clicked",
        clickedAt: new Date(),
      };
    case "bounce":
    case "dropped":
      return {
        status: "failed",
      };
    case "unsubscribe":
      return {
        status: "unsubscribed",
      };
    default:
      return null;
  }
}

async function updateMetrics(campaignId: string, eventType: string) {
  const metricsUpdate: any = {};

  switch (eventType) {
    case "delivered":
      metricsUpdate.sends = { increment: 1 };
      break;
    case "open":
      metricsUpdate.opens = { increment: 1 };
      break;
    case "click":
      metricsUpdate.clicks = { increment: 1 };
      break;
    case "bounce":
    case "dropped":
      metricsUpdate.bounces = { increment: 1 };
      break;
    case "unsubscribe":
      metricsUpdate.unsubscribes = { increment: 1 };
      break;
  }

  if (Object.keys(metricsUpdate).length > 0) {
    await prismadb.emailMetrics.update({
      where: { campaignId },
      data: metricsUpdate,
    });

    // Also update campaign status for certain events
    if (eventType === "delivered") {
      await prismadb.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "delivered" },
      });
    }
  }
}

function extractCampaignId(sgMessageId: string): string | null {
  if (!sgMessageId) return null;
  const parts = sgMessageId.split(".");
  return parts.length > 0 ? parts[0] : null;
}
