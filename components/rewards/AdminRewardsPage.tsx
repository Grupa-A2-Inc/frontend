"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Award, Calculator, Coins, Loader2, RefreshCcw, Save } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import {
  calculateRewardCycle,
  fundSepoliaRewardCycle,
  getLatestRewardCycle,
  getRewardConfig,
  mintRewardCycle,
  saveRewardConfig,
} from "@/lib/rewards/api";
import type { RewardConfigRequest, RewardCycle } from "@/lib/rewards/types";
import { formatDate, formatMoney, formatTai, shortAddress, statusClass } from "./rewardFormat";

const DEFAULT_CONFIG: RewardConfigRequest = {
  minimumScore: 60,
  maximumWinners: 10,
  distributionPeriod: "MONTHLY",
  enabled: true,
};

type ActionState = "idle" | "loading" | "success" | "error";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-primary/15 bg-brand-card px-4 py-3">
      <p className="text-xs font-semibold uppercase text-brand-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-text">{value}</p>
    </div>
  );
}

export default function AdminRewardsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const organizationId = useAppSelector(
    (state) => state.auth.organization?.id ?? state.auth.user?.organizationId ?? ""
  );
  const [config, setConfig] = useState<RewardConfigRequest>(DEFAULT_CONFIG);
  const [cycle, setCycle] = useState<RewardCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [message, setMessage] = useState("");

  const canMint = user?.role === "ADMIN" || user?.role === "ORGANIZATION_ADMIN";
  const winners = useMemo(() => cycle?.rewards ?? [], [cycle?.rewards]);
  const totalRewards = useMemo(
    () => winners.reduce((sum, reward) => sum + reward.rewardAmount, 0),
    [winners]
  );

  useEffect(() => {
    let alive = true;

    async function loadRewards() {
      if (!organizationId) {
        setLoading(false);
        setMessage("Organization was not found in the current session.");
        return;
      }

      setLoading(true);
      try {
        const [loadedConfig, loadedCycle] = await Promise.allSettled([
          getRewardConfig(organizationId),
          getLatestRewardCycle(organizationId),
        ]);

        if (!alive) return;

        if (loadedConfig.status === "fulfilled") {
          setConfig({
            minimumScore: loadedConfig.value.minimumScore,
            maximumWinners: loadedConfig.value.maximumWinners,
            distributionPeriod: loadedConfig.value.distributionPeriod,
            enabled: loadedConfig.value.enabled,
          });
        }
        if (loadedCycle.status === "fulfilled") {
          setCycle(loadedCycle.value);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadRewards();
    return () => {
      alive = false;
    };
  }, [organizationId]);

  async function handleSaveConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId) return;

    setActionState("loading");
    setMessage("");

    try {
      const saved = await saveRewardConfig(organizationId, config);
      setConfig({
        minimumScore: saved.minimumScore,
        maximumWinners: saved.maximumWinners,
        distributionPeriod: saved.distributionPeriod,
        enabled: saved.enabled,
      });
      setActionState("success");
      setMessage("Reward settings saved.");
    } catch (error) {
      setActionState("error");
      setMessage(error instanceof Error ? error.message : "Failed to save reward settings.");
    }
  }

  async function handleCalculate() {
    if (!organizationId) return;

    setActionState("loading");
    setMessage("");

    try {
      const calculated = await calculateRewardCycle(organizationId, {});
      setCycle(calculated);
      setActionState("success");
      setMessage("Reward cycle calculated.");
    } catch (error) {
      setActionState("error");
      setMessage(error instanceof Error ? error.message : "Failed to calculate reward cycle.");
    }
  }

  async function handleFundSepolia() {
    if (!organizationId) return;

    setActionState("loading");
    setMessage("");

    try {
      const funded = await fundSepoliaRewardCycle(organizationId, 100);
      const latest = await getLatestRewardCycle(organizationId);
      setCycle(latest);
      setActionState("success");
      setMessage(
        funded.provider === "circle-sepolia-faucet"
          ? "Sepolia EURC funded and deposited in TAIEngine."
          : `Reward cycle funded with ${funded.provider}.`
      );
    } catch (error) {
      setActionState("error");
      setMessage(error instanceof Error ? error.message : "Failed to fund reward cycle.");
    }
  }

  async function handleMint() {
    if (!cycle?.id) return;

    setActionState("loading");
    setMessage("");

    try {
      const minted = await mintRewardCycle(cycle.id);
      setCycle(minted);
      setActionState(minted.status === "FAILED" ? "error" : "success");
      setMessage(minted.failureReason ?? "Mint transaction submitted.");
    } catch (error) {
      setActionState("error");
      setMessage(error instanceof Error ? error.message : "Failed to mint rewards.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-brand-primary/20 bg-brand-mid px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-primary/60";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading rewards
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Rewards</h1>
          <p className="mt-1 text-sm text-brand-muted">10% of each subscription funds the student reward pool.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-sm font-semibold text-brand-primary">
          <Coins size={16} />
          Fixed pool: 10%
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatTile label="Subscription" value={formatMoney(cycle?.subscriptionAmount)} />
        <StatTile label="Reward pool" value={formatTai(cycle?.rewardPoolAmount)} />
        <StatTile label="Distributed" value={formatTai(totalRewards)} />
        <StatTile label="Winners" value={String(winners.length)} />
      </div>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Award size={18} />
          </span>
          <h2 className="text-base font-semibold text-brand-text">Organization Rules</h2>
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-brand-muted">Minimum score</span>
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              value={config.minimumScore}
              onChange={(event) => setConfig((current) => ({ ...current, minimumScore: Number(event.target.value) }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-brand-muted">Maximum winners</span>
            <input
              className={inputClass}
              type="number"
              min={1}
              value={config.maximumWinners}
              onChange={(event) => setConfig((current) => ({ ...current, maximumWinners: Number(event.target.value) }))}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-brand-muted">Period</span>
            <select
              className={inputClass}
              value={config.distributionPeriod}
              onChange={() => setConfig((current) => ({ ...current, distributionPeriod: "MONTHLY" }))}
            >
              <option value="MONTHLY">Monthly</option>
            </select>
          </label>
          <div className="flex items-end gap-3">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-brand-primary/15 bg-brand-mid px-4 text-sm font-medium text-brand-text">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(event) => setConfig((current) => ({ ...current, enabled: event.target.checked }))}
                className="h-4 w-4 accent-brand-primary"
              />
              Enabled
            </label>
            <button
              type="submit"
              disabled={actionState === "loading"}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-brand-text">Latest Cycle</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {cycle ? `${formatDate(cycle.periodStart)} - ${formatDate(cycle.periodEnd)}` : "No cycle yet"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cycle && (
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(cycle.status)}`}>
                {cycle.status}
              </span>
            )}
            <button
              type="button"
              onClick={handleFundSepolia}
              disabled={actionState === "loading"}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/20 px-4 py-2 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-primary/10 disabled:opacity-60"
            >
              <Coins size={16} />
              Fund Sepolia
            </button>
            <button
              type="button"
              onClick={handleCalculate}
              disabled={actionState === "loading"}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/20 px-4 py-2 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-primary/10 disabled:opacity-60"
            >
              <Calculator size={16} />
              Calculate
            </button>
            <button
              type="button"
              onClick={handleMint}
              disabled={!canMint || !cycle || cycle.status === "MINTED" || actionState === "loading"}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={16} />
              Mint
            </button>
          </div>
        </div>

        {message && (
          <p
            className={`mb-4 rounded-xl px-4 py-3 text-sm ${
              actionState === "error" ? "bg-red-500/10 text-red-300" : "bg-green-500/10 text-green-300"
            }`}
          >
            {message}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-brand-primary/15 text-xs uppercase text-brand-muted">
              <tr>
                <th className="py-3 pr-4">Rank</th>
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Wallet</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Reward</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/10">
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted">
                    No calculated rewards.
                  </td>
                </tr>
              ) : (
                winners.map((reward) => (
                  <tr key={reward.id} className="text-brand-text">
                    <td className="py-3 pr-4 font-semibold">#{reward.rank}</td>
                    <td className="py-3 pr-4">{reward.studentId}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{shortAddress(reward.studentWalletAddress)}</td>
                    <td className="py-3 pr-4">{reward.score.toFixed(2)}</td>
                    <td className="py-3 pr-4 font-semibold">{formatTai(reward.rewardAmount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(reward.status)}`}>
                        {reward.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
