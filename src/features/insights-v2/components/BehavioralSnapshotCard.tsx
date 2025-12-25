/**
 * Behavioral Snapshot Card
 * 
 * Top-level behavioral summary that orients the user immediately
 */

import { BehavioralSnapshot, DisciplineStatus, RiskStatus, PsychologyStatus } from '../types/insightV2.types';
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface BehavioralSnapshotCardProps {
  snapshot: BehavioralSnapshot;
}

export function BehavioralSnapshotCard({ snapshot }: BehavioralSnapshotCardProps) {
  const getDisciplineIcon = () => {
    switch (snapshot.discipline) {
      case DisciplineStatus.GOOD:
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case DisciplineStatus.NEEDS_ATTENTION:
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case DisciplineStatus.POOR:
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getDisciplineLabel = () => {
    switch (snapshot.discipline) {
      case DisciplineStatus.GOOD:
        return 'Good';
      case DisciplineStatus.NEEDS_ATTENTION:
        return 'Needs attention';
      case DisciplineStatus.POOR:
        return 'Poor';
    }
  };

  const getRiskIcon = () => {
    switch (snapshot.risk) {
      case RiskStatus.CONTROLLED:
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case RiskStatus.NEAR_LIMITS:
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case RiskStatus.EXCESSIVE:
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getRiskLabel = () => {
    switch (snapshot.risk) {
      case RiskStatus.CONTROLLED:
        return 'Controlled';
      case RiskStatus.NEAR_LIMITS:
        return 'Near limits';
      case RiskStatus.EXCESSIVE:
        return 'Excessive';
    }
  };

  const getPsychologyIcon = () => {
    switch (snapshot.psychology) {
      case PsychologyStatus.ALIGNED:
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case PsychologyStatus.MISMATCHED:
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getPsychologyLabel = () => {
    switch (snapshot.psychology) {
      case PsychologyStatus.ALIGNED:
        return 'Aligned';
      case PsychologyStatus.MISMATCHED:
        return 'Confidence mismatch';
    }
  };

  const getPeriodLabel = () => {
    switch (snapshot.period) {
      case 'TODAY':
        return 'Today';
      case 'WEEK':
        return 'This Week';
      case 'MONTH':
        return 'This Month';
    }
  };

  return (
    <div className="card-calm mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {getPeriodLabel()} — Behavioral Summary
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discipline */}
        <div className="flex items-start gap-3">
          {getDisciplineIcon()}
          <div>
            <p className="text-sm text-muted-foreground">Discipline</p>
            <p className="text-base font-medium text-foreground">{getDisciplineLabel()}</p>
          </div>
        </div>

        {/* Risk */}
        <div className="flex items-start gap-3">
          {getRiskIcon()}
          <div>
            <p className="text-sm text-muted-foreground">Risk</p>
            <p className="text-base font-medium text-foreground">{getRiskLabel()}</p>
          </div>
        </div>

        {/* Psychology */}
        <div className="flex items-start gap-3">
          {getPsychologyIcon()}
          <div>
            <p className="text-sm text-muted-foreground">Psychology</p>
            <p className="text-base font-medium text-foreground">{getPsychologyLabel()}</p>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-start gap-3">
          {snapshot.consistencyScore >= 60 ? (
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Consistency</p>
            <p className="text-base font-medium text-foreground">{snapshot.consistencyScore}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Based on {snapshot.evaluatedTrades} {snapshot.evaluatedTrades === 1 ? 'trade' : 'trades'}
        </p>
      </div>
    </div>
  );
}

