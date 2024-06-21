'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { urls } from '@/app/urls';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import NoData from '@/components/ui/NoData';
import { useConceptNavigation } from '@/context/NavigationContext';
import { ILibraryItem } from '@/models/library';
import { animateSideView } from '@/styling/animations';

interface ViewSubscriptionsProps {
  items: ILibraryItem[];
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewSubscriptions({ items }: ViewSubscriptionsProps) {
  const router = useConceptNavigation();
  const intl = useIntl();

  const openRSForm = (item: ILibraryItem) => router.push(urls.schema(item.id));

  const columns = useMemo(
    () => [
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
        size: 2000,
        maxSize: 2000,
        enableSorting: true
      }),
      columnHelper.accessor('time_update', {
        id: 'time_update',
        header: 'Обновлена',
        minSize: 150,
        size: 150,
        maxSize: 150,
        cell: props => (
          <div className='text-sm whitespace-nowrap'>{new Date(props.getValue()).toLocaleString(intl.locale)}</div>
        ),
        enableSorting: true
      })
    ],
    [intl]
  );

  return (
    <motion.div
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
    >
      <h1 className='mb-6 select-none'>Отслеживаемые схемы</h1>
      <DataTable
        dense
        noFooter
        className='max-h-[23.8rem] cc-scroll-y text-sm border'
        columns={columns}
        data={items}
        headPosition='0'
        enableSorting
        initialSorting={{
          id: 'time_update',
          desc: true
        }}
        noDataComponent={<NoData className='h-[10rem]'>Отслеживаемые схемы отсутствуют</NoData>}
        onRowClicked={openRSForm}
      />
    </motion.div>
  );
}

export default ViewSubscriptions;
