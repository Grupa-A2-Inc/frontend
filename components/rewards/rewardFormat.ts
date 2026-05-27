import type { RewardCycleStatus, StudentRewardStatus } from "@/lib/rewards/types";

export function formatTai(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "0.000000 TAI";
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  })} TAI`;
}

export function formatMoney(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function shortAddress(value?: string | null): string {
  if (!value || value.length < 12) return value ?? "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function statusClass(status: RewardCycleStatus | StudentRewardStatus): string {
  if (status === "MINTED") return "border-green-400/25 bg-green-400/10 text-green-300";
  if (status === "FAILED") return "border-red-400/25 bg-red-400/10 text-red-300";
  if (status === "FUNDED") return "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";
  return "border-brand-primary/25 bg-brand-primary/10 text-brand-primary";
}
