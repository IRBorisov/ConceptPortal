'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useRSForms } from '@/features/rsform/backend/useRSForms';
import { PickSubstitutions } from '@/features/rsform/components';

import { TextArea } from '@/components/Input';
import { useDialogsStore } from '@/stores/dialogs';
import { APP_COLORS } from '@/styling/colors';

import { type IOperationUpdateDTO } from '../../backend/types';
import { SubstitutionValidator } from '../../models/ossAPI';

import { type DlgEditOperationProps } from './DlgEditOperation';

export function TabSynthesis() {
  const { oss } = useDialogsStore(state => state.props as DlgEditOperationProps);
  const { control } = useFormContext<IOperationUpdateDTO>();
  const inputs = useWatch({ control, name: 'arguments' });
  const substitutions = useWatch({ control, name: 'substitutions' });

  const schemasIDs = inputs
    .map(id => oss.operationByID.get(id)!)
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

      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        style={{ borderColor: isCorrect ? undefined : APP_COLORS.fgRed, borderWidth: isCorrect ? undefined : '2px' }}
      />
    </div>
  );
}
