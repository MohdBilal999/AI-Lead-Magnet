import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead, LeadMagnet } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LeadMagnetAnalytics from "./LeadMagnetAnalytics";

interface LeadMagnetTableProps {
  leadMagnets: LeadMagnet[];
  leads: Lead[];
}

// Custom analytics indicator component
const AnalyticsIndicator = () => (
  <span className="inline-flex items-center justify-center ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs shadow-sm transition-transform hover:scale-110">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  </span>
);

export default function LeadMagnetTable({
  leadMagnets,
  leads,
}: LeadMagnetTableProps) {
  const router = useRouter();

  const getLeadsForLeadMagnet = (leadMagnetId: string): number => {
    const leadsForLeadMagnet = leads.filter(
      (lead) => lead.leadMagnetId === leadMagnetId
    );

    return leadsForLeadMagnet.length;
  };

  const getConversionRate = (
    leadMagnetId: string,
    pageViews: number
  ): number => {
    if (pageViews === 0) return 0;

    const conversionRate = Math.round(
      (getLeadsForLeadMagnet(leadMagnetId) / pageViews) * 100
    );

    return conversionRate;
  };

  const trackPageView = async (leadMagnetId: string) => {
    try {
      await fetch(`/api/lead-magnets/${leadMagnetId}/page-view`, {
        method: "POST",
      });
      router.refresh(); // Refresh the page to update the counts
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-lg">Name</TableHead>
          <TableHead className="text-lg">Page Visits</TableHead>
          <TableHead className="text-lg">Leads</TableHead>
          <TableHead className="text-lg">Conversion Rate</TableHead>
          <TableHead className="text-lg">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leadMagnets.map((leadMagnet) => {
          const leadsCount = getLeadsForLeadMagnet(leadMagnet.id);
          return (
            <TableRow key={leadMagnet.id}>
              <TableCell>
                <LeadMagnetAnalytics
                  leadMagnet={leadMagnet}
                  leadsCount={leadsCount}
                >
                  <div className="flex items-center cursor-pointer group">
                    <Link
                      className="text-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      href={`/lead-magnet-editor/${leadMagnet.id}`}
                      onClick={() => trackPageView(leadMagnet.id)}
                    >
                      {leadMagnet.name}
                    </Link>
                    {leadsCount > 0 && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AnalyticsIndicator />
                      </div>
                    )}
                  </div>
                </LeadMagnetAnalytics>
              </TableCell>
              <TableCell>{leadMagnet.pageViews}</TableCell>
              <TableCell>{leadsCount}</TableCell>
              <TableCell>
                <span
                  className={`font-medium ${
                    getConversionRate(leadMagnet.id, leadMagnet.pageViews) > 5
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }`}
                >
                  {getConversionRate(leadMagnet.id, leadMagnet.pageViews)}%
                </span>
              </TableCell>
              <TableCell>
                <Link href={`/leads/${leadMagnet.id}`}>
                  <Button className="font-normal" variant="link">
                    View Leads
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
