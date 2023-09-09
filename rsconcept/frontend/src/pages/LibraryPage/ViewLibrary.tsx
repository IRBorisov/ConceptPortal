import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import ConceptTooltip from '../../components/Common/ConceptTooltip';
import DataTable from '../../components/Common/DataTable';
import TextURL from '../../components/Common/TextURL';
import HelpLibrary from '../../components/Help/HelpLibrary';
import { EducationIcon, EyeIcon, GroupIcon, HelpIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useConceptNavigation } from '../../context/NagivationContext';
import { useUsers } from '../../context/UsersContext';
import { prefixes } from '../../utils/constants';
import { ILibraryItem } from '../../utils/models';

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

  const openRSForm = (item: ILibraryItem) => navigateTo(`/rsforms/${item.id}`);

  const columns = useMemo(
  () => [
    columnHelper.display({
      id: 'status',
      header: '',
      size: 60,
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
      enableSorting: true
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: 'Название',
      minSize: 200,
      size: 1000,
      maxSize: 1000,
      enableSorting: true
    }),
    columnHelper.accessor(item => item.owner ?? 0, {
      id: 'owner',
      header: 'Владелец',
      cell: props => getUserLabel(props.cell.getValue()),
      enableSorting: true,
      enableResizing: false,
      minSize: 200,
      size: 300,
      maxSize: 300
    }),
    columnHelper.accessor('time_update', {
      id: 'time_update',
      header: 'Обновлена',
      minSize: 200,
      size: 200,
      maxSize: 200,
      cell: props => new Date(props.cell.getValue()).toLocaleString(intl.locale),
      enableSorting: true
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
      // defaultSortFieldId='time_update'
      // defaultSortAsc={false}

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

      // pagination
      // paginationPerPage={50}
      // paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      onRowClicked={openRSForm}
    />
    </div>
  );
}

export default ViewLibrary;
