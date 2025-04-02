import { NextResponse, NextRequest } from "next/server"
import  sendEmail  from "@/lib/sendEmail"

export async function POST(req: NextRequest) {
  try {
    const { recipients, subject, content } = await req.json()

    if (!recipients || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email
    const response = await sendEmail({ recipients, subject, content })

    if (response.success) {
      return NextResponse.json({ message: "Email sent successfully!", messageId: response.messageId })
    } else {
      return NextResponse.json({ error: response.success || "Unknown error" }, { status: 500 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
