'use client';

import clsx from 'clsx';
import { useState } from 'react';

import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/ui/Modal';
import TextInput from '@/components/ui/TextInput';
import { HelpTopic } from '@/models/miscellaneous';
import { IOperation, OperationID } from '@/models/oss';
import { useDialogsStore } from '@/stores/dialogs';

export interface DlgDeleteOperationProps {
  target: IOperation;
  onSubmit: (targetID: OperationID, keepConstituents: boolean, deleteSchema: boolean) => void;
}

function DlgDeleteOperation() {
  const { target, onSubmit } = useDialogsStore(state => state.props as DlgDeleteOperationProps);
  const [keepConstituents, setKeepConstituents] = useState(false);
  const [deleteSchema, setDeleteSchema] = useState(false);

  function handleSubmit() {
    onSubmit(target.id, keepConstituents, deleteSchema);
  }

  return (
    <Modal
      overflowVisible
      header='Удаление операции'
      submitText='Подтвердить удаление'
      canSubmit={true}
      onSubmit={handleSubmit}
      className={clsx('w-[35rem]', 'pb-3 px-6 cc-column', 'select-none')}
      helpTopic={HelpTopic.CC_PROPAGATION}
    >
      <TextInput disabled dense noBorder id='operation_alias' label='Операция' value={target.alias} />
      <Checkbox
        label='Сохранить наследованные конституенты'
        titleHtml='Наследованные конституенты <br/>превратятся в дописанные'
        value={keepConstituents}
        onChange={setKeepConstituents}
        disabled={target.result === null}
      />
      <Checkbox
        label='Удалить схему'
        titleHtml={
          !target.is_owned || target.result === undefined
            ? 'Привязанную схему нельзя удалить'
            : 'Удалить схему вместе с операцией'
        }
        value={deleteSchema}
        onChange={setDeleteSchema}
        disabled={!target.is_owned || target.result === null}
      />
    </Modal>
  );
}

export default DlgDeleteOperation;
