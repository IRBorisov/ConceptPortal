import { useLayoutEffect, useState } from 'react';

import Modal from '../../components/Common/Modal';
import TextArea from '../../components/Common/TextArea';
import { IConstituenta } from '../../models/rsform';

interface DlgEditTermProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: () => void
}

function DlgEditTerm({ hideWindow, target, onSave }: DlgEditTermProps) { 
  const [term, setTerm] = useState('');

  // function getData() {
  //   return {

  //   };
  // }

  const handleSubmit = () => onSave(); // getData()

  useLayoutEffect(
  () => {
    setTerm(target.term_resolved);
  }, [target]);

  return (
    <Modal
      title='Редактирование термина'
      hideWindow={hideWindow}
      submitText='Сохранить данные'
      canSubmit
      onSubmit={handleSubmit}
    >
      <TextArea id='nominal' label='Начальная форма'
        placeholder='Начальная форма'
        rows={2}
        value={term}
        disabled={true}
        spellCheck
      />
    </Modal>
  );
}

export default DlgEditTerm;
