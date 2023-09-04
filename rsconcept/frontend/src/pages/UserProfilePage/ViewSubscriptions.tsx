import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import ConceptDataTable from '../../components/Common/ConceptDataTable';
import { useConceptNavigation } from '../../context/NagivationContext';
import { ILibraryItem } from '../../utils/models';

interface ViewSubscriptionsProps {
  items: ILibraryItem[]
}

function ViewSubscriptions({items}: ViewSubscriptionsProps) {
  const { navigateTo } = useConceptNavigation();
  const intl = useIntl();

  const openRSForm = (item: ILibraryItem) => navigateTo(`/rsforms/${item.id}`);

  const columns = useMemo(() =>
  [
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
      name: 'Обновлена',
      id: 'time_update',
      selector: (item: ILibraryItem) => item.time_update,
      format: (item: ILibraryItem) => new Date(item.time_update).toLocaleString(intl.locale),
      sortable: true,
      reorder: true
    }
  ], [intl]);

  return (
    <ConceptDataTable
      className='h-full overflow-auto border'
      columns={columns}
      data={items}
      defaultSortFieldId='time_update'
      defaultSortAsc={false}

      noDataComponent={
        <div className='h-[10rem]'>Отслеживаемые схемы отсутствуют</div>
      }

      striped
      dense
      highlightOnHover
      pointerOnHover
      onRowClicked={openRSForm}
    />
  )
}

export default ViewSubscriptions;
