import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  UserProfile,
  TradingRule,
  DailyRuleStatus,
  RuleStatus,
  mockUserProfile,
} from "@/lib/mockData";
import { useTrades } from "./TradeContext";
import { profileApi, UserProfileResponse } from "@/api/profile";
import { rulesApi, RuleResponse } from "@/api/rules";
import { useAuth } from "@/auth/auth.context";

interface RulesContextType {
  profile: UserProfile | null;
  rules: TradingRule[];
  dailyStatus: DailyRuleStatus[];
  isLoadingProfile: boolean;
  isLoadingRules: boolean;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addRule: (rule: Omit<TradingRule, "id">) => Promise<void>;
  updateRule: (id: string, updates: Partial<TradingRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const { getClosedTrades } = useTrades();
  const { isAuthenticated } = useAuth();

  // Fetch profile and rules from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadRules();
    } else {
      setIsLoadingProfile(false);
      setIsLoadingRules(false);
    }
  }, [isAuthenticated]);

  const loadProfile = async (): Promise<void> => {
    try {
      setIsLoadingProfile(true);
      const userProfile = await profileApi.getProfile();

      // Map API response to UserProfile format
      const mappedProfile: UserProfile = {
        name: userProfile.name || "",
        experienceLevel: userProfile.experienceLevel || "INTERMEDIATE",
        accountSize: userProfile.accountSize || 100000,
        tradingStyle: userProfile.tradingStyle || "MIXED",
      };

      setProfile(mappedProfile);
    } catch (error) {
      console.error("Failed to load profile:", error);
      // Set default profile on error
      setProfile(mockUserProfile);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateProfile = async (newProfile: UserProfile): Promise<void> => {
    try {
      // Update via API
      const updated = await profileApi.updateProfile({
        name: newProfile.name,
        experienceLevel: newProfile.experienceLevel,
        accountSize: newProfile.accountSize,
        tradingStyle: newProfile.tradingStyle,
      });

      // Map API response to UserProfile format
      const mappedProfile: UserProfile = {
        name: updated.name || "",
        experienceLevel: updated.experienceLevel || "INTERMEDIATE",
        accountSize: updated.accountSize || 100000,
        tradingStyle: updated.tradingStyle || "MIXED",
      };

      setProfile(mappedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const loadRules = async (): Promise<void> => {
    try {
      setIsLoadingRules(true);
      const rulesData = await rulesApi.getRules();

      // Map API response to TradingRule format
      const mappedRules: TradingRule[] = rulesData.map(
        (rule: RuleResponse) => ({
          id: rule.id,
          type: rule.type,
          category: rule.category,
          value: rule.value,
          valueType: rule.valueType,
          isActive: rule.isActive,
          description: rule.description,
          isCustom: rule.isCustom,
          customName: rule.customName,
          disabledUntil: rule.disabledUntil,
          disableReason: rule.disableReason,
        })
      );

      setRules(mappedRules);
    } catch (error) {
      console.error("Failed to load rules:", error);
      // Set empty array on error
      setRules([]);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const addRule = async (ruleData: Omit<TradingRule, "id">): Promise<void> => {
    try {
      const created = await rulesApi.createRule({
        type: ruleData.type,
        value: ruleData.value,
        valueType: ruleData.valueType,
        isActive: ruleData.isActive ?? true,
        description: ruleData.description,
      });

      // Map API response to TradingRule format
      const newRule: TradingRule = {
        id: created.id,
        type: created.type,
        category: created.category,
        value: created.value,
        valueType: created.valueType,
        isActive: created.isActive,
        description: created.description,
        isCustom: created.isCustom,
        customName: created.customName,
      };

      setRules((prev) => [...prev, newRule]);
    } catch (error) {
      console.error("Failed to create rule:", error);
      throw error;
    }
  };

  const updateRule = async (
    id: string,
    updates: Partial<TradingRule>
  ): Promise<void> => {
    try {
      const updated = await rulesApi.updateRule(id, {
        value: updates.value,
        valueType: updates.valueType,
        isActive: updates.isActive,
        description: updates.description,
      });

      // Map API response to TradingRule format
      const updatedRule: TradingRule = {
        id: updated.id,
        type: updated.type,
        category: updated.category,
        value: updated.value,
        valueType: updated.valueType,
        isActive: updated.isActive,
        description: updated.description,
        isCustom: updated.isCustom,
        customName: updated.customName,
        disabledUntil: updated.disabledUntil,
        disableReason: updated.disableReason,
      };

      setRules((prev) =>
        prev.map((rule) => (rule.id === id ? updatedRule : rule))
      );
    } catch (error) {
      console.error("Failed to update rule:", error);
      throw error;
    }
  };

  const deleteRule = async (id: string): Promise<void> => {
    try {
      await rulesApi.deleteRule(id);
      setRules((prev) => prev.filter((rule) => rule.id !== id));
    } catch (error) {
      console.error("Failed to delete rule:", error);
      throw error;
    }
  };

  const closedTrades = getClosedTrades();

  const dailyStatus = useMemo((): DailyRuleStatus[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrades = closedTrades.filter((trade) => {
      if (!trade.closedAt) return false;
      const tradeDate = new Date(trade.closedAt);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === today.getTime();
    });

    const losingTrades = todayTrades.filter((t) => t.result === "loss");
    const totalLoss = todayTrades
      .filter((t) => t.result === "loss")
      .reduce((sum, t) => sum + (t.riskComfort || 0), 0);

    // Calculate total profit from today's trades
    const totalProfit = todayTrades
      .filter((t) => t.profitLoss !== undefined)
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    return rules
      .filter((rule) => rule.isActive)
      .map((rule) => {
        if (rule.type === "DAILY_LOSS") {
          const limitValue =
            rule.valueType === "PERCENTAGE"
              ? (profile?.accountSize || 100000) * (rule.value / 100)
              : rule.value;
          const remaining = Math.max(0, limitValue - totalLoss);
          const status: RuleStatus =
            remaining === 0
              ? "BREACHED"
              : remaining <= limitValue * 0.2
              ? "WARNING"
              : "SAFE";

          return {
            ruleId: rule.id,
            currentValue: totalLoss,
            limitValue,
            remainingValue: remaining,
            status,
          };
        }

        if (rule.type === "DAILY_TARGET") {
          const targetValue =
            rule.valueType === "PERCENTAGE"
              ? (profile?.accountSize || 100000) * (rule.value / 100)
              : rule.value;
          const remaining = Math.max(0, targetValue - totalProfit);
          const status: RuleStatus =
            remaining === 0
              ? "BREACHED"
              : remaining <= targetValue * 0.2
              ? "WARNING"
              : "SAFE";

          return {
            ruleId: rule.id,
            currentValue: totalProfit,
            limitValue: targetValue,
            remainingValue: remaining,
            status,
          };
        }

        if (rule.type === "MAX_LOSING_TRADES") {
          const remaining = Math.max(0, rule.value - losingTrades.length);
          const status: RuleStatus =
            remaining === 0 ? "BREACHED" : remaining === 1 ? "WARNING" : "SAFE";

          return {
            ruleId: rule.id,
            currentValue: losingTrades.length,
            limitValue: rule.value,
            remainingValue: remaining,
            status,
          };
        }

        // For other rule types, return safe status
        return {
          ruleId: rule.id,
          currentValue: 0,
          limitValue: rule.value,
          remainingValue: rule.value,
          status: "SAFE" as RuleStatus,
        };
      });
  }, [rules, profile, closedTrades]);

  return (
    <RulesContext.Provider
      value={{
        profile,
        rules,
        dailyStatus,
        isLoadingProfile,
        isLoadingRules,
        updateProfile,
        addRule,
        updateRule,
        deleteRule,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
}
