export type SubscriptionPlan = {
  id: string;
  code: string;
  displayName: string;
  maxUsers: number;
  maxClassrooms: number;
  maxCourses: number;
  hasPremiumFeatures: boolean;
  priceMonthly: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

