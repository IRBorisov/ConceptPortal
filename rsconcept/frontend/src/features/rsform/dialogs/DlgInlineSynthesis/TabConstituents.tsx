'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { type IInlineSynthesisDTO } from '../../backend/types';
import { useRSFormSuspense } from '../../backend/useRSForm';
import { PickMultiConstituenta } from '../../components/PickMultiConstituenta';

export function TabConstituents() {
  const { setValue, control } = useFormContext<IInlineSynthesisDTO>();
  const sourceID = useWatch({ control, name: 'source' });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const { schema } = useRSFormSuspense({ itemID: sourceID! });

  function handleSelectItems(newValue: number[]) {
    setValue('items', newValue);
    const newSubstitutions = substitutions.filter(
      sub => newValue.includes(sub.original) || newValue.includes(sub.substitution)
    );
    if (newSubstitutions.length !== substitutions.length) {
      setValue('substitutions', newSubstitutions);
    }
  }

  return (
    <Controller
      name='items'
      control={control}
      render={({ field }) => (
        <PickMultiConstituenta
          schema={schema}
          items={schema.items}
          rows={13}
          value={field.value}
          onChange={handleSelectItems}
        />
      )}
    />
  );
}
