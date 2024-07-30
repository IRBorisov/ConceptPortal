'use client';

import { useCallback, useMemo } from 'react';

import { ErrorData } from '@/components/info/InfoError';
import PickSubstitutions from '@/components/select/PickSubstitutions';
import DataLoader from '@/components/wrap/DataLoader';
import { ICstSubstitute } from '@/models/oss';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
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
  const filter = useCallback(
    (cst: IConstituenta) => cst.id !== source?.id || selected.includes(cst.id),
    [selected, source]
  );

  const schemas = useMemo(() => [...(source ? [source] : []), ...(receiver ? [receiver] : [])], [source, receiver]);

  return (
    <DataLoader id='dlg-substitutions-tab' className='cc-column' isLoading={loading} error={error} hasNoData={!source}>
      <PickSubstitutions
        substitutions={substitutions}
        setSubstitutions={setSubstitutions}
        rows={10}
        prefixID={prefixes.cst_inline_synth_substitutes}
        schemas={schemas}
        filter={filter}
      />
    </DataLoader>
  );
}

export default TabSubstitutions;
