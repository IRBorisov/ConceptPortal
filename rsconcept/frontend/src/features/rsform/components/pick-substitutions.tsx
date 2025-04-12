'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { type ILibraryItem } from '@/features/library';
import { SelectLibraryItem } from '@/features/library/components';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconAccept, IconPageLeft, IconPageRight, IconRemove, IconReplace } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';
import { APP_COLORS } from '@/styling/colors';
import { errorMsg } from '@/utils/labels';

import { type ICstSubstitute } from '../backend/types';
import { type IConstituenta, type IRSForm } from '../models/rsform';

import { BadgeConstituenta } from './badge-constituenta';
import { SelectConstituenta } from './select-constituenta';

interface IMultiSubstitution {
  original_source: ILibraryItem;
  original: IConstituenta;
  substitution: IConstituenta;
  substitution_source: ILibraryItem;
  is_suggestion: boolean;
}

interface PickSubstitutionsProps extends Styling {
  value: ICstSubstitute[];
  onChange: (newValue: ICstSubstitute[]) => void;

  suggestions?: ICstSubstitute[];

  rows?: number;
  allowSelfSubstitution?: boolean;

  schemas: IRSForm[];
  filterCst?: (cst: IConstituenta) => boolean;
}

const columnHelper = createColumnHelper<IMultiSubstitution>();

