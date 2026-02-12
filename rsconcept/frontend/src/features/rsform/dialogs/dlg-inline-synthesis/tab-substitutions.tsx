'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { type InlineSynthesisDTO } from '../../backend/types';
import { useRSFormSuspense } from '../../backend/use-rsform';
import { PickSubstitutions } from '../../components/pick-substitutions';
import { type RSForm } from '../../models/rsform';

interface TabSubstitutionsProps {
  receiver: RSForm;
}

export function TabSubstitutions({ receiver }: TabSubstitutionsProps) {
  const { control } = useFormContext<InlineSynthesisDTO>();
  const sourceID = useWatch({ control, name: 'source' });
  const selected = useWatch({ control, name: 'items' });

  const { schema: source } = useRSFormSuspense({ itemID: sourceID! });
  const selfSubstitution = receiver.id === source.id;

  return (
    <Controller
      name='substitutions'
      control={control}
      render={({ field }) => (
        <PickSubstitutions
          value={field.value ?? []}
          onChange={field.onChange}
          allowSelfSubstitution={selfSubstitution}
          rows={10}
          schemas={selfSubstitution ? [source] : [source, receiver]}
          filterCst={selected.length === 0 ? undefined : cst => cst.schema !== source.id || selected.includes(cst.id)}
        />
      )}
    />
  );
}
