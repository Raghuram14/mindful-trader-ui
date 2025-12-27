/**
 * Daily Mindset Check Component
 * 
 * Shows once per day to capture user's trading mindset
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MindsetFeeling, CreateMindsetCheckRequest } from '../types/coaching.types';
import { coachingApi } from '../api/coaching.api';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyMindsetCheckProps {
  onSubmitted?: () => void;
}

const FEELING_OPTIONS: Array<{ value: MindsetFeeling; label: string; emoji: string }> = [
  { value: 'STRUGGLING', label: 'Feeling under pressure', emoji: '😔' },
  { value: 'CAUTIOUS', label: 'Feeling cautious', emoji: '🤔' },
  { value: 'BALANCED', label: 'Feeling steady', emoji: '😌' },
  { value: 'CONFIDENT', label: 'Feeling positive', emoji: '😊' },
  { value: 'FOCUSED', label: 'Feeling focused', emoji: '🎯' },
];

export function DailyMindsetCheck({ onSubmitted }: DailyMindsetCheckProps) {
  const [feeling, setFeeling] = useState<MindsetFeeling | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feeling) {
      toast({
        title: 'Please select how you\'re feeling',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateMindsetCheckRequest = {
        question: 'How are you feeling about trading today?',
        response: response.trim() || undefined,
        feeling,
      };

      await coachingApi.submitMindsetCheck(data);

      toast({
        title: 'Thank you for sharing',
        description: 'Your mindset check has been saved.',
      });

      onSubmitted?.();
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Check-In</h2>
          <p className="text-sm text-muted-foreground">How does trading feel for you today?</p>
        </div>
      </div>

      {/* Feeling Selector */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">How are you feeling?</p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {FEELING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFeeling(option.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                'hover:bg-accent hover:border-primary/50',
                feeling === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs font-medium text-foreground text-center">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Response */}
      <div className="space-y-2">
        <label htmlFor="mindset-response" className="text-sm font-medium text-foreground">
          Anything on your mind? <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="mindset-response"
          placeholder="Anything you want to remind yourself of today? (optional)"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!feeling || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Start today's coaching"
        )}
      </Button>
    </div>
  );
}

