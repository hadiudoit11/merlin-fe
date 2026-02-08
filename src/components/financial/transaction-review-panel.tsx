'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Filter, 
  Download,
  Upload,
  Search,
  Calendar,
  DollarSign,
  Building2,
  FileText
} from 'lucide-react';
import { usePendingTransactions, useTransactionActions } from '@/hooks/useFinancial';
import { formatAmount, formatDate, formatMerchantName, getReviewStatusBadgeVariant } from '@/lib/financial-utils';
import { ImportedTransaction, TransactionFilters } from '@/types/financial';
import { TransactionModifyDialog } from './transaction-modify-dialog';
import { BatchActionDialog } from './batch-action-dialog';
import { toast } from 'sonner';

export function TransactionReviewPanel() {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ImportedTransaction | null>(null);
  const [batchAction, setBatchAction] = useState<'approve' | 'reject' | null>(null);

  const { transactions, loading, error, total, refresh } = usePendingTransactions(filters);
  const { 
    approveTransaction, 
    rejectTransaction, 
    modifyTransaction, 
    batchApprove, 
    batchReject,
    loading: actionLoading 
  } = useTransactionActions();

  // Filter transactions based on search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.merchant && transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleApprove = async (transaction: ImportedTransaction) => {
    try {
      await approveTransaction(transaction.id);
      toast.success('Transaction approved successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to approve transaction');
    }
  };

  const handleReject = async (transaction: ImportedTransaction) => {
    try {
      await rejectTransaction(transaction.id);
      toast.success('Transaction rejected successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to reject transaction');
    }
  };

  const handleModify = (transaction: ImportedTransaction) => {
    setSelectedTransaction(transaction);
    setShowModifyDialog(true);
  };

  const handleBatchAction = (action: 'approve' | 'reject') => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select at least one transaction');
      return;
    }
    setBatchAction(action);
    setShowBatchDialog(true);
  };

  const handleBatchConfirm = async (notes?: string, reason?: string) => {
    try {
      const transactionIds = Array.from(selectedTransactions);
      
      if (batchAction === 'approve') {
        await batchApprove(transactionIds, notes);
        toast.success(`Approved ${transactionIds.length} transactions`);
      } else if (batchAction === 'reject') {
        await batchReject(transactionIds, notes, reason);
        toast.success(`Rejected ${transactionIds.length} transactions`);
      }
      
      setSelectedTransactions(new Set());
      setShowBatchDialog(false);
      setBatchAction(null);
      refresh();
    } catch (error) {
      toast.error('Failed to perform batch action');
    }
  };

  const handleModifyConfirm = async (modifications: any) => {
    if (!selectedTransaction) return;
    
    try {
      await modifyTransaction(selectedTransaction.id, modifications);
      toast.success('Transaction modified successfully');
      setShowModifyDialog(false);
      setSelectedTransaction(null);
      refresh();
    } catch (error) {
      toast.error('Failed to modify transaction');
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading transactions: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction Review</h2>
          <p className="text-muted-foreground">
            Review and approve pending transactions ({total} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedTransactions.size > 0 && (
            <>
              <Button 
                onClick={() => handleBatchAction('approve')} 
                variant="outline" 
                size="sm"
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected ({selectedTransactions.size})
              </Button>
              <Button 
                onClick={() => handleBatchAction('reject')} 
                variant="outline" 
                size="sm"
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Selected ({selectedTransactions.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Range</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.amount_min || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, amount_min: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.amount_max || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, amount_max: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredTransactions.length} transactions found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Select All ({filteredTransactions.length})</span>
                </div>

                <Separator />

                {/* Transaction Items */}
                {filteredTransactions.map((transaction) => {
                  const amountInfo = formatAmount(transaction.amount, transaction.transaction_type);
                  const statusBadge = getReviewStatusBadgeVariant(transaction.review_status);
                  
                  return (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedTransactions.has(transaction.id)}
                          onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                        />
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{transaction.description}</h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(transaction.date)}
                                </span>
                                {transaction.merchant && (
                                  <span className="flex items-center">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {formatMerchantName(transaction.merchant)}
                                  </span>
                                )}
                                {transaction.reference_number && (
                                  <span className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {transaction.reference_number}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className={`text-lg font-semibold ${amountInfo.color}`}>
                                {amountInfo.formatted}
                              </div>
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {transaction.review_status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              onClick={() => handleApprove(transaction)}
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(transaction)}
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleModify(transaction)}
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modify
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showModifyDialog && selectedTransaction && (
        <TransactionModifyDialog
          transaction={selectedTransaction}
          open={showModifyDialog}
          onOpenChange={setShowModifyDialog}
          onConfirm={handleModifyConfirm}
          loading={actionLoading}
        />
      )}

      {showBatchDialog && batchAction && (
        <BatchActionDialog
          action={batchAction}
          count={selectedTransactions.size}
          open={showBatchDialog}
          onOpenChange={setShowBatchDialog}
          onConfirm={handleBatchConfirm}
          loading={actionLoading}
        />
      )}
    </div>
  );
} 