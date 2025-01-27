'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { ICstRenameDTO } from '@/backend/rsform/api';
import Modal from '@/components/ui/Modal';
import SelectSingle from '@/components/ui/SelectSingle';
import TextInput from '@/components/ui/TextInput';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType, IRSForm } from '@/models/rsform';
import { generateAlias, validateNewAlias } from '@/models/rsformAPI';
import { useDialogsStore } from '@/stores/dialogs';
import { labelCstType } from '@/utils/labels';
import { SelectorCstType } from '@/utils/selectors';

export interface DlgRenameCstProps {
  schema: IRSForm;
  initial: ICstRenameDTO;
  allowChangeType: boolean;
  onRename: (data: ICstRenameDTO) => void;
}

function DlgRenameCst() {
  const { schema, initial, allowChangeType, onRename } = useDialogsStore(state => state.props as DlgRenameCstProps);
  const [validated, setValidated] = useState(false);
  const [cstData, updateData] = usePartialUpdate(initial);

  useEffect(() => {
    if (schema && initial && cstData.cst_type !== initial.cst_type) {
      updateData({ alias: generateAlias(cstData.cst_type, schema) });
    }
  }, [initial, cstData.cst_type, updateData, schema]);

  useEffect(() => {
    setValidated(
      !!schema && cstData.alias !== initial.alias && validateNewAlias(cstData.alias, cstData.cst_type, schema)
    );
  }, [cstData.cst_type, cstData.alias, initial, schema]);

  return (
    <Modal
      header='Переименование конституенты'
      submitText='Переименовать'
      submitInvalidTooltip='Введите незанятое имя, соответствующее типу'
      canSubmit={validated}
      onSubmit={() => onRename(cstData)}
      className={clsx('w-[30rem]', 'py-6 pr-3 pl-6 flex gap-3 justify-center items-center ')}
      helpTopic={HelpTopic.CC_CONSTITUENTA}
    >
      <SelectSingle
        id='dlg_cst_type'
        placeholder='Выберите тип'
        className='min-w-[16rem]'
        isDisabled={!allowChangeType}
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
        className='w-[7rem]'
        value={cstData.alias}
        onChange={event => updateData({ alias: event.target.value })}
      />
    </Modal>
  );
}

export default DlgRenameCst;
