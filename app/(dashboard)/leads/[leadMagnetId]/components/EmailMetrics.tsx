"use client";

import { useEffect, useState } from "react";
import { getEmailMetrics } from "@/app/actions/EmailActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface EmailMetricsProps {
  messageId: string;
}

interface MetricsData {
  opens: number;
  clicks: number;
  sends: number;
  total?: number;
  status?: string;
}

export default function EmailMetrics({ messageId }: EmailMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getEmailMetrics(messageId);
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setMetrics({ opens: 0, clicks: 0, sends: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [messageId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Waiting for email metrics...
        </CardContent>
      </Card>
    );
  }

  const getInteractionProgress = () => {
    if (!metrics.total) return 0;
    const totalInteractions = metrics.opens + metrics.clicks;
    return (totalInteractions / (metrics.total * 2)) * 100; // Multiply by 2 since each recipient can open and click
  };

  const getStatusMessage = () => {
    if (metrics.sends === 0) return "Email not sent yet";
    if (metrics.opens === 1) return "Email has been opened!";
    if (metrics.clicks === 1) return "Email link was clicked!";
    return metrics.sends === 1 ? "Email sent successfully" : "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Email Engagement
          {metrics.sends === 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              Waiting for delivery...
            </span>
          )}
        </CardTitle>
        <InfoIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.sends === 1 ? "✓" : metrics.sends}
              </div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.opens === 1 ? "✓" : metrics.opens}
              </div>
              <div className="text-xs text-muted-foreground">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.clicks === 1 ? "✓" : metrics.clicks}
              </div>
              <div className="text-xs text-muted-foreground">Clicked</div>
            </div>
          </div>

          {metrics.total && metrics.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Interaction Progress</span>
                <span>{Math.round(getInteractionProgress())}%</span>
              </div>
              <Progress value={getInteractionProgress()} className="h-2" />
            </div>
          )}

          {getStatusMessage() && (
            <div className="text-sm text-center font-medium text-primary">
              {getStatusMessage()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
