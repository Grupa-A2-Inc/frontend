import { CustomerSupportRequest, CustomerSupportResponse } from "./types";

export async function apiSendSupportMessage(
  req: CustomerSupportRequest
): Promise<CustomerSupportResponse> {
  const response = await fetch("/api/customer-support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  return response.json() as Promise<CustomerSupportResponse>;
}
