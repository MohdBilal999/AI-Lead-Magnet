import { prismadb } from "@/lib/prismadb";
import { stripe } from "@/utils/stripe";
import { currentUser } from "@clerk/nextjs";
import { NextResponse, NextRequest } from "next/server";

// Currency conversion from INR to other currencies
const exchangeRates = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  INR: 1,
};

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Default currency
    let currency = "INR";
    let priceInLocalCurrency = 250000; // ₹2500 in paise

    try {
      const ip = req.headers.get("x-forwarded-for") || "103.21.76.123"; // fallback IP
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      const countryCode = data.country_code;

      // You can customize this mapping if needed
      const currencyMap: Record<string, keyof typeof exchangeRates> = {
        US: "USD",
        GB: "GBP",
        AU: "AUD",
        IN: "INR",
        EU: "EUR",
      };

      const localCurrency = currencyMap[countryCode] || "INR";

      if (exchangeRates[localCurrency]) {
        currency = localCurrency;
        priceInLocalCurrency = Math.round(2500 * exchangeRates[localCurrency] * 100);
      }
    } catch (err) {
      console.error("Geolocation failed:", err);
    }

    // Check if subscription already exists
    const userSubscription = await prismadb.subscription.findUnique({
      where: { userId: user.id },
    });

    if (userSubscription?.stripeCustomerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      });

      return NextResponse.json({ url: portalSession.url }, { status: 200 });
    }

    // Create a new Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0]?.emailAddress,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Lead Convert Pro",
              description: "Unlimited AI Lead Magnets",
            },
            unit_amount: priceInLocalCurrency,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });

  } catch (error) {
    console.error("[STRIPE ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
