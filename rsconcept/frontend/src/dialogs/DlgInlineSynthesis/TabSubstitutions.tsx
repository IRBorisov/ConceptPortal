'use client';

import { useRSFormSuspense } from '@/backend/rsform/useRSForm';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

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
      substitutions={substitutions}
      setSubstitutions={setSubstitutions}
      rows={10}
      prefixID={prefixes.cst_inline_synth_substitutes}
      schemas={schemas}
      filter={cst => cst.id !== source?.id || selected.includes(cst.id)}
    />
  );
}

export default TabSubstitutions;
