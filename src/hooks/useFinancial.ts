import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import FinancialApiService from '@/lib/financial-api';
import {
  ImportedTransaction,
  ImportSummary,
  ReviewStatistics,
  TransactionFilters,
  AnalyticsData,
  Category,
  Account,
} from '@/types/financial';

// Hook for managing pending transactions
export function usePendingTransactions(filters?: TransactionFilters) {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getPendingTransactions(filters);
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [getToken, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, total, refresh };
}

// Hook for managing imports
export function useImports() {
  const { getToken } = useAuth();
  const [imports, setImports] = useState<ImportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getUserImports();
      setImports(result.imports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch imports');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const refresh = useCallback(() => {
    fetchImports();
  }, [fetchImports]);

  return { imports, loading, error, refresh };
}

// Hook for managing review statistics
export function useReviewStatistics() {
  const { getToken } = useAuth();
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getReviewStatistics();
      setStatistics(result.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const refresh = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refresh };
}

// Hook for managing analytics
export function useAnalytics() {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getImportAnalytics();
      setAnalytics(result.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refresh };
}

// Hook for managing categories
export function useCategories() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getCategories();
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh };
}

// Hook for managing accounts
export function useAccounts() {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      const result = await service.getAccounts();
      setAccounts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const refresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, loading, error, refresh };
}

// Hook for transaction actions
export function useTransactionActions() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveTransaction = useCallback(async (transactionId: string, reviewNotes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.approveTransaction(transactionId, reviewNotes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const rejectTransaction = useCallback(async (transactionId: string, reviewNotes?: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.rejectTransaction(transactionId, reviewNotes, reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const modifyTransaction = useCallback(async (
    transactionId: string,
    modifications: {
      description?: string;
      amount?: number;
      date?: string;
      category?: string;
      account?: string;
      review_notes?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.modifyTransaction(transactionId, modifications);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to modify transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const batchApprove = useCallback(async (transactionIds: string[], reviewNotes?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.batchApproveTransactions(transactionIds, reviewNotes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch approve transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const batchReject = useCallback(async (transactionIds: string[], reviewNotes?: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.batchRejectTransactions(transactionIds, reviewNotes, reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch reject transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return {
    loading,
    error,
    approveTransaction,
    rejectTransaction,
    modifyTransaction,
    batchApprove,
    batchReject,
  };
}

// Hook for file upload
export function useFileUpload() {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadStatement = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const service = new FinancialApiService(token);
      return await service.uploadStatement(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload statement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [getToken]);

  return { uploading, error, uploadStatement };
} 