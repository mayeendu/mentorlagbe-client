export type Payment = {
  _id: string;
  userId?: string;
  role: "student" | "tutor";
  amount: number;
  currency: "usd";
  provider?: "mock" | "stripe";
  testMode?: boolean;
  status: "pending" | "paid" | "failed" | "canceled";
  stripeSessionId?: string;
  createdAt: string;
};

export type PaymentHistory = { plan: "free" | "pro"; payments: Payment[] };

export const upgradePrices = { student: 10, tutor: 15 };
