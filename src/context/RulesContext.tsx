import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { 
  UserProfile, 
  TradingRule, 
  DailyRuleStatus, 
  RuleStatus,
  mockUserProfile,
  mockTradingRules,
} from '@/lib/mockData';
import { useTrades } from './TradeContext';
import { profileApi, UserProfileResponse } from '@/api/profile';
import { useAuth } from '@/auth/auth.context';

interface RulesContextType {
  profile: UserProfile | null;
  rules: TradingRule[];
  dailyStatus: DailyRuleStatus[];
  isLoadingProfile: boolean;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addRule: (rule: Omit<TradingRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<TradingRule>) => void;
  deleteRule: (id: string) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [rules, setRules] = useState<TradingRule[]>(mockTradingRules);
  const { getClosedTrades } = useTrades();
  const { isAuthenticated } = useAuth();

  // Fetch profile from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated]);

  const loadProfile = async (): Promise<void> => {
    try {
      setIsLoadingProfile(true);
      const userProfile = await profileApi.getProfile();
      
      // Map API response to UserProfile format
      const mappedProfile: UserProfile = {
        name: userProfile.name || '',
        experienceLevel: userProfile.experienceLevel || 'INTERMEDIATE',
        accountSize: userProfile.accountSize || 100000,
        tradingStyle: userProfile.tradingStyle || 'MIXED',
      };
      
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
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
        name: updated.name || '',
        experienceLevel: updated.experienceLevel || 'INTERMEDIATE',
        accountSize: updated.accountSize || 100000,
        tradingStyle: updated.tradingStyle || 'MIXED',
      };

      setProfile(mappedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
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

  const dailyStatus = useMemo((): DailyRuleStatus[] => {
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
  }, [rules, profile, closedTrades]);

  return (
    <RulesContext.Provider
      value={{
        profile,
        rules,
        dailyStatus,
        isLoadingProfile,
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
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
}

