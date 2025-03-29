"use server"

import { prismadb } from "@/lib/prismadb"
import sgMail from "@sendgrid/mail"

interface SendEmailParams {
  recipients: string[]
  subject: string
  content: string
}

export async function sendEmail({ recipients, subject, content }: SendEmailParams) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key is not configured")
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    // Create campaign first
    const campaign = await prismadb.emailCampaign.create({
      data: {
        name: subject,
        subject,
        content,
        status: "sending",
        metrics: {
          create: {} // Creates default metrics
        }
      }
    })

    // Find leads by email
    const leads = await prismadb.lead.findMany({
      where: {
        email: { in: recipients }
      }
    })

    // Create recipient records
    await Promise.all(
      leads.map(lead =>
        prismadb.emailRecipient.create({
          data: {
            campaignId: campaign.id,
            leadId: lead.id,
            status: "pending"
          }
        })
      )
    )

    // Send emails via SendGrid
    const msg = {
      to: recipients,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html: content,
      customArgs: {
        campaignId: campaign.id
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    }

    await sgMail.send(msg)

    // Update campaign status
    await prismadb.emailCampaign.update({
      where: { id: campaign.id },
      data: { 
        status: "sent",
        sentAt: new Date()
      }
    })

    return {
      success: true,
      messageId: campaign.id,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export async function getEmailMetrics(messageId: string) {
  try {
    const metrics = await prismadb.emailMetrics.findUnique({
      where: { campaignId: messageId }
    })

    if (!metrics) {
      return {
        messageId,
        opens: 0,
        clicks: 0,
        unsubscribes: 0
      }
    }

    return {
      messageId,
      opens: metrics.opens,
      clicks: metrics.clicks,
      unsubscribes: metrics.unsubscribes
    }
  } catch (error) {
    console.error("Error fetching metrics:", error)
    throw error
  }
}

