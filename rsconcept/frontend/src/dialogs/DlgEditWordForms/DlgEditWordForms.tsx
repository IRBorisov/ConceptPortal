'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';

import Label from '@/components/Common/Label';
import MiniButton from '@/components/Common/MiniButton';
import Modal from '@/components/Common/Modal';
import Overlay from '@/components/Common/Overlay';
import TextArea from '@/components/Common/TextArea';
import HelpButton from '@/components/Help/HelpButton';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronDoubleDownIcon } from '@/components/Icons';
import SelectGrammeme from '@/components/Shared/SelectGrammeme';
import useConceptText from '@/hooks/useConceptText';
import { Grammeme, ITextRequest, IWordForm, IWordFormPlain } from '@/models/language';
import { parseGrammemes, wordFormEquals } from '@/models/languageAPI';
import { HelpTopic } from '@/models/miscelanious';
import { IConstituenta, TermForm } from '@/models/rsform';
import { IGrammemeOption, SelectorGrammemesList, SelectorGrammems } from '@/utils/selectors';

import WordFormsTable from './WordFormsTable';

interface DlgEditWordFormsProps {
  hideWindow: () => void
  target: IConstituenta
  onSave: (data: TermForm[]) => void
}

function DlgEditWordForms({ hideWindow, target, onSave }: DlgEditWordFormsProps) {
  const textProcessor = useConceptText();
  
  const [term, setTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputGrams, setInputGrams] = useState<IGrammemeOption[]>([]);
  const [forms, setForms] = useState<IWordForm[]>([]);

  useLayoutEffect(
  () => {
    const initForms: IWordForm[] = [];
    target.term_forms.forEach(
    term => initForms.push({
      text: term.text,
      grams: parseGrammemes(term.tags),
    }));
    setForms(initForms);
    setTerm(target.term_resolved);
    setInputText(target.term_resolved);
    setInputGrams([]);
  }, [target]);  

  function handleSubmit() {
    const result: TermForm[] = [];
    forms.forEach(
    ({text, grams}) => result.push({
      text: text,
      tags: grams.join(',')
    }));
    onSave(result);
  }

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams.map(item => item.value)
    };
    setForms(forms => [
      newForm,
      ...forms.filter(value => !wordFormEquals(value, newForm))
    ]);
  }

  function handleSelectForm(form: IWordForm) {
    setInputText(form.text);
    setInputGrams(SelectorGrammems.filter(gram => form.grams.find(test => test === gram.value)));
  }

  function handleInflect() {
    const data: IWordFormPlain = {
      text: term,
      grams: inputGrams.map(gram => gram.value).join(',')
    }
    textProcessor.inflect(data, response => setInputText(response.result));
  }

  function handleParse() {
    const data: ITextRequest = {
      text: inputText
    }
    textProcessor.parse(data, response => {
      const grams = parseGrammemes(response.result);
      setInputGrams(SelectorGrammems.filter(gram => grams.find(test => test === gram.value)));
    });
  }

  function handleGenerateLexeme() {
    if (forms.length > 0) {
      if (!window.confirm('Данное действие приведет к перезаписи словоформ при совпадении граммем. Продолжить?')) {
        return;
      }
    }
    const data: ITextRequest = {
      text: inputText
    }
    textProcessor.generateLexeme(data, response => {
      const lexeme: IWordForm[] = [];
      response.items.forEach(
      form => {
        const newForm: IWordForm = {
          text: form.text,
          grams: parseGrammemes(form.grams).filter(gram => SelectorGrammemesList.find(item => item === gram as Grammeme))
        }
        if (newForm.grams.length === 2 && !lexeme.some(test => wordFormEquals(test, newForm))) {
          lexeme.push(newForm);
        }
      });
      setForms(lexeme);
    });
  }

  return (
  <Modal canSubmit
    title='Редактирование словоформ'
    hideWindow={hideWindow}
    submitText='Сохранить'
    onSubmit={handleSubmit}
    className='min-w-[40rem] max-w-[40rem] px-6'
  >
    <Overlay position='top-[-0.2rem] left-[7.5rem]'>
      <HelpButton topic={HelpTopic.TERM_CONTROL} dimensions='max-w-[38rem]' offset={3} />
    </Overlay>
  
    <TextArea disabled spellCheck
      label='Начальная форма'
      placeholder='Термин в начальной форме'
      rows={1}
      value={term}
    />

    <div className='mt-3 mb-2'>
      <Label text='Параметры словоформы' />
    </div>

    <div className='flex items-start justify-between w-full'>
      <div className='flex items-center'>
        <TextArea
          placeholder='Введите текст'
          dimensions='min-w-[20rem] w-full min-h-[5rem]'
          rows={2}
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='max-w-min'>
          <MiniButton
            tooltip='Генерировать словоформу'
            icon={<ArrowLeftIcon size={5} color={inputGrams.length == 0 ? 'text-disabled' : 'clr-text-primary'} />}
            disabled={textProcessor.loading || inputGrams.length == 0}
            onClick={handleInflect}
          />
          <MiniButton
            tooltip='Определить граммемы'
            icon={<ArrowRightIcon
              size={5}
              color={!inputText ? 'text-disabled' : 'clr-text-primary'}
            />}
            disabled={textProcessor.loading || !inputText}
            onClick={handleParse}
          />
        </div>
      </div>
      <SelectGrammeme
        placeholder='Выберите граммемы'
        dimensions='min-w-[15rem] max-w-[15rem] h-full '
        className='flex-grow'
        value={inputGrams}
        setValue={setInputGrams}
      />
    </div>

    <Overlay position='top-2 left-0'>
      <MiniButton
        tooltip='Внести словоформу'
        icon={<CheckIcon
          size={5}
          color={!inputText || inputGrams.length == 0 ? 'text-disabled' : 'clr-text-success'}
        />}
        disabled={textProcessor.loading || !inputText || inputGrams.length == 0}
        onClick={handleAddForm}
      />
      <MiniButton
        tooltip='Генерировать стандартные словоформы'
        icon={<ChevronDoubleDownIcon
          size={5}
          color={!inputText ? 'text-disabled' : 'clr-text-primary'}
        />}
        disabled={textProcessor.loading || !inputText}
        onClick={handleGenerateLexeme}
      />
    </Overlay>
    
    <div className={clsx(
      'mt-3 mb-2', 
      'text-sm text-center font-semibold'
    )}>
      Заданные вручную словоформы [{forms.length}]
    </div>
    
    <div className={clsx(
      'mb-2',
      'max-h-[17.4rem] min-h-[17.4rem]',
      'border',
      'overflow-y-auto'
    )}>
    <WordFormsTable
      forms={forms}
      setForms={setForms}
      onFormSelect={handleSelectForm}
      loading={textProcessor.loading}
    />
    </div>
  </Modal>);
}

export default DlgEditWordForms;