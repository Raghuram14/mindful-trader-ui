import { useState } from 'react';
import { Shield, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRules } from '@/context/RulesContext';
import { TradingRule, TradingRuleType, formatCurrency } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const RULE_TEMPLATES: Array<{
  type: TradingRuleType;
  label: string;
  description: string;
  valueType?: 'PERCENTAGE' | 'ABSOLUTE';
  defaultValue: number;
}> = [
  {
    type: 'DAILY_LOSS',
    label: 'Daily Loss Limit',
    description: 'Set a maximum loss amount for the day',
    valueType: 'PERCENTAGE',
    defaultValue: 3,
  },
  {
    type: 'DAILY_TARGET',
    label: 'Daily Target Limit',
    description: 'Set a target profit amount for the day',
    valueType: 'PERCENTAGE',
    defaultValue: 5,
  },
  {
    type: 'MAX_LOSING_TRADES',
    label: 'Losing Trades Limit',
    description: 'Maximum number of losing trades per day',
    defaultValue: 2,
  },
  {
    type: 'STOP_AFTER_TARGET',
    label: 'Stop After Target',
    description: 'Stop trading once daily target is hit',
    defaultValue: 1,
  },
  {
    type: 'STOP_AFTER_LOSS',
    label: 'Stop After Loss',
    description: 'Stop trading once daily loss limit is hit',
    defaultValue: 1,
  },
];

export default function TradingRulesPage() {
  const { rules, addRule, updateRule, deleteRule, profile } = useRules();
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TradingRuleType | null>(null);
  const [ruleValue, setRuleValue] = useState<number>(0);
  const [valueType, setValueType] = useState<'PERCENTAGE' | 'ABSOLUTE'>('PERCENTAGE');

  const handleAddRule = () => {
    if (!selectedTemplate) return;

    const template = RULE_TEMPLATES.find(t => t.type === selectedTemplate);
    if (!template) return;

    // Check if rule type already exists (for single-instance rules)
    const existingRule = rules.find(r => r.type === selectedTemplate);
    if (existingRule && (selectedTemplate === 'DAILY_LOSS' || selectedTemplate === 'DAILY_TARGET')) {
      alert('You can only have one active rule of this type. Please update the existing rule instead.');
      return;
    }

    const description = template.valueType === 'PERCENTAGE'
      ? `${template.label}: ${ruleValue}% of account`
      : template.valueType === 'ABSOLUTE'
      ? `${template.label}: ${formatCurrency(ruleValue)}`
      : `${template.label}: ${ruleValue}`;

    addRule({
      type: selectedTemplate,
      value: ruleValue || template.defaultValue,
      valueType: template.valueType,
      isActive: true,
      description,
    });

    setIsAddingRule(false);
    setSelectedTemplate(null);
    setRuleValue(0);
  };

  const handleToggleRule = (id: string, isActive: boolean) => {
    updateRule(id, { isActive: !isActive });
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to remove this guardrail?')) {
      deleteRule(id);
    }
  };

  const getTemplateForRule = (rule: TradingRule) => {
    return RULE_TEMPLATES.find(t => t.type === rule.type);
  };

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="page-title">My Trading Rules</h1>
          </div>
          <p className="page-subtitle mt-1">
            Pre-commit guardrails to protect yourself during emotional moments
          </p>
          <p className="text-sm text-muted-foreground mt-3 italic">
            These guardrails exist to protect you during emotional moments — not to restrict you.
          </p>
        </header>

        {/* Add Rule Button */}
        <div className="mb-6">
          <Button
            onClick={() => setIsAddingRule(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guardrail
          </Button>
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="card-calm text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No guardrails set yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first trading rule to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const template = getTemplateForRule(rule);
              return (
                <div key={rule.id} className="card-calm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground">{template?.label || rule.type}</h3>
                        {rule.isActive ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rule.description}
                      </p>
                      {rule.isActive && (
                        <p className="text-xs text-muted-foreground italic mb-3">
                          You committed to this rule.
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
                          />
                          <Label className="text-sm text-muted-foreground">
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="ml-4 p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Rule Dialog */}
        <Dialog open={isAddingRule} onOpenChange={setIsAddingRule}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Trading Guardrail</DialogTitle>
              <DialogDescription>
                Choose a rule template to protect yourself during emotional moments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select
                  value={selectedTemplate || ''}
                  onValueChange={(value) => {
                    setSelectedTemplate(value as TradingRuleType);
                    const template = RULE_TEMPLATES.find(t => t.type === value);
                    if (template) {
                      setRuleValue(template.defaultValue);
                      setValueType(template.valueType || 'ABSOLUTE');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TEMPLATES.map((template) => {
                      const existing = rules.find(r => r.type === template.type);
                      if (existing && (template.type === 'DAILY_LOSS' || template.type === 'DAILY_TARGET')) {
                        return null;
                      }
                      return (
                        <SelectItem key={template.type} value={template.type}>
                          {template.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  {RULE_TEMPLATES.find(t => t.type === selectedTemplate)?.valueType && (
                    <div className="space-y-2">
                      <Label>Value Type</Label>
                      <Select
                        value={valueType}
                        onValueChange={(value: 'PERCENTAGE' | 'ABSOLUTE') => setValueType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage of account</SelectItem>
                          <SelectItem value="ABSOLUTE">Absolute amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      {RULE_TEMPLATES.find(t => t.type === selectedTemplate)?.valueType
                        ? valueType === 'PERCENTAGE'
                          ? 'Percentage (%)'
                          : 'Amount (₹)'
                        : 'Value'}
                    </Label>
                    <Input
                      type="number"
                      value={ruleValue}
                      onChange={(e) => setRuleValue(Number(e.target.value))}
                      placeholder="Enter value"
                      min="0"
                      step={valueType === 'PERCENTAGE' ? '0.1' : '100'}
                    />
                    {valueType === 'PERCENTAGE' && profile?.accountSize && (
                      <p className="text-xs text-muted-foreground">
                        = {formatCurrency((ruleValue / 100) * profile.accountSize)} of your account
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddRule}
                  disabled={!selectedTemplate || ruleValue <= 0}
                  className="flex-1"
                >
                  Add Guardrail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingRule(false);
                    setSelectedTemplate(null);
                    setRuleValue(0);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

