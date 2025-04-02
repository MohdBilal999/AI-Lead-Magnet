// File: app/actions/EmailActions.ts
import sgMail from "@sendgrid/mail";

interface Campaign {
  id: string;
}

interface SendEmailOptions {
  recipients: string[];
  subject: string;
  content: string;
  campaign?: Campaign; // Make campaign optional
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

export async function sendEmail({
  recipients,
  subject,
  content,
  campaign = { id: "default-campaign" }, // Provide default value
}: SendEmailOptions): Promise<SendEmailResponse> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  try {
    // Format recipients properly for sendMultiple
    const messages = recipients.map((recipient) => ({
      to: recipient,
      from: {
        email: process.env.FROM_EMAIL!,
        name: "Mohammed Bilal",
      },
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, ""),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
      customArgs: {
        campaignId: campaign.id,
      },
    }));

    // Use send() with an array of message objects
    const response = await sgMail.send(messages);
    console.log("Email sent successfully", response);
    
    return {
      success: true,
      messageId: Array.isArray(response) && response[0]?.headers['x-message-id'] ? response[0].headers['x-message-id'] : 'sent'
    };
  } catch (error) {
    console.error("Error sending email:", error);

    // Log detailed SendGrid error response if available
    if (error instanceof Error && "response" in error) {
      const sgError = error as any;
      if (sgError.response && sgError.response.body) {
        console.error("SendGrid API Error Details:", sgError.response.body);
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}