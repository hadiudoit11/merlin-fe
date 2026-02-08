// Financial Types for Merlin Financial Management System

export interface StatementImport {
  id: string;
  user: string;
  importer: string | null;
  original_filename: string;
  file_path: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partially_completed';
  started_at: string;
  completed_at: string | null;
  transactions_imported: number;
  transactions_skipped: number;
  errors: string | null;
  statement_period_start: string | null;
  statement_period_end: string | null;
  account_number: string | null;
  institution_name: string | null;
  extracted_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ImportedTransaction {
  id: string;
  statement_import: string;
  date: string;
  description: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  reference_number: string | null;
  merchant: string | null;
  location: string | null;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified' | 'posted';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  modified_description: string | null;
  modified_amount: number | null;
  modified_date: string | null;
  modified_category: string | null;
  modified_account: string | null;
  posted_transaction: string | null;
  raw_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ImportSummary {
  import_id: string;
  filename: string;
  status: string;
  transactions_imported: number;
  transactions_skipped: number;
  pending_review: number;
  approved: number;
  rejected: number;
  modified: number;
  posted: number;
  statement_period: {
    start: string | null;
    end: string | null;
  };
  institution: string | null;
  account_number: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ReviewStatistics {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_modified: number;
  total_posted: number;
  pending_by_date: Record<string, number>;
  pending_by_amount_range: Record<string, number>;
  pending_by_merchant: Record<string, number>;
  average_review_time: number;
  review_efficiency: number;
}

export interface DuplicateTransaction {
  id: string;
  duplicate_type: 'exact' | 'similar' | 'fuzzy';
  confidence_score: number;
  match_reason: string;
  existing_transaction: {
    id: string;
    date: string;
    description: string;
    amount: number;
  };
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  merchant?: string;
  description?: string;
  review_status?: string;
}

export interface BatchActionRequest {
  transaction_ids: string[];
  review_notes?: string;
  reason?: string;
}

export interface BatchActionResponse {
  success: boolean;
  approved_count?: number;
  rejected_count?: number;
  failed_count: number;
  failed_transactions: string[];
  message: string;
}

export interface AnalyticsData {
  total_imports: number;
  total_transactions: number;
  import_success_rate: number;
  average_processing_time: number;
  top_institutions: Array<{
    name: string;
    count: number;
  }>;
  monthly_imports: Record<string, number>;
  review_efficiency: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

// Category and Account types for transaction modification
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parent_id?: string | null;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  institution?: string;
  account_number?: string;
} 