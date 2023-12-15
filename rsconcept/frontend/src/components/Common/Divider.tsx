import clsx from 'clsx';

interface DividerProps {
  vertical?: boolean
  margins?: string
}

function Divider({ vertical, margins = 'mx-2' }: DividerProps) {
  return (
  <div className={clsx(
    margins, 
    {
      'border-x h-full': vertical,
      'border-y w-full': !vertical
    }
  )}/>);
}

export default Divider;