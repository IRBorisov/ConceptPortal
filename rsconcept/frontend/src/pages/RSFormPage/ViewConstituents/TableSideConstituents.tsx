'use client';

import { useCallback, useLayoutEffect, useMemo } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import NoData from '@/components/ui/NoData';
import TextContent from '@/components/ui/TextContent';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
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
  const { colors } = useConceptOptions();

  useLayoutEffect(() => {
    if (!activeCst) {
      return;
    }
    if (autoScroll) {
      setTimeout(() => {
        const element = document.getElementById(`${prefixes.cst_side_table}${activeCst.alias}`);
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

  const handleRowClicked = useCallback(
    (cst: IConstituenta) => {
      if (!isMockCst(cst)) {
        onOpenEdit(cst.id);
      }
    },
    [onOpenEdit]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: () => <span className='pl-3'>Имя</span>,
        size: 65,
        minSize: 65,
        footer: undefined,
        cell: props => (
          <BadgeConstituenta theme={colors} value={props.row.original} prefixID={prefixes.cst_side_table} />
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
              fontSize: 12,
              color: isMockCst(props.row.original) ? colors.fgWarning : undefined
            }}
          />
        )
      })
    ],
    [colors]
  );

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<IConstituenta>[] => [
      {
        when: (cst: IConstituenta) => !!activeCst && cst.id === activeCst?.id,
        style: {
          backgroundColor: colors.bgSelected
        }
      },
      {
        when: (cst: IConstituenta) => !!activeCst && cst.parent === activeCst?.id && cst.id !== activeCst?.id,
        style: {
          backgroundColor: colors.bgOrange50
        }
      },
      {
        when: (cst: IConstituenta) => activeCst?.id !== undefined && cst.children.includes(activeCst.id),
        style: {
          backgroundColor: colors.bgGreen50
        }
      }
    ],
    [activeCst, colors]
  );

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
      onRowClicked={handleRowClicked}
    />
  );
}

export default TableSideConstituents;
