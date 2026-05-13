import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

const AI_GENERATE_URL = `${API_BASE}/ai/api/v1/generate`;

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let aiResponse: Response;
  try {
    aiResponse = await fetch(AI_GENERATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach AI generation service." },
      { status: 502 }
    );
  }

  if (!aiResponse.ok) {
    const text = await aiResponse.text().catch(() => "");
    return NextResponse.json(
      { error: `HTTP ${aiResponse.status}: ${text || aiResponse.statusText}` },
      { status: aiResponse.status }
    );
  }

  const data = await aiResponse.json();
  return NextResponse.json(data);
}
