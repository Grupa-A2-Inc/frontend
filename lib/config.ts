const DEFAULT_API_BASE_URL = "https://api.adaptiveelearning.online";
const DEFAULT_SUPPORT_AI_URL =
  "https://ai.adaptiveelearning.online/ai/api/v1/chat/customer-support";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const config = {
  apiBaseUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
  ),
  supportAiUrl: process.env.SUPPORT_AI_URL ?? DEFAULT_SUPPORT_AI_URL,
} as const;

