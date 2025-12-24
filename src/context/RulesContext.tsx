import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { 
  UserProfile, 
  TradingRule, 
  DailyRuleStatus, 
  RuleStatus,
  mockUserProfile,
  mockTradingRules,
} from '@/lib/mockData';
import { useTrades } from './TradeContext';

interface RulesContextType {
  profile: UserProfile | null;
  rules: TradingRule[];
  dailyStatus: DailyRuleStatus[];
  updateProfile: (profile: UserProfile) => void;
  addRule: (rule: Omit<TradingRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<TradingRule>) => void;
  deleteRule: (id: string) => void;
  getDailyStatus: () => DailyRuleStatus[];
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(mockUserProfile);
  const [rules, setRules] = useState<TradingRule[]>(mockTradingRules);
  const { getClosedTrades } = useTrades();

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const addRule = (ruleData: Omit<TradingRule, 'id'>) => {
    const newRule: TradingRule = {
      ...ruleData,
      id: Date.now().toString(),
    };
    setRules(prev => [...prev, newRule]);
  };

  const updateRule = (id: string, updates: Partial<TradingRule>) => {
    setRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const closedTrades = getClosedTrades();

  const getDailyStatus = (): DailyRuleStatus[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrades = closedTrades.filter(trade => {
      if (!trade.closedAt) return false;
      const tradeDate = new Date(trade.closedAt);
      tradeDate.setHours(0, 0, 0, 0);
      return tradeDate.getTime() === today.getTime();
    });

    const losingTrades = todayTrades.filter(t => t.result === 'loss');
    const totalLoss = todayTrades
      .filter(t => t.result === 'loss')
      .reduce((sum, t) => sum + (t.riskComfort || 0), 0);

    return rules
      .filter(rule => rule.isActive)
      .map(rule => {
        if (rule.type === 'DAILY_LOSS') {
          const limitValue = rule.valueType === 'PERCENTAGE'
            ? (profile?.accountSize || 100000) * (rule.value / 100)
            : rule.value;
          const remaining = Math.max(0, limitValue - totalLoss);
          const status: RuleStatus = 
            remaining === 0 ? 'BREACHED' :
            remaining <= limitValue * 0.2 ? 'WARNING' : 'SAFE';
          
          return {
            ruleId: rule.id,
            currentValue: totalLoss,
            limitValue,
            remainingValue: remaining,
            status,
          };
        }

        if (rule.type === 'MAX_LOSING_TRADES') {
          const remaining = Math.max(0, rule.value - losingTrades.length);
          const status: RuleStatus = 
            remaining === 0 ? 'BREACHED' :
            remaining === 1 ? 'WARNING' : 'SAFE';
          
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
          status: 'SAFE' as RuleStatus,
        };
      });
  };

  const dailyStatus = useMemo(() => getDailyStatus(), [rules, profile, closedTrades]);

  return (
    <RulesContext.Provider
      value={{
        profile,
        rules,
        dailyStatus,
        updateProfile,
        addRule,
        updateRule,
        deleteRule,
        getDailyStatus,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
}

