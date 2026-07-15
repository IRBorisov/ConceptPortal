'use client';

import { useEffect, useId, useRef } from 'react';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { TextButton } from '@/components/control/text-button';
import { cn } from '@/components/utils';

import { type TourCardLayoutMode } from '../utils/card-position';
import { focusTourCardEntry, scheduleFocusRestore } from '../utils/focus';

interface TourCardProps {
  /** Step title shown in the dialog heading. */
  title: string;
  /** Step body content (localized JSX from tour content files). */
  body: React.ReactNode;

  /** Zero-based index of the active step. */
  stepIndex: number;
  /** Total number of steps in the active tour. */
  totalSteps: number;

  onNext: () => void;
  onBack: () => void;
  /** Permanently opts out of the tour (`status: skipped`). */
  onSkip: () => void;

  /** When false, hides Back (default: hidden on the first step). */
  showBack?: boolean;

  /** When set, shows an Explore control that opens the linked subtour. */
  onExplore?: () => void;

  /** Step anchor could not be resolved; show message + Retry; Next/Done stay for manual advance. */
  anchorUnavailable?: boolean;
  /** Re-runs anchor resolution for the current step. */
  onRetryAnchor?: () => void;

  /** Visual layout: anchored popover, centered modal, or mobile bottom sheet. */
  layoutMode?: TourCardLayoutMode;

  /** Notifies the host when the card element mounts or unmounts. */
  onCardElement?: (element: HTMLDivElement | null) => void;

  className?: string;
  style?: React.CSSProperties;
  /** Reports measured card height so the host can keep positioning accurate. */
  onLayout?: (height: number) => void;
}

/**
 * Active tour step dialog: copy, progress, Skip/Explore, and Next/Back/Done.
 * Restores focus on unmount; primary action is focused when the step changes.
 */
export function TourCard({
  title,
  body,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  showBack,
  onExplore,
  anchorUnavailable,
  onRetryAnchor,
  layoutMode = 'anchored',
  onCardElement,
  className,
  style,
  onLayout
}: TourCardProps) {
  const tx = useTx();
  const cardRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const statusId = useId();

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const canGoBack = showBack ?? !isFirst;
  const progressLabel = tx('tx.onboarding.progress', { current: stepIndex + 1, total: totalSteps });
  const isBottomSheet = layoutMode === 'bottom-sheet';

  useEffect(function saveAndRestoreFocus() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return function restoreFocus() {
      scheduleFocusRestore(previousFocusRef.current);
    };
  }, []);

  useEffect(
    function notifyCardElement() {
      onCardElement?.(cardRef.current);
      return function clearCardElement() {
        onCardElement?.(null);
      };
    },
    [onCardElement]
  );

  useEffect(
    function focusEntryOnStepChange() {
      const card = cardRef.current;
      if (!card) {
        return;
      }
      const frame = requestAnimationFrame(function focusPrimaryAction() {
        const currentCard = cardRef.current;
        if (!currentCard) {
          return;
        }
        focusTourCardEntry(currentCard);
      });
      return function cancelFocusEntry() {
        cancelAnimationFrame(frame);
      };
    },
    [stepIndex, anchorUnavailable]
  );

  useEffect(
    function reportCardHeight() {
      const element = cardRef.current;
      if (!element || !onLayout) {
        return;
      }
      function measureCardHeight() {
        const cardElement = cardRef.current;
        if (!cardElement || !onLayout) {
          return;
        }
        onLayout(cardElement.offsetHeight);
      }
      const observer = new ResizeObserver(measureCardHeight);
      observer.observe(element);
      const frame = requestAnimationFrame(measureCardHeight);
      return function disconnectCardHeightObserver() {
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    },
    [onLayout, stepIndex, title, body, onExplore, canGoBack, anchorUnavailable, layoutMode]
  );

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      aria-describedby={anchorUnavailable ? `${bodyId} ${statusId}` : bodyId}
      data-testid='tour-card'
      data-tour-layout={layoutMode}
      data-tour-step={`${stepIndex + 1}/${totalSteps}`}
      className={cn(
        'fixed max-h-[calc(100vh-1rem)] overflow-y-auto',
        'flex flex-col gap-3 px-5 pt-4',
        'border shadow-lg outline-hidden',
        'bg-popover text-popover-foreground',
        'transition-[left,top] duration-500 ease-in-out motion-reduce:duration-1000',
        isBottomSheet
          ? 'max-w-none rounded-t-2xl rounded-b-none pb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[min(70dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem))]'
          : 'w-100 max-w-[calc(100vw-1rem)] rounded-xl pb-3',
        className
      )}
      style={style}
    >
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        {progressLabel}
      </div>

      <div className='flex flex-col gap-2'>
        <strong id={titleId} className='text-base leading-tight'>
          {title}
        </strong>
        <div id={bodyId} className='text-sm leading-relaxed'>
          {body}
        </div>
        {anchorUnavailable ? (
          <p id={statusId} className='text-sm text-warning' data-testid='tour-anchor-unavailable'>
            {tx('tx.onboarding.anchor.unavailable')}
          </p>
        ) : null}
        {onExplore ? (
          <TextButton
            tabIndex={0}
            text={tx('tx.general.details')}
            title={tx('tx.onboarding.explore.hint')}
            className='self-start'
            onClick={onExplore}
          />
        ) : null}
      </div>

      <StepDots stepIndex={stepIndex} totalSteps={totalSteps} label={progressLabel} />

      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          {!isLast ? (
            <TextButton
              tabIndex={0}
              text={tx('tx.onboarding.skipTour')}
              title={tx('tx.onboarding.skipTour')}
              className='text-muted-foreground hover:text-foreground'
              onClick={onSkip}
            />
          ) : null}
        </div>
        <div className='flex items-center gap-3 ml-auto'>
          {canGoBack ? <Button text={tx('tx.general.goBack')} onClick={onBack} /> : null}
          {anchorUnavailable && onRetryAnchor ? (
            <Button text={tx('tx.onboarding.anchor.retry')} onClick={onRetryAnchor} />
          ) : null}
          <Button
            data-tour-primary-action
            text={
              isFirst && !canGoBack
                ? tx('tx.onboarding.start')
                : isLast
                  ? tx('tx.onboarding.done')
                  : tx('tx.onboarding.next')
            }
            onClick={onNext}
            colorSubmit
          />
        </div>
      </div>
    </div>
  );
}

// ====== Internals =========
interface StepDotsProps {
  stepIndex: number;
  totalSteps: number;
  /** Accessible progress label mirrored via `title` (dots themselves are `aria-hidden`). */
  label: string;
}

/** Decorative step progress dots; screen readers use the live progress label instead. */
function StepDots({ stepIndex, totalSteps, label }: StepDotsProps) {
  return (
    <div
      className='flex items-center justify-center gap-1.5 py-0.5'
      aria-hidden='true'
      title={label}
      data-testid='tour-step-dots'
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-2 rounded-full transition-all duration-500 motion-reduce:duration-1000',
            index === stepIndex ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/30',
            index < stepIndex && 'bg-primary/40'
          )}
        />
      ))}
    </div>
  );
}
