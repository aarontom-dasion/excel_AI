import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  // This is a placeholder for the actual email search API
  // You would replace this with your actual email search service
  const emailSearchApiKey = process.env.EMAIL_SEARCH_API_KEY

  if (!emailSearchApiKey) {
    return NextResponse.json(
      { error: "Email Search API key not configured. Please add EMAIL_SEARCH_API_KEY to your environment variables." },
      { status: 500 },
    )
  }

  try {
    // This is a mock API call. Replace with your actual email search API
    const response = await axios.get(`https://api.emailsearch.example.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${emailSearchApiKey}`,
      },
    })

    // Assuming the API returns an email address
    const email = response.data.email

    return NextResponse.json({ result: email })
  } catch (error: any) {
    console.error("Error in email search:", error.response?.data || error.message)
    const errorMessage = error.response?.data?.error?.message || "Failed to perform email search"
    return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 })
  }
}

