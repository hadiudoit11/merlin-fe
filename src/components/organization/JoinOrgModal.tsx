'use client';

import { useState } from 'react';
import { Building2, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { organizationApi } from '@/lib/organization-api';
import { OrganizationBrief } from '@/types/organization';

interface JoinOrgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationBrief;
  autoJoin: boolean;
  onJoined: (org: OrganizationBrief) => void;
  onDeclined: () => void;
}

export function JoinOrgModal({
  open,
  onOpenChange,
  organization,
  autoJoin,
  onJoined,
  onDeclined,
}: JoinOrgModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsJoining(true);
    setError(null);

    try {
      const result = await organizationApi.joinOrganizationByDomain(organization.id);
      if (result.success) {
        setJoined(true);
        setTimeout(() => {
          onJoined(organization);
          onOpenChange(false);
        }, 1500);
      } else {
        setError(result.message || 'Failed to join organization');
      }
    } catch (err: unknown) {
      console.error('Failed to join organization:', err);
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || 'Failed to join organization');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDecline = () => {
    onDeclined();
    onOpenChange(false);
  };

  if (joined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-center mb-2">Welcome to {organization.name}!</DialogTitle>
            <DialogDescription className="text-center">
              You&apos;ve successfully joined the organization.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {organization.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name}
                  className="h-8 w-8 rounded"
                />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>{organization.name}</DialogTitle>
              <DialogDescription>Organization detected</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Your email domain matches <span className="font-medium">{organization.name}</span>.
            {autoJoin
              ? ' Would you like to join this organization?'
              : ' You can request to join this organization.'}
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-medium text-sm mb-2">What happens when you join?</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Access shared workspaces and canvases</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Collaborate with team members</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Use organization skills</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDecline} className="sm:flex-1">
            <X className="h-4 w-4 mr-2" />
            Continue as Individual
          </Button>
          <Button onClick={handleJoin} disabled={isJoining} className="sm:flex-1">
            {isJoining ? (
              'Joining...'
            ) : (
              <>
                Join {organization.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
