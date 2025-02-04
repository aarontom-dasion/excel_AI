import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

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
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. Provide only the answer about ${column} for the given query.`,
          },
          {
            role: "user",
            content: query,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    const result = response.data.choices[0].message.content
    return NextResponse.json({ result })
  } catch (error: any) {
    console.error("Error in web search:", error.response?.data || error.message)
    const errorMessage = error.response?.data?.error?.message || "Failed to perform web search"
    return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 })
  }
}

