'use client';

import { useState } from 'react';

import { Checkbox } from '@/components/input1';
import { ModalForm } from '@/components/modal1';
import { useDialogsStore } from '@/stores/dialogs';
import { prefixes } from '@/utils/constants';

import { useCstDelete } from '../../backend/use-cst-delete';
import { type IRSForm } from '../../models/rsform';

import { ListConstituents } from './list-constituents';

export interface DlgDeleteCstProps {
  schema: IRSForm;
  selected: number[];
  afterDelete: (initialSchema: IRSForm, deleted: number[]) => void;
}

export function DlgDeleteCst() {
  const { selected, schema, afterDelete } = useDialogsStore(state => state.props as DlgDeleteCstProps);
  const { cstDelete } = useCstDelete();

  const [expandOut, setExpandOut] = useState(false);
  const expansion: number[] = schema.graph.expandAllOutputs(selected);
  const hasInherited = selected.some(
    id => schema.inheritance.find(item => item.parent === id),
    [selected, schema.inheritance]
  );

  function handleSubmit() {
    const deleted = expandOut ? selected.concat(expansion) : selected;
    void cstDelete({ itemID: schema.id, data: { items: deleted } }).then(() => afterDelete(schema, deleted));
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
      {hasInherited ? (
        <p className='text-sm clr-text-red'>Внимание! Выбранные конституенты имеют наследников в ОСС</p>
      ) : null}
    </ModalForm>
  );
}
