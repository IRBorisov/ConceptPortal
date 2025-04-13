'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Label, TextInput } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { PickConstituenta } from '../../components/pick-constituenta';
import { SelectMultiGrammeme } from '../../components/select-multi-grammeme';
import { SelectWordForm } from '../../components/select-word-form';
import { type IConstituenta } from '../../models/rsform';
import { matchConstituenta } from '../../models/rsform-api';
import { CstMatchMode } from '../../stores/cst-search';

import { type DlgEditReferenceProps, type IEditReferenceState } from './dlg-edit-reference';

export function TabEntityReference() {
  const { schema, initial } = useDialogsStore(state => state.props as DlgEditReferenceProps);
  const { setValue, control, register } = useFormContext<IEditReferenceState>();
  const alias = useWatch({ control, name: 'entity.entity' });

  const selectedCst = schema.cstByAlias.get(alias) ?? null;
  const term = selectedCst?.term_resolved ?? '';

  function handleSelectConstituenta(cst: IConstituenta) {
    setValue('entity.entity', cst.alias, { shouldValidate: true });
  }

  return (
    <div className='cc-fade-in cc-column'>
      <PickConstituenta
        id='dlg_reference_entity_picker'
        initialFilter={initial.text}
        value={selectedCst}
        items={schema.items}
        onChange={handleSelectConstituenta}
        describeFunc={cst => cst.term_resolved}
        matchFunc={(cst, filter) => matchConstituenta(cst, filter, CstMatchMode.TERM)}
        onBeginFilter={cst => cst.term_resolved !== ''}
        rows={7}
      />

      <div className='flex gap-3'>
        <TextInput
          id='dlg_reference_alias'
          dense
          label='Конституента'
          placeholder='Имя'
          className='w-44'
          {...register('entity.entity')}
        />
        <TextInput
          id='dlg_reference_term'
          disabled
          dense
          noBorder
          label='Термин'
          className='grow text-sm'
          value={term}
          title={term}
        />
      </div>

      <Controller
        control={control}
        name='entity.grams'
        render={({ field }) => <SelectWordForm value={field.value} onChange={field.onChange} />}
      />

      <div className='flex items-center gap-4'>
        <Label text='Словоформа' />
        <Controller
          control={control}
          name='entity.grams'
          render={({ field }) => (
            <SelectMultiGrammeme
              id='dlg_reference_grammemes'
              placeholder='Выберите граммемы'
              className='grow'
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
}
