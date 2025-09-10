"use client";

import dynamic from "next/dynamic";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import React, { useMemo, useState, useCallback } from "react";
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
import { METRICS, MetricKey, MetricMeta } from "@/data/metrics";
import { trendColor } from "@/utils/trendColor";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent, CanvasRenderer]);
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type View =
  | { level: "years"; years: YearBucket[] }
  | { level: "quarters"; year: YearBucket; quarters: QuarterBucket[] }
  | { level: "months"; quarter: QuarterBucket }
  | { level: "weeks"; month: MonthData }
  | { level: "days"; month: MonthData }
  | { level: "hours"; dayISO: string; dayTotal: number }
  | { level: "minutes"; dayISO: string; hour: number; hourTotal: number };

function dayCtx(d: Totals){
  const dau = Math.max(0, Math.round((d.signups - d.cancellations) * 2.5 + 50));
  const cacBase = Math.max(1, Math.round(100 + d.signups * 0.4));
  return { dau, cacBase };
}

function aggregate(meta: MetricMeta, values: number[]): number {
  const sum = values.reduce((a,b)=>a+b,0);
  if (meta.aggregate === "sum") return sum;
  return values.length ? sum/values.length : 0;
}

export default function DeepMetricPanel({ metric }: { metric: MetricKey }) {
  const meta = METRICS.find(m=>m.key===metric)!;
  const [view, setView] = useState<View>({ level: "years", years: groupByYear(SALES) });
  const calcDay = useCallback((t: Totals) => meta.dayFormula(t, dayCtx(t)), [meta]);

  const option = useMemo(() => {
    if (view.level === "years") {
      const labels = view.years.map(y=>y.yearKey);
      const values = view.years.map(y=>{
        const days = y.months.flatMap(m=> m.weeks.flatMap(w=> w.metrics));
        return Number(aggregate(meta, days.map(d=>calcDay(d))).toFixed(meta.decimals ?? 0));
      });
      const data = trendColor(values);
      return {
        title:{text: meta.label},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          universalTransition:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    if (view.level === "quarters") {
      const labels = view.quarters.map(q=> q.quarterKey.split('-')[1]);
      const values = view.quarters.map(q=>{
        const days = q.months.flatMap(m=> m.weeks.flatMap(w=> w.metrics));
        return Number(aggregate(meta, days.map(d=>calcDay(d))).toFixed(meta.decimals ?? 0));
      });
      const data = trendColor(values);
      return {
        title:{text: `${meta.label} — ${view.year.yearKey}`},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          universalTransition:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    if (view.level === "months") {
      const labels = view.quarter.months.map(m=> monthShortLabel(m.monthKey));
      const values = view.quarter.months.map(m=>{
        const days = m.weeks.flatMap(w=> w.metrics);
        return Number(aggregate(meta, days.map(d=>calcDay(d))).toFixed(meta.decimals ?? 0));
      });
      const data = trendColor(values);
      return {
        title:{text: `${meta.label} — ${view.quarter.quarterKey}`},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          universalTransition:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    if (view.level === "weeks") {
      const labels = view.month.weeks.map(w=> w.week);
      const values = view.month.weeks.map(w=>{
        const vals = w.metrics.map(d=>calcDay(d));
        return Number(aggregate(meta, vals).toFixed(meta.decimals ?? 0));
      });
      const data = trendColor(values);
      return {
        title:{text: `${meta.label} — ${view.month.month}`},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          universalTransition:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    if (view.level === "days") {
      const days = daysOfMonth(view.month);
      const labels = days.map(d=> d.dateISO.slice(8,10));
      const values = days.map(d=> Number(calcDay(d.totals).toFixed(meta.decimals ?? 0)));
      const data = trendColor(values);
      return {
        title:{text: `${meta.label} — ${view.month.month}`},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        dataZoom:[{type:"inside"},{type:"slider"}],
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          universalTransition:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    if (view.level === "hours") {
      const hours = synthesizeHours(view.dayISO, metric, view.dayTotal);
      const labels = hours.map(h=> String(h.hour));
      const values = hours.map(h=> h.value);
      const data = trendColor(values);
      return {
        title:{text: `${meta.label} — ${view.dayISO}`},
        tooltip:{trigger:"axis"},
        xAxis:{type:"category",data:labels},
        yAxis:{type:"value"},
        series:[{
          name: meta.label,
          type: "line",
          data,
          smooth:true,
          showSymbol:false
        }]
      } as echarts.EChartsCoreOption;
    }
    const minutes = synthesizeMinutes(view.dayISO, view.hour, metric, view.hourTotal);
    const labels = minutes.map(m=> String(m.minute));
    const values = minutes.map(m=> m.value);
    const data = trendColor(values);
    return {
      title:{text: `${meta.label} — ${view.dayISO} ${String(view.hour).padStart(2,'0')}:00`},
      tooltip:{trigger:"axis"},
      xAxis:{type:"category",data:labels},
      yAxis:{type:"value"},
      series:[{
        name: meta.label,
        type: "line",
        data,
        smooth:true,
        showSymbol:false
      }]
    } as echarts.EChartsCoreOption;
  }, [view, metric, meta, calcDay]);

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
      setView({ level: "days", month: view.month });
    } else if (view.level === "days") {
      const days = daysOfMonth(view.month);
      const day = days[params.dataIndex];
      if (day) {
        const val = calcDay(day.totals);
        setView({ level: "hours", dayISO: day.dateISO, dayTotal: val });
      }
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
    else if (view.level === "weeks") {
      const yearKey = view.month.monthKey.slice(0,4);
      const year: YearBucket = { yearKey, months: SALES.filter(m=>m.monthKey.startsWith(yearKey)), totals:{signups:0,cancellations:0,revenue:0,upsells:0} };
      const quarter = groupByQuarter(year)[Math.floor((Number(view.month.monthKey.slice(5,7))-1)/3)];
      setView({ level: "months", quarter });
    }
    else if (view.level === "months") {
      const yearKey = view.quarter.quarterKey.slice(0,4);
      const year: YearBucket = { yearKey, months: SALES.filter(m=>m.monthKey.startsWith(yearKey)), totals:{signups:0,cancellations:0,revenue:0,upsells:0} };
      setView({ level: "quarters", year, quarters: groupByQuarter(year) });
    }
    else if (view.level === "quarters") setView({ level: "years", years: groupByYear(SALES) });
  };

  const reset = () => setView({ level: "years", years: groupByYear(SALES) });

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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="small text-muted">{crumb}</div>
        <div className="btn-group btn-group-sm">
          <button onClick={back} className="btn btn-outline-secondary">Back</button>
          <button onClick={reset} className="btn btn-outline-secondary">Reset</button>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 320 }} onEvents={{ click: onClick }} />
    </div>
  );
}
