interface DropdownProps {
  children: React.ReactNode
  stretchLeft?: boolean
  widthClass?: string
}

function Dropdown({ children, widthClass = 'w-fit', stretchLeft }: DropdownProps) {
  return (
    <div className='relative text-sm'>
    <div className={`absolute ${stretchLeft ? 'right-0' : 'left-0'} mt-2 py-1 z-tooltip flex flex-col items-stretch justify-start origin-top-right border divide-y divide-inherit rounded-md shadow-lg clr-input ${widthClass}`}>
      {children}
    </div>
    </div>
  );
}

export default Dropdown;
