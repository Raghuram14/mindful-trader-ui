import { apiClient } from './client';
import { UserProfile } from '@/lib/mockData';

export interface UserProfileResponse {
  email: string;
  name: string;
  experienceLevel?: UserProfile['experienceLevel'];
  accountSize?: number;
  tradingStyle?: UserProfile['tradingStyle'];
}

export interface UpdateProfileRequest {
  name?: string;
  experienceLevel?: UserProfile['experienceLevel'];
  accountSize?: number;
  tradingStyle?: UserProfile['tradingStyle'];
}

export const profileApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    return apiClient.get<UserProfileResponse>('/user/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    return apiClient.patch<UserProfileResponse>('/user/profile', data);
  },
};

