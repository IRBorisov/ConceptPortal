import clsx from 'clsx';

import { CProps } from '@/components/props';

/**
 * `flex` column container.
 * This component is useful for creating vertical layouts with flexbox.
 */
function FlexColumn({ className, children, ...restProps }: CProps.Div) {
  return (
    <div className={clsx('cc-column', className)} {...restProps}>
      {children}
    </div>
  );
}

export default FlexColumn;
