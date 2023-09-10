interface DividerProps {
  vertical?: boolean
  margins?: string
}

function Divider({ vertical, margins = 'mx-2' }: DividerProps) {
  return (
    <div className={`${margins} ${vertical ? 'border-x-2 h-full': 'border-y-2 w-full'}`} />
  );
}

export default Divider;
