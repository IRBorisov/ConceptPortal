'use client';

import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';
import { BiCheck, BiChevronsDown, BiLeftArrow, BiRightArrow, BiX } from 'react-icons/bi';

import HelpButton from '@/components/man/HelpButton';
import SelectGrammeme from '@/components/select/SelectGrammeme';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Modal from '@/components/ui/Modal';
import Overlay from '@/components/ui/Overlay';
import TextArea from '@/components/ui/TextArea';
import useConceptText from '@/hooks/useConceptText';
import { Grammeme, ITextRequest, IWordForm, IWordFormPlain } from '@/models/language';
import { parseGrammemes, wordFormEquals } from '@/models/languageAPI';
import { HelpTopic } from '@/models/miscellaneous';
import { IConstituenta, TermForm } from '@/models/rsform';
import { IGrammemeOption, SelectorGrammemes, SelectorGrammemesList } from '@/utils/selectors';

import WordFormsTable from './WordFormsTable';

interface DlgEditWordFormsProps {
  hideWindow: () => void;
  target: IConstituenta;
  onSave: (data: TermForm[]) => void;
}

function DlgEditWordForms({ hideWindow, target, onSave }: DlgEditWordFormsProps) {
  const textProcessor = useConceptText();

  const [term, setTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputGrams, setInputGrams] = useState<IGrammemeOption[]>([]);
  const [forms, setForms] = useState<IWordForm[]>([]);

  useLayoutEffect(() => {
    const initForms: IWordForm[] = [];
    target.term_forms.forEach(term =>
      initForms.push({
        text: term.text,
        grams: parseGrammemes(term.tags)
      })
    );
    setForms(initForms);
    setTerm(target.term_resolved);
    setInputText(target.term_resolved);
    setInputGrams([]);
  }, [target]);

  function handleSubmit() {
    const result: TermForm[] = [];
    forms.forEach(({ text, grams }) =>
      result.push({
        text: text,
        tags: grams.join(',')
      })
    );
    onSave(result);
  }

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams.map(item => item.value)
    };
    setForms(forms => [newForm, ...forms.filter(value => !wordFormEquals(value, newForm))]);
  }

  function handleSelectForm(form: IWordForm) {
    setInputText(form.text);
    setInputGrams(SelectorGrammemes.filter(gram => form.grams.find(test => test === gram.value)));
  }

  function handleInflect() {
    const data: IWordFormPlain = {
      text: term,
      grams: inputGrams.map(gram => gram.value).join(',')
    };
    textProcessor.inflect(data, response => setInputText(response.result));
  }

  function handleParse() {
    const data: ITextRequest = {
      text: inputText
    };
    textProcessor.parse(data, response => {
      const grams = parseGrammemes(response.result);
      setInputGrams(SelectorGrammemes.filter(gram => grams.find(test => test === gram.value)));
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
    };
    textProcessor.generateLexeme(data, response => {
      const lexeme: IWordForm[] = [];
      response.items.forEach(form => {
        const newForm: IWordForm = {
          text: form.text,
          grams: parseGrammemes(form.grams).filter(gram =>
            SelectorGrammemesList.find(item => item === (gram as Grammeme))
          )
        };
        if (newForm.grams.length === 2 && !lexeme.some(test => wordFormEquals(test, newForm))) {
          lexeme.push(newForm);
        }
      });
      setForms(lexeme);
    });
  }

  function handleResetAll() {
    setForms([]);
  }

  return (
    <Modal
      canSubmit
      header='Редактирование словоформ'
      hideWindow={hideWindow}
      submitText='Сохранить'
      onSubmit={handleSubmit}
      className='flex flex-col w-[40rem] px-6'
    >
      <Overlay position='top-[-0.2rem] left-[8rem]'>
        <HelpButton topic={HelpTopic.TERM_CONTROL} className='max-w-[38rem]' offset={3} />
      </Overlay>

      <TextArea
        disabled
        spellCheck
        label='Начальная форма'
        placeholder='Термин в начальной форме'
        rows={1}
        value={term}
      />

      <div className='mt-3 mb-2'>
        <Label text='Параметры словоформы' />
      </div>

      <div className='flex'>
        <TextArea
          placeholder='Введите текст'
          className='min-w-[20rem] min-h-[5rem]'
          rows={2}
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='flex flex-col self-center gap-1'>
          <MiniButton
            noHover
            title='Определить граммемы'
            icon={<BiRightArrow size='1.25rem' className='icon-primary' />}
            disabled={textProcessor.loading || !inputText}
            onClick={handleParse}
          />
          <MiniButton
            noHover
            title='Генерировать словоформу'
            icon={<BiLeftArrow size='1.25rem' className='icon-primary' />}
            disabled={textProcessor.loading || inputGrams.length == 0}
            onClick={handleInflect}
          />
        </div>
        <SelectGrammeme
          placeholder='Выберите граммемы'
          className='w-[15rem]'
          value={inputGrams}
          setValue={setInputGrams}
        />
      </div>

      <Overlay position='top-2 left-0'>
        <MiniButton
          noHover
          title='Внести словоформу'
          icon={<BiCheck size='1.5rem' className='icon-green' />}
          disabled={textProcessor.loading || !inputText || inputGrams.length == 0}
          onClick={handleAddForm}
        />
        <MiniButton
          noHover
          title='Генерировать стандартные словоформы'
          icon={<BiChevronsDown size='1.5rem' className='icon-primary' />}
          disabled={textProcessor.loading || !inputText}
          onClick={handleGenerateLexeme}
        />
      </Overlay>

      <div className={clsx('mt-3 mb-2', 'flex self-center items-center', 'text-sm text-center font-semibold')}>
        <span>Заданные вручную словоформы [{forms.length}]</span>
        <MiniButton
          noHover
          title='Сбросить все словоформы'
          className='py-0'
          icon={<BiX size='1.5rem' className='icon-red' />}
          disabled={textProcessor.loading || forms.length === 0}
          onClick={handleResetAll}
        />
      </div>

      <WordFormsTable forms={forms} setForms={setForms} onFormSelect={handleSelectForm} />
    </Modal>
  );
}

export default DlgEditWordForms;
