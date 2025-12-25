/**
 * Import Help Modal Component
 * 
 * Explains what gets imported and what may be missing
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImportHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportHelpModal({ open, onClose }: ImportHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>What gets imported?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* What we import */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">What we import</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Entry & exit prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Quantity & timing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Instrument details (Equity / Futures / Options)</span>
              </li>
            </ul>
          </div>

          {/* What may be missing */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">What may be missing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>Stop loss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>Target</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>Trade plan / intent</span>
              </li>
            </ul>
          </div>

          {/* Why this is okay */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Why this is okay</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Execution behavior alone is enough to uncover many trading patterns.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

