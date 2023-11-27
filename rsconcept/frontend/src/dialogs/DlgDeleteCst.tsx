import { useMemo, useState } from 'react';

import Checkbox from '../components/Common/Checkbox';
import Modal, { ModalProps } from '../components/Common/Modal';
import { useRSForm } from '../context/RSFormContext';
import { prefixes } from '../utils/constants';
import { labelConstituenta } from '../utils/labels';

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
      submitText={expandOut ? 'Удалить с зависимыми' : 'Удалить'}
      hideWindow={hideWindow}
      canSubmit={true}
      onSubmit={handleSubmit}
    >
    <div className='max-w-[60vw] min-w-[20rem]'>
      <p>Выбраны к удалению: <b>{selected.length}</b></p>
      <div className='px-3 border h-[9rem] mt-1 overflow-y-auto whitespace-nowrap'>
      {selected.map(
      (id) => {
        const cst = schema!.items.find(cst => cst.id === id);
        return (cst ?
        <p key={`${prefixes.cst_delete_list}${cst.id}`}>
          {labelConstituenta(cst)}
        </p> : null);
      })}
      </div>
      <p className='mt-4'>Зависимые конституенты: <b>{expansion.length}</b></p>
      <div className='mt-1 mb-3 px-3 border h-[9rem] overflow-y-auto whitespace-nowrap'>
      {expansion.map(
      (id) => {
        const cst = schema!.items.find(cst => cst.id === id);
        return (cst ?
        <p key={`${prefixes.cst_dependant_list}${cst.id}`}>
          {labelConstituenta(cst)}
        </p> : null);
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
