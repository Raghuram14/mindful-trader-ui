import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { useRules } from '@/context/RulesContext';
import { formatCurrency } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  calculateAccountRiskPercent,
  checkDailyRuleConflicts,
  calculateActualRisk,
  checkRiskMismatch,
} from '@/utils/riskNudges';

const riskPresets = [500, 1000, 2000];

export default function AddTradePage() {
  const navigate = useNavigate();
  const { addTrade } = useTrades();
  const { profile, dailyStatus, rules } = useRules();

  // Get today's date and current time
  const now = new Date();
  now.setSeconds(0, 0); // Reset seconds and milliseconds

  const [formData, setFormData] = useState({
    instrumentType: 'STOCK' as 'STOCK' | 'FUTURES' | 'OPTIONS',
    symbol: '',
    optionType: 'CALL' as 'PUT' | 'CALL' | undefined,
    tradeDateTime: now,
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    entryPrice: '',
    plannedStop: '',
    plannedTarget: '',
    confidence: 3,
    riskComfort: 1000,
    customRisk: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const riskAmount = formData.customRisk 
      ? parseInt(formData.customRisk) 
      : formData.riskComfort;

    // Format date and time from the DateTime object
    const tradeDate = formData.tradeDateTime.toISOString().split('T')[0];
    const tradeTime = formData.tradeDateTime.toTimeString().slice(0, 5);

    try {
      setIsSubmitting(true);
      await addTrade({
        instrumentType: formData.instrumentType,
        symbol: formData.symbol.toUpperCase(),
        optionType: formData.instrumentType === 'OPTIONS' ? formData.optionType : undefined,
        tradeDate,
        tradeTime,
        type: formData.type,
        quantity: parseInt(formData.quantity) || 0,
        entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : undefined,
        plannedStop: formData.plannedStop ? parseFloat(formData.plannedStop) : undefined,
        plannedTarget: formData.plannedTarget ? parseFloat(formData.plannedTarget) : undefined,
        confidence: formData.confidence,
        riskComfort: riskAmount,
        reason: formData.reason || undefined,
      });

      toast({
        title: 'Trade committed',
        description: 'Your trade plan has been successfully committed.',
      });

      navigate('/today');
    } catch (error) {
      toast({
        title: 'Failed to commit trade',
        description: error instanceof Error ? error.message : 'An error occurred while committing the trade.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = 
    formData.symbol.trim() && 
    formData.quantity && 
    parseInt(formData.quantity) > 0 &&
    formData.entryPrice &&
    parseFloat(formData.entryPrice) > 0 &&
    formData.confidence >= 1 &&
    (formData.instrumentType !== 'OPTIONS' || formData.optionType);

  // Calculate risk nudges (informational only)
  const riskAmount = formData.customRisk 
    ? parseInt(formData.customRisk) 
    : formData.riskComfort;

  // Nudge 1: % of Account at Risk
  const accountRiskPercent = useMemo(() => {
    return calculateAccountRiskPercent(riskAmount, profile?.accountSize);
  }, [riskAmount, profile?.accountSize]);

  // Nudge 2: Daily Rules Conflict Awareness
  const ruleConflictMessage = useMemo(() => {
    return checkDailyRuleConflicts(riskAmount, dailyStatus, rules);
  }, [riskAmount, dailyStatus, rules]);

  // Nudge 3: Risk vs Stop × Quantity Mismatch
  const entryPrice = formData.entryPrice ? parseFloat(formData.entryPrice) : undefined;
  const stopPrice = formData.plannedStop ? parseFloat(formData.plannedStop) : undefined;
  const quantity = formData.quantity ? parseInt(formData.quantity) : undefined;

  const actualRisk = useMemo(() => {
    return calculateActualRisk(entryPrice, stopPrice, quantity);
  }, [entryPrice, stopPrice, quantity]);

  const hasRiskMismatch = useMemo(() => {
    return checkRiskMismatch(actualRisk, riskAmount);
  }, [actualRisk, riskAmount]);

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Add Trade</h1>
          <p className="page-subtitle mt-1">Pre-commit to your plan</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
          {/* 1. Instrument Type, 2. Symbol, 3. Quantity - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Instrument Type */}
            <div>
              <Label htmlFor="instrumentType">Instrument Type</Label>
              <Select
                value={formData.instrumentType}
                onValueChange={(value: 'STOCK' | 'FUTURES' | 'OPTIONS') => {
                  setFormData(prev => ({ 
                    ...prev, 
                    instrumentType: value,
                    optionType: value === 'OPTIONS' ? prev.optionType : undefined
                  }));
                }}
              >
                <SelectTrigger id="instrumentType" className="mt-1.5 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK">Stock</SelectItem>
                  <SelectItem value="FUTURES">Futures</SelectItem>
                  <SelectItem value="OPTIONS">Options</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Symbol */}
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="e.g., RELIANCE"
                className="mt-1.5 h-10 uppercase"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Shares / lots"
                className="mt-1.5 h-10"
                min="1"
                required
              />
            </div>
          </div>

          {/* Entry Price, Planned Stop Price & Planned Target Price - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
                placeholder="Enter price"
                className="mt-1.5 h-10"
                min="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="plannedStop">
                Planned Stop Price <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="plannedStop"
                type="number"
                step="0.01"
                value={formData.plannedStop}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedStop: e.target.value }))}
                placeholder="Enter price"
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label htmlFor="plannedTarget">
                Planned Target Price <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="plannedTarget"
                type="number"
                step="0.01"
                value={formData.plannedTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedTarget: e.target.value }))}
                placeholder="Enter price"
                className="mt-1.5 h-10"
              />
            </div>
          </div>

          {/* Option Type - Only show for OPTIONS */}
          {formData.instrumentType === 'OPTIONS' && (
            <div>
              <Label>Option Type</Label>
              <div className="flex gap-2 mt-1.5">
                {(['PUT', 'CALL'] as const).map((optionType) => (
                  <button
                    key={optionType}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, optionType }))}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      formData.optionType === optionType
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {optionType}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trade Direction */}
          <div>
            <Label>Trade Direction</Label>
            <div className="flex gap-2 mt-1.5">
              {(['buy', 'sell'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    formData.type === type
                      ? type === 'buy'
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Trade Commitment Section */}
          <div className="pt-4 border-t border-border">
            <div className="mb-1">
              <h3 className="text-sm font-medium text-foreground">Trade Commitment</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                These inputs help you stay disciplined during the trade.
              </p>
            </div>

            {/* 8. Confidence Level & 9. Risk Comfort - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Confidence */}
              <div>
                <Label>Confidence Level</Label>
                <div className="flex gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, confidence: level }))}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        formData.confidence === level
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">1 = Low, 5 = High</p>
              </div>

              {/* Risk Comfort */}
              <div>
                <Label>Risk Comfort</Label>
                <div className="flex gap-2 mt-1.5 mb-2">
                  {riskPresets.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        riskComfort: amount, 
                        customRisk: '' 
                      }))}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        formData.riskComfort === amount && !formData.customRisk
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={formData.customRisk}
                  onChange={(e) => setFormData(prev => ({ ...prev, customRisk: e.target.value }))}
                  placeholder="Custom amount"
                  className="h-10"
                />
                {/* Behavioral micro-nudge */}
                {riskAmount > 0 ? (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Your maximum planned loss for this trade is {formatCurrency(riskAmount)}.
                    <br />
                    Commit to respecting this even during volatility.
                  </p>
                ) : null}

                {/* Nudge 1: % of Account at Risk */}
                {accountRiskPercent !== null ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    This trade risks approximately {accountRiskPercent.toFixed(1)}% of your account.
                  </p>
                ) : (
                  profile && (!profile.accountSize || profile.accountSize === 0) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Set your account size to see % risk exposure.
                    </p>
                  )
                )}

                {/* Nudge 3: Risk vs Stop × Quantity Mismatch */}
                {hasRiskMismatch && actualRisk !== null ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                    Based on your stop and quantity, this trade risks more than your planned {formatCurrency(riskAmount)}.
                    <br />
                    <span className="text-muted-foreground">
                      You may want to adjust size or stop to stay aligned with your plan.
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Nudge 2: Daily Rules Conflict Awareness */}
          {ruleConflictMessage && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                {ruleConflictMessage}
              </p>
            </div>
          )}

          {/* 10. Trade Date & Time */}
          <div>
            <Label>Trade Date & Time</Label>
            <DateTimePicker
              value={formData.tradeDateTime}
              onChange={(date) => {
                if (date) {
                  setFormData(prev => ({ ...prev, tradeDateTime: date }));
                }
              }}
              className="mt-1.5"
            />
          </div>

          {/* 11. Why this trade? */}
          <div>
            <Label htmlFor="reason">
              Why this trade? <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="reason"
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Brief reason for entry"
              className="mt-1.5 h-10"
            />
          </div>

          {/* 12. Primary CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Committing...
                </>
              ) : (
                'Commit Trade Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
