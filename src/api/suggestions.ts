import { apiClient } from './client';

export interface CreateSuggestionRequest {
  category: string;
  userExperience?: string;
  usefulnessRating?: number;
  enhancements?: string;
  additionalFeedback?: string;
}

export interface SuggestionResponse {
  id: string;
  userId: string;
  category: string;
  userExperience?: string;
  usefulnessRating?: number;
  enhancements?: string;
  additionalFeedback?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const suggestionsApi = {
  create: (data: CreateSuggestionRequest) => {
    return apiClient.post<SuggestionResponse>('/suggestions', data);
  },

  getUserSuggestions: () => {
    return apiClient.get<SuggestionResponse[]>('/suggestions/my-suggestions');
  },

  getAll: (limit?: number, skip?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<{ suggestions: SuggestionResponse[]; total: number; limit: number; skip: number }>(`/suggestions${queryString}`);
  },

  getById: (id: string) => {
    return apiClient.get<SuggestionResponse>(`/suggestions/${id}`);
  },

  updateStatus: (id: string, status: string) => {
    return apiClient.patch<SuggestionResponse>(`/suggestions/${id}/status`, { status });
  },
};
