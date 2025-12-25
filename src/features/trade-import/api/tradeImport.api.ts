/**
 * Trade Import API Client
 */

import { authService } from '@/auth/auth.service';
import { ImportRequest, ImportResponse } from '../types/tradeImport.types';

export const tradeImportApi = {
  /**
   * Import trades from CSV file
   */
  async importTrades(
    file: File,
    broker: string,
    fileType: 'EQ' | 'FO'
  ): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('broker', broker);
    formData.append('fileType', fileType);

    // Use fetch directly for multipart/form-data
    // Note: Don't set Content-Type header - browser will set it with boundary
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const token = authService.getToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/trades/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      authService.clearToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `Import failed: ${response.statusText}`
      );
    }

    const responseData = await response.json();
    
    // Extract data from API response format
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData as ImportResponse;
  },
};

