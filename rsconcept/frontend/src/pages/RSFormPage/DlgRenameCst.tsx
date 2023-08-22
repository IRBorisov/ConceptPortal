import { useEffect, useState } from 'react';

import ConceptSelect from '../../components/Common/ConceptSelect';
import Modal from '../../components/Common/Modal';
import TextInput from '../../components/Common/TextInput';
import { CstType, ICstRenameData } from '../../utils/models';
import { CstTypeSelector, getCstTypeLabel } from '../../utils/staticUI';

interface DlgRenameCstProps {
  hideWindow: () => void
  initial: ICstRenameData
  onRename: (data: ICstRenameData) => void
}

function DlgRenameCst({ hideWindow, initial, onRename }: DlgRenameCstProps) {
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

  const handleSubmit = () => {
    onRename(getData());
  };

  useEffect(() => {
    if (initial) {
      setCstType(initial.cst_type);
      setAlias(initial.alias);
      setCstID(initial.id);
    }
  }, [initial]);

  useEffect(() => {
    // setValidated(selectedType !== undefined);
    setValidated(true)
  }, [cstType, alias]
  );

  return (
    <Modal
      title='Создание конституенты'
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <div className='h-fit w-[20rem] px-2 mb-2 flex flex-col justify-stretch'>
      <div className='flex justify-center w-full'>
      <ConceptSelect
        className='my-2 min-w-[15rem] self-center'
        options={CstTypeSelector}
        placeholder='Выберите тип'
        values={cstType ? [{ value: cstType, label: getCstTypeLabel(cstType) }] : []}
        onChange={data => { setCstType(data.length > 0 ? data[0].value : CstType.BASE); }}
      />
      </div>
      <TextInput id='alias'
        label='Имя конституенты'
        value={alias}
        onChange={event => setAlias(event.target.value)}
      />
      </div>
    </Modal>
  );
}

export default DlgRenameCst;
