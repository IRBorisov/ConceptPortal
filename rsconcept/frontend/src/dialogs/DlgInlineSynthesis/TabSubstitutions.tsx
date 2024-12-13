'use client';

import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import DataLoader from '@/components/wrap/DataLoader';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface TabSubstitutionsProps {
  receiver?: IRSForm;
  source?: IRSForm;
  selected: ConstituentaID[];

  loading?: boolean;
  error?: ErrorData;

  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
}

function TabSubstitutions({
  source,
  receiver,
  selected,

  error,
  loading,

  substitutions,
  setSubstitutions
}: TabSubstitutionsProps) {
  const schemas = [...(source ? [source] : []), ...(receiver ? [receiver] : [])];

  return (
    <DataLoader isLoading={loading} error={error} hasNoData={!source}>
      <PickSubstitutions
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
        rows={10}
        prefixID={prefixes.cst_inline_synth_substitutes}
        schemas={schemas}
        filter={cst => cst.id !== source?.id || selected.includes(cst.id)}
      />
    </DataLoader>
  );
}

export default TabSubstitutions;
