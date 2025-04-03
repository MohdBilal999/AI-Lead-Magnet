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

      // Create EmailEvent record
      await prismadb.emailEvent.create({
        data: {
          campaignId,
          leadEmail: event.email,
          eventType: event.event,
          url: event.url || null,
          userAgent: event.useragent || null,
          ipAddress: event.ip || null,
        },
      });

      // Update EmailRecipient status and timestamps
      await updateRecipientStatus(campaignId, event);

      // Update aggregate metrics
      switch (event.event) {
        case "open":
          await updateMetrics(campaignId, { opens: 1 });
          break;
        case "click":
          await updateMetrics(campaignId, { clicks: 1 });
          break;
        case "unsubscribe":
          await updateMetrics(campaignId, { unsubscribes: 1 });
          break;
        case "delivered":
          await updateMetrics(campaignId, { delivered: 1 });
          break;
        case "bounce":
        case "dropped":
          await updateMetrics(campaignId, { bounces: 1 });
          break;
      }
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

// Helper function to extract campaign ID from SendGrid message ID
function extractCampaignId(sgMessageId: string): string | null {
  if (!sgMessageId) return null;

  const parts = sgMessageId.split(".");
  if (parts.length > 0) {
    const idParts = parts[0].split("-");
    if (idParts.length > 0) {
      return idParts[0];
    }
  }
  return null;
}

// Helper function to update metrics
async function updateMetrics(
  campaignId: string,
  metricsUpdate: Record<string, number>
) {
  try {
    const existingMetrics = await prismadb.emailMetrics.findUnique({
      where: { campaignId },
    });

    if (existingMetrics) {
      await prismadb.emailMetrics.update({
        where: { campaignId },
        data: Object.entries(metricsUpdate).reduce((acc, [key, value]) => {
          acc[key] = { increment: value };
          return acc;
        }, {} as any),
      });
    } else {
      await prismadb.emailMetrics.create({
        data: {
          campaignId,
          ...Object.entries(metricsUpdate).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as any),
        },
      });
    }

    console.log(`Updated metrics for campaign ${campaignId}:`, metricsUpdate);
  } catch (error) {
    console.error(`Error updating metrics for campaign ${campaignId}:`, error);
  }
}

async function updateRecipientStatus(campaignId: string, event: any) {
  try {
    const recipient = await prismadb.emailRecipient.findFirst({
      where: {
        campaignId,
        lead: {
          email: event.email,
        },
      },
    });

    if (!recipient) return;

    const updateData: any = { status: event.event };

    switch (event.event) {
      case "open":
        updateData.openedAt = new Date();
        break;
      case "click":
        updateData.clickedAt = new Date();
        break;
      case "delivered":
        updateData.sentAt = new Date();
        break;
    }

    await prismadb.emailRecipient.update({
      where: { id: recipient.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating recipient status:", error);
  }
}
