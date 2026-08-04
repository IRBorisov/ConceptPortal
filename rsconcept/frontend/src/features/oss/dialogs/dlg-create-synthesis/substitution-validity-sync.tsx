'use client';

import { useEffect } from 'react';

import { type OperationSchema } from '@rsconcept/domain/library';
import { SubstitutionValidator } from '@rsconcept/domain/library/oss-api';
import { type Substitution } from '@rsconcept/domain/library/rsform';

import { useRSForms } from '@/features/rsform/backend/use-rsforms';

interface SubstitutionValiditySyncProps {
  oss: OperationSchema;
  inputs: number[];
  substitutions: Substitution[];
  onValidityChange: (isCorrect: boolean) => void;
}

/** Suspends while schemas load; reports substitution table validity to the parent. */
export function SubstitutionValiditySync({
  oss,
  inputs,
  substitutions,
  onValidityChange
}: SubstitutionValiditySyncProps) {
  const schemasIDs = inputs
    .map(id => oss.operationByID.get(id)!)
    .map(operation => operation.result)
    .filter(id => id !== null);
  const schemas = useRSForms(schemasIDs);
  const isCorrect = new SubstitutionValidator(schemas, substitutions).validate();

  useEffect(
    function syncSubstitutionValidity() {
      onValidityChange(isCorrect);
    },
    [isCorrect, onValidityChange]
  );

  return null;
}
