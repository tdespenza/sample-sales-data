"use client";

import IndependentMetricChart from "@/components/IndependentMetricChart";

export default function IndependentGrid() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IndependentMetricChart metric="signups" />
        <IndependentMetricChart metric="cancellations" />
        <IndependentMetricChart metric="revenue" />
        <IndependentMetricChart metric="upsells" />
      </div>
    </section>
  );
}
