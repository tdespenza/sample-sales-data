export type DayMetric = { day: string; signups: number; cancellations: number; revenue: number; upsells: number };
export type WeekData = { week: string; metrics: DayMetric[] };
export type MonthData = {
  month: string;
  totals: { signups: number; cancellations: number; revenue: number; upsells: number };
  weeks: WeekData[];
};

export const SALES: MonthData[] = [
  {
    month: "August 2025",
    totals: { signups: 1200, cancellations: 150, revenue: 35000, upsells: 320 },
    weeks: [
      {
        week: "Week 1",
        metrics: [
          { day: "Mon", signups: 150, cancellations: 15, revenue: 7000, upsells: 60 },
          { day: "Tue", signups: 180, cancellations: 18, revenue: 8200, upsells: 70 },
          { day: "Wed", signups: 160, cancellations: 12, revenue: 7500, upsells: 55 },
          { day: "Thu", signups: 170, cancellations: 14, revenue: 7800, upsells: 65 },
          { day: "Fri", signups: 160, cancellations: 20, revenue: 8500, upsells: 70 }
        ]
      },
      {
        week: "Week 2",
        metrics: [
          { day: "Mon", signups: 140, cancellations: 10, revenue: 7100, upsells: 50 },
          { day: "Tue", signups: 175, cancellations: 14, revenue: 8300, upsells: 72 },
          { day: "Wed", signups: 165, cancellations: 15, revenue: 7600, upsells: 60 },
          { day: "Thu", signups: 155, cancellations: 18, revenue: 7800, upsells: 62 },
          { day: "Fri", signups: 170, cancellations: 16, revenue: 8600, upsells: 75 }
        ]
      }
    ]
  },
  {
    month: "September 2025",
    totals: { signups: 1350, cancellations: 200, revenue: 40000, upsells: 360 },
    weeks: [
      {
        week: "Week 1",
        metrics: [
          { day: "Mon", signups: 200, cancellations: 25, revenue: 9500, upsells: 80 },
          { day: "Tue", signups: 210, cancellations: 22, revenue: 10200, upsells: 85 },
          { day: "Wed", signups: 190, cancellations: 20, revenue: 9700, upsells: 78 },
          { day: "Thu", signups: 220, cancellations: 24, revenue: 11000, upsells: 90 },
          { day: "Fri", signups: 190, cancellations: 18, revenue: 9600, upsells: 80 }
        ]
      }
    ]
  }
];
