import { IRSForm } from '../../utils/models'
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import DataTableThemed from '../../components/Common/DataTableThemed';
import { useUsers } from '../../context/UsersContext';


interface RSFormsTableProps {
  schemas: IRSForm[]
}

function RSFormsTable({schemas}: RSFormsTableProps) {
  const navigate = useNavigate();
  const intl = useIntl();
  const { getUserLabel } = useUsers();

  const openRSForm = (row: IRSForm, event: React.MouseEvent<Element, MouseEvent>) => {
    navigate(`/rsforms/${row.id}`);
  };

  const columns = useMemo(() => 
    [
      {
        name: 'Шифр',
        id: 'alias',
        maxWidth: '140px',
        selector: (schema: IRSForm) => schema.alias,
        sortable: true,
        reorder: true
      },
      {
        name: 'Название',
        id: 'title',
        minWidth: '50%',
        selector: (schema: IRSForm) => schema.title,
        sortable: true,
        reorder: true
      },
      {
        name: 'Владелец',
        id: 'owner',
        selector: (schema: IRSForm) => schema.owner || 0,
        format: (schema: IRSForm) => {
          return getUserLabel(schema.owner);
        },
        sortable: true,
        reorder: true
      },
      {
        name: 'Обновлена',
        id: 'time_update',
        selector: (row: IRSForm) => row.time_update,
        format: (row: IRSForm) => new Date(row.time_update).toLocaleString(intl.locale),
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
      pagination
      paginationPerPage={50}
      paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
      onRowClicked={openRSForm}
    />
  );
}

export default RSFormsTable;
