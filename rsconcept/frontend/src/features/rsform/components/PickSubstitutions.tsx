'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { MiniButton } from '@/components/Control';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/DataTable';
import { IconAccept, IconPageLeft, IconPageRight, IconRemove, IconReplace } from '@/components/Icons';
import { CProps } from '@/components/props';
import { NoData } from '@/components/View';
import { ILibraryItem, SelectLibraryItem } from '@/features/library';
import { APP_COLORS } from '@/styling/colors';
import { errorMsg } from '@/utils/labels';

import { ICstSubstitute } from '../backend/types';
import { IConstituenta, IRSForm } from '../models/rsform';
import BadgeConstituenta from './BadgeConstituenta';
import SelectConstituenta from './SelectConstituenta';

interface IMultiSubstitution {
  original_source: ILibraryItem;
  original: IConstituenta;
  substitution: IConstituenta;
  substitution_source: ILibraryItem;
  is_suggestion: boolean;
}

interface PickSubstitutionsProps extends CProps.Styling {
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
  const [leftArgument, setLeftArgument] = useState<ILibraryItem | undefined>(
    schemas.length === 1 ? schemas[0] : undefined
  );
  const [rightArgument, setRightArgument] = useState<ILibraryItem | undefined>(
    schemas.length === 1 && allowSelfSubstitution ? schemas[0] : undefined
  );

  const [leftCst, setLeftCst] = useState<IConstituenta | undefined>(undefined);
  const [rightCst, setRightCst] = useState<IConstituenta | undefined>(undefined);

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
    setLeftCst(undefined);
    setRightCst(undefined);
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
      cell: props => <div className='min-w-[10.5rem] text-ellipsis text-left'>{props.getValue()}</div>
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
      cell: props => <div className='min-w-[8rem] text-ellipsis text-right'>{props.getValue()}</div>
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props =>
        props.row.original.is_suggestion ? (
          <div className='max-w-fit'>
            <MiniButton
              noHover
              title='Принять предложение'
              icon={<IconAccept size='1rem' className='icon-green' />}
              onClick={() => handleAcceptSuggestion(props.row.original)}
            />
            <MiniButton
              noHover
              title='Игнорировать предложение'
              icon={<IconRemove size='1rem' className='icon-red' />}
              onClick={() => handleDeclineSuggestion(props.row.original)}
            />
          </div>
        ) : (
          <div className='max-w-fit'>
            <MiniButton
              noHover
              title='Удалить'
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
    <div className={clsx('flex flex-col', className)} {...restProps}>
      <div className='flex items-end gap-3 justify-stretch'>
        <div className='flex-grow flex flex-col basis-1/2 gap-[0.125rem] border-x border-t clr-input rounded-t-md'>
          <SelectLibraryItem
            noBorder
            placeholder='Выберите аргумент'
            items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== rightArgument?.id)}
            value={leftArgument}
            onChange={setLeftArgument}
          />
          <SelectConstituenta
            noBorder
            items={(leftArgument as IRSForm)?.items.filter(
              cst => !value.find(item => item.original === cst.id) && (!filterCst || filterCst(cst))
            )}
            value={leftCst}
            onChange={setLeftCst}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <MiniButton
            title={deleteRight ? 'Заменить правую' : 'Заменить левую'}
            onClick={toggleDelete}
            icon={
              deleteRight ? (
                <IconPageRight size='1.5rem' className='text-sec-600' />
              ) : (
                <IconPageLeft size='1.5rem' className='text-sec-600' />
              )
            }
          />
          <MiniButton
            title='Добавить в таблицу отождествлений'
            className='mb-[0.375rem] grow-0'
            icon={<IconReplace size='1.5rem' className='icon-primary' />}
            disabled={!leftCst || !rightCst || (leftCst === rightCst && !allowSelfSubstitution)}
            onClick={addSubstitution}
          />
        </div>

        <div className='flex-grow basis-1/2 flex flex-col gap-[0.125rem] border-x border-t clr-input rounded-t-md'>
          <SelectLibraryItem
            noBorder
            placeholder='Выберите аргумент'
            items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== leftArgument?.id)}
            value={rightArgument}
            onChange={setRightArgument}
          />
          <SelectConstituenta
            noBorder
            items={(rightArgument as IRSForm)?.items.filter(
              cst => !value.find(item => item.original === cst.id) && (!filterCst || filterCst(cst))
            )}
            value={rightCst}
            onChange={setRightCst}
          />
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
          <NoData className='min-h-[2rem]'>
            <p>Список пуст</p>
            <p>Добавьте отождествление</p>
          </NoData>
        }
        conditionalRowStyles={conditionalRowStyles}
      />
    </div>
  );
}
