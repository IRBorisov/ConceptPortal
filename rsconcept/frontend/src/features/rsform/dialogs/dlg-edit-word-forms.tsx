'use client';

import { type SubmitEvent, useState } from 'react';

import { Grammeme, type WordForm } from '@/domain/cctext';
import { Case } from '@/domain/cctext/language';
import { parseGrammemes } from '@/domain/cctext/language-api';
import { type Constituenta, type RSForm } from '@/domain/library';

import { useTx } from '@/app/i18n/use-tx';
import { HelpTopic } from '@/features/help';

import { MiniButton } from '@/components/control';
import { IconMoveDown } from '@/components/icons';
import { TextInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { formatLabel, lid } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import { type LexemeResponse } from '../backend/cctext/types';
import { useIsProcessingCctext } from '../backend/cctext/use-is-processing-cctext';
import { type UpdateConstituentaDTO } from '../backend/types';
import { RefsInput } from '../components/refs-input/refs-input';
import { WORD_FORM_ROW_DEFS } from '../components/select-word-form';

export interface DlgEditWordFormsProps {
  schema: RSForm;
  target: Constituenta;
  onSave: (data: UpdateConstituentaDTO) => void;
  generateLexeme?: (data: { text: string }) => Promise<RO<LexemeResponse>>;
}

const FORM_FIELDS = WORD_FORM_ROW_DEFS.map(row => ({
  key: `${row.grams[0]}_${row.grams[1]}`,
  grams: [...row.grams]
}));

const CASE_KEYS = ['nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'] as const;

const CASE_ROW_KEYS = CASE_KEYS.map(key => ({
  key,
  singularKey: `sing_${key}`,
  pluralKey: `plur_${key}`
}));

const CASE_PLACEHOLDER_DEFAULTS: Record<(typeof CASE_KEYS)[number], string> = {
  nomn: 'Nominative: Who? What?',
  gent: 'Genitive: Of whom? Of what?',
  datv: 'Dative: To whom? To what?',
  accs: 'Accusative: Whom? What?',
  ablt: 'Instrumental: By whom? With what?',
  loct: 'Locative: About whom? About what?'
};

export function DlgEditWordForms() {
  const tx = useTx();
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
      if (!window.confirm(formatLabel(lid.prompt.generateWordforms))) {
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
      header={tx('ui.wordForms.edit.header', 'Edit word forms')}
      submitText={tx('ui.action.save', 'Save')}
      onSubmit={handleSubmit}
      className='flex flex-col w-180 px-6'
      helpTopic={HelpTopic.TERM_CONTROL}
    >
      <div className='flex items-center gap-2 justify-between pt-1'>
        {generateLexeme ? (
          <MiniButton
            title={tx('ui.wordForms.fillFromLexeme', 'Fill word forms')}
            icon={<IconMoveDown size='1.5rem' className='icon-primary' />}
            onClick={handleGenerateLexeme}
            disabled={isProcessing || nominalResolved.trim() === ''}
          />
        ) : null}
        <RefsInput
          id='dlg_edit_wordforms_nominal'
          areaClassName='disabled:min-h-9'
          aria-label={tx('ui.wordForms.nominalAria', 'Lemma form')}
          placeholder={tx('ui.wordForms.nominalPlaceholder', 'Lemma form')}
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
          <div className='text-center text-sm font-controls text-muted-foreground select-none'>
            {tx('ui.wordForms.singularHeader', 'Singular')}
          </div>
          {CASE_ROW_KEYS.map(row => {
            const hint = tx(`ui.wordForms.case.${row.key}`, CASE_PLACEHOLDER_DEFAULTS[row.key]);
            return (
              <TextInput
                key={row.singularKey}
                value={formValues[row.singularKey] ?? ''}
                onChange={event => handleFormChange(row.singularKey, event.target.value)}
                aria-label={tx('ui.wordForms.singularAria', 'Singular: {hint}', { hint })}
                placeholder={hint}
                dense
                noBorder={false}
                disabled={isProcessing}
              />
            );
          })}
        </div>
        <div className='space-y-2'>
          <div className='text-center text-sm font-controls text-muted-foreground select-none'>
            {tx('ui.wordForms.pluralHeader', 'Plural')}
          </div>
          {CASE_ROW_KEYS.map(row => {
            const hint = tx(`ui.wordForms.case.${row.key}`, CASE_PLACEHOLDER_DEFAULTS[row.key]);
            return (
              <TextInput
                key={row.pluralKey}
                value={formValues[row.pluralKey] ?? ''}
                onChange={event => handleFormChange(row.pluralKey, event.target.value)}
                aria-label={tx('ui.wordForms.pluralAria', 'Plural: {hint}', { hint })}
                placeholder={hint}
                dense
                noBorder={false}
                disabled={isProcessing}
              />
            );
          })}
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
