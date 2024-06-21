'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';

import BadgeHelp from '@/components/info/BadgeHelp';
import Modal, { ModalProps } from '@/components/ui/Modal';
import SelectSingle from '@/components/ui/SelectSingle';
import TextInput from '@/components/ui/TextInput';
import { useRSForm } from '@/context/RSFormContext';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType, ICstRenameData } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';
import { PARAMETER } from '@/utils/constants';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

interface DlgRenameCstProps extends Pick<ModalProps, 'hideWindow'> {
  initial: ICstRenameData;
  onRename: (data: ICstRenameData) => void;
}

function DlgRenameCst({ hideWindow, initial, onRename }: DlgRenameCstProps) {
  const { schema } = useRSForm();
  const [validated, setValidated] = useState(false);
  const [cstData, updateData] = usePartialUpdate(initial);

  const handleSubmit = () => onRename(cstData);

  useLayoutEffect(() => {
    if (schema && initial && cstData.cst_type !== initial.cst_type) {
      updateData({ alias: generateAlias(cstData.cst_type, schema) });
    }
  }, [initial, cstData.cst_type, updateData, schema]);

  useLayoutEffect(() => {
    setValidated(
      !!schema && cstData.alias !== initial.alias && validateNewAlias(cstData.alias, cstData.cst_type, schema)
    );
  }, [cstData.cst_type, cstData.alias, initial, schema]);

  return (
    <Modal
      header='Переименование конституенты'
      submitText='Переименовать'
      submitInvalidTooltip={'Введите незанятое имя, соответствующее типу'}
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
      className={clsx('w-[30rem]', 'py-6 pr-3 pl-6 flex justify-center items-center')}
    >
      <SelectSingle
        id='dlg_cst_type'
        placeholder='Выберите тип'
        className='min-w-[16rem] self-center'
        options={SelectorCstType}
        value={{
          value: cstData.cst_type,
          label: labelCstType(cstData.cst_type)
        }}
        onChange={data => updateData({ cst_type: data?.value ?? CstType.BASE })}
      />

      <TextInput
        id='dlg_cst_alias'
        dense
        label='Имя'
        className='w-[7rem] ml-3'
        value={cstData.alias}
        onChange={event => updateData({ alias: event.target.value })}
      />
      <BadgeHelp
        topic={HelpTopic.CC_CONSTITUENTA}
        offset={16}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
      />
    </Modal>
  );
}

export default DlgRenameCst;
