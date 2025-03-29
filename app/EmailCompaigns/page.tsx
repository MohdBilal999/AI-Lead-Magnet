import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import EmailMetrics from "@/app/(dashboard)/leads/[leadMagnetId]/components/EmailMetrics"

export const metadata: Metadata = {
  title: "Email Campaigns",
  description: "Manage and track your email marketing campaigns",
}

// In a real app, this would be fetched from your database
const recentCampaigns = [
  { id: "msg_1234", name: "Welcome Series", date: "2025-03-15", recipients: 156 },
  { id: "msg_5678", name: "March Newsletter", date: "2025-03-10", recipients: 243 },
  { id: "msg_9012", name: "Product Launch", date: "2025-03-05", recipients: 512 },
]

export default function EmailCampaignsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Campaigns</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle>{campaign.name}</CardTitle>
                  <CardDescription>
                    Sent on {new Date(campaign.date).toLocaleDateString()} to {campaign.recipients} recipients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {recentCampaigns.slice(0, 2).map((campaign) => (
              <EmailMetrics key={campaign.id} messageId={campaign.id} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

