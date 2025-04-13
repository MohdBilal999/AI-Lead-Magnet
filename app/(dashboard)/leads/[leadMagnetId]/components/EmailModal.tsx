"use client";

import { SetStateAction, useState } from "react";
import type { Lead } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendEmail } from "@/app/actions/EmailActions";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor";
import EmailTemplates from "./Emailtemplates";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Lead | Lead[];
  leadMagnetId: string;
  leadMagnetName?: string;
}

export default function EmailModal({
  isOpen,
  onClose,
  recipients,
  leadMagnetId,
  leadMagnetName,
}: EmailModalProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState("");
  const [activeTab, setActiveTab] = useState("compose");

  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  const recipientEmails = recipientArray.map((r) => r.email);

  const handleSendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please provide both subject and content for your email.");
      return;
    }

    setIsSending(true);
    setSendingStatus("Initiating email send...");
    let toastId = toast.loading("Preparing to send email...");

    try {
      const response = await sendEmail({
        recipients: recipientEmails,
        subject: `${leadMagnetName ? `[${leadMagnetName}] ` : ""}${subject}`,
        content,
        leadMagnetId,
      });

      if (response?.success) {
        setSendingStatus("Email queued successfully!");
        toast.success(
          "Email queued successfully! It will be delivered shortly.",
          { id: toastId, duration: 5000 }
        );

        // Show delivery status for 3 seconds
        setTimeout(() => {
          onClose();
          setSubject("");
          setContent("");
          setSendingStatus("");
        }, 3000);
      } else {
        setSendingStatus("Failed to send email");
        toast.error("Failed to send email", { id: toastId });
      }
    } catch (error) {
      setSendingStatus("Error sending email");
      toast.error(
        error instanceof Error ? error.message : "Failed to send email",
        { id: toastId }
      );
    } finally {
      setIsSending(false);
    }
  };

  const applyTemplate = (template: { subject: string; content: string }) => {
    setSubject(template.subject);
    setContent(template.content);
    setActiveTab("compose");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {leadMagnetName && (
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                {leadMagnetName}
              </span>
            )}
            <span>
              Send Email to {recipientEmails.length} Recipient
              {recipientEmails.length > 1 ? "s" : ""}
            </span>
          </DialogTitle>
          {sendingStatus && (
            <div className="mt-2 text-sm">
              <div
                className={`p-2 rounded-md ${
                  sendingStatus.includes("success")
                    ? "bg-green-50 text-green-700"
                    : sendingStatus.includes("Failed")
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {sendingStatus}
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your email content here..."
                onSelectTemplate={applyTemplate}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Sending to: {recipientEmails.join(", ")}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplates
              onSelectTemplate={applyTemplate}
              value={content}
              onChange={setContent}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending || !subject.trim() || !content.trim()}
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
