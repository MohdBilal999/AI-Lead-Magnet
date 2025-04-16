"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import type { Account, Subscription } from "@prisma/client"
import { getPayingStatus } from "@/utils/stripe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Save, X, CreditCard, User } from "lucide-react"
import { motion } from "framer-motion"

interface AccountContainerProps {
  account: Account
  subscription: Subscription | null
}

function AccountContainer({ account, subscription }: AccountContainerProps) {
  const [isActive, setIsActive] = useState(getPayingStatus(subscription))
  const [username, setUsername] = useState(account.username)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setIsActive(getPayingStatus(subscription))
  }, [subscription])

  useEffect(() => {
    setHasChanges(username !== account.username)
  }, [username, account.username])

  const updateUsername = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    axios
      .put("/api/account", { username })
      .then((res) => {
        if (!res.data.success) {
          toast.error(res.data.message?.message || "Something went wrong saving the username.")
          console.error(res.data)
          return
        }

        const updatedAccount = res.data.data
        if (updatedAccount) {
          setUsername(updatedAccount.username)
          toast.success("Username updated successfully!")
          setHasChanges(false)
        }
      })
      .catch((error) => {
        console.error("Something went wrong saving the username.")
        console.error(error)
        toast.error("Something went wrong saving the username. Please try again.")
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  const handleStripe = async () => {
    try {
      const response = await axios.get("/api/stripe")
      if (response.data.url) {
        window.location.href = response.data.url
      } else {
        toast.error("Something went wrong with Stripe. Please try again.")
      }
    } catch (error) {
      toast.error("Something went wrong with Stripe. Please try again.")
    }
  }

  const resetUsername = () => {
    setUsername(account?.username || "")
    setHasChanges(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background & Orbs wrapped inside overflow-hidden container */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-purple-100/30 blur-3xl dark:bg-purple-900/20 animate-blob" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl dark:bg-cyan-900/20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl dark:bg-emerald-900/20 animate-blob animation-delay-4000" />
      </div>

      <div className="container relative max-w-4xl py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account details and subscription preferences</p>
        </motion.div>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.2 },
            }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>Update your account details and personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" onClick={resetUsername} disabled={!hasChanges || isSaving} className="gap-1">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={updateUsername}
                    disabled={!hasChanges || isSaving}
                    className="gap-1 relative overflow-hidden group"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                        <span className="absolute inset-0 h-full w-full translate-y-full bg-white/10 transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.2 },
            }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Subscription</CardTitle>
                </div>
                <CardDescription>Manage your subscription and billing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {isActive ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="rounded-lg border p-3 bg-slate-50/50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground">
                    {isActive
                      ? "You currently have an active subscription. Manage your subscription settings or payment methods."
                      : "Upgrade to our Pro plan to unlock all features and premium content."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                <motion.div whileTap={{ scale: 0.97 }} className="w-full">
                  <Button
                    onClick={handleStripe}
                    variant={isActive ? "outline" : "default"}
                    className="w-full gap-1 relative overflow-hidden group"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isActive ? "Manage Subscription" : "Upgrade to Pro"}
                    <span className="absolute inset-0 h-full w-full translate-y-full bg-white/10 transition-transform duration-300 ease-out group-hover:translate-y-0"></span>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AccountContainer
