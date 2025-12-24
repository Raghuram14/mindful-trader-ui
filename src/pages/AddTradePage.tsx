import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrades } from '@/context/TradeContext';
import { formatCurrency } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const riskPresets = [500, 1000, 2000];

export default function AddTradePage() {
  const navigate = useNavigate();
  const { addTrade } = useTrades();

  // Get today's date and current time
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    instrumentType: 'STOCK' as 'STOCK' | 'FUTURES' | 'OPTIONS',
    symbol: '',
    optionType: 'CALL' as 'PUT' | 'CALL' | undefined,
    tradeDate: today,
    tradeTime: now,
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    plannedStop: '',
    plannedTarget: '',
    confidence: 3,
    riskComfort: 1000,
    customRisk: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const riskAmount = formData.customRisk 
      ? parseInt(formData.customRisk) 
      : formData.riskComfort;

    addTrade({
      instrumentType: formData.instrumentType,
      symbol: formData.symbol.toUpperCase(),
      optionType: formData.instrumentType === 'OPTIONS' ? formData.optionType : undefined,
      tradeDate: formData.tradeDate,
      tradeTime: formData.tradeTime,
      type: formData.type,
      quantity: parseInt(formData.quantity) || 0,
      plannedStop: formData.plannedStop ? parseFloat(formData.plannedStop) : undefined,
      plannedTarget: formData.plannedTarget ? parseFloat(formData.plannedTarget) : undefined,
      confidence: formData.confidence,
      riskComfort: riskAmount,
      reason: formData.reason || undefined,
    });

    navigate('/today');
  };

  const isValid = 
    formData.symbol.trim() && 
    formData.quantity && 
    parseInt(formData.quantity) > 0 &&
    formData.confidence >= 1 &&
    (formData.instrumentType !== 'OPTIONS' || formData.optionType);

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Add Trade</h1>
          <p className="page-subtitle mt-1">Pre-commit to your plan</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
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
              <SelectTrigger id="instrumentType" className="mt-2">
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
              className="mt-2 uppercase"
              required
            />
          </div>

          {/* Option Type - Only show for OPTIONS */}
          {formData.instrumentType === 'OPTIONS' && (
            <div>
              <Label>Option Type</Label>
              <div className="flex gap-3 mt-2">
                {(['PUT', 'CALL'] as const).map((optionType) => (
                  <button
                    key={optionType}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, optionType }))}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
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

          {/* Date & Time - 2 Column */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tradeDate">Trade Date</Label>
              <Input
                id="tradeDate"
                type="date"
                value={formData.tradeDate}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeDate: e.target.value }))}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="tradeTime">Trade Time</Label>
              <Input
                id="tradeTime"
                type="time"
                value={formData.tradeTime}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeTime: e.target.value }))}
                className="mt-2"
                required
              />
            </div>
          </div>

          {/* Trade Direction */}
          <div>
            <Label>Trade Direction</Label>
            <div className="flex gap-3 mt-2">
              {(['buy', 'sell'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
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

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="Number of shares / lots"
              className="mt-2"
              min="1"
              required
            />
          </div>

          {/* Planned Stop */}
          <div>
            <Label htmlFor="plannedStop">
              Planned Stop <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="plannedStop"
              type="number"
              step="0.01"
              value={formData.plannedStop}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedStop: e.target.value }))}
              placeholder="Enter price"
              className="mt-2"
            />
          </div>

          {/* Planned Target */}
          <div>
            <Label htmlFor="plannedTarget">
              Planned Target <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="plannedTarget"
              type="number"
              step="0.01"
              value={formData.plannedTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedTarget: e.target.value }))}
              placeholder="Enter price"
              className="mt-2"
            />
          </div>

          {/* Confidence */}
          <div>
            <Label>Confidence Level</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, confidence: level }))}
                  className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    formData.confidence === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">1 = Low, 5 = High</p>
          </div>

          {/* Risk Comfort Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Risk Comfort</h3>
            <p className="text-sm text-muted-foreground mb-4">
              How much can you comfortably lose on this trade?
            </p>
            
            <div className="flex gap-2 mb-3">
              {riskPresets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    riskComfort: amount, 
                    customRisk: '' 
                  }))}
                  className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
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
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This helps reduce emotional exits.
            </p>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">
              Why this trade? <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="reason"
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Brief reason for entry"
              className="mt-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            Save Trade
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
