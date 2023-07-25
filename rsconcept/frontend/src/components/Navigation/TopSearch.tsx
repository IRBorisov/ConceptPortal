import { MagnifyingGlassIcon } from '../Icons';

interface TopSearchProps {
  placeholder: string
}

function TopSearch({ placeholder }: TopSearchProps) {
  return (
    <form action='#' method='GET' className='hidden md:block md:pl-2'>
      <div className='relative md:w-96'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <MagnifyingGlassIcon />
        </div>
        <input
          type='text'
          name='email'
          id='topbar-search'
          className='text-sm block w-full pl-10 p-2.5 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-400 dark:placeholder-gray-200 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
          placeholder={placeholder}
          // onChange={}
        />
      </div>
    </form>
  );
}

export default TopSearch;
