'use client';

import { useState } from 'react';

import { HelpTopic } from '@/features/help';

import { MiniButton } from '@/components/control';
import { IconAccept, IconMoveDown, IconMoveLeft, IconMoveRight, IconRemove } from '@/components/icons';
import { Label, TextArea } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { promptText } from '@/utils/labels';

import { useGenerateLexeme } from '../../backend/cctext/use-generate-lexeme';
import { useInflectText } from '../../backend/cctext/use-inflect-text';
import { useIsProcessingCctext } from '../../backend/cctext/use-is-processing-cctext';
import { useParseText } from '../../backend/cctext/use-parse-text';
import { useCstUpdate } from '../../backend/use-cst-update';
import { SelectMultiGrammeme } from '../../components/select-multi-grammeme';
import { type Grammeme, type IWordForm, supportedGrammemes } from '../../models/language';
import { parseGrammemes, wordFormEquals } from '../../models/language-api';
import { type IConstituenta } from '../../models/rsform';

import { TableWordForms } from './table-word-forms';

export interface DlgEditWordFormsProps {
  itemID: number;
  target: IConstituenta;
}

export function DlgEditWordForms() {
  const { itemID, target } = useDialogsStore(state => state.props as DlgEditWordFormsProps);
  const { cstUpdate } = useCstUpdate();

  const isProcessing = useIsProcessingCctext();
  const { inflectText } = useInflectText();
  const { parseText } = useParseText();
  const { generateLexeme } = useGenerateLexeme();

  const [inputText, setInputText] = useState(target.term_resolved);
  const [inputGrams, setInputGrams] = useState<Grammeme[]>([]);

  const [forms, setForms] = useState<IWordForm[]>(
    target.term_forms.map(term => ({
      text: term.text,
      grams: parseGrammemes(term.tags)
    }))
  );

  function handleSubmit() {
    void cstUpdate({
      itemID: itemID,
      data: {
        target: target.id,
        item_data: {
          term_forms: forms.map(({ text, grams }) => ({
            text: text,
            tags: grams.join(',')
          }))
        }
      }
    });
  }

  function handleAddForm() {
    const newForm: IWordForm = {
      text: inputText,
      grams: inputGrams
    };
    setForms(forms => [newForm, ...forms.filter(value => !wordFormEquals(value, newForm))]);
  }

  function handleSelectForm(form: IWordForm) {
    setInputText(form.text);
    setInputGrams(supportedGrammemes.filter(gram => form.grams.find(test => test === gram)));
  }

  function handleInflect() {
    void inflectText({
      text: target.term_resolved,
      grams: inputGrams.join(',')
    }).then(response => setInputText(response.result));
  }

  function handleParse() {
    void parseText({ text: inputText }).then(response => {
      const grams = parseGrammemes(response.result);
      setInputGrams(supportedGrammemes.filter(gram => grams.find(test => test === gram)));
    });
  }

  function handleGenerateLexeme() {
    if (forms.length > 0) {
      if (!window.confirm(promptText.generateWordforms)) {
        return;
      }
    }
    void generateLexeme({ text: inputText }).then(response => {
      const lexeme: IWordForm[] = [];
      response.items.forEach(form => {
        const grams = parseGrammemes(form.grams).filter(gram => supportedGrammemes.find(item => item === gram));
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
      className='flex flex-col w-160 px-6'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <TextArea
        disabled
        spellCheck
        label='Начальная форма'
        placeholder='Термин в начальной форме'
        rows={1}
        value={target.term_resolved}
      />

      <Label className='mt-3 mb-2' text='Параметры словоформы' />
      <div className='flex'>
        <TextArea
          placeholder='Введите текст'
          className='min-w-80'
          rows={3}
          value={inputText}
          onChange={event => setInputText(event.target.value)}
        />
        <div className='flex flex-col self-center gap-1'>
          <MiniButton
            title='Определить граммемы'
            noHover
            icon={<IconMoveRight size='1.25rem' className='icon-primary' />}
            onClick={handleParse}
            disabled={isProcessing || !inputText}
          />
          <MiniButton
            title='Генерировать словоформу'
            noHover
            icon={<IconMoveLeft size='1.25rem' className='icon-primary' />}
            onClick={handleInflect}
            disabled={isProcessing || inputGrams.length == 0}
          />
        </div>
        <SelectMultiGrammeme
          placeholder='Выберите граммемы'
          className='w-60 h-fit'
          value={inputGrams}
          onChange={setInputGrams}
        />
      </div>

      <div className='flex justify-between'>
        <div className='cc-icons'>
          <MiniButton
            title='Внести словоформу'
            noHover
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            onClick={handleAddForm}
            disabled={isProcessing || !inputText || inputGrams.length == 0}
          />
          <MiniButton
            title='Генерировать стандартные словоформы'
            noHover
            icon={<IconMoveDown size='1.5rem' className='icon-primary' />}
            onClick={handleGenerateLexeme}
            disabled={isProcessing || !inputText}
          />
        </div>
        <div className='mt-3 mb-2 mx-auto text-sm font-semibold'>
          <span>Заданные вручную словоформы [{forms.length}]</span>
          <MiniButton
            title='Сбросить все словоформы'
            noHover
            className='py-0 align-middle'
            icon={<IconRemove size='1.5rem' className='cc-remove' />}
            onClick={handleResetAll}
            disabled={isProcessing || forms.length === 0}
          />
        </div>
      </div>

      <TableWordForms forms={forms} setForms={setForms} onFormSelect={handleSelectForm} />
    </ModalForm>
  );
}
