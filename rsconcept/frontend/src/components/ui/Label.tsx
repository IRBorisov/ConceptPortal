import clsx from 'clsx';

import { CProps } from '../props';

interface LabelProps extends CProps.Label {
  text?: string;
}

function Label({ text, className, ...restProps }: LabelProps) {
  if (!text) {
    return null;
  }
  if (restProps.htmlFor) {
    return (
      <label className={clsx('text-sm font-medium whitespace-nowrap', className)} {...restProps}>
        {text}
      </label>
    );
  } else {
    return (
      <span className={clsx('text-sm font-medium whitespace-nowrap', className)} {...restProps}>
        {text}
      </span>
    );
  }
}

export default Label;
