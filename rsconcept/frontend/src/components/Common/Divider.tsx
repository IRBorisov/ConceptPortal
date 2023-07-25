interface DividerProps {
  vertical?: boolean
  margins?: string
}

function Divider({ vertical, margins = '2' }: DividerProps) {
  return (
    <>
    {vertical && <div className={`mx-${margins} border-x-2`} />}
    {!vertical && <div className={`my-${margins} border-y-2`} />}
    </>
  );
}

export default Divider;
