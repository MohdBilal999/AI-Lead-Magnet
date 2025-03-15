import { prismadb } from "@/lib/prismadb";
import { razorpay } from "@/utils/razorpay";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Check if user already has an active subscription
    const userSubscription = await prismadb.subscription.findUnique({
      where: { userId: user.id },
    });

    if (userSubscription?.razorpaySubscriptionId) {
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      });
    }

    // Step 1: Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: 1000 * 100, // Amount in paise (e.g., ₹1000 = 100000 paise)
      currency: "INR",
      receipt: `receipt_${user.id}`,
      payment_capture: true, // Auto-capture payment
    });

    if (!order) {
      return new NextResponse("Failed to create order", { status: 500 });
    }

    // Step 2: Create a subscription linked to the order
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID as string,
      customer_notify: 1,
      total_count: 12,
      notes: {
        order_id: order.id, // Link order with subscription
      },
    });

    if (!subscription) {
      return new NextResponse("Failed to create subscription", { status: 500 });
    }

    // Store subscription details in the database
    await prismadb.subscription.create({
      data: {
        userId: user.id,
        razorpayCustomerId: null,
        razorpayCurrentPeriodEnd: new Date().toISOString(),
        razorpaySubscriptionId: subscription.id,
        razorpayOrderId: order.id,
        planId: process.env.RAZORPAY_PLAN_ID as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ url: subscription.short_url }, { status: 200 });
  } catch (e) {
    console.error("[RAZORPAY ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
