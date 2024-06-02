import clsx from 'clsx';

import { CProps } from '../props';

interface LabeledValueProps extends CProps.Styling {
  id?: string;
  label: string;
  text: string | number;
  title?: string;
}

function LabeledValue({ id, label, text, title, className, ...restProps }: LabeledValueProps) {
  return (
    <div className={clsx('flex justify-between gap-6', className)} {...restProps}>
      <span title={title}>{label}</span>
      <span id={id}>{text}</span>
    </div>
  );
}

export default LabeledValue;
