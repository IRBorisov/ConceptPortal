'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import Checkbox from '@/components/ui/Checkbox';
import Modal, { ModalProps } from '@/components/ui/Modal';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

import ListConstituents from './ListConstituents';

interface DlgDeleteCstProps extends Pick<ModalProps, 'hideWindow'> {
  schema: IRSForm;
  selected: ConstituentaID[];
  onDelete: (items: ConstituentaID[]) => void;
}

function DlgDeleteCst({ hideWindow, selected, schema, onDelete }: DlgDeleteCstProps) {
  const [expandOut, setExpandOut] = useState(false);
  const expansion: ConstituentaID[] = useMemo(
    () => schema.graph.expandAllOutputs(selected), // prettier: split-lines
    [selected, schema.graph]
  );

  function handleSubmit() {
    hideWindow();
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
      hideWindow={hideWindow}
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
        className='my-2'
        value={expandOut}
        setValue={value => setExpandOut(value)}
      />
    </Modal>
  );
}

export default DlgDeleteCst;
