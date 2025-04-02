// File: app/api/email/route.ts (or wherever your API route is located)
import { NextResponse, NextRequest } from "next/server"
import { sendEmail } from "@/app/actions/EmailActions" // Make sure this path is correct

export async function POST(req: NextRequest) {
  try {
    const { recipients, subject, content } = await req.json()

    if (!recipients || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email - now the function handles the campaign parameter internally
    const response = await sendEmail({ recipients, subject, content })

    if (response.success) {
      return NextResponse.json({ 
        message: "Email sent successfully!", 
        messageId: response.messageId 
      })
    } else {
      return NextResponse.json({ 
        error: response.error || "Unknown error" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 })
  }
}