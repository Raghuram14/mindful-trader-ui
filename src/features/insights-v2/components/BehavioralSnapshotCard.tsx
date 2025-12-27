/**
 * Behavioral Snapshot Card
 * 
 * Compact visual summary - 50% smaller, scores only
 */

import { BehavioralSnapshot, DisciplineStatus, RiskStatus, PsychologyStatus } from '../types/insightV2.types';
import { cn } from '@/lib/utils';

interface BehavioralSnapshotCardProps {
  snapshot: BehavioralSnapshot;
}

export function BehavioralSnapshotCard({ snapshot }: BehavioralSnapshotCardProps) {
  const getStatusColor = (status: string) => {
    if (status === 'GOOD' || status === 'CONTROLLED' || status === 'ALIGNED') {
      return 'text-green-500';
    } else if (status === 'NEEDS_ATTENTION' || status === 'NEAR_LIMITS' || status === 'MISMATCHED') {
      return 'text-amber-500';
    } else {
      return 'text-red-500';
    }
  };

  const getStatusBg = (status: string) => {
    if (status === 'GOOD' || status === 'CONTROLLED' || status === 'ALIGNED') {
      return 'bg-green-500/10';
    } else if (status === 'NEEDS_ATTENTION' || status === 'NEAR_LIMITS' || status === 'MISMATCHED') {
      return 'bg-amber-500/10';
    } else {
      return 'bg-red-500/10';
    }
  };

  const getDisciplineScore = () => {
    switch (snapshot.discipline) {
      case DisciplineStatus.GOOD:
        return { score: 90, label: 'Strong' };
      case DisciplineStatus.NEEDS_ATTENTION:
        return { score: 60, label: 'Fair' };
      case DisciplineStatus.POOR:
        return { score: 30, label: 'Poor' };
    }
  };

  const getRiskScore = () => {
    switch (snapshot.risk) {
      case RiskStatus.CONTROLLED:
        return { score: 85, label: 'Safe' };
      case RiskStatus.NEAR_LIMITS:
        return { score: 55, label: 'High' };
      case RiskStatus.EXCESSIVE:
        return { score: 25, label: 'Risky' };
    }
  };

  const getPsychologyScore = () => {
    switch (snapshot.psychology) {
      case PsychologyStatus.ALIGNED:
        return { score: 80, label: 'Clear' };
      case PsychologyStatus.MISMATCHED:
        return { score: 40, label: 'Mixed' };
    }
  };

  const disciplineData = getDisciplineScore();
  const riskData = getRiskScore();
  const psychologyData = getPsychologyScore();

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {/* Discipline */}
      <div className={cn(
        'rounded-lg p-4 border border-border transition-all hover:shadow-sm',
        getStatusBg(snapshot.discipline)
      )}>
        <p className="text-xs text-muted-foreground mb-2">Discipline</p>
        <div className="flex items-baseline gap-1">
          <p className={cn('text-2xl font-bold', getStatusColor(snapshot.discipline))}>
            {disciplineData.score}
          </p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
        <p className="text-xs font-medium text-foreground mt-1">{disciplineData.label}</p>
      </div>

      {/* Risk */}
      <div className={cn(
        'rounded-lg p-4 border border-border transition-all hover:shadow-sm',
        getStatusBg(snapshot.risk)
      )}>
        <p className="text-xs text-muted-foreground mb-2">Risk</p>
        <div className="flex items-baseline gap-1">
          <p className={cn('text-2xl font-bold', getStatusColor(snapshot.risk))}>
            {riskData.score}
          </p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
        <p className="text-xs font-medium text-foreground mt-1">{riskData.label}</p>
      </div>

      {/* Psychology */}
      <div className={cn(
        'rounded-lg p-4 border border-border transition-all hover:shadow-sm',
        getStatusBg(snapshot.psychology)
      )}>
        <p className="text-xs text-muted-foreground mb-2">Psychology</p>
        <div className="flex items-baseline gap-1">
          <p className={cn('text-2xl font-bold', getStatusColor(snapshot.psychology))}>
            {psychologyData.score}
          </p>
          <p className="text-xs text-muted-foreground">%</p>
        </div>
        <p className="text-xs font-medium text-foreground mt-1">{psychologyData.label}</p>
      </div>

      {/* Consistency */}
      <div className={cn(
        'rounded-lg p-4 border border-border transition-all hover:shadow-sm',
        snapshot.consistencyScore >= 60 ? 'bg-green-500/10' : 
        snapshot.consistencyScore === 0 && snapshot.evaluatedTrades < 8 ? 'bg-muted/30' : 
        'bg-amber-500/10'
      )}>
        <p className="text-xs text-muted-foreground mb-2">Consistency</p>
        {snapshot.consistencyScore === 0 && snapshot.evaluatedTrades < 8 ? (
          <>
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-xs text-muted-foreground mt-1">Need more data</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <p className={cn(
                'text-2xl font-bold',
                snapshot.consistencyScore >= 60 ? 'text-green-500' : 'text-amber-500'
              )}>
                {snapshot.consistencyScore}
              </p>
              <p className="text-xs text-muted-foreground">%</p>
            </div>
            <p className="text-xs font-medium text-foreground mt-1">
              {snapshot.consistencyScore >= 60 ? 'Stable' : 'Variable'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

