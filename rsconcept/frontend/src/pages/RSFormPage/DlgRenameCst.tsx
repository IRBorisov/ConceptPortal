import { useLayoutEffect, useState } from 'react';

import Modal, { ModalProps } from '../../components/Common/Modal';
import SelectSingle from '../../components/Common/SelectSingle';
import TextInput from '../../components/Common/TextInput';
import { useRSForm } from '../../context/RSFormContext';
import { CstType, ICstRenameData } from '../../models/rsform';
import { SelectorCstType } from '../../utils/selectors';
import { createAliasFor, getCstTypePrefix } from '../../utils/misc';
import { labelCstType } from '../../utils/labels';

interface DlgRenameCstProps
extends Pick<ModalProps, 'hideWindow'> {
  initial?: ICstRenameData
  onRename: (data: ICstRenameData) => void
}

function DlgRenameCst({ hideWindow, initial, onRename }: DlgRenameCstProps) {
  const { schema } = useRSForm();
  const [validated, setValidated] = useState(false);
  const [cstType, setCstType] = useState<CstType>(CstType.BASE);
  const [cstID, setCstID] = useState(0)
  const [alias, setAlias] = useState('');

  function getData(): ICstRenameData {
    return {
      cst_type: cstType,
      alias: alias,
      id: cstID
    }
  }

  const handleSubmit = () => onRename(getData());

  useLayoutEffect(
  () => {
    if (schema && initial && cstType !== initial.cst_type) {
      setAlias(createAliasFor(cstType, schema));
    }
  }, [initial, cstType, schema]);

  useLayoutEffect(
  () => {
    if (initial) {
      setCstType(initial.cst_type);
      setAlias(initial.alias);
      setCstID(initial.id);
    }
  }, [initial]);

  useLayoutEffect(
  () => {
    if (!initial ||  !schema) {
      setValidated(false);
    } else if(alias === initial.alias || alias.length < 2 || alias[0] !== getCstTypePrefix(cstType)) {
      setValidated(false);
    } else {
      setValidated(!schema.items.find(cst => cst.alias === alias))
    }
  }, [cstType, alias, initial, schema]);

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
          value={cstType ? { value: cstType, label: labelCstType(cstType) } : null}
          onChange={data => setCstType(data?.value ?? CstType.BASE)}
        />
        <div>
        <TextInput id='alias' label='Имя'
          singleRow
          dimensions='w-[7rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        </div>
      </div>
    </Modal>
  );
}

export default DlgRenameCst;
