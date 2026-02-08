# Merlin Financial API Documentation

## Overview

This document provides comprehensive API documentation for the Merlin Financial Management System's PDF import and transaction review workflow. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
https://your-domain.com/api/integrations/
```

## Authentication

All API endpoints require authentication. The system uses Django's session-based authentication or JWT tokens.

### Headers Required
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Data Models

### StatementImport
```typescript
interface StatementImport {
  id: string; // UUID
  user: string; // User ID
  importer: string | null; // PDFImporter ID
  original_filename: string;
  file_path: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partially_completed';
  started_at: string; // ISO datetime
  completed_at: string | null; // ISO datetime
  transactions_imported: number;
  transactions_skipped: number;
  errors: string | null;
  statement_period_start: string | null; // ISO date
  statement_period_end: string | null; // ISO date
  account_number: string | null;
  institution_name: string | null;
  extracted_data: Record<string, any>;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

### ImportedTransaction
```typescript
interface ImportedTransaction {
  id: string; // UUID
  statement_import: string; // StatementImport ID
  date: string; // ISO date
  description: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  reference_number: string | null;
  merchant: string | null;
  location: string | null;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified' | 'posted';
  reviewed_by: string | null; // User ID
  reviewed_at: string | null; // ISO datetime
  review_notes: string | null;
  modified_description: string | null;
  modified_amount: number | null;
  modified_date: string | null; // ISO date
  modified_category: string | null; // Category ID
  modified_account: string | null; // Account ID
  posted_transaction: string | null; // Transaction ID
  raw_data: Record<string, any>;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

### ImportSummary
```typescript
interface ImportSummary {
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
  beginning_balance: number | null;
  ending_balance: number | null;
  created_at: string;
  completed_at: string | null;
}
```

### ReviewStatistics
```typescript
interface ReviewStatistics {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_modified: number;
  total_posted: number;
  pending_by_date: Record<string, number>;
  pending_by_amount_range: Record<string, number>;
  pending_by_merchant: Record<string, number>;
  average_review_time: number; // in minutes
  review_efficiency: number; // percentage
}
```

## API Endpoints

### 1. PDF Statement Upload

**POST** `/upload/`

Upload and process a PDF financial statement with balance validation.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `file`: PDF file
  - `beginning_balance` (optional): Starting balance as decimal string
  - `ending_balance` (optional): Ending balance as decimal string

**Response:**
```typescript
{
  success: boolean;
  import_id: string;
  summary: ImportSummary;
  balance_check: {
    status: 'ok' | 'mismatch' | 'skipped';
    expected_difference?: number;
    actual_sum?: number;
    message: string;
  };
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('beginning_balance', '1000.00');
formData.append('ending_balance', '1250.50');

const response = await fetch('/api/integrations/upload/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
// result.balance_check will show if the sum of transactions matches the balance difference
```

### 2. Get User Imports

**GET** `/imports/`

Get all statement imports for the current user.

**Response:**
```typescript
{
  success: boolean;
  imports: ImportSummary[];
}
```

### 3. Get Import Status

**GET** `/imports/{import_id}/`

Get detailed status of a specific import.

**Response:**
```typescript
{
  success: boolean;
  summary: ImportSummary;
}
```

### 4. Get Import Transactions

**GET** `/imports/{import_id}/transactions/`

Get all transactions for a specific import.

**Response:**
```typescript
{
  success: boolean;
  transactions: ImportedTransaction[];
  total: number;
}
```

### 5. Get Pending Transactions

**GET** `/pending-transactions/`

Get all transactions pending review with optional filters.

**Query Parameters:**
- `date_from`: ISO date string
- `date_to`: ISO date string
- `amount_min`: number
- `amount_max`: number
- `merchant`: string
- `description`: string

**Response:**
```typescript
{
  success: boolean;
  transactions: ImportedTransaction[];
  total: number;
  filters: Record<string, any>;
}
```

### 6. Get Review Statistics

**GET** `/review-statistics/`

Get statistics for the review workflow.

**Response:**
```typescript
{
  success: boolean;
  statistics: ReviewStatistics;
}
```

### 7. Approve Transaction

**POST** `/transactions/{transaction_id}/approve/`

Approve a specific transaction.

**Request Body:**
```typescript
{
  review_notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  transaction: ImportedTransaction;
  message: string;
}
```

### 8. Reject Transaction

**POST** `/transactions/{transaction_id}/reject/`

Reject a specific transaction.

**Request Body:**
```typescript
{
  review_notes?: string;
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  transaction: ImportedTransaction;
  message: string;
}
```

### 9. Modify Transaction

**POST** `/transactions/{transaction_id}/modify/`

Modify a specific transaction.

**Request Body:**
```typescript
{
  description?: string;
  amount?: number;
  date?: string; // ISO date
  category?: string; // Category ID
  account?: string; // Account ID
  review_notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  transaction: ImportedTransaction;
  message: string;
}
```

### 10. Batch Approve Transactions

**POST** `/batch-approve/`

Approve multiple transactions at once.

**Request Body:**
```typescript
{
  transaction_ids: string[];
  review_notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  approved_count: number;
  failed_count: number;
  failed_transactions: string[];
  message: string;
}
```

### 11. Batch Reject Transactions

**POST** `/batch-reject/`

Reject multiple transactions at once.

**Request Body:**
```typescript
{
  transaction_ids: string[];
  review_notes?: string;
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  rejected_count: number;
  failed_count: number;
  failed_transactions: string[];
  message: string;
}
```

### 12. Post Approved Transactions

**POST** `/post-approved/`

Post all approved transactions to the ledger.

**Response:**
```typescript
{
  success: boolean;
  posted: number;
  failed: number;
  failed_transactions: string[];
  message: string;
}
```

### 13. Detect Duplicates

**POST** `/transactions/{transaction_id}/detect-duplicates/`

Detect potential duplicates for a transaction.

**Response:**
```typescript
{
  success: boolean;
  duplicates: Array<{
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
  }>;
  total_duplicates: number;
}
```

### 14. Resolve Duplicate

**POST** `/duplicates/{duplicate_id}/resolve/`

Resolve a duplicate transaction.

**Request Body:**
```typescript
{
  action: 'keep_both' | 'merge' | 'ignore' | 'delete_imported' | 'delete_existing';
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 15. Get Import Analytics

**GET** `/analytics/`

Get analytics data for imports and reviews.

**Response:**
```typescript
{
  success: boolean;
  analytics: {
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
  };
}
```

### 16. Reprocess Import

**POST** `/imports/{import_id}/reprocess/`

Reprocess a failed or partially completed import.

**Response:**
```typescript
{
  success: boolean;
  import_id: string;
  summary: ImportSummary;
  message: string;
}
```

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  success: false;
  error: string;
  details?: any;
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Implementation Examples

### TypeScript Service Class

```typescript
class IntegrationsService {
  private baseUrl = '/api/integrations/';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async uploadStatement(file: File): Promise<{ import_id: string; summary: ImportSummary }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async getPendingTransactions(filters?: Record<string, any>): Promise<{
    transactions: ImportedTransaction[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.request(`pending-transactions/?${params.toString()}`);
  }

  async approveTransaction(
    transactionId: string,
    reviewNotes?: string
  ): Promise<{ transaction: ImportedTransaction; message: string }> {
    return this.request(`transactions/${transactionId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async batchApproveTransactions(
    transactionIds: string[],
    reviewNotes?: string
  ): Promise<{
    approved_count: number;
    failed_count: number;
    failed_transactions: string[];
    message: string;
  }> {
    return this.request('batch-approve/', {
      method: 'POST',
      body: JSON.stringify({
        transaction_ids: transactionIds,
        review_notes: reviewNotes,
      }),
    });
  }

  async postApprovedTransactions(): Promise<{
    posted: number;
    failed: number;
    failed_transactions: string[];
    message: string;
  }> {
    return this.request('post-approved/', {
      method: 'POST',
    });
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

export function usePendingTransactions(filters?: Record<string, any>) {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const service = new IntegrationsService(token);
        const result = await service.getPendingTransactions(filters);
        setTransactions(result.transactions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, token]);

  return { transactions, loading, error };
}
```

## Workflow Overview

1. **Upload**: User uploads PDF statement
2. **Processing**: System extracts transactions and applies auto-review rules
3. **Review**: User reviews pending transactions (approve/reject/modify)
4. **Batch Operations**: User can perform batch actions on multiple transactions
5. **Duplicate Detection**: System identifies potential duplicates
6. **Posting**: Approved transactions are posted to the main ledger

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators during API calls
3. **Optimistic Updates**: Update UI immediately for better UX
4. **Batch Operations**: Use batch endpoints for multiple transactions
5. **Real-time Updates**: Consider polling or WebSocket for status updates
6. **Validation**: Validate data on both client and server side
7. **Caching**: Cache frequently accessed data like import lists

## Testing

Use the provided endpoints with test PDF files to verify functionality. The system supports various PDF formats from different financial institutions. 