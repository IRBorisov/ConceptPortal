import clsx from 'clsx';

import { CProps } from '@/components/props';

interface ValueLabeledProps extends CProps.Styling {
  /** Id of the component. */
  id?: string;

  /** Label to display. */
  label: string;

  /** Value to display. */
  text: string | number;

  /** Tooltip for the component. */
  title?: string;
}

/**
 * Displays a labeled value.
 */
export function ValueLabeled({ id, label, text, title, className, ...restProps }: ValueLabeledProps) {
  return (
    <div className={clsx('flex justify-between gap-6', className)} {...restProps}>
      <span title={title}>{label}</span>
      <span id={id}>{text}</span>
    </div>
  );
}
