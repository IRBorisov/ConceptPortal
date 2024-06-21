import clsx from 'clsx';

import { CProps } from '../props';

function FlexColumn({ className, children, ...restProps }: CProps.Div) {
  return (
    <div className={clsx('cc-column', className)} {...restProps}>
      {children}
    </div>
  );
}

export default FlexColumn;
