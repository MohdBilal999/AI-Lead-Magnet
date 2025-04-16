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

// Add imports for date filtering components at the top of the file
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

// Update the LeadsTable function to include date filtering
function LeadsTable({ leads }: { leads: LeadWithMetrics[] }) {
  const [selectedLeads, setSelectedLeads] = useState<LeadWithMetrics[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<
    LeadWithMetrics | LeadWithMetrics[]
  >([]);
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filteredLeads, setFilteredLeads] = useState<LeadWithMetrics[]>(leads);
  const [filterType, setFilterType] = useState<string>("all");

  // Apply filters whenever dependencies change
  React.useEffect(() => {
    let result = [...leads];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);

        result = result.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= fromDate && leadDate <= toDate;
        });
      } else {
        // If only "from" date is selected
        result = result.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= fromDate;
        });
      }
    }

    // Apply email status filter
    if (filterType !== "all") {
      result = result.filter((lead) => {
        if (filterType === "sent") {
          // Check if any email has been sent to this lead
          return lead.emailRecipients.some(
            (recipient) =>
              recipient.status === "sent" || recipient.sentAt !== null
          );
        } else if (filterType === "opened") {
          return lead.emailRecipients.some(
            (recipient) =>
              recipient.status === "opened" || recipient.openedAt !== null
          );
        } else if (filterType === "clicked") {
          return lead.emailRecipients.some(
            (recipient) =>
              recipient.status === "clicked" || recipient.clickedAt !== null
          );
        } else if (filterType === "not_sent") {
          return (
            lead.emailRecipients.length === 0 ||
            !lead.emailRecipients.some(
              (recipient) =>
                recipient.status === "sent" || recipient.sentAt !== null
            )
          );
        }
        return true;
      });
    }

    setFilteredLeads(result);
    // Reset selected leads when filters change
    setSelectedLeads([]);
  }, [leads, searchTerm, dateRange, filterType]);

  const handleSelectLead = (lead: LeadWithMetrics, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, lead]);
    } else {
      setSelectedLeads(selectedLeads.filter((l) => l.id !== lead.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads([...filteredLeads]);
    } else {
      setSelectedLeads([]);
    }
  };

  const openEmailModal = (target: LeadWithMetrics | LeadWithMetrics[]) => {
    setEmailTarget(target);
    setIsEmailModalOpen(true);
  };

  const handleEmailModalClose = () => {
    setIsEmailModalOpen(false);
    // Update email status for sent emails
    const targetLeads = Array.isArray(emailTarget)
      ? emailTarget
      : [emailTarget];
    const updatedLeads = leads.map((lead) => {
      if (targetLeads.find((target) => target.id === lead.id)) {
        return {
          ...lead,
          emailRecipients: [
            {
              status: "sent",
              sentAt: new Date(),
            },
            ...lead.emailRecipients,
          ],
        };
      }
      return lead;
    });
    // Force re-render with updated status
    setSelectedLeads([]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setFilterType("all");
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
    lead.emailRecipients.forEach((recipient) => {
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
    const score = Math.min(
      100,
      Math.round(((metrics.opens + metrics.clicks * 2) / metrics.sends) * 100)
    );
    return score;
  };

  const getLastEngagement = (lead: LeadWithMetrics) => {
    const engagements = [
      ...lead.emailRecipients.map((r) => r.openedAt).filter(Boolean),
      ...lead.emailRecipients.map((r) => r.clickedAt).filter(Boolean),
    ].sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());

    return engagements.length > 0 ? engagements[0] : null;
  };

  const getLatestCampaign = (lead: LeadWithMetrics) => {
    const campaigns = lead.emailRecipients
      .filter((r) => r.sentAt && r.campaign?.name)
      .sort(
        (a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime()
      );

    return campaigns.length > 0 ? campaigns[0].campaign.name : "None";
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
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

        {/* Filter section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Search</label>
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Date range filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Email status filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Email Status</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="sent">Emails Sent</SelectItem>
                  <SelectItem value="opened">Emails Opened</SelectItem>
                  <SelectItem value="clicked">Emails Clicked</SelectItem>
                  <SelectItem value="not_sent">No Emails Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-9 w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      <div className="rounded-lg border shadow-sm mt-4 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredLeads.length > 0 &&
                    selectedLeads.length === filteredLeads.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-medium">Lead</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Signup Date</TableHead>
              <TableHead className="font-medium">Email Status</TableHead>
              <TableHead className="font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => {
              const metrics = getTotalMetrics(lead);
              const latestRecipient = lead.emailRecipients[0];

              // Update email status logic to check EmailMetrics sends column
              const hasSentEmails = lead.emailRecipients.some(
                (recipient) =>
                  recipient.status === "sent" ||
                  recipient.sentAt !== null ||
                  (recipient.campaign?.metrics?.sends ?? 0) >= 1
              );

              const interactionStatus = hasSentEmails
                ? {
                    icon: <Mail className="h-4 w-4 text-yellow-500" />,
                    label: "Sent",
                  }
                : getInteractionStatus(latestRecipient);

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
                        <HoverCardContent
                          align="start"
                          className="w-[340px] p-5 shadow-lg rounded-xl border-none"
                        >
                          <div className="space-y-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 bg-primary/10">
                                <AvatarFallback className="text-primary font-semibold">
                                  {getInitials(lead.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold">{lead.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {lead.email}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  getEngagementScore(lead) > 70
                                    ? "default"
                                    : getEngagementScore(lead) > 30
                                    ? "outline"
                                    : "secondary"
                                }
                                className="flex items-center gap-2"
                              >
                                {getEngagementScore(lead) > 70
                                  ? "Active"
                                  : getEngagementScore(lead) > 30
                                  ? "Moderate"
                                  : "Cold"}
                                <span className="text-xs">
                                  ({getEngagementScore(lead)}%)
                                </span>
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Email Engagement
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <EmailMetricItem
                                  icon={
                                    <Mail className="h-4 w-4 text-yellow-500" />
                                  }
                                  label="Emails Sent"
                                  value={metrics.sends || 0}
                                  suffix={
                                    metrics.sends === 1 ? "email" : "emails"
                                  }
                                />
                                <EmailMetricItem
                                  icon={
                                    <Mails className="h-4 w-4 text-blue-500" />
                                  }
                                  label="Opens"
                                  value={metrics.opens || 0}
                                  suffix={
                                    metrics.opens === 1 ? "open" : "opens"
                                  }
                                  subtext={
                                    metrics.sends > 0
                                      ? `${Math.round(
                                          (metrics.opens / metrics.sends) * 100
                                        )}% rate`
                                      : ""
                                  }
                                />
                                <EmailMetricItem
                                  icon={
                                    <MousePointerClick className="h-4 w-4 text-green-500" />
                                  }
                                  label="Clicks"
                                  value={metrics.clicks || 0}
                                  suffix={
                                    metrics.clicks === 1 ? "click" : "clicks"
                                  }
                                  subtext={
                                    metrics.sends > 0
                                      ? `${Math.round(
                                          (metrics.clicks / metrics.sends) * 100
                                        )}% rate`
                                      : ""
                                  }
                                />
                                <EmailMetricItem
                                  icon={
                                    <UserMinus className="h-4 w-4 text-red-500" />
                                  }
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
                                <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                                  {getLatestCampaign(lead)}
                                </span>
                              </div>
                              {getLastEngagement(lead) && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MousePointerClick className="h-3 w-3" />
                                    Last Engaged:
                                  </span>
                                  <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                                    {dayjs(getLastEngagement(lead)).format(
                                      "MMM D, YYYY"
                                    )}
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
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="flex items-center gap-2">
                          {interactionStatus.icon}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {interactionStatus.label}
                            </span>
                            {latestRecipient?.sentAt && (
                              <span className="text-xs text-muted-foreground">
                                {dayjs(latestRecipient.sentAt).format(
                                  "MMM D, h:mm A"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-medium">Email Interactions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                Sent
                              </div>
                              <div className="font-medium">
                                {metrics.sends === 1 ? "✓" : metrics.sends || 0}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                Opened
                              </div>
                              <div className="font-medium">
                                {metrics.opens === 1 ? "✓" : metrics.opens || 0}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                Clicked
                              </div>
                              <div className="font-medium">
                                {metrics.clicks === 1
                                  ? "✓"
                                  : metrics.clicks || 0}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                Bounced
                              </div>
                              <div className="font-medium text-red-500">
                                {metrics.bounces > 0 ? "Yes" : "No"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
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

        {filteredLeads.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No leads found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {leads.length > 0
                ? "Try adjusting your filters to see more results."
                : "You don't have any leads yet."}
            </p>
            {leads.length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={handleEmailModalClose}
        recipients={emailTarget}
        leadMagnetId={""}
      />
    </>
  );
}

const EmailMetricItem = ({
  icon,
  label,
  value,
  suffix,
  subtext,
  emphasis = false,
}: any) => (
  <div
    className={`flex items-center gap-2 cursor-default ${
      emphasis && value > 0 ? "text-red-500" : ""
    }`}
  >
    {icon}
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p
        className={`text-lg font-semibold ${
          emphasis && value > 0 ? "text-red-500" : ""
        }`}
      >
        {value} {suffix}
      </p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  </div>
);

function getInteractionStatus(recipient: any) {
  if (!recipient) {
    return {
      icon: <Mail className="h-4 w-4 text-muted-foreground" />,
      label: "No emails sent",
    };
  }

  switch (recipient.status) {
    case "clicked":
      return {
        icon: <MousePointerClick className="h-4 w-4 text-green-500" />,
        label: "Clicked",
      };
    case "opened":
      return {
        icon: <Mail className="h-4 w-4 text-blue-500" />,
        label: "Opened",
      };
    case "sent":
      return {
        icon: <Mail className="h-4 w-4 text-yellow-500" />,
        label: "Sent",
      };
    case "failed":
      return {
        icon: <Mail className="h-4 w-4 text-red-500" />,
        label: "Failed",
      };
    default:
      return {
        icon: <Mail className="h-4 w-4 text-muted-foreground" />,
        label:
          recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1),
      };
  }
}

export default LeadsTable;
