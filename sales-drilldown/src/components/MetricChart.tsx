"use client";

import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { DayMetric, MonthData, SALES } from "@/data/sales";
import React, { useMemo } from "react";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export type ViewState =
  | { level: "months" }
  | { level: "weeks"; month: MonthData }
  | { level: "days"; month: MonthData; weekIdx: number };

type Metric = keyof Omit<DayMetric, "day" | "dateISO">;

const METRIC_META: Record<Metric, { label: string }> = {
  signups: { label: "Sign-ups" },
  cancellations: { label: "Cancellations" },
  revenue: { label: "Revenue" },
  upsells: { label: "Upsells" }
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
      const values = SALES.map((m) => m.totals[metric]);
      return {
        title: { text: meta.label },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          {
            name: meta.label,
            type: "line",
            data: values,
            smooth: true,
            universalTransition: true,
            showSymbol: false,
            lineStyle: {
              color: (p: { dataIndex: number }) => {
                const i = p.dataIndex;
                if (i >= values.length - 1) return "#000";
                return values[i + 1] >= values[i] ? "#000" : "#f00";
              }
            }
          }
        ]
      } as EChartsOption;
    }

    if (view.level === "weeks") {
      const { month } = view;
      const labels = month.weeks.map((w) => w.week);
      const totals = month.weeks.map((w) => w.totals[metric]);
      return {
        title: { text: `${meta.label} — ${month.month}` },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          {
            name: meta.label,
            type: "line",
            data: totals,
            smooth: true,
            universalTransition: true,
            showSymbol: false,
            lineStyle: {
              color: (p: { dataIndex: number }) => {
                const i = p.dataIndex;
                if (i >= totals.length - 1) return "#000";
                return totals[i + 1] >= totals[i] ? "#000" : "#f00";
              }
            }
          }
        ]
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
      series: [
        {
          name: meta.label,
          type: "line",
          data: vals,
          smooth: true,
          universalTransition: true,
          showSymbol: false,
          lineStyle: {
            color: (p: { dataIndex: number }) => {
              const i = p.dataIndex;
              if (i >= vals.length - 1) return "#000";
              return vals[i + 1] >= vals[i] ? "#000" : "#f00";
            }
          }
        }
      ]
    } as EChartsOption;
  }, [view, metric, meta.label]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 320 }}
      onEvents={{ click: onClick as (params: unknown) => void }}
    />
  );
}

