import { prismadb } from "@/lib/prismadb";
import { stripe } from "@/utils/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const stripeSignature = req.headers.get("stripe-signature");

  if (!stripeSignature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Missing Stripe signature or secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;

      if (!userId || !subscriptionId) {
        return new NextResponse("Missing user or subscription ID", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await prismadb.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = await stripe.invoices.retrieve(event.data.object.id);
      const subscriptionId = invoice.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await prismadb.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      try {
        await prismadb.subscription.delete({
          where: { stripeSubscriptionId: subscription.id },
        });
        console.log(`Deleted subscription: ${subscription.id}`);
      } catch (err) {
        console.error("Error deleting subscription:", err);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
