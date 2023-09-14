import { useLayoutEffect, useState } from 'react';

import Divider from '../../components/Common/Divider';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextArea from '../../components/Common/TextArea';
import TextInput from '../../components/Common/TextInput';
import { IConstituenta } from '../../models/rsform';
import { SelectorGraphLayout } from '../../utils/selectors';

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
      title='Редактирование словоформ'
      hideWindow={hideWindow}
      submitText='Сохранить данные'
      canSubmit
      onSubmit={handleSubmit}
    >
    <div className='min-w-[40rem]'>
      <TextArea id='nominal' label='Начальная форма'
        placeholder='Начальная форма'
        rows={2}
        
        value={term}
        disabled={true}
        spellCheck
      />
      <Divider margins='my-4' />
      <div className='flex items-center justify-start gap-2 w-full'>
        <SelectMulti
          className='z-modal-top min-w-[10rem]'
          options={SelectorGraphLayout}
          placeholder='Способ расположения'
          
          // value={null}
          // onChange={data => handleChangeLayout(data?.value ?? SelectorGraphLayout[0].value)}
        />
        <TextInput 
          
        />
      </div>
    </div>
    </Modal>
  );
}

export default DlgEditTerm;
