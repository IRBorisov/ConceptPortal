interface DividerProps {
  vertical?: boolean
  margins?: string
}

function Divider({ vertical, margins = 'mx-2' }: DividerProps) {
  return (
    <>
    {vertical && <div className={`${margins} border-x-2 clr-border`} />}
    {!vertical && <div className={`${margins} border-y-2 clr-border`} />}
    </>
  );
}

export default Divider;
