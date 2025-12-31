import { useState, useMemo } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Target,
  Brain,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRules } from "@/context/RulesContext";
import {
  TradingRule,
  TradingRuleType,
  RuleCategory,
  formatCurrency,
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  RULE_TEMPLATES,
  CATEGORY_LABELS,
  BOOLEAN_RULES,
  formatTimeValue,
  parseTimeValue,
  RuleTemplate,
} from "@/api/rules";
import { cn } from "@/lib/utils";

// Category icons component
const CategoryIcon = ({
  category,
  className,
}: {
  category: RuleCategory;
  className?: string;
}) => {
  const icons = {
    RISK: Shield,
    DISCIPLINE: Target,
    TIMING: Clock,
    PSYCHOLOGY: Brain,
  };
  const Icon = icons[category];
  return <Icon className={className} />;
};

// Category colors
const CATEGORY_COLORS: Record<RuleCategory, string> = {
  RISK: "text-red-500",
  DISCIPLINE: "text-blue-500",
  TIMING: "text-amber-500",
  PSYCHOLOGY: "text-purple-500",
};

const CATEGORY_BG: Record<RuleCategory, string> = {
  RISK: "bg-red-500/10",
  DISCIPLINE: "bg-blue-500/10",
  TIMING: "bg-amber-500/10",
  PSYCHOLOGY: "bg-purple-500/10",
};

