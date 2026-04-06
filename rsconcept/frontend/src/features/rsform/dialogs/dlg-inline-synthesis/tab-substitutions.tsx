'use client';

import { useRSForm } from '../../backend/use-rsform';
import { PickSubstitutions } from '../../components/pick-substitutions';
import { type RSForm, type Substitution } from '../../models/rsform';

interface TabSubstitutionsProps {
  receiver: RSForm;
  sourceID: number;
  selected: number[];
  substitutions: Substitution[];
  onChangeSubstitutions: (newValue: Substitution[]) => void;
}

export function TabSubstitutions({
  receiver,
  sourceID,
  selected,
  substitutions,
  onChangeSubstitutions
}: TabSubstitutionsProps) {
  const { schema: source } = useRSForm({ itemID: sourceID });
  const selfSubstitution = receiver.id === source.id;

  return (
    <PickSubstitutions
      value={substitutions}
      onChange={onChangeSubstitutions}
      allowSelfSubstitution={selfSubstitution}
      rows={10}
      schemas={selfSubstitution ? [source] : [source, receiver]}
      filterCst={selected.length === 0 ? undefined : cst => cst.schema !== source.id || selected.includes(cst.id)}
    />
  );
}
