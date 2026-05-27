import { NextRequest, NextResponse } from "next/server";

const AI_API_URL =
  "https://ai.adaptiveelearning.online/ai/api/v1/chat/customer-support";

export async function POST(req: NextRequest) {
  const apiKey =
    process.env.AI_API_KEY ??
    process.env.NEXT_PUBLIC_AI_API_KEY ??
    "cheia_pe_care_o_foloseste_aiul";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Customer support service is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let aiResponse: Response;
  try {
    aiResponse = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach customer support service." },
      { status: 502 }
    );
  }

  if (!aiResponse.ok) {
    return NextResponse.json(
  { error: "Customer support service is temporarily unavailable. Please try again later." },
  { status: aiResponse.status });
  }

  const data = await aiResponse.json();
  return NextResponse.json(data);
}
