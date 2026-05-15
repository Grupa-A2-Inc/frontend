import { config } from "@/lib/config";
import type {
  ChatMessage,
  CustomerSupportRequest,
  CustomerSupportResponse,
} from "@/types/domain/support";

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_ITEMS = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string"
  );
}

function parseSupportRequest(body: unknown): CustomerSupportRequest | null {
  if (!isRecord(body) || typeof body.message !== "string") return null;

  const message = body.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return null;

  const history = Array.isArray(body.history)
    ? body.history.filter(isChatMessage).slice(-MAX_HISTORY_ITEMS)
    : [];

  const context = isRecord(body.context)
    ? {
        page: typeof body.context.page === "string" ? body.context.page : undefined,
        userType:
          typeof body.context.userType === "string" ? body.context.userType : undefined,
      }
    : undefined;

  return { message, history, context };
}

export async function POST(request: Request) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "Support chat is not configured." },
      { status: 503 },
    );
  }

  let parsedRequest: CustomerSupportRequest | null = null;

  try {
    parsedRequest = parseSupportRequest(await request.json());
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!parsedRequest) {
    return Response.json({ message: "Invalid support message." }, { status: 400 });
  }

  const response = await fetch(config.supportAiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(parsedRequest),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    return Response.json(
      { message: message || "Support chat request failed." },
      { status: response.status },
    );
  }

  const data = (await response.json()) as CustomerSupportResponse;

  return Response.json({
    answer: data.answer,
  } satisfies CustomerSupportResponse);
}
