'use client';

import React from 'react';
import { ChevronDown, Building2, User, Plus, Settings, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';

export function OrgSwitcher() {
  const router = useRouter();
  const {
    currentOrganization,
    setCurrentOrganization,
    memberships,
    isLoadingMemberships,
    isPersonalMode,
    switchToPersonal,
  } = useOrganization();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {isPersonalMode ? (
              <>
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">Personal</span>
              </>
            ) : (
              <>
                <Avatar className="h-5 w-5">
                  {currentOrganization?.logo_url ? (
                    <AvatarImage src={currentOrganization.logo_url} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(currentOrganization?.name || 'O')}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">{currentOrganization?.name}</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Personal Workspace */}
        <DropdownMenuItem
          onClick={switchToPersonal}
          className="flex items-center gap-2 cursor-pointer"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Personal</span>
          {isPersonalMode && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {/* Organizations */}
        {memberships.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Organizations
            </DropdownMenuLabel>
            {memberships.map((membership) => (
              <DropdownMenuItem
                key={membership.organization.id}
                onClick={() => setCurrentOrganization(membership.organization)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Avatar className="h-5 w-5">
                  {membership.organization.logo_url ? (
                    <AvatarImage src={membership.organization.logo_url} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(membership.organization.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{membership.organization.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{membership.role}</span>
                </div>
                {currentOrganization?.id === membership.organization.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />

        {/* Create New Org */}
        <DropdownMenuItem
          onClick={() => router.push('/organizations/new')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create organization</span>
        </DropdownMenuItem>

        {/* Org Settings (if in org mode) */}
        {currentOrganization && (
          <DropdownMenuItem
            onClick={() => router.push(`/organizations/${currentOrganization.id}/settings`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Organization settings</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
