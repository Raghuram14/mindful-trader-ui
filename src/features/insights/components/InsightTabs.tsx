/**
 * Insight Tabs Component
 * 
 * Tabs for Today / This Week / This Month with URL persistence
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InsightRange } from '../types/insight.types';

interface InsightTabsProps {
  value: InsightRange;
  onValueChange: (value: InsightRange) => void;
}

export function InsightTabs({ value, onValueChange }: InsightTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL or default to TODAY
  useEffect(() => {
    const rangeParam = searchParams.get('range');
    if (rangeParam) {
      const validRange = ['TODAY', 'WEEK', 'MONTH'].includes(rangeParam.toUpperCase())
        ? (rangeParam.toUpperCase() as InsightRange)
        : 'TODAY';
      if (validRange !== value) {
        onValueChange(validRange);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValueChange = (newValue: string) => {
    const range = newValue as InsightRange;
    onValueChange(range);
    
    // Update URL
    setSearchParams({ range: range.toLowerCase() });
  };

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="TODAY">Today</TabsTrigger>
        <TabsTrigger value="WEEK">This Week</TabsTrigger>
        <TabsTrigger value="MONTH">This Month</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

