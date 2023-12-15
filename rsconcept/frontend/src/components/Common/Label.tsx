import clsx from 'clsx';
import { LabelHTMLAttributes } from 'react';

interface LabelProps 
extends Omit<React.DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, 'children' | 'title'> {
  text?: string
  tooltip?: string
}

function Label({ text, tooltip, className, ...restProps }: LabelProps) {
  if (!text) {
    return null;
  }
  return (
  <label
    className={clsx(
      'text-sm font-semibold whitespace-nowrap',
      className
    )}
    title={tooltip}
    {...restProps}
  >
    {text}
  </label>);
}

export default Label;