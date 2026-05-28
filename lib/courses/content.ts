export function normalizeContentMarkdown(value: unknown): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") return parsed;
    } catch {
      return value;
    }
  }

  return value;
}
