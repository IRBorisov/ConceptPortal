'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { Checkbox } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { prefixes } from '@/utils/constants';

import { useCstDelete } from '../../backend/useCstDelete';
import { ConstituentaID, IRSForm } from '../../models/rsform';
import ListConstituents from './ListConstituents';

export interface DlgDeleteCstProps {
  schema: IRSForm;
  selected: ConstituentaID[];
  afterDelete: (initialSchema: IRSForm, deleted: ConstituentaID[]) => void;
}

function DlgDeleteCst() {
  const { selected, schema, afterDelete } = useDialogsStore(state => state.props as DlgDeleteCstProps);
  const { cstDelete } = useCstDelete();

  const [expandOut, setExpandOut] = useState(false);
  const expansion: ConstituentaID[] = schema.graph.expandAllOutputs(selected);
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
      className={clsx('cc-column', 'max-w-[60vw] min-w-[30rem]', 'px-6')}
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

export default DlgDeleteCst;
