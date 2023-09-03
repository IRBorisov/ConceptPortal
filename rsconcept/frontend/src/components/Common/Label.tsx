import { LabelHTMLAttributes } from 'react';

interface LabelProps 
extends Omit<React.DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, 'children'> {
  text: string
  required?: boolean
}

function Label({ text, required, title, className, ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-semibold ${className}`}
      title={ (required && !title) ? 'обязательное поле' : title }
      {...props}
    >
      {text + (required ? '*' : '')}
    </label>
  );
}

export default Label;
