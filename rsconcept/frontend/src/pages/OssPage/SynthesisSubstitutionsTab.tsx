'use client';

import { ErrorData } from '@/components/info/InfoError.tsx';
import DataLoader from '@/components/wrap/DataLoader.tsx';
import { IRSForm, ISubstitution } from '@/models/rsform.ts';
import { prefixes } from '@/utils/constants.ts';
import PickSubstitutions from '../../components/select/PickSubstitutions';

interface SynthesisSubstitutionsTabProps {
  receiver?: IRSForm;
  source?: IRSForm;

  error?: ErrorData;

  substitutions: ISubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ISubstitution[]>>;
}

function SynthesisSubstitutionsTab({
                                     source,
                                     receiver,
                                     error,
                                     substitutions,
                                     setSubstitutions
                                   }: SynthesisSubstitutionsTabProps) {
  return (
    <DataLoader id="dlg-substitutions-tab" className="cc-column" isLoading={false} error={error} hasNoData={!source}>
      <PickSubstitutions
        items={substitutions}
        setItems={setSubstitutions}
        rows={10}
        prefixID={prefixes.cst_inline_synth_substitutes}
        schema1={receiver}
        schema2={source}
      />
    </DataLoader>
  );
}

export default SynthesisSubstitutionsTab;
