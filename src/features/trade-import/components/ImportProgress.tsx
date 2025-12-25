/**
 * Import Progress Component
 * 
 * Shows import progress steps
 */

import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportState } from '../types/tradeImport.types';

interface ImportProgressProps {
  progress: ImportState['progress'];
}

const steps = [
  { key: 'parsing', label: 'Parsing CSV' },
  { key: 'storing', label: 'Storing executions' },
  { key: 'reconstructing', label: 'Reconstructing trades' },
] as const;

export function ImportProgress({ progress }: ImportProgressProps) {
  const currentStepIndex = steps.findIndex(s => s.key === progress);
  const isComplete = progress === 'complete';

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex && !isComplete;
        const isCompleted = index < currentStepIndex || isComplete;

        return (
          <div key={step.key} className="flex items-center gap-3">
            {isActive ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
            )}
            <span className={cn(
              "text-sm",
              isActive && "text-primary font-medium",
              isCompleted && "text-muted-foreground",
              !isActive && !isCompleted && "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

