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

