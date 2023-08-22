import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import ConceptDataTable from '../../components/Common/ConceptDataTable';
import TextURL from '../../components/Common/TextURL';
import { useNavSearch } from '../../context/NavSearchContext';
import { useUsers } from '../../context/UsersContext';
import { IRSFormMeta } from '../../utils/models'

interface ViewLibraryProps {
  schemas: IRSFormMeta[]
}

function ViewLibrary({ schemas }: ViewLibraryProps) {
  const { resetQuery: cleanQuery } = useNavSearch();
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();

  const openRSForm = (schema: IRSFormMeta) => navigate(`/rsforms/${schema.id}`);

  const columns = useMemo(() =>
  [
    {
      name: 'Шифр',
      id: 'alias',
      maxWidth: '140px',
      selector: (schema: IRSFormMeta) => schema.alias,
      sortable: true,
      reorder: true
    },
    {
      name: 'Название',
      id: 'title',
      minWidth: '50%',
      selector: (schema: IRSFormMeta) => schema.title,
      sortable: true,
      reorder: true
    },
    {
      name: 'Владелец',
      id: 'owner',
      selector: (schema: IRSFormMeta) => schema.owner ?? 0,
      format: (schema: IRSFormMeta) => {
        return getUserLabel(schema.owner);
      },
      sortable: true,
      reorder: true
    },
    {
      name: 'Обновлена',
      id: 'time_update',
      selector: (schema: IRSFormMeta) => schema.time_update,
      format: (schema: IRSFormMeta) => new Date(schema.time_update).toLocaleString(intl.locale),
      sortable: true,
      reorder: true
    }
  ], [intl, getUserLabel]);
  
  return (
    <ConceptDataTable
      columns={columns}
      data={schemas}
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
  );
}

export default ViewLibrary;
