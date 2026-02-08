'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BatchActionDialogProps {
  action: 'approve' | 'reject';
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes?: string, reason?: string) => void;
  loading: boolean;
}

export function BatchActionDialog({
  action,
  count,
  open,
  onOpenChange,
  onConfirm,
  loading
}: BatchActionDialogProps) {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes || undefined, reason || undefined);
  };

  const handleCancel = () => {
    setNotes('');
    setReason('');
    onOpenChange(false);
  };

  const isApprove = action === 'approve';
  const ActionIcon = isApprove ? CheckCircle : XCircle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ActionIcon className={`h-5 w-5 mr-2 ${isApprove ? 'text-green-600' : 'text-red-600'}`} />
            Batch {isApprove ? 'Approve' : 'Reject'} Transactions
          </DialogTitle>
          <DialogDescription>
            {isApprove 
              ? `You are about to approve ${count} transaction${count !== 1 ? 's' : ''}. This action cannot be undone.`
              : `You are about to reject ${count} transaction${count !== 1 ? 's' : ''}. This action cannot be undone.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Confirmation Required</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isApprove 
                ? 'Approved transactions will be marked for posting to your ledger.'
                : 'Rejected transactions will be excluded from your ledger and marked as rejected.'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Add notes about this batch ${action}...`}
              rows={3}
            />
          </div>

          {!isApprove && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection (Optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Duplicate transaction, Incorrect amount, etc."
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant={isApprove ? 'default' : 'destructive'}
              disabled={loading}
            >
              {loading 
                ? `${isApprove ? 'Approving' : 'Rejecting'}...` 
                : `${isApprove ? 'Approve' : 'Reject'} ${count} Transaction${count !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 