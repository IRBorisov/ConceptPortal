'use client';

import clsx from 'clsx';
import { useState } from 'react';

import BadgeHelp from '@/components/info/BadgeHelp';
import Checkbox from '@/components/ui/Checkbox';
import Modal, { ModalProps } from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TextInput from '@/components/ui/TextInput';
import { HelpTopic } from '@/models/miscellaneous';
import { IOperation } from '@/models/oss';
import { PARAMETER } from '@/utils/constants';

interface DlgDeleteOperationProps extends Pick<ModalProps, 'hideWindow'> {
  target: IOperation;
  onSubmit: (keepConstituents: boolean, deleteSchema: boolean) => void;
}

function DlgDeleteOperation({ hideWindow, target, onSubmit }: DlgDeleteOperationProps) {
  const [keepConstituents, setKeepConstituents] = useState(false);
  const [deleteSchema, setDeleteSchema] = useState(false);

  function handleSubmit() {
    onSubmit(keepConstituents, deleteSchema);
  }

  return (
    <Modal
      overflowVisible
      header='Удаление операции'
      submitText='Подтвердить удаление'
      hideWindow={hideWindow}
      canSubmit={true}
      onSubmit={handleSubmit}
      className={clsx('w-[35rem]', 'pb-3 px-6 cc-column', 'select-none')}
    >
      <Overlay position='top-[-2rem] right-[4rem]'>
        <BadgeHelp
          topic={HelpTopic.CC_PROPAGATION}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
          offset={14}
        />
      </Overlay>

      <TextInput disabled dense noBorder id='operation_alias' label='Операция' value={target.alias} />
      <Checkbox
        label='Сохранить наследованные конституенты'
        titleHtml='Наследованные конституенты <br/>превратятся в дописанные'
        value={keepConstituents}
        setValue={setKeepConstituents}
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
        setValue={setDeleteSchema}
        disabled={!target.is_owned || target.result === null}
      />
    </Modal>
  );
}

export default DlgDeleteOperation;
