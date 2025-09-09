"use client";

import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import React, { useMemo, useState } from "react";
import {
  SALES,
  Totals,
  MonthData,
  YearBucket,
  QuarterBucket,
  groupByYear,
  groupByQuarter,
  monthShortLabel,
  daysOfMonth,
  synthesizeHours,
  synthesizeMinutes,
  findMonth
} from "@/data/sales";

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent, CanvasRenderer]);
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Metric = keyof Totals; // "signups" | "cancellations" | "revenue" | "upsells"
const META: Record<Metric, { label: string; type: "bar" | "line" }> = {
  signups: { label: "Sign-ups", type: "bar" },
  cancellations: { label: "Cancellations", type: "bar" },
  revenue: { label: "Revenue", type: "line" },
  upsells: { label: "Upsells", type: "line" }
};

type View =
  | { level: "years"; years: YearBucket[] }
  | { level: "quarters"; year: YearBucket; quarters: QuarterBucket[] }
  | { level: "months"; quarter: QuarterBucket }
  | { level: "weeks"; month: MonthData }
  | { level: "days"; month: MonthData }
  | { level: "hours"; dayISO: string; dayTotal: number }
  | { level: "minutes"; dayISO: string; hour: number; hourTotal: number };

export default function DeepMetricPanel({ metric }: { metric: Metric }) {
  const meta = META[metric];
  const [view, setView] = useState<View>({ level: "years", years: groupByYear(SALES) });

  const option = useMemo(() => {
    if (view.level === "years") {
      const labels = view.years.map(y=>y.yearKey);
      const data = view.years.map(y=> y.totals[metric]);
      return { title:{text: meta.label}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true, universalTransition:true }] } as echarts.EChartsCoreOption;
    }
    if (view.level === "quarters") {
      const labels = view.quarters.map(q=> q.quarterKey.split('-')[1]);
      const data = view.quarters.map(q=> q.totals[metric]);
      return { title:{text: `${meta.label} — ${view.year.yearKey}`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true, universalTransition:true }] } as echarts.EChartsCoreOption;
    }
    if (view.level === "months") {
      const labels = view.quarter.months.map(m=> monthShortLabel(m.monthKey));
      const data = view.quarter.months.map(m=> m.totals[metric]);
      return { title:{text: `${meta.label} — ${view.quarter.quarterKey}`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true, universalTransition:true }] } as echarts.EChartsCoreOption;
    }
    if (view.level === "weeks") {
      const labels = view.month.weeks.map(w=> w.week);
      const data = view.month.weeks.map(w=> w.totals[metric]);
      return { title:{text: `${meta.label} — ${view.month.month}`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true, universalTransition:true }] } as echarts.EChartsCoreOption;
    }
    if (view.level === "days") {
      const days = daysOfMonth(view.month);
      const labels = days.map(d=> d.dateISO.slice(8,10));
      const data = days.map(d=> d.totals[metric]);
      return { title:{text: `${meta.label} — ${view.month.month}`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, dataZoom:[{type:"inside"},{type:"slider"}], series:[{ name: meta.label, type: meta.type, data, smooth:true, universalTransition:true }] } as echarts.EChartsCoreOption;
    }
    if (view.level === "hours") {
      const hours = synthesizeHours(view.dayISO, metric, view.dayTotal);
      const labels = hours.map(h=> String(h.hour));
      const data = hours.map(h=> h.value);
      return { title:{text: `${meta.label} — ${view.dayISO}`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true }] } as echarts.EChartsCoreOption;
    }
    // minutes
    const minutes = synthesizeMinutes(view.dayISO, view.hour, metric, view.hourTotal);
    const labels = minutes.map(m=> String(m.minute));
    const data = minutes.map(m=> m.value);
    return { title:{text: `${meta.label} — ${view.dayISO} ${String(view.hour).padStart(2,'0')}:00`}, tooltip:{trigger:"axis"}, xAxis:{type:"category",data:labels}, yAxis:{type:"value"}, series:[{ name: meta.label, type: meta.type, data, smooth:true }] } as echarts.EChartsCoreOption;
  }, [view, metric, meta.label, meta.type]);

  const onClick = (params: { dataIndex: number }) => {
    if (view.level === "years") {
      const year = view.years[params.dataIndex];
      if (year) setView({ level: "quarters", year, quarters: groupByQuarter(year) });
    } else if (view.level === "quarters") {
      const quarter = view.quarters[params.dataIndex];
      if (quarter) setView({ level: "months", quarter });
    } else if (view.level === "months") {
      const month = view.quarter.months[params.dataIndex];
      if (month) setView({ level: "weeks", month });
    } else if (view.level === "weeks") {
      const month = view.month; // select the week to go to days view (show whole month days by default)
      setView({ level: "days", month });
    } else if (view.level === "days") {
      const days = daysOfMonth(view.month);
      const day = days[params.dataIndex];
      if (day) setView({ level: "hours", dayISO: day.dateISO, dayTotal: day.totals[metric] });
    } else if (view.level === "hours") {
      const hours = synthesizeHours(view.dayISO, metric, view.dayTotal);
      const h = hours[params.dataIndex];
      if (h) setView({ level: "minutes", dayISO: view.dayISO, hour: h.hour, hourTotal: h.value });
    }
  };

  const back = () => {
    if (view.level === "minutes") setView({ level: "hours", dayISO: view.dayISO, dayTotal: view.hourTotal });
    else if (view.level === "hours") setView({ level: "days", month: findMonth(view.dayISO.slice(0,7), SALES)! });
    else if (view.level === "days") setView({ level: "weeks", month: view.month });
    else if (view.level === "weeks") setView({ level: "months", quarter: groupByQuarter({ yearKey: view.month.monthKey.slice(0,4), months: SALES.filter(m=>m.monthKey.startsWith(view.month.monthKey.slice(0,7).slice(0,4))), totals: {signups:0,cancellations:0,revenue:0,upsells:0} })[Math.floor((Number(view.month.monthKey.slice(5,7))-1)/3)] });
    else if (view.level === "months") setView({ level: "quarters", year: { yearKey: view.quarter.quarterKey.slice(0,4), months: SALES.filter(m=>m.monthKey.startsWith(view.quarter.quarterKey.slice(0,4))), totals: {signups:0,cancellations:0,revenue:0,upsells:0} }, quarters: groupByQuarter({ yearKey: view.quarter.quarterKey.slice(0,4), months: SALES.filter(m=>m.monthKey.startsWith(view.quarter.quarterKey.slice(0,4))), totals: {signups:0,cancellations:0,revenue:0,upsells:0} }) });
    else if (view.level === "quarters") setView({ level: "years", years: groupByYear(SALES) });
  };

  const reset = () => setView({ level: "years", years: groupByYear(SALES) });

  // Breadcrumb label
  const crumb = (()=>{
    switch(view.level){
      case "years": return "Years";
      case "quarters": return `${view.year.yearKey}`;
      case "months": return `${view.quarter.quarterKey}`;
      case "weeks": return `${view.month.monthKey.slice(0,4)} › ${monthShortLabel(view.month.monthKey)}`;
      case "days": return `${view.month.month}`;
      case "hours": return `${view.dayISO}`;
      case "minutes": return `${view.dayISO} › ${String(view.hour).padStart(2,'0')}:00`;
    }
  })();

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">{crumb}</div>
        <div className="flex items-center gap-2">
          <button onClick={back} className="text-xs border rounded px-2 py-1 hover:bg-gray-50">Back</button>
          <button onClick={reset} className="text-xs border rounded px-2 py-1 hover:bg-gray-50">Reset</button>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 320 }} onEvents={{ click: onClick }} />
    </div>
  );
}

