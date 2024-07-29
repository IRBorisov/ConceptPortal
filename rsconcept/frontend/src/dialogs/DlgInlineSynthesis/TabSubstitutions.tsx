'use client';

import { ErrorData } from '@/components/info/InfoError';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IBinarySubstitution, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

import PickInlineSubstitutions from '../../components/select/PickInlineSubstitutions';

interface TabSubstitutionsProps {
  receiver?: IRSForm;
  source?: IRSForm;
  selected: ConstituentaID[];

  loading?: boolean;
  error?: ErrorData;

  substitutions: IBinarySubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<IBinarySubstitution[]>>;
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
  return (
    <DataLoader id='dlg-substitutions-tab' className='cc-column' isLoading={loading} error={error} hasNoData={!source}>
      <PickInlineSubstitutions
        items={substitutions}
        setItems={setSubstitutions}
        rows={10}
        prefixID={prefixes.cst_inline_synth_substitutes}
        schema1={receiver}
        schema2={source}
        filter2={cst => selected.includes(cst.id)}
      />
    </DataLoader>
  );
}

export default TabSubstitutions;
