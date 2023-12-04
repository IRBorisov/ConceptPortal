import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import TextURL from '../../components/Common/TextURL';
import DataTable, { createColumnHelper } from '../../components/DataTable';
import HelpButton from '../../components/Help/HelpButton';
import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useUsers } from '../../context/UsersContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ILibraryItem } from '../../models/library';
import { HelpTopic } from '../../models/miscelanious';
import ItemIcons from './ItemIcons';

interface ViewLibraryProps {
  items: ILibraryItem[]
  resetQuery: () => void
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewLibrary({ items, resetQuery: cleanQuery }: ViewLibraryProps) {
  const { navigateTo } = useConceptNavigation();
  const intl = useIntl();
  const { user } = useAuth();
  const { getUserLabel } = useUsers();
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('library_per_page', 50);

  const handleOpenItem = (item: ILibraryItem) => navigateTo(`/rsforms/${item.id}`);

  const columns = useMemo(
  () => [
    columnHelper.display({
      id: 'status',
      header: '',
      size: 60,
      minSize: 60,
      maxSize: 60,
      cell: props => 
        <ItemIcons
          item={props.row.original}
          user={user}
        />,
    }),
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Шифр',
      size: 200,
      minSize: 200,
      maxSize: 200,
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: 'Название',
      size: 2000,
      minSize: 400,
      maxSize: 2000,
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor(item => item.owner ?? 0, {
      id: 'owner',
      header: 'Владелец',
      size: 600,
      minSize: 200,
      maxSize: 600,
      cell: props => getUserLabel(props.cell.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: 'Обновлена',
      size: 150,
      minSize: 150,
      maxSize: 150,
      cell: props =>
        <div className='text-sm min-w-[8.25rem]'>
          {new Date(props.cell.getValue()).toLocaleString(intl.locale)}
        </div>,
      enableSorting: true,
      sortingFn: 'datetime',
      sortDescFirst: true
    })
  ], [intl, getUserLabel, user]);
  
  return (
  <>
    <div className='sticky top-[2.3rem] w-full'>
    <div className='absolute top-[0.125rem] left-[0.25rem] flex gap-1 ml-3 z-pop'>
      <HelpButton
        topic={HelpTopic.LIBRARY}
        dimensions='max-w-[35rem]'
        offset={0}
      />
    </div>
    </div>
    <DataTable
      columns={columns}
      data={items}

      headPosition='2.3rem'
      noDataComponent={
      <div className='p-3 text-center min-h-[6rem]'>
        <p>Список схем пуст</p>
        <p className='flex justify-center gap-6 mt-3'>
          <TextURL text='Создать схему' href='/rsform-create'/>
          <TextURL text='Очистить фильтр' onClick={cleanQuery} />
        </p>
      </div>}
      
      onRowClicked={handleOpenItem}

      enableSorting
      initialSorting={{
        id: 'time_update',
        desc: true
      }}

      enablePagination
      paginationPerPage={itemsPerPage}
      onChangePaginationOption={setItemsPerPage}
      paginationOptions={[10, 20, 30, 50, 100]}
    />
  </>);
}

export default ViewLibrary;
