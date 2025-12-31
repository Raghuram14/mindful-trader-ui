/**
 * Coach Panel - AI Behavioral Coach Interface
 *
 * A calm, focused interface for asking behavioral questions.
 * NOT a chat interface - more like a reflection tool.
 *
 * Features:
 * - Single input with brief responses
 * - Starter prompts for guidance
 * - Last 3 exchanges for context
 * - Streaming responses
 * - Mobile-full, desktop-partial overlay
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  askCoach,
  getCoachHistory,
  clearCoachHistory,
  getCoachStatus,
  STARTER_PROMPTS,
  type CoachMessage,
  type CoachStatus,
} from "@/api/aiCoach";

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachPanel({ isOpen, onClose }: CoachPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history and status on open
  useEffect(() => {
    if (isOpen) {
      loadHistoryAndStatus();
    }
  }, [isOpen]);

  const loadHistoryAndStatus = async () => {
    setIsLoadingHistory(true);
    try {
      const [historyData, statusData] = await Promise.all([
        getCoachHistory(),
        getCoachStatus(),
      ]);
      setMessages(historyData.messages);
      setStatus(statusData);
    } catch (err) {
      console.error("Failed to load coach data:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingResponse]);

  // Handle asking a question
  const handleAsk = useCallback(
    async (q?: string) => {
      const questionToAsk = q || question.trim();
      if (!questionToAsk || isStreaming) return;

      setError(null);
      setQuestion("");
      setIsStreaming(true);
      setStreamingResponse("");

      // Optimistically add user message
      const userMessage: CoachMessage = {
        role: "user",
        content: questionToAsk,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      await askCoach(questionToAsk, {
        onToken: (token) => {
          setStreamingResponse((prev) => prev + token);
        },
        onComplete: (response) => {
          setStreamingResponse("");
          const assistantMessage: CoachMessage = {
            role: "assistant",
            content: response,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsStreaming(false);

          // Update remaining questions
          if (status) {
            setStatus({
              ...status,
              remaining: Math.max(0, status.remaining - 1),
            });
          }
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setStreamingResponse("");
          setIsStreaming(false);
          // Remove optimistic user message on error
          setMessages((prev) => prev.slice(0, -1));
        },
      });
    },
    [question, isStreaming, status]
  );

  // Handle clear conversation
  const handleClear = async () => {
    try {
      await clearCoachHistory();
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed z-50",
          // Mobile: full screen from bottom
          "inset-x-0 bottom-0 h-[85vh]",
          // Desktop: partial overlay on right
          "md:inset-auto md:right-6 md:bottom-24 md:w-[420px] md:h-[600px] md:max-h-[80vh]",
          // Styling
          "bg-card rounded-t-2xl md:rounded-2xl",
          "shadow-2xl border border-border",
          "flex flex-col",
          // Animation
          "animate-in slide-in-from-bottom duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Behavioral Coach</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea
          className="flex-1 px-5"
          ref={scrollRef as React.RefObject<HTMLDivElement>}
        >
          <div className="py-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 && !streamingResponse ? (
              // Empty state with starter prompts
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I'm here to help you understand your trading patterns.
                    <br />
                    <span className="text-xs">
                      Not trading advice — just behavioral reflection.
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Try asking
                  </p>
                  <div className="space-y-2">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAsk(prompt)}
                        disabled={isStreaming}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg",
                          "text-sm text-foreground/80",
                          "bg-muted/50 hover:bg-muted",
                          "transition-colors duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Conversation history
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}

                {/* Streaming response */}
                {streamingResponse && (
                  <Card className="bg-muted/30 border-0">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {streamingResponse}
                        <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/60 animate-pulse" />
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-5 py-4 border-t border-border space-y-3">
          {/* Rate limit indicator */}
          {status && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {status.remaining > 0
                  ? `${status.remaining} questions remaining today`
                  : "Daily limit reached — rest and reflect"}
              </span>
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your patterns..."
              disabled={isStreaming || status?.remaining === 0}
              className={cn(
                "flex-1 min-h-[44px] max-h-[120px] resize-none",
                "text-sm placeholder:text-muted-foreground/60"
              )}
              rows={1}
            />
            <Button
              onClick={() => handleAsk()}
              disabled={
                !question.trim() || isStreaming || status?.remaining === 0
              }
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: CoachMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-4 py-3 rounded-xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted/50 text-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
