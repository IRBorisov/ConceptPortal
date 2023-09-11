import { useMemo, useState } from 'react';

import Checkbox from '../../components/Common/Checkbox';
import Modal, { ModalProps } from '../../components/Common/Modal';
import { useRSForm } from '../../context/RSFormContext';
import { getCstLabel } from '../../utils/staticUI';

interface DlgDeleteCstProps
extends Pick<ModalProps, 'hideWindow'> {
  selected: number[]
  onDelete: (items: number[]) => void
}

function DlgDeleteCst({ hideWindow, selected, onDelete }: DlgDeleteCstProps) {
  const { schema } = useRSForm();

  const [ expandOut, setExpandOut ] = useState(false);
  const expansion: number[] = useMemo(() => schema?.graph.expandOutputs(selected) ?? [], [selected, schema?.graph]);

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
      title='Удаление конституент'
      hideWindow={hideWindow}
      canSubmit={true}
      submitText={expandOut ? 'Удалить с зависимыми' : 'Удалить'}
      onSubmit={handleSubmit}
    >
    <div className='max-w-[60vw] min-w-[20rem]'>
      <p>Выбраны к удалению: <b>{selected.length}</b></p>
      <div className='px-3 border h-[9rem] overflow-y-auto whitespace-nowrap'>
        {selected.map(id => {
          const cst = schema!.items.find(cst => cst.id === id);
          return (cst && <p>{getCstLabel(cst)}</p>);
        })}
      </div>
      <p className='mt-4'>Зависимые конституенты: <b>{expansion.length}</b></p>
      <div className='px-3 border h-[9rem] overflow-y-auto whitespace-nowrap'>
        {expansion.map(id => {
          const cst = schema!.items.find(cst => cst.id === id);
          return (cst && <p>{getCstLabel(cst)}</p>);
        })}
      </div>
      <Checkbox
        label='Удалить зависимые конституенты'
        value={expandOut}
        setValue={value => setExpandOut(value)}
      />
    </div>
    </Modal>
  );
}

export default DlgDeleteCst;
