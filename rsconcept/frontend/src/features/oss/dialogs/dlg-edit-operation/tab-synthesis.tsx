'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useRSForms } from '@/features/rsform/backend/use-rsforms';
import { PickSubstitutions } from '@/features/rsform/components';

import { TextArea } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';

import { type IUpdateOperationDTO } from '../../backend/types';
import { SubstitutionValidator } from '../../models/oss-api';

import { type DlgEditOperationProps } from './dlg-edit-operation';

export function TabSynthesis() {
  const { manager } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { control } = useFormContext<IUpdateOperationDTO>();
  const inputs = useWatch({ control, name: 'arguments' });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const schemasIDs = inputs
    .map(id => manager.oss.operationByID.get(id)!)
    .map(operation => operation.result)
    .filter(id => id !== null);
  const schemas = useRSForms(schemasIDs);

  const validator = new SubstitutionValidator(schemas, substitutions);
  const isCorrect = validator.validate();

  return (
    <div className='cc-fade-in cc-column mt-3'>
      <Controller
        name='substitutions'
        control={control}
        render={({ field }) => (
          <PickSubstitutions
            schemas={schemas}
            rows={8}
            value={field.value}
            onChange={field.onChange}
            suggestions={validator.suggestions}
          />
        )}
      />

      <TextArea disabled value={validator.msg} rows={4} className={isCorrect ? '' : 'border-(--acc-fg-red) border-2'} />
    </div>
  );
}
