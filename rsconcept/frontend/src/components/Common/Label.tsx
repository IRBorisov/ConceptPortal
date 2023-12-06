import { LabelHTMLAttributes } from 'react';

interface LabelProps 
extends Omit<React.DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, 'children' | 'title'> {
  text: string
  tooltip?: string
}

function Label({ text, tooltip, className, ...restProps }: LabelProps) {
  return (
  <label
    className={`text-sm font-semibold whitespace-nowrap ${className}`}
    title={tooltip}
    {...restProps}
  >
    {text}
  </label>);
}

export default Label;