export default function TradingRulesPage() {
  const { rules, addRule, updateRule, deleteRule, profile, isLoadingRules } =
    useRules();
  const { toast } = useToast();
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(
    null
  );
  const [ruleValue, setRuleValue] = useState<number>(0);
  const [timeValue, setTimeValue] = useState<string>("09:30");
  const [valueType, setValueType] = useState<"PERCENTAGE" | "ABSOLUTE">(
    "PERCENTAGE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<RuleCategory, boolean>
  >({
    RISK: true,
    DISCIPLINE: true,
    TIMING: true,
    PSYCHOLOGY: true,
  });

  // Group rules by category
  const rulesByCategory = useMemo(() => {
    const grouped: Record<RuleCategory, TradingRule[]> = {
      RISK: [],
      DISCIPLINE: [],
      TIMING: [],
      PSYCHOLOGY: [],
    };

    rules.forEach((rule) => {
      const category = rule.category || "DISCIPLINE";
      if (grouped[category]) {
        grouped[category].push(rule);
      }
    });

    return grouped;
  }, [rules]);

  // Get available templates (not already added)
  const getAvailableTemplates = (category: RuleCategory) => {
    return RULE_TEMPLATES.filter((template) => {
      if (template.category !== category) return false;
      // Check if rule already exists
      const existing = rules.find((r) => r.type === template.type);
      return !existing;
    });
  };

  const toggleCategory = (category: RuleCategory) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSelectTemplate = (template: RuleTemplate) => {
    setSelectedTemplate(template);
    setRuleValue(template.defaultValue);
    setValueType(template.valueType || "ABSOLUTE");

    // For time rules, convert minutes to time string
    if (
      template.type === "NO_TRADING_BEFORE" ||
      template.type === "NO_TRADING_AFTER"
    ) {
      setTimeValue(formatTimeValue(template.defaultValue));
    }
  };

  const handleAddRule = async () => {
    if (!selectedTemplate) return;

    // For time rules, convert time to minutes
    let finalValue = ruleValue;
    if (
      selectedTemplate.type === "NO_TRADING_BEFORE" ||
      selectedTemplate.type === "NO_TRADING_AFTER"
    ) {
      finalValue = parseTimeValue(timeValue);
    }

    // For boolean rules, value is always 1
    if (BOOLEAN_RULES.includes(selectedTemplate.type)) {
      finalValue = 1;
    }

    const description =
      selectedTemplate.valueType === "PERCENTAGE"
        ? `${selectedTemplate.name}: ${finalValue}% of account`
        : selectedTemplate.type.includes("TRADING_BEFORE") ||
          selectedTemplate.type.includes("TRADING_AFTER")
        ? `${selectedTemplate.name}: ${timeValue}`
        : BOOLEAN_RULES.includes(selectedTemplate.type)
        ? selectedTemplate.name
        : `${selectedTemplate.name}: ${finalValue} ${selectedTemplate.unit}`;

    try {
      setIsSubmitting(true);
      await addRule({
        type: selectedTemplate.type,
        category: selectedTemplate.category,
        value: finalValue,
        valueType: selectedTemplate.valueType,
        isActive: true,
        description,
      });

      toast({
        title: "Guardrail added",
        description: "Your trading guardrail has been successfully added.",
      });

      resetDialog();
    } catch (error) {
      toast({
        title: "Failed to add guardrail",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while adding the guardrail.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setIsAddingRule(false);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setRuleValue(0);
    setTimeValue("09:30");
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      setTogglingRuleId(id);
      await updateRule(id, { isActive: !isActive });
      toast({
        title: "Guardrail updated",
        description: `Guardrail has been ${
          !isActive ? "activated" : "deactivated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Failed to update guardrail",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setTogglingRuleId(null);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to remove this guardrail?")) return;

    try {
      setDeletingRuleId(id);
      await deleteRule(id);
      toast({
        title: "Guardrail removed",
        description: "Your trading guardrail has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove guardrail",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingRuleId(null);
    }
  };

  const getTemplateForRule = (rule: TradingRule) => {
    return RULE_TEMPLATES.find((t) => t.type === rule.type);
  };

  const formatRuleValue = (rule: TradingRule) => {
    const template = getTemplateForRule(rule);
    if (!template) return rule.value.toString();

    if (rule.type === "NO_TRADING_BEFORE" || rule.type === "NO_TRADING_AFTER") {
      return formatTimeValue(rule.value);
    }

    if (BOOLEAN_RULES.includes(rule.type)) {
      return rule.isActive ? "Enabled" : "Disabled";
    }

    if (rule.valueType === "PERCENTAGE") {
      return `${rule.value}%`;
    }

    return `${rule.value} ${template.unit}`;
  };

  const renderCategorySection = (category: RuleCategory) => {
    const categoryRules = rulesByCategory[category];
    const availableTemplates = getAvailableTemplates(category);
    const isExpanded = expandedCategories[category];

    return (
      <div key={category} className="mb-6">
        {/* Category Header */}
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors mb-2"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", CATEGORY_BG[category])}>
              <CategoryIcon
                category={category}
                className={cn("w-5 h-5", CATEGORY_COLORS[category])}
              />
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-foreground">
                {CATEGORY_LABELS[category]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {categoryRules.length} active rule
                {categoryRules.length !== 1 ? "s" : ""}
                {availableTemplates.length > 0 &&
                  ` · ${availableTemplates.length} available`}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Category Content */}
        {isExpanded && (
          <div className="space-y-3 pl-4">
            {/* Existing Rules */}
            {categoryRules.map((rule) => {
              const template = getTemplateForRule(rule);
              return (
                <div
                  key={rule.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    rule.isActive
                      ? "bg-card border-border"
                      : "bg-muted/30 border-muted"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-foreground">
                          {template?.name || rule.type}
                        </h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded font-medium",
                            rule.isActive
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {formatRuleValue(rule)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template?.explanation || rule.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() =>
                            handleToggleRule(rule.id, rule.isActive)
                          }
                          disabled={togglingRuleId === rule.id}
                        />
                        <Label className="text-sm text-muted-foreground">
                          {togglingRuleId === rule.id ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Updating...
                            </span>
                          ) : rule.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </Label>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={deletingRuleId === rule.id}
                      className="ml-4 p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      aria-label="Delete rule"
                    >
                      {deletingRuleId === rule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Rule Button for this category */}
            {availableTemplates.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setIsAddingRule(true);
                }}
                className="w-full p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 hover:bg-accent/30 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4" />
                <span>Add {CATEGORY_LABELS[category]} Rule</span>
              </button>
            )}

            {/* Empty State */}
            {categoryRules.length === 0 && availableTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All rules in this category have been added
              </p>
            )}
          </div>
        )}
      </div>
    );
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
          <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              These guardrails exist to protect you during emotional moments —
              not to restrict you. When you are in the heat of trading, your
              future self will thank you for these boundaries.
            </p>
          </div>
        </header>

        {/* Loading State */}
        {isLoadingRules ? (
          <div className="card-calm text-center py-12">
            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading guardrails...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {(
                ["RISK", "DISCIPLINE", "TIMING", "PSYCHOLOGY"] as RuleCategory[]
              ).map((category) => (
                <div
                  key={category}
                  className={cn(
                    "p-4 rounded-lg border text-center",
                    rulesByCategory[category].filter((r) => r.isActive).length >
                      0
                      ? CATEGORY_BG[category]
                      : "bg-muted/30"
                  )}
                >
                  <CategoryIcon
                    category={category}
                    className={cn(
                      "w-5 h-5 mx-auto mb-2",
                      rulesByCategory[category].filter((r) => r.isActive)
                        .length > 0
                        ? CATEGORY_COLORS[category]
                        : "text-muted-foreground"
                    )}
                  />
                  <p className="text-2xl font-bold">
                    {rulesByCategory[category].filter((r) => r.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[category].split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>

            {/* Rules by Category */}
            {(
              ["RISK", "DISCIPLINE", "TIMING", "PSYCHOLOGY"] as RuleCategory[]
            ).map(renderCategorySection)}

            {/* Empty State */}
            {rules.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">
                  No guardrails set yet
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on any category above to add your first trading rule
                </p>
              </div>
            )}
          </>
        )}

        {/* Add Rule Dialog */}
        <Dialog
          open={isAddingRule}
          onOpenChange={(open) => !open && resetDialog()}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCategory && (
                  <>
                    <CategoryIcon
                      category={selectedCategory}
                      className={cn(
                        "w-5 h-5",
                        CATEGORY_COLORS[selectedCategory]
                      )}
                    />
                    Add {CATEGORY_LABELS[selectedCategory]} Rule
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Choose a rule to protect yourself during emotional moments
              </DialogDescription>
            </DialogHeader>

            {/* Template Selection */}
            {!selectedTemplate && selectedCategory && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {getAvailableTemplates(selectedCategory).map((template) => (
                  <button
                    key={template.type}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full p-4 rounded-lg border hover:border-primary hover:bg-accent/30 transition-all text-left"
                  >
                    <h3 className="font-medium text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-primary">
                      {template.explanation}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Rule Configuration */}
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/30">
                  <h3 className="font-medium text-foreground mb-1">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.explanation}
                  </p>
                </div>

                {/* Value Input - Only show for non-boolean rules */}
                {!BOOLEAN_RULES.includes(selectedTemplate.type) && (
                  <div className="space-y-2">
                    {/* Time Input */}
                    {selectedTemplate.type === "NO_TRADING_BEFORE" ||
                    selectedTemplate.type === "NO_TRADING_AFTER" ? (
                      <>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={timeValue}
                          onChange={(e) => setTimeValue(e.target.value)}
                        />
                      </>
                    ) : (
                      <>
                        {/* Percentage/Absolute Toggle */}
                        {selectedTemplate.valueType && (
                          <div className="flex gap-2 mb-2">
                            <Button
                              type="button"
                              variant={
                                valueType === "PERCENTAGE"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setValueType("PERCENTAGE")}
                            >
                              Percentage
                            </Button>
                            <Button
                              type="button"
                              variant={
                                valueType === "ABSOLUTE" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setValueType("ABSOLUTE")}
                            >
                              Absolute (₹)
                            </Button>
                          </div>
                        )}
                        <Label>
                          {selectedTemplate.valueType
                            ? valueType === "PERCENTAGE"
                              ? "Percentage (%)"
                              : "Amount (₹)"
                            : `Value (${selectedTemplate.unit})`}
                        </Label>
                        <Input
                          type="number"
                          value={ruleValue}
                          onChange={(e) => setRuleValue(Number(e.target.value))}
                          placeholder="Enter value"
                          min="0"
                          step={valueType === "PERCENTAGE" ? "0.1" : "100"}
                        />
                        {valueType === "PERCENTAGE" && profile?.accountSize && (
                          <p className="text-xs text-muted-foreground">
                            ={" "}
                            {formatCurrency(
                              (ruleValue / 100) * profile.accountSize
                            )}{" "}
                            of your account
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Boolean Rule Info */}
                {BOOLEAN_RULES.includes(selectedTemplate.type) && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success">
                      This rule will be enabled when you add it. You can toggle
                      it on/off anytime.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setSelectedTemplate(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleAddRule}
                    disabled={
                      isSubmitting ||
                      (!BOOLEAN_RULES.includes(selectedTemplate.type) &&
                        selectedTemplate.type !== "NO_TRADING_BEFORE" &&
                        selectedTemplate.type !== "NO_TRADING_AFTER" &&
                        ruleValue <= 0)
                    }
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Guardrail"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
