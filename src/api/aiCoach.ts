/**
 * AI Coach API Client
 * 
 * Handles communication with the AI coach backend.
 * Supports SSE streaming for real-time responses.
 */

import { authService } from '@/auth/auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Message types
export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// SSE event types
export interface StreamToken {
  type: 'token';
  content: string;
}

export interface StreamComplete {
  type: 'complete';
  content: string;
}

export interface StreamError {
  type: 'error';
  message: string;
}

export type StreamEvent = StreamToken | StreamComplete | StreamError;

// Status response
export interface CoachStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
}

// History response
export interface CoachHistory {
  messages: CoachMessage[];
}

// Starter prompts
export const STARTER_PROMPTS = [
  "What patterns do you notice in my recent trades?",
  "Why might I be breaking my rules?",
  "How do I usually trade after losses?",
  "What should I be mindful of today?",
];

/**
 * Ask the coach a question with streaming response
 */
export async function askCoach(
  question: string,
  callbacks: {
    onToken: (token: string) => void;
    onComplete: (response: string) => void;
    onError: (error: string) => void;
  }
): Promise<void> {
  const token = authService.getToken();
  
  if (!token) {
    callbacks.onError('Authentication required');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai-coach/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      callbacks.onError(errorData.message || 'Failed to connect to coach');
      return;
    }

    if (!response.body) {
      callbacks.onError('No response stream');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const event: StreamEvent = JSON.parse(data);
            
            switch (event.type) {
              case 'token':
                callbacks.onToken(event.content);
                break;
              case 'complete':
                callbacks.onComplete(event.content);
                break;
              case 'error':
                callbacks.onError(event.message);
                break;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError(
      error instanceof Error ? error.message : 'Connection failed'
    );
  }
}

/**
 * Get conversation history
 */
export async function getCoachHistory(): Promise<CoachHistory> {
  const token = authService.getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/ai-coach/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Clear conversation history
 */
export async function clearCoachHistory(): Promise<void> {
  const token = authService.getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/ai-coach/history`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear history');
  }
}

/**
 * Get rate limit status
 */
export async function getCoachStatus(): Promise<CoachStatus> {
  const token = authService.getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/ai-coach/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }

  const data = await response.json();
  return data.data;
}
