'use client';

import { useRSForms } from '@/features/rsform/backend/use-rsforms';
import { PickSubstitutions } from '@/features/rsform/components/pick-substitutions';

import { TextArea } from '@/components/input';
import { type OperationSchema, type Substitution } from '@/domain/library';
import { SubstitutionValidator } from '@/domain/library/oss-api';

interface TabSubstitutionsProps {
  oss: OperationSchema;
  inputs: number[];
  substitutions: Substitution[];
  onChangeSubstitutions: (newValue: Substitution[]) => void;
}

export function TabSubstitutions({ oss, inputs, substitutions, onChangeSubstitutions }: TabSubstitutionsProps) {
  const schemasIDs = inputs
    .map(id => oss.operationByID.get(id)!)
    .map(operation => operation.result)
    .filter(id => id !== null);
  const schemas = useRSForms(schemasIDs);

  const validator = new SubstitutionValidator(schemas, substitutions);
  const isCorrect = validator.validate();

  return (
    <div className='cc-fade-in cc-column mt-3'>
      <PickSubstitutions
        schemas={schemas}
        rows={8}
        value={substitutions}
        onChange={onChangeSubstitutions}
        suggestions={validator.suggestions}
      />

      <TextArea
        disabled
        value={validator.msg}
        rows={4}
        areaClassName={isCorrect ? '' : 'border-accent-red-foreground border-2'}
      />
    </div>
  );
}
