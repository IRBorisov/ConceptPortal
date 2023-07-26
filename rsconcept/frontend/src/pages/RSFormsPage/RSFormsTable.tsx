import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import DataTableThemed from '../../components/Common/DataTableThemed';
import { useUsers } from '../../context/UsersContext';
import { IRSFormMeta } from '../../utils/models'

interface RSFormsTableProps {
  schemas: IRSFormMeta[]
}

function RSFormsTable({ schemas }: RSFormsTableProps) {
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();

  const openRSForm = (schema: IRSFormMeta) => {
    navigate(`/rsforms/${schema.id}`);
  };

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
    ], [intl, getUserLabel]
  );

  return (
    <DataTableThemed
      columns={columns}
      data={schemas}
      defaultSortFieldId='time_update'
      defaultSortAsc={false}
      striped
      highlightOnHover
      pointerOnHover

      noDataComponent={<span className='flex flex-col justify-center p-2 text-center'>
        <p>Список схем пуст</p>
        <p>Измените фильтр или создайти новую концептуальную схему</p>
      </span>}

      pagination
      paginationPerPage={50}
      paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      onRowClicked={openRSForm}
    />
  );
}

export default RSFormsTable;
