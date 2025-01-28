import clsx from 'clsx';

import { CProps } from '@/components/props';

interface LabelProps extends CProps.Label {
  /** Text to display. */
  text?: string;
}

/**
 * Displays a label with optional text.
 *
 * Note: Html label component is used only if `htmlFor` prop is set.
 */
function Label({ text, className, ...restProps }: LabelProps) {
  if (!text) {
    return null;
  }
  if (restProps.htmlFor) {
    return (
      <label className={clsx('cc-label', className)} {...restProps}>
        {text}
      </label>
    );
  } else {
    return (
      <span className={clsx('cc-label', className)} {...restProps}>
        {text}
      </span>
    );
  }
}

export default Label;
