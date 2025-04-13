"use server";

import { prismadb } from "@/lib/prismadb";

export async function getLeadMagnetMetrics(leadMagnetId: string) {
  try {
    const leads = await prismadb.lead.findMany({
      where: {
        leadMagnetId: leadMagnetId,
      },
      include: {
        emailRecipients: {
          include: {
            campaign: true,
          },
        },
      },
    });

    if (leads.length === 0) {
      return null;
    }

    // Get all email recipients for these leads
    const recipients = leads.flatMap((lead) => lead.emailRecipients);
    const campaignIds = Array.from(
      new Set(recipients.map((r) => r.campaignId))
    );

    // Get email metrics for these campaigns
    const metrics = await prismadb.emailMetrics.findMany({
      where: {
        campaignId: {
          in: campaignIds,
        },
      },
    });

    // Get email events for these campaigns
    const events = await prismadb.emailEvent.findMany({
      where: {
        campaignId: {
          in: campaignIds,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Calculate send status metrics
    const statusMetrics = recipients.reduce(
      (acc, recipient) => {
        acc.total++;
        if (
          recipient.status === "sent" ||
          recipient.status === "opened" ||
          recipient.status === "clicked"
        ) {
          acc.delivered++;
        }
        return acc;
      },
      { total: 0, delivered: 0 }
    );

    // Calculate aggregated metrics
    const aggregatedMetrics = {
      sends: metrics.reduce((sum, m) => sum + m.sends, 0),
      opens: metrics.reduce((sum, m) => sum + m.opens, 0),
      clicks: metrics.reduce((sum, m) => sum + m.clicks, 0),
      bounces: metrics.reduce((sum, m) => sum + m.bounces, 0),
      unsubscribes: metrics.reduce((sum, m) => sum + m.unsubscribes, 0),
      campaigns: campaignIds.length,
      delivered: statusMetrics.delivered,
      totalEmails: statusMetrics.total,
    };

    // Calculate daily stats for the last 7 days
    const dailyStats = getDailyStats(events);

    return {
      ...aggregatedMetrics,
      dailyStats,
    };
  } catch (error) {
    console.error("Error fetching lead magnet metrics:", error);
    throw error;
  }
}

function getDailyStats(events: any[]) {
  const today = new Date();
  const result = [];

  // Create an array of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });

    // Filter events for this day
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });

    // Count events by type
    const sends = dayEvents.filter((e) => e.eventType === "send").length;
    const opens = dayEvents.filter((e) => e.eventType === "open").length;
    const clicks = dayEvents.filter((e) => e.eventType === "click").length;

    result.push({
      date: dayStr,
      sends,
      opens,
      clicks,
    });
  }

  return result;
}
