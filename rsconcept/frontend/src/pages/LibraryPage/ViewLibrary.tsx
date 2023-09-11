import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import TextURL from '../../components/Common/TextURL';
import DataTable, { createColumnHelper } from '../../components/DataTable';
import HelpLibrary from '../../components/Help/HelpLibrary';
import { EducationIcon, EyeIcon, GroupIcon, HelpIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useUsers } from '../../context/UsersContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ILibraryItem } from '../../models/library';
import { prefixes } from '../../utils/constants';

interface ViewLibraryProps {
  items: ILibraryItem[]
  cleanQuery: () => void
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewLibrary({ items, cleanQuery }: ViewLibraryProps) {
  const { navigateTo } = useConceptNavigation();
  const intl = useIntl();
  const { user } = useAuth();
  const { getUserLabel } = useUsers();

  const [ itemsPerPage, setItemsPerPage ] = useLocalStorage<number>('library_per_page', 50);

  const openRSForm = (item: ILibraryItem) => navigateTo(`/rsforms/${item.id}`);

  const columns = useMemo(
  () => [
    columnHelper.display({
      id: 'status',
      header: '',
      size: 60,
      minSize: 60,
      maxSize: 60,
      cell: props => {
        const item = props.row.original;
        return (<>
          <div
            className='flex items-center justify-start gap-1'
            id={`${prefixes.library_list}${item.id}`}
          >
            {user && user.subscriptions.includes(item.id) && <p title='Отслеживаемая'><EyeIcon size={3}/></p>}
            {item.is_common && <p title='Общедоступная'><GroupIcon size={3}/></p>}
            {item.is_canonical && <p title='Неизменная'><EducationIcon size={3}/></p>}
          </div>
        </>);
      },
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
      size: 1000,
      minSize: 400,
      maxSize: 1000,
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor(item => item.owner ?? 0, {
      id: 'owner',
      header: 'Владелец',
      size: 300,
      minSize: 200,
      maxSize: 300,
      cell: props => getUserLabel(props.cell.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: 'Обновлена',
      size: 220,
      minSize: 220,
      maxSize: 220,
      cell: props => new Date(props.cell.getValue()).toLocaleString(intl.locale),
      enableSorting: true,
      sortingFn: 'datetime',
      sortDescFirst: true
    })
  ], [intl, getUserLabel, user]);
  
  return (
    <div>
      <div className='relative w-full'>
      <div className='absolute top-[-0.125rem] left-0 flex gap-1 ml-3 z-pop'>
        <div id='library-help' className='py-2'>
          <HelpIcon color='text-primary' size={5} />
        </div>
        <ConceptTooltip anchorSelect='#library-help'>
          <div className='max-w-[35rem]'>
            <HelpLibrary />
          </div>
        </ConceptTooltip>
      </div>
      </div>
    <DataTable
      columns={columns}
      data={items}

      noDataComponent={
      <div className='flex flex-col gap-4 justify-center p-2 text-center min-h-[10rem]'>
        <p><b>Список схем пуст</b></p>
        <p>
          <TextURL text='Создать схему' href='/rsform-create'/>
          <span> | </span>
          <TextURL text='Все схемы' href='/library'/>
          <span> | </span>
          <span className='cursor-pointer hover:underline text-url' onClick={cleanQuery}>
            <b>Очистить фильтр</b>
          </span>
        </p>
      </div>}
      
      onRowClicked={openRSForm}

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
    </div>
  );
}

export default ViewLibrary;
