"use client";

import React, { useState } from "react";
import MetricChart, { ViewState } from "@/components/MetricChart";
import { SALES } from "@/data/sales";

export default function SplitDrilldown() {
  const [view, setView] = useState<ViewState>({ level: "months" });

  const onChartClick = (params: { dataIndex: number }) => {
    if (view.level === "months") {
      const month = SALES[params.dataIndex];
      if (month) setView({ level: "weeks", month });
    } else if (view.level === "weeks") {
      const { month } = view;
      setView({ level: "days", month, weekIdx: params.dataIndex });
    }
  };

  const canGoBack = view.level !== "months";
  const goBack = () => {
    if (view.level === "days") setView({ level: "weeks", month: view.month });
    else if (view.level === "weeks") setView({ level: "months" });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button onClick={goBack} className="border rounded px-3 py-1 text-sm hover:bg-gray-50">
            ← Back
          </button>
        )}
        <div className="text-sm text-gray-600">
          {view.level === "months" && <span>Level: Months</span>}
          {view.level === "weeks" && <span>Level: Weeks — {view.month.month}</span>}
          {view.level === "days" && (
            <span>
              Level: Days — {view.month.month} / {view.month.weeks[view.weekIdx].week}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-white p-3">
          <MetricChart view={view} metric="signups" onClick={onChartClick} />
        </div>
        <div className="rounded-lg border bg-white p-3">
          <MetricChart view={view} metric="cancellations" onClick={onChartClick} />
        </div>
        <div className="rounded-lg border bg-white p-3">
          <MetricChart view={view} metric="revenue" onClick={onChartClick} />
        </div>
        <div className="rounded-lg border bg-white p-3">
          <MetricChart view={view} metric="upsells" onClick={onChartClick} />
        </div>
      </div>
    </section>
  );
}