export function PickSubstitutions({
  value,
  onChange,
  suggestions,
  rows,
  schemas,
  filterCst,
  allowSelfSubstitution,
  className,
  ...restProps
}: PickSubstitutionsProps) {
  const [leftArgument, setLeftArgument] = useState<ILibraryItem | null>(schemas.length === 1 ? schemas[0] : null);
  const [rightArgument, setRightArgument] = useState<ILibraryItem | null>(
    schemas.length === 1 && allowSelfSubstitution ? schemas[0] : null
  );
  const leftItems = !leftArgument
    ? []
    : (leftArgument as IRSForm).items.filter(
        cst => !value.find(item => item.original === cst.id) && (!filterCst || filterCst(cst))
      );

  const [leftCst, setLeftCst] = useState<IConstituenta | null>(null);
  const [rightCst, setRightCst] = useState<IConstituenta | null>(null);
  const rightItems = !rightArgument
    ? []
    : (rightArgument as IRSForm).items.filter(
        cst => !value.find(item => item.original === cst.id) && (!filterCst || filterCst(cst))
      );

  const [deleteRight, setDeleteRight] = useState(true);
  const toggleDelete = () => setDeleteRight(prev => !prev);

  const [ignores, setIgnores] = useState<ICstSubstitute[]>([]);
  const filteredSuggestions =
    suggestions?.filter(
      item => !ignores.find(ignore => ignore.original === item.original && ignore.substitution === item.substitution)
    ) ?? [];

  const substitutionData: IMultiSubstitution[] = [
    ...value.map(item => ({
      original_source: getSchemaByCst(item.original)!,
      original: getConstituenta(item.original)!,
      substitution: getConstituenta(item.substitution)!,
      substitution_source: getSchemaByCst(item.substitution)!,
      is_suggestion: false
    })),
    ...filteredSuggestions.map(item => ({
      original_source: getSchemaByCst(item.original)!,
      original: getConstituenta(item.original)!,
      substitution: getConstituenta(item.substitution)!,
      substitution_source: getSchemaByCst(item.substitution)!,
      is_suggestion: true
    }))
  ];

  function getSchemaByCst(id: number): IRSForm | undefined {
    for (const schema of schemas) {
      const cst = schema.cstByID.get(id);
      if (cst) {
        return schema;
      }
    }
    return undefined;
  }

  function getConstituenta(id: number): IConstituenta | undefined {
    for (const schema of schemas) {
      const cst = schema.cstByID.get(id);
      if (cst) {
        return cst;
      }
    }
    return undefined;
  }

  function addSubstitution() {
    if (!leftCst || !rightCst) {
      return;
    }
    const newSubstitution: ICstSubstitute = {
      original: deleteRight ? rightCst.id : leftCst.id,
      substitution: deleteRight ? leftCst.id : rightCst.id
    };
    const toDelete = value.map(item => item.original);
    const replacements = value.map(item => item.substitution);
    if (
      toDelete.includes(newSubstitution.original) ||
      toDelete.includes(newSubstitution.substitution) ||
      replacements.includes(newSubstitution.original)
    ) {
      toast.error(errorMsg.reuseOriginal);
      return;
    }
    if (leftArgument === rightArgument) {
      if ((deleteRight && rightCst?.is_inherited) || (!deleteRight && leftCst?.is_inherited)) {
        toast.error(errorMsg.substituteInherited);
        return;
      }
    }
    onChange([...value, newSubstitution]);
    setLeftCst(null);
    setRightCst(null);
  }

  function handleDeclineSuggestion(item: IMultiSubstitution) {
    setIgnores([...value, { original: item.original.id, substitution: item.substitution.id }]);
  }

  function handleAcceptSuggestion(item: IMultiSubstitution) {
    onChange([...value, { original: item.original.id, substitution: item.substitution.id }]);
  }

  function handleDeleteSubstitution(target: IMultiSubstitution) {
    handleDeclineSuggestion(target);
    onChange(
      value.filter(item => item.original !== target.original.id || item.substitution !== target.substitution.id)
    );
  }

  const columns = [
    columnHelper.accessor(item => item.substitution_source.alias, {
      id: 'left_schema',
      size: 100,
      cell: props => <div className='min-w-43 text-ellipsis text-left'>{props.getValue()}</div>
    }),
    columnHelper.accessor(item => item.substitution.alias, {
      id: 'left_alias',
      size: 65,
      cell: props => <BadgeConstituenta value={props.row.original.substitution} />
    }),
    columnHelper.display({
      id: 'status',
      size: 0,
      cell: () => <IconPageRight size='1.2rem' />
    }),
    columnHelper.accessor(item => item.original.alias, {
      id: 'right_alias',
      size: 65,
      cell: props => <BadgeConstituenta value={props.row.original.original} />
    }),
    columnHelper.accessor(item => item.original_source.alias, {
      id: 'right_schema',
      size: 100,
      cell: props => <div className='min-w-32 text-ellipsis text-right'>{props.getValue()}</div>
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props =>
        props.row.original.is_suggestion ? (
          <div className='max-w-fit'>
            <MiniButton
              title='Принять предложение'
              noHover
              icon={<IconAccept size='1rem' className='icon-green' />}
              onClick={() => handleAcceptSuggestion(props.row.original)}
            />
            <MiniButton
              title='Игнорировать предложение'
              noHover
              icon={<IconRemove size='1rem' className='icon-red' />}
              onClick={() => handleDeclineSuggestion(props.row.original)}
            />
          </div>
        ) : (
          <div className='max-w-fit'>
            <MiniButton
              title='Удалить'
              noHover
              icon={<IconRemove size='1rem' className='icon-red' />}
              onClick={() => handleDeleteSubstitution(props.row.original)}
            />
          </div>
        )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<IMultiSubstitution>[] = [
    {
      when: (item: IMultiSubstitution) => item.is_suggestion,
      style: { backgroundColor: APP_COLORS.bgOrange50 }
    }
  ];

  return (
    <div className={cn('flex flex-col', className)} {...restProps}>
      <div className='flex items-center gap-3'>
        <div className='w-60 grow flex flex-col basis-1/2 gap-1 border-x border-t bg-input rounded-t-md'>
          <SelectLibraryItem
            id='substitute-left-schema'
            noBorder
            placeholder='Выберите аргумент'
            items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== rightArgument?.id)}
            value={leftArgument}
            onChange={setLeftArgument}
          />
          <SelectConstituenta noBorder items={leftItems} value={leftCst} onChange={setLeftCst} />
        </div>
        <div className='flex flex-col justify-center gap-1'>
          <MiniButton
            title={deleteRight ? 'Заменить правую' : 'Заменить левую'}
            onClick={toggleDelete}
            icon={
              deleteRight ? (
                <IconPageRight size='1.5rem' className='text-primary' />
              ) : (
                <IconPageLeft size='1.5rem' className='text-primary' />
              )
            }
          />
          <MiniButton
            title='Добавить в таблицу отождествлений'
            className='grow-0'
            icon={<IconReplace size='1.5rem' className='icon-primary' />}
            onClick={addSubstitution}
            disabled={!leftCst || !rightCst || (leftCst === rightCst && !allowSelfSubstitution)}
          />
        </div>

        <div className='w-60 grow basis-1/2 flex flex-col gap-1 border-x border-t bg-input rounded-t-md'>
          <SelectLibraryItem
            id='substitute-right-schema'
            noBorder
            placeholder='Выберите аргумент'
            items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== leftArgument?.id)}
            value={rightArgument}
            onChange={setRightArgument}
          />
          <SelectConstituenta noBorder items={rightItems} value={rightCst} onChange={setRightCst} />
        </div>
      </div>

      <DataTable
        dense
        noHeader
        noFooter
        className='text-sm border rounded-t-none select-none cc-scroll-y'
        rows={rows}
        contentHeight='1.3rem'
        data={substitutionData}
        columns={columns}
        headPosition='0'
        noDataComponent={
          <NoData className='min-h-8'>
            <p>Список пуст</p>
            <p>Добавьте отождествление</p>
          </NoData>
        }
        conditionalRowStyles={conditionalRowStyles}
      />
    </div>
  );
}
