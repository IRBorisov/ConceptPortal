import clsx from 'clsx';

import { CProps } from '../props';

interface ValueLabeledProps extends CProps.Styling {
  id?: string;
  label: string;
  text: string | number;
  title?: string;
}

function ValueLabeled({ id, label, text, title, className, ...restProps }: ValueLabeledProps) {
  return (
    <div className={clsx('flex justify-between gap-6', className)} {...restProps}>
      <span title={title}>{label}</span>
      <span id={id}>{text}</span>
    </div>
  );
}

export default ValueLabeled;
