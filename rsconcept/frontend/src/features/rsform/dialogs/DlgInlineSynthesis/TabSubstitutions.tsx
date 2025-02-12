'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useDialogsStore } from '@/stores/dialogs';

import { IInlineSynthesisDTO } from '../../backend/types';
import { useRSFormSuspense } from '../../backend/useRSForm';
import { PickSubstitutions } from '../../components/PickSubstitutions';
import { DlgInlineSynthesisProps } from './DlgInlineSynthesis';

function TabSubstitutions() {
  const { receiver } = useDialogsStore(state => state.props as DlgInlineSynthesisProps);
  const { control } = useFormContext<IInlineSynthesisDTO>();
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
          value={field.value}
          onChange={field.onChange}
          allowSelfSubstitution={selfSubstitution}
          rows={10}
          schemas={selfSubstitution ? [source] : [source, receiver]}
          filterCst={selected.length === 0 ? undefined : cst => selected.includes(cst.id)}
        />
      )}
    />
  );
}

export default TabSubstitutions;
