"use client";

import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import React, { useMemo, useState } from "react";
import { SALES, MonthData, YearBucket, groupByYear, monthShortLabel, Totals } from "@/data/sales";
import { trendColor } from "@/utils/trendColor";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Metric = keyof Totals;
const META: Record<Metric, { label: string }> = {
  signups: { label: "Sign-ups" },
  cancellations: { label: "Cancellations" },
  revenue: { label: "Revenue" },
  upsells: { label: "Upsells" }
};

type View =
  | { level: "years"; years: YearBucket[] }
  | { level: "months"; year: YearBucket }
  | { level: "weeks"; month: MonthData }
  | { level: "days"; month: MonthData; weekIdx: number };

export default function IndependentMetricChart({ metric }: { metric: Metric }) {
  // Initial: aggregate by year
  const [view, setView] = useState<View>({ level: "years", years: groupByYear(SALES) });
  const meta = META[metric];

  const option = useMemo(() => {
    if (view.level === "years") {
      const labels = view.years.map((y) => y.yearKey);
      const values = view.years.map((y) => y.totals[metric]);
      const data = trendColor(values);
      return {
        title: { text: meta.label },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          {
            name: meta.label,
            type: "line",
            data,
            smooth: true,
            universalTransition: true,
            showSymbol: false
          }
        ]
      } as EChartsOption;
    }
    if (view.level === "months") {
      const labels = view.year.months.map((m) => monthShortLabel(m.monthKey));
      const values = view.year.months.map((m) => m.totals[metric]);
      const data = trendColor(values);
      return {
        title: { text: `${meta.label} — ${view.year.yearKey}` },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          {
            name: meta.label,
            type: "line",
            data,
            smooth: true,
            universalTransition: true,
            showSymbol: false
          }
        ]
      } as EChartsOption;
    }
    if (view.level === "weeks") {
      const labels = view.month.weeks.map((w) => w.week);
      const values = view.month.weeks.map((w) => w.totals[metric]);
      const data = trendColor(values);
      return {
        title: { text: `${meta.label} — ${view.month.month}` },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: labels },
        yAxis: { type: "value" },
        series: [
          {
            name: meta.label,
            type: "line",
            data,
            smooth: true,
            universalTransition: true,
            showSymbol: false
          }
        ]
      } as EChartsOption;
    }
    // days
    const week = view.month.weeks[view.weekIdx];
    const labels = week.metrics.map((d) => d.day);
    const values = week.metrics.map((d) => d[metric]);
    const data = trendColor(values);
    return {
      title: { text: `${meta.label} — ${view.month.month} / ${week.week}` },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: labels },
      yAxis: { type: "value" },
      series: [
        {
          name: meta.label,
          type: "line",
          data,
          smooth: true,
          universalTransition: true,
          showSymbol: false
        }
      ]
    } as EChartsOption;
  }, [view, metric, meta.label]);

  const onClick = (params: { dataIndex: number }) => {
    if (view.level === "years") {
      const idx = params.dataIndex;
      const year = view.years[idx];
      if (year) setView({ level: "months", year });
    } else if (view.level === "months") {
      const month = view.year.months[params.dataIndex];
      if (month) setView({ level: "weeks", month });
    } else if (view.level === "weeks") {
      setView({ level: "days", month: view.month, weekIdx: params.dataIndex });
    }
  };

  const reset = () => setView({ level: "years", years: groupByYear(SALES) });

  // Breadcrumbs
  let crumb = "Years";
  if (view.level === "months") crumb = `${view.year.yearKey}`;
  if (view.level === "weeks") crumb = `${view.month.monthKey.slice(0,4)} › ${monthShortLabel(view.month.monthKey)}`;
  if (view.level === "days") crumb = `${view.month.monthKey.slice(0,4)} › ${monthShortLabel(view.month.monthKey)} › ${view.month.weeks[view.weekIdx].week}`;

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">{crumb}</div>
        <button onClick={reset} className="text-xs border rounded px-2 py-1 hover:bg-gray-50">Reset</button>
      </div>
      <ReactECharts option={option} style={{ height: 320 }} onEvents={{ click: onClick }} />
    </div>
  );
}
