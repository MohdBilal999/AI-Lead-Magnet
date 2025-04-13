"use server";

import { prismadb } from "@/lib/prismadb";
import sgMail from "@sendgrid/mail";

interface SendEmailParams {
  recipients: string[];
  subject: string;
  content: string;
  leadMagnetId?: string;
}

export async function sendEmail({
  recipients,
  subject,
  content,
  leadMagnetId,
}: SendEmailParams) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key is not configured");
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Create campaign with lead magnet reference
    const campaign = await prismadb.emailCampaign.create({
      data: {
        name: subject,
        subject,
        content,
        status: "queued",
        metrics: {
          create: {
            sends: recipients.length,
          },
        },
      },
    });

    // Create recipient records with pending status
    const leads = await prismadb.lead.findMany({
      where: {
        email: { in: recipients },
        leadMagnetId: leadMagnetId,
      },
    });

    await prismadb.emailRecipient.createMany({
      data: leads.map((lead) => ({
        campaignId: campaign.id,
        leadId: lead.id,
        status: "pending",
        senderName: process.env.SENDGRID_SENDER_NAME || "Your Company",
      })),
    });

    const msg = {
      to: recipients,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_SENDER_NAME || "Your Company",
      },
      subject,
      html: content,
      customArgs: {
        campaignId: campaign.id,
        leadMagnetId,
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: true },
      },
    };

    const response = await sgMail.send(msg);

    // Update campaign and recipient status
    await prismadb.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    // Update all recipients to "sent" status
    await prismadb.emailRecipient.updateMany({
      where: { campaignId: campaign.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      messageId: campaign.id,
      recipientCount: recipients.length,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function getEmailMetrics(messageId: string) {
  try {
    // Get metrics and recipients count
    const [metrics, recipients] = await Promise.all([
      prismadb.emailMetrics.findFirst({
        where: { campaignId: messageId },
        include: { campaign: true },
      }),
      prismadb.emailRecipient.findMany({
        where: { campaignId: messageId },
      }),
    ]);

    // If metrics exist, return with total recipients
    if (metrics) {
      // Convert boolean-like numbers to actual booleans for display
      const sends =
        metrics.sends === 1
          ? 1
          : recipients.filter((r) => r.status === "sent").length;
      const opens =
        metrics.opens === 1
          ? 1
          : recipients.filter((r) => r.status === "opened").length;
      const clicks =
        metrics.clicks === 1
          ? 1
          : recipients.filter((r) => r.status === "clicked").length;

      return {
        opens,
        clicks,
        sends,
        total: recipients.length,
        status: metrics.campaign?.status || "sent",
        lastUpdated: metrics.updatedAt,
      };
    }

    // If no metrics but recipients exist
    if (recipients.length > 0) {
      return {
        opens: 0,
        clicks: 0,
        sends: recipients.filter((r) => r.status === "sent").length,
        total: recipients.length,
        status: "pending",
      };
    }

    // Default return when no data
    return {
      opens: 0,
      clicks: 0,
      sends: 0,
      total: 0,
      status: "pending",
    };
  } catch (error) {
    console.error("Error fetching email metrics:", error);
    return {
      opens: 0,
      clicks: 0,
      sends: 0,
      status: "error",
    };
  }
}
