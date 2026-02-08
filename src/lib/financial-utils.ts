import { format, parseISO } from 'date-fns';

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format amount with color based on transaction type
export function formatAmount(amount: number, transactionType: 'debit' | 'credit', currency: string = 'USD'): {
  formatted: string;
  isPositive: boolean;
  color: string;
} {
  const formatted = formatCurrency(Math.abs(amount), currency);
  const isPositive = transactionType === 'credit';
  
  return {
    formatted: isPositive ? `+${formatted}` : `-${formatted}`,
    isPositive,
    color: isPositive ? 'text-green-600' : 'text-red-600',
  };
}

// Date formatting
export function formatDate(dateString: string, formatString: string = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Status badge styling
export function getStatusBadgeVariant(status: string): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
} {
  switch (status) {
    case 'pending':
      return { variant: 'outline', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' };
    case 'processing':
      return { variant: 'secondary', className: 'bg-blue-100 text-blue-700' };
    case 'completed':
      return { variant: 'default', className: 'bg-green-100 text-green-700' };
    case 'failed':
      return { variant: 'destructive', className: 'bg-red-100 text-red-700' };
    case 'partially_completed':
      return { variant: 'outline', className: 'border-orange-500 text-orange-700 bg-orange-50' };
    default:
      return { variant: 'outline', className: 'border-gray-500 text-gray-700 bg-gray-50' };
  }
}

// Review status badge styling
export function getReviewStatusBadgeVariant(status: string): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
} {
  switch (status) {
    case 'pending':
      return { variant: 'outline', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' };
    case 'approved':
      return { variant: 'default', className: 'bg-green-100 text-green-700' };
    case 'rejected':
      return { variant: 'destructive', className: 'bg-red-100 text-red-700' };
    case 'modified':
      return { variant: 'secondary', className: 'bg-blue-100 text-blue-700' };
    case 'posted':
      return { variant: 'default', className: 'bg-purple-100 text-purple-700' };
    default:
      return { variant: 'outline', className: 'border-gray-500 text-gray-700 bg-gray-50' };
  }
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Format merchant name
export function formatMerchantName(merchant: string | null): string {
  if (!merchant) return 'Unknown';
  return merchant.length > 30 ? truncateText(merchant, 30) : merchant;
}

// Format account number (mask sensitive parts)
export function formatAccountNumber(accountNumber: string | null): string {
  if (!accountNumber) return 'N/A';
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

// Calculate time ago
export function getTimeAgo(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  } catch {
    return 'Unknown';
  }
}

// Validate file type
export function isValidPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// Validate file size (max 10MB)
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Get file validation errors
export function getFileValidationErrors(file: File): string[] {
  const errors: string[] = [];
  
  if (!isValidPdfFile(file)) {
    errors.push('File must be a PDF');
  }
  
  if (!isValidFileSize(file)) {
    errors.push('File size must be less than 10MB');
  }
  
  return errors;
}

// Generate color for category
export function getCategoryColor(categoryName: string): string {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ];
  
  const index = categoryName.charCodeAt(0) % colors.length;
  return colors[index];
}

// Sort transactions by date (newest first)
export function sortTransactionsByDate<T extends { date: string }>(transactions: T[]): T[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Sort transactions by amount (highest first)
export function sortTransactionsByAmount<T extends { amount: number }>(transactions: T[]): T[] {
  return [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

// Filter transactions by date range
export function filterTransactionsByDateRange<T extends { date: string }>(
  transactions: T[],
  startDate: string,
  endDate: string
): T[] {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactionDate >= start && transactionDate <= end;
  });
}

// Calculate total amount
export function calculateTotalAmount<T extends { amount: number; transaction_type: 'debit' | 'credit' }>(
  transactions: T[]
): { total: number; credits: number; debits: number } {
  return transactions.reduce(
    (acc, transaction) => {
      const amount = Math.abs(transaction.amount);
      if (transaction.transaction_type === 'credit') {
        acc.credits += amount;
        acc.total += amount;
      } else {
        acc.debits += amount;
        acc.total -= amount;
      }
      return acc;
    },
    { total: 0, credits: 0, debits: 0 }
  );
} 