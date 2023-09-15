interface DropdownProps {
  children: React.ReactNode
  stretchLeft?: boolean
  dimensions?: string
}

function Dropdown({ children, dimensions = 'w-fit', stretchLeft }: DropdownProps) {
  return (
    <div className='relative text-sm'>
    <div className={`absolute ${stretchLeft ? 'right-0' : 'left-0'} mt-2 py-1 z-tooltip flex flex-col items-stretch justify-start origin-top-right border divide-y divide-inherit rounded-md shadow-lg clr-input ${dimensions}`}>
      {children}
    </div>
    </div>
  );
}

export default Dropdown;
