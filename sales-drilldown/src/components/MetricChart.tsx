"use client";

import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { DayMetric, MonthData, SALES } from "@/data/sales";
import React, { useMemo } from "react";

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type ViewState =
  | { level: "months" }
  | { level: "weeks"; month: MonthData }
  | { level: "days"; month: MonthData; weekIdx: number };

type Metric = keyof Omit<DayMetric, "day">;

const METRIC_META: Record<Metric, { label: string; type: "bar" | "line" }> = {
  signups: { label: "Sign-ups", type: "bar" },
  cancellations: { label: "Cancellations", type: "bar" },
  revenue: { label: "Revenue", type: "line" },
  upsells: { label: "Upsells", type: "line" }
};

export default function MetricChart({
  view,
  metric,
  onClick
}: {
  view: ViewState;
  metric: Metric;
  onClick?: (params: { dataIndex: number }) => void;
}) {
  const meta = METRIC_META[metric];

  const option = useMemo(() => {
    if (view.level === "months") {
      const labels = SALES.map((m) => m.month);
      const data = SALES.map((m) => m.totals[metric]);
      return {
        title: { text: meta.label },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [{ name: meta.label, type: meta.type, data, smooth: true, universalTransition: true }]
      } as EChartsOption;
    }

    if (view.level === "weeks") {
      const { month } = view;
      const labels = month.weeks.map((w) => w.week);
      const totals = month.weeks.map((w) => w.metrics.reduce((acc, d) => acc + d[metric], 0));
      return {
        title: { text: `${meta.label} — ${month.month}` },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [{ name: meta.label, type: meta.type, data: totals, smooth: true, universalTransition: true }]
      } as EChartsOption;
    }

    // days
    const { month, weekIdx } = view;
    const week = month.weeks[weekIdx];
    const labels = week.metrics.map((d) => d.day);
    const vals = week.metrics.map((d) => d[metric]);
    return {
      title: { text: `${meta.label} — ${month.month} / ${week.week}` },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series: [{ name: meta.label, type: meta.type, data: vals, smooth: true, universalTransition: true }]
    } as EChartsOption;
  }, [view, metric, meta.label, meta.type]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 320 }}
      onEvents={{ click: onClick as (params: unknown) => void }}
    />
  );
}

