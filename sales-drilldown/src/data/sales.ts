export type DayMetric = { day: string; dateISO: string; signups: number; cancellations: number; revenue: number; upsells: number };
export type WeekData = { week: string; weekIndex: number; metrics: DayMetric[]; totals: Totals };
export type MonthData = { month: string; monthKey: string; weeks: WeekData[]; totals: Totals };
export type Totals = { signups: number; cancellations: number; revenue: number; upsells: number };

// ---- Config
export const SALES_CONFIG = {
  monthsBack: 18,               // generate N months ending at current month
  weeksPerMonthMin: 4,
  weeksPerMonthMax: 5,
  seed: 42                      // change for different deterministic series
};

// ---- PRNG (xorshift32) for deterministic noise
function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; // xorshift32
    return (s >>> 0) / 4294967296;            // [0,1)
  };
}

// Helpers
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = (v: number) => Math.round(v);

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m-1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

// Seasonal baselines to make data look realistic
function seasonalBaseline(monthIdx0to11: number) {
  const season = [1.00, 0.96, 0.98, 1.04, 1.08, 1.10, 1.12, 1.15, 1.10, 1.06, 1.02, 1.00];
  return season[monthIdx0to11];
}

// Main generator
export function generateSales(config = SALES_CONFIG): MonthData[] {
  const now = new Date();
  const months: MonthData[] = [];
  const rand = rng(config.seed);

  for (let i = config.monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = monthKey(d);
    const mLabel = monthLabel(mKey);
    const baseline = seasonalBaseline(d.getMonth());

    // Choose 4 or 5 weeks deterministically
    const weeksCount = config.weeksPerMonthMin + Math.floor(rand() * (config.weeksPerMonthMax - config.weeksPerMonthMin + 1));

    const weeks: WeekData[] = [];
    const monthTotals: Totals = { signups: 0, cancellations: 0, revenue: 0, upsells: 0 };

    for (let w = 0; w < weeksCount; w++) {
      const metrics: DayMetric[] = [];
      const weekTotals: Totals = { signups: 0, cancellations: 0, revenue: 0, upsells: 0 };

      for (let dIdx = 0; dIdx < 7; dIdx++) {
        // Baseline daily values with randomness
        const weekdayBoost = dIdx <= 4 ? 1.10 : 0.75; // weekdays vs weekends
        const noise = 0.85 + rand() * 0.3;            // 0.85..1.15

        const signups = round(clamp(80 * baseline * weekdayBoost * noise, 20, 450));
        const cancellations = round(clamp(signups * (0.06 + rand() * 0.06), 0, Math.max(5, signups * 0.5)));
        const upsells = round(clamp(signups * (0.25 + rand() * 0.20), 0, signups));
        const arpu = 35 + rand() * 25;                // $35-$60
        const revenue = round((signups - cancellations) * arpu + upsells * (10 + rand() * 30));

        const date = new Date(d.getFullYear(), d.getMonth(), 1 + w * 7 + dIdx);
        const rec: DayMetric = {
          day: DAY_NAMES[dIdx],
          dateISO: date.toISOString().slice(0, 10),
          signups,
          cancellations,
          revenue,
          upsells
        };
        metrics.push(rec);

        weekTotals.signups += signups;
        weekTotals.cancellations += cancellations;
        weekTotals.revenue += revenue;
        weekTotals.upsells += upsells;
      }

      weeks.push({ week: `Week ${w+1}`, weekIndex: w, metrics, totals: weekTotals });

      monthTotals.signups += weekTotals.signups;
      monthTotals.cancellations += weekTotals.cancellations;
      monthTotals.revenue += weekTotals.revenue;
      monthTotals.upsells += weekTotals.upsells;
    }

    months.push({ month: mLabel, monthKey: mKey, weeks, totals: monthTotals });
  }

  return months;
}

// Eagerly generate (deterministic) dataset for importers
export const SALES: MonthData[] = generateSales();

// ---- Deep time helpers (append to src/data/sales.ts)
export type YearKey = string; // "2025"
export type QuarterKey = `${YearKey}-Q${1|2|3|4}`;
export type DayISO = string; // YYYY-MM-DD

export type YearBucket = { yearKey: YearKey; months: MonthData[]; totals: Totals };
export type QuarterBucket = { quarterKey: QuarterKey; months: MonthData[]; totals: Totals };

