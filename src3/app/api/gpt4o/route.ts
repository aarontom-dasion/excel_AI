import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: NextRequest) {
  const { query, column } = await req.json()

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables." },
      { status: 500 },
    )
  }

  try {
    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: `Provide a concise answer about ${column} for the following: ${query}`,
    })

    return NextResponse.json({ result: result.text })
  } catch (error: any) {
    console.error("Error in GPT-4o:", error.response?.data || error.message)
    const errorMessage = error.response?.data?.error?.message || "Failed to process with GPT-4o"
    return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 })
  }
}

