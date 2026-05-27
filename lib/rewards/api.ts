import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type {
  CalculateRewardCycleRequest,
  RewardConfigRequest,
  RewardConfigResponse,
  RewardCycle,
  StudentReward,
  StudentWalletResponse,
} from "./types";

function getAccessToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Access token was not found. Please sign in again.");
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  return token;
}

async function parseRewardError(response: Response, fallback: string): Promise<Error> {
  const data = await response.json().catch(() => null);
  const message =
    typeof data?.error === "string"
      ? data.error
      : typeof data?.message === "string"
        ? data.message
        : `${fallback} (${response.status})`;

  return new Error(message);
}

function rewardUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function getRewardConfig(organizationId: string): Promise<RewardConfigResponse> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.organizationConfig(organizationId)),
    getAccessToken(),
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to load reward settings");
  }

  return response.json();
}

export async function saveRewardConfig(
  organizationId: string,
  payload: RewardConfigRequest
): Promise<RewardConfigResponse> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.organizationConfig(organizationId)),
    getAccessToken(),
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to save reward settings");
  }

  return response.json();
}

export async function getLatestRewardCycle(organizationId: string): Promise<RewardCycle> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.organizationLatest(organizationId)),
    getAccessToken(),
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to load reward cycle");
  }

  return response.json();
}

export async function calculateRewardCycle(
  organizationId: string,
  payload: CalculateRewardCycleRequest
): Promise<RewardCycle> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.calculateCycle(organizationId)),
    getAccessToken(),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to calculate reward cycle");
  }

  return response.json();
}

export async function mintRewardCycle(cycleId: string): Promise<RewardCycle> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.mintCycle(cycleId)),
    getAccessToken(),
    {
      method: "POST",
      headers: { Accept: "application/json" },
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to mint rewards");
  }

  return response.json();
}

export async function getStudentRewardHistory(studentId: string): Promise<StudentReward[]> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.studentRewards(studentId)),
    getAccessToken(),
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to load student rewards");
  }

  return response.json();
}

export async function saveStudentWallet(walletAddress: string): Promise<StudentWalletResponse> {
  const response = await fetchWithAuth(
    rewardUrl(ENDPOINTS.rewards.myWallet),
    getAccessToken(),
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    }
  );

  if (!response.ok) {
    throw await parseRewardError(response, "Failed to save wallet");
  }

  return response.json();
}
