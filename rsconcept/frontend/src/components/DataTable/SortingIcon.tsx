import { Column } from '@tanstack/react-table';
import { BiCaretDown, BiCaretUp } from 'react-icons/bi';

interface SortingIconProps<TData> {
  column: Column<TData>
}

function SortingIcon<TData>({ column }: SortingIconProps<TData>) {  
  return (<>
    {{
      desc: <BiCaretDown size='1rem' />,
      asc: <BiCaretUp size='1rem'/>,
    }[column.getIsSorted() as string] ?? 
      <BiCaretDown size='1rem' className='opacity-0 hover:opacity-50' />
    }
  </>);
}

export default SortingIcon;