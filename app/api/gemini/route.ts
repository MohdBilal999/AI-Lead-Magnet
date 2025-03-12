import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const chatHistory = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({ contents: chatHistory });

    const response = await result.response;
    if (response && response.text) {
      const responseText = await response.text(); // Ensure to await the response text
      return new Response(responseText, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      console.error("Invalid Gemini API response:", JSON.stringify(result, null, 2));
      return new Response(JSON.stringify({ error: "Invalid Gemini response" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error in API:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}