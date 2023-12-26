'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper } from '@/components/DataTable';
import { useConceptNavigation } from '@/context/NavigationContext';
import { ILibraryItem } from '@/models/library';
import { animateSideView } from '@/utils/animations';

interface ViewSubscriptionsProps {
  items: ILibraryItem[]
}

const columnHelper = createColumnHelper<ILibraryItem>();

function ViewSubscriptions({items}: ViewSubscriptionsProps) {
  const router = useConceptNavigation();
  const intl = useIntl();

  const openRSForm = (item: ILibraryItem) => router.push(`/rsforms/${item.id}`);

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
      minSize: 150,
      size: 150,
      maxSize: 150,
      cell: props =>
        <div className='min-w-[8.25rem]'>
          {new Date(props.cell.getValue()).toLocaleString(intl.locale)}
        </div>,
      enableSorting: true
    })
  ], [intl]);

  return (
  <motion.div
    initial={{...animateSideView.initial}}
    animate={{...animateSideView.animate}}
    exit={{...animateSideView.exit}}
  >
    <h1 className='mb-6'>Отслеживаемые схемы</h1>
    <DataTable dense noFooter
      className='max-h-[23.8rem] overflow-y-auto text-sm border'
      columns={columns}
      data={items}
      headPosition='0'

      enableSorting
      initialSorting={{
        id: 'time_update',
        desc: true
      }}
      noDataComponent={
        <div className='h-[10rem]'>
          Отслеживаемые схемы отсутствуют
        </div>
      }

      onRowClicked={openRSForm}
    />
  </motion.div>);
}

export default ViewSubscriptions;