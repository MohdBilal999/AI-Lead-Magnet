"use client";

import type React from "react";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { LeadMagnet } from "@prisma/client";
import {
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Loader2,
  LucideMousePointerClick,
  Mail,
  SendHorizonal,
} from "lucide-react";
import { getLeadMagnetMetrics } from "@/app/actions/AnaylitcsAction";
import { Badge } from "@/components/ui/badge";

interface LeadMagnetAnalyticsProps {
  leadMagnet: LeadMagnet;
  leadsCount: number;
  children: React.ReactNode;
}

// Modern color palette
const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#F97316"];
const CHART_COLORS = {
  sends: "#6366F1",
  opens: "#8B5CF6",
  clicks: "#EC4899",
};

export default function LeadMagnetAnalytics({
  leadMagnet,
  leadsCount,
  children,
}: LeadMagnetAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  // Fetch email metrics when the hover card is opened
  const handleOpenChange = async (open: boolean) => {
    if (open && !metrics) {
      setLoading(true);
      try {
        const data = await getLeadMagnetMetrics(leadMagnet.id);
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Prepare data for pie chart
  const getPieData = () => {
    if (!metrics) return [];

    return [
      { name: "Opened", value: metrics.opens || 0 },
      { name: "Clicked", value: metrics.clicks || 0 },
      {
        name: "No Action",
        value: Math.max(0, metrics.sends - metrics.opens) || 0,
      },
    ].filter((item) => item.value > 0);
  };

  // Prepare data for bar chart
  const getBarData = () => {
    if (!metrics) return [];

    return [
      { name: "Sent", value: metrics.sends || 0 },
      { name: "Opened", value: metrics.opens || 0 },
      { name: "Clicked", value: metrics.clicks || 0 },
    ];
  };

  // Prepare data for line chart (from email events)
  const getLineData = () => {
    if (!metrics || !metrics.dailyStats) return [];
    return metrics.dailyStats;
  };

  // Calculate percentages
  const getOpenRate = () => {
    if (!metrics || metrics.sends === 0) return 0;
    return ((metrics.opens / metrics.sends) * 100).toFixed(1);
  };

  const getClickRate = () => {
    if (!metrics || metrics.opens === 0) return 0;
    return ((metrics.clicks / metrics.opens) * 100).toFixed(1);
  };

  return (
    <HoverCard openDelay={200} closeDelay={100} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-[420px] p-0 border-none shadow-xl rounded-xl overflow-hidden"
        align="start"
      >
        <Card className="border-0 shadow-none w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1 text-slate-800 dark:text-slate-100">
                  {leadMagnet.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {leadsCount} leads captured
                  </span>
                  {metrics && metrics.campaigns > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                    >
                      {metrics.campaigns} campaigns
                    </Badge>
                  )}
                </div>
              </div>
              {metrics && metrics.sends > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Emails
                  </span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {metrics.sends}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading analytics...
                  </p>
                </div>
              </div>
            ) : !metrics || metrics.sends === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative w-full max-w-sm p-6 overflow-hidden">
                  {/* Background gradient blob */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />

                  {/* Content */}
                  <div className="relative space-y-4 text-center">
                    <div className="flex justify-center">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse" />
                        <SendHorizonal className="relative h-12 w-12 text-indigo-500 dark:text-indigo-400 animate-bounce" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-200 dark:border-indigo-800"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {leadsCount} leads ready
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Start Your Email Campaign
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Your leads are waiting! Click on any lead to create your
                        first email campaign and track performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-800/60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Open Rate
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {getOpenRate()}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/40 dark:to-slate-800/60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Click Rate
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getClickRate()}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/40 dark:to-slate-800/60 rounded-lg p-3 shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Clicks
                    </div>
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {metrics.clicks}
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        <span>Overview</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="engagement"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Engagement</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="trends"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        <span>Trends</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              percent > 0
                                ? `${name}: ${(percent * 100).toFixed(0)}%`
                                : ""
                            }
                          >
                            {getPieData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} emails`, ""]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              padding: "8px 12px",
                              backgroundColor: "white",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="engagement" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getBarData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          barSize={40}
                        >
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickCount={5}
                          />
                          <Tooltip
                            formatter={(value) => [`${value} emails`, ""]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              padding: "8px 12px",
                              backgroundColor: "white",
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {getBarData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="trends" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getLineData()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorSends"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.sends}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.sends}
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorOpens"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.opens}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.opens}
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorClicks"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.clicks}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.clicks}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickCount={5}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              padding: "8px 12px",
                              backgroundColor: "white",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="sends"
                            stroke={CHART_COLORS.sends}
                            fillOpacity={1}
                            fill="url(#colorSends)"
                          />
                          <Area
                            type="monotone"
                            dataKey="opens"
                            stroke={CHART_COLORS.opens}
                            fillOpacity={1}
                            fill="url(#colorOpens)"
                          />
                          <Area
                            type="monotone"
                            dataKey="clicks"
                            stroke={CHART_COLORS.clicks}
                            fillOpacity={1}
                            fill="url(#colorClicks)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                      Last 7 days performance
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}
