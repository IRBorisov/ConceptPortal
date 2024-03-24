'use client';

import { ErrorData } from '@/components/info/InfoError';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IRSForm, ISubstitution } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

import SubstitutionsPicker from '../../components/select/SubstitutionsPicker';

interface SubstitutionsTabProps {
  receiver?: IRSForm;
  source?: IRSForm;
  selected: ConstituentaID[];

  loading?: boolean;
  error?: ErrorData;

  substitutions: ISubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ISubstitution[]>>;
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
      <SubstitutionsPicker
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
