interface DividerProps {
  vertical?: boolean
  margins?: string
}

function Divider({ vertical, margins = 'mx-2' }: DividerProps) {
  return (
    <div className={`${margins} ${vertical ? 'border-x h-full': 'border-y w-full'}`} />
  );
}

export default Divider;
