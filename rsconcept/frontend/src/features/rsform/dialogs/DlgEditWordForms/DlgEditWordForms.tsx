'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { MiniButton } from '@/components/Control';
import { IconAccept, IconMoveDown, IconMoveLeft, IconMoveRight, IconRemove } from '@/components/Icons';
import { Label, TextArea } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { useDialogsStore } from '@/stores/dialogs';
import { prompts } from '@/utils/labels';

import { useGenerateLexeme } from '../../backend/cctext/useGenerateLexeme';
import { useInflectText } from '../../backend/cctext/useInflectText';
import { useIsProcessingCctext } from '../../backend/cctext/useIsProcessingCctext';
import { useParseText } from '../../backend/cctext/useParseText';
import SelectMultiGrammeme from '../../components/SelectMultiGrammeme';
import { Grammeme, IGrammemeOption, IWordForm, supportedGrammemes } from '../../models/language';
import { parseGrammemes, supportedGrammeOptions, wordFormEquals } from '../../models/languageAPI';
import { IConstituenta, TermForm } from '../../models/rsform';
import TableWordForms from './TableWordForms';

export interface DlgEditWordFormsProps {
  target: IConstituenta;
  onSave: (data: TermForm[]) => void;
}

function DlgEditWordForms() {
  const { target, onSave } = useDialogsStore(state => state.props as DlgEditWordFormsProps);
  const isProcessing = useIsProcessingCctext();
  const { inflectText } = useInflectText();
  const { parseText } = useParseText();
  const { generateLexeme } = useGenerateLexeme();

  const [term, setTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputGrams, setInputGrams] = useState<IGrammemeOption[]>([]);
  const [forms, setForms] = useState<IWordForm[]>([]);

  useEffect(() => {
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
    return true;
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
    setInputGrams(supportedGrammeOptions.filter(gram => form.grams.find(test => test === gram.value)));
  }

  function handleInflect() {
    void inflectText({
      text: term,
      grams: inputGrams.map(gram => gram.value).join(',')
    }).then(response => setInputText(response.result));
  }

  function handleParse() {
    void parseText({ text: inputText }).then(response => {
      const grams = parseGrammemes(response.result);
      setInputGrams(supportedGrammeOptions.filter(gram => grams.find(test => test === gram.value)));
    });
  }

  function handleGenerateLexeme() {
    if (forms.length > 0) {
      if (!window.confirm(prompts.generateWordforms)) {
        return;
      }
    }
    void generateLexeme({ text: inputText }).then(response => {
      const lexeme: IWordForm[] = [];
      response.items.forEach(form => {
        const grams = parseGrammemes(form.grams).filter(gram =>
          supportedGrammemes.find(item => item === (gram as Grammeme))
        );
        const newForm: IWordForm = {
          text: form.text,
          grams: grams
        };
        if (grams.length === 2 && !lexeme.some(test => wordFormEquals(test, newForm))) {
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
    <ModalForm
      header='Редактирование словоформ'
      submitText='Сохранить'
      onSubmit={handleSubmit}
      className='flex flex-col w-[40rem] px-6'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
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
            icon={<IconMoveRight size='1.25rem' className='icon-primary' />}
            disabled={isProcessing || !inputText}
            onClick={handleParse}
          />
          <MiniButton
            noHover
            title='Генерировать словоформу'
            icon={<IconMoveLeft size='1.25rem' className='icon-primary' />}
            disabled={isProcessing || inputGrams.length == 0}
            onClick={handleInflect}
          />
        </div>
        <SelectMultiGrammeme
          placeholder='Выберите граммемы'
          className='min-w-[15rem] h-fit'
          value={inputGrams}
          onChange={setInputGrams}
        />
      </div>

      <div className='flex justify-between'>
        <div className='cc-icons'>
          <MiniButton
            noHover
            title='Внести словоформу'
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            disabled={isProcessing || !inputText || inputGrams.length == 0}
            onClick={handleAddForm}
          />
          <MiniButton
            noHover
            title='Генерировать стандартные словоформы'
            icon={<IconMoveDown size='1.5rem' className='icon-primary' />}
            disabled={isProcessing || !inputText}
            onClick={handleGenerateLexeme}
          />
        </div>
        <div className={clsx('mt-3 mb-2 mx-auto', 'flex items-center', 'text-sm text-center font-semibold')}>
          <div>Заданные вручную словоформы [{forms.length}]</div>
          <MiniButton
            noHover
            title='Сбросить все словоформы'
            className='py-0'
            icon={<IconRemove size='1.5rem' className='icon-red' />}
            disabled={isProcessing || forms.length === 0}
            onClick={handleResetAll}
          />
        </div>
      </div>

      <TableWordForms forms={forms} setForms={setForms} onFormSelect={handleSelectForm} />
    </ModalForm>
  );
}

export default DlgEditWordForms;
