import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    // Verify SendGrid signature
    const signature = req.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp');

    if (!signature || !timestamp) {
      console.error("Missing webhook signature headers");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await req.json();

    for (const event of events) {
      const campaignId = event?.customArgs?.campaignId;
      
      // Even without campaignId, update metrics
      const metrics = await prismadb.emailMetrics.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      if (metrics) {
        const updates: any = {};
        switch (event.event) {
          case "open":
            updates.opens = { increment: 1 };
            break;
          case "click":
            updates.clicks = { increment: 1 };
            break;
          case "delivered":
            updates.sends = { increment: 1 };
            break;
          case "bounce":
            updates.bounces = { increment: 1 };
            break;
          case "unsubscribe":
            updates.unsubscribes = { increment: 1 };
            break;
        }

        if (Object.keys(updates).length > 0) {
          await prismadb.emailMetrics.update({
            where: { id: metrics.id },
            data: updates
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
