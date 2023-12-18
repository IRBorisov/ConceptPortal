import clsx from 'clsx';

import { classnames } from '@/utils/constants';

import { CProps } from '../props';

export interface FlexColumnProps
extends CProps.Div {}

function FlexColumn({
  className, children,
  ...restProps
}: FlexColumnProps) {
  return (
  <div
    className={clsx(
      classnames.flex_col,
      className
    )}
    {...restProps}
  >
    {children}
  </div>);
}

export default FlexColumn;