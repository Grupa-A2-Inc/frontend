"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Coins, Loader2, Save, Wallet } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getMyStudentWallet, getStudentRewardHistory, saveStudentWallet } from "@/lib/rewards/api";
import type { StudentReward } from "@/lib/rewards/types";
import { formatDate, formatTai, shortAddress, statusClass } from "./rewardFormat";

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export default function StudentRewardsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [walletAddress, setWalletAddress] = useState("");
  const [savedWallet, setSavedWallet] = useState("");
  const [rewards, setRewards] = useState<StudentReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalRewards = useMemo(
    () => rewards.filter((reward) => reward.status === "MINTED").reduce((sum, reward) => sum + reward.rewardAmount, 0),
    [rewards]
  );

  useEffect(() => {
    let alive = true;

    async function loadRewardsPage() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [wallet, history] = await Promise.all([
          getMyStudentWallet(),
          getStudentRewardHistory(user.id),
        ]);
        if (alive) {
          setRewards(history);
          if (wallet?.walletAddress) {
            setSavedWallet(wallet.walletAddress);
            setWalletAddress(wallet.walletAddress);
          }
        }
      } catch (loadError) {
        if (alive) setError(loadError instanceof Error ? loadError.message : "Failed to load rewards.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadRewardsPage();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  async function handleSaveWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!EVM_ADDRESS_PATTERN.test(walletAddress.trim())) {
      setError("Wallet address must be a valid EVM address.");
      return;
    }

    setSaving(true);
    try {
      const wallet = await saveStudentWallet(walletAddress.trim());
      setSavedWallet(wallet.walletAddress);
      setWalletAddress(wallet.walletAddress);
      setMessage("Wallet saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save wallet.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading rewards
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">My Rewards</h1>
          <p className="mt-1 text-sm text-brand-muted">Track TAI rewards and wallet status.</p>
        </div>
        <div className="rounded-xl border border-brand-primary/15 bg-brand-card px-4 py-3">
          <p className="text-xs font-semibold uppercase text-brand-muted">Minted total</p>
          <p className="mt-1 text-lg font-bold text-brand-text">{formatTai(totalRewards)}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Wallet size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-brand-text">Wallet</h2>
            <p className="text-sm text-brand-muted">{savedWallet ? shortAddress(savedWallet) : "No wallet saved"}</p>
          </div>
        </div>

        <form onSubmit={handleSaveWallet} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder="0x..."
            className="min-w-0 flex-1 rounded-xl border border-brand-primary/20 bg-brand-mid px-4 py-2.5 font-mono text-sm text-brand-text outline-none transition-colors focus:border-brand-primary/60"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save wallet
          </button>
        </form>

        {(message || error) && (
          <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${error ? "bg-red-500/10 text-red-300" : "bg-green-500/10 text-green-300"}`}>
            {error || message}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Coins size={18} />
          </span>
          <h2 className="text-base font-semibold text-brand-text">Reward History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-brand-primary/15 text-xs uppercase text-brand-muted">
              <tr>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Rank</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/10">
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-muted">
                    No rewards yet.
                  </td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id} className="text-brand-text">
                    <td className="py-3 pr-4">{formatDate(reward.createdAt)}</td>
                    <td className="py-3 pr-4 font-semibold">#{reward.rank}</td>
                    <td className="py-3 pr-4">{reward.score.toFixed(2)}</td>
                    <td className="py-3 pr-4 font-semibold">{formatTai(reward.rewardAmount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(reward.status)}`}>
                        {reward.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {reward.txHash ? shortAddress(reward.txHash) : "-"}
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
