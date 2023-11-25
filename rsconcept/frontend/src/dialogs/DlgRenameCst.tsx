import { useLayoutEffect, useState } from 'react';

import Modal, { ModalProps } from '../components/common/Modal';
import SelectSingle from '../components/common/SelectSingle';
import TextInput from '../components/common/TextInput';
import { useRSForm } from '../context/RSFormContext';
import usePartialUpdate from '../hooks/usePartialUpdate';
import { CstType, ICstRenameData } from '../models/rsform';
import { labelCstType } from '../utils/labels';
import { createAliasFor, validateCstAlias } from '../utils/misc';
import { SelectorCstType } from '../utils/selectors';

interface DlgRenameCstProps
extends Pick<ModalProps, 'hideWindow'> {
  initial: ICstRenameData
  onRename: (data: ICstRenameData) => void
}

function DlgRenameCst({ hideWindow, initial, onRename }: DlgRenameCstProps) {
  const { schema } = useRSForm();
  const [validated, setValidated] = useState(false);
  const [cstData, updateData] = usePartialUpdate(initial);
  
  const handleSubmit = () => onRename(cstData);

  useLayoutEffect(
  () => {
    if (schema && initial && cstData.cst_type !== initial.cst_type) {
      updateData({ alias: createAliasFor(cstData.cst_type, schema)});
    }
  }, [initial, cstData.cst_type, updateData, schema]);

  useLayoutEffect(
  () => {
    setValidated(
      !!schema &&
      cstData.alias !== initial.alias &&
      validateCstAlias(cstData.alias, cstData.cst_type, schema)
    );
  }, [cstData.cst_type, cstData.alias, initial, schema]);

  return (
    <Modal
      title='Переименование конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
      submitInvalidTooltip={'Введите незанятое имя, соответствующее типу'}
      submitText='Переименовать'
    >
      <div className='flex items-center gap-4 px-2 my-2 h-fit min-w-[25rem]'>
        <SelectSingle
          className='min-w-[14rem] self-center z-modal-top'
          options={SelectorCstType}
          placeholder='Выберите тип'
          value={{ value: cstData.cst_type, label: labelCstType(cstData.cst_type) }}
          onChange={data => updateData({cst_type: data?.value ?? CstType.BASE})}
        />
        <div>
        <TextInput id='alias' label='Имя'
          dense
          dimensions='w-[7rem]'
          value={cstData.alias}
          onChange={event => updateData({alias: event.target.value})}
        />
        </div>
      </div>
    </Modal>
  );
}

export default DlgRenameCst;
