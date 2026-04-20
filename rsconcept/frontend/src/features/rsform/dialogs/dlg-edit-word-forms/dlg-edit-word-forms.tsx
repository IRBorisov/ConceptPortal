'use client';

import { type SubmitEvent, useState } from 'react';

import { Grammeme, parseGrammemes, type WordForm } from '@/domain/cctext';
import { Case } from '@/domain/cctext/language';
import { type Constituenta, type RSForm } from '@/domain/library';

import { HelpTopic } from '@/features/help';

import { MiniButton } from '@/components/control';
import { IconMoveDown } from '@/components/icons';
import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { promptText } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { type LexemeResponse } from '../../backend/cctext/types';
import { useIsProcessingCctext } from '../../backend/cctext/use-is-processing-cctext';
import { type UpdateConstituentaDTO } from '../../backend/types';
import { RefsInput } from '../../components/refs-input/refs-input';
import { DefaultWordForms } from '../../components/select-word-form';

export interface DlgEditWordFormsProps {
  schema: RSForm;
  target: Constituenta;
  onSave: (data: UpdateConstituentaDTO) => void;
  generateLexeme?: (data: { text: string }) => Promise<RO<LexemeResponse>>;
}

const FORM_FIELDS = DefaultWordForms.slice(0, 12).map(data => ({
  key: `${data.grams[0]}_${data.grams[1]}`,
  grams: [...data.grams]
}));

const CASE_ROWS = [
  {
    singularKey: 'sing_nomn',
    pluralKey: 'plur_nomn',
    placeholder: 'Именительный: Кто? Что?'
  },
  {
    singularKey: 'sing_gent',
    pluralKey: 'plur_gent',
    placeholder: 'Родительный: Кого? Чего?'
  },
  {
    singularKey: 'sing_datv',
    pluralKey: 'plur_datv',
    placeholder: 'Дательный: Кому? Чему?'
  },
  {
    singularKey: 'sing_accs',
    pluralKey: 'plur_accs',
    placeholder: 'Винительный: Кого? Что?'
  },
  {
    singularKey: 'sing_ablt',
    pluralKey: 'plur_ablt',
    placeholder: 'Творительный: Кем? Чем?'
  },
  {
    singularKey: 'sing_loct',
    pluralKey: 'plur_loct',
    placeholder: 'Предложный: О ком? О чём?'
  }
] as const;

export function DlgEditWordForms() {
  const { schema, target, onSave, generateLexeme } = useDialogsStore(state => state.props as DlgEditWordFormsProps);

  const isProcessing = useIsProcessingCctext();

  const [nominalRaw, setNominalRaw] = useState(target.term_raw);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => prepareInitialFormValues(target));
  const nominalResolved = target.term_raw === nominalRaw ? target.term_resolved : nominalRaw;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const wordForms: WordForm[] = FORM_FIELDS.map(field => ({
      text: (formValues[field.key] ?? '').trim(),
      grams: field.grams
    })).filter(form => form.text !== '');

    onSave({
      target: target.id,
      item_data: {
        term_raw: target.term_raw === nominalRaw ? undefined : nominalRaw,
        term_forms: wordForms.map(({ text, grams }) => ({
          text: text,
          tags: grams.join(',')
        }))
      }
    });
  }

  function handleGenerateLexeme() {
    if (!generateLexeme) {
      return;
    }

    if (Object.values(formValues).some(value => value.trim() !== '')) {
      if (!window.confirm(promptText.generateWordforms)) {
        return;
      }
    }
    void generateLexeme({ text: nominalResolved }).then(response => {
      const generated: WordForm[] = response.items.map(form => ({
        text: form.text,
        grams: parseGrammemes(form.grams)
      }));
      setFormValues(prepareFormValues(generated));
    });
  }

  function handleFormChange(key: string, text: string) {
    setFormValues(prev => ({ ...prev, [key]: text }));
  }

  function handleNominalChange(newValue: string) {
    setNominalRaw(newValue);
    setFormValues({});
  }

  return (
    <ModalForm
      header='Редактирование словоформ'
      submitText='Сохранить'
      onSubmit={handleSubmit}
      className='flex flex-col w-180 px-6'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <div className='flex items-center gap-2 justify-between pt-1'>
        {generateLexeme ? (
          <MiniButton
            title='Заполнить словоформы'
            icon={<IconMoveDown size='1.5rem' className='icon-primary' />}
            onClick={handleGenerateLexeme}
            disabled={isProcessing || nominalResolved.trim() === ''}
          />
        ) : null}
        <RefsInput
          id='dlg_edit_wordforms_nominal'
          areaClassName='disabled:min-h-9'
          aria-label='Начальная форма'
          placeholder='Начальная форма'
          schema={schema}
          value={nominalRaw}
          initialValue={target.term_raw}
          resolved={nominalResolved}
          onChange={handleNominalChange}
          className='w-full'
          maxHeight='3.75rem'
        />
      </div>

      <div className='mt-2 grid grid-cols-2 gap-4 pb-2'>
        <div className='space-y-2'>
          <div className='text-center text-sm font-controls text-muted-foreground select-none'>Единственное число</div>
          {CASE_ROWS.map(row => (
            <TextInput
              key={row.singularKey}
              value={formValues[row.singularKey] ?? ''}
              onChange={event => handleFormChange(row.singularKey, event.target.value)}
              aria-label={`Единственное число: ${row.placeholder}`}
              placeholder={row.placeholder}
              dense
              noBorder={false}
              disabled={isProcessing}
            />
          ))}
        </div>
        <div className='space-y-2'>
          <div className='text-center text-sm font-controls text-muted-foreground select-none'>Множественное число</div>
          {CASE_ROWS.map(row => (
            <TextInput
              key={row.pluralKey}
              value={formValues[row.pluralKey] ?? ''}
              onChange={event => handleFormChange(row.pluralKey, event.target.value)}
              aria-label={`Множественное число: ${row.placeholder}`}
              placeholder={row.placeholder}
              dense
              noBorder={false}
              disabled={isProcessing}
            />
          ))}
        </div>
      </div>
    </ModalForm>
  );
}

function prepareInitialFormValues(target: Constituenta): Record<string, string> {
  const forms: WordForm[] = target.term_forms.map(term => ({
    text: term.text,
    grams: parseGrammemes(term.tags)
  }));
  return prepareFormValues(forms);
}

function prepareFormValues(forms: WordForm[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const form of forms) {
    const key = resolveFormKey(form.grams);
    if (!result[key]) {
      result[key] = form.text;
    }
  }
  return result;
}

function resolveFormKey(grams: readonly string[]): string {
  const plurality = grams.includes(Grammeme.plur)
    ? Grammeme.plur
    : grams.includes(Grammeme.sing)
      ? Grammeme.sing
      : null;
  const gramCase = Case.find(gram => grams.includes(gram)) ?? null;
  if (!plurality || !gramCase) {
    return '';
  }
  return `${plurality}_${gramCase}`;
}
