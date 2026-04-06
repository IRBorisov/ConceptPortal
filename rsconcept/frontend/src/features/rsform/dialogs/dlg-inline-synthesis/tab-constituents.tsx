'use client';

import { useRSForm } from '../../backend/use-rsform';
import { PickMultiConstituenta } from '../../components/pick-multi-constituenta';
import { type Substitution } from '../../models/rsform';

interface TabConstituentsProps {
  sourceID: number;
  selectedItems: number[];
  substitutions: Substitution[];
  onChangeItems: (newValue: number[]) => void;
  onChangeSubstitutions: (newValue: Substitution[]) => void;
}

export function TabConstituents({
  sourceID,
  selectedItems,
  substitutions,
  onChangeItems,
  onChangeSubstitutions
}: TabConstituentsProps) {
  const { schema } = useRSForm({ itemID: sourceID });

  function handleSelectItems(newValue: number[]) {
    onChangeItems(newValue);
    const newSubstitutions = substitutions.filter(
      (sub: Substitution) =>
        newValue.includes(sub.original) || newValue.includes(sub.substitution)
    );
    if (newSubstitutions.length !== substitutions.length) {
      onChangeSubstitutions(newSubstitutions);
    }
  }

  return (
    <PickMultiConstituenta
      schema={schema}
      items={schema.items}
      rows={13}
      value={selectedItems}
      onChange={handleSelectItems}
      className='w-xl'
    />
  );
}
