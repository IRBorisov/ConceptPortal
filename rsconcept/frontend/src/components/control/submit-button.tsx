'use client';

import { useTx } from '@/i18n';

import { globalIDs } from '@/utils/constants';

import { type Button } from '../props';
import { cn } from '../utils';

interface SubmitButtonProps extends Button {
  /** Text to display in the button. */
  text?: string;

  /** Icon to display in the button. */
  icon?: React.ReactNode;

  /** Indicates that loading is in progress. */
  loading?: boolean;
}

/**
 * Displays submit type button with icon and text.
 */
export function SubmitButton({
  text,
  icon,
  title,

  hideTitle,
  disabled,
  loading,
  className,
  ...restProps
}: SubmitButtonProps) {
  const tx = useTx();
  const label = text ?? tx('ui.submit.ok');
  return (
    <button
      type='submit'
      className={cn(
        'px-3 py-1 flex gap-2 items-center justify-center',
        'border',
        'font-medium',
        'cc-btn-primary disabled:opacity-50 cc-animate-color',
        'select-none cursor-pointer disabled:cursor-auto',
        loading && 'cursor-progress',
        className
      )}
      data-tooltip-id={!!title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      disabled={disabled || loading}
      {...restProps}
    >
      {icon ? icon : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}
