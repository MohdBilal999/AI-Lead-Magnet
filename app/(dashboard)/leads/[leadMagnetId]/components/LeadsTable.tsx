"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead } from "@prisma/client";
import { useState } from "react";
import dayjs from "dayjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Info,
  Mails,
  MousePointerClick,
  UserMinus,
  Calendar,
  Sparkles,
} from "lucide-react";
import EmailModal from "./EmailModal";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

// Add Avatar component directly
import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// Interface that properly matches your schema structure
interface LeadWithMetrics extends Lead {
  emailRecipients: {
    id: string;
    status: string;
    openedAt: Date | null;
    clickedAt: Date | null;
    sentAt: Date | null;
    campaignId: string;
    campaign: {
      id: string;
      name: string;
      sentAt: Date | null;
      metrics: {
        id: string;
        campaignId: string;
        sends: number;
        opens: number;
        clicks: number;
        bounces: number;
        unsubscribes: number;
      } | null;
    };
  }[];
}

function LeadsTable({ leads }: { leads: LeadWithMetrics[] }) {
  const [selectedLeads, setSelectedLeads] = useState<LeadWithMetrics[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<
    LeadWithMetrics | LeadWithMetrics[]
  >([]);

  const handleSelectLead = (lead: LeadWithMetrics, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, lead]);
    } else {
      setSelectedLeads(selectedLeads.filter((l) => l.id !== lead.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads([...leads]);
    } else {
      setSelectedLeads([]);
    }
  };

  const openEmailModal = (target: LeadWithMetrics | LeadWithMetrics[]) => {
    setEmailTarget(target);
    setIsEmailModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Collects all campaign metrics for a lead
  const getLeadCampaignMetrics = (lead: LeadWithMetrics) => {
    // Create a map of campaign metrics by campaign ID
    const campaignMetricsMap = new Map();
    
    // Gather all campaign metrics
    lead.emailRecipients.forEach(recipient => {
      if (recipient.campaign && recipient.campaign.metrics) {
        const campaignId = recipient.campaignId;
        
        if (!campaignMetricsMap.has(campaignId)) {
          campaignMetricsMap.set(campaignId, recipient.campaign.metrics);
        }
      }
    });
    
    // Return as array of metrics
    return Array.from(campaignMetricsMap.values());
  };

  // Get total metrics across all campaigns
  const getTotalMetrics = (lead: LeadWithMetrics) => {
    const metrics = getLeadCampaignMetrics(lead);
    return metrics.reduce(
      (totals, metric) => {
        totals.sends += metric.sends || 0;
        totals.opens += metric.opens || 0;
        totals.clicks += metric.clicks || 0;
        totals.bounces += metric.bounces || 0;
        totals.unsubscribes += metric.unsubscribes || 0;
        return totals;
      },
      { sends: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 }
    );
  };

  const getEngagementScore = (lead: LeadWithMetrics) => {
    const metrics = getTotalMetrics(lead);
    
    if (metrics.sends === 0) return 0;
    
    // Calculate score: (opens + clicks*2) / sends
    const score = Math.min(100, Math.round(((metrics.opens + metrics.clicks * 2) / metrics.sends) * 100));
    return score;
  };

  const getLastEngagement = (lead: LeadWithMetrics) => {
    const engagements = [
      ...lead.emailRecipients.map(r => r.openedAt).filter(Boolean),
      ...lead.emailRecipients.map(r => r.clickedAt).filter(Boolean)
    ].sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());
    
    return engagements.length > 0 ? engagements[0] : null;
  };

  const getLatestCampaign = (lead: LeadWithMetrics) => {
    const campaigns = lead.emailRecipients
      .filter(r => r.sentAt && r.campaign?.name)
      .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
    
    return campaigns.length > 0 ? campaigns[0].campaign.name : "None";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        {selectedLeads.length > 0 && (
          <Button
            onClick={() => openEmailModal(selectedLeads)}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Selected ({selectedLeads.length})
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  leads.length > 0 && selectedLeads.length === leads.length
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="text-lg">Lead</TableHead>
            <TableHead className="text-lg">Email</TableHead>
            <TableHead className="text-lg">Signup Date</TableHead>
            <TableHead className="text-lg">Engagement</TableHead>
            <TableHead className="text-lg">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const metrics = getTotalMetrics(lead);
            const engagementScore = getEngagementScore(lead);
            const lastEngagement = getLastEngagement(lead);
            
            return (
              <TableRow
                key={lead.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.some((l) => l.id === lead.id)}
                    onCheckedChange={(checked: boolean) =>
                      handleSelectLead(lead, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-primary/10">
                      <AvatarFallback className="text-primary">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <HoverCard>
                      <HoverCardTrigger className="flex items-center gap-2 cursor-pointer">
                        <span className="font-medium">{lead.name}</span>
                        <Info className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-[340px] p-5 shadow-lg rounded-xl border-none">
                        <div className="space-y-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 bg-primary/10">
                              <AvatarFallback className="text-primary font-semibold">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{lead.name}</h4>
                              <p className="text-sm text-muted-foreground">{lead.email}</p>
                            </div>
                            <Badge variant={engagementScore > 70 ? "default" : engagementScore > 30 ? "outline" : "secondary"}>
                              {engagementScore > 70 ? "Active" : engagementScore > 30 ? "Moderate" : "Cold"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Email Engagement
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <EmailMetricItem
                                icon={<Mail className="h-4 w-4 text-yellow-500" />}
                                label="Emails Sent"
                                value={metrics.sends || 0}
                                suffix={metrics.sends === 1 ? "email" : "emails"}
                              />
                              <EmailMetricItem
                                icon={<Mails className="h-4 w-4 text-blue-500" />}
                                label="Opens"
                                value={metrics.opens || 0}
                                suffix={metrics.opens === 1 ? "open" : "opens"}
                                subtext={metrics.sends > 0 ? `${Math.round((metrics.opens / metrics.sends) * 100)}% rate` : ""}
                              />
                              <EmailMetricItem
                                icon={<MousePointerClick className="h-4 w-4 text-green-500" />}
                                label="Clicks"
                                value={metrics.clicks || 0}
                                suffix={metrics.clicks === 1 ? "click" : "clicks"}
                                subtext={metrics.sends > 0 ? `${Math.round((metrics.clicks / metrics.sends) * 100)}% rate` : ""}
                              />
                              <EmailMetricItem
                                icon={<UserMinus className="h-4 w-4 text-red-500" />}
                                label="Unsubscribes"
                                value={metrics.unsubscribes || 0}
                                emphasis={true}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Latest Campaign:
                              </span>
                              <span className="text-xs font-medium">{getLatestCampaign(lead)}</span>
                            </div>
                            {lastEngagement && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MousePointerClick className="h-3 w-3" />
                                  Last Engaged:
                                </span>
                                <span className="text-xs font-medium">
                                  {dayjs(lastEngagement).format("MMM D, YYYY")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </TableCell>
                
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  {dayjs(lead.createdAt).format("MMM D, YYYY")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-full bg-muted rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          engagementScore > 70 
                            ? "bg-green-500" 
                            : engagementScore > 30 
                              ? "bg-yellow-500" 
                              : "bg-red-500"
                        }`} 
                        style={{ width: `${engagementScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{engagementScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEmailModal(lead)}
                    className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {leads.length === 0 && (
        <div className="text-center m-5 font-bold">No Leads Found</div>
      )}

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipients={emailTarget}
      />
    </>
  );
}

const EmailMetricItem = ({ icon, label, value, suffix, subtext, emphasis = false }: any) => (
  <div className={`flex items-center gap-2 cursor-default ${emphasis && value > 0 ? "text-red-500" : ""}`}>
    {icon}
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className={`text-lg font-semibold ${emphasis && value > 0 ? "text-red-500" : ""}`}>
        {value} {suffix}
      </p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  </div>
);

export default LeadsTable;