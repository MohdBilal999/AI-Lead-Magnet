import { prismadb } from "@/lib/prismadb";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, currentUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/api";
import Link from "next/link";
import React from "react";

async function LandingPageNavbar() {
  const user: User | null = await currentUser();

  if (!user) {
    return (
      <nav className="flex w-screen items-center justify-between p-6">
        <div>
          <Link className="text-2xl font-bold text-purple-500 no-underline" href="/">
            LeadConvert
          </Link>
        </div>
        <div className="text-purple-500 font-semibold text-lg">
          <SignInButton />
        </div>
      </nav>
    );
  }

  // Check if user has an active subscription
  const userSubscription = await prismadb.subscription.findUnique({
    where: { userId: user.id },
  });

  const isPro = !!userSubscription && !!userSubscription.stripeCustomerId; // Check if the user is subscribed

  return (
    <nav className="flex w-screen items-center justify-between p-6">
      <div className="flex items-center gap-x-4">
        <Link className="text-2xl font-bold text-purple-500 no-underline" href="/">
          LeadConvert
        </Link>
        {/* Show Pro badge if user has an active subscription */}
        {isPro && (
          <span className="bg-gradient-to-r from-purple-600 to-red-400 text-white text-sm font-bold px-2 py-1 rounded-lg">
            PRO
          </span>
        )}
      </div>
      <div className="text-purple-500 font-semibold text-lg flex items-center gap-x-4">
        <Link href="/lead-magnets">
          <Button variant="outline">Open App</Button>
        </Link>
        

        <UserButton />
      </div>
    </nav>
  );
}

export default LandingPageNavbar;
