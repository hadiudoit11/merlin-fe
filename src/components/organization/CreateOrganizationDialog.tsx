'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CheckCircle2, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { organizationApi } from '@/lib/organization-api';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Organization, OrganizationRole } from '@/types/organization';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InviteEntry {
  email: string;
  role: 'admin' | 'member';
}

type Step = 'basic' | 'invite' | 'confirm';

export function CreateOrganizationDialog({ open, onOpenChange }: CreateOrganizationDialogProps) {
  const { refreshMemberships, setCurrentOrganization } = useOrganization();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('basic');

  // Basic info state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');

  // Invite state
  const [invites, setInvites] = useState<InviteEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');

  // Result state
  const [createdOrg, setCreatedOrg] = useState<Organization | null>(null);
  const [inviteResults, setInviteResults] = useState<{
    sent: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  } | null>(null);

  // Loading/error state
  const [isCreating, setIsCreating] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  // Validation
  const isBasicInfoValid = name.trim().length >= 2 && name.trim().length <= 100 && slug.length >= 2;

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addInvite = () => {
    if (!isValidEmail(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (invites.some(inv => inv.email.toLowerCase() === newEmail.toLowerCase())) {
      setError('This email has already been added');
      return;
    }
    setInvites([...invites, { email: newEmail.toLowerCase(), role: newRole }]);
    setNewEmail('');
    setNewRole('member');
    setError(null);
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter(inv => inv.email !== email));
  };

  // Step navigation
  const handleNextFromBasic = async () => {
    if (!isBasicInfoValid) return;

    setIsCreating(true);
    setError(null);

    try {
      const org = await organizationApi.createOrganization({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
      });
      setCreatedOrg(org);
      setCurrentStep('invite');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Failed to create organization');
      } else {
        setError('Failed to create organization');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleNextFromInvite = async () => {
    if (!createdOrg) return;

    if (invites.length === 0) {
      // Skip invites
      setCurrentStep('confirm');
      return;
    }

    setIsSendingInvites(true);
    setError(null);

    try {
      const results = await organizationApi.createBatchInvitations(
        createdOrg.id,
        invites
      );
      setInviteResults(results);
      setCurrentStep('confirm');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Failed to send invitations');
      } else {
        setError('Failed to send invitations');
      }
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleFinish = async () => {
    // Refresh memberships and switch to new org
    await refreshMemberships();
    if (createdOrg) {
      setCurrentOrganization({
        id: createdOrg.id,
        name: createdOrg.name,
        slug: createdOrg.slug,
        logo_url: createdOrg.logo_url,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep('basic');
    setName('');
    setSlug('');
    setSlugManuallyEdited(false);
    setDescription('');
    setInvites([]);
    setNewEmail('');
    setNewRole('member');
    setCreatedOrg(null);
    setInviteResults(null);
    setError(null);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep === 'invite') {
      e.preventDefault();
      if (newEmail) {
        addInvite();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === 'basic' && (
              <>
                <Building2 className="h-5 w-5" />
                Create Organization
              </>
            )}
            {currentStep === 'invite' && (
              <>
                <Users className="h-5 w-5" />
                Invite Team Members
              </>
            )}
            {currentStep === 'confirm' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Organization Created
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'basic' && 'Set up your organization workspace.'}
            {currentStep === 'invite' && 'Invite team members to collaborate with you.'}
            {currentStep === 'confirm' && 'Your organization is ready to use.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {(['basic', 'invite', 'confirm'] as Step[]).map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === 'confirm' ||
                      (currentStep === 'invite' && step === 'basic')
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`w-12 h-0.5 ${
                    (currentStep === 'invite' && step === 'basic') ||
                    currentStep === 'confirm'
                      ? 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 'basic' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                placeholder="My Company"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                2-100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">typequest.io/</span>
                <Input
                  id="org-slug"
                  placeholder="my-company"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1"
                  maxLength={50}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">Description (optional)</Label>
              <Textarea
                id="org-description"
                placeholder="What does your organization do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleNextFromBasic}
                disabled={!isBasicInfoValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Invite Team */}
        {currentStep === 'invite' && (
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div className="space-y-2">
              <Label>Add team members</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'member')}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" onClick={addInvite}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pending invites list */}
            {invites.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Pending invitations ({invites.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {invites.map((invite) => (
                    <div
                      key={invite.email}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-sm">{invite.email}</span>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {invite.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeInvite(invite.email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invites.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                You can invite team members now or skip this step.
              </p>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep('confirm')}>
                Skip
              </Button>
              <Button onClick={handleNextFromInvite} disabled={isSendingInvites}>
                {isSendingInvites ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : invites.length > 0 ? (
                  `Send ${invites.length} Invitation${invites.length > 1 ? 's' : ''}`
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 'confirm' && createdOrg && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">{createdOrg.name}</h3>
              <p className="text-sm text-muted-foreground">typequest.io/{createdOrg.slug}</p>
            </div>

            {/* Invite results */}
            {inviteResults && inviteResults.sent > 0 && (
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm font-medium mb-2">
                  {inviteResults.sent} invitation{inviteResults.sent > 1 ? 's' : ''} sent
                  {inviteResults.failed > 0 && (
                    <span className="text-destructive ml-1">
                      ({inviteResults.failed} failed)
                    </span>
                  )}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {inviteResults.results.slice(0, 5).map((result) => (
                    <div key={result.email} className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="truncate">{result.email}</span>
                    </div>
                  ))}
                  {inviteResults.results.length > 5 && (
                    <p className="text-xs">+{inviteResults.results.length - 5} more</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button onClick={handleFinish} className="min-w-32">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
