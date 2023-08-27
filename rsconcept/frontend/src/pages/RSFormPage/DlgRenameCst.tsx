import { useLayoutEffect, useState } from 'react';

import ConceptSelect from '../../components/Common/ConceptSelect';
import Modal from '../../components/Common/Modal';
import TextInput from '../../components/Common/TextInput';
import { useRSForm } from '../../context/RSFormContext';
import { CstType, ICstRenameData } from '../../utils/models';
import { createAliasFor, CstTypeSelector, getCstTypeLabel, getCstTypePrefix } from '../../utils/staticUI';

interface DlgRenameCstProps {
  hideWindow: () => void
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
      submitInvalidTooltip={'Введите имя, соответствующее типу и отсутствующее в схеме'}
      submitText='Переименовать'
    >
      <div className='flex items-center gap-4 px-2 my-2 h-fit min-w-[25rem]'>
        <ConceptSelect
          className='min-w-[14rem] self-center'
          options={CstTypeSelector}
          placeholder='Выберите тип'
          values={cstType ? [{ value: cstType, label: getCstTypeLabel(cstType) }] : []}
          onChange={data => { setCstType(data.length > 0 ? data[0].value : CstType.BASE); }}
        />
        <div>
        <TextInput id='alias' label='Имя'
          singleRow
          widthClass='w-[7rem]'
          value={alias}
          onChange={event => setAlias(event.target.value)}
        />
        </div>
      </div>
    </Modal>
  );
}

export default DlgRenameCst;
