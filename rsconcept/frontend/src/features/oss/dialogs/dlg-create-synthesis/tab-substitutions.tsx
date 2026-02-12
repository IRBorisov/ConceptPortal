'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useRSForms } from '@/features/rsform/backend/use-rsforms';
import { PickSubstitutions } from '@/features/rsform/components/pick-substitutions';

import { TextArea } from '@/components/input';

import { type CreateSynthesisDTO } from '../../backend/types';
import { type OperationSchema } from '../../models/oss';
import { SubstitutionValidator } from '../../models/oss-api';

interface TabSubstitutionsProps {
  oss: OperationSchema;
}

export function TabSubstitutions({ oss }: TabSubstitutionsProps) {
  const { control } = useFormContext<CreateSynthesisDTO>();
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
    <div className='cc-fade-in cc-column mt-9'>
      <Controller
        name='substitutions'
        control={control}
        render={({ field }) => (
          <PickSubstitutions
            schemas={schemas}
            rows={8}
            value={field.value ?? []}
            onChange={field.onChange}
            suggestions={validator.suggestions}
          />
        )}
      />

      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        className={isCorrect ? '' : 'border-accent-red-foreground border-2'}
      />
    </div>
  );
}