export function groupByYear(months: MonthData[]): YearBucket[] {
  const map = new Map<YearKey, YearBucket>();
  for (const m of months) {
    const y = m.monthKey.slice(0, 4);
    const b = map.get(y) ?? { yearKey: y, months: [], totals: { signups:0,cancellations:0,revenue:0,upsells:0 } };
    b.months.push(m);
    b.totals.signups += m.totals.signups;
    b.totals.cancellations += m.totals.cancellations;
    b.totals.revenue += m.totals.revenue;
    b.totals.upsells += m.totals.upsells;
    map.set(y, b);
  }
  return Array.from(map.values()).sort((a,b)=>a.yearKey.localeCompare(b.yearKey));
}

export function groupByQuarter(year: YearBucket): QuarterBucket[] {
  const qMap = new Map<QuarterKey, QuarterBucket>();
  for (const m of year.months) {
    const y = year.yearKey;
    const monthIdx = Number(m.monthKey.slice(5,7)) - 1; // 0-11
    const q = (Math.floor(monthIdx/3)+1) as 1|2|3|4;
    const qk = `${y}-Q${q}` as QuarterKey;
    const b = qMap.get(qk) ?? { quarterKey: qk, months: [], totals: { signups:0,cancellations:0,revenue:0,upsells:0 } };
    b.months.push(m);
    b.totals.signups += m.totals.signups;
    b.totals.cancellations += m.totals.cancellations;
    b.totals.revenue += m.totals.revenue;
    b.totals.upsells += m.totals.upsells;
    qMap.set(qk, b);
  }
  return Array.from(qMap.values()).sort((a,b)=>a.quarterKey.localeCompare(b.quarterKey));
}

export function monthShortLabel(monthKey: string): string {
  const [y,m] = monthKey.split('-').map(Number);
  return new Date(y, m-1, 1).toLocaleString('en-US', { month: 'short' });
}

export function dayISO(y:number,m:number,d:number){
  return new Date(y, m-1, d).toISOString().slice(0,10);
}

// Locate a MonthData by key
export function findMonth(monthKey: string, months: MonthData[]): MonthData | undefined {
  return months.find(m=>m.monthKey===monthKey);
}

// Flatten selected MonthData to list of calendar days (with totals per day)
export function daysOfMonth(month: MonthData): { dateISO: DayISO; label: string; totals: Totals }[] {
  const out: { dateISO: DayISO; label: string; totals: Totals }[] = [];
  for (const w of month.weeks) {
    for (const d of w.metrics) {
      out.push({
        dateISO: d.dateISO,
        label: d.day,
        totals: { signups: d.signups, cancellations: d.cancellations, revenue: d.revenue, upsells: d.upsells }
      });
    }
  }
  // sort by dateISO to keep calendar order
  out.sort((a,b)=>a.dateISO.localeCompare(b.dateISO));
  return out;
}

// --- Lazy hour/minute synthesis per day (deterministic)
function lazyRng(seed:number){ let s=seed|0; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return (s>>>0)/4294967296; }; }
function seedFromISO(iso: string, metric: string){
  // simple hash seed from string
  let h = 2166136261;
  const str = iso+"/"+metric;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24); }
  return h|0;
}

export type HourPoint = { hour: number; value: number };
export type MinutePoint = { minute: number; value: number };

// Split a day total across 24 hours with light variance; returns normalized to ~dayTotal
export function synthesizeHours(dayISO: DayISO, metric: string, dayTotal: number): HourPoint[] {
  const r = lazyRng(seedFromISO(dayISO, String(metric)));
  // diurnal pattern: peak mid‑day, dip at night
  const weights = Array.from({length:24}, (_,h)=> 0.6 + 0.8*Math.exp(-Math.pow((h-14)/6,2)) + r()*0.15);
  const sum = weights.reduce((a,b)=>a+b,0);
  const scale = dayTotal / Math.max(sum, 1e-6);
  return weights.map((w,h)=>({ hour:h, value: Math.max(0, Math.round(w*scale)) }));
}

// Split an hour total across 60 minutes with small randomness; normalized to ~hourTotal
export function synthesizeMinutes(dayISO: DayISO, hour: number, metric: string, hourTotal: number): MinutePoint[] {
  const r = lazyRng(seedFromISO(`${dayISO}T${String(hour).padStart(2,'0')}:00`, String(metric)));
  const weights = Array.from({length:60}, ()=> 0.9 + r()*0.2);
  const sum = weights.reduce((a,b)=>a+b,0);
  const scale = hourTotal / Math.max(sum, 1e-6);
  return weights.map((w,i)=>({ minute:i, value: Math.max(0, Math.round(w*scale)) }));
}


