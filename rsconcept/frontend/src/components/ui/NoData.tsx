import clsx from 'clsx';

import { CProps } from '../props';

/**
 * Wraps content in a div with a centered text.
 */
function NoData({ className, children, ...restProps }: CProps.Div) {
  return (
    <div className={clsx('p-3 flex flex-col items-center text-center select-none w-full', className)} {...restProps}>
      {children}
    </div>
  );
}

export default NoData;
