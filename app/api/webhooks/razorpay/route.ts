import { prismadb } from "@/lib/prismadb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const signature = headers().get("x-razorpay-signature");

  if (!signature) {
    return new NextResponse("Missing Razorpay signature", { status: 400 });
  }

  if (body.event === "subscription.activated") {
    await prismadb.subscription.update({
      where: {
        razorpaySubscriptionId: body.payload.subscription.entity.id,
      },
      data: {
        razorpayCustomerId: body.payload.subscription.entity.customer_id,
        razorpayCurrentPeriodEnd: new Date(
          body.payload.subscription.entity.current_end * 1000
        ),
        status: "active",
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}