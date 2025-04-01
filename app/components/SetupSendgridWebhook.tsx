"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

export default function SetupSendgridWebhook() {
  const [events, setEvents] = useState({
    delivered: true,
    open: true,
    click: true,
    bounce: true,
    dropped: true,
    unsubscribe: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupWebhook = async () => {
    setIsLoading(true);
    try {
      const selectedEvents = Object.entries(events)
        .filter(([_, selected]) => selected)
        .map(([event]) => event);

      const response = await fetch("/api/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: selectedEvents }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast.success(result.message);
    } catch (error) {
    //   toast.error("Failed to set up webhook", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up SendGrid Event Webhook</CardTitle>
        <CardDescription>Configure SendGrid to send email events to your application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Events to Track</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(events).map(([event, checked]) => (
              <div key={event} className="flex items-center space-x-2">
                <Checkbox
                  id={`event-${event}`}
                  checked={checked}
                  onCheckedChange={(value) => setEvents({ ...events, [event]: !!value })}
                />
                <Label htmlFor={`event-${event}`} className="capitalize">{event}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSetupWebhook} disabled={isLoading}>
          {isLoading ? "Setting up..." : "Set Up Webhook"}
        </Button>
      </CardFooter>
    </Card>
  );
}
