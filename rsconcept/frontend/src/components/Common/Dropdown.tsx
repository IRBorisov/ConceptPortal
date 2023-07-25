interface DropdownProps {
  children: React.ReactNode
  stretchLeft?: boolean
  widthClass?: string
}

function Dropdown({ children, widthClass = 'w-fit', stretchLeft }: DropdownProps) {
  return (
    <div className='relative'>
    <div className={`absolute ${stretchLeft ? 'right-0' : 'left-0'} py-2 z-10 flex flex-col items-stretch justify-start px-2 mt-2 text-sm origin-top-right bg-white border border-gray-100 divide-y rounded-md shadow-lg dark:border-gray-500 dark:bg-gray-900 ${widthClass}`}>
      {children}
    </div>
    </div>
  );
}

export default Dropdown;
