import IndependentGrid from "@/components/IndependentGrid";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Sales Drilldown — Independent Charts (Years → Days)</h1>
          <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">Demo</span>
        </header>
        <IndependentGrid />
      </div>
    </main>
  );
}
