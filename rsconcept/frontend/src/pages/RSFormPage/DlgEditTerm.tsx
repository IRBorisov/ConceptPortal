import { useLayoutEffect, useState } from 'react';

import Divider from '../../components/Common/Divider';
import MiniButton from '../../components/Common/MiniButton';
import Modal from '../../components/Common/Modal';
import SelectMulti from '../../components/Common/SelectMulti';
import TextArea from '../../components/Common/TextArea';
import { CheckIcon, ChevronDoubleUpIcon, ChevronUpIcon, CrossIcon } from '../../components/Icons';
import { Grammeme } from '../../models/language';
import { IConstituenta } from '../../models/rsform';
import { SelectorGrammems } from '../../utils/selectors';

interface DlgEditTermProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: () => void
}

function DlgEditTerm({ hideWindow, target, onSave }: DlgEditTermProps) { 
  const [term, setTerm] = useState('');

  const [inputText, setInputText] = useState('');
  const [inputTags, setInputTags] = useState<{ value: Grammeme, label: string }[]>([]);

  
  
  // function getData() {
  //   return {

  //   };
  // }

  const handleSubmit = () => onSave(); // getData()

  function handleAddForm() {
    
  }

  function handleResetForm() {
    
  }

  function handleGenerateSelected() {
    
  }

  function handleGenerateBasics() {
    
  }

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
      rows={1}
      
      value={term}
      disabled={true}
      spellCheck
    />

    <Divider margins='my-4'/>

    <div className='flex items-start gap-2 justify-stretch min-h-[6.3rem]'>
      <div className='flex flex-col gap-1'>
        <TextArea
          placeholder='Введите текст'
          rows={2}
          dimensions='min-w-[20rem]'
          
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='flex items-center justify-start'>
          <MiniButton
            tooltip='Добавить словоформу'
            icon={<CheckIcon size={6} color='text-success'/>}
            onClick={handleAddForm}
          />
          <MiniButton
            tooltip='Сбросить словоформу'
            icon={<CrossIcon size={6} color='text-warning'/>}
            onClick={handleResetForm}
          />
          <MiniButton
            tooltip='Генерировать словоформу'
            icon={<ChevronUpIcon size={6} color='text-primary'/>}
            onClick={handleGenerateSelected}
          />
          <MiniButton
            tooltip='Генерировать базовые словоформы'
            icon={<ChevronDoubleUpIcon size={6} color='text-primary'/>}
            onClick={handleGenerateBasics}
          />
        </div>
      </div>
      <SelectMulti
        className='z-modal-top min-w-[20rem] max-w-[20rem] h-full flex-grow'
        options={SelectorGrammems}
        placeholder='Выберите граммемы'
        
        value={inputTags}
        onChange={data => setInputTags(data.map(value => value))}
      />
    </div>
    <div>
      Таблица
    </div>
  </div>
  </Modal>);
}

export default DlgEditTerm;
