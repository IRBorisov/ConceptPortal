import clsx from 'clsx';

import { CProps } from '../props';

/**
 * `flex` column container.
 * This component is useful for creating vertical layouts with flexbox.
 */
export function FlexColumn({ className, children, ...restProps }: CProps.Div) {
  return (
    <div className={clsx('cc-column', className)} {...restProps}>
      {children}
    </div>
  );
}
