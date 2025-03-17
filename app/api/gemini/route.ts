import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY_2!)

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Ensure proper role mapping
    const chatHistory = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Filter out system messages for Gemini
    const filteredChatHistory = chatHistory.filter((msg: any) => msg.role === "user" || msg.role === "model")

    const result = await model.generateContentStream({ contents: filteredChatHistory })

    // Create a TransformStream to stream the response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Process the stream
    ;(async () => {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            await writer.write(encoder.encode(text))
          }
        }
        await writer.close()
      } catch (error) {
        console.error("Error streaming response:", error)
        writer.abort(error)
      }
    })()

    return new Response(stream.readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Error in API:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

