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
    const json = await response.json().catch(() => null);
    throw new Error(json?.error || "Could not send message. Please try again.");
  }

  return response.json() as Promise<CustomerSupportResponse>;
}
