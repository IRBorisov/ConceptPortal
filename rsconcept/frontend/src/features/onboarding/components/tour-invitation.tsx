'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { cn } from '@/components/utils';

interface TourInvitationProps {
  /** Tour title shown in the invitation heading. */
  title: string;
  /** Short purpose blurb for the offered tour. */
  purpose: React.ReactNode;
  /** Number of steps; shown as a localized count label. */
  stepCount: number;
  /** When true, primary action uses Resume wording and resumes at a saved step. */
  canResume: boolean;
  /** Accepts the offer and starts/resumes the tour. */
  onStart: () => void;
  /** Dismisses the offer for this session only (`sessionDismissed`). */
  onDecline: () => void;
}

/**
 * Soft auto-start offer: dimmed backdrop, no `#root` inert, no focus trap.
 * Escape, Not now, and backdrop click only suppress the offer for this session.
 */
export function TourInvitation({ title, purpose, stepCount, canResume, onStart, onDecline }: TourInvitationProps) {
  const tx = useTx();
  const titleId = useId();
  const purposeId = useId();
  const stepsId = useId();
  const stepsLabel = tx('tx.onboarding.invite.steps', { count: stepCount });
  const primaryLabel = canResume ? tx('tx.onboarding.resume') : tx('tx.onboarding.start');

  useEffect(
    function declineOnEscape() {
      function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          onDecline();
        }
      }
      // Bubble phase so capture-phase handlers on other overlays can take Escape first.
      window.addEventListener('keydown', onKeyDown);
      return function removeEscapeListener() {
        window.removeEventListener('keydown', onKeyDown);
      };
    },
    [onDecline]
  );

  return createPortal(
    <div className='fixed inset-0 z-topmost' data-testid='tour-invitation-layer'>
      <div
        data-testid='tour-invitation-backdrop'
        className='absolute inset-0 bg-[rgb(0_0_0/45%)]'
        onClick={onDecline}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute',
          'inset-x-3 top-16 sm:inset-x-auto sm:right-4 sm:top-16 sm:left-auto',
          'motion-reduce:transition-none'
        )}
      >
        <div
          role='dialog'
          aria-modal='false'
          aria-labelledby={titleId}
          aria-describedby={`${purposeId} ${stepsId}`}
          data-testid='tour-invitation'
          className={cn(
            'pointer-events-auto w-full sm:w-96 max-w-[calc(100vw-1.5rem)]',
            'flex flex-col gap-3 px-4 py-3',
            'rounded-xl border shadow-lg outline-hidden',
            'bg-popover text-popover-foreground',
            'transition-opacity duration-200 ease-in-out motion-reduce:transition-none'
          )}
        >
          <div className='flex flex-col gap-1.5'>
            <strong id={titleId} className='text-base leading-tight'>
              {title}
            </strong>
            <div id={purposeId} className='text-sm leading-relaxed line-clamp-3'>
              {purpose}
            </div>
            <p id={stepsId} className='text-xs text-muted-foreground'>
              {stepsLabel}
            </p>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-6'>
            <Button text={tx('tx.onboarding.notNow')} title={tx('tx.onboarding.notNow')} onClick={onDecline} />
            <Button data-tour-primary-action text={primaryLabel} title={primaryLabel} onClick={onStart} colorSubmit />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
