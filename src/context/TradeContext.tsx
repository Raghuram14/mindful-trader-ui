import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Trade, mockTrades } from '@/lib/mockData';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'status'>) => void;
  closeTrade: (id: string, exitReason: Trade['exitReason'], exitNote?: string) => void;
  updateTradeEmotion: (id: string, emotion: 'fear' | 'neutral' | 'confident') => void;
  getOpenTrades: () => Trade[];
  getClosedTrades: () => Trade[];
  getTradeById: (id: string) => Trade | undefined;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);

  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt' | 'status'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'open',
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const closeTrade = (id: string, exitReason: Trade['exitReason'], exitNote?: string) => {
    setTrades(prev =>
      prev.map(trade => {
        if (trade.id === id) {
          const isWin = exitReason === 'target';
          return {
            ...trade,
            status: 'closed' as const,
            exitReason,
            exitNote,
            result: isWin ? 'win' as const : 'loss' as const,
            closedAt: new Date(),
          };
        }
        return trade;
      })
    );
  };

  const updateTradeEmotion = (id: string, emotion: 'fear' | 'neutral' | 'confident') => {
    setTrades(prev =>
      prev.map(trade => {
        if (trade.id === id) {
          const emotions = trade.emotions || [];
          if (!emotions.includes(emotion)) {
            return { ...trade, emotions: [...emotions, emotion] };
          }
        }
        return trade;
      })
    );
  };

  const getOpenTrades = () => trades.filter(t => t.status === 'open');
  const getClosedTrades = () => trades.filter(t => t.status === 'closed');
  const getTradeById = (id: string) => trades.find(t => t.id === id);

  return (
    <TradeContext.Provider
      value={{
        trades,
        addTrade,
        closeTrade,
        updateTradeEmotion,
        getOpenTrades,
        getClosedTrades,
        getTradeById,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
}
