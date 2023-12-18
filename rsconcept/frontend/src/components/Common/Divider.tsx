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
      'border-x': vertical,
      'border-y': !vertical
    }
  )}/>);
}

export default Divider;