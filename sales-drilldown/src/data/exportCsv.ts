import { SALES } from "./sales";

export function toCSV() {
  const rows = ["dateISO,monthKey,weekIndex,day,signups,cancellations,revenue,upsells"];
  for (const m of SALES) {
    for (const w of m.weeks) {
      for (const d of w.metrics) {
        rows.push([d.dateISO, m.monthKey, w.weekIndex, d.day, d.signups, d.cancellations, d.revenue, d.upsells].join(","));
      }
    }
  }
  return rows.join("\n");
}

