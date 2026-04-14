const CHART_COUNT = 8;

export default function HistorySkeleton() {
  return (
    <div data-testid="loading" className="space-y-8" role="status" aria-label="Loading history">
      <span className="sr-only">Loading history...</span>
      {Array.from({ length: CHART_COUNT }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-[300px] rounded bg-zinc-100 dark:bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}
