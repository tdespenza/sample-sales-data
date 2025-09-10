import { Totals } from "@/data/sales";

export type MetricKey =
  | "signups" | "cancellations" | "revenue" | "upsells"
  | "mrr" | "arr" | "arpu" | "ltv"
  | "trialStarts" | "trialToPaidRate"
  | "refunds" | "refundRate"
  | "churnCount" | "churnRate"
  | "expansionMRR" | "contractionMRR" | "netMRR"
  | "aov" | "cac" | "ltvToCac"
  | "activeUsers";

export type MetricMeta = {
  key: MetricKey;
  label: string;
  unit?: string;
  type: "line";
  dayFormula: (d: Totals, ctx: { dau: number; cacBase: number }) => number;
  aggregate: "sum" | "avg" | "rate";
  decimals?: number;
};

export const METRICS: MetricMeta[] = [
  { key: "signups", label: "Sign-ups", type: "line", dayFormula: d => d.signups, aggregate: "sum" },
  { key: "cancellations", label: "Cancellations", type: "line", dayFormula: d => d.cancellations, aggregate: "sum" },
  { key: "revenue", label: "Revenue", unit: "$", type: "line", dayFormula: d => d.revenue, aggregate: "sum" },
  { key: "upsells", label: "Upsells", type: "line", dayFormula: d => d.upsells, aggregate: "sum" },
  { key: "mrr", label: "MRR", unit: "$", type: "line", dayFormula: d => d.revenue * 0.25, aggregate: "sum" },
  { key: "arr", label: "ARR", unit: "$", type: "line", dayFormula: d => d.revenue * 0.25 * 12 / 30, aggregate: "sum" },
  { key: "arpu", label: "ARPU", unit: "$", type: "line", dayFormula: d => d.revenue / Math.max(1, d.signups - d.cancellations), aggregate: "avg", decimals: 2 },
  { key: "ltv", label: "LTV", unit: "$", type: "line", dayFormula: d => (d.revenue / Math.max(1, d.signups)) * 10, aggregate: "avg", decimals: 0 },
  { key: "trialStarts", label: "Trial Starts", type: "line", dayFormula: d => Math.round(d.signups * 0.4), aggregate: "sum" },
  { key: "trialToPaidRate", label: "Trial→Paid", unit: "%", type: "line", dayFormula: d => (d.signups ? (d.upsells + d.revenue * 0.01) / d.signups : 0) * 100, aggregate: "avg", decimals: 1 },
  { key: "refunds", label: "Refunds", unit: "$", type: "line", dayFormula: d => Math.round(d.revenue * 0.03), aggregate: "sum" },
  { key: "refundRate", label: "Refund Rate", unit: "%", type: "line", dayFormula: d => (d.revenue ? (d.revenue * 0.03) / d.revenue : 0) * 100, aggregate: "avg", decimals: 2 },
  { key: "churnCount", label: "Churned Users", type: "line", dayFormula: d => Math.max(0, d.cancellations), aggregate: "sum" },
  { key: "churnRate", label: "Churn Rate", unit: "%", type: "line", dayFormula: d => (d.signups ? d.cancellations / d.signups : 0) * 100, aggregate: "avg", decimals: 2 },
  { key: "expansionMRR", label: "Expansion MRR", unit: "$", type: "line", dayFormula: d => Math.round(d.upsells * 3), aggregate: "sum" },
  { key: "contractionMRR", label: "Contraction MRR", unit: "$", type: "line", dayFormula: d => -Math.round(d.cancellations * 2), aggregate: "sum" },
  { key: "netMRR", label: "Net MRR", unit: "$", type: "line", dayFormula: d => Math.round(d.upsells * 3 - d.cancellations * 2), aggregate: "sum" },
  { key: "aov", label: "Avg Order Value", unit: "$", type: "line", dayFormula: d => (d.revenue / Math.max(1, d.signups)), aggregate: "avg", decimals: 2 },
  { key: "cac", label: "CAC", unit: "$", type: "line", dayFormula: (_d, ctx) => ctx.cacBase, aggregate: "avg", decimals: 0 },
  { key: "ltvToCac", label: "LTV/CAC", type: "line", dayFormula: (d, ctx) => ((d.revenue / Math.max(1, d.signups)) * 10) / Math.max(1, ctx.cacBase), aggregate: "avg", decimals: 2 },
  { key: "activeUsers", label: "MAU", type: "line", dayFormula: (_d, ctx) => ctx.dau * 30, aggregate: "avg" }
];

export const DEFAULT_VISIBLE: MetricKey[] = [
  "revenue","signups","cancellations","upsells","mrr","arpu","netMRR","churnRate"
];
