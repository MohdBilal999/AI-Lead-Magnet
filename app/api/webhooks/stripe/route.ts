import { prismadb } from "@/lib/prismadb";
import { stripe } from "@/utils/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const stripeSignature = req.headers.get("stripe-signature");
if (!stripeSignature) {
  return new NextResponse("Missing Stripe signature", { status: 400 });
}


  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret not set");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`⚠️ Webhook signature verification failed.`, err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  // ✅ Fetch full session manually (for "thin events")
  if (event.type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    // ✅ Retrieve subscription details manually
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await prismadb.subscription.create({
      data: {
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  } else if (event.type === "invoice.payment_succeeded") {
    // ✅ Manually retrieve subscription due to "thin event" updates
    const invoice = await stripe.invoices.retrieve(event.data.object.id);
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

    const subscriptionFromDB = await prismadb.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (!subscriptionFromDB) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    await prismadb.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
