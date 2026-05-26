'use client';

import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { type ArgumentValue, type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { isFunctional, isLogical } from '@rsconcept/domain/library/rsform-api';
import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconReset } from '@/components/icons';
import { NoData } from '@/components/view';

import { PickConstituenta } from '../../components/pick-constituenta';
import { RSInput } from '../../components/rs-input';

import { useTemplateContext } from './template-context';

const argumentsHelper = createColumnHelper<ArgumentValue>();

interface TabArgumentsProps {
  schema: RSForm;
  definition: string;
}

export function TabArguments({ schema, definition }: TabArgumentsProps) {
  const tx = useTx();
  const { args, onChangeArguments } = useTemplateContext();

  const [selectedCst, setSelectedCst] = useState<Constituenta | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<ArgumentValue | null>(args.length > 0 ? args[0] : null);

  function handleSelectArgument(arg: ArgumentValue) {
    setSelectedArgument(arg);
  }

  function handleSelectConstituenta(cst: Constituenta) {
    if (!selectedArgument) {
      return;
    }
    setSelectedCst(cst);
    handleAssignArgument(selectedArgument, cst.alias);
  }

  function handleClearArgument(target: ArgumentValue) {
    const newArg = { ...target, value: '' };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  function handleAssignArgument(target: ArgumentValue, argValue: string) {
    const newArg = { ...target, value: argValue };
    onChangeArguments(args.map(arg => (arg.alias !== target.alias ? arg : newArg)));
    setSelectedArgument(newArg);
  }

  function cstFilter(cst: Constituenta) {
    return cst.id === selectedCst?.id || (!isFunctional(cst.cst_type) && !isLogical(cst.cst_type));
  }

  const filteredItems = schema.items.filter(cstFilter);

  const columns = [
    argumentsHelper.accessor('alias', {
      id: 'alias',
      header: tx('tx.lib.alias.short'),
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => <div className='text-center pr-2'>{props.getValue()}</div>
    }),
    argumentsHelper.accessor(arg => arg.value || tx('tx.cst.template.argument.unbound'), {
      id: 'value',
      header: tx('tx.rslang.value.short'),
      size: 200,
      minSize: 200,
      maxSize: 200
    }),
    argumentsHelper.accessor(arg => arg.typification, {
      id: 'type',
      header: tx('tx.rslang.typification'),
      enableHiding: true,
      cell: props => <div className='w-36 text-sm wrap-break-word'>{props.getValue()}</div>
    }),
    argumentsHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <div className='w-6 flex justify-center'>
          {props.row.original.value ? (
            <MiniButton
              title={tx('tx.rslang.value.reset')}
              noPadding
              className='align-middle'
              icon={<IconReset size='1rem' className='cc-remove' />}
              onClick={() => handleClearArgument(props.row.original)}
            />
          ) : null}
        </div>
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<ArgumentValue>[] = [
    {
      when: (arg: ArgumentValue) => arg.alias === selectedArgument?.alias,
      className: 'bg-selected'
    }
  ];

  return (
    <div className='cc-fade-in'>
      <DataTable
        dense
        noFooter
        className='h-31 [&_thead_th]:py-1 cc-scroll-y text-sm border select-none'
        data={args}
        columns={columns}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={<NoData className='min-h-14'>{tx('tx.cst.template.argument.empty')}</NoData>}
        onRowClicked={handleSelectArgument}
      />

      <h2>{tx('tx.cst.plural')}</h2>

      <PickConstituenta
        id='dlg_argument_picker'
        value={selectedCst}
        items={filteredItems}
        onChange={handleSelectConstituenta}
        rows={7}
      />

      <RSInput
        disabled
        portalHoverTooltips
        id='result'
        placeholder={tx('tx.cst.template.result')}
        className='mt-4'
        height='5.1rem'
        value={definition}
      />
    </div>
  );
}
