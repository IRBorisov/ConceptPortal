'use client';

import { LibraryItemID } from '@/features/library/models/library';

import { ICstSubstitute } from '../../backend/api';
import { useRSFormSuspense } from '../../backend/useRSForm';
import PickSubstitutions from '../../components/PickSubstitutions';
import { ConstituentaID, IRSForm } from '../../models/rsform';

interface TabSubstitutionsProps {
  receiver: IRSForm;
  sourceID: LibraryItemID;
  selected: ConstituentaID[];

  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
}

function TabSubstitutions({ sourceID, receiver, selected, substitutions, setSubstitutions }: TabSubstitutionsProps) {
  const { schema: source } = useRSFormSuspense({ itemID: sourceID });
  const schemas = [...(source ? [source] : []), ...(receiver ? [receiver] : [])];

  return (
    <PickSubstitutions
      value={substitutions}
      onChange={setSubstitutions}
      rows={10}
      schemas={schemas}
      filter={cst => cst.id !== source?.id || selected.includes(cst.id)}
    />
  );
}

export default TabSubstitutions;
