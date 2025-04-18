"use client"

import { Button } from "@/components/ui/button"
import type { Lead, LeadMagnet, Subscription } from "@prisma/client"
import Link from "next/link"
import React from "react"
import LeadMagnetTable from "./LeadMagnetTable"
import { getPayingStatus } from "@/utils/stripe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HiOutlineSparkles } from "react-icons/hi"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

// Update free limit constant
const MAXIMUM_FREE_LEAD_MAGNETS = 2

interface LeadMagnetsContainerProps {
  leadMagnets: LeadMagnet[]
  leads: Lead[]
  subscription: Subscription | null
}

function LeadMagnetsContainer({ leadMagnets, leads, subscription }: LeadMagnetsContainerProps) {
  const router = useRouter()
  const [upgrading, setUpgrading] = React.useState(false)
  const isActive = getPayingStatus(subscription)
  
  // Check if user has reached or exceeded the free lead magnet limit (2)
  const reachedFreeLimit = leadMagnets.length >= MAXIMUM_FREE_LEAD_MAGNETS
  
  // Check if user has ever had a subscription (active or cancelled)
  const hadSubscriptionEver = subscription !== null
  
  // If user had subscription but it's not active now, they've cancelled
  const hadCancelledSubscription = hadSubscriptionEver && !isActive
  
  // Show "Subscribe Again" if user has more than 2 lead magnets (whether they had a subscription or not)
  const shouldShowSubscribeAgain = !isActive && (hadCancelledSubscription || leadMagnets.length > MAXIMUM_FREE_LEAD_MAGNETS)

  // Determine if create button should be disabled:
  // 1. If user never subscribed and reached free limit (2 lead magnets)
  // 2. If user had subscription but cancelled it
  const isCreateButtonDisabled = (!isActive && reachedFreeLimit) || hadCancelledSubscription

  const upgrade = async () => {
    setUpgrading(true)
    try {
      const response = await axios.get("/api/stripe")
      if (response.data.url) {
        router.push(response.data.url)
      } else {
        console.error("Something went wrong with Stripe.")
        toast.error("Something went wrong with Stripe.")
      }
    } catch (error) {
      console.error("Something went wrong with Stripe.")
      toast.error("Something went wrong with Stripe.")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="p-6 w-full lg:max-w-5xl lg:mx-auto backdrop-blur-sm bg-white/50 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Lead Magnets</h2>
        <Button disabled={isCreateButtonDisabled} variant="default">
          <Link href="/lead-magnet-editor">Create</Link>
        </Button>
      </div>
      <LeadMagnetTable leadMagnets={leadMagnets} leads={leads} />
      {!isActive && (
        <div className="flex flex-col w-full mt-8 items-center">
          <Card className="backdrop-blur-sm bg-white/80 max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="bg-gradient-to-r from-red-500 to-purple-500 inline-block text-transparent bg-clip-text pb-1 w-fit mx-auto">
                {shouldShowSubscribeAgain ? "Reactivate Subscription" : "Upgrade To Pro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* Show different message based on user status */}
              {shouldShowSubscribeAgain ? (
                <p className="text-gray-700 mb-4 text-center">
                  {hadCancelledSubscription 
                    ? "Your subscription has been cancelled. Reactivate to continue creating lead magnets."
                    : "Your subscription has ended. Reactivate now to resume creating lead magnets and capturing leads."}
                </p>
              ) : (
                <p className="font-semibold text-gray-700 mb-4 text-center">
                  {leadMagnets.length} / {MAXIMUM_FREE_LEAD_MAGNETS} Free Lead Magnets Generated
                </p>
              )}
              <Button 
                variant="default" 
                onClick={upgrade} 
                className="w-40 mx-auto"
              >
                <span className="mr-2">
                  <HiOutlineSparkles />
                </span>
                {upgrading ? "Processing..." : shouldShowSubscribeAgain ? "Subscribe Again" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default LeadMagnetsContainer