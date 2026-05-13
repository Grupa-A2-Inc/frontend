export function formatPrice(value: number, currency: string): string {
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

