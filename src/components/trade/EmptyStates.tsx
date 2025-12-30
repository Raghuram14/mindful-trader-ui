import { FileX, Filter, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NoClosedTradesProps {
  className?: string;
}

export function NoClosedTrades({ className }: NoClosedTradesProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No closed trades yet
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Close your first trade to start building your trading history
      </p>
      <Link to="/today">
        <Button>
          <TrendingUp className="w-4 h-4 mr-2" />
          View Open Trades
        </Button>
      </Link>
    </div>
  );
}

interface NoFilterResultsProps {
  activeFilters: Array<{ label: string; onRemove: () => void }>;
  onClearAll: () => void;
  className?: string;
}

export function NoFilterResults({
  activeFilters,
  onClearAll,
  className,
}: NoFilterResultsProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Filter className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No trades match your filters
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        Try adjusting your filters to see more results
      </p>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-2xl">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={filter.onRemove}
            >
              {filter.label}
              <span className="ml-2 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={onClearAll}>
        Clear All Filters
      </Button>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Failed to load trades",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        There was an error loading your trading history. Please try again.
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
