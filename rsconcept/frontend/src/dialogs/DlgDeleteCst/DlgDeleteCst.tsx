'use client';

import clsx from 'clsx';
import { useState } from 'react';

import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/ui/Modal';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';
import { prefixes } from '@/utils/constants';

import ListConstituents from './ListConstituents';

export interface DlgDeleteCstProps {
  schema: IRSForm;
  selected: ConstituentaID[];
  onDelete: (items: ConstituentaID[]) => void;
}

function DlgDeleteCst() {
  const { selected, schema, onDelete } = useDialogsStore(state => state.props as DlgDeleteCstProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const [expandOut, setExpandOut] = useState(false);
  const expansion: ConstituentaID[] = schema.graph.expandAllOutputs(selected);
  const hasInherited = selected.some(
    id => schema.inheritance.find(item => item.parent === id),
    [selected, schema.inheritance]
  );

  function handleSubmit() {
    hideDialog();
    if (expandOut) {
      onDelete(selected.concat(expansion));
    } else {
      onDelete(selected);
    }
  }

  return (
    <Modal
      canSubmit
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
    </Modal>
  );
}

export default DlgDeleteCst;
