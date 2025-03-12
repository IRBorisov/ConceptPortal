'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { type IInlineSynthesisDTO } from '../../backend/types';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { PickMultiConstituenta } from '../../components/pick-multi-constituenta';

export function TabConstituents() {
  const { setValue, control } = useFormContext<IInlineSynthesisDTO>();
  const sourceID = useWatch({ control, name: 'source' });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const { schema } = useRSFormSuspense({ itemID: sourceID! });

  function handleSelectItems(newValue: number[]) {
    setValue('items', newValue, { shouldValidate: true });
    const newSubstitutions = substitutions.filter(
      sub => newValue.includes(sub.original) || newValue.includes(sub.substitution)
    );
    if (newSubstitutions.length !== substitutions.length) {
      setValue('substitutions', newSubstitutions, { shouldValidate: true });
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
          className='w-144'
        />
      )}
    />
  );
}
