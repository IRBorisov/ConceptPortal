import clsx from 'clsx';

import { CProps } from '@/components/props';

interface DividerProps extends CProps.Styling {
  vertical?: boolean;
  margins?: string;
}

function Divider({ vertical, margins = 'mx-2', className, ...restProps }: DividerProps) {
  return (
    <div
      className={clsx(
        margins, //prettier: split-lines
        className,
        {
          'border-x': vertical,
          'border-y': !vertical
        }
      )}
      {...restProps}
    />
  );
}

export default Divider;
