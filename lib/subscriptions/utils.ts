export function formatPrice(value: number | null | undefined, currency: string): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Custom";
  if (value === 0) return "Free";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`.trim();
  }
}
