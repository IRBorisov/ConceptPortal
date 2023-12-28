'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

import Checkbox from '@/components/Common/Checkbox';
import Modal, { ModalProps } from '@/components/Common/Modal';
import { IRSForm } from '@/models/rsform';
import { classnames, prefixes } from '@/utils/constants';

import ConstituentsList from './ConstituentsList';

interface DlgDeleteCstProps extends Pick<ModalProps, 'hideWindow'> {
  selected: number[];
  onDelete: (items: number[]) => void;
  schema: IRSForm;
}

function DlgDeleteCst({ hideWindow, selected, schema, onDelete }: DlgDeleteCstProps) {
  const [expandOut, setExpandOut] = useState(false);
  const expansion: number[] = useMemo(() => schema.graph.expandOutputs(selected), [selected, schema.graph]);

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
      className={clsx('max-w-[60vw] min-w-[30rem]', 'px-6', classnames.flex_col)}
    >
      <ConstituentsList
        title='Выбраны к удалению'
        list={selected}
        items={schema.items}
        prefix={prefixes.cst_delete_list}
      />
      <ConstituentsList
        title='Зависимые конституенты'
        list={expansion}
        items={schema.items}
        prefix={prefixes.cst_dependant_list}
      />
      <Checkbox label='Удалить зависимые конституенты' value={expandOut} setValue={value => setExpandOut(value)} />
    </Modal>
  );
}

export default DlgDeleteCst;
