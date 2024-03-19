import clsx from 'clsx';

import { CProps } from '../props';

export interface FlexColumnProps extends CProps.Div {}

function FlexColumn({ className, children, ...restProps }: FlexColumnProps) {
  return (
    <div className={clsx('cc-column', className)} {...restProps}>
      {children}
    </div>
  );
}

export default FlexColumn;
