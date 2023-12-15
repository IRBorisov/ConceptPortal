import { Column } from '@tanstack/react-table';

import { AscendingIcon, DescendingIcon } from '@/components/Icons';

interface SortingIconProps<TData> {
  column: Column<TData>
}

function SortingIcon<TData>({ column }: SortingIconProps<TData>) {  
  return (<>
    {{
      desc: <DescendingIcon size={4} />,
      asc: <AscendingIcon size={4}/>,
    }[column.getIsSorted() as string] ?? 
      <DescendingIcon size={4} color='opacity-0 hover:opacity-50' />
    }
  </>);
}

export default SortingIcon;