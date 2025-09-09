import SalesDrilldown from "@/components/SalesDrilldown";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-navy">Sales Drilldown Dashboard</h1>
          <span className="text-xs px-2 py-1 rounded bg-sky/20 text-navy">Demo</span>
        </header>
        <SalesDrilldown />
      </div>
    </main>
  );
}
