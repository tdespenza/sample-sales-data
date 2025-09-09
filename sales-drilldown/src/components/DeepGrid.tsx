"use client";
import DeepMetricPanel from "@/components/DeepMetricPanel";

export default function DeepGrid(){
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeepMetricPanel metric="signups" />
        <DeepMetricPanel metric="cancellations" />
        <DeepMetricPanel metric="revenue" />
        <DeepMetricPanel metric="upsells" />
      </div>
    </section>
  );
}

