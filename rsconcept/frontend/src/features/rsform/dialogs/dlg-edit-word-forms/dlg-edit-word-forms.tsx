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
import { useRSFormSuspense } from '../../backend/use-rsform';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { SelectMultiGrammeme } from '../../components/select-multi-grammeme';
import { type Grammeme, supportedGrammemes, type WordForm } from '../../models/language';
import { parseGrammemes, wordFormEquals } from '../../models/language-api';

import { TableWordForms } from './table-word-forms';

export interface DlgEditWordFormsProps {
  itemID: number;
  targetID: number;
}

export function DlgEditWordForms() {
  const { itemID, targetID } = useDialogsStore(state => state.props as DlgEditWordFormsProps);
  const { schema } = useRSFormSuspense({ itemID: itemID });
  const target = schema.cstByID.get(targetID)!;
  const { updateConstituenta: cstUpdate } = useUpdateConstituenta();

  const isProcessing = useIsProcessingCctext();
  const { inflectText } = useInflectText();
  const { parseText } = useParseText();
  const { generateLexeme } = useGenerateLexeme();

  const [inputText, setInputText] = useState(target.term_resolved);
  const [inputGrams, setInputGrams] = useState<Grammeme[]>([]);

  const [forms, setForms] = useState<WordForm[]>(
    target.term_forms.map(term => ({
      text: term.text,
      grams: parseGrammemes(term.tags)
    }))
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    const newForm: WordForm = {
      text: inputText,
      grams: inputGrams
    };
    setForms(forms => [newForm, ...forms.filter(value => !wordFormEquals(value, newForm))]);
  }

  function handleSelectForm(form: WordForm) {
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
      const lexeme: WordForm[] = [];
      for (const form of response.items) {
        const grams = parseGrammemes(form.grams).filter(gram => supportedGrammemes.find(item => item === gram));
        const newForm: WordForm = {
          text: form.text,
          grams: grams
        };
        if (grams.length === 2 && !lexeme.some(test => wordFormEquals(test, newForm))) {
          lexeme.push(newForm);
        }
      }
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
            icon={<IconMoveRight size='1.25rem' className='icon-primary' />}
            onClick={handleParse}
            disabled={isProcessing || !inputText}
          />
          <MiniButton
            title='Генерировать словоформу'
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
            icon={<IconAccept size='1.5rem' className='icon-green' />}
            onClick={handleAddForm}
            disabled={isProcessing || !inputText || inputGrams.length == 0}
          />
          <MiniButton
            title='Генерировать стандартные словоформы'
            icon={<IconMoveDown size='1.5rem' className='icon-primary' />}
            onClick={handleGenerateLexeme}
            disabled={isProcessing || !inputText}
          />
        </div>
        <div className='mt-3 mb-2 mx-auto text-sm font-semibold'>
          <span>Заданные вручную словоформы [{forms.length}]</span>
          <MiniButton
            title='Сбросить все словоформы'
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
