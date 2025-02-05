'use client';

import { useEffect } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import NoData from '@/components/ui/NoData';
import TextContent from '@/components/ui/TextContent';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { APP_COLORS } from '@/styling/color';
import { PARAMETER, prefixes } from '@/utils/constants';
import { describeConstituenta } from '@/utils/labels';

const DESCRIPTION_MAX_SYMBOLS = 280;

interface TableSideConstituentsProps {
  items: IConstituenta[];
  activeCst?: IConstituenta;
  onOpenEdit: (cstID: ConstituentaID) => void;
  autoScroll?: boolean;
  maxHeight: string;
}

const columnHelper = createColumnHelper<IConstituenta>();

function TableSideConstituents({
  items,
  activeCst,
  autoScroll = true,
  onOpenEdit,
  maxHeight
}: TableSideConstituentsProps) {
  useEffect(() => {
    if (!activeCst) {
      return;
    }
    if (autoScroll) {
      setTimeout(() => {
        const element = document.getElementById(`${prefixes.cst_side_table}${activeCst.id}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'end'
          });
        }
      }, PARAMETER.refreshTimeout);
    }
  }, [activeCst, autoScroll]);

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: () => <span className='pl-3'>Имя</span>,
      size: 65,
      minSize: 65,
      footer: undefined,
      cell: props => (
        <BadgeConstituenta className='mr-[-0.5rem]' value={props.row.original} prefixID={prefixes.cst_side_table} />
      )
    }),
    columnHelper.accessor(cst => describeConstituenta(cst), {
      id: 'description',
      header: 'Описание',
      size: 1000,
      minSize: 250,
      maxSize: 1000,
      cell: props => (
        <TextContent
          noTooltip
          text={props.getValue()}
          maxLength={DESCRIPTION_MAX_SYMBOLS}
          style={{
            textWrap: 'pretty',
            fontSize: 12
          }}
        />
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<IConstituenta>[] = [
    {
      when: (cst: IConstituenta) => !!activeCst && cst.id === activeCst?.id,
      style: {
        backgroundColor: APP_COLORS.bgSelected
      }
    },
    {
      when: (cst: IConstituenta) => !!activeCst && cst.spawner === activeCst?.id && cst.id !== activeCst?.id,
      style: {
        backgroundColor: APP_COLORS.bgOrange50
      }
    },
    {
      when: (cst: IConstituenta) => activeCst?.id !== undefined && cst.spawn.includes(activeCst.id),
      style: {
        backgroundColor: APP_COLORS.bgGreen50
      }
    }
  ];

  return (
    <DataTable
      dense
      noFooter
      className='text-sm select-none cc-scroll-y'
      style={{ maxHeight: maxHeight }}
      data={items}
      columns={columns}
      conditionalRowStyles={conditionalRowStyles}
      headPosition='0'
      enableHiding
      noDataComponent={
        <NoData className='min-h-[5rem]'>
          <p>Список конституент пуст</p>
          <p>Измените параметры фильтра</p>
        </NoData>
      }
      onRowClicked={cst => onOpenEdit(cst.id)}
    />
  );
}

export default TableSideConstituents;
