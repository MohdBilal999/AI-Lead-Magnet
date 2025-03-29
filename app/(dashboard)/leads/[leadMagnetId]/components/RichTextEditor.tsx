"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  subject: string;
  content: string; // HTML content
}

interface EmailTemplatesProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
  onSelectTemplate: (template: { subject: string; content: string }) => void;
}

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
        <p>Use code: <strong>SPECIAL25</strong> for 25% off your next purchase.</p>
        <p>This offer is valid until the end of the month.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    },
  ];

  // Remove HTML tags for preview text
  const stripHtmlTags = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  return (
    <div className="grid gap-4 py-4">
      {/* Input Field for Custom Email */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter custom email template..."}
        className="border p-2 rounded w-full"
      />

      <h3 className="text-lg font-medium">Select a Template</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Subject: {template.subject}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {stripHtmlTags(template.content).slice(0, 100) + (stripHtmlTags(template.content).length > 100 ? "..." : "")}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => {
                  onChange(template.content); // Updates input with selected template
                  onSelectTemplate({
                    subject: template.subject,
                    content: template.content, // Retains HTML formatting for emails
                  });
                }}
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
