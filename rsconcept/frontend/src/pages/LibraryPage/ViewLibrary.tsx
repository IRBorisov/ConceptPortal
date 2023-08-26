import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import ConceptDataTable from '../../components/Common/ConceptDataTable';
import ConceptTooltip from '../../components/Common/ConceptTooltip';
import MiniButton from '../../components/Common/MiniButton';
import TextURL from '../../components/Common/TextURL';
import HelpLibrary from '../../components/Help/HelpLibrary';
import { EducationIcon, EyeIcon, GroupIcon, HelpIcon, PlusIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UsersContext';
import { prefixes } from '../../utils/constants';
import { ILibraryItem } from '../../utils/models';

interface ViewLibraryProps {
  items: ILibraryItem[]
  cleanQuery: () => void
}

function ViewLibrary({ items, cleanQuery }: ViewLibraryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();

  const openRSForm = (item: ILibraryItem) => navigate(`/rsforms/${item.id}`);

  function handleCreateNew() {
    navigate('/rsform-create');
  }

  const columns = useMemo(
  () => [
    {
      name: '',
      id: 'status',
      minWidth: '60px',
      maxWidth: '60px',
      cell: (item: ILibraryItem) => {
        return (<>
          <div
            className='flex items-center justify-start gap-1'
            id={`${prefixes.library_list}${item.id}`}
          >
            {user && user.subscriptions.includes(item.id) && <EyeIcon size={3}/>}
            {item.is_common && <GroupIcon size={3}/>}
            {item.is_canonical && <EducationIcon size={3}/>}
          </div>
        </>);
      },
      sortable: true,
      reorder: true
    },
    {
      name: 'Шифр',
      id: 'alias',
      maxWidth: '140px',
      selector: (item: ILibraryItem) => item.alias,
      sortable: true,
      reorder: true
    },
    {
      name: 'Название',
      id: 'title',
      minWidth: '50%',
      selector: (item: ILibraryItem) => item.title,
      sortable: true,
      reorder: true
    },
    {
      name: 'Владелец',
      id: 'owner',
      selector: (item: ILibraryItem) => item.owner ?? 0,
      format: (item: ILibraryItem) => {
        return getUserLabel(item.owner);
      },
      sortable: true,
      reorder: true
    },
    {
      name: 'Обновлена',
      id: 'time_update',
      selector: (item: ILibraryItem) => item.time_update,
      format: (item: ILibraryItem) => new Date(item.time_update).toLocaleString(intl.locale),
      sortable: true,
      reorder: true
    }
  ], [intl, getUserLabel, user]);
  
  return (
    <div>
      <div className='relative w-full'>
      <div className='absolute top-0 left-0 z-20 flex gap-1 mt-2 ml-1'>
        <MiniButton
          onClick={handleCreateNew}
          tooltip='Создать схему'
          noHover
          disabled={!user || !user.id}
          icon={<PlusIcon color={!user || !user.id ? '' : 'text-primary'} size={5} />}
        />
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
    <ConceptDataTable
      columns={columns}
      data={items}
      defaultSortFieldId='time_update'
      defaultSortAsc={false}
      striped
      highlightOnHover
      pointerOnHover

      noDataComponent={
      <div className='flex flex-col gap-4 justify-center p-2 text-center min-h-[10rem]'>
        <p><b>Список схем пуст</b></p>
        <p>
          <TextURL text='Создать схему' href='/rsform-create'/>
          <span> | </span>
          <TextURL text='Все схемы' href='/library?filter=common'/>
          <span> | </span>
          <span className='cursor-pointer hover:underline text-url' onClick={cleanQuery}>
            <b>Очистить фильтр</b>
          </span>
        </p>
      </div>}

      pagination
      paginationPerPage={50}
      paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      onRowClicked={openRSForm}
    />
    </div>
  );
}

export default ViewLibrary;
