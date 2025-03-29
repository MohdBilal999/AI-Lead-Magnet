"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Template {
  id: string
  name: string
  description: string
  subject: string
  content: string
}

interface EmailTemplatesProps {
  value: string
  onChange: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
  onSelectTemplate: (template: { subject: string; content: string }) => void
}

// Function to strip HTML tags for preview text
const stripHtmlTags = (html: string) => html.replace(/<[^>]*>/g, "").trim()

export default function EmailTemplates({ value, onChange, placeholder, onSelectTemplate }: EmailTemplatesProps) {
  const templates: Template[] = [
    {
      id: "welcome",
      name: "Welcome Email",
      description: "Send a warm welcome to new leads",
      subject: "Welcome to Our Community!",
      content: `
        <p>Hello there,</p>
        <p>We're thrilled to have you join our community! Thank you for your interest in our products and services.</p>
        <p>Here are some resources to help you get started:</p>
        <ul>
          <li>Check out our <a href="#">getting started guide</a></li>
          <li>Explore our <a href="#">knowledge base</a></li>
          <li>Connect with us on <a href="#">social media</a></li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    },
    {
      id: "promo",
      name: "Special Offer",
      description: "Promote a special discount or offer",
      subject: "Exclusive Offer Just For You!",
      content: `
        <p>Hi there,</p>
        <p>We're excited to offer you an <strong>exclusive discount</strong> on our premium products!</p>
        <p style="font-size: 18px; text-align: center; margin: 20px 0;">
          <strong>Use code: SPECIAL25 for 25% off your next purchase</strong>
        </p>
        <p>This offer is valid until the end of the month. Don't miss out on this opportunity!</p>
        <p>
          <a href="#" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Shop Now
          </a>
        </p>
        <p>Thank you for being a valued customer.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    },
    {
      id: "newsletter",
      name: "Monthly Newsletter",
      description: "Keep your leads informed with updates",
      subject: "Your Monthly Update - What's New",
      content: `
        <p>Hello,</p>
        <p>Here's your monthly update on what's happening:</p>
        <h3>Latest News</h3>
        <p>We've launched several new features this month that we're excited to share with you.</p>
        <h3>Upcoming Events</h3>
        <p>Join us for our webinar on [Topic] on [Date]. <a href="#">Register here</a>.</p>
        <h3>Featured Content</h3>
        <p>Check out our latest blog post: <a href="#">[Blog Title]</a></p>
        <p>We hope you find this update helpful!</p>
        <p>Best regards,<br>Your Team</p>
      `,
    },
  ]

  return (
    <div className="grid gap-4 py-4">
      <h3 className="text-lg font-medium">Select a Template</h3>

      {/* Input for custom template */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter custom email template..."}
        className="border p-2 rounded w-full"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => {
          const previewContent = stripHtmlTags(template.content).substring(0, 100) + "..."

          return (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">Subject: {template.subject}</p>
                <div className="mt-2 text-sm text-muted-foreground">{previewContent}</div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => onSelectTemplate({ subject: template.subject, content: template.content })}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
