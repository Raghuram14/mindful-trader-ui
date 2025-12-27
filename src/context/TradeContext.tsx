import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Trade } from '@/lib/mockData';
import { tradesApi, TradeResponse } from '@/api/trades';
import { useAuth } from '@/auth/auth.context';

interface TradeContextType {
  trades: Trade[];
  isLoading: boolean;
  loadTrades: () => Promise<void>;
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  closeTrade: (id: string, exitReason: Trade['exitReason'], exitPrice: number, exitNote?: string) => Promise<void>;
  updateTradeEmotion: (id: string, emotion: 'fear' | 'neutral' | 'confident') => Promise<void>;
  getOpenTrades: () => Trade[];
  getClosedTrades: () => Trade[];
  getTradeById: (id: string) => Trade | undefined;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadTrades = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const tradesData = await tradesApi.getTrades();
      
      // Map API response to Trade format
      const mappedTrades: Trade[] = tradesData.map((trade: TradeResponse) => ({
        id: trade.id,
        instrumentType: trade.instrumentType,
        symbol: trade.symbol,
        optionType: trade.optionType,
        tradeDate: trade.tradeDate,
        tradeTime: trade.tradeTime,
        type: trade.type,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        plannedStop: trade.plannedStop,
        plannedTarget: trade.plannedTarget,
        confidence: trade.confidence,
        riskComfort: trade.riskComfort,
        reason: trade.reason,
        status: trade.status,
        exitReason: trade.exitReason,
        exitPrice: trade.exitPrice,
        profitLoss: trade.profitLoss,
        exitNote: trade.exitNote,
        result: trade.result,
        emotions: trade.emotions,
        createdAt: new Date(trade.createdAt),
        closedAt: trade.closedAt ? new Date(trade.closedAt) : undefined,
        source: trade.source,
        dataCompleteness: trade.dataCompleteness,
      }));
      
      setTrades(mappedTrades);
    } catch (error) {
      console.error('Failed to load trades:', error);
      // Set empty array on error
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load trades from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTrades();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadTrades]);

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt' | 'status'>): Promise<void> => {
    try {
      const created = await tradesApi.createTrade({
        instrumentType: tradeData.instrumentType,
        symbol: tradeData.symbol,
        optionType: tradeData.optionType,
        tradeDate: tradeData.tradeDate,
        tradeTime: tradeData.tradeTime,
        type: tradeData.type,
        quantity: tradeData.quantity,
        entryPrice: tradeData.entryPrice,
        plannedStop: tradeData.plannedStop,
        plannedTarget: tradeData.plannedTarget,
        confidence: tradeData.confidence,
        riskComfort: tradeData.riskComfort,
        reason: tradeData.reason,
      });

      // Map API response to Trade format
      const newTrade: Trade = {
        id: created.id,
        instrumentType: created.instrumentType,
        symbol: created.symbol,
        optionType: created.optionType,
        tradeDate: created.tradeDate,
        tradeTime: created.tradeTime,
        type: created.type,
        quantity: created.quantity,
        entryPrice: created.entryPrice,
        plannedStop: created.plannedStop,
        plannedTarget: created.plannedTarget,
        confidence: created.confidence,
        riskComfort: created.riskComfort,
        reason: created.reason,
        status: created.status,
        exitReason: created.exitReason,
        exitPrice: created.exitPrice,
        profitLoss: created.profitLoss,
        exitNote: created.exitNote,
        result: created.result,
        emotions: created.emotions,
        createdAt: new Date(created.createdAt),
        closedAt: created.closedAt ? new Date(created.closedAt) : undefined,
      };

      setTrades(prev => [newTrade, ...prev]);
      
      // Emit event for coaching refresh
      window.dispatchEvent(new CustomEvent('trade-created', { detail: { trade: newTrade } }));
    } catch (error) {
      console.error('Failed to create trade:', error);
      throw error;
    }
  };

  const closeTrade = async (id: string, exitReason: Trade['exitReason'], exitPrice: number, exitNote?: string): Promise<void> => {
    try {
      const closed = await tradesApi.closeTrade(id, {
        exitReason,
        exitPrice,
        exitNote,
      });

      // Map API response to Trade format
      const closedTrade: Trade = {
        id: closed.id,
        instrumentType: closed.instrumentType,
        symbol: closed.symbol,
        optionType: closed.optionType,
        tradeDate: closed.tradeDate,
        tradeTime: closed.tradeTime,
        type: closed.type,
        quantity: closed.quantity,
        entryPrice: closed.entryPrice,
        plannedStop: closed.plannedStop,
        plannedTarget: closed.plannedTarget,
        confidence: closed.confidence,
        riskComfort: closed.riskComfort,
        reason: closed.reason,
        status: closed.status,
        exitReason: closed.exitReason,
        exitPrice: closed.exitPrice,
        profitLoss: closed.profitLoss,
        exitNote: closed.exitNote,
        result: closed.result,
        emotions: closed.emotions,
        createdAt: new Date(closed.createdAt),
        closedAt: closed.closedAt ? new Date(closed.closedAt) : undefined,
      };

      setTrades(prev =>
        prev.map(trade => (trade.id === id ? closedTrade : trade))
      );
      
      // Emit event for coaching refresh (especially important for losses)
      window.dispatchEvent(new CustomEvent('trade-closed', { 
        detail: { 
          trade: closedTrade,
          isLoss: closedTrade.result === 'loss'
        } 
      }));
    } catch (error) {
      console.error('Failed to close trade:', error);
      throw error;
    }
  };

  const updateTradeEmotion = async (id: string, emotion: 'fear' | 'neutral' | 'confident'): Promise<void> => {
    try {
      const trade = trades.find(t => t.id === id);
      if (!trade) {
        throw new Error('Trade not found');
      }

      const emotions = trade.emotions || [];
      if (!emotions.includes(emotion)) {
        const updatedEmotions = [...emotions, emotion];
        const updated = await tradesApi.updateTrade(id, {
          emotions: updatedEmotions,
        });

        // Map API response to Trade format
        const updatedTrade: Trade = {
          id: updated.id,
          instrumentType: updated.instrumentType,
          symbol: updated.symbol,
          optionType: updated.optionType,
          tradeDate: updated.tradeDate,
          tradeTime: updated.tradeTime,
          type: updated.type,
          quantity: updated.quantity,
          entryPrice: updated.entryPrice,
          plannedStop: updated.plannedStop,
          plannedTarget: updated.plannedTarget,
          confidence: updated.confidence,
          riskComfort: updated.riskComfort,
          reason: updated.reason,
          status: updated.status,
          exitReason: updated.exitReason,
          exitPrice: updated.exitPrice,
          profitLoss: updated.profitLoss,
          exitNote: updated.exitNote,
          result: updated.result,
          emotions: updated.emotions,
          createdAt: new Date(updated.createdAt),
          closedAt: updated.closedAt ? new Date(updated.closedAt) : undefined,
        };

        setTrades(prev =>
          prev.map(t => (t.id === id ? updatedTrade : t))
        );
      }
    } catch (error) {
      console.error('Failed to update trade emotion:', error);
      throw error;
    }
  };

  const getOpenTrades = () => trades.filter(t => t.status === 'open');
  const getClosedTrades = () => trades.filter(t => t.status === 'closed');
  const getTradeById = (id: string) => trades.find(t => t.id === id);

  return (
    <TradeContext.Provider
      value={{
        trades,
        isLoading,
        loadTrades,
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
