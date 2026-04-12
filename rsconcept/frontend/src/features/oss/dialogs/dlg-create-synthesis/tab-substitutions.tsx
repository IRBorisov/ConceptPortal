'use client';

import { type ReactNode } from 'react';

import { useRSForms } from '@/features/rsform/backend/use-rsforms';
import { PickSubstitutions } from '@/features/rsform/components/pick-substitutions';

import { TextArea } from '@/components/input';
import { type OperationSchema } from '@/domain/library';
import { SubstitutionValidator } from '@/domain/library/oss-api';
import { type Substitution } from '@/domain/library/rsform';
import { type CreateFieldProps } from '@/utils/forms';

export interface DlgCreateSynthesisSubstitutionFields {
  SubstitutionsField: (props: CreateFieldProps<Substitution[]>) => ReactNode;
}

interface TabSubstitutionsProps {
  oss: OperationSchema;
  inputs: number[];
  substitutions: Substitution[];
  fields: DlgCreateSynthesisSubstitutionFields;
}

export function TabSubstitutions({ oss, inputs, substitutions, fields }: TabSubstitutionsProps) {
  const schemasIDs = inputs
    .map(id => oss.operationByID.get(id)!)
    .map(operation => operation.result)
    .filter(id => id !== null);
  const schemas = useRSForms(schemasIDs);

  const validator = new SubstitutionValidator(schemas, substitutions);
  const isCorrect = validator.validate();
  const { SubstitutionsField } = fields;

  return (
    <div className='cc-fade-in cc-column mt-9'>
      <SubstitutionsField>
        {field => (
          <PickSubstitutions
            schemas={schemas}
            rows={8}
            value={field.state.value ?? []}
            onChange={field.handleChange}
            suggestions={validator.suggestions}
          />
        )}
      </SubstitutionsField>

      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        areaClassName={isCorrect ? '' : 'border-accent-red-foreground border-2'}
      />
    </div>
  );
}
