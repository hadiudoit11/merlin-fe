'use client';

import { isLiveblocksEnabled, useSelf, useOthers } from '@/lib/liveblocks.config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CollaboratorsProps {
  maxDisplay?: number;
  className?: string;
}

/**
 * Displays avatars of all users currently in the room.
 * Shows a "+N" badge if there are more users than maxDisplay.
 */
export function Collaborators({ maxDisplay = 5, className }: CollaboratorsProps) {
  // Return null early if Liveblocks isn't configured
  if (!isLiveblocksEnabled) {
    return null;
  }

  return <CollaboratorsInner maxDisplay={maxDisplay} className={className} />;
}

function CollaboratorsInner({ maxDisplay = 5, className }: CollaboratorsProps) {
  const self = useSelf();
  const others = useOthers();

  // Combine self with others, self first
  const allUsers = [
    ...(self
      ? [
          {
            connectionId: self.connectionId,
            info: self.info,
            presence: self.presence,
            isSelf: true,
          },
        ]
      : []),
    ...others.map((other) => ({
      connectionId: other.connectionId,
      info: other.info,
      presence: other.presence,
      isSelf: false,
    })),
  ];

  const displayUsers = allUsers.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, allUsers.length - maxDisplay);

  if (allUsers.length === 0) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn('flex items-center -space-x-2', className)}>
        {displayUsers.map((user) => {
          const userInfo = user.info || user.presence?.user;
          const name = userInfo?.name || 'Anonymous';
          const email = userInfo?.email || '';
          const avatar = userInfo?.avatar;
          const color = userInfo?.color || '#888888';
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <Tooltip key={user.connectionId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar
                    className={cn(
                      'h-8 w-8 border-2 border-background ring-2 cursor-pointer transition-transform hover:scale-110 hover:z-10',
                      user.isSelf && 'ring-primary'
                    )}
                    style={
                      user.isSelf
                        ? undefined
                        : ({ '--tw-ring-color': color } as React.CSSProperties)
                    }
                  >
                    {avatar && <AvatarImage src={avatar} alt={name} />}
                    <AvatarFallback
                      className="text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: '#22c55e' }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="font-medium">
                  {name}
                  {user.isSelf && ' (you)'}
                </div>
                {email && (
                  <div className="text-muted-foreground">{email}</div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Hidden count badge */}
        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium cursor-pointer hover:scale-110 transition-transform">
                +{hiddenCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {hiddenCount} more collaborator{hiddenCount > 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Compact version showing just the count.
 */
export function CollaboratorCount({ className }: { className?: string }) {
  // Return null early if Liveblocks isn't configured
  if (!isLiveblocksEnabled) {
    return null;
  }

  return <CollaboratorCountInner className={className} />;
}

function CollaboratorCountInner({ className }: { className?: string }) {
  const others = useOthers();
  const count = others.length + 1; // +1 for self

  if (count <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs font-medium',
        className
      )}
    >
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      {count} online
    </div>
  );
}
