import { LabelHTMLAttributes } from 'react';

interface LabelProps 
extends Omit<React.DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>, 'children'> {
  text: string
  required?: boolean
}

function Label({ text, required, title, className, ...props }: LabelProps) {
  return (
    <label
      className={`${className} text-sm font-semibold`}
      title={ (required && !title) ? 'обязательное поле' : title }
      {...props}
    >
      {text + (required ? '*' : '')}
    </label>
  );
}

export default Label;
