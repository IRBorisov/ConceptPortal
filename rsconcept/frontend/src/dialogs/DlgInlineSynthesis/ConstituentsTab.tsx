'use client';

import ConstituentaMultiPicker from '@/components/ConstituentaMultiPicker';
import DataLoader from '@/components/DataLoader';
import { ErrorData } from '@/components/InfoError';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

interface ConstituentsTabProps {
  schema?: IRSForm;
  loading?: boolean;
  error?: ErrorData;
  selected: ConstituentaID[];
  setSelected: React.Dispatch<ConstituentaID[]>;
}

function ConstituentsTab({ schema, error, loading, selected, setSelected }: ConstituentsTabProps) {
  return (
    <DataLoader id='dlg-constituents-tab' isLoading={loading} error={error} hasNoData={!schema}>
      <ConstituentaMultiPicker
        schema={schema}
        rows={16}
        prefixID={prefixes.cst_inline_synth_list}
        selected={selected}
        setSelected={setSelected}
      />
    </DataLoader>
  );
}

export default ConstituentsTab;
