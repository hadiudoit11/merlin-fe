import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  StatementImport,
  ImportedTransaction,
  ImportSummary,
  ReviewStatistics,
  TransactionFilters,
  BatchActionRequest,
  BatchActionResponse,
  AnalyticsData,
  DuplicateTransaction,
  ApiResponse,
  PaginatedResponse,
  Category,
  Account,
} from '@/types/financial';

class FinancialApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor(token: string) {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-domain.com/api/integrations/';
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // PDF Statement Upload
  async uploadStatement(file: File): Promise<{ import_id: string; summary: ImportSummary }> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<{ success: boolean; import_id: string; summary: ImportSummary }> = 
      await this.api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    return response.data;
  }

  // Get User Imports
  async getUserImports(): Promise<{ imports: ImportSummary[] }> {
    const response: AxiosResponse<{ success: boolean; imports: ImportSummary[] }> = 
      await this.api.get('/imports/');
    return response.data;
  }

  // Get Import Status
  async getImportStatus(importId: string): Promise<{ summary: ImportSummary }> {
    const response: AxiosResponse<{ success: boolean; summary: ImportSummary }> = 
      await this.api.get(`/imports/${importId}/`);
    return response.data;
  }

  // Get Import Transactions
  async getImportTransactions(importId: string): Promise<{ transactions: ImportedTransaction[]; total: number }> {
    const response: AxiosResponse<{ success: boolean; transactions: ImportedTransaction[]; total: number }> = 
      await this.api.get(`/imports/${importId}/transactions/`);
    return response.data;
  }

  // Get Pending Transactions
  async getPendingTransactions(filters?: TransactionFilters): Promise<{ 
    transactions: ImportedTransaction[]; 
    total: number; 
    filters: Record<string, any> 
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<{ 
      success: boolean; 
      transactions: ImportedTransaction[]; 
      total: number; 
      filters: Record<string, any> 
    }> = await this.api.get(`/pending-transactions/?${params.toString()}`);
    
    return response.data;
  }

  // Get Review Statistics
  async getReviewStatistics(): Promise<{ statistics: ReviewStatistics }> {
    const response: AxiosResponse<{ success: boolean; statistics: ReviewStatistics }> = 
      await this.api.get('/review-statistics/');
    return response.data;
  }

  // Approve Transaction
  async approveTransaction(transactionId: string, reviewNotes?: string): Promise<{ 
    transaction: ImportedTransaction; 
    message: string 
  }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      transaction: ImportedTransaction; 
      message: string 
    }> = await this.api.post(`/transactions/${transactionId}/approve/`, {
      review_notes: reviewNotes,
    });
    return response.data;
  }

  // Reject Transaction
  async rejectTransaction(transactionId: string, reviewNotes?: string, reason?: string): Promise<{ 
    transaction: ImportedTransaction; 
    message: string 
  }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      transaction: ImportedTransaction; 
      message: string 
    }> = await this.api.post(`/transactions/${transactionId}/reject/`, {
      review_notes: reviewNotes,
      reason,
    });
    return response.data;
  }

  // Modify Transaction
  async modifyTransaction(
    transactionId: string,
    modifications: {
      description?: string;
      amount?: number;
      date?: string;
      category?: string;
      account?: string;
      review_notes?: string;
    }
  ): Promise<{ transaction: ImportedTransaction; message: string }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      transaction: ImportedTransaction; 
      message: string 
    }> = await this.api.post(`/transactions/${transactionId}/modify/`, modifications);
    return response.data;
  }

  // Batch Approve Transactions
  async batchApproveTransactions(transactionIds: string[], reviewNotes?: string): Promise<BatchActionResponse> {
    const response: AxiosResponse<BatchActionResponse> = await this.api.post('/batch-approve/', {
      transaction_ids: transactionIds,
      review_notes: reviewNotes,
    });
    return response.data;
  }

  // Batch Reject Transactions
  async batchRejectTransactions(transactionIds: string[], reviewNotes?: string, reason?: string): Promise<BatchActionResponse> {
    const response: AxiosResponse<BatchActionResponse> = await this.api.post('/batch-reject/', {
      transaction_ids: transactionIds,
      review_notes: reviewNotes,
      reason,
    });
    return response.data;
  }

  // Post Approved Transactions
  async postApprovedTransactions(): Promise<{ 
    posted: number; 
    failed: number; 
    failed_transactions: string[]; 
    message: string 
  }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      posted: number; 
      failed: number; 
      failed_transactions: string[]; 
      message: string 
    }> = await this.api.post('/post-approved/');
    return response.data;
  }

  // Detect Duplicates
  async detectDuplicates(transactionId: string): Promise<{ 
    duplicates: DuplicateTransaction[]; 
    total_duplicates: number 
  }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      duplicates: DuplicateTransaction[]; 
      total_duplicates: number 
    }> = await this.api.post(`/transactions/${transactionId}/detect-duplicates/`);
    return response.data;
  }

  // Resolve Duplicate
  async resolveDuplicate(duplicateId: string, action: 'keep_both' | 'merge' | 'ignore' | 'delete_imported' | 'delete_existing', notes?: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = 
      await this.api.post(`/duplicates/${duplicateId}/resolve/`, {
        action,
        notes,
      });
    return response.data;
  }

  // Get Import Analytics
  async getImportAnalytics(): Promise<{ analytics: AnalyticsData }> {
    const response: AxiosResponse<{ success: boolean; analytics: AnalyticsData }> = 
      await this.api.get('/analytics/');
    return response.data;
  }

  // Reprocess Import
  async reprocessImport(importId: string): Promise<{ 
    import_id: string; 
    summary: ImportSummary; 
    message: string 
  }> {
    const response: AxiosResponse<{ 
      success: boolean; 
      import_id: string; 
      summary: ImportSummary; 
      message: string 
    }> = await this.api.post(`/imports/${importId}/reprocess/`);
    return response.data;
  }

  // Get Categories (for transaction modification)
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<{ success: boolean; data: Category[] }> = 
      await this.api.get('/categories/');
    return response.data.data || [];
  }

  // Get Accounts (for transaction modification)
  async getAccounts(): Promise<Account[]> {
    const response: AxiosResponse<{ success: boolean; data: Account[] }> = 
      await this.api.get('/accounts/');
    return response.data.data || [];
  }
}

export default FinancialApiService; 