import clsx from 'clsx';

import { type Styling } from '../props';

interface OverlayProps extends Styling {
  /** Id of the overlay. */
  id?: string;

  /** Classnames for position of the overlay. */
  position?: string;

  /** Classname for z-index of the overlay. */
  layer?: string;
}

/**
 * Displays a transparent overlay over the main content.
 */
export function Overlay({
  children,
  className,
  position = 'top-0 right-0',
  layer = 'z-pop',
  ...restProps
}: React.PropsWithChildren<OverlayProps>) {
  return (
    <div className='relative'>
      <div className={clsx('absolute', className, position, layer)} {...restProps}>
        {children}
      </div>
    </div>
  );
}
