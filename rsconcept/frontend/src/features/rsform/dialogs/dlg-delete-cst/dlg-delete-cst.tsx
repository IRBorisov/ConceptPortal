'use client';

import { type SubmitEvent, useState } from 'react';

import { type RSForm } from '@/domain/library';

import { Checkbox } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { prefixes } from '@/utils/constants';

import { ListConstituents } from './list-constituents';

export interface DlgDeleteCstProps {
  schema: RSForm;
  selected: number[];
  onDelete: (deleted: number[]) => void;
}

export function DlgDeleteCst() {
  const { selected, schema, onDelete } = useDialogsStore(state => state.props as DlgDeleteCstProps);

  const [expandOut, setExpandOut] = useState(false);
  const expansion: number[] = schema.graph.expandAllOutputs(selected);
  const hasInherited = selected.some(
    id => schema.inheritance.find(item => item.parent === id),
    [selected, schema.inheritance]
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const deleted = expandOut ? selected.concat(expansion) : selected;
    onDelete(deleted);
  }

  return (
    <ModalForm
      header='Удаление конституент'
      submitText={expandOut ? 'Удалить с зависимыми' : 'Удалить'}
      onSubmit={handleSubmit}
      className='cc-column max-w-[60vw] min-w-120 px-6'
    >
      <ListConstituents title='Выбраны к удалению' list={selected} schema={schema} prefix={prefixes.cst_delete_list} />
      <ListConstituents
        title='Зависимые конституенты'
        list={expansion}
        schema={schema}
        prefix={prefixes.cst_dependant_list}
      />
      <Checkbox
        label='Удалить зависимые конституенты'
        className='mb-2'
        value={expandOut}
        onChange={value => setExpandOut(value)}
      />
      {hasInherited ? <p className='text-sm clr-text-red'>Внимание! Конституенты имеют наследников в ОСС</p> : null}
    </ModalForm>
  );
}
