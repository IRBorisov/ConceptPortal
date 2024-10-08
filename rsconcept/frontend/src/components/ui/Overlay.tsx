import clsx from 'clsx';

import { CProps } from '../props';

interface OverlayProps extends CProps.Styling {
  id?: string;
  position?: string;
  layer?: string;
}

function Overlay({
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

export default Overlay;
