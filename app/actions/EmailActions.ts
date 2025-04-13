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
    const [campaign, metrics, recipients] = await Promise.all([
      prismadb.emailCampaign.findUnique({
        where: { id: messageId },
      }),
      prismadb.emailMetrics.findUnique({
        where: { campaignId: messageId },
      }),
      prismadb.emailRecipient.findMany({
        where: { campaignId: messageId },
      }),
    ]);

    if (!metrics) {
      return {
        messageId,
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
        status: campaign?.status || "unknown",
        sentAt: campaign?.sentAt,
        totalRecipients: recipients.length,
        deliveredCount: recipients.filter(
          (r) =>
            r.status === "sent" ||
            r.status === "opened" ||
            r.status === "clicked"
        ).length,
      };
    }

    return {
      messageId,
      opens: metrics.opens,
      clicks: metrics.clicks,
      unsubscribes: metrics.unsubscribes,
      status: campaign?.status || "unknown",
      sentAt: campaign?.sentAt,
      totalRecipients: recipients.length,
      deliveredCount: recipients.filter(
        (r) =>
          r.status === "sent" || r.status === "opened" || r.status === "clicked"
      ).length,
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw error;
  }
}
