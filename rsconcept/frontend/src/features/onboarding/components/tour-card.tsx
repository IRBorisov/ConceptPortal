'use client';

import { useEffect, useRef } from 'react';

import { useTx } from '@/i18n';

import { Button } from '@/components/control';
import { TextButton } from '@/components/control/text-button';
import { cn } from '@/components/utils';

interface TourCardProps {
  title: string;
  body: React.ReactNode;

  stepIndex: number;
  totalSteps: number;

  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;

  /** When false, hides Back (default: hidden on the first step). */
  showBack?: boolean;

  /** When set, shows an Explore control that opens the linked subtour. */
  onExplore?: () => void;

  className?: string;
  style?: React.CSSProperties;
  onLayout?: (height: number) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  className,
  style,
  onLayout
}: TourCardProps) {
  const tx = useTx();
  const cardRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const canGoBack = showBack ?? !isFirst;

  useEffect(function saveAndRestoreFocus() {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return function restoreFocus() {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(
    function focusCardOnStepChange() {
      cardRef.current?.focus();
    },
    [stepIndex]
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
    [onLayout, stepIndex, title, body, onExplore, canGoBack]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !cardRef.current) {
      return;
    }

    const focusable = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const active = document.activeElement;

    if (focusable.length === 0) {
      event.preventDefault();
      cardRef.current.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (active === first || active === cardRef.current) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      role='dialog'
      aria-modal='true'
      aria-label={tx('tx.onboarding.tour')}
      data-testid='tour-card'
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed w-100 max-w-[calc(100vw-1rem)] max-h-[calc(100vh-1rem)] overflow-y-auto',
        'flex flex-col gap-3 px-5 pt-4 pb-3',
        'border rounded-xl shadow-lg outline-hidden',
        'bg-popover text-popover-foreground',
        'transition-[left,top] duration-300 ease-in-out',
        className
      )}
      style={style}
    >
      <div className='flex flex-col gap-2'>
        <strong className='text-base leading-tight'>{title}</strong>
        <div className='text-sm leading-relaxed'>{body}</div>
        {onExplore ? (
          <TextButton
            text={tx('tx.general.details')}
            title={tx('tx.onboarding.explore.hint')}
            className='self-start'
            onClick={onExplore}
          />
        ) : null}
      </div>

      <StepDots
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        label={tx('tx.onboarding.progress', { current: stepIndex + 1, total: totalSteps })}
      />

      <div className='flex items-center gap-2 pt-1 border-t border-border/60 text-sm'>
        {!isLast ? (
          <TextButton
            text={tx('tx.onboarding.skip')}
            className='mr-auto text-muted-foreground hover:text-foreground'
            onClick={onSkip}
          />
        ) : (
          <div className='mr-auto' />
        )}
        {canGoBack ? (
          <Button text={tx('tx.general.goBack')} className='px-4 py-1.5 rounded-lg' onClick={onBack} />
        ) : null}
        <Button
          text={
            isFirst && !canGoBack
              ? tx('tx.onboarding.start')
              : isLast
                ? tx('tx.onboarding.done')
                : tx('tx.onboarding.next')
          }
          className='px-5 py-1.5 rounded-lg whitespace-nowrap'
          onClick={onNext}
          colorSubmit
        />
      </div>
    </div>
  );
}

// ====== Internals =========
interface StepDotsProps {
  stepIndex: number;
  totalSteps: number;
  label: string;
}

function StepDots({ stepIndex, totalSteps, label }: StepDotsProps) {
  return (
    <div className='flex items-center justify-center gap-1.5 py-0.5' role='img' aria-label={label} title={label}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            index === stepIndex ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/30',
            index < stepIndex && 'bg-primary/40'
          )}
        />
      ))}
    </div>
  );
}
