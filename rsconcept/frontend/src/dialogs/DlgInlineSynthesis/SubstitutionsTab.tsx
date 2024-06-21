'use client';

import { ErrorData } from '@/components/info/InfoError';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IRSForm, ISubstitution } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

import PickSubstitutions from '../../components/select/PickSubstitutions';
import { ISynthesisSubstitution } from '@/models/oss.ts';

interface SubstitutionsTabProps {
  receiver?: IRSForm;
  source?: IRSForm;
  selected: ConstituentaID[];

  loading?: boolean;
  error?: ErrorData;

  substitutions: ISubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ISubstitution[] | ISynthesisSubstitution[]>>;
}

function SubstitutionsTab({
  source,
  receiver,
  selected,

  error,
  loading,

  substitutions,
  setSubstitutions
}: SubstitutionsTabProps) {
  return (
    <DataLoader id='dlg-substitutions-tab' className='cc-column' isLoading={loading} error={error} hasNoData={!source}>
      <PickSubstitutions
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

export default SubstitutionsTab;
