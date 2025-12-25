/**
 * Empty State Component
 * 
 * Shown when there's insufficient data for insights
 */

export function InsightEmptyState() {
  return (
    <div className="card-calm text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Not enough data yet
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Trade a bit more to unlock insights. We need closed trades to analyze your behavioral patterns.
        </p>
      </div>
    </div>
  );
}

