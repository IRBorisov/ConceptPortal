import clsx from 'clsx';

interface LabelProps extends Omit<React.ComponentProps<'label'>, 'children'> {
  /** Text to display. */
  text?: string;
}

/**
 * Displays a label with optional text.
 *
 * Note: Html label component is used only if `htmlFor` prop is set.
 */
export function Label({ text, className, ...restProps }: LabelProps) {
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
