import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper } from '../../components/DataTable';
import { useConceptNavigation } from '../../context/NagivationContext';
import { ILibraryItem } from '../../models/library';

interface ViewSubscriptionsProps {
  items: ILibraryItem[]
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewSubscriptions({items}: ViewSubscriptionsProps) {
  const { navigateTo } = useConceptNavigation();
  const intl = useIntl();

  const openRSForm = (item: ILibraryItem) => navigateTo(`/rsforms/${item.id}`);

  const columns = useMemo(() =>
  [
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
      size: 800,
      maxSize: 800,
      enableSorting: true
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
  ], [intl]);

  return (
    <div className='h-full overflow-auto text-sm border w-fit'>
    <DataTable
      columns={columns}
      data={items}

      dense
      enableSorting
      initialSorting={{
        id: 'time_update',
        desc: true
      }}
      noDataComponent={
        <div className='h-[10rem]'>Отслеживаемые схемы отсутствуют</div>
      }

      onRowClicked={openRSForm}
    />
    </div>
  )
}

export default ViewSubscriptions;
