"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { SALES, MonthData } from "@/data/sales";
import { trendColor } from "@/utils/trendColor";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SalesDrilldown() {
  const [view, setView] = useState<
    { level: "months" } |
    { level: "weeks"; month: MonthData } |
    { level: "days"; month: MonthData; weekIdx: number }
  >({ level: "months" });

  const option = useMemo(() => {
    const makeSeries = (name: string, values: number[]) => ({
      name,
      type: "line" as const,
      smooth: true,
      showSymbol: false,
      ...trendColor(values)
    });

    if (view.level === "months") {
      const labels = SALES.map((m) => m.month);
      return {
        title: { text: "Monthly Sales Overview" },
        tooltip: { trigger: "axis" },
        legend: { data: ["Sign-ups", "Cancellations", "Revenue", "Upsells"] },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          makeSeries("Sign-ups", SALES.map((m) => m.totals.signups)),
          makeSeries("Cancellations", SALES.map((m) => m.totals.cancellations)),
          makeSeries("Revenue", SALES.map((m) => m.totals.revenue)),
          makeSeries("Upsells", SALES.map((m) => m.totals.upsells))
        ]
      } as EChartsOption;
    }

    if (view.level === "weeks") {
      const { month } = view;
      const labels = month.weeks.map((w) => w.week);
      return {
        title: { text: `${month.month} — Weekly Breakdown` },
        tooltip: { trigger: "axis" },
        legend: { data: ["Sign-ups", "Cancellations", "Revenue", "Upsells"] },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          makeSeries("Sign-ups", month.weeks.map((w) => w.totals.signups)),
          makeSeries("Cancellations", month.weeks.map((w) => w.totals.cancellations)),
          makeSeries("Revenue", month.weeks.map((w) => w.totals.revenue)),
          makeSeries("Upsells", month.weeks.map((w) => w.totals.upsells))
        ]
      } as EChartsOption;
    }

    const { month, weekIdx } = view; // days view
    const week = month.weeks[weekIdx];
    const labels = week.metrics.map((d) => d.day);
    return {
      title: { text: `${month.month} — ${week.week} Daily Metrics` },
      tooltip: { trigger: "axis" },
      legend: { data: ["Sign-ups", "Cancellations", "Revenue", "Upsells"] },
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series: [
        makeSeries("Sign-ups", week.metrics.map((d) => d.signups)),
        makeSeries("Cancellations", week.metrics.map((d) => d.cancellations)),
        makeSeries("Revenue", week.metrics.map((d) => d.revenue)),
        makeSeries("Upsells", week.metrics.map((d) => d.upsells))
      ]
    } as EChartsOption;
  }, [view]);

  const onClick = (params: { dataIndex: number }) => {
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
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button onClick={goBack} className="border rounded px-3 py-1 text-sm hover:bg-white bg-sky/10 text-navy">
            ← Back
          </button>
        )}
      </div>
      <ReactECharts option={option} style={{ height: 440 }} onEvents={{ click: onClick }} />
      <p className="text-sm text-navy/80">Click a month → weekly view → click a week → daily view.</p>
    </div>
  );
}
