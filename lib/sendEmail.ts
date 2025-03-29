import sgMail from "@sendgrid/mail";

interface Campaign {
  id: string;
}

interface SendEmailOptions {
  recipients: string[];
  subject: string;
  content: string;
  campaign: Campaign;
}

async function sendEmail({
  recipients,
  subject,
  content,
  campaign,
}: SendEmailOptions): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  try {
    // Format recipients properly for sendMultiple
    // Each recipient needs to be a separate message with the same from, subject, content
    const messages = recipients.map((recipient) => ({
      to: recipient, // Individual recipient email
      from: {
        email: process.env.FROM_EMAIL!, // Use FROM_EMAIL environment variable
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

    // Use send() with an array of message objects instead of sendMultiple
    const response = await sgMail.send(messages);
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending email:", error);

    // Log detailed SendGrid error response if available
    if (error instanceof Error && "response" in error) {
      const sgError = error as any;
      if (sgError.response && sgError.response.body) {
        console.error("SendGrid API Error Details:", sgError.response.body);
      }
    }

    throw error;
  }
}

export default sendEmail;
