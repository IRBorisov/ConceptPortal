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

  className?: string;
  style?: React.CSSProperties;
}

export function TourCard({
  title,
  body,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  className,
  style
}: TourCardProps) {
  const tx = useTx();
  const cardRef = useRef<HTMLDivElement>(null);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  useEffect(
    function focusCardOnStepChange() {
      cardRef.current?.focus();
    },
    [stepIndex]
  );

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      role='dialog'
      aria-modal='true'
      aria-label={tx('tx.onboarding.tour')}
      data-testid='tour-card'
      className={cn(
        'fixed z-tour w-100 max-w-[calc(100vw-1rem)]',
        'flex flex-col gap-3 px-6 py-3',
        'border rounded-xl shadow-lg outline-hidden',
        'bg-popover text-popover-foreground',
        className
      )}
      style={style}
    >
      <strong className='text-base leading-tight'>{title}</strong>
      <div className='text-sm'>{body}</div>

      <StepDots
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        label={tx('tx.onboarding.progress', { current: stepIndex + 1, total: totalSteps })}
      />

      <div className='flex items-center gap-2 text-sm'>
        {!isLast ? (
          <TextButton
            text={tx('tx.onboarding.skip')}
            className='mr-auto text-muted-foreground hover:text-foreground'
            onClick={onSkip}
          />
        ) : (
          <div className='mr-auto' />
        )}
        {!isFirst ? (
          <Button text={tx('tx.general.goBack')} className='px-4 py-1.5 rounded-lg' onClick={onBack} />
        ) : null}
        <button
          type='button'
          className={cn(
            'px-5 py-1.5 rounded-lg',
            'font-medium select-none whitespace-nowrap',
            'bg-primary text-primary-foreground',
            'hover:brightness-110 active:brightness-95 cc-animate-color',
            'cursor-pointer focus-outline'
          )}
          onClick={onNext}
        >
          {isFirst ? tx('tx.onboarding.start') : isLast ? tx('tx.onboarding.done') : tx('tx.onboarding.next')}
        </button>
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
