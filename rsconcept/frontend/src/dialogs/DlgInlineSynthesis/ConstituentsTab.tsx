'use client';

import { ErrorData } from '@/components/info/InfoError';
import ConstituentaMultiPicker from '@/components/select/ConstituentaMultiPicker';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface ConstituentsTabProps {
  schema?: IRSForm;
  loading?: boolean;
  error?: ErrorData;
  selected: ConstituentaID[];
  setSelected: React.Dispatch<React.SetStateAction<ConstituentaID[]>>;
}

function ConstituentsTab({ schema, error, loading, selected, setSelected }: ConstituentsTabProps) {
  return (
    <DataLoader id='dlg-constituents-tab' isLoading={loading} error={error} hasNoData={!schema}>
      <ConstituentaMultiPicker
        schema={schema}
        rows={14}
        prefixID={prefixes.cst_inline_synth_list}
        selected={selected}
        setSelected={setSelected}
      />
    </DataLoader>
  );
}

export default ConstituentsTab;
