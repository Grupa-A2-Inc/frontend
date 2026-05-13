import { CustomerSupportRequest, CustomerSupportResponse } from "./types";

const AI_API_URL = "https://ai.adaptiveelearning.online/ai/api/v1/chat/customer-support";
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY ?? "cheia_pe_care_o_foloseste_aiul";

export async function apiSendSupportMessage(req: CustomerSupportRequest): Promise<CustomerSupportResponse> {
  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": AI_API_KEY,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  return response.json() as Promise<CustomerSupportResponse>;
}