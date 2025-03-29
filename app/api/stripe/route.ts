import { prismadb } from "@/lib/prismadb";
import { stripe } from "@/utils/stripe";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const exchangeRates = {
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  INR: 1, // Default INR
};

export async function GET(req: { headers: { get: (arg0: string) => any; }; connection: { remoteAddress: any; }; }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    // Fetch user's location
    let currency = "INR"; // Default INR
    let priceInLocalCurrency = 250000; // ₹2500 in minor units (paise)

    try {
      const ip = req.headers.get("x-forwarded-for") || req.connection.remoteAddress;
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data: { country_code?: string } = await res.json();
      const country = (data.country_code || "IN") as keyof typeof exchangeRates;

      if (exchangeRates[country]) {
        currency = country;
        priceInLocalCurrency = Math.round(2500 * exchangeRates[country] * 100); // Convert and set price
      }
    } catch (error) {
      console.error("Failed to get location, using default INR pricing.");
    }

    const userSubscription = await prismadb.subscription.findUnique({
      where: { userId: user.id },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      });

      return NextResponse.json({ url: stripeSession.url }, { status: 200 });
    }

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Lead Convert Pro",
              description: "Unlimited AI Lead Magnets",
            },
            unit_amount: priceInLocalCurrency,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (e) {
    console.error("[STRIPE ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
