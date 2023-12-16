import { Column } from '@tanstack/react-table';

import { AscendingIcon, DescendingIcon } from '@/components/Icons';

interface SortingIconProps<TData> {
  column: Column<TData>
}

function SortingIcon<TData>({ column }: SortingIconProps<TData>) {  
  return (<>
    {{
      desc: <DescendingIcon size='1rem' />,
      asc: <AscendingIcon size='1rem'/>,
    }[column.getIsSorted() as string] ?? 
      <DescendingIcon size='1rem' className='opacity-0 hover:opacity-50' />
    }
  </>);
}

export default SortingIcon;