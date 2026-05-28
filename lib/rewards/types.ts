export type DistributionPeriod = "MONTHLY";

export type RewardCycleStatus = "CREATED" | "FUNDED" | "CALCULATED" | "MINTED" | "FAILED";

export type StudentRewardStatus = "CALCULATED" | "MINTED" | "FAILED";

export type RewardConfigRequest = {
  minimumScore: number;
  maximumWinners: number;
  distributionPeriod: DistributionPeriod;
  enabled: boolean;
};

export type RewardConfigResponse = RewardConfigRequest & {
  id: string;
  organizationId: string;
  rewardPercent: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CalculateRewardCycleRequest = {
  periodStart?: string;
  periodEnd?: string;
  subscriptionAmount?: number;
  eurcDepositedAmount?: number;
};

export type StablecoinFundingResponse = {
  cycleId: string;
  organizationId: string;
  paymentAmount: number;
  rewardPoolAmount: number;
  eurcDepositedAmount: number;
  provider: string;
  chainId: number;
  transactionHash?: string | null;
  status: string;
};

export type StudentReward = {
  id: string;
  rewardCycleId: string;
  studentId: string;
  studentWalletAddress: string;
  rank: number;
  score: number;
  rewardAmount: number;
  txHash?: string | null;
  status: StudentRewardStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type RewardCycle = {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  subscriptionAmount: number;
  rewardPoolAmount: number;
  eurcDepositedAmount: number;
  status: RewardCycleStatus;
  depositTxHash?: string | null;
  mintTxHash?: string | null;
  failureReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rewards: StudentReward[];
};

export type StudentWalletResponse = {
  id: string;
  studentId: string;
  walletAddress: string;
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentRedeemQuote = {
  walletAddress: string;
  recipientAddress: string;
  amount: number;
  amountSmallestUnit: string;
  nonce: string;
  deadline: string;
  typedData: Record<string, unknown>;
};

export type StudentRedeemResponse = {
  walletAddress: string;
  amount: number;
  transactionHash: string;
  status: string;
};
