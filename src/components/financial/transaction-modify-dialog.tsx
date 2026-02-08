'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCategories, useAccounts } from '@/hooks/useFinancial';
import { ImportedTransaction, Category, Account } from '@/types/financial';
import { formatAmount, formatDate } from '@/lib/financial-utils';

interface TransactionModifyDialogProps {
  transaction: ImportedTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (modifications: any) => void;
  loading: boolean;
}

export function TransactionModifyDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
  loading
}: TransactionModifyDialogProps) {
  const [modifications, setModifications] = useState({
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    category: transaction.modified_category || '',
    account: transaction.modified_account || '',
    review_notes: ''
  });

  const { categories } = useCategories();
  const { accounts } = useAccounts();

  // Reset form when transaction changes
  useEffect(() => {
    setModifications({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.modified_category || '',
      account: transaction.modified_account || '',
      review_notes: ''
    });
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have been modified
    const changes: any = {};
    if (modifications.description !== transaction.description) {
      changes.description = modifications.description;
    }
    if (modifications.amount !== transaction.amount) {
      changes.amount = modifications.amount;
    }
    if (modifications.date !== transaction.date) {
      changes.date = modifications.date;
    }
    if (modifications.category !== (transaction.modified_category || '')) {
      changes.category = modifications.category || null;
    }
    if (modifications.account !== (transaction.modified_account || '')) {
      changes.account = modifications.account || null;
    }
    if (modifications.review_notes) {
      changes.review_notes = modifications.review_notes;
    }

    onConfirm(changes);
  };

  const amountInfo = formatAmount(transaction.amount, transaction.transaction_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modify Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details before approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original Transaction Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Original Transaction</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2">{formatDate(transaction.date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className={`ml-2 font-medium ${amountInfo.color}`}>
                  {amountInfo.formatted}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Description:</span>
                <span className="ml-2">{transaction.description}</span>
              </div>
              {transaction.merchant && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="ml-2">{transaction.merchant}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modification Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={modifications.description}
                onChange={(e) => setModifications(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Transaction description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={modifications.amount}
                onChange={(e) => setModifications(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={modifications.date}
                onChange={(e) => setModifications(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={modifications.category}
                onValueChange={(value) => setModifications(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={modifications.account}
                onValueChange={(value) => setModifications(prev => ({ ...prev, account: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default Account</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_notes">Review Notes (Optional)</Label>
              <Textarea
                id="review_notes"
                value={modifications.review_notes}
                onChange={(e) => setModifications(prev => ({ ...prev, review_notes: e.target.value }))}
                placeholder="Add notes about this modification..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 