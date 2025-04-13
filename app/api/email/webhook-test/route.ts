import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const events = await req.json();
    console.log(
      "Received SendGrid webhook test event:",
      JSON.stringify(events, null, 2)
    );

    // Log headers for validation
    const headers = Object.fromEntries(req.headers);
    console.log("Webhook Headers:", JSON.stringify(headers, null, 2));

    return NextResponse.json({
      success: true,
      message: "Webhook test received successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook test error:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}
